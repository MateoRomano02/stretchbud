import Cocoa

/// Finds web/: $STRETCHBUD_WEB, then <prefix>/share/stretchbud/web next to bin/, then ./web.
func webDirectory() -> URL {
    if let env = ProcessInfo.processInfo.environment["STRETCHBUD_WEB"] { return URL(fileURLWithPath: env) }
    let exe = URL(fileURLWithPath: CommandLine.arguments[0]).resolvingSymlinksInPath().deletingLastPathComponent()
    let candidates = [exe.appendingPathComponent("../share/stretchbud/web").standardized,
                      exe.appendingPathComponent("../web").standardized,
                      URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent("web")]
    return candidates.first { FileManager.default.fileExists(atPath: $0.appendingPathComponent("index.html").path) } ?? candidates[0]
}

func post(_ name: String) {
    DistributedNotificationCenter.default().postNotificationName(.init(name), object: nil, userInfo: nil, deliverImmediately: true)
}

let args = Array(CommandLine.arguments.dropFirst())
switch args.first {
case "end":
    post("dev.stretchbud.end")
    exit(0)
case "now":
    post("dev.stretchbud.now")
    exit(0)
case "probe":
    let a = Activity()
    print("idle_sec=\(String(format: "%.1f", Activity.idleSeconds())) camera=\(Activity.cameraInUse()) mic=\(Activity.micInUse()) locked=\(Activity.sessionLocked()) meeting=\(a.inMeeting()) frontmost=\(a.frontmostBundle ?? "-")")
    exit(0)
case "demo":
    // Show one break with the given items and exit when it closes: for trying exercises out.
    let items = args.count > 1 ? Array(args.dropFirst()) : ["shoulder-rolls", "cyclic-sighing"]
    let app = NSApplication.shared
    app.setActivationPolicy(.accessory)
    let overlay = BreakOverlay(webDir: webDirectory())
    DistributedNotificationCenter.default().addObserver(forName: .init("dev.stretchbud.end"), object: nil, queue: .main) { _ in
        overlay.close(.ended)
    }
    DispatchQueue.main.async {
        overlay.show(items: items, plan: BreakPlan(kind: .micro, water: false, mandatory: false, laterLeft: 2),
                     maxSec: Double(ProcessInfo.processInfo.environment["STRETCHBUD_MAXSEC"] ?? "") ?? 240) { outcome in
            print("outcome=\(outcome.rawValue)")
            exit(0)
        }
    }
    app.run()
case nil, "run":
    let app = NSApplication.shared
    app.setActivationPolicy(.accessory)
    let agent = Agent(webDir: webDirectory())
    app.delegate = agent
    app.run()
default:
    print("usage: stretchbud [run|now|end|probe|demo <exercise-id>...]")
    exit(2)
}
