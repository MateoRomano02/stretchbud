import Foundation

/// One line of claude-events.jsonl, written by bin/stretchbud-hook. Never contains prompt text.
struct ClaudeEvent: Codable, Equatable {
    var t: Double
    /// prompt | stop | notify | start | end
    var ev: String
    var sid: String
}

/// Tracks which Claude Code sessions are mid-turn. A running turn means the user is waiting:
/// a natural moment for a break. Stop or a Notification means Claude needs the user back.
struct ClaudeSessions {
    private var since: [String: Double] = [:]
    /// A turn with no Stop for this long is treated as a crashed session.
    var staleAfterSec: Double = 30 * 60

    mutating func apply(_ e: ClaudeEvent) {
        switch e.ev {
        case "prompt": since[e.sid] = e.t
        case "stop", "notify", "end", "start": since[e.sid] = nil
        default: break
        }
    }

    /// Seconds the oldest live turn has been running, or nil when no turn is running.
    func workingSec(now: Double) -> Double? {
        let live = since.values.filter { now - $0 < staleAfterSec }
        guard let oldest = live.min() else { return nil }
        return now - oldest
    }
}
