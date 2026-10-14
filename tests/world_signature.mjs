// Signature of the generated world per track (static chunk vertex counts, glow counts, obstacles): detects any change in the
// procedural city. Used to prove that tracks keep their 3.6.3 buildings (or to list exactly what a route adds).
import { openGame } from './harness.mjs';
const b = await openGame({ src: process.argv[2] });
const ids = await b.ev('TRACKS.map(function(t){return t.id;})');
const out = {};
for (const id of ids) out[id] = await b.run(`var ti=trackIdx(${JSON.stringify(id)});loadTrack(ti);var v=0,g=0;CHL.forEach(function(c){v+=c.n;});GCHL.forEach(function(c){g+=c.n;});
  return {chunks:CHL.length,verts:v,glow:g,ob:OB.filter(function(o){return !o.rt&&o.k!=='div';}).length,obAll:OB.length,routes:(typeof ROUTES!=='undefined'?ROUTES.length-1:0),pads:PADS.length,amb:AMB.length,emit:EMIT.length};`);
console.log(JSON.stringify(out));
await b.close();
