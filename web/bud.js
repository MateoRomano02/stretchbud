/* stretchbud: Bud, the procedural toon mascot, and its tiny floating-island diorama.
 * MIT License. Depends on window.THREE (vendor/three.bundle.js) and
 * window.POSES / window.BudPose (poses.js). Exposes window.BudScene.
 *
 * Rig conventions (degrees, Euler XYZ, Bud faces +z, Bud's left is +x):
 *   spine/chest/neck x+ bends forward, z+ side-bends toward Bud's right, y+ turns left.
 *   shoulder x- raises the arm forward, lShoulder z+ lifts the arm sideways.
 *   elbow x- bends the elbow. hip x- lifts the thigh forward, knee x+ bends.
 *   clavicle (lClav) z+ shrugs, y+ pulls the shoulder back.
 * Per-exercise fields read here: duration, keys, mirror, loop, camera, focus,
 * trail, props, place, beats (see poses.js).
 */
(function () {
  'use strict';
  var T = window.THREE;
  var D2R = Math.PI / 180;

  var EASE = {
    linear: function (t) { return t; },
    inOut: function (t) { return t * t * (3 - 2 * t); },
    sine: function (t) { return 0.5 - 0.5 * Math.cos(Math.PI * t); },
    out: function (t) { return 1 - Math.pow(1 - t, 3); },
    in: function (t) { return t * t * t; },
    back: function (t) { var c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  };

  // Body dimensions (world units; Bud is ~2.75 tall).
  var ROOT_Y = 0.95, HIP_Y = -0.07, HIP_X = 0.095, HIP_Z = 0, THIGH = 0.41, SHIN = 0.4, ANKLE_Y = 0.07, FOOT_Z = 0;

  var C = {
    body: 0x86d3b5, limb: 0x74c4a5, belly: 0xe2f6ec, hand: 0x9adcc2, spineLine: 0x3d6b5c,
    joint: 0xffe1b3, hot: 0xff7a52, hot2: 0xffb15c,
    outline: 0x2e3f47, leaf: 0x5cbf73,
    glass: 0xd4f0ff, water: 0x59b6ee,
  };

  // Camera presets: az (deg, + = toward Bud's left side), el (deg), dist, ty (look-at height), tz.
  var CAMS = {
    front: { az: 0, el: 6, dist: 4.3, ty: 1.0, tz: 0 },
    threeQuarter: { az: 34, el: 9, dist: 4.3, ty: 1.0, tz: 0 },
    threeQuarterR: { az: -34, el: 9, dist: 4.3, ty: 1.0, tz: 0 },
    side: { az: -70, el: 6, dist: 4.3, ty: 1.0, tz: 0 },
    sideWide: { az: -76, el: 10, dist: 5.0, ty: 0.92, tz: 0.38 },
    pushThreeQuarter: { az: -42, el: 16, dist: 5.0, ty: 0.92, tz: 0.38 },
    high: { az: -60, el: 30, dist: 4.4, ty: 1.0, tz: 0 },
    closeNeck: { az: 10, el: 4, dist: 2.7, ty: 1.58, tz: 0 },
    closeNeckSide: { az: -80, el: 4, dist: 2.7, ty: 1.58, tz: 0 },
    closeNeckSeated: { az: 12, el: 6, dist: 3.0, ty: 1.15, tz: -0.25 },
    closeShoulders: { az: -30, el: 10, dist: 3.0, ty: 1.45, tz: 0 },
    closeHands: { az: -62, el: 12, dist: 3.3, ty: 1.3, tz: 0.3 },
    closeFace: { az: 10, el: 3, dist: 1.5, ty: 1.7, tz: 0 },
  };


  function supported() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGL2RenderingContext && c.getContext('webgl2'));
    } catch (e) { return false; }
  }

  // ---------- geometry helpers ----------
  function tint(g, color) {
    var c = new T.Color(color), n = g.attributes.position.count, a = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
    g.setAttribute('color', new T.Float32BufferAttribute(a, 3));
    return g;
  }
  function merge(list) {
    var pos = [], nor = [], col = [], hasCol = list.every(function (g) { return !!g.attributes.color; });
    list.forEach(function (g) {
      var gg = g.index ? g.toNonIndexed() : g;
      var p = gg.attributes.position.array, n = gg.attributes.normal.array, c = hasCol ? gg.attributes.color.array : null;
      for (var i = 0; i < p.length; i++) { pos.push(p[i]); nor.push(n[i]); if (c) col.push(c[i]); }
    });
    var out = new T.BufferGeometry();
    out.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    out.setAttribute('normal', new T.Float32BufferAttribute(nor, 3));
    if (hasCol) out.setAttribute('color', new T.Float32BufferAttribute(col, 3));
    return out;
  }
  function box(w, h, d, x, y, z, color) { var g = new T.BoxGeometry(w, h, d); g.translate(x, y, z); return color != null ? tint(g, color) : g; }
  function cyl(rt, rb, h, seg, x, y, z, color) { var g = new T.CylinderGeometry(rt, rb, h, seg); g.translate(x, y, z); return tint(g, color); }
  function ball(r, ws, hs, sx, sy, sz, x, y, z, color) { var g = new T.SphereGeometry(r, ws, hs); g.scale(sx, sy, sz); g.translate(x, y, z); return color != null ? tint(g, color) : g; }
  function canvasTex(w, h, draw) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace;
    return t;
  }

  // ---------- the scene ----------
  function create(stageEl) {
    var canvas = document.createElement('canvas');
    canvas.className = 'bud-canvas';
    stageEl.appendChild(canvas);
    var gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'low-power' });
    if (!gl) { stageEl.removeChild(canvas); return null; }
    var renderer = new T.WebGLRenderer({ canvas: canvas, context: gl, alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    var scene = new T.Scene();
    var cam = new T.PerspectiveCamera(30, 1, 0.1, 80);
    scene.add(new T.HemisphereLight(0xfff6ea, 0xb9c3d6, 1.7));
    var sun = new T.DirectionalLight(0xffffff, 2.1); sun.position.set(2.5, 5, 4); scene.add(sun);

    // 3-band toon ramp shared by every toon material.
    var ramp = new T.DataTexture(new Uint8Array([120, 195, 255]), 3, 1, T.RedFormat);
    ramp.minFilter = ramp.magFilter = T.NearestFilter; ramp.needsUpdate = true;
    function toon(color, extra) { return new T.MeshToonMaterial(Object.assign({ color: color, gradientMap: ramp }, extra || {})); }
    var M = {
      body: toon(C.body), limb: toon(C.limb), hand: toon(C.hand), leaf: toon(C.leaf), spineLine: new T.MeshBasicMaterial({ color: C.spineLine }),
      env: toon(0xffffff, { vertexColors: true }),
      glass: new T.MeshBasicMaterial({ color: 0xa9dcff, transparent: true, opacity: 0.72, depthWrite: false }),
      water: toon(C.water),
    };
    var outlineMat = new T.MeshBasicMaterial({ color: C.outline, side: T.BackSide });
    outlineMat.onBeforeCompile = function (sh) {
      sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = vec3( position ) + normal * 0.011;');
    };
    function mesh(geo, mat, outline) {
      var m = new T.Mesh(geo, mat);
      if (outline) m.add(new T.Mesh(geo, outlineMat));
      return m;
    }
    function grp(parent, x, y, z) { var g = new T.Group(); g.position.set(x || 0, y || 0, z || 0); parent.add(g); return g; }

    // ================= diorama =================
    var env = grp(scene);
    (function buildIsland() {
      var parts = [
        cyl(2.15, 2.05, 0.2, 14, 0, -0.1, 0, 0xe9c99c),          // island rim
        cyl(2.05, 0.45, 1.05, 14, 0, -0.72, 0, 0xc49468),        // rocky underside
        cyl(0.5, 0.12, 0.5, 8, 0.2, -1.45, 0.1, 0xb07f57),
        box(2.7, 2.25, 0.14, -0.15, 1.12, -1.58, 0xf7e7d4),      // back wall
        box(2.7, 0.12, 0.2, -0.15, 0.06, -1.5, 0xe6cdb0),        // skirting
        box(1.0, 0.07, 0.12, -0.45, 1.12, -1.48, 0xffffff),       // window frame
        box(1.0, 0.07, 0.12, -0.45, 1.98, -1.48, 0xffffff),
        box(0.07, 0.93, 0.12, -0.92, 1.55, -1.48, 0xffffff),
        box(0.07, 0.93, 0.12, 0.02, 1.55, -1.48, 0xffffff),
        box(0.05, 0.86, 0.06, -0.45, 1.55, -1.5, 0xffffff),
        box(1.14, 0.06, 0.2, -0.45, 1.08, -1.44, 0xffffff),       // sill
        cyl(0.2, 0.15, 0.32, 10, -1.45, 0.16, -1.12, 0xe0895c),   // plant pot
        cyl(0.21, 0.21, 0.05, 10, -1.45, 0.32, -1.12, 0xd27a4f),
        ball(0.17, 8, 6, 0.7, 1.6, 0.7, -1.45, 0.62, -1.12, C.leaf),
        ball(0.15, 8, 6, 0.6, 1.4, 0.6, -1.33, 0.55, -1.04, 0x6ccc80),
        ball(0.14, 8, 6, 0.6, 1.3, 0.6, -1.58, 0.53, -1.06, 0x4fae66),
        box(0.36, 0.05, 0.22, 1.0, 1.62, -1.44, 0xd9a46c),     // little shelf
        box(0.09, 0.14, 0.09, 0.9, 1.71, -1.44, 0x7aa8ff),
        box(0.08, 0.2, 0.08, 1.04, 1.74, -1.44, 0xff9f6e),
      ];
      env.add(mesh(merge(parts), M.env, true));
      // Island top: same material, no outline (one more draw call, but no hull over the floor).
      var top = new T.CircleGeometry(2.15, 14); top.rotateX(-Math.PI / 2); top.translate(0, 0.001, 0); tint(top, 0xf3dfbf);
      env.add(new T.Mesh(top, M.env));
      var sky = canvasTex(128, 128, function (c, w, h) {
        var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#9fd3ff'); g.addColorStop(0.75, '#ffe6c9'); g.addColorStop(1, '#ffd2b0');
        c.fillStyle = g; c.fillRect(0, 0, w, h);
        c.fillStyle = 'rgba(255,236,170,0.95)'; c.beginPath(); c.arc(92, 80, 15, 0, 7); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.9)';
        c.beginPath(); c.arc(30, 44, 12, 0, 7); c.arc(44, 40, 15, 0, 7); c.arc(58, 46, 10, 0, 7); c.fill();
      });
      var pane = new T.Mesh(new T.BoxGeometry(0.88, 0.8, 0.02), new T.MeshBasicMaterial({ map: sky }));
      pane.position.set(-0.45, 1.55, -1.52); env.add(pane);
    })();

    // Rug under Bud (scrolls while walking).
    var rugTex = canvasTex(64, 64, function (c, w, h) {
      c.fillStyle = '#f9d3b8'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#f4c2a2'; c.fillRect(0, 0, w, h / 2);
    });
    rugTex.wrapS = rugTex.wrapT = T.RepeatWrapping; rugTex.repeat.set(1, 4);
    var rug = new T.Mesh(new T.CircleGeometry(0.95, 20).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ map: rugTex }));
    rug.position.y = 0.004; env.add(rug);

    // Clouds drifting around the island.
    // Clouds: one merged mesh that drifts as a whole (1 draw call).
    var cloudParts = [];
    [[-2.7, 2.7, -2.4, 1], [2.7, 3.1, -2.9, 0.8], [2.5, 0.6, -2.0, 0.6]].forEach(function (p) {
      var k = p[3];
      cloudParts.push(ball(0.32 * k, 7, 5, 1, 0.8, 0.9, p[0], p[1], p[2]), ball(0.24 * k, 7, 5, 1, 0.8, 0.9, p[0] + 0.34 * k, p[1] - 0.05 * k, p[2]), ball(0.2 * k, 7, 5, 1, 0.8, 0.9, p[0] - 0.3 * k, p[1] - 0.07 * k, p[2]));
    });
    var cloudMesh = new T.Mesh(merge(cloudParts), toon(0xffffff));
    scene.add(cloudMesh);

    // Movable props: they live in the diorama and scoot over when an exercise needs them.
    var props = {}, laptop = null, laptopLid = null;
    (function () {
      var w = 0xdba36b, leg = 0xc98f58;
      props.desk = mesh(merge([
        box(1.2, 0.05, 0.6, 0, 0.725, 0, w),
        box(0.06, 0.7, 0.06, -0.54, 0.35, -0.24, leg), box(0.06, 0.7, 0.06, 0.54, 0.35, -0.24, leg),
        box(0.06, 0.7, 0.06, -0.54, 0.35, 0.24, leg), box(0.06, 0.7, 0.06, 0.54, 0.35, 0.24, leg),
        cyl(0.04, 0.033, 0.09, 8, -0.38, 0.795, -0.12, 0xff9f6e),
      ]), M.env, true);
      props.desk.userData = { home: [1.12, -1.13, 0], want: null, k: 0 };
      // Laptop: base slides along the desk, lid tilts on its hinge (channel 'laptop': [slide, tiltDeg]).
      laptop = grp(props.desk, 0.15, 0.75, 0.12);
      laptop.add(mesh(box(0.44, 0.03, 0.3, 0, 0.015, 0, 0x59606e), M.env, false));
      laptopLid = grp(laptop, 0, 0.03, -0.15);
      laptopLid.add(mesh(merge([box(0.44, 0.3, 0.025, 0, 0.15, 0, 0x59606e), box(0.38, 0.24, 0.01, 0, 0.155, 0.014, 0x9fd8ff)]), M.env, false));
      props.chair = mesh(merge([
        box(0.48, 0.05, 0.44, 0, 0.455, 0, 0x8ea3cf), box(0.48, 0.44, 0.05, 0, 0.72, -0.2, 0x8ea3cf),
        box(0.05, 0.45, 0.05, -0.21, 0.225, -0.18, 0x6f84b3), box(0.05, 0.45, 0.05, 0.21, 0.225, -0.18, 0x6f84b3),
        box(0.05, 0.45, 0.05, -0.21, 0.225, 0.18, 0x6f84b3), box(0.05, 0.45, 0.05, 0.21, 0.225, 0.18, 0x6f84b3),
      ]), M.env, true);
      props.chair.userData = { home: [1.12, -0.52, 180], want: null, k: 0 };
      props.wall = mesh(merge([box(1.3, 2.0, 0.1, 0, 1.0, 0, 0xf7e7d4), box(1.3, 0.1, 0.14, 0, 0.05, 0, 0xe6cdb0)]), M.env, true);
      props.wall.userData = { home: [0, -0.5, 0], want: null, k: 0, pop: true };
      Object.keys(props).forEach(function (k) { var h = props[k].userData.home; props[k].position.set(h[0], 0, h[1]); props[k].rotation.y = h[2] * D2R; scene.add(props[k]); });
    })();

    // ================= Bud =================
    // Adult proportions (~7.5 heads, 1.77 tall), articulated-mannequin style: every segment is a
    // separate piece and every pivot has a visible joint ball (C7 and skull base for the neck,
    // thoracic and lumbar for the spine).
    var J = {};
    var place = grp(scene); J.place = place;      // where Bud stands on the island
    var world = grp(place); J.pivot = world;      // whole-body lean around the feet
    var root = grp(world, 0, ROOT_Y, 0); J.root = root;   // pelvis
    var rootBase = root.position.clone();

    root.add(mesh(ball(0.14, 12, 8, 1, 0.66, 0.76, 0, 0.02, 0), M.body, true));            // pelvis
    root.add(new T.Mesh(box(0.016, 0.1, 0.016, 0, 0.04, -0.105), M.spineLine));             // sacrum line

    J.spine = grp(root, 0, 0.09, 0);              // lumbar joint
    J.chest = grp(J.spine, 0, 0.14, 0);           // thoracic joint
    var torsoMesh = mesh(ball(0.17, 14, 10, 1, 1.1, 0.68, 0, 0.11, 0), M.body, true);     // ribcage
    J.chest.add(torsoMesh);
    J.chest.add(new T.Mesh(new T.CapsuleGeometry(0.009, 0.26, 2, 4).translate(0, 0.12, -0.112), M.spineLine)); // spine line
    J.spine.add(mesh(new T.CylinderGeometry(0.075, 0.09, 0.12, 10).translate(0, 0.04, 0), M.limb, false));   // abdomen

    J.neck = grp(J.chest, 0, 0.3, -0.01);         // C7 (base of the neck)
    J.neck.add(mesh(new T.CylinderGeometry(0.038, 0.045, 0.1, 8).translate(0, 0.045, 0), M.limb, true));
    J.head = grp(J.neck, 0, 0.095, 0);            // skull base (top of the neck)
    var headBase = J.head.position.clone();
    var headGeo = merge([
      ball(0.1, 16, 12, 0.95, 1.18, 1.05, 0, 0, 0),
      ball(0.018, 6, 4, 0.9, 1.1, 1, 0, -0.012, 0.106),                 // nose
      ball(0.022, 6, 4, 0.5, 1, 0.8, 0.093, 0, -0.005), ball(0.022, 6, 4, 0.5, 1, 0.8, -0.093, 0, -0.005), // ears
    ]);
    var headMesh = mesh(headGeo, M.body, true);
    headMesh.position.set(0, 0.085, 0.018);
    J.head.add(headMesh);

    // Face drawn on a canvas, mapped on a cap over the front of the head (1 draw call).
    var faceCanvas = document.createElement('canvas'); faceCanvas.width = 512; faceCanvas.height = 256;
    var faceCtx = faceCanvas.getContext('2d');
    var faceTex = new T.CanvasTexture(faceCanvas); faceTex.colorSpace = T.SRGBColorSpace;
    var FACE_PHI = 1.9;
    var faceGeo = new T.SphereGeometry(0.1015, 16, 8, Math.PI / 2 - FACE_PHI / 2, FACE_PHI, 0.95, 1.05);
    faceGeo.scale(0.95, 1.18, 1.05);
    var faceMesh = new T.Mesh(faceGeo, new T.MeshBasicMaterial({ map: faceTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    faceMesh.renderOrder = 2; headMesh.add(faceMesh);

    // The sprout that gives Bud its name, as a hair tuft.
    var sprout = grp(J.head, 0, 0.2, 0.005);
    sprout.add(mesh(merge([
      (function () { var g = new T.CylinderGeometry(0.008, 0.011, 0.06, 6); g.translate(0, 0.025, 0); return g; })(),
      (function () { var g = new T.SphereGeometry(0.035, 8, 5); g.scale(1.3, 0.35, 0.7); g.rotateZ(0.5); g.translate(0.038, 0.066, 0); return g; })(),
      (function () { var g = new T.SphereGeometry(0.028, 8, 5); g.scale(1.3, 0.35, 0.7); g.rotateZ(-0.6); g.translate(-0.028, 0.056, 0); return g; })(),
    ]), M.leaf, true));

    // Limbs.
    var clavGeo = new T.CapsuleGeometry(0.026, 0.12, 2, 6); clavGeo.rotateZ(Math.PI / 2); clavGeo.translate(0.08, 0, 0);
    var upperGeo = new T.CapsuleGeometry(0.042, 0.2, 3, 8); upperGeo.translate(0, -0.15, 0);
    var foreGeo = new T.CapsuleGeometry(0.035, 0.18, 3, 8); foreGeo.translate(0, -0.13, 0);
    var palmGeo = merge([ball(0.045, 8, 6, 0.55, 1, 1, 0, -0.045, 0), ball(0.016, 6, 4, 1, 1.4, 1, 0, -0.035, 0.038)]);
    var fingerGeo = new T.CapsuleGeometry(0.023, 0.04, 2, 6); fingerGeo.scale(0.6, 1, 1.6); fingerGeo.translate(0, -0.04, -0.004);
    var thighGeo = new T.CapsuleGeometry(0.064, 0.26, 3, 8); thighGeo.translate(0, -0.205, 0);
    var shinGeo = new T.CapsuleGeometry(0.048, 0.29, 3, 8); shinGeo.translate(0, -0.2, 0);
    var footGeo = new T.CapsuleGeometry(0.042, 0.16, 3, 8); footGeo.rotateX(Math.PI / 2); footGeo.scale(1, 0.75, 1); footGeo.translate(0, -0.035, 0.06);
    var jointGeo = new T.SphereGeometry(1, 8, 6);

    var joints = {};   // name -> { mesh, mat, r }
    function addJoint(name, parent, r, pos) {
      var mat = toon(C.joint, { emissive: 0x000000 });
      var m = new T.Mesh(jointGeo, mat); m.scale.setScalar(r);
      if (pos) m.position.set(pos[0], pos[1], pos[2]);
      parent.add(m); joints[name] = { mesh: m, mat: mat, r: r };
    }
    addJoint('spine', J.spine, 0.045, [0, 0, -0.07]);   // lumbar, on the back
    addJoint('chest', J.chest, 0.036, [0, 0.08, -0.1]);   // thoracic, on the back
    addJoint('neck', J.neck, 0.026);                   // C7
    addJoint('head', J.head, 0.022);                   // skull base
    ['l', 'r'].forEach(function (s) {
      var sx = s === 'l' ? 1 : -1;
      J[s + 'Clav'] = grp(J.chest, 0.03 * sx, 0.27, -0.01);
      var cl = mesh(clavGeo, M.limb, true); cl.scale.x = sx; J[s + 'Clav'].add(cl);
      J[s + 'Shoulder'] = grp(J[s + 'Clav'], 0.16 * sx, 0, 0);
      J[s + 'Shoulder'].add(mesh(upperGeo, M.limb, true));
      J[s + 'Elbow'] = grp(J[s + 'Shoulder'], 0, -0.3, 0);
      J[s + 'Elbow'].add(mesh(foreGeo, M.limb, true));
      J[s + 'Wrist'] = grp(J[s + 'Elbow'], 0, -0.26, 0);
      J[s + 'Wrist'].add(mesh(palmGeo, M.hand, false));
      J[s + 'Fingers'] = grp(J[s + 'Wrist'], 0, -0.09, 0);
      J[s + 'Fingers'].add(mesh(fingerGeo, M.hand, false));
      addJoint(s + 'Shoulder', J[s + 'Shoulder'], 0.04);
      addJoint(s + 'Elbow', J[s + 'Elbow'], 0.034);
      addJoint(s + 'Wrist', J[s + 'Wrist'], 0.03);

      J[s + 'Hip'] = grp(root, HIP_X * sx, HIP_Y, 0);
      J[s + 'Hip'].add(mesh(thighGeo, M.limb, true));
      J[s + 'Knee'] = grp(J[s + 'Hip'], 0, -THIGH, 0);
      J[s + 'Knee'].add(mesh(shinGeo, M.limb, true));
      J[s + 'Ankle'] = grp(J[s + 'Knee'], 0, -SHIN, 0);
      J[s + 'Ankle'].add(mesh(footGeo, M.hand, true));
      addJoint(s + 'Hip', J[s + 'Hip'], 0.045);
      addJoint(s + 'Knee', J[s + 'Knee'], 0.04);
      addJoint(s + 'Ankle', J[s + 'Ankle'], 0.032);
    });

    // Glass of water in the right hand, held on the palm side; its axis is the wrist's local +z
    // (thumb direction), so it stands upright when the forearm points forward.
    var glass = grp(J.rWrist, 0.07, -0.09, 0.02);
    (function () {
      var gGeo = new T.CylinderGeometry(0.042, 0.035, 0.13, 12, 1, true); gGeo.rotateX(Math.PI / 2);
      var wGeo = new T.CylinderGeometry(0.037, 0.032, 0.085, 12); wGeo.rotateX(Math.PI / 2); wGeo.translate(0, 0, -0.02);
      var water = new T.Mesh(wGeo, M.water);
      var shell = new T.Mesh(gGeo, M.glass); shell.renderOrder = 3;
      glass.add(water); glass.add(shell); glass.userData.water = water;
    })();
    glass.visible = false;

    // Blob shadow.
    var shadowTex = canvasTex(64, 64, function (c, w, h) {
      var g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, 'rgba(60,40,50,0.5)'); g.addColorStop(0.6, 'rgba(60,40,50,0.22)'); g.addColorStop(1, 'rgba(60,40,50,0)');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
    });
    var shadow = new T.Mesh(new T.CircleGeometry(0.42, 20).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
    shadow.position.y = 0.008; shadow.renderOrder = 1; place.add(shadow);

    // Motion trail: dotted path of the active point over one cycle (1 draw call).
    var dotTex = canvasTex(32, 32, function (c) { c.fillStyle = '#fff'; c.beginPath(); c.arc(16, 16, 13, 0, 7); c.fill(); });
    var TRAIL_N = 40;
    var trailGeo = new T.BufferGeometry();
    trailGeo.setAttribute('position', new T.Float32BufferAttribute(new Float32Array(TRAIL_N * 3), 3));
    var trailMat = new T.PointsMaterial({ color: C.hot, size: 0.03, map: dotTex, transparent: true, opacity: 0.8, depthTest: false, depthWrite: false, alphaTest: 0.2 });
    var trail = new T.Points(trailGeo, trailMat); trail.renderOrder = 9; trail.frustumCulled = false; trail.visible = false;
    place.add(trail);
    var TRAIL_PTS = {   // tracked point: joint + local offset
      nose: ['head', [0, 0.07, 0.14]], headTop: ['head', [0, 0.21, 0.02]],
      lWrist: ['lWrist', [0, -0.05, 0]], rWrist: ['rWrist', [0, -0.05, 0]],
      lFingers: ['lFingers', [0, -0.05, 0]], rFingers: ['rFingers', [0, -0.05, 0]],
      lShoulder: ['lShoulder', [0, 0, 0]], rShoulder: ['rShoulder', [0, 0, 0]],
      lElbow: ['lElbow', [0, 0, 0]], rElbow: ['rElbow', [0, 0, 0]],
      lKnee: ['lKnee', [0, 0, 0]], rKnee: ['rKnee', [0, 0, 0]], lAnkle: ['lAnkle', [0, 0, 0]],
      rAnkle: ['rAnkle', [0, 0, 0]], chest: ['chest', [0, 0.22, 0.12]], hips: ['root', [0, 0, 0]],
    };

    // ================= glTF body (Quaternius mannequin, CC0) =================
    // The procedural skeleton above stays as the DRIVER: poses, IK and joint markers run on it.
    // When the glb is available, its bones copy the driver every frame (retargeting) and the
    // procedural meshes are hidden. Mapping: our joint name -> bone name.
    var BONE_MAP = {
      root: 'pelvis', spine: 'spine_01', chest: 'spine_02', neck: 'neck_01', head: 'Head',
      lClav: 'clavicle_l', lShoulder: 'upperarm_l', lElbow: 'lowerarm_l', lWrist: 'hand_l', lFingers: 'middle_01_l',
      rClav: 'clavicle_r', rShoulder: 'upperarm_r', rElbow: 'lowerarm_r', rWrist: 'hand_r', rFingers: 'middle_01_r',
      lHip: 'thigh_l', lKnee: 'calf_l', lAnkle: 'foot_l', rHip: 'thigh_r', rKnee: 'calf_r', rAnkle: 'foot_r',
    };
    // Limb bones whose rest direction (bone -> child bone) is re-aimed straight down, so the
    // driver's zero pose (arms hanging, legs straight) matches the glb's T-pose bones.
    var AIM_DOWN = { upperarm_l: 'lowerarm_l', lowerarm_l: 'hand_l', hand_l: 'middle_01_l',
      upperarm_r: 'lowerarm_r', lowerarm_r: 'hand_r', hand_r: 'middle_01_r',
      thigh_l: 'calf_l', calf_l: 'foot_l', thigh_r: 'calf_r', calf_r: 'foot_r' };
    var glb = null;   // { bones: [...ordered], info: {bone -> {j, C, W0, restPos, restQuat}} }
    var procMeshes = [];
    root.traverse(function (o) { if (o.isMesh && !o.userData.marker && o.parent !== glass && o !== shadow) procMeshes.push(o); });
    Object.keys(joints).forEach(function (n) { joints[n].mesh.userData.marker = true; });
    procMeshes = procMeshes.filter(function (o) { return !o.userData.marker; });

    function attachGLB() {
      if (!window.BUD_GLB_B64 || !T.GLTFLoader) return;
      var bin = atob(window.BUD_GLB_B64), buf = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
      new T.GLTFLoader().parse(buf.buffer, '', function (gltf) {
        try { bindGLB(gltf.scene); } catch (e) { console.warn('Bud glb bind failed, keeping the procedural body', e); }
      }, function (e) { console.warn('Bud glb load failed', e); });
    }

    function bindGLB(model) {
      var TARGET_H = 1.77;
      var skinned = null, bones = {};
      model.traverse(function (o) { if (o.isSkinnedMesh && !skinned) skinned = o; if (o.isBone) bones[o.name] = o; });
      if (!skinned || !bones.pelvis) return;
      model.updateMatrixWorld(true);
      var v = new T.Vector3(), q = new T.Quaternion();
      function wpos(b) { return bones[b].getWorldPosition(new T.Vector3()); }
      // Scale to Bud's height and face +z.
      var h = wpos('Head').y + 0.2;
      model.scale.setScalar(TARGET_H / h);
      if (wpos('ball_l').z < wpos('foot_l').z) model.rotation.y = Math.PI;
      model.updateMatrixWorld(true);
      var P = {}; Object.keys(bones).forEach(function (b) { P[b] = wpos(b); });

      // Re-measure the driver skeleton from the bones (limbs canonical: hanging straight down).
      function rel(a, b) { return P[a].clone().sub(P[b]); }
      function len(a, b) { return P[a].distanceTo(P[b]); }
      root.position.copy(P.pelvis); rootBase.copy(root.position);
      ROOT_Y = P.pelvis.y; HIP_X = Math.abs(P.thigh_l.x - P.pelvis.x); HIP_Y = P.thigh_l.y - P.pelvis.y;
      THIGH = len('thigh_l', 'calf_l'); SHIN = len('calf_l', 'foot_l'); ANKLE_Y = P.foot_l.y;
      HIP_Z = P.thigh_l.z - P.pelvis.z; FOOT_Z = P.thigh_l.z;   // feet rest right under the hips
      J.spine.position.copy(rel('spine_01', 'pelvis'));
      J.chest.position.copy(rel('spine_02', 'spine_01'));
      J.neck.position.copy(rel('neck_01', 'spine_02'));
      J.head.position.copy(rel('Head', 'neck_01')); headBase.copy(J.head.position);
      ['l', 'r'].forEach(function (s) {
        J[s + 'Clav'].position.copy(rel('clavicle_' + s, 'spine_02'));
        J[s + 'Shoulder'].position.copy(rel('upperarm_' + s, 'clavicle_' + s));
        J[s + 'Elbow'].position.set(0, -len('upperarm_' + s, 'lowerarm_' + s), 0);
        J[s + 'Wrist'].position.set(0, -len('lowerarm_' + s, 'hand_' + s), 0);
        J[s + 'Fingers'].position.set(0, -len('hand_' + s, 'middle_01_' + s), 0);
        J[s + 'Hip'].position.copy(rel('thigh_' + s, 'pelvis'));
        J[s + 'Knee'].position.set(0, -THIGH, 0);
        J[s + 'Ankle'].position.set(0, -SHIN, 0);
      });

      // Per-bone rest data and world-space rest corrections.
      var down = new T.Vector3(0, -1, 0), info = {}, order = [];
      var jointOf = {}; Object.keys(BONE_MAP).forEach(function (j) { jointOf[BONE_MAP[j]] = j; });
      skinned.skeleton.bones.forEach(function (b) {
        var C = new T.Quaternion();
        var aim = /^middle_01/.test(b.name) ? b.name.replace('middle_01', 'hand') : b.name;   // fingers ride with the hand
        if (AIM_DOWN[aim]) C.setFromUnitVectors(P[AIM_DOWN[aim]].clone().sub(P[aim]).normalize(), down);
        info[b.name] = { j: jointOf[b.name], C: C, W0: b.getWorldQuaternion(new T.Quaternion()), restPos: b.position.clone(), restQuat: b.quaternion.clone() };
      });
      (function walk(o) { if (o.isBone) order.push(o); o.children.forEach(walk); })(model);

      // Toon materials with the mannequin's own colors, plus a skinned outline hull.
      var parts = [], toonMats = [];
      model.traverse(function (o) { if (o.isSkinnedMesh) parts.push(o); });
      parts.forEach(function (sm, pi) {
        var tm = toon(sm.material.color ? sm.material.color.getHex() : 0xd08040);
        sm.material = tm; toonMats.push(tm); sm.frustumCulled = false;
        if (pi > 0) return;   // outline hull only on the body part (the joint patches sit inside it)
        var hull = new T.SkinnedMesh(sm.geometry, outlineMat);
        hull.bind(sm.skeleton, sm.bindMatrix); hull.frustumCulled = false;
        sm.parent.add(hull);
      });
      glb = { model: model, order: order, info: info, bone: bones, skinned: skinned, mats: toonMats };
      // Markers and arcs in a colour that stands out on the orange mannequin.
      hot.set(0x12cfc0); hot2.set(0xbffff4); trailMat.color.set(0x0fb5a8);
      scene.add(model);
      procMeshes.forEach(function (m) { m.visible = false; });

      // Friendly face and the sprout tuft on the Head bone. The face cap is fitted to the head's
      // bounds (vertices skinned to the Head bone, in the rest pose).
      var hb = bones.Head, hi = skinned.skeleton.bones.indexOf(hb);
      var pa = skinned.geometry.attributes.position, si = skinned.geometry.attributes.skinIndex, sw = skinned.geometry.attributes.skinWeight;
      var mn = new T.Vector3(1e9, 1e9, 1e9), mx = new T.Vector3(-1e9, -1e9, -1e9), tv = new T.Vector3();
      for (var vi = 0; vi < pa.count; vi++) {
        var wgt = 0;
        for (var c4 = 0; c4 < 4; c4++) if (si.getComponent(vi, c4) === hi) wgt += sw.getComponent(vi, c4);
        if (wgt < 0.9) continue;
        tv.fromBufferAttribute(pa, vi).applyMatrix4(skinned.matrixWorld); mn.min(tv); mx.max(tv);
      }
      var hc = mn.clone().add(mx).multiplyScalar(0.5), hs = mx.clone().sub(mn).multiplyScalar(0.5);
      var faceGroup = new T.Group();
      hb.add(faceGroup);
      faceGroup.quaternion.copy(info.Head.W0).invert();
      faceGroup.scale.setScalar(1 / model.scale.x);
      faceGroup.position.copy(hb.worldToLocal(hc.clone()));
      headMesh.remove(faceMesh);
      faceMesh.geometry = new T.SphereGeometry(1, 16, 8, Math.PI / 2 - 1.15, 2.3, 0.95, 1.2);
      faceMesh.position.set(0, -hs.y * 0.08, 0); faceMesh.scale.set(hs.x * 1.03, hs.y * 1.0, hs.z * 1.03);
      faceGroup.add(faceMesh);
      sprout.parent.remove(sprout); sprout.position.set(0, hs.y * 0.97, -hs.z * 0.1); faceGroup.add(sprout);
      faceMesh.visible = true; sprout.traverse(function (o) { o.visible = true; });
      glb.head = { c: hc, s: hs };
      setFocus(player.focus, player.mirrored);
    }

    var _q = new T.Quaternion(), _pq = new T.Quaternion(), _v = new T.Vector3();
    function retarget() {
      if (!glb) return;
      place.updateMatrixWorld(true);
      glb.model.updateMatrixWorld(true);
      for (var i = 0; i < glb.order.length; i++) {
        var b = glb.order[i], inf = glb.info[b.name], j = inf && inf.j;
        if (j && J[j]) {
          J[j].getWorldQuaternion(_q).multiply(inf.C).multiply(inf.W0);
          b.parent.getWorldQuaternion(_pq).invert();
          b.quaternion.copy(_pq.multiply(_q));
          J[j].getWorldPosition(_v); b.position.copy(b.parent.worldToLocal(_v));
        } else if (inf) { b.position.copy(inf.restPos); b.quaternion.copy(inf.restQuat); }
        b.updateMatrixWorld(true);
      }
      // Fingers: the driver has one finger joint per hand (curl about z). Every finger's first
      // bone copies the middle finger's local change; the outer phalanges add most of it again.
      for (var s = 0; s < 2; s++) {
        var sd = s ? '_r' : '_l', mid = glb.info['middle_01' + sd], mb = glb.bone['middle_01' + sd];
        _q.copy(mid.restQuat).invert().multiply(mb.quaternion);            // local delta
        _pq.set(0, 0, 0, 1).slerp(_q, 0.75);
        for (var f = 0; f < FINGERS.length; f++) {
          for (var k = 1; k <= 3; k++) {
            var nm = FINGERS[f] + '_0' + k + sd, fb = glb.bone[nm];
            if (!fb || nm === 'middle_01' + sd) continue;
            fb.quaternion.copy(glb.info[nm].restQuat).multiply(k === 1 ? _q : _pq);
          }
        }
      }
    }
    var FINGERS = ['index', 'middle', 'ring', 'pinky'];

    // ---------- face ----------
    var faceKey = '';
    function drawFace(f) {
      var key = [f.lx, f.ly, f.close, f.open, f.smile].map(function (v) { return Math.round(v * 20); }).join(',');
      if (key === faceKey) return; faceKey = key;
      var c = faceCtx, W = 512;
      c.clearRect(0, 0, W, 256);
      var ex = 74, ey = 104, lx = f.lx * 20, ly = -f.ly * 14;
      c.fillStyle = 'rgba(255,128,150,0.5)';
      [-1, 1].forEach(function (s) { c.beginPath(); c.ellipse(W / 2 + s * 122, 150, 30, 17, 0, 0, 7); c.fill(); });
      [-1, 1].forEach(function (s) {
        var cx = W / 2 + s * ex + lx, cy = ey + ly;
        c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 9; c.strokeStyle = '#26303a'; c.fillStyle = '#26303a';
        if (f.close > 1.04) {          // squeeze: > <
          c.beginPath(); c.moveTo(cx - 18 * s, cy - 15); c.lineTo(cx + 12 * s, cy); c.lineTo(cx - 18 * s, cy + 15); c.stroke();
        } else if (f.close > 0.82) {   // closed, relaxed
          c.beginPath(); c.arc(cx, cy - 6, 22, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
        } else {
          var ry = 31 * (1 - f.close);
          c.beginPath(); c.ellipse(cx, cy, 24, Math.max(ry, 3), 0, 0, 7); c.fill();
          if (ry > 12) {
            c.fillStyle = '#ffffff';
            c.beginPath(); c.arc(cx + 8 + lx * 0.15, cy - ry * 0.42, 8.5, 0, 7); c.fill();
            c.beginPath(); c.arc(cx - 8, cy + ry * 0.4, 4, 0, 7); c.fill();
          }
        }
      });
      var mx = W / 2 + lx * 0.5, my = 156 + ly * 0.5;
      c.strokeStyle = '#26303a'; c.lineWidth = 8;
      if (f.open > 0.15) {
        var r = 8 + 14 * f.open;
        c.fillStyle = '#5a2a35';
        c.beginPath(); c.ellipse(mx, my + 2, r * (0.75 + 0.5 * f.smile), r * (1.05 - 0.35 * f.smile), 0, 0, 7); c.fill();
        c.fillStyle = '#ff8fa3';
        c.beginPath(); c.ellipse(mx, my + 2 + r * 0.45, r * 0.5, r * 0.32, 0, 0, 7); c.fill();
      } else {
        var w = 14 + 10 * f.smile;
        c.beginPath(); c.moveTo(mx - w, my - 2 * f.smile); c.quadraticCurveTo(mx, my + 4 + 16 * f.smile, mx + w, my - 2 * f.smile); c.stroke();
      }
      faceTex.needsUpdate = true;
    }

    // ---------- pose sampling ----------
    var B = window.BudPose;
    var cur = B.clone(B.REST), tgt = B.clone(B.REST), tmp = B.clone(B.REST);
    var player = { id: null, entry: null, t0: 0, freezeU: null, mirrorStart: false, onCycle: null, onBeat: null, lastCycle: -1, lastBeat: null, mirrored: false };
    var hopT = -1, hopDur = 0.75;
    var blink = { next: 2, t: -1 };
    var snap = true;

    function resolveKeys(entry, mirrored) {
      var ck = mirrored ? '_mk' : '_k';
      if (entry[ck]) return entry[ck];
      var ks = entry.keys.map(function (k) { return { t: k.t, ease: k.ease || 'inOut', pose: B.full(mirrored ? B.mirror(k.pose || {}) : (k.pose || {})) }; });
      Object.defineProperty(entry, ck, { value: ks, enumerable: false });
      return ks;
    }
    function sample(entry, u, mirrored, out) {
      var ks = resolveKeys(entry, mirrored), i = 0;
      while (i < ks.length - 2 && u > ks[i + 1].t) i++;
      var a = ks[i], b = ks[i + 1] || a, span = b.t - a.t;
      var f = span > 0 ? Math.min(1, Math.max(0, (u - a.t) / span)) : 1;
      f = (EASE[b.ease] || EASE.inOut)(f);
      for (var k in a.pose) { var pa = a.pose[k], pb = b.pose[k], o = out[k]; for (var n = 0; n < pa.length; n++) o[n] = pa[n] + (pb[n] - pa[n]) * f; }
      return out;
    }
    function mirrorName(n) { return /^l[A-Z]/.test(n) ? 'r' + n.slice(1) : /^r[A-Z]/.test(n) ? 'l' + n.slice(1) : n; }

    // ---------- rig ----------
    function legIK(footPos, out) {
      var hy = root.position.y + HIP_Y, hz = root.position.z + HIP_Z;
      var dy = ANKLE_Y + footPos[1] - hy, dz = FOOT_Z + footPos[2] - hz;
      var d = Math.min(Math.sqrt(dy * dy + dz * dz), (THIGH + SHIN) * 0.998);
      var target = Math.atan2(-dz, -dy);
      var alpha = Math.acos(Math.max(-1, Math.min(1, (THIGH * THIGH + d * d - SHIN * SHIN) / (2 * THIGH * d))));
      var beta = Math.acos(Math.max(-1, Math.min(1, (THIGH * THIGH + SHIN * SHIN - d * d) / (2 * THIGH * SHIN))));
      out.hip = target - alpha - root.rotation.x;
      out.knee = Math.PI - beta;
      out.ankle = -(out.hip + out.knee) - root.rotation.x - world.rotation.x;
      return out;
    }
    var ikTmp = { hip: 0, knee: 0, ankle: 0 };
    var ROT_J = ['spine', 'chest', 'neck', 'head', 'lClav', 'rClav', 'lShoulder', 'rShoulder', 'lElbow', 'rElbow',
      'lWrist', 'rWrist', 'lFingers', 'rFingers', 'lHip', 'rHip', 'lKnee', 'rKnee', 'lAnkle', 'rAnkle'];
    // Rig binding layer. Pose data (poses.js) only speaks our joint names; RIG maps each name to
    // the Object3D it drives. The procedural mannequin binds names 1:1 with zero rest rotation. A
    // skinned glTF skeleton can be bound later by pointing each name at a bone and composing the
    // bone's rest rotation here; the joint markers would follow bone world positions the same way.
    var RIG = { pivot: world, root: root };
    ROT_J.forEach(function (n) { RIG[n] = J[n]; });
    function setRot(o, v) { o.rotation.set(v[0] * D2R, v[1] * D2R, v[2] * D2R); }
    function setJoint(name, v) { setRot(RIG[name], v); }

    function applyRig(p, extraY) {
      setJoint('pivot', p.pivot);
      root.position.set(rootBase.x + p.rootPos[0], rootBase.y + p.rootPos[1] + (extraY || 0), rootBase.z + p.rootPos[2]);
      setJoint('root', p.root);
      for (var i = 0; i < ROT_J.length; i++) setJoint(ROT_J[i], p[ROT_J[i]]);
      J.head.position.set(headBase.x + p.headPos[0], headBase.y + p.headPos[1], headBase.z + p.headPos[2]);
      var ik = p.ik[0];
      if (ik > 0.001) {
        ['l', 'r'].forEach(function (s) {
          legIK(p[s + 'FootPos'], ikTmp);
          var hj = J[s + 'Hip'], kj = J[s + 'Knee'], aj = J[s + 'Ankle'];
          hj.rotation.x += (ikTmp.hip - hj.rotation.x) * ik;
          kj.rotation.x += (ikTmp.knee - kj.rotation.x) * ik;
          aj.rotation.x += (ikTmp.ankle + p.heels[0] * D2R - aj.rotation.x) * ik;
        });
      }
    }

    // ---------- trail ----------
    var v3 = new T.Vector3();
    function computeTrail(entry, mirrored) {
      var ck = mirrored ? '_mtrail' : '_trail';
      if (entry[ck] !== undefined) return entry[ck];
      var name = entry.trail, res = null;
      if (name) {
        if (mirrored) name = mirrorName(name);
        var spec = TRAIL_PTS[name];
        if (spec) {
          var arr = new Float32Array(TRAIL_N * 3), len = 0, px, py, pz;
          for (var i = 0; i < TRAIL_N; i++) {
            sample(entry, i / TRAIL_N, mirrored, tmp);
            applyRig(tmp, 0);
            place.updateMatrixWorld(true);
            v3.set(spec[1][0], spec[1][1], spec[1][2]);
            J[spec[0]].localToWorld(v3); place.worldToLocal(v3);
            arr[i * 3] = v3.x; arr[i * 3 + 1] = v3.y; arr[i * 3 + 2] = v3.z;
            if (i) len += Math.hypot(v3.x - px, v3.y - py, v3.z - pz);
            px = v3.x; py = v3.y; pz = v3.z;
          }
          res = len > 0.04 ? arr : null;
          applyRig(cur, 0);
        }
      }
      Object.defineProperty(entry, ck, { value: res, enumerable: false });
      return res;
    }
    var trailShown = null;
    function showTrail(arr) {
      if (arr === trailShown) return;
      trailShown = arr;
      if (!arr) { trail.visible = false; return; }
      trailGeo.attributes.position.array.set(arr);
      trailGeo.attributes.position.needsUpdate = true;
      trail.visible = true;
    }

    // ---------- focus highlight ----------
    var hot = new T.Color(C.hot), hot2 = new T.Color(C.hot2), base = new T.Color(C.joint), tmpC = new T.Color();
    var focusSet = {};
    function setFocus(list, mirrored) {
      focusSet = {};
      (list || []).forEach(function (n) { focusSet[mirrored ? mirrorName(n) : n] = true; });
      Object.keys(joints).forEach(function (n) {
        var j = joints[n], on = !!focusSet[n];
        j.mat.depthTest = !on; j.mesh.renderOrder = on ? 8 : 0;
        j.mesh.visible = on || !glb;
        if (!on) { j.mat.color.copy(base); j.mat.emissive.setRGB(0, 0, 0); j.mesh.scale.setScalar(j.r); }
      });
    }
    function pulseFocus(t, frozen) {
      var k = frozen ? 0.6 : 0.5 + 0.5 * Math.sin(t * 5);
      for (var n in focusSet) {
        var j = joints[n]; if (!j) continue;
        tmpC.copy(hot).lerp(hot2, k);
        j.mat.color.copy(tmpC).multiplyScalar(0.3); j.mat.emissive.copy(tmpC).multiplyScalar(0.8);
        if (j.ring) j.mesh.scale.setScalar(1.0 + 0.04 * k);
        else j.mesh.scale.setScalar(j.r * (1.1 + 0.12 * k));
      }
    }

    // ---------- play ----------
    function play(id, o) {
      o = o || {};
      var entry = (window.POSES && window.POSES[id]) || window.POSES.__idle;
      player.id = id; player.entry = entry; player.t0 = o.t0 != null ? o.t0 : performance.now() / 1000;
      player.freezeU = o.freezeU != null ? o.freezeU : null;
      player.mirrorStart = !!o.mirror; player.lastCycle = -1; player.lastBeat = null; player.mirrored = null; player.focus = null;
      player.onCycle = o.onCycle || null; player.onBeat = o.onBeat || null; player.perSide = o.perSide || 1;
      var want = entry.props || {};
      Object.keys(props).forEach(function (k) { props[k].userData.want = want[k] || null; });
      if (player.freezeU != null) snap = true;
    }

    function warp(m, x) {
      var t = 0, sp = 1, seg = m.speeds;
      for (var i = 0; i < seg.length; i++) {
        var s0 = seg[i][0], s1 = i + 1 < seg.length ? seg[i + 1][0] : m.duration;
        if (x <= s0) break;
        t += (Math.min(x, s1) - s0) * seg[i][1];
        if (x < s1) sp = seg[i][1];
      }
      return { t: t, speed: sp };
    }

    // ---------- camera ----------
    var camState = null, camFrom = null, camTo = null, camKey = null, camT0 = 0;
    function camPreset(entry, u) {
      var c = entry.camera || 'threeQuarter';
      if (Array.isArray(c)) { var pick = c[0][1]; for (var i = 0; i < c.length; i++) if (u >= c[i][0]) pick = c[i][1]; c = pick; }
      return c;
    }
    function updateCam(name, now, frozen, mirrored) {
      var p = typeof name === 'object' ? name : (CAMS[name] || CAMS.threeQuarter);
      if (mirrored) p = Object.assign({}, p, { az: -p.az });
      var key = (typeof name === 'object' ? JSON.stringify(name) : name) + (mirrored ? '~m' : '');
      if (!camState || frozen) { camState = Object.assign({}, p); camKey = key; camTo = null; }
      else if (key !== camKey) { camKey = key; camFrom = Object.assign({}, camState); camTo = p; camT0 = now; }
      if (camTo) {
        var f = Math.min(1, (now - camT0) / 1.1), e = EASE.inOut(f);
        ['az', 'el', 'dist', 'ty', 'tz'].forEach(function (k) { camState[k] = camFrom[k] + (camTo[k] - camFrom[k]) * e; });
        if (f >= 1) camTo = null;
      }
      var az = camState.az + (frozen ? 0 : 4 * Math.sin(now * 0.21));
      var el = camState.el + (frozen ? 0 : 1.2 * Math.sin(now * 0.17));
      var dist = camState.dist * (cam.aspect < 0.85 ? 0.85 / cam.aspect : 1);
      var cx = place.position.x, cz = place.position.z + camState.tz;
      var ra = az * D2R, re = el * D2R;
      cam.position.set(cx + Math.sin(ra) * Math.cos(re) * dist, camState.ty + Math.sin(re) * dist, cz + Math.cos(ra) * Math.cos(re) * dist);
      cam.lookAt(cx, camState.ty, cz);
    }

    // ---------- per-frame ----------
    function apply(p, now, dt, frozen, entry, mirrored, speed) {
      // Bud's spot on the island.
      var tp = entry.place || [0, 0];
      var pa = frozen ? 1 : Math.min(1, dt * 4);
      place.position.x += (tp[0] - place.position.x) * pa;
      place.position.z += (tp[1] - place.position.z) * pa;

      var hopY = 0, squash = p.squash[0];
      if (hopT >= 0) {
        var h = (now - hopT) / hopDur;
        if (h >= 1) hopT = -1;
        else if (h < 0.18) squash += 0.9 * Math.sin(h / 0.18 * Math.PI);
        else if (h < 0.82) { var a = (h - 0.18) / 0.64; hopY = 0.2 * 4 * a * (1 - a); squash -= 0.6 * Math.sin(a * Math.PI) * (a < 0.5 ? 1 : 0.4); }
        else squash += 0.8 * Math.sin((h - 0.82) / 0.18 * Math.PI);
      }
      applyRig(p, hopY);
      root.scale.set(1 + 0.06 * squash, 1 - 0.1 * squash, 1 + 0.06 * squash);

      var br = p.breath[0] + (frozen ? 0 : 0.18 * (0.5 + 0.5 * Math.sin(now * 1.7)));
      torsoMesh.scale.set(1 + 0.07 * br, 1 + 0.035 * br, 1 + 0.11 * br);
      J.lClav.rotation.z += 4 * D2R * p.breath[0]; J.rClav.rotation.z -= 4 * D2R * p.breath[0];
      if (!frozen && p.idle[0] > 0) {
        J.neck.rotation.z += Math.sin(now * 0.9) * 1.6 * D2R * p.idle[0];
        J.spine.rotation.z += Math.sin(now * 0.6 + 1) * 1.0 * D2R * p.idle[0];
      }
      sprout.rotation.z = Math.sin(now * 2.1) * 0.12 + (hopT >= 0 ? 0.25 * Math.sin(now * 18) : 0);

      var close = p.eyes[2];
      if (!frozen) {
        if (blink.t < 0 && now > blink.next) blink.t = now;
        if (blink.t >= 0) {
          var bt = (now - blink.t) / 0.16;
          if (bt >= 1) { blink.t = -1; blink.next = now + 1.8 + Math.random() * 3.2; }
          else close = Math.max(close, Math.sin(bt * Math.PI));
        }
      }
      drawFace({ lx: p.eyes[0], ly: p.eyes[1], close: close, open: p.mouth[0], smile: p.mouth[1] });

      laptop.position.z = 0.12 - p.laptop[0];
      laptopLid.rotation.x = (-12 + p.laptop[1]) * D2R;

      // Tension (mini PMR): a tiny tremor and a warm flush, gone on release.
      var tz = p.tense[0];
      if (tz > 0.01) {
        var jit = frozen ? 0 : Math.sin(now * 47) * 0.9 * D2R * tz;
        J.chest.rotation.z += jit; J.neck.rotation.x += jit * 0.7;
        J.lElbow.rotation.z += jit; J.rElbow.rotation.z -= jit;
      }
      M.body.emissive.setRGB(0.35 * tz, 0.08 * tz, 0.02 * tz); M.limb.emissive.copy(M.body.emissive);

      glass.visible = p.glass[0] > 0.5;
      if (glass.visible) glass.userData.water.scale.z = Math.max(0.15, p.glass[1]);

      rugTex.offset.y = (rugTex.offset.y - dt * p.scroll[0] * 1.6 * speed) % 1;
      rug.position.set(place.position.x * 0.6, 0.004, place.position.z * 0.6);

      var lean = world.rotation.x;
      shadow.position.z = Math.sin(lean) * 0.6;
      var sc = 1 - Math.min(0.5, hopY * 0.9);
      shadow.scale.set(sc * (1 + Math.abs(lean) * 0.4), 1, sc * (1 + Math.abs(lean) * 1.3));
      shadow.material.opacity = sc;

      // Props scoot between their home and the spot an exercise needs.
      Object.keys(props).forEach(function (k) {
        var pr = props[k], ud = pr.userData, w = ud.want;
        if (w && mirrored) w = [-w[0], w[1], -(w[2] || 0)];
        var goal = w ? 1 : 0;
        if (w) ud.dest = w;
        ud.k += (goal - ud.k) * (frozen ? 1 : Math.min(1, dt * 3));
        var d = ud.dest || ud.home, e = ud.k;
        if (ud.pop) {
          pr.visible = e > 0.01; var s = Math.max(0.001, EASE.back(Math.min(1, e)));
          pr.scale.set(1, s, 1); pr.position.set(d[0], 0, d[1]); return;
        }
        pr.position.x = ud.home[0] + (d[0] - ud.home[0]) * e;
        pr.position.z = ud.home[1] + (d[1] - ud.home[1]) * e;
        pr.position.y = Math.sin(e * Math.PI) * 0.25;
        pr.rotation.y = (ud.home[2] + ((d[2] || 0) - ud.home[2]) * e) * D2R;
      });

      cloudMesh.position.y = Math.sin(now * 0.5) * 0.08;
      cloudMesh.position.x = Math.sin(now * 0.13) * 0.25;

      retarget();
      pulseFocus(now, frozen);
      showTrail(computeTrail(entry, mirrored));
    }

    function tick(now, dt) {
      var e = player.entry || window.POSES.__idle;
      var frozen = player.freezeU != null;
      var dur = e.duration || 4;
      var el = now - player.t0, tEff = el, speed = 1, macroT = -1;
      if (e.macro && !frozen) {
        // Macro timeline: the step cycle runs at different speeds (fast/easy intervals, rests).
        var md = e.macro.duration, mi = Math.floor(el / md);
        macroT = el - mi * md;
        var w = warp(e.macro, macroT);
        tEff = mi * warp(e.macro, md).t + w.t; speed = w.speed;
      }
      var cycle = frozen ? 0 : Math.floor(tEff / dur);
      var u = frozen ? player.freezeU : (tEff / dur) - cycle;
      if (e.loop === false && cycle > 0 && !frozen) u = 1;
      var sideBlock = Math.floor(cycle / (player.perSide || 1));
      var mirrored = e.mirror ? ((sideBlock % 2 === 1) !== player.mirrorStart) : player.mirrorStart;
      var foc = e.focus;
      if (e.focusAt) for (var fi = 0; fi < e.focusAt.length; fi++) if (u >= e.focusAt[fi][0]) foc = e.focusAt[fi][1];
      if (mirrored !== player.mirrored || foc !== player.focus) { player.mirrored = mirrored; player.focus = foc; setFocus(foc, mirrored); }
      sample(e, Math.max(0, Math.min(1, u)), mirrored, tgt);
      var alpha = (snap || frozen) ? 1 : 1 - Math.exp(-dt * 16);
      snap = false;
      for (var k in tgt) { var a = cur[k], b = tgt[k]; for (var n = 0; n < a.length; n++) a[n] += (b[n] - a[n]) * alpha; }
      apply(cur, now, dt, frozen, e, mirrored, speed);
      updateCam(camPreset(e, u), now, frozen, !!e.mirror && e.mirrorCamera !== false && mirrored);

      if (!frozen && cycle !== player.lastCycle) {
        if (player.lastCycle >= 0 && player.onCycle) player.onCycle(cycle);
        player.lastCycle = cycle;
      }
      var beats = e.beats, bt = u;
      if (e.macro && e.macro.beats) { beats = e.macro.beats; bt = macroT < 0 ? 0 : macroT; }
      if (beats && player.onBeat) {
        var lab = null;
        for (var i = 0; i < beats.length; i++) if (bt >= beats[i][0]) lab = beats[i][1];
        if (lab) lab = lab.replace('{side}', (mirrored !== (e.authored === 'r')) ? 'right' : 'left');
        if (lab !== player.lastBeat) { player.lastBeat = lab; player.onBeat(lab); }
      }
    }

    // ---------- loop ----------
    var running = false, raf = 0, last = 0, stopped = false;
    function frame() {
      raf = 0;
      if (!running) return;
      raf = requestAnimationFrame(frame);
      var now = performance.now() / 1000;
      var dt = Math.min(0.05, last ? now - last : 0.016); last = now;
      tick(now, dt);
      renderer.render(scene, cam);
    }
    function resize() {
      var w = renderer.domElement.clientWidth || stageEl.clientWidth || 1, h = renderer.domElement.clientHeight || stageEl.clientHeight || 1;
      renderer.setSize(w, h, false);
      cam.aspect = w / h; cam.updateProjectionMatrix();
    }
    if (window.ResizeObserver) new ResizeObserver(resize).observe(stageEl); else window.addEventListener('resize', resize);
    resize();
    function start() { if (stopped || running || document.hidden) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
    function pause() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
    document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); else start(); });

    play('__idle');
    attachGLB();

    return {
      play: play,
      hop: function () { hopT = performance.now() / 1000; },
      start: function () { stopped = false; start(); },
      stop: function () { stopped = true; pause(); },
      info: function () { return { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles }; },
      joints: J, debug: function () { return glb; },   // debug: the bound glb (null while on the procedural body)
      props: props,
    };
  }

  window.BudScene = { supported: supported, create: create, EASE: EASE, CAMS: CAMS };
})();
