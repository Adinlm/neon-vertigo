// Scans every track for conflict-free windows where a route template fits (uses the game's own routeValidate; no world build).
import { writeFileSync } from 'node:fs';
import { openGame } from './harness.mjs';
const b = await openGame({ src: process.argv[2] });
const ids = process.argv[3] ? process.argv[3].split(',') : await b.ev('TRACKS.map(function(t){return t.id;})');
const res = await b.run(`var out={},ids=${JSON.stringify(ids)};
  function T(kind,len,cfg){var hi=kind==='high';return {kind:kind,side:1,hw:hi?9:8,ymin:hi?-5:-4,ymax:hi?7:5,roof:!hi,len:len,
    lat:[[0,'m'],[0.3,'m'],[0.42,0],[0.58,0],[0.7,'m'],[1,'m']],up:hi?[[0,0],[0.04,0],[0.28,cfg.hw>16?31:26],[0.72,cfg.hw>16?31:26],[0.96,0],[1,0]]:[[0,0],[0.04,0],[0.28,-24],[0.72,-24],[0.96,0],[1,0]]};}
  ids.forEach(function(id){var ti=trackIdx(id),cfg=TRACKS[ti];CFG=cfg;TH=cfg.theme;R=mulberry32(cfg.seed);HW=cfg.hw;YMIN=cfg.ymin;YMAX=cfg.ymax;TYMIN=cfg.tun[0];TYMAX=cfg.tun[1];buildTrack();
    var o={L:Math.round(L),HW:HW},save=ROUTEDEFS[id];
    ['high','low'].forEach(function(kind){[-1,1].forEach(function(side){var spans=[600,500,420],ok=[];
      spans.forEach(function(len){for(var a=0.03;a<0.97;a+=0.01){var t=T(kind,len,cfg),f=len/L;t.side=side;t.a=+a.toFixed(3);t.b=+(a+f).toFixed(4);if(t.b>0.985)break;
        ROUTEDEFS[id]=[t];R=mulberry32(cfg.seed);buildRoutes();buildFeatures();if(ROUTES.length<2)continue;var v=routeValidate(ROUTES[1]);if(!v.length)ok.push([+a.toFixed(2),len]);}});
      o[kind+(side>0?'R':'L')]=ok;});});
    ROUTEDEFS[id]=save;out[id]=o;});
  return out;`);
writeFileSync('work/route_windows.json', JSON.stringify(res, null, 1));
for (const [id, o] of Object.entries(res)) {
  const fmt = (arr) => { const by = {}; arr.forEach(([a, len]) => { (by[len] = by[len] || []).push(a); }); return Object.entries(by).map(([len, as]) => len + 'm:' + compress(as)).join(' '); };
  function compress(as) { const r = []; let st = null, pv = null; for (const a of as) { if (st === null) { st = pv = a; continue; } if (Math.abs(a - pv - 0.01) < 1e-6) { pv = a; continue; } r.push(st === pv ? st : st + '-' + pv); st = pv = a; } if (st !== null) r.push(st === pv ? st : st + '-' + pv); return r.join(','); }
  console.log(id, 'L', o.L, '| high R', fmt(o.highR), '| high L', fmt(o.highL), '| low R', fmt(o.lowR), '| low L', fmt(o.lowL));
}
await b.close();
