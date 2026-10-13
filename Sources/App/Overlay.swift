import Cocoa
import WebKit

/// Borderless panels can't become key by default; the break panel must, to receive Esc.
final class KeyPanel: NSPanel {
    override var canBecomeKey: Bool { true }
}

/// The overlay panel never activates on click, so without this the first click on
/// Done, Later or skip would only focus the view.
final class BudWebView: WKWebView {
    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }
}

/// Small corner pill shown before a break: peripheral, never steals focus.
final class HeadsUp {
    private var panel: NSPanel?
    private var timer: Timer?
    var onLater: () -> Void = {}

    func show(_ plan: BreakPlan, inSec: Double) {
        hide()
        guard let screen = NSScreen.main else { return }
        let size = NSSize(width: 330, height: 58)
        let f = screen.visibleFrame
        let p = NSPanel(contentRect: NSRect(x: f.maxX - size.width - 16, y: f.minY + 16, width: size.width, height: size.height),
                        styleMask: [.borderless, .nonactivatingPanel], backing: .buffered, defer: false)
        p.level = .statusBar
        p.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary, .ignoresCycle]
        p.isOpaque = false
        p.backgroundColor = .clear
        p.hasShadow = true
        p.becomesKeyOnlyIfNeeded = true

        let box = NSVisualEffectView(frame: NSRect(origin: .zero, size: size))
        box.material = .hudWindow
        box.state = .active
        box.wantsLayer = true
        box.layer?.cornerRadius = 14
        box.layer?.masksToBounds = true

        let label = NSTextField(labelWithString: "")
        label.font = .systemFont(ofSize: 13, weight: .medium)
        label.frame = NSRect(x: 16, y: 19, width: 220, height: 20)
        box.addSubview(label)

        if plan.laterLeft > 0 && !plan.mandatory {
            let b = NSButton(title: "Later", target: self, action: #selector(later))
            b.bezelStyle = .rounded
            b.frame = NSRect(x: size.width - 86, y: 13, width: 72, height: 32)
            box.addSubview(b)
        }
        p.contentView = box
        p.orderFrontRegardless()
        panel = p

        let what: String
        switch plan.kind {
        case .micro: what = "Stretch break"
        case .move: what = "Move break"
        case .walk: what = "Walk break"
        case .vo2: what = "VO2 challenge"
        }
        let end = Date().addingTimeInterval(inSec)
        let update = { label.stringValue = "🌱 \(what) in \(max(0, Int(end.timeIntervalSinceNow.rounded())))s" }
        update()
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in update() }
    }

    @objc private func later() { hide(); onLater() }

    func hide() {
        timer?.invalidate(); timer = nil
        panel?.orderOut(nil); panel = nil
    }
}

enum BreakOutcome: String { case done, later, skip, escaped, timeout, ended }

/// The break itself: every screen dimmed, Bud on the main one. Escapes, always available:
/// hold Esc for 3 s, the page's skip link after 20 s, `stretchbud end`, and a watchdog.
final class BreakOverlay: NSObject, WKScriptMessageHandler {
    private var panels: [NSPanel] = []
    private var web: WKWebView?
    private var watchdog: Timer?
    private var escTimer: Timer?
    private var escDownAt: Date?
    private var keyMonitor: Any?
    private var payload: [String: Any] = [:]
    private var onFinish: ((BreakOutcome) -> Void)?
    let webDir: URL
    var isShowing: Bool { !panels.isEmpty }

    init(webDir: URL) { self.webDir = webDir }

    func show(items: [String], plan: BreakPlan, maxSec: Double, onFinish: @escaping (BreakOutcome) -> Void) {
        close(.ended)
        self.onFinish = onFinish
        payload = ["items": items, "mandatory": plan.mandatory, "laterLeft": plan.laterLeft, "primary": true]

        let main = NSScreen.main ?? NSScreen.screens[0]
        for screen in NSScreen.screens {
            let p = KeyPanel(contentRect: screen.frame, styleMask: [.borderless, .nonactivatingPanel],
                             backing: .buffered, defer: false)
            p.level = .screenSaver
            p.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary, .ignoresCycle]
            p.isOpaque = false
            p.backgroundColor = NSColor.black.withAlphaComponent(0.55)
            p.setFrame(screen.frame, display: false)
            let content = NSView(frame: NSRect(origin: .zero, size: screen.frame.size))
            if screen == main {
                let cfg = WKWebViewConfiguration()
                cfg.websiteDataStore = .nonPersistent()
                cfg.userContentController.add(WeakHandler(self), name: "bud")
                let w = min(820, screen.frame.width - 40), h = min(700, screen.frame.height - 60)
                let wv = BudWebView(frame: NSRect(x: (screen.frame.width - w) / 2, y: (screen.frame.height - h) / 2, width: w, height: h),
                                   configuration: cfg)
                wv.setValue(false, forKey: "drawsBackground")
                let index = webDir.appendingPathComponent("index.html")
                wv.loadFileURL(index, allowingReadAccessTo: webDir)
                content.addSubview(wv)
                web = wv
            } else {
                let l = NSTextField(labelWithString: "🌱 Bud is on your main screen")
                l.font = .systemFont(ofSize: 22, weight: .semibold)
                l.textColor = .white
                l.sizeToFit()
                l.setFrameOrigin(NSPoint(x: (screen.frame.width - l.frame.width) / 2, y: screen.frame.height / 2))
                content.addSubview(l)
            }
            p.contentView = content
            p.orderFrontRegardless()
            panels.append(p)
        }
        if let first = panels.first(where: { $0.screen == main }) ?? panels.first {
            NSApp.activate(ignoringOtherApps: true)
            first.makeKey()
            // The Esc-hold escape needs both: the local key monitor only sees events then.
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                if !first.isKeyWindow { NSApp.activate(ignoringOtherApps: true); first.makeKeyAndOrderFront(nil) }
                FileHandle.standardError.write("stretchbud: overlay key=\(first.isKeyWindow) active=\(NSApp.isActive)\n".data(using: .utf8)!)
            }
        }

        keyMonitor = NSEvent.addLocalMonitorForEvents(matching: [.keyDown, .keyUp]) { [weak self] e in
            guard let self, e.keyCode == 53 else { return e }   // 53 = Esc
            if e.type == .keyDown { if self.escDownAt == nil { self.escDownAt = Date() } } else { self.escDownAt = nil }
            return nil
        }
        escTimer = Timer.scheduledTimer(withTimeInterval: 0.25, repeats: true) { [weak self] _ in
            guard let self, let d = self.escDownAt else { return }
            if Date().timeIntervalSince(d) >= 3 { self.close(.escaped) }
        }
        watchdog = Timer.scheduledTimer(withTimeInterval: maxSec, repeats: false) { [weak self] _ in self?.close(.timeout) }
    }

    func userContentController(_ c: WKUserContentController, didReceive m: WKScriptMessage) {
        guard let d = m.body as? [String: Any], let type = d["type"] as? String else { return }
        switch type {
        case "ready":
            guard let json = try? JSONSerialization.data(withJSONObject: payload),
                  let s = String(data: json, encoding: .utf8) else { return }
            web?.evaluateJavaScript("window.bud && window.bud.start(\(s))")
            snapshotIfRequested()
        case "done": close(.done)
        case "later": close(.later)
        case "skip": close(.skip)
        default: break
        }
    }

    /// STRETCHBUD_SNAPSHOT=<file.png> saves what the web view renders after a few seconds.
    /// Used to check WebGL inside WebKit and for README images, with no screen-recording permission.
    private func snapshotIfRequested() {
        guard let path = ProcessInfo.processInfo.environment["STRETCHBUD_SNAPSHOT"] else { return }
        let delay = Double(ProcessInfo.processInfo.environment["STRETCHBUD_SNAPSHOT_DELAY"] ?? "") ?? 4
        DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self] in
            self?.web?.takeSnapshot(with: nil) { image, _ in
                guard let tiff = image?.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff),
                      let png = rep.representation(using: .png, properties: [:]) else { return }
                try? png.write(to: URL(fileURLWithPath: path))
                print("snapshot=\(path)")
            }
        }
    }

    func close(_ outcome: BreakOutcome) {
        guard !panels.isEmpty else { return }
        web?.evaluateJavaScript("window.bud && window.bud.stop()")
        web?.configuration.userContentController.removeScriptMessageHandler(forName: "bud")
        web = nil
        watchdog?.invalidate(); watchdog = nil
        escTimer?.invalidate(); escTimer = nil
        escDownAt = nil
        if let m = keyMonitor { NSEvent.removeMonitor(m); keyMonitor = nil }
        panels.forEach { $0.orderOut(nil) }
        panels = []
        let cb = onFinish
        onFinish = nil
        cb?(outcome)
    }
}

/// WKUserContentController retains its handlers; this breaks the cycle.
final class WeakHandler: NSObject, WKScriptMessageHandler {
    weak var target: WKScriptMessageHandler?
    init(_ t: WKScriptMessageHandler) { target = t }
    func userContentController(_ c: WKUserContentController, didReceive m: WKScriptMessage) {
        target?.userContentController(c, didReceive: m)
    }
}
