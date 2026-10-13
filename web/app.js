/* stretchbud: UI flow and the Swift <-> JS bridge. MIT License.
 *
 * Swift -> JS:
 *   window.bud.start({items, mandatory, laterLeft, primary, theme})
 *   window.bud.stop()
 *   window.bud.preview(id)      loops one exercise forever
 * JS -> Swift (window.webkit.messageHandlers.bud.postMessage):
 *   {type:"ready"} | {type:"done", items} | {type:"later"} | {type:"skip"}
 *
 * Browser demo: index.html?demo           picker + "Play routine"
 *               index.html?demo&ex=<id>   loops one exercise (GIF capture)
 *   extra (capture helpers): &t=<0..1> freezes the cycle at that point,
 *   &side=right mirrors, &theme=dark, &capture hides the picker.
 */
(function () {
  'use strict';

  var EX = window.EXERCISES || {};
  var POSES = window.POSES || {};
  // Content for an id: exercises.js entry, or a minimal stand-in so an animation can still preview.
  function exFor(id) {
    if (EX[id]) return EX[id];
    if (!POSES[id]) return null;
    var name = id.replace(/-/g, ' '); name = name.charAt(0).toUpperCase() + name.slice(1);
    return { id: id, name: name, kind: 'micro', durationSec: 30, reps: null, holdSec: null, sides: false, steps: [], cue: '', caution: [], evidence: '', sources: [] };
  }
  var $ = function (id) { return document.getElementById(id); };
  var el = {
    app: $('app'), card: $('card'), kicker: $('kicker'), name: $('exName'), ring: $('ring'), ringFg: $('ringFg'), ringTxt: $('ringTxt'),
    stage: $('stage'), bubble: $('bubble'), bubbleTxt: $('bubbleTxt'), beat: $('beat'), reps: $('reps'), dots: $('dots'), nogl: $('nogl'),
    why: $('why'), whyCue: $('whyCue'), whyNote: $('whyNote'), whyMistake: $('whyMistake'), whyCaution: $('whyCaution'), whyEv: $('whyEv'), whySrc: $('whySrc'),
    whyBtn: $('whyBtn'), skipBtn: $('skipBtn'), laterBtn: $('laterBtn'), doneBtn: $('doneBtn'),
    secondary: $('secondary'), confetti: $('confetti'), demo: $('demo'), demoList: $('demoList'), playRoutine: $('playRoutine'),
  };
  var RING_LEN = 2 * Math.PI * 27;
  var EVIDENCE = {
    guideline: 'guideline-backed (the exercise type is in an official guideline)',
    clinical: 'clinical practice (physio and patient handouts)',
    consensus: 'expert consensus (ergonomics bodies)',
    weak: 'weak (little trial support; low risk)',
  };
  var KIND_LABEL = { micro: 'Quick stretch', move: 'Move break', vo2: 'VO2 challenge', walk: 'Walk', reset: 'Reset', eyes: 'Eye break', water: 'Water', breath: 'Breathe' };
  var PRAISE = ['Nice one!', 'Lovely!', 'Great job!', 'Smooth!', 'You did it!'];

  function post(msg) {
    var h = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.bud;
    if (h) { try { h.postMessage(msg); } catch (e) { console.log('[bud]', msg); } }
    else console.log('[bud ->]', JSON.stringify(msg));
  }

  // ---------- 3D scene (lazy) ----------
  var scene = null, sceneTried = false;
  function ensureScene() {
    if (sceneTried) return scene;
    sceneTried = true;
    try {
      if (window.THREE && window.BudScene && window.BudScene.supported()) scene = window.BudScene.create(el.stage);
    } catch (e) { console.warn('Bud 3D failed:', e); scene = null; }
    if (!scene) el.nogl.hidden = false;
    else {
      scene.start();
      el.stage.addEventListener('click', function (ev) {
        if (ev.target && ev.target.classList && ev.target.classList.contains('bud-canvas')) scene.hop();
      });
    }
    return scene;
  }

  // ---------- state ----------
  var S = null;       // current session
  var timer = 0;

  function clearTimer() { if (timer) clearInterval(timer); timer = 0; }

  function setTheme(theme) {
    var dark = theme === 'dark' || (theme !== 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('theme-dark', !!dark);
  }

  function say(text) {
    if (el.bubbleTxt.textContent === text) return;
    el.bubbleTxt.textContent = text;
    el.bubble.classList.remove('swap'); void el.bubble.offsetWidth; el.bubble.classList.add('swap');
  }
  function setName(kicker, name) {
    el.kicker.textContent = kicker;
    el.name.textContent = name;
    el.name.classList.remove('swap'); void el.name.offsetWidth; el.name.classList.add('swap');
  }
  function setBeat(text) {
    if (!text) { el.beat.classList.remove('on'); return; }
    el.beat.textContent = text;
    el.beat.classList.add('on');
    el.beat.classList.remove('pulse'); void el.beat.offsetWidth; el.beat.classList.add('pulse');
  }
  function setRing(frac, label) {
    el.ringFg.style.strokeDashoffset = String(RING_LEN * (1 - Math.max(0, Math.min(1, frac))));
    el.ringTxt.textContent = label;
  }
  function fmt(sec) {
    sec = Math.max(0, Math.ceil(sec));
    return sec >= 60 ? Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2) : String(sec);
  }
  function renderDots(n, idx) {
    el.dots.innerHTML = '';
    if (n < 2) return;
    for (var i = 0; i < n; i++) {
      var d = document.createElement('i');
      if (i === idx) d.className = 'on'; else if (i < idx) d.className = 'done';
      el.dots.appendChild(d);
    }
  }
  function fillWhy(ex) {
    el.whyCue.textContent = ex.cue || '';
    el.whyCaution.innerHTML = '';
    (ex.caution || []).forEach(function (c) { var li = document.createElement('li'); li.textContent = c; el.whyCaution.appendChild(li); });
    el.whyEv.textContent = EVIDENCE[ex.evidence] || ex.evidence || '';
    el.whyNote.textContent = ex.evidenceNote || '';
    el.whyMistake.textContent = ex.mistake ? 'Common mistake: ' + ex.mistake : '';
    el.whySrc.innerHTML = '';
    (ex.sources || []).forEach(function (s) {
      var li = document.createElement('li'), a = document.createElement('a');
      a.textContent = s.title; a.href = s.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      li.appendChild(a); el.whySrc.appendChild(li);
    });
  }

  // Step index for the current point of the animation (pose.stepAt), else time-based.
  function stepFor(ex, pose, u, elapsed) {
    var n = (ex.steps || []).length;
    if (!n) return -1;
    if (elapsed < 4) return 0;   // the setup step always gets the first seconds
    if (pose && pose.stepSec) {
      var x = elapsed % (pose.repSec || pose.duration || 30), k = 0;
      for (var j = 0; j < pose.stepSec.length && j < n; j++) if (x >= pose.stepSec[j]) k = j;
      return k;
    }
    if (pose && pose.stepAt) {
      var idx = 0;
      for (var i = 0; i < pose.stepAt.length && i < n; i++) if (u >= pose.stepAt[i]) idx = i;
      return idx;
    }
    var per = Math.max(4, (ex.durationSec || 30) / n);
    return Math.min(n - 1, Math.floor(elapsed / per));
  }

  // ---------- session ----------
  function start(cfg) {
    cfg = cfg || {};
    stopSession();
    setTheme(cfg.theme || 'auto');
    if (cfg.primary === false) {
      el.app.hidden = true; el.secondary.hidden = false;
      if (scene) scene.stop();
      return;
    }
    el.secondary.hidden = true; el.app.hidden = false;
    var items = (cfg.items || []).filter(function (id) { return EX[id] || (cfg.preview && exFor(id)); });
    if (!items.length) items = Object.keys(EX).slice(0, 1);
    if (!items.length) items = ['__idle'];
    S = {
      items: items, idx: -1, mandatory: !!cfg.mandatory, laterLeft: cfg.laterLeft | 0,
      t0: performance.now() / 1000, itemT0: 0, cycles: 0, finished: false, sent: false, preview: !!cfg.preview,
      autoDoneAt: 0,
    };
    el.doneBtn.hidden = true; el.why.hidden = true; el.skipBtn.hidden = true;
    el.laterBtn.hidden = !(S.laterLeft > 0 && !S.mandatory) || S.preview;
    ensureScene();
    if (scene) scene.start();
    if (S.preview) { nextItem(); }
    else {
      setName(S.mandatory ? 'Break time' : 'Quick break', "Hi, I'm Bud!");
      say(items.length > 1 ? items.length + " tiny moves, then you're back." : "One tiny move, then you're back.");
      setRing(1, ''); renderDots(items.length, -1); el.reps.hidden = true; setBeat('');
      if (scene) scene.play('__hello');
      S.introUntil = S.t0 + 2.2;
    }
    clearTimer();
    timer = setInterval(tick, 100);
    tick();
  }

  function nextItem() {
    S.idx++;
    if (S.idx >= S.items.length) return;
    var id = S.items[S.idx], ex = exFor(id) || exFor('__idle'), pose = POSES[id];
    S.ex = ex; S.pose = pose; S.itemT0 = performance.now() / 1000; S.cycles = 0; S.stepIdx = -2;
    var label = KIND_LABEL[ex.kind] || 'Quick break';
    setName(S.items.length > 1 ? label + ' · ' + (S.idx + 1) + ' of ' + S.items.length : label, ex.name);
    renderDots(S.items.length, S.idx);
    fillWhy(ex);
    el.reps.hidden = !ex.reps;
    updateReps(false);
    setBeat('');
    var q = S.query || {};
    if (scene) {
      scene.play(pose ? id : '__idle', {
        mirror: q.side === 'right',
        perSide: pose && pose.blockSides && ex.reps ? effReps(ex, pose) : 1,
        freezeU: q.t != null ? q.t : null,
        onCycle: function (c) { S.cycles = c; updateReps(true); },
        onBeat: function (b) { setBeat(b); },
      });
    }
  }

  // Reps that fit in durationSec at the animation's real tempo (never more than the content asks).
  function effReps(ex, pose) {
    if (!ex || !ex.reps) return 0;
    pose = pose || {};
    if (pose.repSec) return Math.max(1, Math.min(ex.reps, Math.floor((ex.durationSec || 30) / pose.repSec)));
    var cycles = Math.floor((ex.durationSec || 30) / (pose.duration || 4));
    var per = ex.sides ? 2 : 1;
    return Math.max(1, Math.min(ex.reps, Math.floor(cycles / per)));
  }

  function repInfo() {
    var ex = S.ex;
    if (!ex || !ex.reps) return null;
    var pose = S.pose || {}, rep, sideIdx, of = effReps(ex, S.pose);
    if (pose.repSec) {
      rep = Math.floor((performance.now() / 1000 - S.itemT0) / pose.repSec) + 1; sideIdx = 0;
    } else if (ex.sides && pose.blockSides) {
      rep = S.cycles % of + 1; sideIdx = Math.floor(S.cycles / of) % 2;
    } else if (ex.sides) {
      rep = Math.floor(S.cycles / 2) + 1; sideIdx = S.cycles % 2;
    } else { rep = S.cycles + 1; sideIdx = 0; }
    rep = Math.min(of, rep);
    var side = ex.sides ? ((sideIdx === 0) !== (pose.authored === 'r') ? 'left' : 'right') : '';
    if (S.query && S.query.side === 'right' && ex.sides) side = side === 'left' ? 'right' : 'left';
    return { rep: rep, of: of, side: side };
  }
  function updateReps(bump) {
    var r = repInfo();
    if (!r) { el.reps.hidden = true; return; }
    el.reps.hidden = false;
    el.reps.textContent = (r.side ? r.side.charAt(0).toUpperCase() + r.side.slice(1) + ' · ' : '') + r.rep + ' / ' + r.of;
    if (bump) { el.reps.classList.remove('bump'); void el.reps.offsetWidth; el.reps.classList.add('bump'); }
  }

  function tick() {
    if (!S) return;
    var now = performance.now() / 1000;
    var sinceStart = now - S.t0;

    // Later: first 15 s only. Skip: after 20 s (also for mandatory breaks).
    if (!S.preview) {
      el.laterBtn.hidden = !(S.laterLeft > 0 && !S.mandatory && sinceStart < 15) || S.finished;
      el.skipBtn.hidden = !(sinceStart >= 20) || S.finished;
    }

    if (S.introUntil && now < S.introUntil) return;
    if (S.idx < 0) { S.introUntil = 0; nextItem(); }
    if (S.finished) {
      if (S.autoDoneAt && now >= S.autoDoneAt) complete();
      return;
    }

    var ex = S.ex, pose = S.pose;
    var elapsed = now - S.itemT0;
    var dur = ex.durationSec || 30;
    var cycDur = (pose && pose.duration) || 4;
    var u = (S.query && S.query.t != null) ? S.query.t : (elapsed % cycDur) / cycDur;
    var si = stepFor(ex, pose, u, elapsed);
    // Each step stays readable for at least 3.5 s, even when the rep cycle is faster.
    if (si !== S.stepIdx && si >= 0 && (S.stepIdx < 0 || now - (S.stepT || 0) >= 3.5)) { S.stepIdx = si; S.stepT = now; say(ex.steps[si]); }

    if (S.preview) { setRing(1, ''); return; }
    var left = dur - elapsed;
    setRing(left / dur, fmt(left));
    el.ring.classList.toggle('ending', left <= 5);
    if (left <= 0) {
      if (S.idx < S.items.length - 1) {
        say(PRAISE[S.idx % PRAISE.length] + ' Next one.');
        if (scene) scene.hop();
        nextItem();
      } else finish();
    }
  }

  function finish() {
    S.finished = true;
    setRing(0, '');
    setBeat('');
    el.reps.hidden = true;
    el.laterBtn.hidden = true; el.skipBtn.hidden = true;
    renderDots(S.items.length, S.items.length);
    setName('All done', 'Great job!');
    say("That's it. Back to it, you've earned it.");
    el.doneBtn.hidden = false;
    S.autoDoneAt = performance.now() / 1000 + 5;
    if (scene) { scene.play('__celebrate'); scene.hop(); }
    confetti();
  }

  function complete() {
    if (!S || S.sent) return;
    S.sent = true; S.autoDoneAt = 0;
    post({ type: 'done', items: S.items.slice() });
    el.doneBtn.hidden = true;
    if (isDemo) showReplay();
  }

  function stopSession() { clearTimer(); S = null; }

  // ---------- buttons ----------
  el.doneBtn.addEventListener('click', function () { if (S && S.finished) { if (scene) scene.hop(); complete(); } });
  el.laterBtn.addEventListener('click', function () { if (S) { post({ type: 'later' }); el.laterBtn.hidden = true; } });
  el.skipBtn.addEventListener('click', function () { if (S) post({ type: 'skip' }); });
  el.whyBtn.addEventListener('click', function () {
    if (!S || !S.ex) return;
    el.why.hidden = !el.why.hidden;
    el.whyBtn.textContent = el.why.hidden ? 'Why?' : 'Close';
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && S && S.finished && !el.doneBtn.hidden) { e.preventDefault(); complete(); }
  });

  // ---------- confetti (2D canvas, stops by itself) ----------
  function confetti() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var c = el.confetti, ctx = c.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = c.clientWidth, H = c.clientHeight;
    c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var r = el.card.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height * 0.45;
    var colors = ['#3fae8a', '#ff9f6e', '#ffd166', '#7aa8ff', '#ff7aa2', '#9be3c7'];
    var ps = [];
    for (var i = 0; i < 90; i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, sp = 6 + Math.random() * 9;
      ps.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4,
        w: 6 + Math.random() * 6, h: 4 + Math.random() * 4, c: colors[i % colors.length] });
    }
    var t0 = performance.now();
    (function step(now) {
      var k = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      if (k > 2.6 || document.hidden) return;
      ps.forEach(function (p) {
        p.vy += 0.32; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.globalAlpha = Math.max(0, 1 - k / 2.6); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      requestAnimationFrame(step);
    })(t0);
  }

  window.__budInfo = function () { return scene ? scene.info() : { webgl: false }; };
  window.__budScene = function () { return scene; };

  // ---------- public API ----------
  window.bud = {
    start: function (cfg) { start(cfg); },
    stop: function () { stopSession(); if (scene) scene.stop(); },
    preview: function (id) { start({ items: [id], preview: true, theme: (S && S.theme) || 'auto' }); },
  };

  // ---------- demo mode ----------
  var params = new URLSearchParams(location.search);
  var isDemo = params.has('demo');
  function showReplay() {
    el.doneBtn.hidden = true;
    say('Want another round? Pick one on the right.');
  }
  if (isDemo) {
    document.body.classList.add('demo-mode');
    if (params.has('capture')) document.body.classList.add('capture');
    var theme = params.get('theme') || 'light';
    var query = {};
    if (params.get('t') != null) query.t = Math.max(0, Math.min(1, parseFloat(params.get('t')) || 0));
    if (params.get('side')) query.side = params.get('side');
    var ids = Object.keys(EX);
    el.demo.hidden = false;
    var btns = {};
    ids.forEach(function (id) {
      var b = document.createElement('button'); b.type = 'button';
      b.textContent = EX[id].name;
      b.addEventListener('click', function () { mark(id); window.bud.preview(id); });
      el.demoList.appendChild(b); btns[id] = b;
    });
    var mark = function (id) { ids.forEach(function (k) { btns[k].classList.toggle('on', k === id); }); };
    var routine = ['chin-tuck', 'shoulder-rolls', 'chair-sit-to-stand'];
    el.playRoutine.addEventListener('click', function () { mark(null); start({ items: routine, mandatory: false, laterLeft: 2, primary: true, theme: theme }); });
    var ex = params.get('ex');
    if (ex && exFor(ex)) {
      mark(ex);
      start({ items: [ex], preview: true, theme: theme });
      S.query = query;
      S.idx = -1; nextItem();
    } else {
      start({ items: routine, mandatory: false, laterLeft: 2, primary: true, theme: theme });
    }
  } else {
    // In the app: idle until Swift calls window.bud.start(...).
    el.app.hidden = true;
  }

  window.addEventListener('load', function () { post({ type: 'ready' }); });
})();
