import Foundation

// Minimal test runner: XCTest is not available with plain swiftc on Command Line Tools.
var failures = 0
var count = 0
func check(_ cond: Bool, _ name: String, file: String = #file, line: Int = #line) {
    count += 1
    if !cond { failures += 1; print("FAIL \(name) (\(file):\(line))") }
}

let t0 = Date(timeIntervalSince1970: 1_760_000_000)

/// Drives the scheduler with a user typing steadily (idle 2 s) for `minutes`.
func work(_ s: inout Scheduler, from start: Date, minutes: Double, step: Double = 5,
          idle: Double = 2, appSwitchAgo: Double = 600, meeting: Bool = false,
          claude: Double? = nil) -> [Decision] {
    var out: [Decision] = []
    var t = 0.0
    while t < minutes * 60 {
        t += step
        let d = s.tick(Sample(now: start.addingTimeInterval(t), idleSec: idle, appSwitchAgoSec: appSwitchAgo,
                              inMeeting: meeting, locked: false, claudeWorkingSec: claude), dt: step)
        if d != .none { out.append(d) }
    }
    return out
}

func firstHeadsUp(_ ds: [Decision]) -> BreakPlan? {
    for d in ds { if case let .headsUp(p, _) = d { return p } }
    return nil
}
func firstStart(_ ds: [Decision]) -> BreakPlan? {
    for d in ds { if case let .start(p) = d { return p } }
    return nil
}

// A user typing nonstop gets nothing before 30 active minutes.
do {
    var s = Scheduler()
    let ds = work(&s, from: t0, minutes: 29)
    check(ds.isEmpty, "no break before 30 min")
}

// Typing nonstop: the micro-break waits for the defer window, then fires at a short pause.
do {
    var s = Scheduler()
    var ds = work(&s, from: t0, minutes: 34)          // due at 30, typing (idle 2 s): not a breakpoint
    check(firstHeadsUp(ds) == nil, "no heads-up while typing within defer window")
    ds = work(&s, from: t0.addingTimeInterval(34 * 60), minutes: 2, idle: 6)  // 5 min passed, short pause
    let p = firstHeadsUp(ds)
    check(p?.kind == .micro, "forced micro after defer window at a 5 s pause")
    check(firstStart(ds)?.kind == .micro, "break starts after heads-up")
}

// An app switch is a breakpoint: fires right away once due.
do {
    var s = Scheduler()
    _ = work(&s, from: t0, minutes: 29.9)
    let ds = work(&s, from: t0.addingTimeInterval(29.9 * 60), minutes: 1, appSwitchAgo: 10)
    check(firstHeadsUp(ds)?.kind == .micro, "app switch is a breakpoint")
}

// Waiting on Claude (turn running, user not typing) opens the break up to 10 min early.
do {
    var s = Scheduler()
    _ = work(&s, from: t0, minutes: 21)
    let ds = work(&s, from: t0.addingTimeInterval(21 * 60), minutes: 1, idle: 12, claude: 40)
    check(firstHeadsUp(ds)?.kind == .micro, "waiting on claude triggers early micro-break")
}

// A turn running in another session while the user types is not a breakpoint.
do {
    var s = Scheduler()
    var ds = work(&s, from: t0, minutes: 25, claude: 40)
    check(ds.isEmpty, "typing while claude works: no early break")
    ds = work(&s, from: t0.addingTimeInterval(25 * 60), minutes: 9, claude: 40)
    check(firstHeadsUp(ds) == nil, "typing while claude works: still deferred inside the defer window")
}

// Meetings never get interrupted, however long overdue.
do {
    var s = Scheduler()
    let ds = work(&s, from: t0, minutes: 90, appSwitchAgo: 10, meeting: true)
    check(ds.isEmpty, "no break during meeting")
}

// Heads-up is cancelled when a meeting starts.
do {
    var s = Scheduler()
    _ = work(&s, from: t0, minutes: 29.9)
    var ds = work(&s, from: t0.addingTimeInterval(29.9 * 60), minutes: 0.2, appSwitchAgo: 10)
    check(firstHeadsUp(ds) != nil, "heads-up shown")
    ds = work(&s, from: t0.addingTimeInterval(30.1 * 60), minutes: 0.1, meeting: true)
    check(ds.contains(.cancelHeadsUp), "heads-up cancelled by meeting")
}

// Stepping away 5 min counts as a break and resets the clock.
do {
    var s = Scheduler()
    _ = work(&s, from: t0, minutes: 25)
    let away = work(&s, from: t0.addingTimeInterval(25 * 60), minutes: 6, idle: 320)
    check(away.contains(.naturalBreak), "away 5+ min is a natural break")
    let ds = work(&s, from: t0.addingTimeInterval(31 * 60), minutes: 20, appSwitchAgo: 10)
    check(ds.isEmpty, "clock was reset by the natural break")
}

// Two "Later"s, then the break is mandatory.
do {
    var s = Scheduler()
    var now = t0
    _ = work(&s, from: now, minutes: 29.9)
    now = now.addingTimeInterval(29.9 * 60)
    var ds = work(&s, from: now, minutes: 1, appSwitchAgo: 10)
    check(firstHeadsUp(ds)?.laterLeft == 2, "first prompt allows 2 laters")
    s.later(now: now.addingTimeInterval(60))
    now = now.addingTimeInterval(60)
    ds = work(&s, from: now, minutes: 1.5, appSwitchAgo: 10)
    check(firstHeadsUp(ds) == nil, "snooze 1 (2 min) holds")
    ds = work(&s, from: now.addingTimeInterval(90), minutes: 1.5, idle: 6)
    check(firstHeadsUp(ds)?.laterLeft == 1, "after snooze 1: one later left")
    s.later(now: now.addingTimeInterval(180))
    now = now.addingTimeInterval(180)
    ds = work(&s, from: now, minutes: 6, idle: 6)
    let p = firstHeadsUp(ds)
    check(p?.mandatory == true && p?.laterLeft == 0, "third prompt is mandatory")
    if let p = firstStart(ds) { s.finish(p) }
    check(s.state.snoozesUsed == 0, "finishing resets snoozes")
}

// Movement break at 60 min, and it carries water at 90 min.
do {
    var s = Scheduler()
    var now = t0
    for _ in 0..<2 {   // two micro-breaks at ~30 and ~60 min: the 60 one is a move
        let ds = work(&s, from: now, minutes: 31, appSwitchAgo: 10)
        now = now.addingTimeInterval(31 * 60)
        if let p = firstStart(ds) { s.finish(p) }
    }
    check(s.state.sinceMove < 60 * 5, "move break reset the move clock by ~62 min")
    var plans: [BreakPlan] = []
    for _ in 0..<2 {
        let ds = work(&s, from: now, minutes: 31, appSwitchAgo: 10)
        now = now.addingTimeInterval(31 * 60)
        if let p = firstStart(ds) { plans.append(p); s.finish(p) }
    }
    check(plans.contains { $0.water }, "water joins a break after 90 active min")
}

// After 2 h active, the movement break is a walk; only twice a day.
do {
    var s = Scheduler(config: Config(walkAtActiveMin: [120, 300]))
    s.state.activeToday = 121 * 60
    s.state.sinceMove = 60 * 60
    s.state.day = {
        let c = Calendar.current.dateComponents([.year, .month, .day], from: t0)
        return "\(c.year!)-\(c.month!)-\(c.day!)"
    }()
    let p = s.duePlan(Sample(now: t0, idleSec: 2, appSwitchAgoSec: 10, inMeeting: false, locked: false, claudeWorkingSec: nil))
    check(p?.kind == .walk, "walk after 2 h active")
    s.finish(p!)
    check(s.state.walksToday == 1, "walk counted")
}

// Idle time does not accumulate sitting time (reading counts only while input is recent).
do {
    var s = Scheduler()
    _ = work(&s, from: t0, minutes: 60, idle: 120)
    check(s.state.sinceMicro == 0, "idle 2 min samples do not count as active")
}

// Pause holds everything.
do {
    var s = Scheduler()
    s.pause(until: t0.addingTimeInterval(3 * 3600))
    let ds = work(&s, from: t0, minutes: 120, appSwitchAgo: 10)
    check(ds.isEmpty, "paused: no breaks")
}

// State survives a JSON round trip.
do {
    var s = Scheduler()
    _ = work(&s, from: t0, minutes: 10)
    let data = try! JSONEncoder().encode(s.state)
    let back = try! JSONDecoder().decode(SchedulerState.self, from: data)
    check(back == s.state, "state round-trips through JSON")
}

// Routine picker rotates and avoids repeating the last exercise.
do {
    let cat = [
        CatalogItem(id: "chin-tuck", kind: "micro", area: "neck"),
        CatalogItem(id: "shoulder-rolls", kind: "micro", area: "shoulders"),
        CatalogItem(id: "wrist-stretch", kind: "micro", area: "wrists"),
        CatalogItem(id: "blink-reset", kind: "micro", area: "eyes"),
        CatalogItem(id: "cyclic-sighing", kind: "breath", area: "breath"),
        CatalogItem(id: "squats", kind: "move", area: "legs"),
        CatalogItem(id: "desk-push-up", kind: "move", area: "arms"),
        CatalogItem(id: "back-extension", kind: "micro", area: "back"),
        CatalogItem(id: "walk-5-min", kind: "walk", area: "walk"),
        CatalogItem(id: "drink-water", kind: "water", area: "water"),
    ]
    var picker = RoutinePicker(catalog: cat)
    let plan = BreakPlan(kind: .micro, water: false, mandatory: false, laterLeft: 2)
    let a = picker.pick(plan), b = picker.pick(plan)
    check(a.count == 2, "micro has two items")
    check(Set(a).isDisjoint(with: Set(b)), "consecutive micro-breaks do not repeat")
    let m = picker.pick(BreakPlan(kind: .move, water: true, mandatory: false, laterLeft: 2))
    check(m.contains("drink-water") && m.contains { ["squats", "desk-push-up"].contains($0) }, "move has strength + water")
    check(picker.pick(BreakPlan(kind: .walk, water: false, mandatory: false, laterLeft: 2)) == ["walk-5-min"], "walk is just the walk")
}

// Claude hook events: a turn is "working" until Stop or Notification.
do {
    var c = ClaudeSessions()
    c.apply(ClaudeEvent(t: 100, ev: "prompt", sid: "a"))
    check(c.workingSec(now: 130) == 30, "working since prompt")
    c.apply(ClaudeEvent(t: 140, ev: "notify", sid: "a"))
    check(c.workingSec(now: 150) == nil, "notification means Claude needs the user")
    c.apply(ClaudeEvent(t: 160, ev: "prompt", sid: "a"))
    c.apply(ClaudeEvent(t: 170, ev: "prompt", sid: "b"))
    c.apply(ClaudeEvent(t: 180, ev: "stop", sid: "b"))
    check(c.workingSec(now: 200) == 40, "other session still working")
    check(c.workingSec(now: 160 + 3600) == nil, "stale turn expires")
}

// VO2 challenge replaces a movement break once warm, at most vo2PerDay times.
do {
    var s = Scheduler()
    s.state.day = {
        let c = Calendar.current.dateComponents([.year, .month, .day], from: t0)
        return "\(c.year!)-\(c.month!)-\(c.day!)"
    }()
    let sample = Sample(now: t0, idleSec: 2, appSwitchAgoSec: 10, inMeeting: false, locked: false, claudeWorkingSec: nil)
    s.state.sinceMove = 61 * 60
    s.state.activeToday = 30 * 60
    check(s.duePlan(sample)?.kind == .move, "no vo2 before warm-up time")
    s.state.activeToday = 70 * 60
    for i in 0..<2 {
        s.state.sinceMove = 61 * 60
        let p = s.duePlan(sample)
        check(p?.kind == .vo2, "vo2 challenge \(i + 1)")
        s.finish(p!)
    }
    s.state.sinceMove = 61 * 60
    check(s.duePlan(sample)?.kind == .move, "vo2 capped per day")
    s.config.vo2PerDay = 0
    s.state.vo2Today = 0
    check(s.duePlan(sample)?.kind == .move, "vo2 can be turned off")
}

// Variations: harder levels unlock with completions; never two of the same family in one break.
do {
    let cat = [
        CatalogItem(id: "wall-push-up", kind: "move", area: "arms", family: "push-up", level: 1),
        CatalogItem(id: "desk-push-up", kind: "move", area: "arms", family: "push-up", level: 2),
        CatalogItem(id: "chin-tuck", kind: "micro", area: "neck"),
    ]
    var p = RoutinePicker(catalog: cat)
    let move = BreakPlan(kind: .move, water: false, mandatory: false, laterLeft: 2)
    var seen = Set<String>()
    for _ in 0..<4 { seen.formUnion(p.pick(move)) }
    check(!seen.contains("desk-push-up"), "level 2 locked at start")
    for _ in 0..<6 { p.completed(["wall-push-up"]) }
    for _ in 0..<4 { seen.formUnion(p.pick(move)) }
    check(seen.contains("desk-push-up"), "level 2 unlocked after 6 completions")
    let vo2 = p.pick(BreakPlan(kind: .vo2, water: false, mandatory: false, laterLeft: 2))
    check(!vo2.isEmpty, "vo2 falls back to a move item when no vo2 content exists")
}

// Settings written by an older version still load, keeping the user's values.
do {
    let old = #"{"microEveryMin": 25}"#.data(using: .utf8)!
    let c = decodeMerged(Config(), from: old)
    check(c?.microEveryMin == 25 && c?.vo2PerDay == 2, "old config merges with new defaults")
}

print("\(count - failures)/\(count) checks passed")
exit(failures == 0 ? 0 : 1)
