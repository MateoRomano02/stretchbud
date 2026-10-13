# 11 - Existing 3D human figure options (checked 2026-10-13)

## Recommendation

Use the Quaternius **Universal Animation Library [Standard]** mannequin (CC0). The glb ships a skinned artist-doll ("Mannequin" mesh, orange body, purple joint patches via a separate `M_Joints` material). Joints are visible by design, so no overlay markers are needed.

Ready file (slimmed to the T-pose and Idle clips, pruned): `research/scratch/figures/ready/mannequin_ual_slim.glb` (895,688 bytes). License file next to it: `ready/UAL_License.txt`. The untouched original is `ready/UAL1_Standard_full.glb` (7.6 MB, 43 clips). Note `research/scratch/` is gitignored: copy the glb into the app assets when adopting.

Facts verified by parsing the downloaded glb:
- 1 mesh "Mannequin", 2 primitives, 8,546 vertices, 13,744 triangles, no textures (flat material colors only, so no image files to ship). No glTF extensions required (plain GLTFLoader works, no Draco/meshopt).
- 65 joints, Y-up, about 1.83 m tall, T-pose bind pose (clip `A_TPose`).
- Hierarchy: `root > pelvis > spine_01 > spine_02 > spine_03 > neck_01 > Head`; `spine_03 > clavicle_l/r > upperarm_l/r > lowerarm_l/r > hand_l/r > {thumb,index,middle,ring,pinky}_01..03 + _04_leaf`; `pelvis > thigh_l/r > calf_l/r > foot_l/r > ball_l/r > ball_leaf_l/r`.
- Has exactly the bones needed: one neck bone (`neck_01`, no `neck_02`), `Head`, three spine bones, clavicle, upper arm, forearm, hand, fingers, thigh, calf, foot, ball. Left/right suffix `_l` / `_r`.
- Free-tier clips (43): A_TPose, Idle_Loop, Idle_Talking_Loop, Crouch_Idle_Loop, Crouch_Fwd_Loop, Sitting_*, Push_Loop, PickUp_Table, Interact, Walk/Jog/Sprint, Jump_*, Roll, Dance_Loop, Punch/Sword/Pistol/Spell, Hit_*, Death01, Swim_*, etc. No stretch, squat or push-up clip in the Standard tier (the 120+ library is the paid Pro tier, not checked). Our keyframes are needed for all the target exercises.
- Caveat: build is muscular/"superhero" proportions and the face is a blank egg head. Friendly look comes from the color scheme and our own face/eyes overlay. I viewed the pack's preview image (https://quaternius.com/assets/images/fullres/universalanimationlibrary.jpg) but did not render the glb in three.js.
- Caveat: shoulder/hip joint patches are painted into the mesh via material, so deep rotations may show seams; test the squat and neck rotation.

## Ranked table

| # | Name | URL | License (exact quote) | Format | Size | Tris | Bones | Clips | Look |
|---|------|-----|----------------------|--------|------|------|-------|-------|------|
| 1 | Quaternius Universal Animation Library [Standard] (mannequin) | https://quaternius.com/packs/universalanimationlibrary.html , https://quaternius.itch.io/universal-animation-library | "License: CC0 1.0 Universal (CC0 1.0) Public Domain Dedication https://creativecommons.org/publicdomain/zero/1.0/" (from the zip's License.txt; site: "Free to use in personal, educational and commercial projects") | glb (also fbx) | 7.6 MB full, 0.9 MB slimmed | 13,744 | 65 | 43 (slim: 2) | Orange artist mannequin, purple visible joints. Best match. |
| 2 | Quaternius Universal Base Characters [Standard] (Superhero_Male/Female_FullBody) | https://quaternius.com/packs/universalbasecharacters.html , https://quaternius.itch.io/universal-base-characters | "License: CC0 1.0 Universal (CC0 1.0) Public Domain Dedication" (zip License_Standard.txt; site: "Free to use in personal, educational and commercial projects") | gltf + bin + 7 PNG (no glb) | 122 MB zip, textures about 20 MB | male 14,318 | 65 (same UE-style rig as #1, so UAL clips retarget by name) | 0 | Realistic stylized human, textured, hair/eyebrow add-ons. Needs texture downsizing and a glb repack; the male gltf references a missing `T_Hair_1_Normal_png.png`, so `gltf-transform` fails until that is fixed. Standard tier has only the two Superhero bodies (regular/teen are paid). Fallback if a skin-toned human is preferred. |
| 3 | Quaternius Ultimate Modular Men/Women | https://quaternius.com/packs/ultimatemodularwomen.html | "CC0" (page); not downloaded | FBX, OBJ, Blend, glTF | not checked | not checked | humanoid rig (not inspected) | 24 | Low-poly modular game characters. Not downloaded; no visible joints. |
| 4 | Kenney Animated Characters 1/2/3 | https://kenney.nl/assets/animated-characters-1 (the /animated-characters-2 URL 404s) , https://opengameart.org/content/animated-characters-2 | CC0 per search result; attribution "not mandatory" | FBX (+OBJ) | about 0.7 MB | very low | minimal rig | idle, jump, run only | Blocky toy-like. Not downloaded; too coarse for neck/wrist detail. |
| x | Mixamo Y Bot / X Bot | https://www.mixamo.com | Adobe terms, not redistributable as a raw file in a public repo | fbx | | | | | Excluded by license (not re-read, as you asked only to confirm). |
| x | mannequin.js | https://github.com/boytchev/mannequin.js | "Mannequin.js is licensed under GPL-3.0." (single license, no dual) | JS procedural | | | | | Excluded (GPL-3.0). |

## Not checked

Sketchfab, Poly Pizza, OpenGameArt wooden mannequins, Blender Studio "Rain", MakeHuman, VRoid/Avaturn samples. Sketchfab needs a login to download and per-model licenses vary, and #1 already meets every requirement.

## How the files were fetched

itch.io pay-what-you-want pages: POST `<page>/download_url` with the page's `csrf_token`, then POST `<page>/file/<upload_id>` to get a signed URL. Works with plain curl, no login.
