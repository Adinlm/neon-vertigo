import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openGame, ROOT } from './harness.mjs';
const src = process.argv[2]; const out = process.argv[3] || join(ROOT, 'work', 'baseline.json');
const seeds = (process.env.SEEDS || '1,2,3').split(',').map(Number);
const b = await openGame({ src });
await b.ev(readFileSync(join(ROOT, 'tests', 'simlib.js'), 'utf8'));
const tracks = await b.ev('TRACKS.map(function(t){return t.id;})');
const res = {};
for (const id of tracks) {
  res[id] = [];
  for (const s of seeds) {
    const t0 = Date.now();
    const r = await b.ev(`NVSIM.race(${JSON.stringify(id)},{seed:${s}})`);
    r.wallMs = Date.now() - t0; res[id].push(r);
    console.log(id, 'seed', s, 'L', r.L, 'player', r.racers[0].time, 'place', r.racers[0].place, 'wrecks', r.racers.map(x => x.wrecks).join('/'), 'times', r.racers.map(x => x.time).join('/'), 'nan', r.nan, r.wallMs + 'ms');
  }
}
writeFileSync(out, JSON.stringify(res, null, 1));
console.log('errors', b.logs.filter(l => l.type === 'exception' || l.type === 'error'));
await b.close();
