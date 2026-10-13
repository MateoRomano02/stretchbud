import Foundation

/// Decodes `data` on top of `defaults`, so a file written by an older version (missing keys)
/// keeps the user's values and picks up defaults for new settings instead of failing.
func decodeMerged<T: Codable>(_ defaults: T, from data: Data) -> T? {
    guard let base = try? JSONSerialization.jsonObject(with: JSONEncoder().encode(defaults)) as? [String: Any],
          let file = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }
    let merged = base.merging(file) { _, new in new }
    guard let d = try? JSONSerialization.data(withJSONObject: merged) else { return nil }
    return try? JSONDecoder().decode(T.self, from: d)
}
