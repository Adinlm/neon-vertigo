// Records every building generated for each track (addBuilding calls: position, footprint, height) -> hash.
// Comparing 3.6.3 and 3.7 proves that the city of every district is unchanged by the routes and the traffic work.
import { createHash } from 'node:crypto';
import { openGame } from './harness.mjs';
const b = await openGame({ src: process.argv[2] });
await b.ev(`window.__BLD=[];var __ab=addBuilding;addBuilding=function(cx,cz,hw,hd,dx,dz,y1,mat,y0){__BLD.push([cx.toFixed(2),cz.toFixed(2),hw.toFixed(2),hd.toFixed(2),(+y1).toFixed(2),mat,(y0||0)]);return __ab.apply(this,arguments);};1`);
const ids = await b.ev('TRACKS.map(function(t){return t.id;})');
const out = {};
for (const id of ids) {
  const list = await b.run(`__BLD.length=0;loadTrack(trackIdx(${JSON.stringify(id)}));EV=null;resetRace(true);return __BLD.map(function(x){return x.join(',');}).join(';');`);
  out[id] = { n: list ? list.split(';').length : 0, sha: createHash('sha256').update(list).digest('hex').slice(0, 16) };
}
console.log(JSON.stringify(out));
await b.close();
