import Foundation

/// What the agent needs to know about an exercise; the full content lives in web/exercises.js.
struct CatalogItem: Codable, Equatable {
    var id: String
    /// micro | move | walk | water | breath | reset | eyes | vo2
    var kind: String
    var area: String
    /// Seconds the item stays on screen; used for the overlay watchdog.
    var durationSec: Double?
    /// Variations of one movement share a family ("squat", "push-up", "calf-raise").
    var family: String?
    /// 1 = easiest. Higher levels unlock as the family gets completed.
    var level: Int?
}

/// Builds the item list for a break, rotating through the catalog so the same exercise
/// does not come back until the others in its group have had a turn. Harder variations
/// of a family unlock after `unlockEvery` completed breaks that used that family.
struct RoutinePicker {
    var catalog: [CatalogItem]
    var lastUsed: [String: Int] = [:]
    var completions: [String: Int] = [:]
    var unlockEvery = 6
    private var counter = 0

    private static let bigAreas: Set<String> = ["neck", "shoulders", "shoulders-upper-back", "back", "lower-back-hips"]
    private static let smallKinds: Set<String> = ["breath", "reset", "eyes"]

    init(catalog: [CatalogItem], lastUsed: [String: Int] = [:], completions: [String: Int] = [:]) {
        self.catalog = catalog
        self.lastUsed = lastUsed
        self.completions = completions
        self.counter = lastUsed.values.max() ?? 0
    }

    func unlockedLevel(_ family: String) -> Int {
        1 + (completions[family] ?? 0) / unlockEvery
    }

    mutating func pick(_ plan: BreakPlan) -> [String] {
        var items: [String] = []
        let isBig = { (c: CatalogItem) in c.kind == "micro" && Self.bigAreas.contains(c.area) }
        switch plan.kind {
        case .micro:
            // One posture item (neck, shoulders, back) and one small one (wrists, eyes, breathing, reset).
            items += take(isBig)
            items += take { ($0.kind == "micro" && !Self.bigAreas.contains($0.area)) || Self.smallKinds.contains($0.kind) }
        case .move:
            items += take { $0.kind == "move" }
            items += take(isBig)
        case .walk:
            items += take { $0.kind == "walk" }
        case .vo2:
            items += take { $0.kind == "vo2" }
            if items.isEmpty { items += take { $0.kind == "move" } }
        }
        if plan.water { items += take { $0.kind == "water" } }
        return items
    }

    /// Call when a break was completed (not skipped): advances progression.
    mutating func completed(_ ids: [String]) {
        for id in ids {
            if let f = catalog.first(where: { $0.id == id })?.family { completions[f, default: 0] += 1 }
        }
    }

    private mutating func take(_ match: (CatalogItem) -> Bool) -> [String] {
        let pool = catalog.filter { c in
            guard match(c) else { return false }
            guard let f = c.family else { return true }
            return (c.level ?? 1) <= unlockedLevel(f)
        }.sorted { (lastUsed[$0.id] ?? 0) < (lastUsed[$1.id] ?? 0) }
        guard let item = pool.first else { return [] }
        counter += 1
        lastUsed[item.id] = counter
        return [item.id]
    }
}
