#!/usr/bin/env python3
"""Generate web/exercises.js and web/exercises.json from the adversarially verified catalog.

Only exercises that are (a) CONFIRMED or CORRECTED by verification and (b) animated in
web/poses.js make it into the app. UNVERIFIED items never ship.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOGS = [ROOT / "research" / "02-exercise-catalog.verified.json",
            ROOT / "research" / "09-new-entries.verified.json"]
POSES = ROOT / "web" / "poses.js"

# Dose shown on screen: (durationSec, reps, holdSec, sides). Doses follow each item's
# duration_reps in the catalog, trimmed to fit a 45-90 s micro-break where noted.
DOSE = {
    "chin-tuck": (35, 5, 5, False),
    "neck-rotation": (66, 3, 5, True),
    "upper-trap-side-stretch": (45, 1, 20, True),
    "levator-scapulae-stretch": (45, 1, 20, True),
    "shoulder-shrug-release": (25, 3, 4, False),
    "shoulder-rolls": (30, 5, None, False),
    "scapular-squeeze": (50, 8, 5, False),
    "doorway-pec-stretch": (45, 1, 20, True),
    "standing-back-extension": (35, 6, 3, False),
    "seated-figure-4": (60, 1, 25, True),
    "standing-hamstring-stretch": (45, 1, 20, True),
    "wrist-flexor-extensor-stretch": (72, 1, 15, True),
    "palm-press-and-finger-spread": (35, 3, 6, False),
    "twenty-twenty-twenty": (25, None, 20, False),
    "blink-reset": (20, 10, None, False),
    "chair-sit-to-stand": (45, 10, None, False),
    "desk-push-up": (40, 10, None, False),
    "wall-sit": (50, 2, 20, False),
    "calf-raises": (65, 10, None, False),
    "march-in-place": (75, None, None, False),
    "walk-5-min": (300, None, None, False),
    # research/09 (VO2, reset, eyes, variations)
    "vo2-brisk-walk-intervals": (360, 3, None, False),
    "vo2-fast-march": (180, 2, 30, False),
    "vo2-squat-calf-burst": (150, 2, 30, False),
    "reset-move-and-shake": (50, None, None, False),
    "reset-window-gaze": (45, None, None, False),
    "reset-mini-pmr": (75, 5, 5, False),
    "reset-mindful-minute": (60, None, None, False),
    "eyes-screen-setup-check": (30, None, None, False),
    "eyes-complete-blink-pause": (30, None, None, False),
    "calf-raise-single-leg": (80, 6, None, True),
    "calf-raise-slow-eccentric": (60, 10, None, False),
    "calf-raise-bent-knee": (65, 10, None, False),
    "mini-squat": (35, 8, None, False),
    "bodyweight-squat": (45, 10, None, False),
    "sumo-squat": (45, 10, None, False),
    "split-squat-static": (75, 6, None, True),
    "slow-tempo-squat": (60, 7, None, False),
    "squat-to-calf-raise": (50, 8, None, False),
    "wall-sit-shallow": (45, 2, 15, False),
    "wall-push-up": (40, 10, None, False),
    "desk-push-up-slow": (50, 6, None, False),
    "desk-push-up-wide": (40, 10, None, False),
    "desk-push-up-narrow": (40, 8, None, False),
    "standing-hip-abduction": (60, 8, None, True),
    "standing-knee-raise": (64, 8, None, True),
    "single-leg-balance-support": (68, 2, 15, True),
    "single-leg-balance-free": (88, 2, 20, True),
    "wall-push-hold": (45, 3, 10, False),
}

# Progression ladders for entries that predate research/09 (table in research/09).
FAMILY = {
    "calf-raises": ("calf-raise", 1),
    "chair-sit-to-stand": ("squat", 1),
    "wall-sit": ("wall-sit", 2),
    "desk-push-up": ("push-up", 2),
}

# Notes superseded by later verification (research/10): applied on top of the catalog.
NOTE_OVERRIDE = {
    "twenty-twenty-twenty": (
        "Weak and mixed. A controlled trial (Johnson & Rosenfield 2023, n=30) found 20-second breaks "
        "did not reduce eye-strain symptoms; a single-group study (Talens-Estarelles 2022, n=29, no control) "
        "saw symptoms drop only while reminders ran. It is kept as a cheap pause that also prompts blinking.",
        [{"title": "Johnson & Rosenfield 2023, Optometry and Vision Science (PMID 36473088)",
          "url": "https://pubmed.ncbi.nlm.nih.gov/36473088/"}],
    ),
}

KIND = {
    "strength-snacks": "move",
    "cardio": "move",
}
# Optional or impractical at a desk: kept out of the default rotation.
EXCLUDE = {
    "tendon-glides": "from a supervised carpal tunnel programme; optional, not a default",
    "median-nerve-glide": "from a supervised carpal tunnel programme; optional, not a default",
    "stair-climb": "needs stairs",
    "vo2-stair-moderate": "needs stairs",
    "vo2-stair-burst": "needs stairs",
    "vo2-self-check-sts30": "a monthly fitness self-check, not a break",
    "reset-cold-face": "optional per research/09; needs a sink",
    "floor-push-up": "floor work is not office friendly",
}

EVIDENCE = {
    "guideline-backed": "guideline",
    "guideline": "guideline",
    "clinical practice": "clinical",
    "expert consensus": "consensus",
    "weak": "weak",
    "general guidance": "weak",
}

EXTRA = [
    {
        "id": "cyclic-sighing", "name": "Cyclic sighing", "kind": "breath", "area": "breath",
        "durationSec": 60, "reps": 6, "holdSec": None, "sides": False,
        "steps": [
            "Sit or stand comfortably and let your shoulders drop.",
            "Breathe in through the nose (about 2 s).",
            "Take a second short sip of air on top (about 1 s).",
            "Breathe out slowly through the mouth until empty (about 6 s).",
        ],
        "cue": "The long, slow exhale is the point. Gentle, never forced.",
        "caution": [
            "Stop and breathe normally if you feel dizzy, tingly or lightheaded.",
            "With a respiratory or heart condition, or during pregnancy, keep it gentle and skip if unsure.",
        ],
        "evidence": "clinical",
        "evidenceNote": "Balban et al. 2023 (Cell Reports Medicine, RCT): 5 minutes a day for 28 days of cyclic sighing improved mood more than mindfulness meditation. This 1-minute version is shorter than what was studied.",
        "sources": [
            {"title": "Balban et al. 2023, Cell Reports Medicine", "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC9873947/"},
        ],
    },
    {
        "id": "drink-water", "name": "Glass of water", "kind": "water", "area": "water",
        "durationSec": 25, "reps": None, "holdSec": None, "sides": False,
        "steps": [
            "Grab your glass or bottle.",
            "Drink a glass of water at a relaxed pace.",
            "Refill it so the next one is ready.",
        ],
        "cue": "Sip, don't chug. Refilling it is a tiny walk too.",
        "caution": [
            "If a doctor told you to limit fluids (for example heart or kidney conditions), skip this and turn water reminders off.",
        ],
        "evidence": "guideline",
        "evidenceNote": "EFSA 2010 adequate intake of total water (drinks plus food): 2.0 L/day for women, 2.5 L/day for men. Needs vary with heat and activity.",
        "sources": [
            {"title": "EFSA 2010, Dietary reference values for water", "url": "https://www.efsa.europa.eu/en/efsajournal/pub/1459"},
        ],
    },
]


def split_caution(text: str) -> list:
    parts = [p.strip() for p in re.split(r"(?<=[.!])\s+", text) if p.strip()]
    return parts


def main() -> int:
    catalog = [e for c in CATALOGS for e in json.loads(c.read_text())]
    poses_src = POSES.read_text() if POSES.exists() else ""
    animated = set(re.findall(r'["\']([a-z0-9-]+)["\']\s*:', poses_src))

    out, report = [], []
    for e in catalog:
        eid = e["id"]
        if e.get("verdict") not in ("CONFIRMED", "CORRECTED"):
            report.append(f"skip {eid}: verdict {e.get('verdict')}")
            continue
        if eid in EXCLUDE:
            report.append(f"skip {eid}: {EXCLUDE[eid]}")
            continue
        if eid not in DOSE:
            report.append(f"skip {eid}: no dose defined")
            continue
        if eid not in animated:
            report.append(f"skip {eid}: not animated in web/poses.js")
            continue
        dur, reps, hold, sides = DOSE[eid]
        kind = "walk" if eid == "walk-5-min" else e.get("kind") or KIND.get(e["category"], "micro")
        family, level = FAMILY.get(eid, (e.get("family"), e.get("level")))
        steps = list(e["steps"])
        out.append({
            "id": eid, "name": e["name"], "kind": kind, "area": e["category"],
            "family": family, "level": level,
            "durationSec": dur, "reps": reps, "holdSec": hold, "sides": sides,
            "steps": steps,
            "cue": e["key_cue"],
            "mistake": e.get("common_mistake"),
            "caution": split_caution(e["contraindications_safety"]),
            "evidence": EVIDENCE.get(e["evidence_level"].split(" (")[0].lower(), "consensus"),
            "evidenceNote": (NOTE_OVERRIDE.get(eid, (None, []))[0] or e.get("evidence_note", "")),
            "sources": [{"title": s["title"], "url": s["url"]} for s in e["sources"]]
                       + NOTE_OVERRIDE.get(eid, (None, []))[1],
        })
    for x in EXTRA:
        if x["id"] in animated:
            out.append(x)
        else:
            report.append(f"skip {x['id']}: not animated in web/poses.js")

    by_id = {x["id"]: x for x in out}
    (ROOT / "web" / "exercises.js").write_text(
        "// Generated by scripts/build_content.py from research/02-exercise-catalog.verified.json. Do not edit.\n"
        "window.EXERCISES = " + json.dumps(by_id, indent=1, ensure_ascii=False) + ";\n")
    (ROOT / "web" / "exercises.json").write_text(json.dumps(
        [{k: x[k] for k in ("id", "kind", "area", "durationSec", "family", "level") if x.get(k) is not None} for x in out],
        indent=1) + "\n")
    print(f"{len(out)} exercises shipped")
    print("\n".join(report))
    kinds = {k: sum(1 for x in out if x["kind"] == k) for k in ("micro", "move", "walk", "water", "breath", "reset", "eyes", "vo2")}
    print("by kind:", kinds)
    return 0 if all(kinds[k] > 0 for k in ("micro", "move", "walk")) else 1


if __name__ == "__main__":
    sys.exit(main())
