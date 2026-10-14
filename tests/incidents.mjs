import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {openGame,ROOT} from './harness.mjs';
const b=await openGame({src:process.argv[2]||join(ROOT,'index.html')});
await b.ev(readFileSync(join(ROOT,'tests/simlib.js'),'utf8'));
const fixtures=JSON.parse(readFileSync(join(ROOT,'tests/fixtures/traffic-incidents.json'),'utf8'));
const results=[];
for(const f of fixtures){const q=await b.run(`NVSIM.prepare('${f.track}');var q=${JSON.stringify(f.start)},K=TKIND.findIndex(function(k){return k.id===q.kind;}),t=newTraffic(K,q.dir);Object.assign(t,q);t.kind=K;t.x=q.x;t.y=q.y;t.cy=q.y;t.ox=0;t.avT=0;TF=[t];racers.forEach(function(r){r.st=RS.DEAD;});var s=t.s,bad=0,maxBlock=0,bt=0;
 for(var n=0;n<900;n++){trafficUpdate(t,1/60);if(t.blocked){bt+=1/60;maxBlock=Math.max(maxBlock,bt);}else bt=0;OB.forEach(function(o){if(o.k==='mouth')return;var ro=rel(t,o.rt||0,o.s,o.k==='div');if(!ro)return;var x=t.x+t.ox;if(o.k==='div'){var R=ROUTES[o.route],d=rtD(R,t.s),m=CHS+0.6;if((d<m+t.hs+1||d>R.span-m-t.hs-1)&&(R.side>0?x-t.hx>=R.xs:x+t.hx<=R.xs))return;}if(Math.abs(wrapD(o.s-t.s))<o.hs+t.hs&&x+t.hx>o.x0+ro[0]&&x-t.hx<o.x1+ro[0]&&t.cy+t.hy>o.y0+ro[1]&&t.cy-t.hy<o.y1+ro[1])bad++;});}
 return {overlaps:bad,advance:wrapD(t.s-s)*t.dir,blocked:t.blocked,vk:t.vk,maxBlockedSeconds:maxBlock,contacts:t.solidContacts||0};`);
const pass=q.overlaps===0&&q.advance>80&&!q.blocked&&q.vk>0.8;results.push({name:f.track+' '+f.name,status:pass?'PASS':'FAIL',fixture:f,info:q});console.log(pass?'PASS':'FAIL',f.track,f.name,q);
}
writeFileSync(process.argv[3]||join(ROOT,'work/codex-recovery/incidents-final.json'),JSON.stringify(results,null,2));await b.close();process.exitCode=results.some(x=>x.status==='FAIL')?1:0;
