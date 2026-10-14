// Real-render sequence through a route (player auto-driven with plan = route, or plan = main), screenshots at fixed points.
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openGame, ROOT } from './harness.mjs';
const id = process.argv[3] || 'k9', ri = +(process.argv[4] || 1), via = process.argv[5] || 'route';
const OUT = join(ROOT, 'work', 'shots', 'routes'); mkdirSync(OUT, { recursive: true });
const b = await openGame({ src: process.argv[2] || join(ROOT, 'index.html'), width: 1280, height: 720 });
await b.ev(readFileSync(join(ROOT, 'tests', 'simlib.js'), 'utf8'));
await b.ev(`settings.qual=2;resize();career.fleet.chosen=true;1`);
await b.run(`NVSIM.prepare(${JSON.stringify(id)});var r=ROUTES[${ri}],p=racers[0];setHUD(true);only(null);state='race';
  racers.forEach(function(c,i){c.s=wrapS(r.sA-260-i*40);c.dist=c.s;c.x=i?-8:r.ax;c.y=0;c.v=110;});cam.init=true;
  window.__ri=${ri};window.__via=${JSON.stringify(via)};
  readInput=function(dt){var p=racers[0];if(p.st===RS.ACT||p.st===RS.RESP){p.ai={prec:0.9,risk:0.3,alt:0.2,turbo:0,aggr:0,block:0};p.planFor=__ri;p.planLap=p.cp;p.plan=__via==='route'?__ri:0;aiDrive(p,dt);IN.steer=p.inS;IN.climb=p.inC;IN.thr=true;IN.brk=false;}};return 1;`);
const marks = await b.run(`var r=ROUTES[${ri}];return [r.sA-120,r.sA-30,r.sA+25,r.sA+(r.sSep-r.sA)*0.7,r.sA+r.span*0.38,r.sA+r.span*0.55,r.sJoin+(r.sB-r.sJoin)*0.4,r.sB+40].map(function(x){return wrapS(x);});`);
const names = ['approach', 'sign', 'mouth', 'ramp', 'deck', 'deck2', 'descent', 'merge'];
let k = 0;
for (let f = 0; f < 60 * 40 && k < marks.length; f++) {
  const st = await b.run(`for(var q=0;q<3;q++)tick(1/60,true);tick(1/60,false);var p=racers[0];return {s:p.s,rt:p.rt,x:p.x,y:p.y,st:p.st};`);
  const target = marks[k];
  const d = ((st.s - target) % 1e6);
  if (d >= 0 && d < 30 || (k === marks.length - 1 && d >= 0 && d < 60)) {
    await b.sleep(60); const f2 = join(OUT, `${id}_r${ri}_${via}_${String(k).padStart(2, '0')}_${names[k]}.png`); await b.screenshot(f2);
    console.log('shot', names[k], JSON.stringify(st)); k++;
  }
}
console.log('errors', b.logs.filter(l => l.type === 'exception' || l.type === 'error').slice(0, 3));
await b.close();
