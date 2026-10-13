/* stretchbud: keyframe animations per exercise id. MIT License.
 *
 * window.POSES[id] = {
 *   duration: seconds per cycle (one rep, or one side for mirrored items),
 *   keys: [{ t: 0..1, ease, pose: { joint: [x, y, z] (degrees), rootPos: [x, y, z] } }],
 *   mirror: true       cycles alternate between the authored side and its mirror,
 *   blockSides: true   with mirror: all reps on one side, then the other (reps from content),
 *   authored: 'l'|'r'  which side the keys describe (for {side} labels and rep counter),
 *   camera: preset from BudScene.CAMS ('front', 'threeQuarter', 'threeQuarterR', 'side',
 *           'sideWide', 'high', 'closeNeck', 'closeNeckSide', 'closeShoulders', 'closeHands',
 *           'closeFace') or {az, el, dist, ty, tz}; mirrored cycles mirror the camera
 *           unless mirrorCamera: false,
 *   focus: ['neck', 'lShoulder', 'spine', ...]   joints that glow while working,
 *   focusAt: [[t, [...]], ...]                    focus that changes within a cycle,
 *   trail: 'nose' | 'lWrist' | 'chest' | ...     dotted path of that point over one cycle,
 *   props: { desk: [x, z, rotYdeg], chair: [...], wall: [...] }  props move to that spot
 *           (mirrored with the side),
 *   place: [x, z]       Bud moves to this spot on the island,
 *   macro: { duration, speeds: [[sec, speed], ...], beats: [[sec, label], ...] }
 *           a longer timeline that plays the step cycle at different speeds (intervals),
 *   repSec: seconds per counted rep when reps are not one cycle each,
 *   beats: [[t, "short label"], ...]   pill on the stage ({side} -> left/right),
 *   stepAt: [t, ...] cycle time at which step i of the text shows; stepSec: same in seconds
 *           of the rep (repSec) timeline.
 * }
 * Missing channels inherit REST. "Left" is Bud's own left (+x); Bud faces the user.
 * Keep every exported id quoted in the map at the bottom: scripts/build_content.py
 * reads the ids from this file.
 */
(function () {
  'use strict';

  var ROT = ['pivot', 'root', 'spine', 'chest', 'neck', 'head',
    'lClav', 'rClav', 'lShoulder', 'rShoulder', 'lElbow', 'rElbow', 'lWrist', 'rWrist',
    'lFingers', 'rFingers', 'lHip', 'rHip', 'lKnee', 'rKnee', 'lAnkle', 'rAnkle'];
  var POS = ['rootPos', 'headPos', 'lFootPos', 'rFootPos'];

  var REST = {
    eyes: [0, 0, 0],      // lookX (+ = Bud's left), lookY (+ = up), close (1 closed, >1 squeeze)
    mouth: [0, 0.7],      // open, smile
    breath: [0],          // 0..1 chest/belly inflate
    squash: [0],          // + squash, - stretch
    glass: [0, 1],        // visible, water level
    ik: [1],              // 1 = feet planted by IK (lFootPos/rFootPos), 0 = legs use hip/knee/ankle keys
    heels: [0],           // extra plantarflexion under IK (calf raise), degrees
    scroll: [0],          // rug scroll speed (walking)
    idle: [1],            // idle sway amount
    tense: [0],           // 0..1 muscle tension look (tremor + warm flush)
    laptop: [0, 0],       // laptop slide away (m), lid tilt (deg)
  };
  ROT.forEach(function (k) { REST[k] = [0, 0, 0]; });
  POS.forEach(function (k) { REST[k] = [0, 0, 0]; });
  REST.lShoulder = [3, 0, 9]; REST.rShoulder = [3, 0, -9];
  REST.lElbow = [-12, 0, 0]; REST.rElbow = [-12, 0, 0];
  REST.lFingers = [0, 0, -12]; REST.rFingers = [0, 0, 12];

  var CHANNELS = {};
  Object.keys(REST).forEach(function (k) { CHANNELS[k] = ROT.indexOf(k) >= 0 ? 'rot' : POS.indexOf(k) >= 0 ? 'pos' : 'scalar'; });

  function clone(p) { var o = {}; for (var k in p) o[k] = p[k].slice(); return o; }
  function full(p) { var o = clone(REST); for (var k in p) if (o[k]) o[k] = p[k].slice(); return o; }
  function swapName(k) { return /^l[A-Z]/.test(k) ? 'r' + k.slice(1) : /^r[A-Z]/.test(k) ? 'l' + k.slice(1) : k; }
  // Mirror left <-> right: swap l*/r*, negate y/z of rotations, x of positions, eye lookX.
  function mirror(p) {
    var o = {};
    for (var k in p) {
      var v = p[k].slice(), kind = CHANNELS[k];
      if (kind === 'rot') { v[1] = -v[1]; v[2] = -v[2]; } else if (kind === 'pos') v[0] = -v[0]; else if (k === 'eyes') v[0] = -v[0];
      o[swapName(k)] = v;
    }
    return o;
  }
  // Symmetric pose: each l* channel is copied (mirrored) to r* unless r* is given.
  function sym(p) {
    var o = {}, k, m = mirror(p);
    for (k in p) o[k] = p[k];
    for (k in m) if (/^r[A-Z]/.test(k) && p[swapName(k)] && !p[k]) o[k] = m[k];
    return o;
  }
  function M() { var o = {}; for (var i = 0; i < arguments.length; i++) for (var k in arguments[i]) o[k] = arguments[i][k]; return o; }
  // Keys from a tempo list: [[seconds, pose, ease], ...]; returns {duration, keys}.
  function tempo(list) {
    var total = list.reduce(function (a, s) { return a + s[0]; }, 0), t = 0;
    var keys = [{ t: 0, pose: list[list.length - 1][1] }];
    list.forEach(function (s) { t += s[0]; keys.push({ t: Math.min(1, t / total), ease: s[2] || 'inOut', pose: s[1] }); });
    return { duration: total, keys: keys };
  }

  window.BudPose = { REST: REST, CHANNELS: CHANNELS, clone: clone, full: full, mirror: mirror, sym: sym, merge: M };

  // ---------- shared shapes (arm targets solved against the rig) ----------
  var ARMS_CROSSED = { lShoulder: [-30, -68, 4], lElbow: [-112, 0, 0], rShoulder: [-38, 68, -4], rElbow: [-104, 0, 0] };
  var ARMS_FWD = sym({ lShoulder: [-78, 0, 6], lElbow: [-14, 0, 0] });
  var ARMS_HIPS = sym({ lShoulder: [6, 0, 34], lElbow: [-70, -40, 0], lWrist: [0, 0, 0] });
  var HANDS_LOW_BACK = sym({ lShoulder: [64, -17, 2], lElbow: [-90, 0, 0] });
  var HANDS_LOW_BACK_EXT = sym({ lShoulder: [80, -25, 18], lElbow: [-105, 0, 0] });
  var SIDE_DESK = { desk: [0.6, 0.05, -90] };                 // desk right at Bud's left (far side from the side camera)
  var HAND_ON_SIDE_DESK = { lShoulder: [-1, -37, 23], lElbow: [0, 0, 0], lWrist: [0, 0, -32] };   // fingertips on the desk
  var FRONT_DESK_PUSH = { desk: [0, 1.6, 180] };
  var FRONT_WALL = { wall: [0, 1.05, 0] };
  var BACK_WALL = { wall: [0, -0.5, 0] };
  var HAPPY = { mouth: [0.55, 1] };
  // Seated on the chair (seat top 0.48): hips on the seat, thighs level, feet under the knees.
  var SEAT = { rootPos: [0, -0.39, -0.3], spine: [6, 0, 0], lFootPos: [0, 0, 0.14], rFootPos: [0, 0, 0.14] };
  var SEATED = M(SEAT, sym({ lShoulder: [-25, 0, -6], lElbow: [-38, 0, 0] }));              // hands rest on the thighs
  var SEAT_EDGE_R = { rShoulder: [10, 16, -15], rElbow: [-46, 0, 0] };   // right hand holds the seat edge

  var P = {};

  // ---------- idle and app moments ----------
  P.__idle = { duration: 4, camera: 'threeQuarter', keys: [{ t: 0, pose: {} }, { t: 1, pose: {} }] };
  P.__hello = {
    duration: 2.6, camera: 'threeQuarter', loop: false,
    keys: [
      { t: 0, pose: {} },
      { t: 0.16, ease: 'back', pose: { lShoulder: [-10, 0, 145], lElbow: [-25, 0, 18], mouth: [0.5, 1] } },
      { t: 0.32, pose: { lShoulder: [-10, 0, 145], lElbow: [-25, 0, -22], mouth: [0.5, 1], neck: [0, 0, -6] } },
      { t: 0.48, pose: { lShoulder: [-10, 0, 145], lElbow: [-25, 0, 22], mouth: [0.5, 1], neck: [0, 0, -6] } },
      { t: 0.64, pose: { lShoulder: [-10, 0, 145], lElbow: [-25, 0, -22], mouth: [0.5, 1] } },
      { t: 0.8, pose: { lShoulder: [-10, 0, 145], lElbow: [-25, 0, 18], mouth: [0.3, 1] } },
      { t: 1, pose: { mouth: [0, 0.9] } },
    ],
  };
  P.__celebrate = {
    duration: 1.2, camera: 'front',
    keys: [
      { t: 0, pose: M(sym({ lShoulder: [-5, 0, 150], lElbow: [-10, 0, 0] }), HAPPY, { eyes: [0, 0, 0.9] }) },
      { t: 0.5, ease: 'sine', pose: M(sym({ lShoulder: [-5, 0, 132], lElbow: [-30, 0, 0] }), HAPPY, { eyes: [0, 0, 0.9], spine: [0, 0, 5] }) },
      { t: 1, ease: 'sine', pose: M(sym({ lShoulder: [-5, 0, 150], lElbow: [-10, 0, 0] }), HAPPY, { eyes: [0, 0, 0.9] }) },
    ],
  };

  // =====================================================================
  // Neck
  // =====================================================================
  // Chin tuck: the head glides straight BACK along a horizontal line (no nod).
  (function () {
    // Lower neck tips back, skull base flexes the same amount: the head glides back, chin level.
    var TUCK = { neck: [-18, 0, 0], head: [18, 0, 0], headPos: [0, 0, -0.02], mouth: [0, 0.35] };
    P['chin-tuck'] = {
      duration: 7, camera: 'closeNeckSide', focus: ['neck', 'head'], trail: 'nose',
      beats: [[0, 'Glide back'], [0.21, 'Hold 5 s'], [0.79, 'Release']],
      stepAt: [0, 0.02, 0.21, 0.79],
      keys: [{ t: 0, pose: {} }, { t: 0.21, pose: TUCK }, { t: 0.79, ease: 'linear', pose: TUCK }, { t: 1, pose: {} }],
    };
  })();

  // Upper-trap stretch: ear toward shoulder, nose forward, opposite shoulder pressed down.
  (function () {
    var TRAP = M(SEATED, SEAT_EDGE_R, { neck: [0, 0, -20], head: [0, 0, -14], eyes: [0, 0, 0.55], mouth: [0, 0.4], rClav: [0, 0, -6] });
    P['upper-trap-side-stretch'] = {
      duration: 22.5, mirror: true, authored: 'l', camera: 'closeNeckSeated', focus: ['neck', 'head', 'rShoulder'], trail: 'headTop', props: { chair: [0, -0.36, 0] },
      beats: [[0, 'Ear to {side} shoulder'], [0.14, 'Hold, breathe'], [0.86, 'Come back slowly']],
      stepAt: [0, 0.03, 0.14, 0.86],
      keys: [{ t: 0, pose: M(SEATED, SEAT_EDGE_R) }, { t: 0.14, pose: TRAP }, { t: 0.86, ease: 'linear', pose: TRAP }, { t: 1, pose: M(SEATED, SEAT_EDGE_R) }],
    };
  })();

  // Levator scapulae: seated, head turned ~45 degrees, nose toward the armpit; other hand on the seat.
  (function () {
    var base = M(SEATED, SEAT_EDGE_R);
    var LEV = M(base, { neck: [14, 22, -6], head: [20, 22, 0], eyes: [0.3, -0.6, 0.4], mouth: [0, 0.4], rClav: [0, 0, -6], spine: [2, 4, 0] });
    P['levator-scapulae-stretch'] = {
      duration: 22.5, mirror: true, authored: 'l', camera: 'closeNeckSeated', focus: ['neck', 'head', 'rShoulder'], trail: 'nose', props: { chair: [0, -0.36, 0] },
      beats: [[0, 'Turn 45° to the {side}'], [0.08, 'Nose to armpit'], [0.16, 'Hold, breathe'], [0.86, 'Come back slowly']],
      stepAt: [0, 0.06, 0.12, 0.86],
      keys: [{ t: 0, pose: base }, { t: 0.07, pose: M(base, { neck: [0, 22, 0], head: [0, 22, 0] }) }, { t: 0.16, pose: LEV }, { t: 0.86, ease: 'linear', pose: LEV }, { t: 1, pose: base }],
    };
  })();

  // Neck rotation: slow single-plane turn, chin level, shoulders still. Never circles.
  (function () {
    var TURN = { neck: [0, 28, 0], head: [0, 30, 0], eyes: [0.5, 0, 0] };
    P['neck-rotation'] = {
      duration: 11, mirror: true, authored: 'l', camera: 'closeNeck', focus: ['neck', 'head'], trail: 'nose',
      beats: [[0, 'Turn {side}, slowly'], [0.27, 'Hold 5 s'], [0.73, 'Back to center']],
      stepAt: [0, 0.03, 0.27, 0.9],
      keys: [{ t: 0, pose: {} }, { t: 0.27, ease: 'sine', pose: TURN }, { t: 0.73, ease: 'linear', pose: TURN }, { t: 1, ease: 'sine', pose: {} }],
    };
  })();

  // =====================================================================
  // Shoulders / upper back
  // =====================================================================
  var ROLL = [
    [0, {}],
    [0.3, sym({ lClav: [0, -6, 20], lShoulder: [0, 0, 6] })],
    [0.55, M(sym({ lClav: [0, 26, 12], lShoulder: [10, 0, 8] }), { chest: [-5, 0, 0] })],
    [0.8, M(sym({ lClav: [0, 20, -6], lShoulder: [8, 0, 9] }), { chest: [-4, 0, 0] })],
    [1, {}],
  ];
  P['shoulder-rolls'] = {
    duration: 3.2, camera: 'closeShoulders', focus: ['lShoulder', 'rShoulder'], trail: 'lShoulder',
    beats: [[0, 'Up'], [0.3, 'Back'], [0.55, 'Down'], [0.8, 'Around']],
    stepAt: [0, 0.02, 0.3, 0.55],
    keys: ROLL.map(function (k) { return { t: k[0], ease: 'sine', pose: k[1] }; }),
  };

  P['shoulder-shrug-release'] = (function () {
    var up = M(sym({ lClav: [0, 0, 24], lShoulder: [0, 0, 4] }), { breath: [0.8], mouth: [0, 0.3] });
    var drop = { breath: [0], mouth: [0.3, 0.5], eyes: [0, 0, 0.5] };
    return M(tempo([[2, up], [4, up, 'linear'], [0.35, M(drop, sym({ lClav: [0, 0, -5] })), 'in'], [0.4, drop, 'out'], [1.25, drop, 'linear']]), {
      camera: 'closeShoulders', focus: ['lShoulder', 'rShoulder', 'neck'], trail: 'lShoulder',
      beats: [[0, 'Inhale, shoulders up'], [0.25, 'Hold'], [0.75, 'Exhale, drop!']], stepAt: [0, 0.02, 0.25, 0.75],
    });
  })();

  (function () {
    var A = sym({ lShoulder: [6, 0, 12], lElbow: [-90, 0, 0], lWrist: [0, 70, 0] });
    var B = M(sym({ lClav: [0, 24, -4], lShoulder: [24, 28, 14], lElbow: [-90, 0, 0], lWrist: [0, 70, 0] }), { chest: [-6, 0, 0], mouth: [0, 0.5] });
    P['scapular-squeeze'] = {
      duration: 6, camera: 'high', focus: ['lShoulder', 'rShoulder'], trail: 'lElbow',
      beats: [[0, 'Blades back & down'], [0.25, 'Hold 5 s'], [0.84, 'Release']],
      stepAt: [0, 0.02, 0.25, 0.84],
      keys: [{ t: 0, pose: A }, { t: 0.18, pose: B }, { t: 0.84, ease: 'linear', pose: B }, { t: 1, pose: A }],
    };
  })();

  // =====================================================================
  // Lower back / hips
  // =====================================================================
  (function () {
    var EXT = M(HANDS_LOW_BACK_EXT, { spine: [-16, 0, 0], chest: [-8, 0, 0], neck: [8, 0, 0], head: [6, 0, 0], rootPos: [0, 0, 0.05], mouth: [0.25, 0.5] });
    P['standing-back-extension'] = {
      duration: 5.8, camera: 'side', focus: ['spine', 'chest'], trail: 'chest',
      beats: [[0, 'Lean back gently'], [0.35, 'Hold'], [0.86, 'Back up tall']],
      stepAt: [0, 0.02, 0.35, 0.86],
      keys: [{ t: 0, pose: HANDS_LOW_BACK }, { t: 0.35, pose: EXT }, { t: 0.86, ease: 'linear', pose: EXT }, { t: 1, pose: HANDS_LOW_BACK }],
    };
  })();

  P['standing-hip-flexor-stretch'] = (function () {
    var base = M(ARMS_HIPS, { lFootPos: [0, 0, -0.4], rFootPos: [0, 0, 0.22], rootPos: [0, -0.06, -0.06] });
    var hold = M(base, { rootPos: [0, -0.1, 0.03], root: [-8, 0, 0], spine: [6, 0, 0], mouth: [0, 0.5] });
    return {
      duration: 30, mirror: true, mirrorCamera: false, authored: 'l', camera: 'side', focus: ['lHip'], trail: 'hips',
      beats: [[0, 'Step {side} foot back'], [0.12, 'Tuck tailbone'], [0.2, 'Hold 20-30 s'], [0.9, 'Step back in']],
      stepAt: [0, 0.06, 0.12, 0.9],
      keys: [{ t: 0, pose: {} }, { t: 0.07, pose: base }, { t: 0.16, pose: hold }, { t: 0.88, ease: 'linear', pose: hold }, { t: 0.97, pose: {} }, { t: 1, pose: {} }],
    };
  })();

  P['standing-cat-cow'] = (function () {
    var setup = { rootPos: [0, -0.06, -0.12], neck: [-30, 0, 0] };
    var cow = M(setup, sym({ lShoulder: [-67, 0, 2], lElbow: [-3, 0, 0] }), { spine: [36, 0, 0], chest: [-14, 0, 0], neck: [-38, 0, 0], root: [8, 0, 0], mouth: [0, 0.8] });
    var cat = M(setup, sym({ lShoulder: [-99, 0, 3], lElbow: [0, 0, 0] }), { spine: [50, 0, 0], chest: [22, 0, 0], neck: [6, 0, 0], root: [-10, 0, 0], eyes: [0, -0.4, 0.4], mouth: [0, 0.2] });
    return {
      duration: 4.4, camera: 'sideWide', focus: ['spine', 'chest'], trail: 'chest', props: { desk: [0, 0.75, 180] },
      beats: [[0, 'Inhale: chest up'], [0.5, 'Exhale: round']],
      stepAt: [0, 0.0, 0.5, 2],
      keys: [{ t: 0, pose: cow }, { t: 0.45, ease: 'sine', pose: cow }, { t: 0.5, pose: cow }, { t: 0.95, ease: 'sine', pose: cat }, { t: 1, pose: cow }],
    };
  })();

  // =====================================================================
  // Wrists / hands
  // =====================================================================
  // Authored on Bud's right arm: palm up, other hand eases fingers down; then palm down.
  P['wrist-flexor-extensor-stretch'] = (function () {
    var up0 = { rShoulder: [-84, -90, 0], rElbow: [0, 0, 0], lShoulder: [-58, 0, -34], lElbow: [-62, 0, 0] };
    var up1 = M(up0, { rWrist: [0, 0, -55], rFingers: [0, 0, -5], chest: [0, -10, 0], lClav: [0, -30, 0], lShoulder: [-35, 68, -40], lElbow: [-2, 0, 0], eyes: [-0.3, -0.3, 0.2], mouth: [0, 0.5] });
    var dn0 = { rShoulder: [-84, 90, 0], rElbow: [0, 0, 0], lShoulder: [-58, 0, -34], lElbow: [-62, 0, 0] };
    var dn1 = M(dn0, { rWrist: [0, 0, 55], rFingers: [0, 0, 10], chest: [0, -10, 0], lClav: [0, -30, 0], lShoulder: [-35, 67, -40], lElbow: [-4, 0, 0], eyes: [-0.3, -0.3, 0.2], mouth: [0, 0.5] });
    return {
      duration: 36, mirror: true, authored: 'r', camera: 'closeHands', focus: ['rWrist'], trail: 'rFingers',
      beats: [[0, '{side} arm out, palm up'], [0.1, 'Fingers down, hold'], [0.47, 'Flip: palm down'], [0.57, 'Hold 15 s'], [0.94, 'Relax']],
      stepAt: [0, 0.07, 0.47, 0.94],
      keys: [{ t: 0, pose: {} }, { t: 0.06, pose: up0 }, { t: 0.1, pose: up1 }, { t: 0.47, ease: 'linear', pose: up1 },
        { t: 0.52, pose: dn0 }, { t: 0.57, pose: dn1 }, { t: 0.94, ease: 'linear', pose: dn1 }, { t: 1, pose: {} }],
    };
  })();

  // Tendon glides (optional item): open, hook, table-top, fist, 3 s each.
  P['tendon-glides'] = (function () {
    var arm = { lShoulder: [-40, 0, 14], lElbow: [-100, 0, 0], eyes: [0.35, -0.1, 0] };
    function f(fing, wr) { return M(arm, { lFingers: [0, 0, fing], lWrist: [0, 0, wr || 0] }); }
    var t = tempo([[0.3, f(10)], [2.7, f(10), 'linear'], [0.3, f(-95)], [2.7, f(-95), 'linear'], [0.3, f(-80, 20)], [2.7, f(-80, 20), 'linear'], [0.3, f(-150)], [2.7, f(-150), 'linear']]);
    return M(t, {
      mirror: true, blockSides: true, authored: 'l', camera: { az: 42, el: 12, dist: 3.0, ty: 1.3, tz: 0.25 }, focus: ['lWrist'], trail: 'lFingers',
      beats: [[0, 'Open hand'], [0.25, 'Hook'], [0.5, 'Table-top'], [0.75, 'Fist']], stepAt: [0, 0.25, 0.75, 2],
    });
  })();

  // =====================================================================
  // Eyes
  // =====================================================================
  P['twenty-twenty-twenty'] = (function () {
    var look = { spine: [-4, 0, 0], neck: [-6, 34, 0], head: [0, 6, 0], eyes: [0.85, 0.35, 0.05], mouth: [0, 0.6] };
    var blink = M(look, { eyes: [0.85, 0.35, 1] });
    var keys = [{ t: 0, pose: {} }, { t: 0.1, pose: look }];
    [0.32, 0.52, 0.72].forEach(function (b) {
      keys.push({ t: b, ease: 'linear', pose: look }); keys.push({ t: b + 0.03, pose: blink }); keys.push({ t: b + 0.06, pose: look });
    });
    keys.push({ t: 0.9, ease: 'linear', pose: look }); keys.push({ t: 1, pose: {} });
    return {
      duration: 22, camera: 'closeFace',
      beats: [[0, 'Look far away'], [0.1, '6 m / 20 ft away'], [0.3, 'Blink softly'], [0.9, 'Back to screen']],
      stepAt: [0, 0.06, 0.12, 0.9], keys: keys,
    };
  })();

  P['blink-reset'] = (function () {
    var base = { neck: [4, 14, 0], mouth: [0, 0.5] };
    return {
      duration: 1.8, camera: 'closeFace',
      beats: [[0, 'Close slowly'], [0.4, 'Squeeze lightly'], [0.72, 'Open']],
      stepAt: [0, 0.0, 0.72, 2],
      keys: [{ t: 0, pose: M(base, { eyes: [0, 0, 0] }) }, { t: 0.38, ease: 'sine', pose: M(base, { eyes: [0, 0, 0.95] }) },
        { t: 0.5, pose: M(base, { eyes: [0, 0, 1.1] }) }, { t: 0.7, ease: 'linear', pose: M(base, { eyes: [0, 0, 1.1] }) },
        { t: 1, ease: 'sine', pose: M(base, { eyes: [0, 0, 0] }) }],
    };
  })();

  // Complete blinks: one gentle full closure every 3 s.
  P['eyes-complete-blink-pause'] = (function () {
    var base = { neck: [2, -10, 0], eyes: [-0.2, 0, 0], mouth: [0, 0.5], idle: [0.4] };
    var t = tempo([[0.7, M(base, { eyes: [-0.2, 0, 1] }), 'sine'], [0.25, M(base, { eyes: [-0.2, 0, 1] }), 'linear'], [0.7, base, 'sine'], [1.35, base, 'linear']]);
    return M(t, { camera: 'closeFace', beats: [[0, 'Close fully'], [0.55, 'Open'], [0.77, 'Breathe']], stepAt: [0, 0, 0, 2] });
  })();

  // Screen check: look at the laptop, push it to arm's length, tilt the lid, nod.
  P['eyes-screen-setup-check'] = (function () {
    var look = { neck: [16, 0, 0], eyes: [0, -0.5, 0], mouth: [0, 0.5] };
    var reach = M(look, { spine: [22, 0, 0] }, sym({ lShoulder: [-59, 0, 1], lElbow: [-7, 0, 0] }));
    var push = M(reach, { laptop: [0.08, 0], spine: [24, 0, 0] }, sym({ lShoulder: [-68, 0, 0], lElbow: [-2, 0, 0] }));
    var tilt = M(push, { laptop: [0.08, -12] });
    var back = M(look, { laptop: [0.08, -12], neck: [10, 0, 0] });
    var nod = M(back, { neck: [20, 0, 0], mouth: [0.4, 1] });
    var t = tempo([[1.5, look], [4, look, 'linear'], [1.5, reach], [2, push], [3, push, 'linear'], [2, tilt], [3, tilt, 'linear'], [1.5, back], [5, back, 'linear'], [0.5, nod], [0.5, back], [3, back, 'linear'], [2.5, {}]]);
    return M(t, {
      camera: 'threeQuarter', focus: ['neck', 'head'], props: { desk: [0, 0.5, 180] },
      beats: [[0, 'Check the distance'], [0.2, 'Arm\'s length'], [0.4, 'Tilt off the glare'], [0.62, 'Text easy to read?']],
      stepAt: [0, 0.05, 0.4, 0.62],
    });
  })();

  // =====================================================================
  // Strength snacks: sit-to-stand and squats
  // =====================================================================
  P['chair-sit-to-stand'] = (function () {
    var seat = M(ARMS_CROSSED, SEAT);
    var lean = M(seat, { spine: [36, 0, 0], neck: [-18, 0, 0], rootPos: [0, -0.37, -0.28] });
    var mid = M(ARMS_CROSSED, { rootPos: [0, -0.2, -0.2], spine: [30, 0, 0], neck: [-14, 0, 0], lFootPos: [0, 0, 0.14], rFootPos: [0, 0, 0.14] });
    var up = M(ARMS_CROSSED, { lFootPos: [0, 0, 0.14], rFootPos: [0, 0, 0.14], squash: [-0.4], mouth: [0.35, 1] });
    return {
      duration: 4.5, camera: 'threeQuarter', focus: ['lKnee', 'rKnee', 'lHip', 'rHip'], trail: 'hips', props: { chair: [0, -0.36, 0] },
      beats: [[0, 'Lean forward'], [0.1, 'Stand up'], [0.4, 'Squeeze glutes'], [0.48, 'Lower slowly'], [0.93, 'Touch & go']],
      stepAt: [0, 0.08, 0.48, 0.95],
      keys: [{ t: 0, pose: seat }, { t: 0.08, pose: lean }, { t: 0.4, ease: 'back', pose: up }, { t: 0.48, pose: M(up, { squash: [0] }) },
        { t: 0.74, pose: mid }, { t: 0.93, pose: seat }, { t: 0.96, ease: 'out', pose: M(seat, { squash: [0.5] }) }, { t: 1, pose: seat }],
    };
  })();

  // Squat shapes by depth (0..1, 1 = thighs about parallel) and stance.
  function squatPose(depth, stance, arms) {
    var p = M(arms || ARMS_FWD, {
      rootPos: [0, -0.36 * depth, -0.2 * depth], spine: [32 * depth, 0, 0], neck: [-20 * depth, 0, 0], mouth: [0, 0.6],
    });
    if (stance === 'sumo') {
      p = M(p, sym({ lHip: [0, 8, 26] }), { rootPos: [0, -0.06 - 0.3 * depth, -0.04 * depth], spine: [10 * depth, 0, 0], neck: [-6 * depth, 0, 0] });
    } else if (stance === 'wide') {
      p = M(p, sym({ lHip: [0, 12, 8] }), { rootPos: [0, -0.01 - 0.36 * depth, -0.2 * depth] });
    }
    return p;
  }
  function squatStand(stance, arms) { return squatPose(0, stance, arms); }
  var TOES = { rootPos: [0, 0.07, 0], lFootPos: [0, 0.07, 0], rFootPos: [0, 0.07, 0], heels: [40], squash: [-0.25] };
  var LEGS = ['lKnee', 'rKnee', 'lHip', 'rHip'];

  P['mini-squat'] = (function () {
    var up = squatStand(), dn = squatPose(0.4);
    return M(tempo([[1.5, dn], [1, dn, 'linear'], [1.2, M(up, { squash: [-0.15] }), 'out'], [0.5, up]]), {
      camera: 'threeQuarter', focus: LEGS, trail: 'hips',
      beats: [[0, 'Quarter squat'], [0.36, 'Pause, chest up'], [0.6, 'Stand tall']], stepAt: [0, 0.0, 0.36, 0.6],
    });
  })();
  P['bodyweight-squat'] = (function () {
    var up = squatStand('wide'), dn = squatPose(1, 'wide');
    return M(tempo([[2, dn], [0.3, dn, 'linear'], [1.5, M(up, { squash: [-0.2] }), 'out'], [0.7, up]]), {
      camera: 'threeQuarter', focus: LEGS, trail: 'hips',
      beats: [[0, 'Hips back & down'], [0.45, 'Knees over toes'], [0.51, 'Stand up']], stepAt: [0, 0.0, 0.45, 0.51],
    });
  })();
  P['sumo-squat'] = (function () {
    var up = squatStand('sumo', ARMS_CROSSED), dn = squatPose(0.85, 'sumo', ARMS_CROSSED);
    return M(tempo([[2, dn], [0.3, dn, 'linear'], [1.5, M(up, { squash: [-0.2] }), 'out'], [0.7, up]]), {
      camera: 'front', focus: LEGS, trail: 'hips',
      beats: [[0, 'Hips straight down'], [0.45, 'Knees out'], [0.51, 'Squeeze & stand']], stepAt: [0, 0.0, 0.45, 0.51],
    });
  })();
  P['slow-tempo-squat'] = (function () {
    var up = squatStand(), dn = squatPose(0.85);
    return M(tempo([[3, dn, 'linear'], [1, dn, 'linear'], [1.5, M(up, { squash: [-0.15] })], [1.5, up, 'linear']]), {
      camera: 'threeQuarter', focus: LEGS, trail: 'hips',
      beats: [[0, 'Down: 3, 2, 1'], [0.43, 'Pause 1 s'], [0.57, 'Stand up']], stepAt: [0, 0.0, 0.43, 0.57],
    });
  })();
  P['squat-to-calf-raise'] = (function () {
    var up = squatStand(), dn = squatPose(0.8);
    return M(tempo([[1.5, dn], [1, dn, 'linear'], [1.2, up], [0.6, M(up, TOES)], [0.6, M(up, TOES), 'linear'], [1, up]]), {
      camera: 'side', focus: ['lKnee', 'rKnee', 'lAnkle', 'rAnkle'], trail: 'hips',
      beats: [[0, 'Squat down'], [0.25, 'Pause'], [0.43, 'Stand'], [0.64, 'Up on toes'], [0.85, 'Heels down']], stepAt: [0, 0.0, 0.25, 0.64],
    });
  })();

  // Static split squat: feet split, body goes straight down, back knee toward the floor.
  P['split-squat-static'] = (function () {
    var up = M(HAND_ON_SIDE_DESK, { lFootPos: [0, 0, 0.3], rFootPos: [0, 0.02, -0.42], heels: [0] });
    var dn = M(up, { rootPos: [0, -0.25, -0.04], spine: [4, 0, 0], mouth: [0, 0.4] });
    return M(tempo([[2.5, dn], [0.5, dn, 'linear'], [2, M(up, { squash: [-0.1] })], [1.25, up]]), {
      mirror: true, blockSides: true, authored: 'l', camera: 'side', focus: ['lKnee', 'rKnee', 'lHip'], trail: 'hips', props: SIDE_DESK,
      beats: [[0, 'Back knee down'], [0.4, 'Front knee over ankle'], [0.48, 'Push up']], stepAt: [0, 0.0, 0.4, 0.48],
    });
  })();

  P['wall-sit'] = (function () {
    var sit = M(ARMS_CROSSED, { rootPos: [0, -0.4, -0.3], spine: [-2, 0, 0], lFootPos: [0, 0, 0.12], rFootPos: [0, 0, 0.12], mouth: [0, 0.4] });
    var stand = M(ARMS_CROSSED, { rootPos: [0, 0, -0.3], spine: [-2, 0, 0], lFootPos: [0, 0, -0.1], rFootPos: [0, 0, -0.1] });
    return M(tempo([[2.5, sit], [20, sit, 'linear'], [2.5, stand], [0, stand, 'linear']]), {
      camera: 'side', focus: LEGS, props: BACK_WALL,
      beats: [[0, 'Slide down'], [0.1, 'Hold, breathe'], [0.9, 'Slide up']], stepAt: [0, 0.02, 0.1, 0.9],
    });
  })();
  P['wall-sit-shallow'] = (function () {
    var sit = M(ARMS_CROSSED, { rootPos: [0, -0.14, -0.3], spine: [-2, 0, 0], lFootPos: [0, 0, -0.02], rFootPos: [0, 0, -0.02], mouth: [0, 0.5] });
    var stand = M(ARMS_CROSSED, { rootPos: [0, 0, -0.3], spine: [-2, 0, 0], lFootPos: [0, 0, -0.1], rFootPos: [0, 0, -0.1] });
    return M(tempo([[2, sit], [15, sit, 'linear'], [2, stand], [3, stand, 'linear']]), {
      camera: 'side', focus: LEGS, props: BACK_WALL,
      beats: [[0, 'Slide down a little'], [0.09, 'Hold, breathe'], [0.77, 'Up & rest']], stepAt: [0, 0.02, 0.09, 0.77],
    });
  })();

  // =====================================================================
  // Push-ups (desk, wall)
  // =====================================================================
  // Body stays one straight line, pivoting at the feet; hands stay on the edge.
  function pushup(o) {
    var top = M(sym({ lShoulder: [o.topSh, 0, o.topZ], lElbow: [-6, 0, 0], lAnkle: [-o.topPivot, 0, 0] }),
      { pivot: [o.topPivot, 0, 0], ik: [0], neck: [-12, 0, 0], idle: [0] });
    var down = M(sym({ lShoulder: [o.dnSh[0], 0, o.dnSh[1]], lElbow: [o.dnElbow, 0, 0], lAnkle: [-o.dnPivot, 0, 0] }),
      { pivot: [o.dnPivot, 0, 0], ik: [0], neck: [-14, 0, 0], idle: [0], mouth: [0.3, 0.3] });
    return M(tempo([[o.down, down, 'sine'], [o.pause, down, 'linear'], [o.up, top, 'out'], [o.top, top, 'linear']]), {
      camera: 'sideWide', focus: ['lShoulder', 'lElbow', 'rShoulder', 'rElbow'], trail: 'chest', props: o.props,
    });
  }
  // Arm angles solved so the palms stay on the desk edge (hands 0.56 apart; wide 0.9; narrow 0.4).
  var DESK_PU = { topPivot: 40, topSh: -89, topZ: 2, dnPivot: 46, dnSh: [-49, 6], dnElbow: -87, props: FRONT_DESK_PUSH };
  P['desk-push-up'] = M(pushup(M(DESK_PU, { down: 1.7, pause: 0.3, up: 1.3, top: 0.7 })), {
    beats: [[0, 'Lower, 2 s'], [0.43, 'Pause'], [0.5, 'Press up'], [0.83, 'Straight line']], stepAt: [0, 0.0, 0.43, 0.83],
  });
  P['desk-push-up-slow'] = M(pushup(M(DESK_PU, { down: 3, pause: 0.3, up: 1, top: 0.7 })), {
    beats: [[0, 'Lower: 3, 2, 1'], [0.6, 'Press up, 1 s'], [0.86, 'Brace']], stepAt: [0, 0.0, 0.6, 0.86],
  });
  P['desk-push-up-wide'] = M(pushup(M(DESK_PU, { topZ: 22, dnSh: [-49, 30], dnElbow: -80, down: 1.8, pause: 0.2, up: 1.4, top: 0.6 })), {
    camera: 'pushThreeQuarter', beats: [[0, 'Wide hands, lower'], [0.5, 'Press up']], stepAt: [0, 0.0, 0.5, 2],
  });
  P['desk-push-up-narrow'] = M(pushup(M(DESK_PU, { topZ: -6, dnSh: [-49, -10], dnElbow: -87, down: 2, pause: 0.2, up: 1.5, top: 0.8 })), {
    camera: 'pushThreeQuarter', beats: [[0, 'Elbows brush sides'], [0.49, 'Press up']], stepAt: [0, 0.0, 0.49, 2],
  });
  var WALL_PU = { topPivot: 19, topSh: -88, topZ: 2, dnPivot: 24, dnSh: [-52, 5], dnElbow: -78, props: FRONT_WALL };
  P['wall-push-up'] = M(pushup(M(WALL_PU, { down: 2, pause: 0.2, up: 1.4, top: 0.4 })), {
    beats: [[0, 'Chest to wall, 2 s'], [0.58, 'Press away']], stepAt: [0, 0.0, 0.58, 0.9],
  });
  P['wall-push-hold'] = (function () {
    var lean = M(sym({ lShoulder: [-47, 0, 6], lElbow: [-90, 0, 0], lAnkle: [-26, 0, 0] }), { pivot: [26, 0, 0], ik: [0], idle: [0], neck: [-10, 0, 0], tense: [0.35] });
    var out = M(sym({ lShoulder: [-88, 0, 2], lElbow: [-6, 0, 0], lAnkle: [-19, 0, 0] }), { pivot: [19, 0, 0], ik: [0], idle: [0], neck: [-10, 0, 0] });
    return M(tempo([[1.2, lean], [10, lean, 'linear'], [1.2, out], [2.6, {}, 'inOut']]), {
      camera: 'sideWide', focus: ['lShoulder', 'lElbow', 'rShoulder', 'rElbow'], props: FRONT_WALL,
      beats: [[0, 'Lean in, elbows 90°'], [0.08, 'Push & hold 10 s'], [0.75, 'Step back, rest']], stepAt: [0, 0.0, 0.08, 0.75],
    });
  })();

  // =====================================================================
  // Calves, balance, hips (hand resting on a desk at Bud's right)
  // =====================================================================
  var CALF_HAND = HAND_ON_SIDE_DESK;
  function calf(o) {
    var base = M(CALF_HAND, o.base || {});
    var up = M(base, { rootPos: [0, 0.07 + (o.dy || 0), 0], lFootPos: [0, 0.07, 0], rFootPos: [0, 0.07, 0], heels: [40], squash: [-0.2], mouth: [0.2, 0.9] }, o.upExtra || {});
    if (o.dy) base = M(base, { rootPos: [0, o.dy, 0] });
    return M(tempo([[o.up, up], [o.top, up, 'linear'], [o.down, base, o.down > 2 ? 'linear' : 'inOut'], [o.bottom, base, 'linear']]), {
      camera: 'side', focus: ['lAnkle', 'rAnkle'], trail: 'rAnkle', props: SIDE_DESK,
    });
  }
  P['calf-raises'] = M(calf({ up: 2, top: 1, down: 3, bottom: 0.3 }), {
    beats: [[0, 'Rise up, 2 s'], [0.32, 'Hold'], [0.48, 'Lower slowly, 3 s']], stepAt: [0, 0.0, 0.32, 0.48],
  });
  P['calf-raise-slow-eccentric'] = M(calf({ up: 1, top: 0.2, down: 4, bottom: 0.3 }), {
    beats: [[0, 'Up in 1 s'], [0.22, 'Down: 4, 3, 2, 1']], stepAt: [0, 0.0, 0.22, 2],
  });
  P['calf-raise-bent-knee'] = M(calf({ up: 2, top: 1, down: 3, bottom: 0.3, dy: -0.09 }), {
    beats: [[0, 'Knees bent, rise'], [0.32, 'Hold'], [0.48, 'Lower, knees stay bent']], stepAt: [0, 0.0, 0.32, 0.48],
  });
  P['calf-raise-single-leg'] = (function () {
    var lift = { rFootPos: [0, 0.14, -0.16] };
    var p = calf({ up: 2, top: 1, down: 3, bottom: 0.3, base: lift, upExtra: { rFootPos: [0, 0.21, -0.16] } });
    return M(p, {
      mirror: true, blockSides: true, authored: 'l', focus: ['lAnkle'], trail: 'lAnkle',
      beats: [[0, 'On {side} foot, rise'], [0.32, 'Hold'], [0.48, 'Lower, 3 s']], stepAt: [0, 0.0, 0.32, 0.48],
    });
  })();

  P['standing-hip-abduction'] = (function () {
    var base = M(CALF_HAND, { ik: [0], idle: [0.3], lKnee: [4, 0, 0], lHip: [-2, 0, 0] });
    var up = M(base, { rHip: [0, 0, -32], rAnkle: [0, 0, 12], lHip: [0, 0, 4], mouth: [0, 0.5] });
    return M(tempo([[1.4, up], [0.4, up, 'linear'], [1.6, base], [0.35, base, 'linear']]), {
      mirror: true, blockSides: true, authored: 'r', camera: 'front', focus: ['rHip'], trail: 'rAnkle', props: SIDE_DESK,
      beats: [[0, 'Leg out to the side'], [0.37, 'Lower slowly']], stepAt: [0, 0.0, 0.37, 0.48],
    });
  })();

  P['standing-knee-raise'] = (function () {
    var base = M(CALF_HAND, { ik: [0], lKnee: [3, 0, 0] });
    var up = M(base, { rHip: [-82, 0, 0], rKnee: [92, 0, 0], rAnkle: [8, 0, 0], mouth: [0, 0.7] });
    return M(tempo([[1, up], [2, up, 'linear'], [1, base]]), {
      mirror: true, blockSides: true, authored: 'r', camera: 'side', focus: ['rHip', 'rKnee'], trail: 'rKnee', props: SIDE_DESK,
      beats: [[0, 'Knee up slowly'], [0.25, 'Hold 2 s'], [0.75, 'Lower']], stepAt: [0, 0.0, 0.25, 0.75],
    });
  })();

  function balance(hands, hold) {
    var base = M(hands, { ik: [0], lKnee: [4, 0, 0], idle: [0.3] });
    var up = M(base, { rHip: [-14, 0, 0], rKnee: [48, 0, 0], rAnkle: [10, 0, 0], mouth: [0, 0.5] });
    var wob = M(up, { spine: [0, 0, -2.5] });
    var list = [[0.8, up]];
    var n = Math.round(hold / 2.5);
    for (var i = 0; i < n; i++) { list.push([hold / n / 2, wob, 'sine']); list.push([hold / n / 2, up, 'sine']); }
    list.push([0.8, base]); list.push([0.4, base, 'linear']);
    return tempo(list);
  }
  P['single-leg-balance-support'] = M(balance(CALF_HAND, 15), {
    mirror: true, authored: 'r', camera: 'front', focus: ['lAnkle', 'lKnee', 'lHip'], props: SIDE_DESK,
    beats: [[0, 'Lift {side} foot'], [0.05, 'Hold, eyes ahead'], [0.93, 'Switch']], stepAt: [0, 0.02, 0.05, 0.93],
  });
  P['single-leg-balance-free'] = M(balance(ARMS_CROSSED, 20), {
    mirror: true, authored: 'r', camera: 'front', focus: ['lAnkle', 'lKnee', 'lHip'], props: { desk: [1.05, 0.05, -90] },
    beats: [[0, 'Lift {side} foot'], [0.04, 'Balance, fixed point'], [0.94, 'Switch']], stepAt: [0, 0.02, 0.04, 0.94],
  });

  // =====================================================================
  // Cardio and VO2 snacks
  // =====================================================================
  function marchKeys(knee, arms) {
    var mid = M(sym({ lShoulder: [0, 0, 10], lElbow: [-75, 0, 0] }), { ik: [0], rootPos: [0, -0.01, 0], idle: [0] });
    var A = { ik: [0], idle: [0], lHip: [-knee, 0, 0], lKnee: [knee * 1.25, 0, 0], lAnkle: [14, 0, 0], rKnee: [2, 0, 0],
      rShoulder: [-arms, 0, -10], rElbow: [-78, 0, 0], lShoulder: [arms * 0.75, 0, 10], lElbow: [-72, 0, 0], rootPos: [0, 0.03, 0], spine: [0, -5, 0], mouth: [0.2, 1] };
    var B = mirror(A);
    return [{ t: 0, pose: mid }, { t: 0.25, ease: 'sine', pose: A }, { t: 0.5, ease: 'sine', pose: mid }, { t: 0.75, ease: 'sine', pose: B }, { t: 1, ease: 'sine', pose: mid }];
  }
  P['march-in-place'] = {
    duration: 1.2, camera: 'threeQuarter', focus: ['lHip', 'lKnee', 'rHip', 'rKnee'], trail: 'lKnee',
    stepAt: [0, 0.0, 0.5, 2], keys: marchKeys(62, 38),
  };
  // 30 s fast high-knee march, 60 s easy march (macro speeds), x2.
  P['vo2-fast-march'] = {
    duration: 1.2, camera: 'threeQuarter', focus: ['lHip', 'lKnee', 'rHip', 'rKnee'], trail: 'lKnee',
    keys: marchKeys(78, 48), repSec: 90,
    macro: { duration: 90, speeds: [[0, 1.6], [30, 0.85]], beats: [[0, 'Fast! Knees up'], [20, 'Soft landings'], [30, 'Easy march'], [80, 'Get ready']] },
    stepSec: [0, 3, 12, 30],
  };

  function walkKeys() {
    var C1 = { ik: [0], idle: [0], scroll: [1], lHip: [-26, 0, 0], lKnee: [6, 0, 0], lAnkle: [-6, 0, 0], rHip: [22, 0, 0], rKnee: [14, 0, 0], rAnkle: [8, 0, 0],
      rShoulder: [-26, 0, -8], rElbow: [-30, 0, 0], lShoulder: [22, 0, 8], lElbow: [-30, 0, 0], rootPos: [0, -0.025, 0], spine: [3, -6, 0], mouth: [0.15, 1] };
    var P1 = { ik: [0], idle: [0], scroll: [1], lHip: [-4, 0, 0], lKnee: [4, 0, 0], rHip: [-18, 0, 0], rKnee: [58, 0, 0], rAnkle: [6, 0, 0],
      rShoulder: [0, 0, -8], rElbow: [-30, 0, 0], lShoulder: [0, 0, 8], lElbow: [-30, 0, 0], rootPos: [0, 0.03, 0], spine: [3, 0, 0], mouth: [0.15, 1] };
    var C2 = mirror(C1), P2 = mirror(P1);
    return [{ t: 0, pose: C1 }, { t: 0.25, ease: 'linear', pose: P1 }, { t: 0.5, ease: 'linear', pose: C2 }, { t: 0.75, ease: 'linear', pose: P2 }, { t: 1, ease: 'linear', pose: C1 }];
  }
  P['walk-5-min'] = { duration: 1.1, camera: 'side', focus: ['lHip', 'rHip'], trail: 'lAnkle', stepAt: [0, 0.0, 0.5, 2], keys: walkKeys() };
  // 60 s brisk + 60 s easy, x3.
  P['vo2-brisk-walk-intervals'] = {
    duration: 1.1, camera: 'side', focus: ['lHip', 'rHip'], trail: 'lAnkle', keys: walkKeys(), repSec: 120,
    macro: { duration: 120, speeds: [[0, 1.45], [60, 0.8]], beats: [[0, 'Brisk! Talk, not sing'], [60, 'Easy pace'], [110, 'Brisk again soon']] },
    stepSec: [0, 1, 60, 110],
  };
  // 30 s of fast squat + calf raise reps (1.875 s each), then 45 s standing rest; x2.
  P['vo2-squat-calf-burst'] = (function () {
    var up = squatStand(), dn = squatPose(0.75);
    var t = tempo([[0.6, dn], [0.55, up, 'out'], [0.35, M(up, TOES)], [0.375, up]]);
    return M(t, {
      camera: 'threeQuarter', focus: ['lKnee', 'rKnee', 'lAnkle', 'rAnkle'], trail: 'hips', repSec: 75,
      macro: { duration: 75, speeds: [[0, 1], [30, 0]], beats: [[0, 'Squat, up on toes!'], [30, 'Rest, breathe'], [70, 'Ready?']] },
      stepSec: [0, 1, 4, 30],
    });
  })();

  // =====================================================================
  // Breath, water, resets
  // =====================================================================
  // Cyclic sighing: inhale 2 s, top-up 1 s, long exhale 6 s (9 s cycle).
  P['cyclic-sighing'] = (function () {
    var calm = { eyes: [0, 0, 0.55], idle: [0.3] };
    function br(v, mouth) { return M(calm, sym({ lShoulder: [0, 0, 9 + 12 * v] }), { breath: [v], neck: [-5 * v, 0, 0], mouth: mouth }); }
    return {
      duration: 9, camera: 'front', focus: ['spine', 'chest'],
      beats: [[0, 'Inhale (nose)'], [0.222, 'Top-up sip'], [0.333, 'Long exhale (mouth)']],
      stepAt: [0, 0.0, 0.222, 0.333],
      keys: [{ t: 0, pose: br(0, [0, 0.4]) }, { t: 0.222, ease: 'sine', pose: br(0.8, [0, 0.3]) }, { t: 0.333, ease: 'sine', pose: br(1, [0, 0.3]) },
        { t: 0.4, ease: 'sine', pose: br(0.88, [0.55, 0]) }, { t: 0.95, ease: 'sine', pose: br(0.02, [0.35, 0]) }, { t: 1, pose: br(0, [0, 0.4]) }],
    };
  })();

  P['drink-water'] = (function () {
    var hold = { rShoulder: [-8, 0, -6], rElbow: [-85, 0, 0], glass: [1, 1] };
    var sip0 = { rShoulder: [-30, 25, 22], rElbow: [-120, 0, 0], rWrist: [26, 0, -18], neck: [12, 0, 0], spine: [8, 0, 0], glass: [1, 1], eyes: [0, 0, 0.75], mouth: [0, 0.2] };
    var sip1 = M(sip0, { glass: [1, 0.5] });
    return {
      duration: 8, camera: 'threeQuarterR', focus: ['rElbow'],
      beats: [[0, 'Grab your glass'], [0.19, 'Sip, sip'], [0.62, 'Ahh, nice']],
      stepAt: [0, 0.0, 0.19, 0.62],
      keys: [{ t: 0, pose: hold }, { t: 0.19, pose: sip0 }, { t: 0.56, ease: 'linear', pose: sip1 },
        { t: 0.72, pose: M(hold, { glass: [1, 0.5] }) }, { t: 0.95, pose: M(hold, { glass: [1, 0.5], mouth: [0.45, 1] }) }, { t: 1, pose: hold }],
    };
  })();

  // Stand, shake out arms and legs 10 s, 5 shoulder rolls, two slow breaths.
  P['reset-move-and-shake'] = (function () {
    var list = [[1, {}]];
    for (var i = 0; i < 12; i++) {
      var a = i % 2 ? 1 : -1, lUp = i % 4 < 2;
      list.push([0.75, M(sym({ lShoulder: [0, 0, 22 + 8 * a], lElbow: [-20 - 14 * a, 0, 0], lWrist: [0, 0, 25 * a] }),
        { ik: [0], lHip: [lUp ? -18 : 0, 0, 0], lKnee: [lUp ? 30 : 0, 0, 0], lAnkle: [lUp ? 14 * a : 0, 0, 0],
          rHip: [lUp ? 0 : -18, 0, 0], rKnee: [lUp ? 0 : 30, 0, 0], rAnkle: [lUp ? 0 : -14 * a, 0, 0],
          rootPos: [0, 0.02 * a, 0], mouth: [0.4, 1], idle: [0] }), 'sine']);
    }
    list.push([0.8, {}]);
    for (var r = 0; r < 5; r++) ROLL.slice(1).forEach(function (k) { list.push([0.75, k[1], 'sine']); });
    var inhale = M(sym({ lShoulder: [0, 0, 20] }), { breath: [1], neck: [-6, 30, 0], eyes: [0.7, 0.2, 0] });
    var exhale = { breath: [0], neck: [0, 30, 0], eyes: [0.7, 0.2, 0], mouth: [0.3, 0.2] };
    list.push([4, inhale, 'sine'], [6, exhale, 'sine'], [4, inhale, 'sine'], [6, exhale, 'sine'], [4, {}]);
    return M(tempo(list), {
      camera: 'threeQuarter', focusAt: [[0, ['lWrist', 'rWrist', 'lKnee', 'rKnee']], [0.2, ['lShoulder', 'rShoulder']], [0.52, ['spine']], [0.95, []]],
      beats: [[0, 'Shake it out!'], [0.2, 'Shoulder rolls'], [0.52, 'Slow breath, look across']], stepAt: [0, 0.02, 0.52, 0.95],
    });
  })();

  // Walk to the window and rest the eyes on the sky.
  P['reset-window-gaze'] = (function () {
    var turned = { pivot: [0, 180, 0], neck: [-8, 0, 0], eyes: [0, 0.4, 0.3], idle: [0.6] };
    var soft = M(turned, { eyes: [0, 0.4, 0.5], breath: [0.6] });
    return M(tempo([[2.5, turned], [8, soft, 'sine'], [8, turned, 'sine'], [8, soft, 'sine'], [8, turned, 'sine'], [8, soft, 'sine'], [2.5, {}]]), {
      camera: { az: 0, el: 12, dist: 4.4, ty: 1.1, tz: 0 }, place: [-0.45, -0.75],
      beats: [[0, 'Look out the window'], [0.06, 'Soft eyes, slow breath'], [0.95, 'Next small step?']], stepAt: [0, 0.06, 0.2, 0.95],
    });
  })();

  // Seated mini PMR: tense 5 s (tremor + warm flush), release 10 s; hands, shoulders, jaw, face, legs.
  P['reset-mini-pmr'] = (function () {
    var seat = M(SEAT, sym({ lShoulder: [-30, 0, 6], lElbow: [-50, 0, 0] }), { mouth: [0, 0.4] });
    var areas = [
      M(seat, { lFingers: [0, 0, -150], rFingers: [0, 0, 150], lElbow: [-62, 0, 0], rElbow: [-62, 0, 0], tense: [1], mouth: [0, 0] }),
      M(seat, sym({ lClav: [0, 0, 22] }), { tense: [1], mouth: [0, 0] }),
      M(seat, { tense: [0.8], mouth: [0, 0], neck: [-3, 0, 0] }),
      M(seat, { tense: [1], eyes: [0, 0, 1.12], mouth: [0, 0] }),
      M(seat, { tense: [1], lFootPos: [0, 0, 0.12], rFootPos: [0, 0, 0.12], mouth: [0, 0] }),
    ];
    var relax = M(seat, { eyes: [0, 0, 0.6], breath: [0], mouth: [0.2, 0.5] });
    var list = [];
    areas.forEach(function (a) { list.push([1, a], [4, a, 'linear'], [2, relax, 'out'], [8, relax, 'linear']); });
    return M(tempo(list), {
      camera: 'threeQuarter', props: { chair: [0, -0.36, 0] }, repSec: 15,
      focusAt: [[0, ['lWrist', 'rWrist']], [0.2, ['lShoulder', 'rShoulder']], [0.4, ['neck']], [0.6, []], [0.8, ['lKnee', 'rKnee', 'lAnkle', 'rAnkle']]],
      beats: [[0, 'Fists: tense 50%'], [0.067, 'Release, breathe out'], [0.2, 'Shoulders up'], [0.267, 'Release'], [0.4, 'Lips pressed'], [0.467, 'Release'],
        [0.6, 'Scrunch face'], [0.667, 'Release'], [0.8, 'Heels press down'], [0.867, 'Release, all soft']],
      stepSec: [0, 15, 20, 70],
    });
  })();

  // Stand still, eyes closed, slow breathing (5 s in, 5 s out).
  P['reset-mindful-minute'] = (function () {
    var calm = sym({ lShoulder: [0, 0, 7], lElbow: [-8, 0, 0] });
    var inP = M(calm, { eyes: [0, 0, 0.95], breath: [0.8], idle: [0.2], mouth: [0, 0.4] });
    var outP = M(calm, { eyes: [0, 0, 0.95], breath: [0], idle: [0.2], mouth: [0, 0.5] });
    return M(tempo([[5, inP, 'sine'], [5, outP, 'sine']]), {
      camera: 'front', focus: ['spine'],
      beats: [[0, 'Breathe in'], [0.5, 'Breathe out']], stepAt: [0, 0.0, 0.5, 2],
    });
  })();

  // Export (ids quoted: scripts/build_content.py reads them from here).
  window.POSES = {
    '__idle': P.__idle, '__hello': P.__hello, '__celebrate': P.__celebrate,
    'chin-tuck': P['chin-tuck'],
    'levator-scapulae-stretch': P['levator-scapulae-stretch'],
    'shoulder-shrug-release': P['shoulder-shrug-release'],
    'upper-trap-side-stretch': P['upper-trap-side-stretch'],
    'neck-rotation': P['neck-rotation'],
    'shoulder-rolls': P['shoulder-rolls'],
    'scapular-squeeze': P['scapular-squeeze'],
    'standing-back-extension': P['standing-back-extension'],
    'standing-hip-flexor-stretch': P['standing-hip-flexor-stretch'],
    'standing-cat-cow': P['standing-cat-cow'],
    'wrist-flexor-extensor-stretch': P['wrist-flexor-extensor-stretch'],
    'tendon-glides': P['tendon-glides'],
    'twenty-twenty-twenty': P['twenty-twenty-twenty'],
    'blink-reset': P['blink-reset'],
    'eyes-complete-blink-pause': P['eyes-complete-blink-pause'],
    'eyes-screen-setup-check': P['eyes-screen-setup-check'],
    'chair-sit-to-stand': P['chair-sit-to-stand'],
    'mini-squat': P['mini-squat'],
    'bodyweight-squat': P['bodyweight-squat'],
    'sumo-squat': P['sumo-squat'],
    'slow-tempo-squat': P['slow-tempo-squat'],
    'squat-to-calf-raise': P['squat-to-calf-raise'],
    'split-squat-static': P['split-squat-static'],
    'wall-sit': P['wall-sit'],
    'wall-sit-shallow': P['wall-sit-shallow'],
    'desk-push-up': P['desk-push-up'],
    'desk-push-up-slow': P['desk-push-up-slow'],
    'desk-push-up-wide': P['desk-push-up-wide'],
    'desk-push-up-narrow': P['desk-push-up-narrow'],
    'wall-push-up': P['wall-push-up'],
    'wall-push-hold': P['wall-push-hold'],
    'calf-raises': P['calf-raises'],
    'calf-raise-slow-eccentric': P['calf-raise-slow-eccentric'],
    'calf-raise-bent-knee': P['calf-raise-bent-knee'],
    'calf-raise-single-leg': P['calf-raise-single-leg'],
    'standing-hip-abduction': P['standing-hip-abduction'],
    'standing-knee-raise': P['standing-knee-raise'],
    'single-leg-balance-support': P['single-leg-balance-support'],
    'single-leg-balance-free': P['single-leg-balance-free'],
    'march-in-place': P['march-in-place'],
    'vo2-fast-march': P['vo2-fast-march'],
    'walk-5-min': P['walk-5-min'],
    'vo2-brisk-walk-intervals': P['vo2-brisk-walk-intervals'],
    'vo2-squat-calf-burst': P['vo2-squat-calf-burst'],
    'cyclic-sighing': P['cyclic-sighing'],
    'drink-water': P['drink-water'],
    'reset-move-and-shake': P['reset-move-and-shake'],
    'reset-window-gaze': P['reset-window-gaze'],
    'reset-mini-pmr': P['reset-mini-pmr'],
    'reset-mindful-minute': P['reset-mindful-minute'],
  };
})();
