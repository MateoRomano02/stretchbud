# 06 - 3D character + animation pipeline (habit-buddy)

Date: 2026-10-13. Verified items are marked (V); items from memory or secondary sources are marked (U) unverified.

## TL;DR recommendation

Build a **procedural mascot from three.js primitives with our own tiny skeleton (a Group hierarchy, no SkinnedMesh, no glTF), animated by a ~100-line keyframe-pose engine**, MIT-clean because every byte is ours. Do NOT use mannequin.js (GPL-3.0, V). Do NOT commit Mixamo files (raw redistribution forbidden, V). Use three.js `MeshToonMaterial` + blob shadow, vendor a tree-shaken three bundle (~135 KB gzip, V). Optional later upgrade: CC0 Quaternius/KayKit models for a skinned look.

## 1. Character options and licenses

| Option | License | OSS-redistributable? | Verdict |
|---|---|---|---|
| Mixamo characters/animations | Adobe: free, royalty-free for personal/commercial/non-profit projects, but "you cannot distribute the raw character and animation files", incl. "any type of free distribution of character or animation raw files" (Adobe community FAQ post, via search snippet; the helpx page returned 403 for me) | **No** for raw FBX/GLB in a public repo. Baked into a shipped app is fine, but an MIT repo containing them is a free distribution of raw files. | Reject. |
| three.js examples: RobotExpressive | CC0 1.0, by Tomas Laulhe (Quaternius), README in repo (V). GLB is 464 KB (V). Has morph-target faces (Angry, Surprised, Sad) and animations: Idle, Walking, Running, Dance, Jump, Yes, No, Wave, Punch, ThumbsUp, Sitting, Standing, Death. | Yes | Good fallback / placeholder. No exercise clips. |
| three.js examples: Soldier, Xbot, Michelle | No license file in the model dir (V: dir listing shows only .glb/.blend). Xbot/Soldier/Michelle are Mixamo-derived (U). | Unclear, treat as **no** | Reject. |
| three.js `readyplayer.me.glb`, kira, etc. | Per-asset, unclear | Reject |
| Quaternius Universal Animation Library (UAL 1 and 2) | CC0 (V, itch.io page). 120+ clips, free "Standard" 45 clips, humanoid rig (V). Listed categories: locomotion, push, crawl, swim, sit, death, combat, emotes, (UAL2) farming, fishing, parkour. No stretch/squat/push-up/drink named (V: not mentioned; I could not see the 45-clip list, check https://quaternius.com/animviewer.html). | Yes | Useful for walk/idle/wave only. Not our 25 exercises. |
| Quaternius Ultimate Animated Character pack | CC0 (U, Quaternius standard), ~Idle/Walk/Run/Punch/Death/Sit/Roll types. | Yes | Not exercise-like (U). |
| KayKit (Kay Lousberg) | CC0 for free packs (U; I did not open the license page). Character Pack: Adventurers, Skeletons; animations are combat/locomotion. | Yes | Charming style, but no exercises. |
| Ready Player Me | **Shut down 2026-01-31** after Netflix acquired the tech (V, genies.com + avatarsdk.com blog posts) | n/a | Dead. |
| VRoid / VRM | VRoid Studio exports your own character; VRM per-model license. three-vrm (MIT) loads it. Needs your own model made in VRoid (anime style), plus VRM animation retargeting. | Yes if you author/own the model | Heavy (textures, MB-sized, MToon). Overkill. |
| mannequin.js (Pavel Boytchev) | **GPL-3.0** (V: LICENSE file and GitHub API spdx GPL-3.0; last push 2025-10-05) | Copying/linking GPL code into an MIT repo forces GPL on the combined work. | **Reject** for an MIT project. Its idea (nested joints with posture editor) is fine to imitate with our own code. |
| Procedural primitives, own skeleton | Ours, MIT | Yes | **Pick.** |

### Why procedural wins here
- Zero licensing risk, repo stays tiny (no binary assets, diffs are readable).
- Exercises (neck tilt, wrist flex, desk push-up) need custom poses; stock libraries have none, and retargeting Mixamo-style clips needs rig work anyway.
- A cute blob/capsule mascot ("Bean") reads clearly at 200x200 px, where realistic anatomy is wasted.
- No glTF loader, no skinning, no Draco/KTX: the bundle stays small.

## 2. Animation authoring

### 2.1 Recommended: keyframed joint angles in code/JSON
Mascot skeleton (all Object3D groups, local Euler XYZ in radians or degrees):
`root` (hips, translatable) > `spine` > `chest` > `neck` > `head`; `chest` > `lShoulder` > `lElbow` > `lWrist`; same for right; `root` > `lHip` > `lKnee`; same right. Short stubby limbs (capsules) keep poses legible.

Data format (one JSON file per exercise or one big object; hand-writeable, diffable, ~15 lines per exercise):

```json
{
  "id": "neck-tilt",
  "name": "Neck stretch",
  "loop": true,
  "duration": 6,
  "keys": [
    { "t": 0.0, "ease": "inOut", "pose": {} },
    { "t": 0.25, "ease": "inOut", "pose": { "neck": [0, 0, 28], "lShoulder": [0, 0, -4], "rShoulder": [0, 0, 6] } },
    { "t": 0.5, "ease": "inOut", "pose": { "neck": [0, 0, 28] } },
    { "t": 0.75, "ease": "inOut", "pose": { "neck": [0, 0, -28] } },
    { "t": 1.0, "ease": "inOut", "pose": {} }
  ]
}
```
Rules: `t` is normalized 0..1; missing joints inherit the neutral pose (`{}` = rest); angles in degrees; optional `root: [x,y,z]` offsets in the pose for squats (`rootPos`). Each exercise is ~5 keys. 25 exercises is roughly one day of tuning with a live reload page plus a pose-slider debug panel (lil-gui, MIT, ~30 KB, dev only, not shipped).

Engine (complete, ~60 lines, vanilla ES module):

```js
// anim.js
import * as THREE from './vendor/three.bundle.js';
const D2R = Math.PI / 180;
const ease = {
  linear: t => t,
  inOut: t => t * t * (3 - 2 * t),
  out: t => 1 - (1 - t) ** 3,
  back: t => { const c = 1.70158; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; },
};

export class Rig {
  constructor(joints) {            // joints: { neck: Object3D, lShoulder: ..., root: ... }
    this.j = joints;
    this.rest = {};
    for (const k in joints) this.rest[k] = [0, 0, 0];
  }
  samplePose(ex, u) {              // u in [0,1)
    const keys = ex.keys;
    let i = 0;
    while (i < keys.length - 2 && u > keys[i + 1].t) i++;
    const a = keys[i], b = keys[i + 1];
    const f = ease[b.ease || 'inOut']((u - a.t) / (b.t - a.t || 1));
    const out = {};
    for (const k in this.j) {
      const pa = a.pose[k] || this.rest[k], pb = b.pose[k] || this.rest[k];
      out[k] = [0, 1, 2].map(n => pa[n] + (pb[n] - pa[n]) * f);
    }
    return out;
  }
  apply(pose, blend = 1) {         // blend lets us crossfade between exercises
    for (const k in pose) {
      const e = this.j[k].rotation, p = pose[k];
      e.x += (p[0] * D2R - e.x) * blend;
      e.y += (p[1] * D2R - e.y) * blend;
      e.z += (p[2] * D2R - e.z) * blend;
    }
  }
}

export function play(rig, exercise, clock) {
  const u = ((clock.elapsedTime % exercise.duration) / exercise.duration);
  rig.apply(rig.samplePose(exercise, u), 0.35); // 0.35 = smoothing, hides pops on exercise switch
}
```
Note the position-based root offsets (squat down, push-up lean) can reuse the same format by adding a `rootPos` joint treated like a vector (store as joint `root` where the Object3D `.position` is lerped instead of `.rotation`); keep it as a second branch in `apply`.

Procedural overlays on top of keyframes (cost almost nothing): breathing (`chest.scale.y = 1 + 0.02*sin(t*1.6)`), blink timer, slight head sway. Layer order: keyframe pose, then idle overlays, then squash/stretch.

Rep counter: the engine knows `u` wraps, so it can emit `onRep` events for the UI ("3 of 5") and a countdown ring.

Alternative "IK-lite": for the desk push-up and hand-on-neck poses, hand-tune angles; true IK is not needed with stubby limbs. If wanted later, three.js `CCDIKSolver` (examples/jsm/animation) works only with SkinnedMesh, so avoid.

### 2.2 Video-to-pose (not for MVP)
- **MediaPipe Pose / BlazePose**: Apache 2.0 (U, well known), 33 landmarks, runs in browser via WASM+model (~3-6 MB model files). Landmarks give positions, not bone rotations; you must compute angles (atan2 per limb), which gives 2D-ish swing but no twist. Good for extracting the *key poses* of an exercise from a reference video offline: run once on your machine, read shoulder/elbow/hip/knee angles at key frames, and paste numbers into the JSON above. That is a useful semi-manual workflow, and the output data is ours.
- **Kalidokit**: MIT (U; LICENSE raw path 404'd in my fetch, repo is MIT per its README as I recall), last push 2025-08-18 (V), effectively low maintenance. Solves face/pose/hand to rig rotations for VRM/Live2D-like rigs, designed for a humanoid with specific bone axes; adapting to a custom rig is fiddly. Not worth it for a mascot.
- **Move.ai / Plask / Rokoko Video**: commercial cloud mocap-from-video (U on pricing: free tiers are limited, outputs are FBX/BVH). Outputs need a humanoid skinned rig, and exported clips would be ours to redistribute only if the ToS allows (check per service). Not compatible with the "tiny, procedural" plan. Skip.

### 2.3 MVP in one day (suggested order)
1. 1h: scene + mascot built from primitives, idle breathing + blink.
2. 1h: pose engine above, debug sliders to author poses.
3. 3-4h: author 8 launch exercises (neck tilt, neck rotation, shoulder roll, desk push-up, squat, wrist stretch, deep breath, drink water, walk-in-place), then the remaining ~17 by copy/tweaking (many are mirrored: write a `mirror(pose)` helper swapping `l*`/`r*` and negating y/z).
4. 1h: speech bubble (HTML/CSS overlay, not three.js), countdown ring (SVG), confetti.

## 3. Performance

Measured by me (V) with three 0.186.1 from npm:
- Current three has **no prebuilt `three.module.min.js`** in `build/` (only `three.module.js` 663 KB + `three.core.js` 1.46 MB unminified; `three.webgpu*.js` 2.2 MB). Older "671 KB min" figures refer to old releases.
- Tree-shaken + minified esbuild bundle of just: Scene, PerspectiveCamera/Orthographic, WebGLRenderer, Group, Mesh, CapsuleGeometry, SphereGeometry, MeshToonMaterial, MeshBasicMaterial, lights, Clock, etc.: **542 KB minified, 136 KB gzip**. The whole library minified: 742 KB / 189 KB gzip. WebGLRenderer's shader chunks dominate, so there is little to gain by dropping geometries. Since the file loads from disk inside the app bundle, gzip does not matter for load time; parse of ~540 KB JS is roughly 10-30 ms.
- Vendor it: `npx esbuild entry.js --bundle --minify --format=esm --outfile=Resources/web/three.bundle.js` and commit the built file (MIT license header preserved, three is MIT) or build it in a Makefile. No CDN, works offline.
- No GLB/Draco/KTX2 needed with the procedural character: no loader code (GLTFLoader, DRACOLoader) shipped.

Runtime rules:
- `renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })`; `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))` (even 1.5 is fine for a small flat-shaded popup); transparent canvas so the popup chrome shows through.
- Render loop only while visible: use `document.visibilitychange` plus a native bridge (`webkit.messageHandlers`) or `window.__setActive(bool)` called from Swift on popover show/hide; with `requestAnimationFrame` and an `active` flag, cancel the rAF when inactive. WKWebView already throttles rAF when its window is hidden, but make it explicit.
- Cap at 30 fps for idle poses (skip frames by comparing `clock.getElapsedTime()`), 60 fps while an exercise plays. Or render on demand only while the mascot is not at rest.
- `MeshToonMaterial` with a 3-4 step `gradientMap` (`DataTexture`, `NearestFilter`, RedFormat); 1 directional + 1 ambient light; **no shadow maps**; blob shadow = flat `CircleGeometry` with a radial-gradient `CanvasTexture` or a plain dark `MeshBasicMaterial` transparent disc, scaled with the mascot's jump height (cheap and reads well).
- Low-poly: Capsule `(radius, length, 4 capSegments, 8 radialSegments)`, Sphere `(0.5, 16, 12)`. Total under ~5k triangles. Share geometries and materials between limbs. ~15 draw calls.
- Outlines (charm, cheap): inverted-hull duplicate mesh with `BackSide` MeshBasicMaterial, scaled 1.04, doubles draw calls but is trivial.
- Dispose on teardown: `renderer.dispose()`; a single long-lived WebView is better than recreating it.

## 4. Fun / charm checklist
- **Squash and stretch** on the root scale (`scale.y = 1 - 0.1*v`, `scale.x = scale.z = 1 + 0.05*v`, v from vertical velocity) when squatting, landing, and clicking the mascot. Anticipation (a small reverse move) before big moves, and overshoot via the `back` easing above.
- Idle: breathing scale on chest, head sway, **blinking** every 2-5 s random (scale the eye spheres' y to 0.1 for 100 ms), eyes that follow the cursor within the popup.
- Eyes: two black spheres plus tiny white highlight spheres; cheeks as pink discs. This is most of the "cute".
- Countdown ring around the character (SVG stroke-dashoffset), and a speech bubble ("Roll your shoulders back, 5 times") as DOM, so text is crisp and localizable.
- Completion: confetti (a 60-particle `Points` or 2D canvas overlay; `canvas-confetti` is ISC/MIT licensed if you want it, ~6 KB) plus a happy hop and a thumbs-up pose. Streak counter tie-in.
- Optional sound: a short "pop"/"ding" generated with WebAudio oscillators (no audio files to license), default off.
- Reaction to user: tap the mascot to boop (squash + wiggle), a different idle after long inactivity (stretch, yawn).
- References for tone: three.js `webgl_animation_skinning_morph` (RobotExpressive with emotes and morph faces, the demo shows how expressive a simple robot is), Bruno Simon's portfolio (toon look, playful physics, juicy micro-interactions), Duolingo's character reactions (state machine of reactions to events).

## 5. three.js version and WebGL/WebGPU in WKWebView

- Latest on npm as of 2026-10-13: **three 0.186.1** (V, `npm view three version`, modified 2026-09-24). Pin the exact version in the vendored bundle's header comment; revisit quarterly (three has a monthly release cadence with occasional breaking API changes between 0.x versions; WebGLRenderer has been stable).
- WKWebView on macOS 14 supports **WebGL 2** (V from long-standing WebKit support since Safari 15; I did not run a live test in this session). Test with `canvas.getContext('webgl2')` at launch and fall back to a CSS/SVG 2D mascot if null.
- **WebGPU**: Safari 26 (macOS Tahoe 26) shipped WebGPU enabled by default (U, from Apple's WWDC25 notes); macOS 14 WKWebView does not have it reliably. Don't use `three.webgpu.js` (2.2 MB) or WebGPURenderer. WebGL2 is the right target and plenty for ~5k triangles.
- Loading local files in WKWebView: ES module imports from `file://` can fail on CORS. Either use `loadFileURL(_:allowingReadAccessTo:)` with a bundled single-file bundle script (non-module `<script>` or an IIFE build via esbuild `--format=iife`, which avoids module-CORS issues entirely), or register a `WKURLSchemeHandler` (custom `app://` scheme). Recommendation: emit an **IIFE bundle** with esbuild so there are no module/file:// pitfalls.

## Appendix: minimal scene sketch

```js
import { Scene, PerspectiveCamera, WebGLRenderer, Group, Mesh, CapsuleGeometry,
  SphereGeometry, MeshToonMaterial, MeshBasicMaterial, CircleGeometry,
  DirectionalLight, AmbientLight, Clock, DataTexture, RedFormat, NearestFilter } from 'three';

const canvas = document.querySelector('#c');
const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new Scene();
const cam = new PerspectiveCamera(30, 1, 0.1, 50); cam.position.set(0, 1.2, 7);
scene.add(new AmbientLight(0xffffff, 1.2));
const sun = new DirectionalLight(0xffffff, 2); sun.position.set(2, 4, 3); scene.add(sun);

const ramp = new DataTexture(new Uint8Array([90, 170, 255]), 3, 1, RedFormat); // toon bands
ramp.needsUpdate = true; ramp.minFilter = ramp.magFilter = NearestFilter;
const skin = new MeshToonMaterial({ color: 0x7fd1ae, gradientMap: ramp });

const J = {};                       // joints
const part = (name, parent, pos, geo) => {
  const g = new Group(); g.position.set(...pos); parent.add(g); J[name] = g;
  if (geo) g.add(new Mesh(geo, skin));
  return g;
};
const root = part('root', scene, [0, 0, 0]);
const chest = part('chest', root, [0, 1.0, 0], new CapsuleGeometry(0.45, 0.5, 4, 12));
const neck = part('neck', chest, [0, 0.55, 0]);
part('head', neck, [0, 0.55, 0], new SphereGeometry(0.6, 20, 16));
for (const [s, x] of [['l', -0.55], ['r', 0.55]]) {
  const sh = part(s + 'Shoulder', chest, [x, 0.3, 0], new CapsuleGeometry(0.12, 0.35, 4, 8));
  sh.children[0].position.y = -0.25;           // arm hangs below the pivot
  part(s + 'Elbow', sh, [0, -0.55, 0], new CapsuleGeometry(0.1, 0.3, 4, 8));
}
const shadow = new Mesh(new CircleGeometry(0.7, 24).rotateX(-Math.PI / 2),
  new MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 }));
shadow.position.y = 0.01; scene.add(shadow);

let active = true; const clock = new Clock();
window.__setActive = v => { active = v; if (v) loop(); };
function loop() {
  if (!active) return;
  requestAnimationFrame(loop);
  // play(rig, exercise, clock); idle overlays; squash/stretch...
  renderer.render(scene, cam);
}
loop();
```

## Sources
- Adobe community FAQ on Mixamo licensing (search snippet): https://community.adobe.com/t5/mixamo-discussions/mixamo-faq-licensing-royalties-ownership-eula-and-tos/m-p/13234775
- three.js RobotExpressive README (CC0): https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf/RobotExpressive
- mannequin.js (GPL-3.0): https://github.com/boytchev/mannequin.js
- Quaternius UAL (CC0): https://quaternius.itch.io/universal-animation-library
- Ready Player Me shutdown: https://genies.com/blog/ready-player-me-shutdown and https://avatarsdk.com/blog/2026/08/31/avatar-platforms-2026-whos-alive-whos-gone/
- npm `three` 0.186.1 (queried locally with `npm view` and bundle measured with esbuild).
