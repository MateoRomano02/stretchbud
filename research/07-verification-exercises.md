# Adversarial verification of the exercise catalog (30 exercises)

Date: 2026-10-13. Result: 13 CONFIRMED, 11 CORRECTED, 6 UNVERIFIED. Corrected catalog: `02-exercise-catalog.verified.json` (same schema plus `verdict`, `verification_note`; nothing dropped).

## Sources actually read this round

Read in full (primary or near-primary):
- Blanpied et al. 2017 JOSPT neck pain CPG, full text via a university mirror (moodle2.units.it PDF; jospt.org and orthopt.org return 403).
- AAOS OrthoInfo "Therapeutic Exercise Program for Carpal Tunnel Syndrome" (PDF, orthoinfo.aaos.org, read in full).
- CCOHS stretching page; NHS flexibility exercises page; Cambridge CUH neck leaflet; AAO computer-use page (re-read, quotes confirmed).
- AOP report on the Aston 20-20-20 study (design, n, limitations).

Only search-result snippets (not read directly): Mayo office stretches (403 on mayoclinic.org and mayoclinichealthsystem.org, mymlc.com refused connection), ACSM (via ACSM blog/guideline summaries: static stretch 10-30 s, 30-60 s for older adults, 2-4 reps), WHO 2020 Bull et al., Cornell Hedge 3-S, NICE NG59 (group exercise for LBP; no specific desk exercise), Duran 2023 walking breaks. Not obtained: StatPearls McKenzie (reCAPTCHA), Talens abstract itself (PubMed cookie wall, ScienceDirect 403), NHS back/neck pages (404 in the first round; not retried successfully), HSE, Physiopedia, Harvard.

## Verdict table

| # | id | Verdict | Key finding |
|---|----|---------|-------------|
| 1 | chin-tuck | CORRECTED | Removed invented "1-2 cm". CCOHS head glide = 20 counts x 5-10; our 5 x 5 s is app-chosen. Blanpied has NO chin tuck recommendation. |
| 2 | neck-rotation | CONFIRMED | NHS: hold 5 s, 3 per side, exact match. |
| 3 | upper-trap-side-stretch | CONFIRMED | NHS 5 s x3 (holds opposite shoulder down); Mayo 15-30 s; CCOHS 10-20 s. CUH: stop if dizzy. |
| 4 | levator-scapulae-stretch | CORRECTED | Removed optional hand-on-head overpressure; CUH gives no holds; Blanpied not exercise-specific. |
| 5 | shoulder-shrug-release | CONFIRMED | CCOHS: 3-5 s, 2 or 3 times. |
| 6 | shoulder-rolls | CONFIRMED | CCOHS: 5 backward then forward. |
| 7 | scapular-squeeze | CORRECTED | Label guideline-backed -> clinical practice. Blanpied Grade B is for patients with acute neck pain, not a 5 s squeeze. |
| 8 | doorway-pec-stretch | CORRECTED | Variant not in any source read. Elbow at/below shoulder height, hold 15-20 s, added instability/TOS cautions. |
| 9 | chair-thoracic-extension | UNVERIFIED | No source. Blanpied recommends clinician manipulation, not this. Chair tip risk. Recommend drop. |
| 10 | wall-angels | UNVERIFIED | No source. Keep as general guidance or drop. |
| 11 | standing-back-extension | CORRECTED | CCOHS says knees SLIGHTLY BENT (catalog said straight). Dropped "McKenzie-style" label. |
| 12 | standing-hip-flexor-stretch | UNVERIFIED | No authoritative source found. Mechanics fine. |
| 13 | seated-figure-4 | CORRECTED | Hip replacement is "do not", not "modify"; added hip-pinch stop rule. CCOHS variant differs. |
| 14 | standing-cat-cow | UNVERIFIED | No source. Low risk. |
| 15 | seated-spinal-twist | UNVERIFIED | No source. Osteoporosis made a skip condition. |
| 16 | standing-hamstring-stretch | CORRECTED | Mayo seated version is 30 s; title said standing but steps are seated; renamed, 20-30 s. |
| 17 | wrist-flexor-extensor-stretch | CORRECTED | AAOS: "do not lock your elbow"; flexion stretch can increase numbness. Dose 15 s per AAOS. |
| 18 | tendon-glides | CORRECTED | Catalog mixed AAOS Series A and B. Rewritten to Series A (straight, hook, fist). AAOS: for CTS patients, supervised. |
| 19 | median-nerve-glide | CORRECTED | AAOS has 6 positions incl. thumb extension; 3-7 s holds, 10-15 reps/day; patient exercise. Make optional. |
| 20 | palm-press-and-finger-spread | CONFIRMED | CCOHS: 5-7 s x3. |
| 21 | twenty-twenty-twenty | CONFIRMED | See notes below. |
| 22 | eye-palming | UNVERIFIED | No benefit evidence (Bates-derived). Hygiene and no-pressure wording tightened. |
| 23 | blink-reset | CONFIRMED | AAO: ~15/min normal, 5-7/min at screens; blink consciously. |
| 24 | chair-sit-to-stand | CONFIRMED | Class-level WHO only; label made explicit; "wheels chair" typo fixed. |
| 25 | desk-push-up | CONFIRMED | Class-level WHO only; label made explicit. |
| 26 | wall-sit | CORRECTED | BP wording: breath-holding is the issue; isometric training also lowers BP over time. Knee <= 90 degrees. |
| 27 | calf-raises | CONFIRMED | Low risk; dose app-chosen. |
| 28 | march-in-place | CONFIRMED | WHO "some activity better than none". |
| 29 | walk-5-min | CONFIRMED | Plus Duran 2023 (n=11, lab): 5 min every 30 min. |
| 30 | stair-climb | CONFIRMED | Cautions adequate. |

## Notes

**Hold times.** ACSM (summaries): 10-30 s static holds, 2-4 reps, ~60 s total per joint. CCOHS (read) says 10-20 s generally. All stretch dosages in the catalog (15-30 s) are inside those ranges. NHS neck stretches are shorter (5 s x3, 2 s sideways bend) and Mayo longer (15-30 s); the catalog picks a defensible middle. Strength reps/holds (sit-to-stand 8-10, wall sit 20-30 s, calf raises 12-15, scapular squeeze 10 x 5 s) have no source; they are app-chosen doses and should be labelled so in the UI.

**Blanpied 2017 (read).** Recommendations are for PATIENTS with neck pain with mobility deficits. Acute: thoracic manipulation + neck ROM + scapulothoracic/upper-extremity strengthening (B). Subacute: neck and shoulder girdle endurance (B). Chronic: multimodal incl. mixed exercise (B). It contains no recommendation on chin tuck, no desk-break prevention claim, and "thoracic manipulation" is clinician-delivered. The catalog's use of it as support for chair thoracic extension, wall angels and scapular squeeze overstated it. Rule for the app: never claim the guideline supports these exercises for healthy desk workers.

**Contraindications.** Not invented in the main: stenosis/spondylolisthesis for lumbar extension (secondary sources agree), hip-replacement leg-crossing restrictions (patient-information sources), osteoporosis and flexion+twist (patient-education sources), dizziness stop (CUH), numbness stop and CTS supervision (AAOS). Weak spots: the vertebrobasilar/vertigo wording for neck rotation is precautionary and is not on the NHS page; "glaucoma" for eye palming had no source and was replaced by hygiene/pressure/infection wording. All contraindications from secondary sources are retained but should be phrased as "check with a clinician", never as medical clearance.

**20-20-20 (confirmed).** Talens-Estarelles et al., Cont Lens Anterior Eye 2023;46(2), PMID 35963776. n = 29 symptomatic computer users, software-enforced 20 s breaks every 20 min, no control group, non-randomised; symptoms dropped after 2 weeks and returned to prior levels 1 week after reminders stopped. A letter to the editor and a response were published in Oct 2023 (listing seen). The AAO computer-use page does not name the rule; it says people blink about 15 times/min normally vs 5 to 7 at screens, and advises periodic distant looks. The rule is usually attributed to the American Optometric Association (search snippets), so "AAO endorses 20-20-20" must not be written. Safe in-app wording: "A common suggestion; one small uncontrolled study found short-term symptom relief."

**Excluded neck circles.** The exclusion is a precaution, not a proven harm. The pages found are yoga/anatomy blogs; one result (painscience) argues full head circles are likely not dangerous. No guideline read prohibits them, and NHS/CCOHS/Mayo list only slow, single-plane movements. Keep the rationale as "slow single-direction movements are what clinical sources list; circles add end-range extension with no extra benefit", and do not state that circles cause injury.

**Other.** Eye palming hygiene: clean hands, no sanitizer residue, no pressure. Chair-based exercises: only fixed, non-wheeled chairs. Nerve glides and tendon glides come from a carpal tunnel patient programme and should be flagged optional in the app, not default.
