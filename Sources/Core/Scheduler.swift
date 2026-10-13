import Foundation

/// Tunables. Defaults come from research/01 (micro-breaks every 20-30 min, walking every 30-60 min)
/// and research/03 (defer to breakpoints, short heads-up, two snoozes then mandatory).
struct Config: Codable, Equatable {
    var microEveryMin: Double = 30
    var moveEveryMin: Double = 60
    var waterEveryMin: Double = 90
    /// Active minutes of the day after which a movement break becomes a 5-minute walk.
    var walkAtActiveMin: [Double] = [120, 300]
    /// Idle at or above this counts as "the user stepped away": a natural break.
    var naturalBreakIdleSec: Double = 300
    /// Input within this many seconds means the user is at the keyboard.
    var activeIdleSec: Double = 60
    /// How long a due break waits for a breakpoint before it fires anyway.
    var maxDeferSec: Double = 300
    var headsUpSec: Double = 30
    /// One entry per allowed "Later". When exhausted, the next break is mandatory.
    var snoozeSec: [Double] = [120, 300]
    /// A Claude Code turn running at least this long is a breakpoint: the user is waiting.
    var claudeBreakpointSec: Double = 20
    /// While Claude works, a micro-break may start this many minutes early.
    var claudeEarlyMin: Double = 10
    /// Seconds without input that, together with a running turn, mean "waiting on Claude".
    var claudeIdleSec: Double = 10
    /// VO2 challenges (short vigorous bursts) per day; they replace a movement break. 0 turns them off.
    var vo2PerDay: Int = 2
    /// Active minutes before the first VO2 challenge of the day, so the body is warm.
    var vo2AfterActiveMin: Double = 60
}

/// One observation of the machine, produced every few seconds by the activity probes.
struct Sample: Equatable {
    var now: Date
    var idleSec: Double
    /// Seconds since the frontmost app last changed.
    var appSwitchAgoSec: Double
    var inMeeting: Bool
    var locked: Bool
    /// Seconds the oldest running Claude Code turn has been going, nil if none.
    var claudeWorkingSec: Double?
}

enum BreakKind: String, Codable { case micro, move, walk, vo2 }

struct BreakPlan: Equatable, Codable {
    var kind: BreakKind
    var water: Bool
    var mandatory: Bool
    var laterLeft: Int
}

enum Decision: Equatable {
    case none
    case headsUp(BreakPlan, inSec: Double)
    case start(BreakPlan)
    case cancelHeadsUp
    /// The user stepped away long enough: counted as a break without interrupting.
    case naturalBreak
}

/// Persisted counters. Plain data so it round-trips through JSON.
struct SchedulerState: Codable, Equatable {
    var sinceMicro: Double = 0
    var sinceMove: Double = 0
    var sinceWater: Double = 0
    var activeToday: Double = 0
    var walksToday: Int = 0
    var vo2Today: Int = 0
    var day: String = ""
    var snoozesUsed: Int = 0
    var snoozedUntil: Date?
    var dueSince: Date?
    var headsUpUntil: Date?
    var inBreak: Bool = false
    var awayCounted: Bool = false
    var pausedUntil: Date?
}

/// Pure break-timing logic: no AppKit, no clock, no I/O. Feed it samples, act on decisions.
struct Scheduler {
    var config: Config
    var state: SchedulerState
    var calendar = Calendar.current

    init(config: Config = Config(), state: SchedulerState = SchedulerState()) {
        self.config = config
        self.state = state
    }

    mutating func tick(_ s: Sample, dt: Double) -> Decision {
        rollDay(s.now)
        if state.inBreak { return .none }

        let away = s.locked || s.idleSec >= config.naturalBreakIdleSec
        if away {
            let wasHeadsUp = state.headsUpUntil != nil
            if !state.awayCounted {
                state.awayCounted = true
                resetAfterBreak(kind: .move, water: false)
                return wasHeadsUp ? .cancelHeadsUp : .naturalBreak
            }
            return .none
        }
        state.awayCounted = false

        if s.idleSec < config.activeIdleSec {
            state.sinceMicro += dt
            state.sinceMove += dt
            state.sinceWater += dt
            state.activeToday += dt
        }

        if let p = state.pausedUntil, p > s.now { return .none }

        guard let plan = duePlan(s) else { return .none }

        if s.inMeeting {
            if state.headsUpUntil != nil {
                state.headsUpUntil = nil
                return .cancelHeadsUp
            }
            return .none
        }

        if let until = state.headsUpUntil {
            if s.now >= until {
                state.headsUpUntil = nil
                state.inBreak = true
                return .start(plan)
            }
            return .none
        }

        if let snoozed = state.snoozedUntil, snoozed > s.now { return .none }

        let dueSince = state.dueSince ?? s.now
        state.dueSince = dueSince
        let waited = s.now.timeIntervalSince(dueSince)
        let atBreakpoint = waitingOnClaude(s)
            || s.appSwitchAgoSec < 60
            || (s.idleSec >= 20 && s.idleSec < config.naturalBreakIdleSec)
        // Past the defer window, fire at the next short pause instead of mid-keystroke.
        let forced = waited >= config.maxDeferSec && s.idleSec >= 5
        guard atBreakpoint || forced else { return .none }

        state.headsUpUntil = s.now.addingTimeInterval(config.headsUpSec)
        return .headsUp(plan, inSec: config.headsUpSec)
    }

    /// The break that is due now, or nil.
    func duePlan(_ s: Sample) -> BreakPlan? {
        let min = 60.0
        let waterDue = state.sinceWater >= config.waterEveryMin * min
        let laterLeft = max(0, config.snoozeSec.count - state.snoozesUsed)
        let mandatory = laterLeft == 0
        if state.sinceMove >= config.moveEveryMin * min {
            let walkDue = state.walksToday < config.walkAtActiveMin.count
                && state.activeToday >= config.walkAtActiveMin[state.walksToday] * min
            let vo2Due = !walkDue && state.vo2Today < config.vo2PerDay
                && state.activeToday >= config.vo2AfterActiveMin * min
            let kind: BreakKind = walkDue ? .walk : (vo2Due ? .vo2 : .move)
            return BreakPlan(kind: kind, water: waterDue, mandatory: mandatory, laterLeft: laterLeft)
        }
        var microThreshold = config.microEveryMin * min
        if waitingOnClaude(s) {
            microThreshold -= config.claudeEarlyMin * min
        }
        if state.sinceMicro >= microThreshold {
            return BreakPlan(kind: .micro, water: waterDue, mandatory: mandatory, laterLeft: laterLeft)
        }
        return nil
    }

    /// The user is waiting on a Claude Code turn: one is running and they stopped typing.
    /// A running turn alone is not enough, since with several sessions open some turn is
    /// almost always running while the user types in another.
    func waitingOnClaude(_ s: Sample) -> Bool {
        (s.claudeWorkingSec ?? 0) >= config.claudeBreakpointSec && s.idleSec >= config.claudeIdleSec
    }

    /// User pressed "Later" on the heads-up or the break itself.
    mutating func later(now: Date) {
        let i = min(state.snoozesUsed, config.snoozeSec.count - 1)
        state.snoozedUntil = now.addingTimeInterval(config.snoozeSec[max(0, i)])
        state.snoozesUsed += 1
        state.headsUpUntil = nil
        state.inBreak = false
        // After a snooze the break no longer waits for a breakpoint.
        state.dueSince = now.addingTimeInterval(-config.maxDeferSec)
    }

    /// Break finished: done, skipped, escaped or timed out. All reset the timers so a skip
    /// does not turn into immediate nagging; the log keeps the honest outcome.
    mutating func finish(_ plan: BreakPlan) {
        state.inBreak = false
        resetAfterBreak(kind: plan.kind, water: plan.water)
        if plan.kind == .walk { state.walksToday += 1 }
        if plan.kind == .vo2 { state.vo2Today += 1 }
    }

    mutating func pause(until: Date?) { state.pausedUntil = until }

    private mutating func resetAfterBreak(kind: BreakKind, water: Bool) {
        state.sinceMicro = 0
        if kind != .micro { state.sinceMove = 0 }
        if water { state.sinceWater = 0 }
        state.snoozesUsed = 0
        state.snoozedUntil = nil
        state.dueSince = nil
        state.headsUpUntil = nil
    }

    private mutating func rollDay(_ now: Date) {
        let c = calendar.dateComponents([.year, .month, .day], from: now)
        let key = "\(c.year!)-\(c.month!)-\(c.day!)"
        if key != state.day {
            state.day = key
            state.activeToday = 0
            state.walksToday = 0
            state.vo2Today = 0
        }
    }
}
