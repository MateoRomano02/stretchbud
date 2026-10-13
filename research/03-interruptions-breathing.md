# 03 - Interruption science + breathing/relaxation (habit-buddy research)

Corrections from the adversarial verification (07, 08, 10) are applied in this file.

Date of research: 2026-10-13. Scope: how to pull a knowledge worker briefly out of flow ("mandatory but kind"), and what to put in the pause.

Evidence labels used throughout:
- **[READ]** I read the primary text (PDF or full article) in this session and the numbers below come from it.
- **[ABSTRACT]** I only saw the abstract or a search-result summary; numbers are as quoted there.
- **[RECALLED]** From background knowledge, not re-verified here. Treat as a lead, not a citation.
- "Measured" = behavioural/physiological/self-report data. "Opinion" = authors' interpretation, interviews, or practitioner folklore.

---

## PART A. INTERRUPTIONS

### A1. Cost of interruption and resumption lag

| Claim | Source / URL / date | Design, n | Effect | Label |
|---|---|---|---|---|
| Interrupted people finish faster but pay in stress, frustration, time pressure, effort. No quality loss detected. | Mark, Gudith, Klocke, "The Cost of Interrupted Work: More Speed and Stress", CHI 2008. https://www.ics.uci.edu/~gmark/chi08-mark.pdf | Lab, within-subjects, 48 subjects (mostly students), email task, interrupted by phone or IM, same-context vs different-context interruptions vs baseline | Time to complete: baseline 22.77 min vs 20.31 (same ctx) vs 20.60 (diff ctx), p<.05. Errors no difference (p=.19). NASA-TLX 1-20 scale: stress 6.92 baseline vs 9.46 / 9.13 (p<.001); frustration 4.73 vs 6.63 / 6.48 (p<.01); time pressure 11.02 vs 12.69 / 12.17; effort 9.50 vs 11.04 / 11.52. | READ, measured (self-report + time). Caveat: short lab task, student sample, and the interruptions were a fixed experimenter-driven design. Note: this paper is NOT the source of the popular "23 min 15 s to resume" figure (that is Mark, Gonzalez & Harris, CHI 2005, not verified here). |
| Field data: after an alert-driven switch, people spend ~10 min on the diversion and 10-15 more min before returning to the original task. | Iqbal & Horvitz, "Disruption and Recovery of Computing Tasks", CHI 2007. https://www.erichorvitz.com/CHI_2007_Iqbal_Horvitz.pdf | Field logging (DART tool), 27 users, 2 weeks, real desktops, email/IM alerts | Mean ~10 min on switches caused by alerts; mean 16m33s (unverified in the verification round: the PDF returned 403) to return to the suspended app after an email alert in one breakdown, ~8 min after IM; means have SDs larger than the means (very skewed, e.g. SD 13m for 10m). | READ (key means; the 27 users and 16m33s figures could not be re-verified, unverified), measured. Note: these interruptions were alerts that invited further diversion (email/IM content), not a self-contained 60 s habit prompt. Do not read this as "every interruption costs 25 min". |
| Longer and more demanding interruptions cost more resumption time; costs for interruptions up to ~1 min fit a decay model; rehearsing the goal mitigates it. | Monk, Trafton, Boehm-Davis, JEP:Applied 2008, "The effect of interruption duration and demand on resuming suspended goals". https://www.interruptions.net/literature/Monk-JEPA08.pdf | 3 lab experiments, interleaved-task paradigm | Resumption time rises with interruption duration and with cognitive demand of the interruption task; interaction shows goal rehearsal protects. | ABSTRACT, measured. Implication: keep the interruption short and low-demand, and give the user a way to rehearse "where was I" before leaving. |
| Memory-for-goals model: goals decay; cues at suspension time and at return time speed retrieval (priming constraint). | Altmann & Trafton, Cognitive Science 2002. https://www.interruptions.net/literature/Altmann-CogSci02.pdf | Computational model fit to Tower of Hanoi latency/error data | Model, not a field effect size. | ABSTRACT, theory plus lab fit. |

Interpretation (mine, opinion): the research supports (1) interruption cost is real but not huge for a brief, content-free pause; (2) the cost is dominated by losing the goal context, not by the pause length; (3) so the app should shorten the pause and help the user leave a "bookmark" and see it again on return.

### A2. Breakpoints reduce cost

| Claim | Source | Design, n | Effect | Label |
|---|---|---|---|---|
| Interrupting at the best moment (a task boundary) yields lower annoyance than at the worst moment. Best predicted moment: annoyance 56% lower than worst, 43% lower than random (abstract wording; the results section words the 56% as annoyance "rose 56% from best to worst", so the direction is internally inconsistent in the paper); 43% more "respect" for the primary task than worst. The earlier "31-106%" range and "about half the anxiety increase" could not be found in the paper text and were removed (unverified). | Adamczyk & Bailey, "If Not Now, When?", CHI 2004. https://hci.rwth-aachen.de/materials/conferences/CHI2004/1p271.pdf | Lab, within-subjects; 25 subjects built task models from video, 16 subjects ran editing/search/media tasks with news-alert interruptions at best/worst/random/no moment | Percentages above are from the paper's abstract; see the note in the Claim column. | READ (abstract/intro), measured self-report (annoyance, anxiety, frustration) plus time on task. |
| Three breakpoint granularities exist: Coarse (switch to a different activity), Medium, Fine (smallest meaningful unit, e.g. a single edit). Coarse offers the largest cost reduction but occurs least often. | Iqbal & Bailey, "Understanding and developing models for detecting and differentiating breakpoints during interactive tasks", CHI 2007. https://www.interruptions.net/literature/Iqbal_Bailey-CHI07.pdf | Programming, diagram editing, etc.; statistical models over a low-level event stream (window/UI events), task-independent | Models detect breakpoints with reasonable accuracy (the Fine 5.5 vs Immediate 4.5 frustration and 52-59% recall figures are unverified); Coarse vs Fine differentiation is the hard part (differentiating ability stated as weak in the follow-up). | READ (skimmed), measured. |
| Deferring notifications to breakpoints (OASIS) lowers frustration and speeds reaction vs immediate delivery. Coarse and Medium better than Fine. | Iqbal & Bailey, "Effects of intelligent notification management on users and their tasks", CHI 2008. https://www.interruptions.net/literature/Iqbal-CHI08.pdf | Study 1: 6 users model training/testing. Study 2: 16 users (8 per domain: diagram editing / programming) | Frustration (7-pt, 1 = pleasing, 7 = frustrating) in diagram editing: Coarse 3.6, Medium 2.6, Immediate 4.5, Fine 5.5 (Medium < Fine p<.001, Medium < Immediate p<.037). Reaction time: Breakpoint 3.07 s vs Immediate 4.08 s (p<.056, marginal). Model precision in study 2: 64%. Recall in study 1 for novel sequences: 52% (diagram) and 59% (programming). | READ, measured. Marginal p on reaction time; small n; the breakpoint detector used app-level event hooks (Windows hooks API) that this app cannot replicate fully on macOS. |
| Defer-to-breakpoint is the dominant recommendation; Fine breakpoints are not enough (can be worse than immediate). | Same CHI 2008 | as above | See above: Fine 5.5 vs Immediate 4.5 frustration. | READ. Important counter-intuitive result: "any pause" is not good enough; a Fine pause (e.g. 2 s between keystrokes) is not a breakpoint. |
| Interruption timing taxonomy and Bailey & Konstan 2006 (interruptions increase task time 3-27%, errors up to 2x, anxiety up to 2x, depending on moment) | Bailey & Konstan, Computers in Human Behavior 2006. https://www.interruptions.net/literature/Bailey-CHB06_1.pdf | Lab | Figures as I remember them. | RECALLED, not re-verified. Use as directional only. |

### A3. Detecting natural pauses on a computer

Facts I verified:
- Iqbal & Bailey's models work from low-level events (window opens/closes/focus changes, input events) and a 10 s binning window was used for features [READ, iqbal08 text: "a 10s window"]. They needed task-specific plug-ins to get usable recall; generic event streams alone gave weaker differentiation (Coarse vs Fine recall only a few percent to ~40% in some novel-sequence cases).
- Luo et al. (CHI 2018) delayed their prompt 15 s while the user was typing or clicking, to avoid cutting into flow [READ]. Still, 18.9% of the "no" replies were "in a meeting or class" and 40.6% "busy working", so input-activity gating alone did not prevent bad timing.
- Negotiated interruption (heads-up plus user control) gave the best overall performance in McFarlane 2002 [ABSTRACT; the paper's own conclusion says "Negotiation support is the best overall solution" per text I grepped]; immediate had a slight edge only for timeliness of handling.

What a macOS app with only idle time, frontmost app and counts can do (my synthesis, opinion):
- Idle time (CGEventSourceSecondsSinceLastEventType) tells you "user stopped for N s". A 2-5 s gap is a Fine pause (useless per Iqbal & Bailey 2008). A gap of 20-60 s, or a transition, approximates a Coarse breakpoint.
- Frontmost-app change is the closest proxy to Coarse breakpoints ("switching to an activity other than the current one" is literally the paper's Coarse definition for editing). Treat "app switched AND was in the previous app >= several minutes" as a good moment. Treat "rapid alt-tabbing" (many switches per minute) as a bad moment: that is task-internal churn, not a boundary.
- Counts: keystroke/click/app-switch counts per minute give a "workload" proxy. High sustained typing rate = likely flow; do not fire. Falling rate after a high plateau = candidate wind-down.
- Known signals that can be added cheaply on macOS: calendar event end (EventKit), screen sharing/presenting (check for active screen capture or Zoom/Teams/Meet frontmost plus mic in use), fullscreen app, Focus mode / Do Not Disturb state, `git commit` / build finish (only via a shell hook or terminal-title polling; not available with idle+frontmost alone). I did not find a peer-reviewed validation of git-commit or build-completion as a breakpoint beyond the programming-task results in Iqbal & Bailey; treat as plausible, unvalidated.

### A4. Break-reminder compliance

| Claim | Source | Design, n | Effect | Label |
|---|---|---|---|---|
| Of 1,599 break prompts, 40% yes, 34% "no, can't now", 26% ignored. Reasons for "no": busy working 40.6%, in meeting/class 18.9%, just came back from a break 15.2%, close to finishing something 8.8%, heading elsewhere 7.9%, in conversation 3.7%, screen activity 2.5%. | Luo, Lee, Mark, Epstein et al., "Time for Break", CHI 2018. https://www.microsoft.com/en-us/research/wp-content/uploads/2018/02/Time4Break-CHI2018.pdf | 25 information workers, 3-week field study + interviews. System: user sets work duration (20-120 min, 60 most common, 46% of days), prompts "take a break?" with Yes / No-can't-now (+reason), prompt auto-closes after 2 min, postponed 15 s if typing/clicking | 50.6% of responses within first 20 s. Participants responded faster over time (b=-.74, p=.013). Self-regulation rose pre/post (d=.73, p=.01); habit strength did not significantly rise. 7 participants felt accountable and some guilty saying "no"; some "waited for" the prompt and wrapped up work in the 10 min before it. Several took longer breaks than intended (social). Reasons for taking breaks: stress/relax 32.1%, physiological needs 28.6%, refresh 23.2%. | READ, mixed measured + interview opinion. n=25, no control group, volunteer sample. |
| Prompts were most compatible with productivity when people could finish a thought: "close to finishing something" was a distinct reason to decline, and some participants chose to wrap up before the prompt. | same | same | A heads-up and a "finish this in X min" option addresses 8.8% + part of 40.6%. | READ, interview opinion. |
| Break software with extra-break and exercise prompts raised recovery from neck/upper-limb complaints (55% vs 34%) and lowered deterioration (4% vs 20%), but pre/post complaint scores did not differ significantly; productivity was higher in intervention groups. | van den Heuvel et al., Scand J Work Environ Health 2003. https://www.sjweh.fi/article/712 | RCT, 268 computer workers, 22 sites, 8 weeks, 3 arms (control; extra breaks; breaks + exercises) | As quoted. | ABSTRACT (search summary), measured, but primary outcomes not significant. |
| Microbreaks taken at own discretion vs every 20 min vs every 40 min, compared with no breaks: tested EMG (mean power frequency cycling), discomfort, productivity. | McLean et al., 2001 (microbreak study) | Three break groups vs no-break control; no break length stated in the abstract (the "30 s" guess was removed) | Discomfort reduced, particularly at 20-min spacing, no productivity loss (abstract). | ABSTRACT only. |
| Micro-break meta-analysis, "Give me a break!" | Albulescu et al., PLoS ONE 2022. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9432722/ | Systematic review/meta-analysis | I could not retrieve full text (PMC bot check). My recollection: micro-breaks (<=10 min) raise vigor and lower fatigue, small effects, effect on performance depends on task type; longer breaks give more recovery but diminishing marginal gain. | RECALLED, not verified. |
| Epstein, Avrahami, Biehl, "Taking 5: Work-Breaks, Productivity, and Opportunities for Personal Informatics", CHI 2016. https://dl.acm.org/doi/abs/10.1145/2858036.2858066 | Survey of 147 US knowledge workers; 2-week diary study with 28 participants (800 breaks logged); visualization study | Abstract only: authors report what workers count as breaks and the benefit they want from them, and effects of breaks on productivity from the diary. Specific effect sizes not retrieved. | ABSTRACT only. |
| Barredo & Mahon 2007 (break software and compliance) | Could not locate in this session. | | Not verified; do not cite. |
| Pomodoro vs self-regulated vs flowtime breaks in students | https://pubmed.ncbi.nlm.nih.gov/40723645/ | Seen only as a title in search results. | Not verified. |

Postpone/snooze design: the only empirical snooze-adjacent evidence I read is Luo's "No, can't now + reason" with a 2-minute auto-dismiss and re-prompt cycle. There is no controlled study I found comparing snooze counts (0/1/2/3) or forced vs voluntary locks on compliance and productivity. This is a genuine gap (see gaps).

### A5. What the evidence supports for design (links the sources to rules)

- Heads-up before the interruption (negotiated interruption): McFarlane 2002 best overall performance [ABSTRACT/READ conclusion]. Luo participants used the lead time to wrap up (some started wrapping 10 min before; 50.6% responded in 20 s, others "caught up" within the 2 min window).
- Do not fire on Fine breakpoints: CHI 2008 frustration Fine 5.5 vs Immediate 4.5.
- Short, low-demand pause: Monk 2008.
- Give a return cue: Altmann & Trafton goal-priming and Iqbal & Horvitz resumption results.
- Accountability is a mixed blessing: Luo participants reported guilt on "no". Phrase decline as neutral, not as failure.
- Reminder fatigue: not studied here; assume it exists.

---

## PART B. BREATHING AND RELAXATION

### B1. Balban et al. 2023

- Source: Balban MY, Neri E, Kogon MM, et al., "Brief structured respiration practices enhance mood and reduce physiological arousal", Cell Reports Medicine 4(1):100895, Jan 2023. https://pmc.ncbi.nlm.nih.gov/articles/PMC9873947/ [READ via fetch of text up to char 100,000 of ~116k; abstract numbers confirmed there]. Stanford press summary: https://med.stanford.edu/news/insights/2023/02/cyclic-sighing-can-help-breathe-away-anxiety.html
- Design: remote randomised controlled trial, June-Sept 2020, 108 randomized (group sizes below are the randomized Methods numbers, 24 + 30 + 21 + 33 = 108; an earlier 22/27/19/32 = 100 may be analysed completers, unverified), 4 groups for 28 days at 5 min/day: mindfulness meditation (n=24, control, focused attention on forehead), cyclic sighing (n=30), box breathing (n=21), cyclic hyperventilation with retention (n=33; 30 rapid breaths then exhale-hold 15 s, 3 rounds). Press coverage says 111; I use the paper's 108/100.
- Cyclic sighing protocol: double inhale through the nose (second small top-up inhale after lungs already expanded), then slow full exhale through the mouth. The paper gives no seconds. Box breathing phase length (3-10 s) was individualised by a CO2 tolerance (exhale-hold) test: exhale time 0-20 s mapped to 3-4 s phases, 25-45 s to 5-6 s, 50-75+ s to 8-10 s.
- Results (measured, self-report PANAS positive affect, state anxiety STAI, plus respiration rate from wearable/measure): positive affect change per daily session: cyclic sighing +1.89 (SD 3.76, p=.025), box +1.84 (p=.026), hyperventilation +1.97 (p=.003), mindfulness +1.22 (SD 2.34, p=.06). Mixed-effects model: breathwork groups greater increase than mindfulness; cyclic sighing largest and significant vs mindfulness (p<.05). Respiratory rate: breathwork groups reduced more than mindfulness (p<.05). State anxiety fell in all groups (p<.0001), no between-group differences. HRV and resting heart rate: no significant changes. Sleep: no significant improvement.
- Adherence: breathwork 19.6 +/- 7.7 days out of 28; mindfulness 17.7 +/- 9.3 days. 10% reported negative experiences related to the exercises (no breakdown).
- Limits: unblinded, self-reported, remote, small cells, not preregistered (retrospective), no follow-up, mindfulness comparator was a weak active control, volunteer sample. Effect is small: about +0.7 PANAS points over the control; I did not find a standardised effect size in the text I read. These are 5-min DAILY sessions over a month; not a single 60 s pause.
- Honest read: shows that 5 min/day of any of these three breathwork styles raised next-measure mood a little more than mindfulness; says nothing about a 60-90 s work-break dose, nor about a one-off immediate effect.

### B2. Slow-paced breathing (~6/min) and HRV

- Zaccaro et al., "How Breath-Control Can Change Your Life: A Systematic Review on Psycho-Physiological Correlates of Slow Breathing", Front Hum Neurosci 2018. https://pmc.ncbi.nlm.nih.gov/articles/PMC6137615/ [READ via fetch]. 15 studies of 2,461 abstracts, healthy subjects, <10 breaths/min (3-4, 4-6, 9-10 per min tested; HRV biofeedback typically 5.4-6/min). Slow breathing at ~6/min associated with higher HRV power, more EEG alpha and less theta, and with reported lower anxiety/depression/anger; some studies found non-significant anxiety changes. Authors state: no standardised methods, heterogeneity prevented meta-analysis, few long-term studies, adverse effects barely examined. Measured, but low-quality evidence base (small studies).
- Laborde et al., "Effects of voluntary slow breathing on heart rate and heart rate variability: A systematic review and a meta-analysis", Neurosci Biobehav Rev 138:104711, 2022. https://pure.solent.ac.uk/en/publications/effects-of-voluntary-slow-breathing-on-heart-rate-and-heart-rate-/ [ABSTRACT]. 223 studies included (172 during the session, 16 immediately after one session, 49 after multi-session training). Result: vagally-mediated HRV increases at all three time points; conclusion: low-tech, low-cost, "few adverse effects expected". Effect sizes not retrieved. Caveat: HRV is an arousal marker, not a validated proxy for feeling better or for work performance. Also note Balban 2023 found no HRV change from 5-min breathing, so HRV gains during the exercise do not necessarily persist.
- Optimal ratio: debated; theory favours longer exhale (1:2) but literature disagrees [search summary of Laborde 2021 Psychophysiology, https://eprints.bournemouth.ac.uk/38163/ , not read in full]. HRV-biofeedback resonance range 4.5-6.5 breaths/min (individual).
- Verdict: one of the better-supported mechanisms (acute HRV/vagal effect during slow breathing is robust), mood/performance benefits are small and under-studied for short workplace doses.

### B3. Box breathing, 4-7-8: honest evidence level

- Box breathing: 21 participants (randomized) in Balban 2023 only (individualised 3-10 s per phase). Positive affect effect similar to others, not distinguishable from cyclic sighing apart from the sighing group having a bigger mixed-model result. No strong evidence as treatment for clinical anxiety, insomnia, or hypertension (search-summary statement, secondary source, not primary). Its popularity (military, cockpits) is mostly opinion/anecdote.
- 4-7-8: weak. Secondary summary (blog/health-site level): two small single-site RCTs (post-bariatric surgery anxiety; tinnitus stress/sleep) and one 43-person study showing transient HR/BP drop. It is a Weil/Gunn-popularised pattern with little direct sleep research. Evidence level: low, mostly opinion. I did not locate the primary papers; do not cite.
- Cyclic sighing: one RCT (above); decent but single, small, remote.
- Resonance/6-per-minute breathing: strongest physiological evidence of the set (B2).

### B4. Progressive muscle relaxation (short) and brief mindfulness at work

- Brief worksite relaxation (relaxation breathing plus PMR twice daily for 8 weeks): RCT, 152 employees, reduced stress symptoms, job demands, and cortisol vs wait-list [ABSTRACT via search summary of a Greek worksite RCT; primary not read].
- PMR in assembly-line workers: stress effect size 0.6 vs 0.2 for a pamphlet comparison [ABSTRACT via search summary, https://pmc.ncbi.nlm.nih.gov/articles/PMC4939865 not opened; weak citation].
- Workplace mindfulness programmes: meta-analysis, 56 studies, 2,689 participants vs 2,472 controls, stress Hedges g 0.32-0.77 [ABSTRACT via search summary; https://link.springer.com/article/10.1007/s12671-020-01328-3]. These are multi-week programmes, not micro-sessions.
- Verdict: PMR and mindfulness evidence exists for multi-week programmes with trainers; transfer to a 60-120 s embedded micro-session is unproven. A short PMR (shoulders/neck/hands/jaw, 5 s tense + 10 s release) is a reasonable lower-risk physical alternative to breathing and also doubles as an ergonomic micro-stretch (opinion).

### B5. Contraindications and safety (opinion-grade, evidence thin)

I did not find a rigorous safety trial for brief breathing exercises. What I could support:
- Zaccaro 2018: adverse effects "barely examined" [READ]. Laborde 2022: "few adverse effects expected" [ABSTRACT]. Balban 2023: 10% reported negative experiences, nature unspecified [READ].
- Hyperventilation/dysfunctional-breathing syndrome causes dizziness, tingling, chest tightness; Cochrane review of breathing exercises for it found no credible evidence of benefit either way (https://www.cochrane.org/evidence/CD009041_breathing-exercises-dysfunctional-breathinghyperventilation-syndrome). Hence: no rapid/deep breathing, no forced breath holds by default.
- Panic disorder, asthma, cardiovascular/pulmonary disease, pregnancy, epilepsy/seizure history, fainting history: these are the standard clinical cautions for breath retention or hyperventilation-style practices [RECALLED / clinical convention, not verified in this session]. Pregnancy: avoid long breath holds (recalled convention).
- Design implications (opinion): skip hold phases by default; never use the Balban hyperventilation-with-retention protocol; use nasal/gentle breathing; allow "breathe normally" at any time; include a visible "stop / not today" and a short note "if you feel dizzy, tingling, or anxious, stop and breathe normally"; do not claim medical effects; offer a non-breathing alternative (stretch, look-away, water).

---

## DESIGN RULES FOR THE APP

Numbers marked (E) come from evidence; (J) are my judgement where no data exists.

### When to fire
1. Schedule: use a work-duration timer the user can set (20-120 min; default 60 min, which was the modal choice, 46% of days, in Luo). (E: Luo; J: exact default.)
2. Do not fire at the timer instant. The timer makes the break "due"; the app then defers up to a window for a breakpoint, then fires anyway ("mandatory but kind"). Suggested defer window: 5 min soft, 10 min hard cap (J; Iqbal & Horvitz show real-world delays of minutes are normal; Luo participants wrapped up within 10 min).
3. A moment is a good breakpoint ("green") if all hold (J, built on A2/A3):
   - not in a meeting: calendar says no event now; not screen sharing; mic/camera not in use; not a known call app frontmost with input;
   - not in a fullscreen app or Focus/DND on (treat DND/focus as "defer, do not suppress forever");
   - frontmost app changed within the last 60 s, OR input idle for >= 20 s and < 5 min (Coarse proxy; do not use 2-5 s gaps since Fine breakpoints were worse than immediate);
   - recent input rate is not at the user's high plateau (e.g., last 60 s keystrokes below median of the last 30 min x 1.5).
4. "Red" moments (never fire; defer): typing/clicking in the last 15 s (E: Luo 15 s), >= N app switches/min churn, calendar meeting starting in <3 min, active screen share.
5. Idle > 5 min (user already away) counts as a break: reset the timer, show a small "good, counted" toast instead of interrupting (J; avoids Luo's 15.2% "just came back from a break" noise).
6. Hard cap: if no green moment occurs by the cap, fire at the next idle >= 5 s (J) rather than during active typing.

### Heads-up timing
7. Two-stage negotiated interruption (E: McFarlane; J: timing): a peripheral cue 60 s before ("Break in 1:00", small menu-bar/corner pill, non-modal, no sound), a second cue at 10 s, then the break starts. Luo participants decided within 20 s about half the time, and some wrapped up in the ~10 min before; 60 s lets "close to finishing something" (8.8% of declines) complete.
8. Cue must be peripheral and non-blocking (small, bottom corner or menu bar, colour/breathing-pulse change). Do not steal focus or keyboard input at cue time; only the lock itself may take focus. (J.)
9. Include a one-key "need 2 more minutes" on the heads-up (see snooze).

### Snooze policy
10. Allow at most 2 snoozes per break: 2 min, then 5 min (J). Reason: Luo's "no, can't now" was 34% and "ignored" 26%; some people needed one extra minute to finish a thought, but "busy working" (40.6%) is a recurring excuse, so unlimited snoozes defeat the habit. After the second snooze, the third prompt is "mandatory": the lock is shorter, not skippable.
11. Require a reason chip on snooze ("meeting", "finishing something", "presenting") to auto-learn (E: Luo logged reasons). "In a meeting" or "presenting" resets to the next breakpoint without consuming a snooze (J), since 18.9% of declines were meetings.
12. Never frame decline as failure (E: Luo guilt). Wording: "Later" not "Skip".
13. Daily cap on total skips is a soft data point, not a punishment; show weekly stats only on request.

### Lock duration
14. Total interruption target 60-90 s, absolute cap 120 s for mandatory micro-break (E: Monk shows duration and demand raise resumption cost; interruptions under 1 min show decay-driven cost; J for exact length). Optional "extended" mode 5 min for users who choose the Balban-style practice.
15. "Mandatory but kind": the screen veil/overlay should be dismissable via a deliberate 3-s hold ("hold Esc to end") after a minimum of the first 20 s (J); do not hard-lock the Mac. An emergency escape must always exist.
16. Do not use a full-screen black lock; use a dimmed, translucent overlay with the previous app visible behind so the goal context is not erased (E: Altmann & Trafton cues; J: translucency).

### Return cue
17. On entry, capture an optional 1-line "next step" (one text field, skippable) or auto-snapshot frontmost app + window title; on exit, re-display it for ~5 s (E: goal rehearsal/priming reduces resumption lag; J: UI).

### Detecting breakpoints with only idle time / frontmost app / counts
Pseudocode-level (J):
- Poll every 1 s: idleSeconds, frontmostBundleID, window title (if allowed), event counts per 10 s bin (Iqbal & Bailey used 10 s bins).
- Maintain per-user baselines (median keystrokes/min in the last 30 min).
- Coarse breakpoint = frontmost app changed AND previous app dwell >= 3 min, OR idle >= 20 s after a high-rate stretch.
- Fine = idle 2-10 s without app change: ignore.
- Churn guard = >=6 app switches in 60 s: suppress.
- Maintain a "due" state with escalation: due -> wait for green (<=5 min) -> heads-up -> fire.
- Validation plan: log, on-device and opt-in, the user's response to each prompt (accept/snooze/ignore, latency) and learn per-user which breakpoint features predict acceptance, as Luo's reasons suggest.

### Breathing protocols with exact timings (for animation)

All protocols: nasal inhale, relaxed exhale, no forced holds, "breathe normally anytime", stop on dizziness. Animation: a circle that expands on inhale, contracts on exhale, holds still on holds; ease-in-out sine; add a faint tick at phase changes.

**P1. Cyclic sighing, 60 s micro version** (evidence: Balban 2023, but with one RCT and the original gave no seconds; timings are my adaptation, E for pattern, J for seconds)
- Inhale 1: 2.0 s (circle to 80%), inhale 2 (top-up): 1.0 s (to 100%), exhale: 6.0 s (to 0%). Cycle = 9 s. ~6.7 cycles/min. Run 7 cycles = 63 s (or 5 min for the "full practice" variant = 33 cycles).
- Pause between cycles: 0 s.

**P2. Resonance breathing 5:5 (about 6 breaths/min)** (evidence: slow breathing literature, Zaccaro 2018; Laborde 2022; E for rate, J for 5:5)
- Inhale 5.0 s, exhale 5.0 s. Cycle = 10 s = 6/min. Run 6 cycles = 60 s; 9 cycles = 90 s.
- Variant 4:6 (inhale 4.0 s, exhale 6.0 s, 6 cycles/min) emphasising exhale (J: theory says longer exhale increases vagal tone; literature disagrees on ratio).

**P3. Gentle box breathing 4-4-4-4** (evidence: Balban box arm n=21 randomized; individualised 3-10 s phases; 4 s is the lowest tier in their lookup; J)
- Inhale 4.0 s, hold 4.0 s, exhale 4.0 s, hold 4.0 s. Cycle = 16 s. 4 cycles = 64 s. Holds are short and the user can switch to P2. Offer only to users who opt in; default hidden. 3 s per phase (12 s cycle) as "easy" option.

**P4. Neck-and-shoulder PMR micro-sequence, 75 s** (evidence: weak for micro dose; J)
- Hands: make fists 5 s tense, 10 s release. Shoulders: raise to ears 5 s, drop 10 s. Jaw/face: scrunch 5 s, release 10 s. Then 2 slow breaths: inhale 4 s, exhale 6 s (20 s total). Total = 15+15+15+20 = 65 s plus 10 s transition = 75 s. Do not tense hard; stop if cramping.

Not recommended for default: 4-7-8 (7 s hold, weak evidence, adds a hold), hyperventilation-with-retention (safety, not appropriate for a work reminder).

---

## GAPS AND UNCERTAINTIES

1. No controlled study of snooze count, forced vs voluntary locks, or heads-up length for break prompts. Rules 7, 10, 14 are judgement. Run an in-app A/B or opt-in logging to tune.
2. Luo et al. is n=25, no control, volunteers, sedentary-break prompt (stand/move), not breathing. Generalisation to a 60-90 s breathing pause is assumed.
3. Mark 2008 and Adamczyk 2004 are lab studies (the popular "23 min 15 s to resume" figure is from Mark, Gonzalez & Harris, CHI 2005, not Mark 2008, and was not verified here); with students and artificial tasks; field transfer (Iqbal & Horvitz) concerns content-bearing alerts, not content-free break prompts. No study of a "habit prompt" cost specifically.
4. Breakpoint detection from only idle/frontmost app/counts was never validated as such; Iqbal & Bailey used task-specific event hooks and still had only moderate recall (52-59%, unverified) and precision (64%, unverified). Expect many false greens; hence the hard cap and learning loop.
5. Balban 2023: small, remote, self-reported, mindfulness comparator, no HRV effect, no single-session or workplace data. Effect on positive affect is modest. Per-session effect and the effect of 60 s are unknown.
6. Laborde 2022 effect sizes, the Albulescu 2022 micro-break meta-analysis, Bailey & Konstan 2006 numbers, McLean 2001 results, Barredo & Mahon 2007, and the PMR/mindfulness workplace trials are not verified against primary text. Epstein 2016 findings read only from abstract. 4-7-8 evidence from secondary summaries.
7. Contraindications: I found no safety trials; list is clinical convention. Recommend a medical-disclaimer review before shipping and keeping holds off by default.
8. Not covered: eye-strain/20-20-20 evidence, hydration, posture; gamification evidence (streaks, points) for break compliance (the Luo "accountability/guilt" finding is the only relevant data here); notification-fatigue over months; ADHD/neurodivergent and accessibility considerations (motion animation, reduced-motion setting, screen reader, hearing, colour-blind); cultural meaning of overlays in enterprise environments (IT policy for screen overlays).
9. Workrave/Stretchly: I did not find independent usage or compliance studies; any claim about their compliance is unverified.

## Key URLs
- Mark 2008: https://www.ics.uci.edu/~gmark/chi08-mark.pdf
- Iqbal & Horvitz 2007: https://www.erichorvitz.com/CHI_2007_Iqbal_Horvitz.pdf
- Adamczyk & Bailey 2004: https://hci.rwth-aachen.de/materials/conferences/CHI2004/1p271.pdf
- Iqbal & Bailey 2007: https://www.interruptions.net/literature/Iqbal_Bailey-CHI07.pdf
- Iqbal & Bailey 2008: https://www.interruptions.net/literature/Iqbal-CHI08.pdf
- McFarlane 2002: https://www.interruptions.net/literature/McFarlane-HCI02_2.pdf
- Monk 2008: https://www.interruptions.net/literature/Monk-JEPA08.pdf
- Altmann & Trafton 2002: https://www.interruptions.net/literature/Altmann-CogSci02.pdf
- Luo 2018: https://www.microsoft.com/en-us/research/wp-content/uploads/2018/02/Time4Break-CHI2018.pdf
- Epstein 2016: https://dl.acm.org/doi/abs/10.1145/2858036.2858066
- van den Heuvel 2003: https://www.sjweh.fi/article/712
- Balban 2023: https://pmc.ncbi.nlm.nih.gov/articles/PMC9873947/
- Zaccaro 2018: https://pmc.ncbi.nlm.nih.gov/articles/PMC6137615/
- Laborde 2022: https://pure.solent.ac.uk/en/publications/effects-of-voluntary-slow-breathing-on-heart-rate-and-heart-rate-/
- Cochrane dysfunctional breathing: https://www.cochrane.org/evidence/CD009041_breathing-exercises-dysfunctional-breathinghyperventilation-syndrome
