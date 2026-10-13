import Cocoa

/// Wires probes, scheduler, overlay and menu. Ticks every 5 s; all decisions come from Scheduler.
final class Agent: NSObject, NSApplicationDelegate {
    private let store = Store()
    private let activity = Activity()
    private lazy var claude = ClaudeFeed(url: store.claudeEventsURL)
    private var scheduler: Scheduler
    private var picker: RoutinePicker
    private let catalog: [CatalogItem]
    private let overlay: BreakOverlay
    private let headsUp = HeadsUp()
    private var statusItem: NSStatusItem!
    private var timer: DispatchSourceTimer?
    private var lastTick = Date()
    private var current: (plan: BreakPlan, items: [String])?
    private let tickSec = 5.0

    init(webDir: URL) {
        overlay = BreakOverlay(webDir: webDir)
        catalog = Agent.loadCatalog(webDir.appendingPathComponent("exercises.json"))
        let saved = store.loadState()
        scheduler = Scheduler(config: store.loadConfig(), state: saved?.scheduler ?? SchedulerState())
        scheduler.state.inBreak = false
        scheduler.state.headsUpUntil = nil
        picker = RoutinePicker(catalog: catalog, lastUsed: saved?.lastUsed ?? [:], completions: saved?.completions ?? [:])
        super.init()
    }

    static func loadCatalog(_ url: URL) -> [CatalogItem] {
        guard let d = try? Data(contentsOf: url), let c = try? JSONDecoder().decode([CatalogItem].self, from: d), !c.isEmpty else {
            FileHandle.standardError.write("stretchbud: could not read \(url.path)\n".data(using: .utf8)!)
            return []
        }
        return c
    }

    func applicationDidFinishLaunching(_ n: Notification) {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        statusItem.button?.title = "🌱"
        rebuildMenu()
        headsUp.onLater = { [weak self] in self?.later() }

        DistributedNotificationCenter.default().addObserver(forName: .init("dev.stretchbud.end"), object: nil, queue: .main) { [weak self] _ in
            self?.headsUp.hide()
            self?.overlay.close(.ended)
        }
        DistributedNotificationCenter.default().addObserver(forName: .init("dev.stretchbud.now"), object: nil, queue: .main) { [weak self] _ in
            self?.breakNow()
        }
        // `stretchbud pause|resume` wrote state.json; pick the new pause up from there.
        DistributedNotificationCenter.default().addObserver(forName: .init("dev.stretchbud.pause"), object: nil, queue: .main) { [weak self] _ in
            guard let self else { return }
            let until = self.store.loadState()?.scheduler.pausedUntil
            self.overlay.close(.ended)
            self.pause(until.map { $0 > Date() ? $0 : nil } ?? nil)
        }

        let t = DispatchSource.makeTimerSource(queue: .main)
        t.schedule(deadline: .now() + 1, repeating: tickSec, leeway: .seconds(1))
        t.setEventHandler { [weak self] in self?.tick() }
        t.resume()
        timer = t
        store.log("launch")
    }

    private func tick() {
        let now = Date()
        // Sleep or a stalled run loop must not count as sitting time.
        let dt = min(now.timeIntervalSince(lastTick), tickSec * 3)
        lastTick = now
        claude.poll()
        let s = activity.sample(claudeWorkingSec: claude.sessions.workingSec(now: now.timeIntervalSince1970), now: now)
        let d = scheduler.tick(s, dt: dt)
        switch d {
        case .none: break
        case let .headsUp(plan, inSec):
            headsUp.show(plan, inSec: inSec)
            store.log("heads_up", ["kind": plan.kind.rawValue])
        case .cancelHeadsUp:
            headsUp.hide()
        case .naturalBreak:
            store.log("natural_break")
        case let .start(plan):
            headsUp.hide()
            start(plan)
        }
        persist()
        updateTitle()
    }

    private func start(_ plan: BreakPlan) {
        let items = picker.pick(plan)
        guard !items.isEmpty else { scheduler.finish(plan); return }
        current = (plan, items)
        let total = items.reduce(0.0) { sum, id in sum + (catalog.first { $0.id == id }?.durationSec ?? 60) }
        store.log("shown", ["kind": plan.kind.rawValue, "items": items, "mandatory": plan.mandatory])
        overlay.show(items: items, plan: plan, maxSec: total + 45) { [weak self] outcome in
            self?.finished(outcome)
        }
    }

    private func finished(_ outcome: BreakOutcome) {
        guard let c = current else { return }
        current = nil
        if outcome == .later {
            scheduler.later(now: Date())
        } else {
            if outcome == .done { picker.completed(c.items) }
            scheduler.finish(c.plan)
        }
        store.log(outcome.rawValue, ["kind": c.plan.kind.rawValue, "items": c.items])
        persist()
        rebuildMenu()
    }

    private func later() {
        scheduler.later(now: Date())
        store.log("later", ["from": "heads_up"])
        persist()
    }

    @objc func breakNow() {
        guard !overlay.isShowing else { return }
        headsUp.hide()
        scheduler.state.inBreak = true
        let laterLeft = 0
        let kind: BreakKind = scheduler.state.sinceMove > scheduler.config.moveEveryMin * 30 ? .move : .micro
        start(BreakPlan(kind: kind, water: scheduler.state.sinceWater > scheduler.config.waterEveryMin * 30,
                        mandatory: false, laterLeft: laterLeft))
    }

    @objc private func pauseHour() { pause(Date().addingTimeInterval(3600)) }
    @objc private func pauseToday() { pause(Calendar.current.startOfDay(for: Date()).addingTimeInterval(86400 + 6 * 3600)) }
    @objc private func pauseOff() { pause(.distantFuture) }
    @objc private func resume() { pause(nil) }
    private func pause(_ until: Date?) {
        scheduler.pause(until: until)
        headsUp.hide()
        store.log(until == nil ? "resume" : "pause")
        persist(); rebuildMenu(); updateTitle()
    }
    @objc private func openData() { NSWorkspace.shared.open(store.dir) }
    @objc private func quit() { NSApp.terminate(nil) }

    private func persist() {
        store.save(Store.Saved(scheduler: scheduler.state, lastUsed: picker.lastUsed, completions: picker.completions))
    }

    private func minutesToNext() -> Int {
        let c = scheduler.config, st = scheduler.state
        let micro = c.microEveryMin * 60 - st.sinceMicro, move = c.moveEveryMin * 60 - st.sinceMove
        return max(0, Int((min(micro, move) / 60).rounded(.up)))
    }

    private func updateTitle() {
        if let p = scheduler.state.pausedUntil, p > Date() { statusItem.button?.title = "🌱 ⏸"; return }
        statusItem.button?.title = "🌱 \(minutesToNext())m"
    }

    private func rebuildMenu() {
        let m = NSMenu()
        let paused = (scheduler.state.pausedUntil ?? .distantPast) > Date()
        m.addItem(NSMenuItem(title: paused ? "Paused" : "Next break in ~\(minutesToNext()) active min", action: nil, keyEquivalent: ""))
        m.addItem(NSMenuItem(title: "Breaks done today: \(store.doneToday())", action: nil, keyEquivalent: ""))
        m.addItem(.separator())
        add(m, "Take a break now", #selector(breakNow))
        if paused { add(m, "Resume", #selector(resume)) } else {
            add(m, "Pause 1 hour", #selector(pauseHour))
            add(m, "Pause until tomorrow", #selector(pauseToday))
            add(m, "Pause until I resume", #selector(pauseOff))
        }
        m.addItem(.separator())
        add(m, "Open data folder", #selector(openData))
        add(m, "Quit Stretchbud", #selector(quit))
        m.delegate = self
        statusItem.menu = m
    }

    private func add(_ m: NSMenu, _ title: String, _ sel: Selector) {
        let i = NSMenuItem(title: title, action: sel, keyEquivalent: "")
        i.target = self
        m.addItem(i)
    }
}

extension Agent: NSMenuDelegate {
    func menuNeedsUpdate(_ menu: NSMenu) { rebuildMenu() }
}
