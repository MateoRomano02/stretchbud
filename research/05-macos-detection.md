# 05 - macOS activity detection, Claude Code integration, packaging

Corrections from the adversarial verification (07, 08, 10) are applied in this file.

Tested on this Mac: macOS 14.6 (Darwin 23.6), Apple Silicon, swiftc. Probe sources are in `research/scratch/` (`probe.swift`, `lock.swift`, `panel.swift`). Legend: [V] = verified empirically here, [D] = from docs / knowledge, not run here.

## 0. Recommended design (TL;DR)

- Activity = idle seconds only (`CGEventSource.secondsSinceLastEventType`). No Accessibility, no Input Monitoring, no Screen Recording. Poll every 5 s.
- Context = frontmost app bundle id (NSWorkspace) + camera/mic "running somewhere" (CoreMediaIO/CoreAudio) + screen locked/asleep. All permissionless.
- Do NOT count keystrokes. "Active minutes" derived from idle samples is good enough and keeps the privacy story trivial ("we never see input events").
- Claude Code hooks write one-line events to a Unix socket / localhost HTTP / state file; they give the best "perfect break window" signal.
- UI: one swiftc-built accessory app (NSStatusItem + borderless NSPanel + WKWebView, three.js local page), run by a LaunchAgent. Emergency escape always on.
- Distribution: build from source (`make`), optional ad-hoc codesign; Homebrew tap that builds from source.

## 1. Idle time (no permission)

Two routes, both [V] working with `AXIsProcessTrusted()==false` and `CGPreflightListenEventAccess()==false`:

```swift
// A: Quartz (cheapest to write)
let idle = CGEventSource.secondsSinceLastEventType(
    .combinedSessionState, eventType: CGEventType(rawValue: ~0)!)  // kCGAnyInputEventType
```
Measured: 0.2257 s returned, **~40 us/call** (1000 calls averaged). Note: in Swift `.anyInputEventType` does not exist; use `CGEventType(rawValue: ~0)!`.

```swift
// B: IOKit HIDIdleTime (nanoseconds) - what `ioreg -c IOHIDSystem` shows
IOServiceGetMatchingServices(kIOMainPortDefault, IOServiceMatching("IOHIDSystem"), &it)
// IORegistryEntryCreateCFProperties -> dict["HIDIdleTime"] / 1e9
```
[V] 0.264 s, **~71 us/call**. Shell: `ioreg -c IOHIDSystem | awk '/HIDIdleTime/{print $NF/1e9; exit}'` [V] works (prints raw ns).

Cost: 5 s polling = ~0.001% CPU; negligible. Use a `DispatchSourceTimer` with `leeway: 1s`. Caveats: idle counts HID events only (not e.g. a user watching a video; synthetic events from remote-desktop tools/`caffeinate -u` reset it). A mouse jiggler defeats it (acceptable).

Does it need a permission? [V] No. Apple docs list no entitlement/TCC for `CGEventSourceSecondsSinceLastEventType`; only creating event taps needs one.

Derive "working" state: `idle < 60 s` => active sample; sum samples per hour. Session = run of samples with gaps < 5 min. Consecutive active time = time since last idle >= 5 min (natural break already taken => reset the "sit time" counter; this is the key behaviour: do not nag someone who just stepped away).

## 2. Frontmost app (no permission)

```swift
let app = NSWorkspace.shared.frontmostApplication       // localizedName, bundleIdentifier
NSWorkspace.shared.notificationCenter.addObserver(forName: NSWorkspace.didActivateApplicationNotification, object: nil, queue: .main) { n in
    let a = n.userInfo?[NSWorkspace.applicationUserInfoKey] as? NSRunningApplication
}
```
[V] returned `Brave Browser / com.brave.Browser` with no permission prompt; `runningApplications` also works (11 regular apps).

Screen Recording: needed for **window titles of other apps** (`kCGWindowName` from `CGWindowListCopyWindowInfo`) since macOS 10.15 (Catalina). App names/owner names/bounds/layer are visible without it. [V] `CGPreflightScreenCaptureAccess()==false` here; 38 windows listed, owner and bounds available, only 2 had a non-empty name (those are system/own items, not app document titles). Conclusion: log bundle id only, never titles. Privacy-friendly: store only a coarse category (e.g. meeting/IDE/browser/other) via a local bundle-id map, or hash.

Fullscreen detection (no permission): from `CGWindowListCopyWindowInfo(.optionOnScreenOnly)`, a layer-0 window of the frontmost app whose bounds equal a screen frame (or `NSApp.presentationOptions.contains(.fullScreen)` only for own app). [D] Heuristic; Keynote/Zoom/video fullscreen => defer the popup.

## 3. Keystroke / mouse counts

- Needs **Input Monitoring** (TCC `ListenEvent`) for a `CGEventTap` with `.listenOnly` (macOS 10.15+) or `IOHIDManager` input-value callbacks. API: `CGPreflightListenEventAccess()` [V false here] / `CGRequestListenEventAccess()` shows the prompt. A `.defaultTap` (can modify) needs Accessibility. Key-event content is visible to the tap, so users (rightly) distrust it; macOS shows the orange/purple privacy indicator in newer versions and the app appears in System Settings > Privacy > Input Monitoring.
- Mouse-only counting via `NSEvent.addGlobalMonitorForEvents(matching: [.mouseMoved, .leftMouseDown, .scrollWheel])`: global monitors for mouse events work without permission [D, mouse is not gated; key events are gated, delivered only with Accessibility/Input Monitoring]. Not verified here.
- Is it worth it? No for MVP. Idle time already says "present or not". Counts add only "intensity" (typing speed), which is not needed to decide on a stretch popup and it makes the privacy statement much harder. Optional later: opt-in "intensity mode" behind a clear toggle that stores only counts per minute, never key codes.

## 4. Do-not-interrupt signals

### 4.1 Camera in use (no permission) [V]
```swift
var a = CMIOObjectPropertyAddress(
  mSelector: CMIOObjectPropertySelector(kCMIODevicePropertyDeviceIsRunningSomewhere),
  mScope: CMIOObjectPropertyScope(kCMIOObjectPropertyScopeGlobal),
  mElement: CMIOObjectPropertyElement(kCMIOObjectPropertyElementMain))
var v: UInt32 = 0, used: UInt32 = 0
CMIOObjectGetPropertyData(deviceID, &a, 0, nil, 4, &used, &v)   // v != 0 => some process captures from it
```
Enumerate devices through `kCMIOHardwarePropertyDevices` on `kCMIOObjectSystemObject`. [V] ran with `AVCaptureDevice.authorizationStatus(.video)==.notDetermined (0)` and returned the 3 devices (FaceTime HD, iPhone Continuity cameras) with `running=false`. No prompt, no permission. I could not test the `true` case (camera was off); the property is the same one macOS' camera indicator logic and tools like OverSight use [D]. `AVCaptureDevice.isInUseByAnotherApplication` also exists but only tells about OTHER apps and you need AVFoundation device objects; CMIO is simpler.

### 4.2 Microphone in use (no permission) [V for API, false case only]
```swift
// for each AudioDeviceID with input streams (kAudioDevicePropertyStreams, scope Input):
var r = AudioObjectPropertyAddress(mSelector: kAudioDevicePropertyDeviceIsRunningSomewhere,
   mScope: kAudioObjectPropertyScopeGlobal, mElement: kAudioObjectPropertyElementMain)
AudioObjectGetPropertyData(id, &r, 0, nil, &size, &v)
```
[V] listed MacBook Pro Microphone, AirPods, iPhone mic; all false at probe time. Caveat: a mic can be "running" for dictation/Siri/Krisp noise-cancel or always-on apps => false positives. Mitigation: treat mic+camera together or mic + frontmost bundle in {zoom.us, Teams, Slack huddle, Meet in browser}, as "meeting". Use a property listener (`AudioObjectAddPropertyListenerBlock`) instead of polling if desired; polling at 5 s is fine.

### 4.3 Screen sharing
No clean permissionless API. Heuristic: frontmost/any running bundle id in {zoom.us, Teams, webex, Slack}+ camera/mic active; or the presence of the "screensharingd"/"ScreenCaptureKit" indicators [D, fragile]. Use meeting heuristic above.

### 4.4 Focus / Do Not Disturb
Not exposed by a public API for third parties. Options:
1. `~/Library/DoNotDisturb/DB/Assertions.json`: `data[0].storeAssertionRecords` is present/non-empty while a Focus is active [D]. [V] readable from this shell (keys: `storeInvalidationRecords`, `storeInvalidationRequestRecords`, `storeAssertionRecords`). CAVEAT: this folder is TCC-protected (Full Disk Access) on recent macOS; my probe ran under a Terminal that may already have FDA, so "works without any permission" is NOT verified. Treat as best-effort, fail open (if unreadable, assume no Focus).
2. `defaults read com.apple.controlcenter "NSStatusItem Visible FocusModes"` only says whether the menu item is visible. [V] returns 1; useless for state.
3. Shortcuts: user can create a Shortcut "Get current Focus" and run `shortcuts run` [D]. Over-engineered.
Recommendation: best-effort option 1 plus the user-facing "Pause 1h" in the menu bar.

### 4.5 Lock / sleep
```swift
let dnc = DistributedNotificationCenter.default()
dnc.addObserver(forName: .init("com.apple.screenIsLocked"),   object: nil, queue: .main) { _ in locked = true }
dnc.addObserver(forName: .init("com.apple.screenIsUnlocked"), object: nil, queue: .main) { _ in locked = false }
let ws = NSWorkspace.shared.notificationCenter
ws.addObserver(forName: NSWorkspace.screensDidSleepNotification, ...)   // + screensDidWake, willSleepNotification, didWakeNotification, sessionDidResignActiveNotification (fast user switching)
```
Polling alternative [V]: `CGSessionCopyCurrentDictionary()["CGSSessionScreenIsLocked"]` is `nil` when unlocked (and `kCGSSessionOnConsoleKey == 1`); the key is 1 when locked [D]. `CGDisplayIsAsleep(CGMainDisplayID())` [V] returned 0. I did not test the notifications live (would need locking the Mac). All permissionless.

Rule: on wake/unlock after > 5 min away, reset the "sitting" counter (a natural break).

## 5. Showing the popup

Ranking (simplicity + robustness for one dev in one day, swiftc, no Xcode):
1. **(a) Swift accessory app: NSPanel + WKWebView + local three.js** - best. One 15 MB binary, no runtime deps, full control of level/spaces/screens, JS<->Swift bridge, menu bar item. [V] The sketch below compiles with `swiftc -O panel.swift` (84 KB binary) and, run with `--demo`, created a panel at `NSWindow.Level.screenSaver` (rawValue 1000) covering the screen and exited cleanly.
2. (b) `open` a browser window: trivial, but can't be topmost, can't cover screens, focus-stealing is unreliable, user closes it; fine only as a fallback/dev mode.
3. (c) Electron/Tauri: Tauri ok but requires Rust toolchain + bundle; Electron 100+ MB. Not for a swiftc MVP.

Build: `swiftc -O -framework Cocoa -framework WebKit -o habit-buddy main.swift` (imports of Cocoa/WebKit auto-link; flags harmless). three.js: vendor `three.module.min.js` into `web/` and load via `<script type="module" src="three.module.min.js">` - file:// module scripts are blocked by CORS in WKWebView unless `allowingReadAccessTo` covers the dir; loadFileURL with the read access to the web dir [V-compiles, page load of module not tested] handles it; if modules fail, use the classic UMD build `three.min.js`.

### Level / "lock" semantics (what is legitimate)
- `.floating` (3) stays above normal windows but below fullscreen apps' space; `.screenSaver` (1000) covers menu bar and Dock; with `collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary, .ignoresCycle]` it also appears over fullscreen apps and in all Spaces.
- A normal app cannot block Cmd-Tab, Mission Control, Force Quit, Cmd-Opt-Esc, power button, or the lock screen; only kiosk mode (`NSApp.presentationOptions = [.hideDock, .hideMenuBar, .disableProcessSwitching, .disableForceQuit, .disableHideApplication]`) does, and only for a frontmost app. Do NOT use `.disableForceQuit/.disableProcessSwitching`: that is malicious-feeling, and risk of a stuck machine. Cmd-Tab will still work with the panel as a nonactivating panel; if user switches app, the panel stays on top at screenSaver level anyway (fine and honest "soft lock").
- Soft lock design: cover all screens, intercept clicks (panel is key), nothing else. Always-available escapes (all four, tested in design not here):
  1. `Esc` held 2 s / triple-Esc closes it (keyDown in the panel).
  2. A visible small "Skip (counts as snooze 10 min)" button after the first 5 s.
  3. Menu bar item "End break" (menu bar is covered at `.screenSaver` level, so also...).
  4. Hard timeout watchdog: `DispatchSourceTimer` closes every panel at N + 30 s no matter what the JS does; and `kill -USR1 <pid>` / `habit-buddy --end` CLI closes it. If the app crashes the panels die with it (they belong to the process) and KeepAlive restarts it with no panel => cannot brick the Mac.
- Multiple screens: loop `NSScreen.screens`, one panel + one WKWebView each (or one primary with the exercise + others dimmed with a plain black page - cheaper). Observe `NSApplication.didChangeScreenParametersNotification` to rebuild.
- Sound/cam: three.js page is purely local; with `WKWebViewConfiguration` set `websiteDataStore = .nonPersistent()` and no network.

### Code sketch (compiled and run in demo mode, [V])
See `scratch/panel.swift`. Core parts:

```swift
final class KeyPanel: NSPanel { override var canBecomeKey: Bool { true } }  // borderless panels can't be key by default

final class Bridge: NSObject, WKScriptMessageHandler {            // JS -> Swift
    var onMsg: ([String: Any]) -> Void = { _ in }
    func userContentController(_ c: WKUserContentController, didReceive m: WKScriptMessage) {
        if let d = m.body as? [String: Any] { onMsg(d) } }
}
// create one per screen
let p = KeyPanel(contentRect: s.frame, styleMask: [.borderless, .nonactivatingPanel], backing: .buffered, defer: false)
p.level = .screenSaver
p.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary, .ignoresCycle]
p.isOpaque = false; p.backgroundColor = .black
let cfg = WKWebViewConfiguration()
cfg.userContentController.add(bridge, name: "hb")
let wv = WKWebView(frame: s.frame, configuration: cfg)
wv.loadFileURL(htmlURL, allowingReadAccessTo: htmlURL.deletingLastPathComponent())  // local file + sibling assets
p.contentView = wv; p.orderFrontRegardless()
```
JS side: `window.webkit.messageHandlers.hb.postMessage({type:"done", reps: 10})`. Swift -> JS: `wv.evaluateJavaScript("window.hb && hb.start(\(json))")`. Menu bar: `NSStatusBar.system.statusItem(withLength: .variableLength)`, `button?.title = "HB"` (or an SF Symbol image), `NSMenu` with items "Break now", "Pause 1h" (writes `pausedUntil` to state.json / in-memory), "Quit". `NSApp.setActivationPolicy(.accessory)` hides the Dock icon (no Info.plist needed; add `LSUIElement` only if you bundle as .app). Note when invoked as a bare binary, `NSApp.activate(ignoringOtherApps:)` works; bundle ID for notifications/permissions requires an .app wrapper (see 8).

### LaunchAgent
`~/Library/LaunchAgents/com.habitbuddy.agent.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.habitbuddy.agent</string>
  <key>ProgramArguments</key><array><string>$HOME/.local/bin/habit-buddy</string></array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><dict><key>SuccessfulExit</key><false/></dict>  <!-- restart on crash, not on clean Quit -->
  <key>ProcessType</key><string>Interactive</string>
  <key>LimitLoadToSessionType</key><string>Aqua</string>              <!-- GUI session only; needed for windows -->
  <key>StandardErrorPath</key><string>$HOME/Library/Logs/habit-buddy.log</string> <!-- launchd does not expand $HOME or ~: substitute absolute paths when installing -->
</dict></plist>
```
`launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.habitbuddy.agent.plist` (modern) / `launchctl bootout gui/$(id -u)/com.habitbuddy.agent` to remove. Plain `KeepAlive true` would respawn after Quit from menu; `SuccessfulExit=false` fixes that. Not tested here (would register a persistent agent; out of scope for scratch-only).

## 6. Claude Code integration

Source: https://code.claude.com/docs/en/hooks and /statusline (fetched; summarised by a fetch tool, re-check exact field names against the page before coding).

### Events (relevant)
| Event | Fires | Use for habit-buddy |
|---|---|---|
| `SessionStart` (matcher startup/resume/clear/compact) | session begin | register session (id, cwd) |
| `UserPromptSubmit` | user sent a prompt, before processing; stdin has `prompt`, `session_id`, `cwd` | **Claude is about to work => break window opens.** Use prompt LENGTH only (never store text) |
| `PreToolUse` / `PostToolUse` | around each tool | optional heartbeat "Claude still working" (high frequency: make it async/cheap) |
| `Notification` (matcher `permission_prompt`, `idle_prompt`...) | Claude needs the user | **close/abort break softly: user is needed** |
| `Stop` | Claude finished the turn | user is needed; end the break window (do not pop up now) |
| `SubagentStop`, `StopFailure`, `SessionEnd` | misc | cleanup |

Stdin to every hook includes `session_id`, `transcript_path`, `cwd`, `hook_event_name`. Exit code 0 = ok; exit 2 = blocking error (blocks where supported - NEVER exit 2 from our hooks); other = non-blocking error. Default timeout 600 s for command/http hooks; set `timeout` low (2-3 s). `"async": true` runs without blocking Claude (output ignored) - exactly what we want: observation only.

### Exact settings.json snippet (observe-only, async, no blocking)
Option 1: command hook to a tiny script (works everywhere, works offline from the app):
```json
{
  "hooks": {
    "UserPromptSubmit": [{ "hooks": [{ "type": "command", "command": "~/.local/bin/hb-event prompt", "async": true, "timeout": 3 }] }],
    "Stop":             [{ "hooks": [{ "type": "command", "command": "~/.local/bin/hb-event stop",   "async": true, "timeout": 3 }] }],
    "Notification":     [{ "hooks": [{ "type": "command", "command": "~/.local/bin/hb-event notify", "async": true, "timeout": 3 }] }],
    "SessionStart":     [{ "matcher": "startup|resume", "hooks": [{ "type": "command", "command": "~/.local/bin/hb-event start", "async": true, "timeout": 3 }] }],
    "SessionEnd":       [{ "hooks": [{ "type": "command", "command": "~/.local/bin/hb-event end",   "async": true, "timeout": 3 }] }]
  }
}
```
`hb-event` (sh), writes one JSON line, extracting only metadata (never the prompt text):
```sh
#!/bin/sh
# usage: hb-event <kind>; reads Claude's hook JSON on stdin
D="$HOME/Library/Application Support/HabitBuddy"; mkdir -p "$D"
IN=$(cat)
SID=$(printf '%s' "$IN" | /usr/bin/python3 -c 'import sys,json;d=json.load(sys.stdin);print(d.get("session_id",""), len(d.get("prompt","")))' 2>/dev/null)
printf '{"t":%s,"src":"claude","ev":"%s","sid":"%s"}\n' "$(date +%s)" "$1" "${SID%% *}" >> "$D/claude-events.jsonl"
# optional low-latency wakeup: curl -s -m 1 -X POST localhost:47821/ev -d "$1" >/dev/null 2>&1
exit 0
```
(Prompt length = second word of `$SID`; parse with `read`.) The app watches the file with `DispatchSource.makeFileSystemObjectSource` (or just reads the tail every 5 s tick).

Option 2: HTTP hook straight to the app (no script; per docs the event JSON is POSTed, `onFailure: continue`):
```json
{ "hooks": { "UserPromptSubmit": [{ "hooks": [{ "type": "http", "url": "http://127.0.0.1:47821/claude/UserPromptSubmit", "timeout": 2 }] }],
             "Stop": [{ "hooks": [{ "type": "http", "url": "http://127.0.0.1:47821/claude/Stop", "timeout": 2 }] }] } }
```
Receiving a prompt body means the app server sees prompt TEXT: drop it immediately, store only `len`. Prefer Option 1 so the app never receives content. If the app isn't running the command hook still succeeds (writes file); HTTP depends on `onFailure`. Bind to 127.0.0.1 only; add random token header if using HTTP. Install hooks into `~/.claude/settings.json` by merging JSON (do not overwrite user's hooks): `jq` or the python above; ship `habit-buddy install-claude-hooks` and `--uninstall`.

### State machine
- `UserPromptSubmit` => `claudeWorking[sid]=true, since=t, promptLen`. If `promptLen > ~400` or no `Stop` within 30 s => long task: "break window open" (user is idle waiting). Pop the exercise when ALSO due by the sitting timer and idle < 60 s is irrelevant (they are waiting, not typing).
- `Stop` / `Notification(permission_prompt|idle_prompt)` => working=false: **close any popup gently (fade, "Claude is done - finish when ready")**; never start a break within ~10 s after `Stop`.
- A session with no `Stop` for > 30 min is stale (crash); expire it.
- Multiple sessions: window open iff any session is working and none is awaiting the user.
- Caveat: during a break window user's idle time grows, which would look like a natural break if the idle threshold >= 5 min. Count a break only if the exercise was completed, not by idle.

### Statusline / session state
- `statusLine` in settings.json: `{"statusLine":{"type":"command","command":"~/.local/bin/hb-status","refreshInterval":5}}`; script receives JSON on stdin with `session_id`, `model.display_name`, `cost.total_duration_ms`, `context_window.used_percentage`, `rate_limits.five_hour.used_percentage` (+`resets_at`), debounced 300 ms; `refreshInterval` minimum 1 s. Only one statusline is allowed per user, and users usually have their own; do not hijack it. Use it only as an optional extra: our script can print `idle: N min to next stretch`.
- `~/.claude/projects/<proj>/<session>.jsonl` transcripts and `~/.claude/history.jsonl` (exist on this Mac [V]) contain conversation CONTENT; do not read them. Hooks give everything needed.

## 7. Local storage + privacy

Directory: `~/Library/Application Support/HabitBuddy/` (mode 700).
- `activity-YYYY-MM.jsonl`: one line per minute bucket, append-only:
  `{"t":1760350800,"active":42,"idle":18,"app":"dev.ide","cat":"code","meeting":false,"locked":false}` (seconds active in that minute; coarse category not window title).
- `events.jsonl`: `{"t":..,"ev":"break_shown|break_done|break_skipped|snooze|pause","kind":"squats","dur":45}`
- `claude-events.jsonl`: from hook script (event name, sid, prompt length).
- `config.json`, `state.json` (pausedUntil, streak). Rotate monthly; `habit-buddy export` / `habit-buddy purge`.
JSONL because append is atomic enough for line < PIPE_BUF, greppable, trivially parseable by the three.js stats page.

Privacy statement draft: "Habit Buddy measures how long your Mac has been idle, which app (not window or document) is in front, whether the camera/microphone is in use, and whether the screen is locked. It never records keystrokes, screen contents, window titles, clipboard, or what you type to Claude Code (only that a prompt was sent and its length). All data stays in ~/Library/Application Support/HabitBuddy on your Mac; there is no network code and no telemetry. Delete the folder to erase everything."

## 8. Packaging / Gatekeeper

- A binary you compile yourself with `swiftc` is not quarantined (no `com.apple.quarantine` xattr when built locally), so Gatekeeper does not block it. Apple Silicon requires a signature: swiftc/ld automatically applies an **ad-hoc** signature on arm64 outputs [V: the `panel` binary ran]; fine for local use.
- A downloaded prebuilt (browser/curl-with-quarantine) unsigned binary or .app is blocked: "cannot be opened because the developer cannot be verified". Users bypass via right-click > Open (Sonoma) or `xattr -dr com.apple.quarantine /path/App.app`. Sequoia (15) tightened: right-click bypass removed, must go System Settings > Privacy & Security > "Open Anyway". `curl`/`git clone` downloads do not set quarantine (only apps like browsers do), so `git clone && make install` has zero friction.
- Notarization requires a paid Apple Developer account ($99/yr) + Developer ID signature + `notarytool`; skip for MVP; document "build from source" as the primary path and optional prebuilt zip with the xattr command.
- Homebrew: a personal tap `homebrew-habit-buddy` with a formula that has `depends_on :macos`, `url` of the source tarball and `system "make", "install", "PREFIX=#{prefix}"` (builds locally => no Gatekeeper issue; needs Xcode CLT which brew already requires). `service do run opt_bin/"habit-buddy"; keep_alive true; end` gives `brew services start` (creates the LaunchAgent) - replaces our hand-written plist. Casks require signed/notarized apps for official homebrew-cask, but own tap casks can ship unsigned with `postflight { system "xattr", "-dr", "com.apple.quarantine", ... }` (frowned upon). Prefer formula-from-source.
- TCC identity: bare binaries get permissions keyed by path/cdhash; we need none, so no TCC prompts at all (a selling point). Wrap in an `.app` only if we later want notifications (`UNUserNotificationCenter` needs a bundle id) - not required for the MVP.

## 9. What was verified empirically (this Mac)

Verified: HID idle via CGEventSource (40 us/call) and IOKit (71 us/call) with Accessibility and Input Monitoring both denied; NSWorkspace frontmost app name + bundle id without prompt; Screen Recording not granted yet window listing/owners worked and almost no titles; CoreMediaIO + CoreAudio "is running somewhere" queries return without permission or prompt (only the idle=false case observed); `CGSessionCopyCurrentDictionary` lock key absent when unlocked; swiftc-built NSPanel + WKWebView + status item + message handler compiles and creates a `.screenSaver`-level panel.
Not verified: true-case camera/mic; lock/sleep notifications firing; Focus state without Full Disk Access; LaunchAgent behaviour; hooks actually firing (docs only); Homebrew/Gatekeeper flows (docs/knowledge).
