import Cocoa
import CoreAudio
import CoreMediaIO

/// Permission-free activity signals. Nothing here reads input events, window titles or screen content:
/// only "seconds since any input", the frontmost app's bundle id, whether a camera or microphone
/// is in use by any process, and whether the screen is locked.
final class Activity {
    private(set) var lastAppSwitch = Date()
    private(set) var frontmostBundle: String?
    private(set) var locked = false
    private var micOnSince: Date?

    /// A microphone "in use" for longer than this is probably an always-on tool (dictation,
    /// noise cancelling), not a meeting, so it stops blocking breaks.
    var micAlwaysOnAfterSec: Double = 3 * 3600

    init() {
        frontmostBundle = NSWorkspace.shared.frontmostApplication?.bundleIdentifier
        let ws = NSWorkspace.shared.notificationCenter
        ws.addObserver(forName: NSWorkspace.didActivateApplicationNotification, object: nil, queue: .main) { [weak self] n in
            let app = n.userInfo?[NSWorkspace.applicationUserInfoKey] as? NSRunningApplication
            guard let self, app?.bundleIdentifier != Bundle.main.bundleIdentifier, app?.processIdentifier != getpid() else { return }
            self.frontmostBundle = app?.bundleIdentifier
            self.lastAppSwitch = Date()
        }
        let dnc = DistributedNotificationCenter.default()
        dnc.addObserver(forName: .init("com.apple.screenIsLocked"), object: nil, queue: .main) { [weak self] _ in self?.locked = true }
        dnc.addObserver(forName: .init("com.apple.screenIsUnlocked"), object: nil, queue: .main) { [weak self] _ in self?.locked = false }
        ws.addObserver(forName: NSWorkspace.screensDidSleepNotification, object: nil, queue: .main) { [weak self] _ in self?.locked = true }
        ws.addObserver(forName: NSWorkspace.screensDidWakeNotification, object: nil, queue: .main) { [weak self] _ in
            self?.locked = Activity.sessionLocked()
        }
    }

    static func idleSeconds() -> Double {
        CGEventSource.secondsSinceLastEventType(.combinedSessionState, eventType: CGEventType(rawValue: ~0)!)
    }

    static func sessionLocked() -> Bool {
        guard let d = CGSessionCopyCurrentDictionary() as? [String: Any] else { return false }
        return (d["CGSSessionScreenIsLocked"] as? Bool) ?? false
    }

    func inMeeting(now: Date = Date()) -> Bool {
        if Activity.cameraInUse() { return true }
        if Activity.micInUse() {
            let since = micOnSince ?? now
            micOnSince = since
            return now.timeIntervalSince(since) < micAlwaysOnAfterSec
        }
        micOnSince = nil
        return false
    }

    func sample(claudeWorkingSec: Double?, now: Date = Date()) -> Sample {
        Sample(now: now,
               idleSec: Activity.idleSeconds(),
               appSwitchAgoSec: now.timeIntervalSince(lastAppSwitch),
               inMeeting: inMeeting(now: now),
               locked: locked || Activity.sessionLocked(),
               claudeWorkingSec: claudeWorkingSec)
    }

    // MARK: camera and microphone ("is running somewhere", no permission needed)

    static func cameraInUse() -> Bool {
        var addr = CMIOObjectPropertyAddress(
            mSelector: CMIOObjectPropertySelector(kCMIOHardwarePropertyDevices),
            mScope: CMIOObjectPropertyScope(kCMIOObjectPropertyScopeGlobal),
            mElement: CMIOObjectPropertyElement(kCMIOObjectPropertyElementMain))
        var size: UInt32 = 0
        guard CMIOObjectGetPropertyDataSize(CMIOObjectID(kCMIOObjectSystemObject), &addr, 0, nil, &size) == 0 else { return false }
        var ids = [CMIODeviceID](repeating: 0, count: Int(size) / MemoryLayout<CMIODeviceID>.size)
        var used: UInt32 = 0
        guard CMIOObjectGetPropertyData(CMIOObjectID(kCMIOObjectSystemObject), &addr, 0, nil, size, &used, &ids) == 0 else { return false }
        return ids.contains { id in
            var a = CMIOObjectPropertyAddress(
                mSelector: CMIOObjectPropertySelector(kCMIODevicePropertyDeviceIsRunningSomewhere),
                mScope: CMIOObjectPropertyScope(kCMIOObjectPropertyScopeGlobal),
                mElement: CMIOObjectPropertyElement(kCMIOObjectPropertyElementMain))
            var v: UInt32 = 0, u: UInt32 = 0
            return CMIOObjectGetPropertyData(id, &a, 0, nil, 4, &u, &v) == 0 && v != 0
        }
    }

    static func micInUse() -> Bool {
        var addr = AudioObjectPropertyAddress(mSelector: kAudioHardwarePropertyDevices,
                                              mScope: kAudioObjectPropertyScopeGlobal,
                                              mElement: kAudioObjectPropertyElementMain)
        var size: UInt32 = 0
        guard AudioObjectGetPropertyDataSize(AudioObjectID(kAudioObjectSystemObject), &addr, 0, nil, &size) == 0 else { return false }
        var ids = [AudioDeviceID](repeating: 0, count: Int(size) / MemoryLayout<AudioDeviceID>.size)
        guard AudioObjectGetPropertyData(AudioObjectID(kAudioObjectSystemObject), &addr, 0, nil, &size, &ids) == 0 else { return false }
        return ids.contains { id in
            var streams = AudioObjectPropertyAddress(mSelector: kAudioDevicePropertyStreams,
                                                     mScope: kAudioObjectPropertyScopeInput,
                                                     mElement: kAudioObjectPropertyElementMain)
            var sz: UInt32 = 0
            guard AudioObjectGetPropertyDataSize(id, &streams, 0, nil, &sz) == 0, sz > 0 else { return false }
            var running = AudioObjectPropertyAddress(mSelector: kAudioDevicePropertyDeviceIsRunningSomewhere,
                                                     mScope: kAudioObjectPropertyScopeGlobal,
                                                     mElement: kAudioObjectPropertyElementMain)
            var v: UInt32 = 0, s: UInt32 = 4
            return AudioObjectGetPropertyData(id, &running, 0, nil, &s, &v) == 0 && v != 0
        }
    }
}
