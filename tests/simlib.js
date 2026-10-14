// In-page simulation helpers. Evaluated inside the game closure by the harness (window.__NVT.ev), so they can read
// the real engine state. They never ship in the distributable HTML.
window.NVSIM = (function () {
  function seedRandom(seed) { var s = seed >>> 0; Math.random = function () { s = (s + 0x6D2B79F5) | 0; var t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function prepare(trackId, diff, rivals, seed) {
    settings.diff = diff === undefined ? 1 : diff;
    // Independent race fixtures reset presentation/input history; the shipped game's anti-repeat policy is unchanged.
    settings.qual = 2; qLevel = 2; timeG = 0;
    KEY = {}; clearTouches();
    IN.steer = IN.climb = 0; IN.thr = IN.brk = IN.turPrev = IN.turEdge = false;
    DIALOGUE.bags = {}; DIALOGUE.recent = []; RIV.finalSpeaker = 0;
    var ti = trackIdx(trackId); if (curTrack !== ti) loadTrack(ti);
    // Fixed quality is required: particle budgets consume Math.random and automatic quality varies with host load.
    if (seed !== undefined) seedRandom(seed); // track loads/mesh warming must not perturb the race seed
    EV = { id: 'free_' + trackId, type: 'free', layout: trackId, title: CFG.name, rivals: rivals || defaultLineup(CFG), music: CFG.music || 'k9' };
    LINEUP = EV.rivals.slice(); resetRace(false); state = 'race'; raceTime = 0; simT = 0; STATS.wc = {}; STATS.wo = {};
  }
  // full race with the player driven by the standard AI (neutral personality); returns per-racer results
  function race(trackId, opt) {
    // Audio variant bags and real-time voice limits consume the shared RNG depending on host speed/camera.
    // Physics fixtures suppress emission only during this synchronous race; real audio has separate browser suites.
    var audio = {}; ['play','at','explode','hud','ui'].forEach(function(k){if(typeof AU[k]==='function'){audio[k]=AU[k];AU[k]=function(){return null;};}});
    try {
    opt = opt || {}; if (opt.seed !== undefined) seedRandom(opt.seed);
    prepare(trackId, opt.diff, opt.rivals, opt.seed);
    var p = racers[0], h = 1 / 60, maxT = opt.maxT || 900, samples = [], nan = 0, t, i, hooks = opt.hooks || [];
    p.ai = opt.playerAI || { prec: 0.8, risk: 0.35, alt: 0.4, turbo: 0.6, aggr: 0, block: 0 };
    var origState = state;
    for (t = 0; t < maxT; t += h) {
      if (p.st === RS.ACT || p.st === RS.RESP) { aiDrive(p, h); IN.steer = p.inS; IN.climb = p.inC; IN.thr = p.inT; IN.brk = p.inB; if (p.inTurbo) { IN.turEdge = true; } }
      if (state === 'finished' || state === 'done') state = 'race';
      step(h); for (i = 0; i < racers.length; i++) vehPose(racers[i], h); for (i = 0; i < TF.length; i++) trafficMatrix(TF[i], i);
      for (i = 0; i < hooks.length; i++) hooks[i](t);
      for (i = 0; i < racers.length; i++) { var c = racers[i]; if (!(isFinite(c.s) && isFinite(c.x) && isFinite(c.y) && isFinite(c.dist))) nan++; }
      if (racers.every(function (c) { return c.finished; })) break;
    }
    var out = racers.map(function (c) {
      return { id: c.drv.id, finished: c.finished, time: c.finished ? +c.finishTime.toFixed(2) : null, dist: Math.round(c.dist), place: c.place, wrecks: c.wrecks, td: c.td, best: +(c.bestLap || 0).toFixed(2), rt: c.rt || 0, routes: c.routeLog || null };
    });
    return { track: trackId, L: Math.round(L), simT: +t.toFixed(1), nan: nan, racers: out, wc: STATS.wc || {}, wo: STATS.wo || {} };
    } finally { Object.keys(audio).forEach(function(k){AU[k]=audio[k];}); }
  }
  return { seedRandom: seedRandom, prepare: prepare, race: race };
})();
