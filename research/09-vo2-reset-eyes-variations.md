# 09 - VO2 challenges, reset breaks, eye breaks, strength variations

Corrections from the adversarial verification (07, 08, 10) are applied in this file.

Date: 2026-10-13. Companion file: `09-new-entries.json` (36 entries, same 16 keys as `02-exercise-catalog.verified.json` plus `kind`, `level`, `family`; `verdict` and `verification_note` are "PENDING").

Evidence labels used: **MEASURED** = effect in a trial or cohort, read in abstract; **OPINION** = guideline text, expert statement or app design choice. Source-reading labels used throughout: **abstract read** (Europe PMC record), **page read** (web page, via a fetch tool that summarises, so wording is a summary), **search snippet** (only a search-result summary seen), **repo notes** (taken from this repo's earlier research files, not re-read).

Not reached: bjsm.bmj.com (403), PubMed (cookie wall), the eparmedx PAR-Q+ page and PDF (no usable text), the Riebe 2015 full text. No number below is taken from a source I could not at least see in an abstract or summary.

---

## A. VO2max / cardiorespiratory fitness with short vigorous bouts

### A1. What the evidence says (read this before designing the mode)

| Source | Design | n | Dose | Result | Label |
|---|---|---|---|---|---|
| Jenkins 2019, Appl Physiol Nutr Metab 44(6):681-684 (abstract read) | RCT, sedentary young adults vs non-training control | 12 per arm | 3 vigorous ascents per day of a 3-flight, 60-step stairwell, 1-4 h apart, 3 d/wk, 6 wk | VO2peak higher in climbers, P=0.003; abstract calls the increase "modest" and gives no magnitude (a "~5%" figure appears only in a secondary French summary; do not quote it) | MEASURED |
| Allison 2017, Med Sci Sports Exerc (abstract read) | Two small studies, sedentary women (31 total) | 12 and 11 | 3x20 s all-out stair ascents, 3 d/wk, 6 wk; and 3x60 s one-flight protocol | VO2peak +12% (~1 MET) and +7%; this is a sprint-interval design in one session, not snacks spread over the day; abstract mentions no control group (pre-post designs) | MEASURED |
| Little 2019, Eur J Appl Physiol (abstract read) | RCT, inactive adults ~22 y | 12 snack, 16 classic SIT | 3x20 s all-out cycling spread 1-4 h apart, 6 wk | VO2peak ~+4% (snack) vs ~+6% (SIT), no group difference; no non-exercise control; cycle ergometer, not stairs | MEASURED |
| Boreham 2005, Br J Sports Med (abstract read) | RCT, sedentary young women | 8 stair, 7 control | 1 ascent/day rising to 5/day, 199 steps, 90 steps/min, ~2 min each, 5 d/wk, 8 wk | VO2max +17.1% vs control | MEASURED (very small) |
| Rodriguez 2025/26, Br J Sports Med 60(2):133 (abstract read) | Systematic review and meta-analysis | 11 RCTs, n=414 | snacks defined as bouts of 5 min or less, 2+/day, 3+ d/wk, 2+ wk | cardiorespiratory fitness g=1.37 (95% CI 0.58-2.17), I2=71.4%, k=6, moderate certainty (only 6 of the 11 trials measured CRF); no effect on BP, lipids, body composition | MEASURED |
| Exercise snacks meta-analysis 2025, DOI 10.1111/sms.70114 (journal inferred from the DOI prefix; abstract read) | SR/MA | 12 RCTs + 2 non-RCTs, n=483 | exercise snacks | VO2max SMD 1.43 (0.61-2.25); 2 RCTs high risk of bias, 10 "some concerns" | MEASURED |
| Jones 2024 scoping review, Sports Med (abstract read) | Scoping review | 32 records | - | "feasible and appeared safe"; "modest effects on improving cardiorespiratory fitness" | MEASURED |
| Babir 2026, Diabetes Obes Metab (abstract read) | RCT, REAL-WORLD remote, adults with type 2 diabetes, mean age 58 | 69 | 4x1 min vigorous bouts, 5+ d/wk, 12 wk, vs mobility control | No between-group difference in estimated VO2max or HbA1c; 30-s sit-to-stand +1.9 reps (0.3-3.4) (abstract truncated in the verification read; other null findings per the earlier read); RPE 5.7/10, peak HR 73% of age-predicted max | MEASURED (negative for VO2) |
| Stamatakis 2022, Nat Med 28:2521 (abstract read) | OBSERVATIONAL, UK Biobank wrist accelerometer, non-exercisers | 25,241; 852 deaths; 6.9 y | median 3 bouts/day of 1-2 min | 38-40% lower all-cause and cancer mortality, 48-49% lower CVD mortality; median 4.4 min/day: 26-30% / 32-34% (exact HRs and CIs not retrieved) | MEASURED association, NOT causal |
| Ahmadi 2022, Eur Heart J (abstract read) | OBSERVATIONAL, UK Biobank | 71,893; 5.9 y | vigorous activity volume and number of bouts of 2 min or less | ~15 min/week vigorous: HR 0.82 all-cause (0.75-0.89); 27 short bouts/week: HR 0.73 (0.62-0.87) | MEASURED association, NOT causal |
| Islam, Gibala, Little 2022, Exerc Sport Sci Rev 50(1):31-37 | Narrative review | - | defines exercise snacks as isolated bouts of 1 min or less of vigorous exercise | definition only | search snippet |

Other recent items seen (abstracts read but not needed for the design): Zhu 2025 is a Research Square PREPRINT (n=31, three snack modes including deep squats, no non-exercise control; VO2peak improved within every group); Qiu 2026 (n=23, 4-week stair snacks); Stork 2024 workplace receptivity study (n=14, 3 bouts of 53-60 stairs; participants preferred the snack format over HIIT, 10 of 14). Wan/Fyfe 2024-2026 reviews: not located in Europe PMC under those names; the Rodriguez BJSM meta-analysis and the 2024 scoping review above cover the ground.

### A2. The honest VO2 claim (this is the only claim the app may make)

> "In small trials of previously inactive young adults, a few short, hard stair-climbing or cycling bursts per day (about 20 seconds to 2 minutes each), 3 to 5 days a week for 6 to 8 weeks, improved peak oxygen uptake by a modest amount. A 2026 meta-analysis of 11 randomised trials (414 adults) found a moderate-certainty improvement in cardiorespiratory fitness (6 trials measured it), with large differences between studies. In one real-world 12-week trial in 69 adults with type 2 diabetes (mean age 58), four one-minute vigorous bouts a day did not change estimated VO2max. Large studies linking short bursts of vigorous activity to lower mortality are observational and cannot show cause. One burst does not change your fitness; any change takes weeks of repetition. Desk-only bursts such as marching in place have not been tested for fitness. Ask a doctor first if you have a heart, kidney or metabolic condition, high blood pressure or symptoms during exercise."

Do not say: "raises VO2max", a percentage as personal expectation, mortality numbers as benefit, "supervised" (not stated in the abstracts), or "older adults" for Babir (mean age 58). The earlier "roughly 4 to 17%" range mixed uncontrolled pre-post designs (Allison, Little) with controlled ones (Jenkins, Boreham) and was removed.

Things the app must NOT say: that a bout "raises VO2max", "adds X years", or that desk bursts such as high knees or squat bursts are proven (there is no VO2 trial for in-place bursts; they are extrapolated, labelled in the entries). VILPA mortality numbers must never be shown as expected personal benefit.

### A3. Safety and pre-participation screening

- ACSM 2015 (Riebe et al., Med Sci Sports Exerc 47(11); abstract read; algorithm detail via IDEA summary, page read): the algorithm uses (1) current physical activity level, (2) signs or symptoms and/or known cardiovascular, metabolic or renal disease, and (3) desired intensity. Cardiovascular risk-factor profiling is no longer used.
- Per the IDEA summary of the algorithm: an inactive person with no known disease and no symptoms does not need medical clearance, should start with light-to-moderate intensity and may progress gradually; known disease or any symptom: clearance recommended. "Regular exercise" = planned, structured, moderate activity at least 30 min on at least 3 days/week for at least 3 months. Vigorous = at least 60% heart rate reserve or RPE 14 or more on the 6-20 scale. Full ACSM text not read.
- Signs and symptoms listed (IDEA summary of ACSM 2015): pain or discomfort in the neck, chest, arms, jaw or other areas from ischemia; shortness of breath at rest or with mild exertion; dizziness or fainting; unusual fatigue or shortness of breath with usual activities; the verification round added palpitations, ankle swelling, claudication and a known heart murmur.
- NHS (page read): "speak to your GP first if you have not exercised for some time, or if you have medical conditions or concerns." CDC page read gave no screening text.
- PAR-Q+ (eparmedx.com): page confirms it exists and is the standard readiness screen; question count and scoring NOT verified (no usable text retrieved). Safe to link to it, not to reproduce it. Not verified.
- Rodriguez 2025/26 and Jones 2024: no safety signal but small trials; Babir 2026 reported no differences in feasibility, adherence similar to control.
- Warning signs to stop and seek care (app text, consistent with the ACSM symptom list): chest pain or pressure, unusual breathlessness, palpitations or irregular heartbeat, dizziness or light-headedness, nausea; do not resume that day.

### A4. Designed "VO2 challenge" mode (app design; OPINION, not a tested prescription)

Design rules, each tied to the sources above:

1. Screen first (ACSM 2015 list). Any known heart, metabolic or kidney disease, or any listed symptom: moderate-only entries and "ask a clinician first" before vigorous mode. App shows the text but does not diagnose.
2. Start moderate, even for fit-looking users (ACSM 2015: inactive adults start light-to-moderate). Use the CDC/NHS talk test: moderate = "can talk, not sing"; vigorous = "a few words only". Do not mix RPE scales: CDC uses 0-10 (moderate 5-6, vigorous 7-8); ACSM uses 6-20 (vigorous 14+).
3. Weeks 1-2: moderate. `vo2-stair-moderate`, `vo2-brisk-walk-intervals`, 1 session/day, 3 days/week.
4. Weeks 3-4: add a 20-30 s fast bout (`vo2-fast-march` or stair climb at "a few words" pace), 2 per day, 1+ hours apart.
5. Weeks 5-8: up to 3 bouts/day of 20-60 s (`vo2-stair-burst`, level 3), 3 days/week. The 3 d/wk x 6 weeks structure comes from Jenkins 2019, Allison 2017 and Little 2019; the Boreham ascent ramp (1 to 5 ascents/day) is the only sourced progression and was borrowed only for the stair ramp. Exact week-by-week counts are app-chosen.
6. Cap: at most 3 vigorous bouts/day (app-chosen, matches the trials' 3/day). Never stack bouts back-to-back; rest at least 1 hour apart.
7. Self-check, every 4 weeks: the 30-s sit-to-stand (`vo2-self-check-sts30`). Label: "leg function, not VO2". Optional second check: "can I hold the same brisk pace and still talk?" (talk test). Do not output a VO2 estimate from the app.
8. Stop rule: any warning sign above ends the session; show "do not continue today; if it does not settle, seek urgent care".
9. Copy: never "boost VO2max in 20 s". Use "build fitness gradually" and state that effects take weeks and vary between people.

---

## B. Reset breaks (5 items; evidence honestly labelled)

Cyclic sighing already exists in the app; no new breathing entry was added.

| Entry | Evidence | Label |
|---|---|---|
| `reset-move-and-shake`: stand, shake out, sit differently | Slater 2019 editorial (JOSPT 49(8):562-564, search snippet only): no strong evidence for a single best sitting posture. Micro-breaks reduce fatigue (d=.35) and raise vigor (d=.36) in Albulescu 2022 (repo notes), with no reliable performance gain. | OPINION (posture), weak MEASURED (micro-break) |
| `reset-window-gaze`: 40-60 s look out of window, ideally at greenery | Lee 2015 J Environ Psychol, n=150 students, 40 s green roof vs concrete roof, fewer omission errors (search snippet only; single lab study; unverified). A 2022 40-s nature-view study (PMID 35548523) found no attention-performance gain. | weak MEASURED |
| `reset-mini-pmr`: ~75 s tense-release | Evidence is multi-week PMR programmes, mostly in patients (Donato 2026, 31 RCTs, n=2277; sleep SMD -1.74, anxiety SMD -1.11; I2 83-94%). 75-s desk dose is unproven. | OPINION for the dose |
| `reset-cold-face`: cool water on face 20-30 s (optional) | Richer 2022 Sci Rep, n=28 lab, cold face test after a stress task: faster heart-rate recovery and lower cortisol response. Walther 2021 (n=24+24): hypertensives lacked the HR drop. A sink splash is not the lab protocol. | weak MEASURED; cautions for heart-rhythm problems, hypertension, Raynaud's |
| `reset-mindful-minute`: 60 s attention reset | Workplace mindfulness: multi-week programmes (a "56-study meta-analysis, g 0.32-0.77" figure was removed, unverified). Balban 2023 used mindfulness as the comparator (+1.22 PANAS vs +1.89 for cyclic sighing). One minute is unproven. | OPINION for the dose |

Items I considered and did not add: box breathing and 4-7-8 (evidence is thinner than cyclic sighing, see 03-interruptions-breathing.md), "cold shower" (outside the office scope).

---

## C. Eyes (3 items; 2 evidence-labelled weak, 1 opinion)

| Entry | Evidence | Label |
|---|---|---|
| `eyes-screen-setup-check` | AOA (page read): screen 20-28 in from the eyes, 15-20 degrees (~4-5 in) below eye level, avoid glare, annual eye exam. TFOS Lifestyle 2023 (abstract read): optimizing the work environment, improving blinking, regular breaks may help; correct refractive error; interventions in general not well established. | OPINION / expert consensus |
| `eyes-complete-blink-pause` | AAO (page read): ~15 blinks/min vs 5-7 at screens. Xu 2025 npj Digit Med (abstract read): n=40, DRY EYE DISEASE patients, 30 days, randomized vs none, app blink training improved blink behaviour and ocular surface measures. No trial in healthy workers. | weak MEASURED (patients) |
| `eyes-near-far-focus` | None in adults. AOA does not recommend specific eye exercises; Rawstron 2005 SR: supported mainly for convergence insufficiency, "no clear scientific evidence" for asthenopia. Recommend the owner decides whether to ship an opinion-only item. (unverified in the verification round) | OPINION, may drop |

Not adding, with reasons:
- **Bates-method eye exercises** ("palming/sunning/swinging" to improve sight): no evidence of benefit; eye exercises for myopia have "limited to no efficacy" (Lin 2024, 11 studies, n=921, children, abstract read). Excluded. The existing `eye-palming` entry should be kept only as a relaxation break and must not carry any acuity claim (outside this task's scope to edit).
- **Blue-light glasses**: not effective for visual fatigue (Singh 2022, 45 RCTs, n=4497; TFOS 2023). Not added.
- **Outdoor time for myopia**: cluster RCT in 1903 six-year-olds, +40 min outdoors/day cut 3-year myopia incidence from 39.5% to 30.4% (He 2015 JAMA, abstract read); meta-analysis of children 6-16 (Li 2024, n=12,922). Children only; no adult transfer shown. Not added as an eye item; `reset-window-gaze` is not marketed as myopia prevention.
- 20-20-20: Johnson & Rosenfield 2023 (Optom Vis Sci, n=30 young subjects, 40-min tablet task, 20-s breaks every 5, 10, 20 or 40 min; abstract read): did not change symptoms (P=.70), reading speed (P=.93) or accuracy (P=.55). Talens-Estarelles 2022/2023 (n=29) is a single-group study without a control. The rule has no controlled support. The authors say the results do not support 20-s breaks as a treatment for digital eye strain. See "Findings that affect the existing catalog".

---

## D. Variations for progression and variety

### D1. Family and level assignments for ALL entries (existing + new)

Level 1 = easiest. "Same level" means variety, not progression. New ids are in `09-new-entries.json`; existing ids are untouched in `02`.

| Family | Level 1 | Level 2 | Level 3 |
|---|---|---|---|
| calf-raise | `calf-raises` (existing) | `calf-raise-single-leg`, `calf-raise-slow-eccentric`, `calf-raise-bent-knee` | (single-leg slow lowering was not added) |
| shin-raise | `shin-toe-raise` | - | - |
| squat | `mini-squat`, `chair-sit-to-stand` (existing) | `bodyweight-squat`, `sumo-squat` | `split-squat-static`, `slow-tempo-squat`, `squat-to-calf-raise` |
| wall-sit | `wall-sit-shallow` | `wall-sit` (existing; "2 x 20-30 s", 90 degrees max) | - |
| push-up | `wall-push-up` | `desk-push-up` (existing), `desk-push-up-wide`, `desk-push-up-narrow` | `desk-push-up-slow`, `floor-push-up` |
| hip-abduction | - | `standing-hip-abduction` | - |
| glute | `glute-squeeze-standing` | - | - |
| knee-raise | `standing-knee-raise` | - | - |
| balance | `single-leg-balance-support` | - | `single-leg-balance-free` |
| wall-push-hold | `wall-push-hold` | - | - |
| vo2-stairs | `vo2-stair-moderate` | - | `vo2-stair-burst` |
| vo2-walk | `vo2-brisk-walk-intervals` | - | - |
| vo2-inplace | - | `vo2-fast-march` | `vo2-squat-calf-burst` |
| vo2-check | `vo2-self-check-sts30` | - | - |
| existing cardio (not new) | `march-in-place` (level 1), `walk-5-min` (level 1) | `stair-climb` (existing; mixed pace, levels 2-3) | - |

### D2. Progression rule

ACSM 2009 position stand (abstract read): for novices, use loads of 8-12 RM; "2-10% increase in load be applied when the individual can perform the current workload for one to two repetitions over the desired number"; 2-3 d/wk; 1-2 s concentric and 1-2 s eccentric. App adaptation (APP-CHOSEN, not tested): when a user rates the current variation "easy" on 3 consecutive snacks, suggest the next level in the same family; if they report pain or an unsteady feel, step back one level. Never suggest more than one level jump at a time.

### D3. Sources and honesty about each family

- **NHS strength exercises** (page read): sit-to-stand 5 reps ("slower is better"), mini-squats 5, calf raises 5, sideways leg lift 5 each leg, wall press-up "3 sets of 5 to 10 reps"; use a stable, wheel-free chair; build up slowly. Everything above 5 reps in the entries is app-chosen.
- **Push-up ordering** (Ebben 2011, J Strength Cond Res, n=23, abstract read): hands-elevated and knee push-ups produced lower peak ground reaction force than a regular push-up, feet-elevated higher. Used for ordering only; I did not quote percentages of body mass because they are not in the abstract.
- **Calf variations**: the bent-knee soleus raise is based on the clinical heel-raise test conventions (Hebert-Losier 2011, n=17, test-method paper), not on a training trial. Slow lowering is a tempo variant; the Alfredson/Silbernagel protocols (Habets 2021, n=40, patients with Achilles tendinopathy) are rehab, not a desk dose.
- **Balance**: Sherrington 2019 Cochrane (108 RCTs, 23,407 people aged 60+, mean 76; falls rate ratio 0.77) supports balance plus strength programmes in OLDER adults. Springer 2007 (n=549): single-leg stance time falls with age. For office workers: variety/proprioception only, always with a fixed support.
- **Wall sit and isometric holds**: Jones 2026 (J Hypertens, n=62 healthy, mean 27 y, abstract read): holding a wall sit or plank to volitional fatigue pushed diastolic BP above 115 mmHg in 97-98% after ~50 s, no adverse events. Silva 2024 (n=17): 2-min wall squats every 30 min had no overall effect on BP or popliteal FMD. Inder 2016 (11 RCTs, n=302): isometric TRAINING lowers resting BP by 5.2 mmHg SBP, but that is multi-week training, not a break. Design: holds capped at 10-20 s (app-chosen), always "keep breathing", hypertension or heart disease means ask a clinician first. This is not a claim that wall sits are dangerous for healthy people.
- **No source found** (marked in the entries, not borrowed from WHO): toe raises, sumo squat, static split squat, squat-to-calf-raise, wide/narrow hand variants, glute squeeze, standing knee raise, wall push hold. WHO/CDC class-level muscle strengthening (2+ days/week) is the only support.
- **Excluded**: chair-supported push-ups (stability risk: wheeled or tipping chair; only acceptable with a non-wheeled chair braced against a wall, otherwise use the wall or desk). The floor push-up is included as optional and flagged not office-friendly (office_friendly 1).

---

## Findings that affect the existing catalog (now applied in 02)

1. **`twenty-twenty-twenty`** says a "Johnson & Shi" trial could not be located. The trial is Johnson & Rosenfield 2023 (Optom Vis Sci, PMID 36473088): n=30, crossover, 20-s breaks every 5/10/20 min vs none; no effect on symptoms (P=.70), reading speed (P=.93) or accuracy (P=.55). It is the only controlled test found, and it is null. `evidence_level` stays "weak", with this null result added in 02, and the rule is described as a habit prompt, not a treatment.
2. **`wall-sit`**: add the Jones 2026 finding and the short-hold cap in the line above; the existing contraindications already cover hypertension.
3. **Allison/Jenkins attribution**: any text elsewhere in the repo that describes "Jenkins 3x20 s" is wrong. Jenkins is 3 vigorous ascents of 60 steps per day; 3x20 s is Allison 2017 (single-session) and Little 2019 (cycling snacks).
4. **BJSM meta-analysis definition**: "bouts of 5 min or less" (abstract), not "5 min or more" (search summary).

## Gaps and decisions for the owner

- No VO2 trial of in-place desk bursts exists; the three desk-burst entries are labelled extrapolations.
- PAR-Q+ question count and scoring not verified. ACSM 2015 full text not read; the algorithm text used is from a secondary summary (IDEA).
- `eyes-near-far-focus` and `reset-mindful-minute` are opinion-level; owner decision whether to ship.
- Cold-face reset is optional and contraindication-heavy; consider leaving it out of the default rotation.
- Level numbers for wide/narrow push-up hands are variety, not progression; there is no source ordering them.
- Wan/Fyfe reviews not located.

---

## Self-check: every number cited, with source and reading status

Status key: **A** = abstract read (Europe PMC record); **P** = page read via fetch tool summary; **S** = search snippet only; **R** = repo notes (not re-read).

| Number | Value | Source | Status |
|---|---|---|---|
| Jenkins n per arm; stairs | 12; 3 flights, 60 steps; 3/day, 1-4 h apart, 3 d/wk, 6 wk; P=0.003 | Jenkins 2019 | A |
| Allison VO2peak | +12% (~1 MET, n=12, P=0.002); +7% (n=11, P=0.01); n=31 women | Allison 2017 | A |
| Little 2019 | ~4% vs ~6%; n=12 and 16; 3x20 s cycling; 1-4 h; 6 wk | Little 2019 | A |
| Boreham 2005 | n=15 (8/7); VO2max +17.1%; 1 to 5 ascents/day; 199 steps; 90 steps/min; ~2 min; 5 d/wk; 8 wk | Boreham 2005 | A |
| Rodriguez meta | 11 RCTs; n=414; g=1.37 (0.58-2.17); I2=71.4%; k=6; moderate certainty; 4-12 wk; compliance 91.1%, adherence 82.8% | Rodriguez 2025/26 BJSM | A |
| SMS meta | 12 RCTs + 2 non-RCTs; n=483; SMD 1.43 (0.61-2.25) | SMS 2025 | A |
| Jones scoping | 32 studies | Jones 2024 | A |
| Babir 2026 | n=69; mean age 58; 4x1 min; 5+ d/wk; 12 wk; RPE 5.7; HR 73%; +1.9 reps (0.3-3.4) | Babir 2026 | A |
| Stamatakis (exact HRs not retrieved) | n=25,241; 852 deaths; 6.9 y; 3 bouts/day; 38-40%; 48-49%; 4.4 min/day; 26-30%; 32-34%; mean age 61.8 | Stamatakis 2022 | A |
| Ahmadi | n=71,893; 5.9 y; ~15 min/week HR 0.82 (0.75-0.89); 27 bouts/week HR 0.73 (0.62-0.87) | Ahmadi 2022 | A |
| Islam 2022 | bouts of 1 min or less; Exerc Sport Sci Rev 50(1):31-37 | Islam 2022 | S |
| ACSM regular exercise | 30 min, 3 d/wk, 3 months | ACSM 2015 via IDEA | P |
| Vigorous definition | 60% HRR, RPE 14 (6-20) | IDEA / ACSM | P |
| CDC intensity | RPE 7-8 vigorous, 5-6 moderate (0-10) | CDC | P |
| NHS doses | 5 reps sit-to-stand, mini-squat, calf raise, sideways leg lift; 3 sets of 5-10 wall press-up | NHS strength page | P |
| ACSM 2009 | 8-12 RM; 2-10%; 1-2 reps; 2-3 d/wk; 1-2 s up/down | ACSM 2009 | A |
| Ebben 2011 | n=23 | Ebben 2011 | A |
| Hebert-Losier | n=17; 0 and 30 degrees | HL 2011 | A |
| Habets 2021 | n=40 | Habets 2021 | A |
| Sherrington | 108 RCTs; 23,407; mean age 76; RaR 0.77 (0.71-0.83) | Cochrane 2019 | A |
| Springer 2007 | n=549 | Springer 2007 | A |
| Jones 2026 wall sit | n=62; mean 26.7 y; 97-98%; DBP >115; ~50 s | Jones 2026 | A |
| Silva 2024 | n=17; 2 min every 30 min; 180 min | Silva 2024 | A |
| Inder 2016 | 11 RCTs; n=302; SBP -5.20 (-6.08 to -4.33) | Inder 2016 | A |
| Lee 2015 | n=150; 40 s | Lee 2015 | S (unverified) |
| Richer 2022 | n=28 | Richer 2022 | A |
| Walther 2021 | n=24+24; 2 min | Walther 2021 | A |
| Donato PMR 2026 | 31 RCTs; n=2277; SMD -1.74; -1.11; I2 83-94% | Donato 2026 | A |
| Workplace mindfulness | (removed: 56 studies; g 0.32-0.77 not verified) | - | unverified |
| Balban 2023 | n=108 randomized (24 mindfulness / 30 cyclic sighing / 21 box / 33 hyperventilation; 100 may be analysed completers, unverified); +1.22 vs +1.89 PANAS; 5 min x 28 days | Balban 2023 | A (verified) |
| Albulescu 2022 | d=.35 fatigue; d=.36 vigor | Albulescu 2022 | R |
| AOA | 20-28 in; 15-20 degrees; 4-5 in | AOA | P |
| AAO | 15/min vs 5-7/min | AAO | P (research/08) |
| Xu 2025 | n=40; 30 days | Xu 2025 | A |
| Johnson & Rosenfield | n=30; 5/10/20/40 min; P=.70, .93, .55 | OVS 2023 | A |
| Singh 2022 | 45 RCTs; n=4497 | Singh 2022 | A |
| Lin 2024 | 11 studies; n=921 | Lin 2024 | A |
| He 2015 | 1903 (952+951); 40 min; 30.4% vs 39.5% | He 2015 | A |
| Li 2024 | n=12,922; ages 6-16 | Li 2024 | A (cited in text only) |
| Rawstron 2005 | 43 refereed studies | Rawstron 2005 | A (number not used in text) |
| Zhu 2025 preprint | n=31; 3 groups | Zhu 2025 | A (preprint; no peer review) |
| Stork 2024 | n=14; 10 of 14 preferred snack | Stork 2024 | A |
| Qiu 2026 | n=23; 4 weeks | Qiu 2026 | A |
| App-chosen (NOT sourced) | all rep/hold counts above 5, 3 s lowering, hold caps of 10-20 s, 3 bouts/day cap, week-by-week VO2 ramp, 3 consecutive easy snacks rule | this document | OPINION |
