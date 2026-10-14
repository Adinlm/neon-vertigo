// Route balance: time spent between the fork (sA) and the merge (sB) via the route vs via the main corridor, from AI races.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openGame, ROOT } from './harness.mjs';
const ids = (process.argv[3] || 'k9').split(','), seeds = (process.env.SEEDS || '1,2,3,4,5,6').split(',').map(Number);
const b = await openGame({ src: process.argv[2] || join(ROOT, 'index.html') });
await b.ev(readFileSync(join(ROOT, 'tests', 'simlib.js'), 'utf8'));
const all = {};
for (const id of ids) {
  const acc = {};
  for (const sd of seeds) {
    const r = await b.ev(`(function(){var segs=[],st={};var res=NVSIM.race('${id}',{seed:${sd},hooks:[function(t){racers.forEach(function(c,i){
        for(var k=1;k<ROUTES.length;k++){var R2=ROUTES[k],d=rtD(R2,c.s),key=i+':'+k,o=st[key];
          if(c.st!==RS.ACT&&c.st!==RS.RESP){if(o)o.bad=1;continue;}
          if(d>=0&&d<6&&(!o||o.done)){st[key]={t0:t,rt:c.rt,v0:c.v,bad:0,done:false};}
          else if(o&&!o.done&&d>R2.span){o.done=true;if(!o.bad&&t-o.t0<60)segs.push({route:k,via:o.rt?'route':'main',dt:+(t-o.t0).toFixed(3),v0:+o.v0.toFixed(1),drv:c.drv.id});}}});}]});
      return {segs:segs,wo:STATS.wo};})()`);
    for (const s of r.segs) { const k = s.route + ':' + s.via; (acc[k] = acc[k] || []).push(s.dt); }
  }
  const sum = {};
  for (const [k, v] of Object.entries(acc)) { v.sort((a, b) => a - b); sum[k] = { n: v.length, mean: +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(2), median: v[Math.floor(v.length / 2)], p25: v[Math.floor(v.length * 0.25)], p75: v[Math.floor(v.length * 0.75)] }; }
  all[id] = sum; console.log(id, JSON.stringify(sum));
}
writeFileSync(join(ROOT, 'work', 'route_balance.json'), JSON.stringify(all, null, 1));
await b.close();
