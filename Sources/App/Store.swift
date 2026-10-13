import Foundation

/// Everything stays in ~/Library/Application Support/Stretchbud. No network code anywhere.
final class Store {
    let dir: URL
    var claudeEventsURL: URL { dir.appendingPathComponent("claude-events.jsonl") }
    private var stateURL: URL { dir.appendingPathComponent("state.json") }
    private var configURL: URL { dir.appendingPathComponent("config.json") }
    private var eventsURL: URL { dir.appendingPathComponent("events.jsonl") }

    init() {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        dir = base.appendingPathComponent("Stretchbud", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true,
                                                 attributes: [.posixPermissions: 0o700])
    }

    struct Saved: Codable {
        var scheduler: SchedulerState
        var lastUsed: [String: Int]
        var completions: [String: Int]?
    }

    func loadConfig() -> Config {
        if let d = try? Data(contentsOf: configURL), let c = decodeMerged(Config(), from: d) { return c }
        // Write the defaults so users can find and edit them.
        let enc = JSONEncoder(); enc.outputFormatting = [.prettyPrinted, .sortedKeys]
        try? enc.encode(Config()).write(to: configURL)
        return Config()
    }

    func loadState() -> Saved? {
        guard let d = try? Data(contentsOf: stateURL),
              let raw = try? JSONSerialization.jsonObject(with: d) as? [String: Any],
              let sched = raw["scheduler"].flatMap({ try? JSONSerialization.data(withJSONObject: $0) }),
              let state = decodeMerged(SchedulerState(), from: sched) else { return nil }
        return Saved(scheduler: state,
                     lastUsed: raw["lastUsed"] as? [String: Int] ?? [:],
                     completions: raw["completions"] as? [String: Int])
    }

    func save(_ s: Saved) {
        try? JSONEncoder().encode(s).write(to: stateURL, options: .atomic)
    }

    /// Sets or clears the pause in state.json directly, for when the agent is not running.
    func writePause(until: Date?) {
        var saved = loadState() ?? Saved(scheduler: SchedulerState(), lastUsed: [:], completions: nil)
        saved.scheduler.pausedUntil = until
        saved.scheduler.headsUpUntil = nil
        save(saved)
    }

    /// Append-only log of what happened: shown, done, later, skipped, natural breaks.
    func log(_ event: String, _ extra: [String: Any] = [:]) {
        var row: [String: Any] = ["t": Int(Date().timeIntervalSince1970), "ev": event]
        extra.forEach { row[$0.key] = $0.value }
        guard var line = try? JSONSerialization.data(withJSONObject: row, options: [.sortedKeys]) else { return }
        line.append(0x0A)
        if let h = try? FileHandle(forWritingTo: eventsURL) {
            h.seekToEndOfFile(); h.write(line); try? h.close()
        } else {
            try? line.write(to: eventsURL)
        }
    }

    /// Today's tally of completed breaks, for the menu.
    func doneToday() -> Int {
        guard let text = try? String(contentsOf: eventsURL, encoding: .utf8) else { return 0 }
        let start = Calendar.current.startOfDay(for: Date()).timeIntervalSince1970
        return text.split(separator: "\n").reduce(0) { n, line in
            guard let d = try? JSONSerialization.jsonObject(with: Data(line.utf8)) as? [String: Any],
                  (d["ev"] as? String) == "done", let t = d["t"] as? Double, t >= start else { return n }
            return n + 1
        }
    }
}

/// Reads new lines appended to claude-events.jsonl since the last call.
final class ClaudeFeed {
    private let url: URL
    private var offset: UInt64 = 0
    var sessions = ClaudeSessions()

    init(url: URL) {
        self.url = url
        // Start from the end: old turns from before launch do not matter.
        if let attrs = try? FileManager.default.attributesOfItem(atPath: url.path),
           let size = attrs[.size] as? UInt64 { offset = size }
    }

    func poll() {
        guard let h = try? FileHandle(forReadingFrom: url) else { return }
        defer { try? h.close() }
        let end = h.seekToEndOfFile()
        if end < offset { offset = 0 }  // file was truncated or rotated
        h.seek(toFileOffset: offset)
        let data = h.readDataToEndOfFile()
        guard let lastNewline = data.lastIndex(of: 0x0A) else { return }
        offset += UInt64(lastNewline + 1)
        for line in data[..<lastNewline].split(separator: 0x0A) {
            if let e = try? JSONDecoder().decode(ClaudeEvent.self, from: Data(line)) { sessions.apply(e) }
        }
    }
}
