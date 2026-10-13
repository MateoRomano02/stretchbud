# 04 - Competitive landscape and latest news (as of 2026-10-13)

Corrections from the adversarial verification (07, 08, 10) are applied in this file.

Legend: [M] = measured/primary (GitHub API, README, store page fetched today). [S] = secondary (news/blog/aggregator). [MKT] = vendor marketing claim, not verified. Items I could not verify are labeled UNVERIFIED.
Limits: Reddit and X were not directly searchable with my tools; no Reddit/X quotes are included. Complaints below come from GitHub issues and one dev.to post.

## 1. Classic break reminders

| App | Platform / price / license | Activity detection | Interruption | Content | Evidence |
|---|---|---|---|---|---|
| Stretchly | Win/Mac/Linux, free, BSD-2, Electron. 6,596 stars, 124 open issues, pushed 2026-10-09 [M] https://api.github.com/repos/hovancik/stretchly | Timer + idle pause; app exclusions; no camera/mic call detection | Fullscreen overlay or notification, strict mode, postpone/skip | Generic text ideas, locale JSON | Issues below |
| BreakTimer | Win/Mac/Linux, free, GPL-3, Electron. 1,590 stars, 58 open issues, pushed 2026-10-12 [M] https://api.github.com/repos/tom-james-watson/breaktimer-app | Idle/working hours | Notification/overlay | Text | API |
| Workrave | Win/Linux (Mac port weak), free, GPL-3. 1,834 stars, 220 open issues, pushed 2026-10-12 [M] https://api.github.com/repos/rcaelers/workrave | Keyboard/mouse activity counting (natural breaks reset timers) | Escalating window (grey, orange, red), can remove skip/postpone [S] https://workrave.org/docs/breaks/reminder/ | Built-in exercise list, illustrated stills (from docs knowledge, not re-verified today) | |
| Safe Eyes | Linux, free, GPL-3. 1,768 stars, 73 open issues, pushed 2026-09-29 [M] https://api.github.com/repos/slgobinath/SafeEyes | Idle | Fullscreen, strict | Text + eye exercises | API |
| Sane Break | Cross-platform, free OSS [S] https://alternativeto.net/software/sane-break | Fullscreen starts when typing stops | Two-phase: gentle flash, then fullscreen; no skip button | Text | Author's rationale: https://dev.to/allanchain/no-break-reminder-works-for-me-1n8o (2024-08-19) |
| Time Out (Dejal) | Mac, free + supporter IAP GBP 4.99/9.99/19.99 [S] https://apps.apple.com/gb/app/time-out-break-reminders/id402592703?mt=12 | Timer, idle | Fullscreen themes, postpone/skip | HTML themes, text | AlternativeTo 3.7/5 on 7 reviews |
| LookAway | Mac, paid. Aggregator says "from $19" with unclear billing (UNVERIFIED; lookaway.com redirected, not fetched) [S] https://toolradar.com/tools/lookaway-2 | Detects meetings, fullscreen video/games, screen share/recording; app exclusions for meeting detection [MKT/S] | Gentle overlay | 20-20-20 eye focus; some stretch content | Public bug board has "incorrectly detects meeting while using dictation apps" https://lookaway.userjot.com/board/p/incorrectly-detects-meeting-while-using-dictation-apps [M] |
| Pandan | Cross-platform, free-ish | Shows active-use time, user decides | Passive | None | https://alternativeto.net/software/pandan/ [S] |
| Wakeout! | iOS/iPad/Mac/Watch/Vision, free + subs $6.49-$129.99, 4.1/5 (862 ratings) [M] https://apps.apple.com/ca/app/wakeout-desk-stretch-energy/id1242116567 | Smart reminders; Walk Break counts 100 steps live | Notification | 3,000+ video moves, AR games | Reviewers cite paywall |
| ByteBreak | iOS/Mac/Watch, free + $1.99/wk, $5.99/mo, $29.99/yr [M] https://apps.apple.com/app/id6758991994 | Timers | Notification | Guided stretches, hydration | Too few ratings |
| Apple Watch Stand | Hardware, bundled | Motion: needs ~97.5 steps or 100 kJ in the hour to count (JMIR Form Res, Jun 2024) [M] https://doaj.org/article/c9ca2b528bd94e759dfcc07c8f8b0401 | Haptic at :50 | None | Apple forums: reminders fire after you already stood; credit while seated [S] https://discussions.apple.com/thread/7044207 |
Not researched in depth (no data fetched): Stand Up!, Move!, Rest, Healthy Break, StretchMinder, Big Stretch Reminder, EyeLeo, Smart Break, Breaktime, Viva Insights breaks.

### Complaints with evidence (Stretchly issues, all [M])
- Calls/screen share: #969 "Pause while camera is in use", open since 2021-06-03, 31 comments. Quote: "if I'm sharing something on my screen, it can be very disruptive, especially if strict mode is enabled". Maintainer: camera detection across apps is not feasible in JS; users suggest mic detection and external scripts via CLI. https://github.com/hovancik/stretchly/issues/969
- Fullscreen apps disable Stretchly: #355, open since 2019-01-11, 32 comments. https://github.com/hovancik/stretchly/issues/355
- Skip abuse: #1838 "Add Max Skips per Day" (2026-08-07), #1841 "Delay Skip button independently of Postpone" (2026-08-10), #1492 escalating postponements (2024-10). The skip habit is a live pain point.
- Boring/irrelevant content: #1596 (2025-04-17) user wants only physical exercises, not "smile at being alive"; owner defers categories to "version 2". https://github.com/hovancik/stretchly/issues/1596
- dev.to 2024-08-19: "I click 'skip' or 'postpone' without a second thought. Before I know it, hours have passed." https://dev.to/allanchain/no-break-reminder-works-for-me-1n8o
- Forced breaks create frustration and tool abandonment (same post).

## 2. Agent-aware break/exercise tools (direct competition, much bigger than expected)

All verified via GitHub API/README today unless noted. Stars are tiny except workout-gate.

| Project | What | Created / last push | Stars | License |
|---|---|---|---|---|
| BotchetDig/workout-gate | Claude Code + Codex `UserPromptSubmit` hook blocks prompt until push-ups/squats counted by webcam (MediaPipe Pose); rep "debt" persisted. https://github.com/BotchetDig/workout-gate | 2026-06-12 / 2026-06-25 | 221 | MIT |
| surya-krishna/fitgate | Gates agent approval prompts behind micro-workouts via hooks + local daemon; 20 min cooldown, 12/day cap; fails open; 15+ agents (Claude Code, Cursor, Copilot CLI, Codex, Gemini, Windsurf). https://github.com/surya-krishna/fitgate | 2026-09-09 / 2026-09-12 | 5 | AGPL-3.0 |
| Eliasjunit/vibestretch | POSIX shell; hooks UserPromptSubmit/PostToolUse/Stop; nudges only after turn >=2 min, accumulated agent time >=5 min, cooldown 15 min; 12 text exercises. https://github.com/Eliasjunit/vibestretch | created 2026-07-31 / last pushed 2026-10-06 (added to AlternativeTo 2026-08-13) | 2 | MIT |
| VladGirboan/claude-breaks | Claude Code plugin, game-style cooldown band above prompt (water/eyes/stretch/walk), pop-up between turns, detects stepping away. https://github.com/VladGirboan/claude-breaks | 2026-10-09 / 2026-10-12 | 0 | MIT |
| twillot-app/desk-break | macOS launchd + idle check; 259 moves with animated GIF cards (third-party dataset), music, streaks; Claude Code plugin, AGENTS.md/.cursor rules. https://github.com/twillot-app/desk-break | pushed 2026-07-15 | 1 | MIT |
| swiftwind16/zenbreak | macOS; foreground app + keystroke intensity every 5 s, suppresses breaks during Zoom/Teams/FaceTime, 16 exercises with YouTube demos, local LLM messages, XP. https://github.com/swiftwind16/zenbreak | pushed 2026-03-21 | 0 | MIT |
| flow-club/vibereps | Exercise while Claude works; MediaPipe pose detection, 13 exercises. https://github.com/flow-club/vibereps | 2025-11-21 / 2026-03-05 | 3 | MIT |
| Kepei-Lei102/breakwatch | Two Claude Code hooks, time-of-day thresholds, alarm. | 2026-08-13 | 1 | MIT |
| majidmanzarpour/vibe-check | Health nudges in Claude Code flow | 2026-02-08 | 8 | MIT |
| aelena/break-time | Claude Code skill, ambient break reminders | 2026-04-25 | 0 | none |
| jakebromberg/claude-code-focus-hooks | Focus/break reminders plugin | 2026-03-02 | 0 | MIT |
| goggins-mode, stepback | Webcam rep gate; Apple workout builder | 2026-06/07 | 1 each | MIT |
| Git-Fit (macOS menu bar, free) | Detects pauses in AI agents, 20-60 s micro-workouts after 30 s idle, posture, streaks. Source: news summary 2026-01-20 https://letsdatascience.com/news/git-fit-launches-macos-menu-bar-posture-app-3fd37768 [S]; site git-fit.app did not resolve, repo not found (UNVERIFIED) | 2026-01-20 | ? | ? |
| Meanwhile (Chrome ext) | Stretch while ChatGPT/Claude/Gemini responds [S] https://chromewebstore.google.com/detail/aokpllbbnnhljadaeninkhphljcnbdme (page not fetchable) | ? | | |
| ByteBreak, Brain Bed | Developer wellness apps (see above / peerpush) [S] | | | |
Blog framing the idea: Super Productivity, 2026-01-07, "What to do while waiting for AI code assistants" (20-20-20, shoulder rolls, hip flexor stretch, 3 breaths) https://super-productivity.com/blog/what-to-do-while-waiting-for-claude-code/ [S]. LessWrong 2026-07-06 "Claude Code as a Claude coach" (workout logging, not breaks) https://www.lesswrong.com/posts/J7brEsreXSrHpHH3v/claude-code-as-a-claude-coach [S].

Observation: nobody found with 3D animated character demos or evidence-backed contraindications in the agent niche; demos are text, GIF (desk-break), or YouTube (zenbreak). workout-gate is the only one with traction (221 stars), and its hook is coercive (blocks the prompt), which is a different philosophy from "use the natural wait". Claims about "nobody does X" are from my GitHub/web searches only, not exhaustive.

## 3. Gap analysis
1. Wait-aware timing exists (vibestretch, fitgate, Git-Fit) but is thresholds on turn length, not detecting real breakpoints (agent asks for approval, tests running, long tool call) combined with the user's physical state.
2. Demo quality: text or GIF. A 3D character performing the exact move (three.js/native) is unoccupied in the verified set.
3. Evidence/safety: no project found with contraindications, per-user limits (wrists, back, knees), or cited sources per exercise. fitgate mentions "safety constraints" for LLM plans but only with the optional server.
4. Meeting/call awareness: Stretchly lacks it (#969 open 5 years); LookAway and zenbreak have it; no agent-hook tool checks for calls (not verified in all READMEs).
5. Counting natural breaks: Workrave does (activity-based resets); modern tools mostly use idle timers.
6. Skip fatigue: unsolved. Stretchly users are asking for skip caps; gating approaches (workout-gate) overshoot into coercion. Middle path: do not interrupt, offer during waits, adapt frequency by acceptance.
7. Cross-agent portability: fitgate is the only one with 15+ agents; most are Claude-only.
8. Opportunity to integrate: Stretchly merged CLI commands (postpone/skip/finish current break) on 2026-10-08, so an external tool can drive it.

## 4. Latest 7 days (2026-10-06 to 2026-10-13)
Found:
- 2026-10-08: Stretchly PR #1868 merged, CLI commands to postpone/skip/finish the current break. https://github.com/hovancik/stretchly/pull/1868 [M]
- 2026-10-09: VladGirboan/claude-breaks created (pushed 2026-10-12). [M]
- 2026-10-09 to 2026-10-13: a burst of new break-reminder repos, all 0-2 stars: debidong/pausa (10-10), WonderMr/blincho (10-12, MIT, cross-platform), AyoubO22/move30 (10-13, silent reminders + team insights), janson202508/eyeguard (10-13, 20-20-20 with landscapes), HansTanzi/RestGuard (10-09), domino-jockey/canopy (10-11, Swift/SwiftUI), eyouelaya/eye-saver, tuananh131001/kairos, nil-byte/unfold-site (10-13, "native macOS break reminders"). Source: GitHub search API, created >= 2026-10-06 [M]. None has agent hooks except claude-breaks. Signal: commodity layer is saturated; differentiation must come from content and timing.
- 2026-10-05: press release "Movement Snacks" for Hong Kong desk workers (marketing). https://alvinology.com/media-outreach/2026/10/05/491829/ [MKT], just outside window.
- Sedentary research: a 12-week RCT (n=86, 3-minute micro-exercise break every hour) reporting improved glucose/insulin resistance, BP, HDL, Springer BMC Public Health (DOI 10.1186/s12889-026-26484-4). I could not open the page, so the publication date and effect sizes are UNVERIFIED; the date is likely 2026 from the DOI. https://link.springer.com/article/10.1186/s12889-026-26484-4
- No papers, launches, or HN/X posts specifically about three.js avatar fitness or AI-agent wait-time breaks were found dated within the window. A "Show HN" search found nothing relevant.
Most recent otherwise: fitgate (2026-09-12), Stretchly #1838/#1841 skip requests (August 2026), vibestretch (last pushed 2026-10-06), workout-gate (2026-06).

## 5. Name ideas (GitHub check, searched 2026-10-13 via API `in:name`)
1. Limber - taken by unrelated repos (NullVoxPopuli/limber 70 stars); crowded namespace but not in this space.
2. Wiggle - crowded (blender-wiggle 1,024 stars); avoid.
3. Breakpoint - dev pun; my search with extra keywords returned nothing, but the bare name is surely used widely (not checked); use an org prefix.
4. Stretchbud - no repo with that exact name found.
5. Idlegym - no exact-name repo found.
6. Deskbud - no exact-name repo found (but DESKBUDDY hardware projects exist: LextZip/Deskbuddy 189 stars).
7. Repbreak - HaofengLiu04/repbreak exists, 0 stars, empty.
8. Waitwell - marshvee/WaitWell, 1 star, unrelated student project; low conflict. Fits the "agent wait time" angle.
9. Turnwell - kes-phyl/turnwell, 0 stars, unrelated.
10. Unstick - several small repos (folz/unsticker.me 23 stars; ivp5/unstick 6); medium conflict.
Also checked and taken: HopUp (tiny repos), Nudgie (sattwyk/nudgie), MicroBuddy (tiny), AgentBreak (mnvsk97/agentbreak, 20 stars, chaos testing), BreakBuddy (danielj0nes/BreakBuddy 5 stars, "break reminder for software developers"; breakbuddy/electron-app), habit-buddy/HabitBuddy (many small habit-tracker repos; the working title is crowded), Cooldown (jordibruin/cooldown 107 stars), Pausa (debidong/pausa new). npm, Homebrew, and domain availability were not checked. Recommendation: Waitwell or Stretchbud have lowest conflict and fit; verify trademarks/domains before committing.
