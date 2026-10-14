// NEON VERTIGO 3.7 · DISTRICT OVERDRIVE — programmatic composition of the new Sony and Vader turbo layers.
// Runs in any Chromium page (OfflineAudioContext). Everything is synthesized: no samples, no network.
// The harmony tables were measured from the shipped Chords/Bass stems (tools/analyze in the handoff document):
// 145 BPM, 4/4, 16 bars per loop, one entry per beat (64 beats). Each entry lists the pitch classes that are safe
// on that beat (chord tones confirmed in the stems) and the bass root.
(function () {
  var BPM = 145, BEAT = 60 / BPM, S16 = BEAT / 4, BAR = BEAT * 4, LOOP = BAR * 16, SR = 48000, TAIL = 0.75;
  var PC = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  function pcs(s) { return s.split(' ').map(function (n) { return PC[n]; }); }
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  // ---- harmony per beat (root first), measured from the shipped Chords+Bass stems (tools/turbo_harmony.json) ----
  // allowed = pitch classes with weight >= 0.12, the bass root first, plus the perfect fifth of the root when it does not
  // sit a semitone away from another sounding pitch class
  function fromHarm(rows) { return rows.map(function (r) { var s = []; r.pcs.forEach(function (p, i) { if (r.w[i] >= 0.12 && p !== r.root) s.push(p); }); s.unshift(r.root);
    var f = (r.root + 7) % 12, adj = s.some(function (q) { var d = ((q - f) % 12 + 12) % 12; return d === 1 || d === 11; }); if (s.indexOf(f) < 0 && !adj) s.push(f); return s; }); }
  var SONY = fromHarm(window.NV_HARM.sony), VADER = fromHarm(window.NV_HARM.vader);
  // nearest MIDI note >= lo whose pitch class is in the set, ordered ascending inside [lo,hi]
  function tonesIn(set, lo, hi) { var out = []; for (var m = lo; m <= hi; m++) if (set.indexOf(((m % 12) + 12) % 12) >= 0) out.push(m); return out; }
  // ---------- shared synth helpers ----------
  function env(g, t, a, peak, d, sus, rel, len) { g.setValueAtTime(0.0001, t); g.linearRampToValueAtTime(peak, t + a); g.setTargetAtTime(peak * sus, t + a, d / 3); g.setValueAtTime(peak * sus, t + len); g.setTargetAtTime(0.0001, t + len, rel / 4); }
  function shaper(o, amt) { var ws = o.createWaveShaper(), n = 2048, c = new Float32Array(n); for (var i = 0; i < n; i++) { var x = i / (n - 1) * 2 - 1; c[i] = Math.tanh(x * amt) / Math.tanh(amt); } ws.curve = c; ws.oversample = '2x'; return ws; }
  function noiseBuf(o, sec) { var b = o.createBuffer(1, Math.ceil(sec * o.sampleRate), o.sampleRate), d = b.getChannelData(0), s = 22222; for (var i = 0; i < d.length; i++) { s = (s * 1103515245 + 12345) >>> 0; d[i] = (s / 2147483648) - 1; } return b; }
  function verb(o, out, sec, wet, damp) { var c = o.createConvolver(), n = Math.ceil(sec * o.sampleRate), b = o.createBuffer(2, n, o.sampleRate), s = 777;
    for (var ch = 0; ch < 2; ch++) { var d = b.getChannelData(ch), lp = 0; for (var i = 0; i < n; i++) { s = (s * 1664525 + 1013904223) >>> 0; var w = (s / 2147483648) - 1; lp += (w - lp) * damp; d[i] = lp * Math.pow(1 - i / n, 3) * (i < 300 ? i / 300 : 1); } }
    c.buffer = b; var g = o.createGain(); g.gain.value = wet; c.connect(g); g.connect(out); return c; }
  function delayLine(o, out, time, fb, wet, lpHz, panAlt) { var inp = o.createGain(), dl = o.createDelay(2), f = o.createGain(), lp = o.createBiquadFilter(), w = o.createGain(); dl.delayTime.value = time; f.gain.value = fb; lp.type = 'lowpass'; lp.frequency.value = lpHz; w.gain.value = wet;
    inp.connect(dl); dl.connect(lp); lp.connect(f); f.connect(dl); var p = o.createStereoPanner(); p.pan.value = panAlt; lp.connect(w); w.connect(p); p.connect(out); return inp; }

  // =================== SONY · "NEON FANG RUSH" (G minor) ===================
  function renderSony(o) {
    var out = o.createGain(); out.gain.value = 1; var comp = o.createDynamicsCompressor(); comp.threshold.value = -20; comp.knee.value = 6; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.09; out.connect(comp); comp.connect(o.destination);
    var pump = o.createGain(); pump.connect(out); // gentle quarter-note pump (groove, no level change on average)
    for (var q = 0; q < 64; q++) { var tq = q * BEAT; pump.gain.setValueAtTime(0.78, tq); pump.gain.linearRampToValueAtTime(1, tq + S16 * 1.6); }
    var rev = verb(o, pump, 1.6, 0.16, 0.35), echo = delayLine(o, pump, S16 * 3, 0.3, 0.22, 3800, 0.55);
    var hookBus = o.createGain(); hookBus.gain.value = 1; var hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 180; hookBus.connect(hp);
    var hookLP = o.createBiquadFilter(); hookLP.type = 'lowpass'; hookLP.frequency.value = 5600; hp.connect(hookLP); hookLP.connect(pump); hookLP.connect(rev); hookLP.connect(echo);
    var prevM = 67;
    function pluck(m, t, len, vel, slide, pan) {
      var from = Math.abs(prevM - m) <= 7 && prevM !== m ? prevM : m - 1; prevM = m;
      var f = mtof(m), g = o.createGain(), lp = o.createBiquadFilter(), p = o.createStereoPanner(); p.pan.value = pan || 0;
      lp.type = 'lowpass'; lp.Q.value = 3.2; lp.frequency.setValueAtTime(5200, t); lp.frequency.setTargetAtTime(1300, t + 0.004, 0.06);
      [['square', 0, 0.55], ['sawtooth', 7, 0.35], ['sawtooth', -7, 0.35]].forEach(function (v) { var os = o.createOscillator(); os.type = v[0]; os.detune.value = v[1];
        if (slide) { os.frequency.setValueAtTime(mtof(from), t); os.frequency.exponentialRampToValueAtTime(f, t + 0.045); } else os.frequency.setValueAtTime(f, t);
        var vg = o.createGain(); vg.gain.value = v[2]; os.connect(vg); vg.connect(lp); os.start(t); os.stop(t + len + 0.3); });
      // glassy FM sparkle one octave up (quiet)
      var c = o.createOscillator(), mo = o.createOscillator(), mg = o.createGain(), cg = o.createGain(); c.frequency.value = f * 2; mo.frequency.value = f * 4; mg.gain.setValueAtTime(f * 2.2, t); mg.gain.setTargetAtTime(1, t, 0.05);
      mo.connect(mg); mg.connect(c.frequency); cg.gain.setValueAtTime(0.0001, t); cg.gain.linearRampToValueAtTime(0.1, t + 0.003); cg.gain.setTargetAtTime(0.0001, t + 0.01, 0.07); c.connect(cg); cg.connect(lp); c.start(t); mo.start(t); c.stop(t + 0.5); mo.stop(t + 0.5);
      lp.connect(g); g.connect(p); p.connect(hookBus); env(g.gain, t, 0.002, vel, 0.12, 0.28, 0.06, len);
    }
    function stab(set, t, pan) { var tones = tonesIn(set, 55, 67), g = o.createGain(), lp = o.createBiquadFilter(), p = o.createStereoPanner(); p.pan.value = pan; lp.type = 'lowpass'; lp.frequency.setValueAtTime(3000, t); lp.frequency.setTargetAtTime(900, t, 0.05); lp.Q.value = 1.5;
      tones.slice(0, 3).forEach(function (m) { [-11, 0, 11].forEach(function (dt) { var os = o.createOscillator(); os.type = 'sawtooth'; os.frequency.value = mtof(m); os.detune.value = dt; os.connect(lp); os.start(t); os.stop(t + 0.3); }); });
      lp.connect(g); g.connect(p); p.connect(hp); env(g.gain, t, 0.003, 0.05, 0.06, 0.25, 0.05, 0.08); }
    function zip(t, dur, pan) { var s = o.createBufferSource(); s.buffer = noiseBuf(o, dur + 0.1); var bp = o.createBiquadFilter(), g = o.createGain(), p = o.createStereoPanner(); p.pan.value = pan; bp.type = 'bandpass'; bp.Q.value = 2.5;
      bp.frequency.setValueAtTime(700, t); bp.frequency.exponentialRampToValueAtTime(4200, t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.16, t + dur * 0.9); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.02);
      s.connect(bp); bp.connect(g); g.connect(p); p.connect(pump); s.start(t); s.stop(t + dur + 0.05); }
    // rhythm: 1 = note, 2 = note with slide (mischief), 0 = rest
    var RH_A = [1, 0, 1, 1, 0, 2, 1, 0, 1, 0, 1, 1, 0, 1, 2, 0], RH_B = [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 2, 1, 0, 1, 1, 0];
    // contour: index into the ascending chord-tone ladder of the current beat (from an anchor near G4)
    var CT_A = [0, 0, 1, 2, 0, 3, 2, 0, 1, 0, 2, 3, 0, 4, 3, 0], CT_B = [4, 0, 3, 2, 0, 3, 1, 0, 2, 0, 0, 1, 0, 2, 5, 0];
    var CT_C = [0, 0, 2, 4, 0, 2, 5, 0, 0, 0, 3, 5, 0, 6, 4, 0], CT_D = [6, 0, 4, 2, 0, 5, 3, 0, 4, 0, 1, 3, 0, 2, 6, 0];
    for (var bar = 0; bar < 16; bar++) {
      var secB = bar >= 8, odd = bar % 2 === 0, rh = odd ? RH_A : RH_B, ct = secB ? (odd ? CT_C : CT_D) : (odd ? CT_A : CT_B);
      for (var st = 0; st < 16; st++) {
        var beat = bar * 4 + (st >> 2), set = SONY[beat], t = bar * BAR + st * S16, lad = tonesIn(set, 67, 88);
        if (rh[st]) { var m = lad[Math.min(lad.length - 1, ct[st])], acc = st % 4 === 0 ? 0.24 : 0.17, last = bar === 15 && st >= 12;
          if (last) m = lad[Math.max(0, lad.length - 1 - (st - 12) * 2)];
          pluck(m, t, S16 * (st % 4 === 0 ? 1.4 : 0.75), acc, rh[st] === 2, (st % 8 < 4 ? -0.18 : 0.18)); }
        if (st % 4 === 2) stab(set, t, st % 8 === 2 ? -0.45 : 0.45);
      }
      if (bar % 2 === 1) zip(bar * BAR + 12 * S16, 4 * S16 * 0.95, bar % 4 === 1 ? -0.3 : 0.3);
    }
    return out;
  }

  // =================== VADER · "IRON PRESS PROTOCOL" (G# Phrygian / industrial) ===================
  function renderVader(o) {
    var out = o.createGain(); var comp = o.createDynamicsCompressor(); comp.threshold.value = -18; comp.knee.value = 6; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.12; out.connect(comp); comp.connect(o.destination);
    var rev = verb(o, out, 1.9, 0.14, 0.18);
    var bus = o.createGain(); var hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 110; bus.connect(hp); hp.connect(out); hp.connect(rev);
    var dist = shaper(o, 3.2), distLP = o.createBiquadFilter(); distLP.type = 'lowpass'; distLP.frequency.value = 2600; dist.connect(distLP); distLP.connect(bus);
    function rootAt(beat) { return VADER[beat][0]; }
    function gall(m, t, len, vel) { // gallop ostinato note: saw+square, resonant filter envelope, onset pitch drop (mechanical)
      var f = mtof(m), lp = o.createBiquadFilter(), g = o.createGain(); lp.type = 'lowpass'; lp.Q.value = 6; lp.frequency.setValueAtTime(2200, t); lp.frequency.setTargetAtTime(380, t + 0.004, 0.035);
      [['sawtooth', 0, 0.5], ['square', -9, 0.35], ['sawtooth', 1200, 0.12]].forEach(function (v) { var os = o.createOscillator(); os.type = v[0]; os.detune.value = v[1]; os.frequency.setValueAtTime(f * 1.06, t); os.frequency.exponentialRampToValueAtTime(f, t + 0.02);
        var vg = o.createGain(); vg.gain.value = v[2]; os.connect(vg); vg.connect(lp); os.start(t); os.stop(t + len + 0.2); });
      lp.connect(g); g.connect(dist); env(g.gain, t, 0.002, vel, 0.05, 0.35, 0.03, len); }
    function brass(ms, t, len, vel, pan) { // dark power-brass lead: detuned saws, slow filter swell, vibrato after the attack
      var lp = o.createBiquadFilter(), g = o.createGain(), p = o.createStereoPanner(); p.pan.value = pan; lp.type = 'lowpass'; lp.Q.value = 1.4; lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(2300, t + 0.07); lp.frequency.setTargetAtTime(1500, t + 0.1, 0.2);
      var lfo = o.createOscillator(), lg = o.createGain(); lfo.frequency.value = 5.4; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(14, t + len * 0.8); lfo.connect(lg); lfo.start(t); lfo.stop(t + len + 0.4);
      ms.forEach(function (m, k) { [-12, -4, 5, 12].forEach(function (dt) { var os = o.createOscillator(); os.type = 'sawtooth'; os.frequency.value = mtof(m); os.detune.value = dt; lg.connect(os.detune);
        var vg = o.createGain(); vg.gain.value = k === 0 ? 0.2 : 0.13; os.connect(vg); vg.connect(lp); os.start(t); os.stop(t + len + 0.4); }); });
      var ws = shaper(o, 1.8); lp.connect(ws); ws.connect(g); g.connect(p); p.connect(bus); env(g.gain, t, 0.03, vel, 0.25, 0.75, 0.12, len); }
    function clank(t, pan, k) { // inharmonic FM metal hit
      var c = o.createOscillator(), mo = o.createOscillator(), mg = o.createGain(), g = o.createGain(), bp = o.createBiquadFilter(), p = o.createStereoPanner(); p.pan.value = pan;
      var f = [780, 1130, 940][k % 3]; c.frequency.value = f; mo.frequency.value = f * 1.414; mg.gain.setValueAtTime(f * 3, t); mg.gain.setTargetAtTime(10, t, 0.03); mo.connect(mg); mg.connect(c.frequency);
      bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 1.2; c.connect(bp); bp.connect(g); g.connect(p); p.connect(out); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.07, t + 0.002); g.gain.setTargetAtTime(0.0001, t + 0.005, 0.03);
      c.start(t); mo.start(t); c.stop(t + 0.25); mo.stop(t + 0.25); }
    function press(t, rootPc) { // hydraulic press: low thump + filtered steam burst + root-pitched metal ring
      var os = o.createOscillator(), g = o.createGain(); os.frequency.setValueAtTime(120, t); os.frequency.exponentialRampToValueAtTime(52, t + 0.18); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.32, t + 0.004); g.gain.setTargetAtTime(0.0001, t + 0.03, 0.08); os.connect(g); g.connect(out); os.start(t); os.stop(t + 0.6);
      var s = o.createBufferSource(); s.buffer = noiseBuf(o, 0.6); var bp = o.createBiquadFilter(), ng = o.createGain(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(1800, t); bp.frequency.exponentialRampToValueAtTime(500, t + 0.4); bp.Q.value = 0.9;
      ng.gain.setValueAtTime(0.0001, t); ng.gain.linearRampToValueAtTime(0.14, t + 0.01); ng.gain.setTargetAtTime(0.0001, t + 0.05, 0.12); s.connect(bp); bp.connect(ng); ng.connect(out); ng.connect(rev); s.start(t); s.stop(t + 0.6);
      var m = 60 + ((rootPc - 60) % 12 + 12) % 12, r = o.createOscillator(), rm = o.createOscillator(), rmg = o.createGain(), rg = o.createGain(); r.frequency.value = mtof(m); rm.frequency.value = mtof(m) * 2.76; rmg.gain.value = mtof(m) * 0.8; rm.connect(rmg); rmg.connect(r.frequency);
      rg.gain.setValueAtTime(0.0001, t); rg.gain.linearRampToValueAtTime(0.05, t + 0.005); rg.gain.setTargetAtTime(0.0001, t + 0.02, 0.25); r.connect(rg); rg.connect(rev); rg.connect(out); r.start(t); rm.start(t); r.stop(t + 1.4); rm.stop(t + 1.4); }
    function servo(t, dur) { var os = o.createOscillator(), bp = o.createBiquadFilter(), g = o.createGain(), p = o.createStereoPanner(); p.pan.value = 0.35; os.type = 'sawtooth'; os.frequency.setValueAtTime(180, t); os.frequency.exponentialRampToValueAtTime(720, t + dur);
      bp.type = 'bandpass'; bp.Q.value = 5; bp.frequency.setValueAtTime(500, t); bp.frequency.exponentialRampToValueAtTime(1800, t + dur); os.connect(bp); bp.connect(g); g.connect(p); p.connect(out); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.045, t + dur * 0.8); g.gain.linearRampToValueAtTime(0.0001, t + dur);
      os.start(t); os.stop(t + dur + 0.05); }
    var GAL = [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1];
    for (var bar = 0; bar < 16; bar++) {
      for (var st = 0; st < 16; st++) {
        var beat = bar * 4 + (st >> 2), set = VADER[beat], t = bar * BAR + st * S16, root = rootAt(beat), rm = 44 + ((root - 44) % 12 + 12) % 12; // root in G#2..G3
        if (GAL[st]) gall(rm, t, S16 * (GAL[st + 1] === 0 || st % 4 === 0 ? 1.6 : 0.7), st % 4 === 0 ? 0.3 : 0.2);
        if (st % 4 === 3) clank(t, st % 8 === 3 ? -0.5 : 0.5, bar + st);
      }
      // 3 + 3 + 2 march motif (dotted quarter, dotted quarter, quarter): chord root, contour lifts on the 3rd hit, octave answer in odd bars
      [[0, 5, 0], [6, 5, 1], [12, 3, 2]].forEach(function (h) {
        var st = h[0], beat = bar * 4 + (st >> 2), set = VADER[beat], lad = tonesIn(set, 56, 68), base = lad[0];
        var top = h[2] === 2 ? lad[Math.min(lad.length - 1, bar % 2 ? 2 : 1)] : (h[2] === 1 && bar % 2 ? lad[Math.min(lad.length - 1, 1)] : base);
        var five = tonesIn([((top % 12) + 7) % 12], top + 1, top + 12)[0], chord = set.indexOf(((top + 7) % 12 + 12) % 12) >= 0 ? [top, five] : [top, top + 12];
        brass(chord, bar * BAR + st * S16, S16 * h[1] * 0.92, h[2] === 2 ? 0.2 : 0.16, h[2] === 1 ? -0.2 : 0.2); });
      if (bar % 2 === 0) press(bar * BAR, VADER[bar * 4][0]);
      if (bar % 4 === 3) servo(bar * BAR + 12 * S16, 4 * S16 * 0.95);
    }
    return out;
  }
  function render(which) {
    var n = Math.round((LOOP + TAIL) * SR), o = new OfflineAudioContext(2, n, SR);
    (which === 'vader' ? renderVader : renderSony)(o);
    return o.startRendering().then(function (b) { return { sr: SR, loop: LOOP, tail: TAIL, frames: b.length, L: b.getChannelData(0), R: b.getChannelData(1) }; });
  }
  window.NV_TURBO = { render: render, SONY: SONY, VADER: VADER, BPM: BPM, LOOP: LOOP };
})();
