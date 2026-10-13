# 01 - Micro-breaks, sitting interruption, exercise snacks, hydration: empirical evidence

Corrections from the adversarial verification (07, 08, 10) are applied in this file.

Compiled 2026-10-13. Method: abstracts and metadata retrieved via the Europe PMC REST API and publisher pages (PubMed, PMC, Springer, Wiley/EFSA, WHO IRIS and Diabetes Care returned 403/cookie walls/CAPTCHA to the fetch tool). Therefore:

- **[A] = abstract read directly in this session** (numbers below are quoted from it).
- **[M] = from my background knowledge, NOT re-verified here**. Treat as unverified until checked against the paper.
- **[P] = press/secondary source only.**
- "Measured" = empirical data; "opinion" = guideline consensus, narrative review or definition.
- Note: a few search hits are dated 2026 (the retrieval index includes them); they are cited as retrieved and not independently cross-checked.

---

## 1. Micro-breaks during computer work

### 1.1 Albulescu et al. 2022, PLOS ONE - meta-analysis (measured) [A]
- URL: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0272460 (published 2022-08-31)
- Design: systematic review + random-effects meta-analysis of experimental/quasi-experimental studies; 22 independent samples from 19 publications; N = 2,335.
- Definition: micro-break = short discontinuity of work "no longer than 10 minutes".
- Effect sizes (Cohen's d):
  - Vigor d = 0.36, 95% CI [.16, .55], k = 9, n = 913 (significant).
  - Fatigue (reduction) d = 0.35, 95% CI [.19, .50], k = 9, n = 803 (significant).
  - Overall performance d = 0.16, 95% CI [-.04, .37], p = .116, k = 15, n = 1,132 (**NULL**).
  - By task type: cognitive d = -0.09 (null); creative d = 0.38, p = .006; clerical d = 0.56, p = .047 but only 2 studies.
- Moderator: longer breaks predicted better performance (b = .07, p = .006, R2 = .34). Activity type could not be analysed (too heterogeneous). Setting/participant type/control group did not moderate vigor/fatigue.
- Caveat: break "duration" correlation is between studies, not a randomised comparison. I read only the first ~100k of 146k characters of the page; the discussion/limitations were not read.

### 1.2 McLean et al. 2001, Applied Ergonomics - "Computer terminal work and the benefit of microbreaks" (measured, lab/field) [A]
- DOI 10.1016/s0003-6870(00)00071-5 (June 2001). n and exact break lengths NOT in the abstract I retrieved. Design (verified): microbreaks at own discretion vs every 20 min vs every 40 min, compared with no breaks; outcomes were EMG (mean power frequency cycling), discomfort and productivity. No break length is stated; do not quote one.
- Result (abstract): microbreaks reduced discomfort in all body areas studied, "particularly when breaks were taken at 20 min intervals", with no productivity loss.

### 1.3 Henning et al. 1997, Ergonomics - "Frequent short rest breaks from computer work" (measured, field) [A]
- DOI 10.1080/001401397188396 (Jan 1997). Two field sites, 73 and 19 computer operators; scheduled short breaks, with or without stretching.
- Result: productivity, eye, leg and foot comfort improved **when the short breaks included stretching exercises**; benefits varied by site and by compliance. Exact break length (~3 min every hour [M]) not verified.

### 1.4 Galinsky et al. 2007, Am J Ind Med - supplementary breaks, data entry (measured, field follow-up) [A]
- DOI 10.1002/ajim.20472 (July 2007). Conventional: two 15-min breaks/day. Supplementary: those plus four 5-min breaks per day (the paper gives only the count of 4 per day, not a schedule such as hourly). Half also stretched.
- Result: discomfort and eyestrain significantly lower with supplementary breaks; productivity maintained despite less work time; data-entry speed was significantly faster with supplementary breaks. Stretching compliance only 25-39%, so the stretching benefit could not be assessed. n completing = 51 (21 stretch, 30 no stretch).
- Galinsky 2000 (Ergonomics, original NIOSH study) not retrieved separately.

### 1.5 Counterpoint summary
- Performance benefit is NOT established overall (Albulescu null overall, negative point estimate for cognitive tasks). Defensible claim: micro-breaks reduce fatigue and boost vigor and do not hurt output; they do not reliably raise it.
- Compliance with prescribed exercise during breaks is low in the field (25-39%), which matters for an app: friction must be tiny.

---

## 2. Breaking up prolonged sitting: metabolic effects

All of these are **acute, 1-day laboratory crossover trials** (surrogate outcomes), not long-term health outcomes.

### 2.1 Dunstan et al. 2012, Diabetes Care (measured RCT crossover) [A]
- DOI 10.2337/dc11-1931 (May 2012); PMC3329818.
- n = 19 overweight/obese adults aged 45-65. Three 7-h conditions: uninterrupted sitting; sitting + **2-min light-intensity walking every 20 min**; sitting + **2-min moderate-intensity walking every 20 min**. 75 g glucose + 50 g fat drink after an initial 2-h sit; 5-h sampling.
- Result: both break conditions significantly reduced postprandial glucose and insulin vs sitting. Verified against PMC full text: glucose iAUC lowered 24-30% (6.9 sitting -> 5.2 light, 4.9 moderate); insulin iAUC lowered 23% (828.6 -> 633.6 light / 637.6 moderate pmol/L.h; the earlier -26% moderate figure was wrong); walking speeds 3.2 km/h (light) and 5.8-6.4 km/h (moderate).

### 2.2 Diaz et al. 2023, Med Sci Sports Exerc - dose-response (measured RCT crossover) [A]
- DOI 10.1249/mss.0000000000003109, PMID 36728338 (e-pub 2023-01-12; May 2023 issue).
- n = 11 middle/older-age adults. Five 8-h conditions: control; every 30 min x 1 min; every 30 min x 5 min; every 60 min x 1 min; every 60 min x 5 min. Light walking.
- Result: glucose iAUC significantly attenuated **only** for 5 min every 30 min (press reports -58% vs sitting [P]; not verified in abstract). All doses lowered systolic BP vs control; largest reductions for 1 min/60 min and 5 min/30 min.
- Caveat: n = 11, very small; "1 min every 60 min" already gave BP benefit. Press source: https://www.cuimc.columbia.edu/node/25711 (not opened).

### 2.3 Buffey et al. 2022, Sports Medicine - systematic review + meta-analysis (measured) [A]
- DOI 10.1007/s40279-022-01649-4 (2022-08-01). 7 acute randomised crossover trials (>=3 arms), mostly overweight/obese adults.
- Standing breaks vs sitting: glucose Delta = -0.31 (95% CI -0.60, -0.03); no effect on insulin or SBP.
- Light walking vs sitting: glucose Delta = -0.72 (CI -1.03, -0.41); insulin Delta = -0.83 (CI -1.18, -0.48).
- Walking vs standing: glucose Delta = -0.30 (CI -0.52, -0.08); insulin Delta = -0.54 (CI -0.75, -0.33). **No effect of either on SBP** (note: conflicts with Diaz on BP; only 3 studies pooled for SBP).
- Conclusion: walking is superior to standing; free-living/long-term effects unknown.

### 2.4 Other (retrieved by search, abstracts only)
- Exercise-snack glucose/insulin in obesity, Front Nutr 2025-11, DOI 10.3389/fnut.2025.1708301: glucose iAUC SMD = -0.49 (95% CI -0.85, -0.14); larger with <=30-min frequency and <=3-min bouts [A].
- Umbrella review + de novo meta-analysis, Metabolites 2026-08, DOI 10.3390/metabo16090635: analyses "underpowered to establish small-to-moderate pooled effects" of exercise snacks on acute glucose/insulin [A]. **Counterpoint**: the evidence is not robust.
- Hourly 3-min exercise breaks in office workers (BMC Public Health 2026-02, DOI 10.1186/s12889-026-26484-4): improved fasting glucose, postprandial glucose and insulin resistance vs controls; adherence 82% [A, abstract fragment; design/n not retrieved].
- Bailey & Locke 2015 and Duvivier 2013: not retrieved; omitted from claims.

---

## 3. Exercise snacks

- Definition (Islam, Gibala, Little 2022, Exerc Sport Sci Rev, DOI 10.1249/jes.0000000000000275) [A]: "isolated <=1-min bouts of vigorous exercise performed periodically throughout the day"; hypothesis paper ("small proof-of-concept studies"), opinion/review. Definitions elsewhere are looser (the 2025 scoping review, Sports Med Open, DOI 10.1186/s40798-025-00829-6: 33 studies, 1,118 participants, mean prescribed intensity 76.9% HRmax).
- Jenkins et al. 2019, Appl Physiol Nutr Metab, DOI 10.1139/apnm-2018-0675 [A]: RCT, sedentary young adults, n = 12 per group; 3 bouts/day of vigorous ascent of 3 flights (60 steps), separated by 1-4 h, 3 days/week for 6 weeks vs control. VO2peak higher in climbers (P = 0.003); "absolute increase was modest". Null companion: 3 x 60-s stair bouts did not change glycaemia in T2D (n = 7, p = 0.13, DOI 10.1139/apnm-2018-0135).
- Little et al. 2019 sprint snacks, Eur J Appl Physiol, DOI 10.1007/s00421-019-04110-z [A]: sprint snacks spread through the day raised CRF similarly to traditional SIT.
- Stamatakis et al. 2022, Nature Medicine, DOI 10.1038/s41591-022-02100-x [A]: **observational** (UK Biobank), 25,241 non-exercisers (mean age 61.8), wrist accelerometer, 6.9 y follow-up, 852 deaths. VILPA at median 3 bouts/day (1-2 min each) associated with 38-40% lower all-cause and cancer mortality, 48-49% lower CVD mortality; median 4.4 min/day associated with 26-30% / 32-34% lower. Near-linear. Caveat: association, not causation (reverse causation/healthy-mover bias possible); device-inferred bouts, not prescribed exercise.
- Meta-analyses of exercise snacks (2025-26) [A, abstracts only]: VO2max improved (SMD 0.63 [Front Cardiovasc Med, 10.3389/fcvm.2025.1643153]; g = 1.04, moderate certainty [J Nutr Health Aging, 10.1016/j.jnha.2026.100940]); lean mass +0.52 kg (10.3389/fspor.2025.1679563); no effects on body fat/weight in several; cholesterol effects inconsistent between reviews. Resistance exercise snacks improved muscle mass in female university employees (Brandt 2024, 10.3389/fpubh.2024.1347825; abstract fragment only).
- Wan/Fyfe 2024 reviews: **not located**; not cited.
- Bodyweight squats/push-ups at the desk: no trial found in this session with squats/push-ups as the snack specifically at a desk, only analogous "resistance snacks" (above) and general stair/sprint snacks. Inference from resistance-snack and stair data, not direct evidence.

---

## 4. WHO 2020 guidelines (opinion/consensus based on systematic reviews) [A abstract]
- Bull et al., Br J Sports Med, DOI 10.1136/bjsports-2020-102955 (Dec 2020); document https://www.who.int/publications/i/item/9789240015128 (25 Nov 2020).
- Adults: 150-300 min/week moderate, or 75-150 vigorous, or equivalent combination; regular muscle-strengthening for all age groups ([M] adults: at least 2 days/week, moderate or greater intensity, all major muscle groups); "reducing sedentary behaviours is recommended across all age groups", but "evidence was insufficient to quantify a sedentary behaviour threshold".
- Messages: "some physical activity is better than none" / "all physical activity counts" (fact sheet: "any amount of physical activity is better than none; all physical activity counts; all age groups should limit the amount of time being sedentary"). Guideline wording (verified in Bull 2020 full text): "Replacing sedentary time with physical activity of any intensity (including light intensity) provides health benefits." "Every move counts" is a WHO campaign slogan and does not appear in the Bull 2020 BJSM text.
- Implication: there is NO official "stand every X min" number; any interval the app chooses is app policy informed by trials, not WHO.

---

## 5. Hydration

- 8x8 myth: Valtin 2002, Am J Physiol Regul Integr Comp Physiol, DOI 10.1152/ajpregu.00365.2002 [A]. Narrative review: "No scientific studies were found in support of 8 x 8". Healthy adults in temperate climate/sedentary need not drink that much; caffeinated drinks can count; osmoregulation is precise; more is needed in vigorous work, heat, some diseases. Opinion/review.
- EFSA 2010 DRV for water [AI values confirmed via secondary index of the opinion; assumes moderate temperature, PAL 1.6]: Adequate Intake total water 2.5 L/day men, 2.0 L/day women (from drinking water, all beverages and food moisture; the "food ~20%" and 2.0 / 1.6 L beverage figures are unverified and not to be quoted); AI based on observed intakes and urine osmolality. This is a total-intake reference, not an instruction to drink that volume.
- Cognition: Wittbrodt & Millard-Stafford 2018, Med Sci Sports Exerc, DOI 10.1249/mss.0000000000001682 [A, snippet]: meta-analysis of 33 studies (280 effect sizes); dehydration impairs cognition (attention, executive function, motor coordination) mainly when deficits exceed ~2% body mass loss. Caveat: these deficits come from exercise/heat/fluid restriction, not from a normal office day. Mild-dehydration effects at 1-2% in a sedentary office are weaker/less certain (not established by anything retrieved here).
- Older adults: Edmonds 2021 review (18 papers, 33,707) suggests dehydration is associated with worse outcomes and possibly cognition, limited evidence (10.1016/j.archger.2021.104380) [A].
- Water-reminder frequency: **no trial found** that tests reminder intervals for office workers. The interval is a design choice. Thirst is a reliable trigger in healthy adults [M, per Valtin].
- Caveats: people on medical fluid restriction (heart failure, advanced kidney disease, some hyponatremia/SIADH, dialysis) must follow their clinician; app should make reminders optional, default off or "gentle", and never encourage large volumes. Overdrinking (hyponatremia) is rare but real.

---

## 6. Standing/walking breaks vs standing desks; Cochrane (Shrestha 2018)
- Shrestha et al., Cochrane, DOI 10.1002/14651858.CD010912.pub5, PMID 30556590 (2018-12-17) [A]. 34 studies, 3,397 participants, high-income countries, evidence searched to Aug 2017.
  - Sit-stand desks: about -100 min/day (95% CI -116 to -84, 10 studies, low-quality evidence) at short term (up to 3 months); about -57 min/day at medium term (2 studies).
  - Short breaks: about -40 min/day, from ONE study that compared them with two 15-min long breaks (low quality); not a general finding for 1-2 min every 30 min.
  - Computer prompts: no significant effect at short term (-14 min/day); about -55 min/day at medium term, from ONE study.
  - Walking strategies: no significant effect.
  - Certainty: low to very low; inconsistent effects; no health-outcome conclusions. Recommends larger cluster RCTs.
- Computer-prompt SR/MA 2025 (Int J Behav Nutr Phys Act, DOI 10.1186/s12966-025-01781-0) exists; only the intro sentence retrieved; results not read.
- Buffey 2022 (above): walking breaks beat standing for glucose/insulin; standing helps glucose a little but not insulin or BP. So a standing desk alone is weaker than walking breaks.

---

## 7. Neck/back pain in office workers
- Chen et al. 2018, Phys Ther, DOI 10.1093/ptj/pzx101, PMID 29088401 [A via publisher page summary, which is a model digest: verify numbers]: 27 RCTs; neck/shoulder strengthening exercise medium effect SMD 0.59 (95% CI 0.29-0.89) in symptomatic workers (moderate-quality evidence); general fitness SMD 0.43 (low to moderate); stretching and Qigong not significant; education no effect; supplementary work breaks effective vs conventional breaks; ergonomics low quality. (Participant total "about 4,600" in the digest is unverified.)
- Louw et al. 2017, S Afr J Physiother, DOI 10.4102/sajp.v73i1.392 [A]: meta-analysis, strengthening exercise vs no exercise reduced neck pain with clinically significant difference; no effect on QoL.
- Andersen et al. 2011, Pain, DOI 10.1016/j.pain.2010.11.016 [A]: RCT, 174 women + 24 men with frequent neck/shoulder pain, elastic-tubing resistance training 2 or 12 min/day, 5 days/week, 10 weeks vs control; pain decreased 1.4-1.9 points (0-10) and tenderness 4.2-4.4 vs control; "as little as 2 minutes of daily progressive resistance training" gave clinically relevant effects.
- Andersen et al. 2012, Br J Sports Med, DOI 10.1136/bjsports-2011-090813 [A]: cluster RCT, 447 office workers, supervised high-intensity strength training 1x60, 3x20 or 9x7 min/week for 20 weeks; neck pain fell 1.14 / 1.88 / 1.35 points (1x60 / 3x20 / 9x7) from baseline 3.2 (pain >=3 subsample n = 256 of 447; the 447 included workers with and without pain), so 9 x 7 min/week (short sessions) also reduced neck pain. DASH disability fell only in the 1x60 and 3x20 groups, not in 9x7. Supervised, high intensity (not the same as a bodyweight desk routine).
- BMJ Open 2022 review (DOI 10.1136/bmjopen-2021-054288) [A]: 7 RCTs, 967 participants, workplace exercise reduces MSK pain/disorders in office workers; high risk of bias.
- Micro-exercise meta-analysis, Sci Rep 2026 (DOI 10.1038/s41598-026-56061-z) [A]: 19 RCTs, n = 2,732, reduced neck/shoulder pain; certainty moderate to very low (heterogeneity, publication bias).
- Shariat 2018: Braz J Phys Ther 2018, DOI 10.1016/j.bjpt.2017.09.003 [A: abstract fragment, design only]: RCT comparing stretching exercise, ergonomic modifications, combined, and control for neck/shoulder/low-back discomfort; results not read, not asserted. A separate Shariat trial in Work 2017 (DOI 10.3233/wor-172508) reports an office exercise programme significantly reduced neck, shoulder and low-back pain (p < 0.05) [A, abstract; n not retrieved].
- Prevention vs treatment: most of these trials enroll people who already have symptoms; evidence that exercise PREVENTS first onset in asymptomatic workers is thinner. Strength > stretching in Chen.

---

## RECOMMENDED SCHEDULE (derived from the evidence)

Design principle: the evidence supports frequent, very short, easy-to-comply interruptions (fatigue/vigor, discomfort, acute metabolic) plus a few real strength bouts per week for neck/shoulder pain. It does not support precise intervals; the numbers are app policy chosen inside the tested ranges.

| Item | Default | Evidence |
|---|---|---|
| Micro-break (look away, shoulder rolls, neck/wrist mobility, breathing) | 30-60 s every 20-30 min (user can lengthen to 3-5 min/hour) | McLean 2001 (best discomfort relief at 20-min spacing, no productivity loss); Albulescu 2022 (fatigue d = .35, vigor d = .36, longer breaks better); Galinsky 2007 (four 5-min supplementary breaks per day reduce discomfort). Don't promise performance gains (overall d = .16 ns). |
| Walking/movement break | 1-2 min light walking every 30 min as the low-friction default; offer 5 min every 30 min as "glycemic mode" for people who opt in | Dunstan 2012 (2 min/20 min), Diaz 2023 (only 5 min/30 min cut glucose; even 1 min/60 min lowered BP), Buffey 2022 (walking > standing), Shrestha 2018 (sit-stand desks reduce sitting; the evidence for short-break protocols and prompts is single-study and low certainty). |
| Exercise snack (bodyweight squats, push-ups, brisk stairs, 20-60 s hard) | 2-3 per workday, >=1 h apart; skip if user opts out of vigorous effort | Islam 2022 definition; Jenkins 2019 (3/day, 3 days/week modest VO2peak gain); Stamatakis 2022 (observational, ~3 bouts/day of 1-2 min). Squat/push-up specifically unstudied in desk RCTs. |
| Neck/shoulder strength set (e.g., band rows, shoulder-blade squeezes, wall push-ups) | 2-7 min, 3-5 days/week; "9 x 7 min/week" or 2 min daily with a band | Andersen 2011, 2012; Chen 2018 (strength > stretching). |
| 5-min walk | 1-2 per day at natural lulls (post-meal if known) | Dunstan/Diaz; WHO 2020 guideline wording "some physical activity is better than none" ("every move counts" is a campaign slogan, not guideline text). |
| Weekly muscle-strengthening count | Track toward >=2 days/week | WHO 2020 (muscle-strengthening on 2+ days/week at moderate or greater intensity, verified in full text). |
| Water | Optional, default off; if on, 1 gentle prompt every 60-90 min during work hours, tied to a micro-break, with "dismiss, I'm hydrated" and a daily cap | Valtin 2002 (no basis for 8x8), EFSA total water AI (2.0/2.5 L, includes food), Wittbrodt 2018 (effects at >2% deficits). Interval is a design choice, not evidence-derived. Add "fluid-restricted? turn off". |
| Pacing/adaptation | Suppress during meetings/full-screen, snooze 5/15/60 min; never more than ~2 prompts/hour combined | Compliance data: 25-39% (Galinsky 2007), 82% adherence in hourly 3-min program (BMC Public Health 2026; unverified). Fewer, easier prompts maximise adherence (inference). |

Messaging rules: say "may reduce fatigue and discomfort", not "boosts productivity"; no mortality or disease claims from VILPA (observational); show a medical caution (injury, pregnancy, cardiovascular conditions, fluid restriction).

---

## Gaps and verification TODOs
1. Dunstan 2012, WHO 2020 wording and EFSA AI values were checked in the verification round (see 08). Still unverified: Henning 1997, Chen 2018 numbers, Stamatakis 2022 exact HRs/CIs, the 2025-2026 reviews cited above (Front Nutr, Metabolites, BMC Public Health, incl. the 82% adherence figure), Wittbrodt 2018, Valtin 2002 details (unverified).
2. McLean 2001 sample size and Henning 1997 sample sizes and exact break protocols; Galinsky 2000 original paper.
3. Bailey & Locke 2015, Duvivier 2013, Wan/Fyfe 2024 reviews: not located.
4. No RCT on desk squats/push-ups; no trial on water-reminder frequency; no data on whether prompts from an app improve long-term adherence beyond weeks.
5. Chen 2018 totals came from a model-digested page; re-read. Shariat 2018 results not read.
6. Outcomes are mostly acute or short-term surrogates (glucose, BP, discomfort); long-term disease reduction from micro-breaks is not demonstrated.
7. Populations: acute sitting trials are mostly overweight/older adults; generalisation to young healthy workers is uncertain.
8. Several 2025-2026 reviews were read as abstract fragments only; verify before quoting.
