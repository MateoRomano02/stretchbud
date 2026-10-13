# 10 - Verification of the 36 new entries (09)

Date: 2026-10-13. Verifier stance: adversarial. Sources checked via Europe PMC abstract records and fetched pages; "not reached" is stated where true. Output JSON: `09-new-entries.verified.json` (same schema, nothing dropped).

## Verdict counts
CONFIRMED 7, CORRECTED 26, UNVERIFIED 3 (total 36).
- CONFIRMED: vo2-self-check-sts30, reset-move-and-shake, eyes-complete-blink-pause, mini-squat, bodyweight-squat, wall-push-up, standing-hip-abduction.
- UNVERIFIED (do not ship unless the owner accepts opinion-only items): eyes-near-far-focus, shin-toe-raise, glute-squeeze-standing. The last two are low risk but are not variations of a verified parent.
- CORRECTED: all others (see JSON `verification_note`).

## 1. Load-bearing numbers

| Claim | Result |
|---|---|
| Allison 2017 (MSSE, PMID 28009784) | VERIFIED. 31 sedentary women, 3x20 s all-out stairs, 3 d/wk, 6 wk, n=12: VO2peak +12% (~1 MET, P=0.002). One-flight 3x60 s, n=11: +7% (P=0.01). Abstract mentions no control group (pre-post). Single-session sprint design, not spread over the day. |
| Jenkins 2019 (APNM 44(6), PMID 30649897) | VERIFIED: 3 bouts/day, 3-flight 60-step vigorous ascent, 1-4 h apart, 3 d/wk, 6 wk, n=12 per arm, P=0.003, "modest". The abstract gives NO magnitude. "~5%" appears only in a secondary French summary (sci-sport.com): not primary, do not quote. |
| Little 2019 (Eur J Appl Physiol, PMID 30847639) | VERIFIED: 3x20 s cycling, 1-4 h apart, n=12 (snack) vs 16 (SIT); VO2peak ~+4% vs ~+6%, time effect P=0.002, no group difference. NO non-exercise control. |
| Boreham 2005 (BJSM, PMID 16118293) | VERIFIED: 15 women, mean age 18.8, 8 stair vs 7 control; 17.1% VO2max increase relative to controls. |
| BJSM exercise-snack meta-analysis (Rodriguez et al., BJSM 2026;60(2):133-141, PMID 41057224) | VERIFIED with a correction: 11 RCTs, n=414, 69.1% women, snacks <=5 min, >=2/day, >=3 d/wk, >=2 wk; CRF g=1.37 (0.58-2.17), I2=71.4%, k=6 (only 6 of 11 trials), moderate certainty; no effect on BP, lipids, body composition. The md said "pooled analysis of 11 trials" for fitness: wrong, it was 6. |
| Babir 2026 (Diabetes Obes Metab, PMID 42502209) | VERIFIED: n=69, non-insulin-treated T2D, mean age 58 (SD 11), 4x1 min, >=5 d/wk, 12 wk vs low-intensity comparator; 30-s sit-to-stand +1.9 reps (0.3-3.4); the abstract text I retrieved shows no other significant difference (VO2max and HbA1c null per the md; the abstract was truncated in my read of that middle sentence). The md called them "older adults": wrong (mean 58). |
| Stamatakis 2022 (Nat Med, PMID 36482104) | VERIFIED (abstract): observational, 25,241 non-exercisers, mean age 61.8, 6.9 y, 852 deaths; median 3 bouts/day of 1-2 min: 38-40% lower all-cause and cancer mortality, 48-49% lower CVD mortality; 4.4 min/day: 26-30% and 32-34%. Exact HRs and CIs NOT retrieved (Nature page needs cookies). Never show as personal benefit. |
| Johnson & Rosenfield 2023 (Optom Vis Sci, PMID 36473088) | VERIFIED: 30 young subjects, 40-min tablet task, 20 s breaks every 5/10/20/40 min; symptoms P=.70, reading speed P=.93, accuracy P=.55. Authors say results do not support 20-s breaks as a treatment for digital eye strain. |
| Jones 2026 wall sit (J Hypertens, PMID 41252651) | VERIFIED: 62 healthy, 26.7 +/- 8.2 y; plank 97%, wall sit 98% stopped for DBP >115 mmHg after ~50 s (all women, 93-97% men); no SBP limit reached; no adverse events. |
| Others re-read | Ebben 2011 (n=23, hands-elevated and flexed-knee lower GRF), Richer 2022 (n=28), Walther 2021 (24 hypertensive men vs 24), Donato 2026 (31 RCTs, 2277, SMD -1.74/-1.11), Albulescu 2022 (d=.36/.35, performance ns), Xu 2025 (n=40 dry eye), NHS strength page (5 reps; wall press-up 3x5-10), ACSM 2015 abstract. |
| Not verified | Lee 2015 green-roof (a 2022 40-s nature-view study, PMID 35548523, found no attention-performance gain), Zhu 2025 preprint, "56-study workplace mindfulness g .32-.77" (removed), Slater 2019, Islam 2022 definition, Hebert-Losier 2011, Habets 2021, Inder 2016, Sherrington/Springer figures (repo notes). |

Other md errors: "raised VO2peak by roughly 4 to 17%" mixes uncontrolled pre-post designs (Allison, Little) with controlled ones (Jenkins, Boreham); "supervised" is not stated in the abstracts I read.

## 2. Screening (ACSM 2015, PAR-Q+)
- ACSM 2015 (Riebe, MSSE 47(11), PMID 26473759, abstract verified): the model uses (1) current activity level, (2) signs/symptoms and/or known cardiovascular, metabolic or renal disease, (3) desired intensity; risk-factor profiling dropped. Algorithm details (inactive + known disease: clearance before starting even moderate; symptoms: stop and get clearance; inactive and healthy: start light-moderate) come from the IDEA summary and my reading of the algorithm; full text not read. Consequence applied: moderate entries now also carry a "known disease or symptoms: check with a doctor first" line, and the symptom list was completed (palpitations, ankle swelling, claudication, murmur added).
- PAR-Q+: official PDFs blocked (403/404). Confirmed only through search snippets that it asks about a doctor-diagnosed heart condition or high blood pressure, bone/joint problems, and "medically supervised activity only". Question count and wording NOT verified. App text: link to it, do not reproduce.
- What to tell users (ready text): "Ask a doctor before vigorous bursts if you have known heart, kidney or metabolic disease (for example diabetes), high blood pressure or take medicine for blood pressure or a heart condition, are pregnant, have a bone or joint problem exercise could worsen, or have chest, neck, jaw or arm discomfort, breathlessness at rest or with mild effort, dizziness or fainting, palpitations, ankle swelling, or unusual tiredness. If you have not been exercising, start with the moderate entries. Stop and seek care for chest pain, palpitations, dizziness or unusual breathlessness. This is general information, not medical advice."
- The blanket "uncontrolled hypertension" trigger was widened to "high blood pressure or BP/heart medication" (PAR-Q+ logic, conservative).

## 3. Safe VO2 claim for a public README
> "In small trials of previously inactive young adults, a few short, hard stair-climbing or cycling bursts per day (about 20 seconds to 2 minutes each), 3 to 5 days a week for 6 to 8 weeks, improved peak oxygen uptake by a modest amount. A 2026 meta-analysis of 11 randomised trials (414 adults) found a moderate-certainty improvement in cardiorespiratory fitness (6 trials measured it), with large differences between studies. In one real-world 12-week trial in 69 adults with type 2 diabetes (mean age 58), four one-minute vigorous bouts a day did not change estimated VO2max. Large studies linking short bursts of vigorous activity to lower mortality are observational and cannot show cause. One burst does not change your fitness; any change takes weeks of repetition. Desk-only bursts such as marching in place have not been tested for fitness. Ask a doctor first if you have a heart, kidney or metabolic condition, high blood pressure or symptoms during exercise."

Do not say: "raises VO2max", a percentage as personal expectation, mortality numbers as benefit, "supervised", "older adults" for Babir.

## 4. Key entry-level corrections
- vo2-stair-burst: fitness meta-analysis k=6; trials used all-out effort, entry uses submaximal effort (extrapolation); full ACSM symptom list; ask-a-doctor wording for pregnancy and high BP.
- vo2-fast-march and vo2-squat-calf-burst: label 'expert consensus' replaced by 'weak (extrapolation)'; Zhu preprint unverified, do not show.
- reset-cold-face: diving-reflex mechanism stated plainly (slows heart rate); cardiac, fainting, hypertension cautions; sink splash is not the lab protocol; Walther was men only.
- reset-mindful-minute: unverified meta-analysis numbers removed. reset-window-gaze: null later study added. reset-mini-pmr: keep breathing while tensing.
- eyes-screen-setup-check: Singh 2022 (blue-light lenses only) was misused; fixed.
- Labels that implied evidence ('expert consensus', 'weak', 'guideline-backed') on parent-less variations were changed to 'general guidance (variation of <parent>; unverified)'; balance entries relabelled 'weak (older-adult evidence only)'; floor-push-up no longer cites NHS.
- Existing-catalog notes from 09 stand: `twenty-twenty-twenty` is the Johnson & Rosenfield null trial (verified here); `wall-sit` should add Jones 2026.

## 5. Open items
Exact VILPA HRs, PAR-Q+ wording, ACSM full text, Lee 2015, Zhu preprint, Little/Allison control-group status beyond abstracts.
