// 3.7 district traffic tests: composition per district, fairness of spawns and lane changes, no barrier overlap, race impact.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openGame, ROOT } from './harness.mjs';
const results = []; const R = (name, pass, info) => { results.push({ name, status: pass ? 'PASS' : 'FAIL', info }); console.log(pass ? 'PASS' : 'FAIL', name, info !== undefined ? JSON.stringify(info) : ''); };
const SRC = process.argv[2] || join(ROOT, 'index.html');
const b = await openGame({ src: SRC });
await b.ev(readFileSync(join(ROOT, 'tests', 'simlib.js'), 'utf8'));
// monitor installed for every simulated race: overlaps with obstacles/corridor, spawn distances, lane changes
await b.ev(`window.TMON=function(){var m={steps:0,obOverlap:0,wall:0,band:0,spawnNear:0,spawns:0,minSpawnGap:1e9,lc:0,lcUnsafe:0,lcNoSignal:0,kinds:{}};
  var prevSt=TF.map(function(t){return t.st;}),prevTg=TF.map(function(t){return t.tgx;});
  return {m:m,hook:function(){m.steps++;for(var i=0;i<TF.length;i++){var t=TF[i];m.kinds[t.kind]=1;
    if(prevSt[i]!==TFS.SPAWN&&t.st===TFS.SPAWN){m.spawns++;var g=1e9;racers.forEach(function(r){g=Math.min(g,Math.abs(wrapD(t.s-r.s)));});m.minSpawnGap=Math.min(m.minSpawnGap,g);if(g<80)m.spawnNear++;}
    if(prevTg[i]===null&&t.tgx!==null){m.lc++;}
    if(t.tgx!==null&&t.sigT<=0&&prevTg[i]!==null){var p0=t.x;racers.forEach(function(r){if(r.st!==RS.ACT)return;var d=wrapD(t.s-r.s);if(d>-t.hs-1&&d<t.hs+3&&Math.abs(r.x-t.x)<t.hx+1.2&&Math.abs(r.y-t.cy)<t.hy+0.4)m.lcUnsafe++;});}
    prevSt[i]=t.st;prevTg[i]=t.tgx;
    if(t.st!==TFS.ACT&&t.st!==TFS.NUDGE)continue;var x=t.x+t.ox;tf(t.s);
    if(Math.abs(x)+t.hx>HW+0.05)m.wall++;if(t.cy-t.hy<F.yMin-0.05||t.cy+t.hy>F.yMax+0.05)m.band++;
    for(var k=0;k<OB.length;k++){var o=OB[k];if(o.k==='mouth')continue;var dd=wrapD(o.s-t.s);if(Math.abs(dd)<o.hs+t.hs&&x+t.hx>o.x0&&x-t.hx<o.x1&&t.cy+t.hy>o.y0&&t.cy-t.hy<o.y1){m.obOverlap++;m.byOb=m.byOb||{};var kk=o.k+(t.st===TFS.NUDGE?'@nudge':'');m.byOb[kk]=(m.byOb[kk]||0)+1;break;}}}}};};1`);
const tracks = await b.ev('TRACKS.map(function(t){return t.id;})');
const comp = {}; const sim = {};
const LEGACY = await b.ev('typeof TKIND==="undefined"');
if (LEGACY) await b.ev('window.TKIND=[{},{},{},{}];window.trafficProfile=function(){return null;};1');
for (const id of tracks) {
  const r = await b.run(`NVSIM.prepare(${JSON.stringify(id)});var P=trafficProfile(),ks={};TF.forEach(function(t){var K=TKIND[t.kind];ks[K.id]=(ks[K.id]||0)+1;});
    return {district:CFG.art?CFG.art.d:null,n:TF.length,same:TF.filter(function(t){return t.dir>0;}).length,onc:TF.filter(function(t){return t.dir<0;}).length,legacy:CFG.traffic.n+CFG.traffic.onc,kinds:ks,
      allDistrict:TF.every(function(t){return TKIND[t.kind].d===(CFG.art?CFG.art.d:null);}),minStart:Math.min.apply(null,TF.map(function(t){return Math.min(t.s,L-t.s);}))};`);
  comp[id] = r;
}
for (const id of tracks) R(`${id}: every vehicle belongs to its district fleet (${comp[id].district})`, comp[id].allDistrict, { kinds: comp[id].kinds, n: comp[id].n, legacy_3_6_3: comp[id].legacy });
const sets = {}; for (const id of tracks) { const d = comp[id].district; sets[d] = sets[d] || new Set(); Object.keys(comp[id].kinds).forEach((k) => sets[d].add(k)); }
const ds = Object.keys(sets); let overlap = 0; for (let i = 0; i < ds.length; i++) for (let j = i + 1; j < ds.length; j++) for (const k of sets[ds[i]]) if (sets[ds[j]].has(k)) overlap++;
R('District fleets are disjoint (no shared vehicle model between districts)', overlap === 0, Object.fromEntries(ds.map((d) => [d, [...sets[d]]])));
R('Density stays within -20%..+20% of 3.6.3 on every track', tracks.every((id) => comp[id].n >= comp[id].legacy * 0.8 && comp[id].n <= comp[id].legacy * 1.2), Object.fromEntries(tracks.map((id) => [id, comp[id].n + '/' + comp[id].legacy])));
R('No vehicle starts inside the starting grid (>= 200 m from the line)', tracks.every((id) => comp[id].minStart >= 200), Object.fromEntries(tracks.map((id) => [id, Math.round(comp[id].minStart)])));
// races with the monitor
const seeds = (process.env.SEEDS || '1,2').split(',').map(Number);
for (const id of tracks) {
  sim[id] = [];
  for (const sd of seeds) {
    const r = await b.ev(`(function(){var mon=null;var res=NVSIM.race(${JSON.stringify(id)},{seed:${sd},hooks:[function(t){if(!mon)mon=TMON();mon.hook();}]});res.mon=mon.m;return res;})()`);
    sim[id].push(r);
  }
  const m = sim[id].map((r) => r.mon);
  const agg = (k) => m.reduce((a, x) => a + x[k], 0);
  R(`${id}: traffic never overlaps obstacles, walls or the flight band`, agg('obOverlap') === 0 && agg('wall') === 0 && agg('band') === 0, { obOverlap: agg('obOverlap'), byOb: m.map((x) => x.byOb || {}), wall: agg('wall'), band: agg('band'), steps: agg('steps') });
  R(`${id}: respawned traffic never appears near a racer (>= 80 m)`, agg('spawnNear') === 0, { spawns: agg('spawns'), minGap: Math.round(Math.min(...m.map((x) => x.minSpawnGap))) });
  R(`${id}: lane changes never move into an occupied space`, agg('lcUnsafe') === 0, { laneChanges: agg('lc'), unsafe: agg('lcUnsafe') });
  R(`${id}: races finish with every racer and no NaN`, sim[id].every((r) => r.nan === 0 && r.racers.every((x) => x.finished)), sim[id].map((r) => r.racers.map((x) => x.time)));
}
// lane-change behaviour is district specific: Kowloon changes lanes, Industrial convoys never do
const lcBy = (pred) => tracks.filter(pred).reduce((a, id) => a + sim[id].reduce((s, r) => s + r.mon.lc, 0), 0);
R('Kowloon-9 traffic changes lanes (urban behaviour); Industrial Abyss never does (predictable convoys)', lcBy((id) => comp[id].district === 'k9') > 0 && lcBy((id) => comp[id].district === 'ia') === 0,
  { k9: lcBy((id) => comp[id].district === 'k9'), ia: lcBy((id) => comp[id].district === 'ia'), sv: lcBy((id) => comp[id].district === 'sv'), orb: lcBy((id) => comp[id].district === 'orb') });
// speed profiles per district (mean same-direction speed) to document behaviour
const spd = await b.run(`var o={};['k9a','iaa','sva','orb'].forEach(function(id){NVSIM.prepare(id);var a=TF.filter(function(t){return t.dir>0;});o[id]={mean:+(a.reduce(function(s,t){return s+t.v;},0)/a.length).toFixed(1),min:+Math.min.apply(null,a.map(function(t){return t.v;})).toFixed(1),max:+Math.max.apply(null,a.map(function(t){return t.v;})).toFixed(1),lanes:a.map(function(t){return +(t.x).toFixed(1);}).slice(0,8)};});return o;`);
R('District speed profiles: Industrial slowest, Skyline/Orbital fastest', spd.iaa.mean < spd.k9a.mean && spd.iaa.mean < spd.sva.mean, spd);
const errs = b.logs.filter((l) => l.type === 'exception' || l.type === 'error');
R('No page errors during traffic tests', errs.length === 0, errs.slice(0, 5));
mkdirSync(join(ROOT, 'work', 'traffic'), { recursive: true });
writeFileSync(join(ROOT, 'work', 'traffic', 'traffic_results.json'), JSON.stringify({ results, comp, sim: Object.fromEntries(Object.entries(sim).map(([k, v]) => [k, v.map((r) => ({ racers: r.racers, mon: r.mon, wc: r.wc }))])) }, null, 1));
await b.close();
process.exit(results.some((x) => x.status === 'FAIL') ? 1 : 0);
