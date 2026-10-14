// 3.7 HUD audio tests: real Web Audio in headless Edge (AudioContext running, output to the null sink).
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { openGame, ROOT } from './harness.mjs';

const results = []; const R = (name, pass, info) => { results.push({ name, status: pass ? 'PASS' : 'FAIL', info }); console.log(pass ? 'PASS' : 'FAIL', name, info !== undefined ? JSON.stringify(info) : ''); };
const b = await openGame({ src: process.argv[2] });
await b.ev(readFileSync(join(ROOT, 'tests', 'simlib.js'), 'utf8'));
// audio is created on the first user gesture; emulate it
await b.ev('AU.init()');
for (let i = 0; i < 100; i++) { const ok = await b.ev('AU.ready&&AU.hudInfo().bank===AU.hudInfo().of&&AU.sfxStat.ok===AU.sfxStat.total'); if (ok) break; await b.sleep(100); }
const info = await b.ev('AU.hudInfo()');
R('HUD bank rendered completely', info.bank === info.of && info.bank >= 20, { bank: info.bank, of: info.of, renderMs: info.stat.renderMs });

// 1) export every rendered buffer for offline analysis (peak, RMS, spectrum, edges)
const bufs = await b.run(`var o={};Object.keys(AU.hb).forEach(function(k){var x=AU.hb[k].buf.getChannelData(0),g=HUDCFG[k].vol,a=new Array(x.length);for(var i=0;i<x.length;i++)a[i]=+(x[i]*g).toFixed(5);o[k]={sr:AU.hb[k].buf.sampleRate,x:a};});return o;`);
mkdirSync(join(ROOT, 'work', 'hud'), { recursive: true });
writeFileSync(join(ROOT, 'work', 'hud', 'hud_buffers.json'), JSON.stringify(bufs));

// 2) cooldown + monophonic navigation: 100 calls at once
let r = await b.run(`AU.hudLast={};var n=0;for(var i=0;i<100;i++)if(AU.ui('click'))n++;return {plays:n,active:AU.hudInfo().active.length};`);
R('Burst of 100 menu navigation calls produces a single sound', r.plays === 1 && r.active <= 1, r);
// 100 calls spread over 2 s (every 20 ms): cooldown 60 ms + monophony => at most ~34 plays, never more than one nav voice
r = await b.runAsync(`AU.hudLast={};var n=0,maxNav=0;for(var i=0;i<100;i++){if(AU.ui('click'))n++;var a=AU.hudInfo().active.filter(function(x){return x==='nav';}).length;if(a>maxNav)maxNav=a;await new Promise(function(r){setTimeout(r,20);});}return {plays:n,maxNavVoices:maxNav};`);
R('Fast menu scrolling is rate-limited (cooldown) and monophonic', r.plays <= 36 && r.plays >= 10 && r.maxNavVoices <= 1, r);

// 3) priority: four critical sounds fill the polyphony, a low-priority sound is rejected, a critical one steals the lowest
r = await b.run(`AU.hudLast={};AU.hudAct.forEach(function(v){AU.hudStop(v,0.005);});AU.hudAct=[];var a=['go','lastLap','finish','critical'].map(function(k){return !!AU.hud(k);});var nav=!!AU.ui('click');var act=AU.hudInfo().active.slice();return {started:a,navAccepted:nav,active:act};`);
R('Low-priority navigation is dropped while critical cues fill the HUD voices', r.started.every(Boolean) && !r.navAccepted && r.active.length === 4, r);
r = await b.run(`AU.hudLast={};AU.hudAct.forEach(function(v){AU.hudStop(v,0.005);});AU.hudAct=[];['confirm','back','diff','locked'].forEach(function(k){AU.hud(k);});var s0=AU.hudStat.stolen,ok=!!AU.hud('lastLap');return {accepted:ok,stolen:AU.hudStat.stolen-s0,active:AU.hudInfo().active};`);
R('A critical cue steals the oldest lower-priority voice when the HUD is full', r.accepted && r.stolen === 1 && r.active.includes('lastLap') && r.active.length === 4, r);
r = await b.run(`var t=AU.ctx.currentTime;AU.hudLast={};var a=!!AU.hud('critical'),b2=!!AU.hud('critical');return {first:a,second:b2};`);
R('Per-event cooldown blocks immediate repetition of alerts', r.first && !r.second, r);

// 4) mute / volume / clipping measured on the real output (analysers on the UI bus and after the master compressor)
await b.run(`window.__an=function(node){var a=AU.ctx.createAnalyser();a.fftSize=2048;node.connect(a);return a;};window.__uiA=__an(AU.buses.ui);window.__outA=__an(AU.comp);
  window.__meas=function(a,ms){return new Promise(function(res){var buf=new Float32Array(a.fftSize),sum=0,n=0,pk=0,end=performance.now()+ms;(function st(){a.getFloatTimeDomainData(buf);for(var i=0;i<buf.length;i++){var v=buf[i];sum+=v*v;if(Math.abs(v)>pk)pk=Math.abs(v);}n+=buf.length;if(performance.now()<end)setTimeout(st,10);else res({rms:+(10*Math.log10(sum/n+1e-12)).toFixed(1),peak:+(20*Math.log10(pk+1e-9)).toFixed(1)});})();});};return true;`);
const setVol = async (code, target) => { await b.run(code + 'AU.apply();return 1;'); for (let i = 0; i < 120; i++) { const g = await b.ev(target.bus); if (Math.abs(g - target.v) < (target.v === 0 ? 1e-4 : 0.005)) return true; await b.sleep(50); } return false; };
const playMeas = async (name, ms = 450) => b.runAsync(`AU.hudLast={};AU.hudAct.forEach(function(v){AU.hudStop(v,0.005);});AU.hudAct=[];await new Promise(function(r){setTimeout(r,80);});AU.hud(${JSON.stringify(name)});return await __meas(__uiA,${ms});`);
await setVol('settings.vol.ui=100;settings.mute.ui=false;settings.vol.master=100;settings.mute.master=false;', { bus: 'AU.buses.ui.gain.value', v: 1 });
const loud = await playMeas('confirm');
await setVol('settings.vol.ui=50;', { bus: 'AU.buses.ui.gain.value', v: Math.pow(0.5, 1.6) });
const half = await playMeas('confirm');
await setVol('settings.mute.ui=true;', { bus: 'AU.buses.ui.gain.value', v: 0 });
const muted = await playMeas('confirm');
await setVol('settings.mute.ui=false;settings.vol.ui=100;settings.mute.master=true;', { bus: 'AU.master.gain.value', v: 0 });
const mOut = await b.runAsync(`AU.hudLast={};AU.hud('go');return await __meas(__outA,500);`);
await setVol('settings.mute.master=false;', { bus: 'AU.master.gain.value', v: 1 });
R('UI volume slider scales HUD level (50% ≈ -9.6 dB by the existing curve, peak)', Math.abs((loud.peak - half.peak) - 9.6) < 2, { full: loud, half });
R('UI mute silences HUD cues (below -60 dBFS, inaudible)', muted.peak < -60, muted);
R('Master mute silences HUD cues at the output (below -60 dBFS)', mOut.peak < -60, mOut);
// realistic worst case (polyphony limit = 4 voices): the four loudest cues together at 100% master and UI volume
const four = await b.runAsync(`AU.hudLast={};AU.hudAct=[];['takedown','go','finish','lastLap'].forEach(function(k){AU.hud(k);});return await __meas(__outA,1200);`);
R('No clipping at the master output: four loudest HUD cues together at full volume', four.peak < -0.1, four);
await b.sleep(1500);
const all = await b.runAsync(`AU.hudLast={};AU.hudMax=30;Object.keys(HUDSFX).forEach(function(k){AU.hud(k);});var m=await __meas(__outA,1500);AU.hudMax=4;AU.hudAct.forEach(function(v){AU.hudStop(v,0.01);});return m;`);
R('Stress (21 cues at once, beyond the 4-voice limit) stays below 0 dBFS', all.peak < 0, all);

// 5) ducking: a critical cue lowers music/engine temporarily and restores unity gain
r = await b.runAsync(`await new Promise(function(r){setTimeout(r,1600);});AU.hudLast={};AU.hud('go');await new Promise(function(r){setTimeout(r,250);});var d1=AU.hudInfo();await new Promise(function(r){setTimeout(r,1700);});var d2=AU.hudInfo();return {during:d1.duck,eng:d1.engDuck,after:d2.duck,engAfter:d2.engDuck};`);
R('Temporary ducking (~-3 dB music, ~-1.8 dB engine) and full recovery', r.during < 0.8 && r.during > 0.6 && r.eng < 0.9 && r.after > 0.99 && r.engAfter > 0.99, r);

// 6) node lifecycle: 300 plays -> every voice ends and is disconnected; global voice counter returns to its idle value
await b.sleep(1500);
r = await b.runAsync(`var v0=AU.voices;var ends=0,starts=0;for(var i=0;i<300;i++){AU.hudLast={};AU.hudAct.forEach(function(v){if(v.p>0)AU.hudStop(v,0.005);});var s=AU.hud(['nav','confirm','back','count','overtake','turboReady'][i%6]);if(s){starts++;(function(src){var o=src.onended;src.onended=function(){ends++;o&&o.apply(this,arguments);};})(s);}await new Promise(function(r){setTimeout(r,8);});}
  await new Promise(function(r){setTimeout(r,2200);});return {starts:starts,ends:ends,active:AU.hudInfo().active.length,voices:AU.voices,v0:v0};`);
R('No accumulation of Web Audio voices after 300 rapid HUD plays', r.starts > 50 && r.ends === r.starts && r.active === 0 && r.voices === r.v0, r);

// 7) suspended AudioContext: calls are ignored without errors, audio returns after resume
r = await b.runAsync(`await AU.ctx.suspend();var e=null,x;try{AU.hudLast={};x=AU.hud('confirm');AU.ui('ok');AU.hud('go');}catch(er){e=String(er);}await AU.ctx.resume();await new Promise(function(r){setTimeout(r,100);});AU.hudLast={};var y=!!AU.hud('confirm');return {err:e,whileSuspended:x,afterResume:y,state:AU.ctx.state};`);
R('Suspended AudioContext: no errors, no sound; recovers after resume', r.err === null && r.whileSuspended === null && r.afterResume && r.state === 'running', r);

// 8) game flow integration: pause/resume and a real race loop (tick) record the HUD events that fire
r = await b.runAsync(`var log=[];var orig=AU.hud;AU.hud=function(n,o){log.push(n);return orig.call(AU,n,o);};
  var ri=readInput;var p;readInput=function(dt){p=racers[0];if(state==='race'&&(p.st===RS.ACT||p.st===RS.RESP)){p.ai=p.ai&&p.ai.prec?p.ai:{prec:0.8,risk:0.35,alt:0.4,turbo:0.9,aggr:0.3,block:0};aiDrive(p,dt);IN.steer=p.inS;IN.climb=p.inC;IN.thr=true;IN.brk=false;if(p.inTurbo)IN.turEdge=true;}};
  NVSIM.seedRandom(7);career.fleet.chosen=true;playEvent({id:'free_k9',type:'free',layout:'k9',title:'K9',rivals:['vega','kira','rook'],music:'k9'});await new Promise(function(r){setTimeout(r,300);});
  beginCountdown();var n=0;while(state!=='done'&&n<60*400){tick(1/60,true);n++;if(n===60*20){pauseGame();var ps=state;resumeGame();log.push('pause:'+ps+'->'+state);}}
  await new Promise(function(r){setTimeout(r,600);});readInput=ri;AU.hud=orig;var cnt={};log.forEach(function(k){cnt[k]=(cnt[k]||0)+1;});return {state:state,frames:n,counts:cnt};`);
const flow = r; const c = flow.counts || {};
R('Race flow fires countdown, start, laps, last lap and finish cues', c.count >= 3 && c.go === 1 && c.lapNew >= 1 && c.lastLap === 1 && c.finish === 1 && c.raceGo === 1, r);
R('Race flow fires one result cue on the results screen', ((c.resultWin || 0) + (c.resultLose || 0)) === 1, c);
// deterministic state transitions of the player HUD watcher (turbo ready / turbo exhausted / critical integrity)
r = await b.run(`var log=[];var orig=AU.hud;AU.hud=function(n,o){log.push(n+(o&&o.delay?'@delayed':''));return orig.call(AU,n,o);};var p=racers[0];state='race';demo=false;p.st=RS.ACT;p.dmg=0;p.boost=0;p.energy=0.2;HUDW.init=false;hudWatch(p);
  p.energy=0.4;hudWatch(p);AU.padT=timeG;p.energy=0.2;hudWatch(p);p.energy=0.5;hudWatch(p);
  p.boost=1;hudWatch(p);p.energy=0.1;p.boost=0;hudWatch(p);p.dmg=0.8;hudWatch(p);hudWatch(p);p.dmg=0.2;hudWatch(p);p.dmg=0.85;AU.hudLast.critical=-99;hudWatch(p);
  AU.hud=orig;state='title';return log;`);
R('HUD watcher: turbo ready (immediate and after a pickup), turbo exhausted, critical integrity with re-arm', JSON.stringify(r) === JSON.stringify(['turboReady', 'turboReady@delayed', 'turboEnd', 'critical', 'critical']), r);
R('Pause and resume keep the race state', (c['pause:paused->race'] || 0) === 1, c);
const errs = b.logs.filter((l) => l.type === 'exception' || l.type === 'error');
R('No page errors during HUD tests', errs.length === 0, errs.slice(0, 5));
writeFileSync(join(ROOT, 'work', 'hud', 'hud_results.json'), JSON.stringify(results, null, 1));
await b.close();
process.exit(results.some((x) => x.status === 'FAIL') ? 1 : 0);
