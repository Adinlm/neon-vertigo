import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {openGame,ROOT} from './harness.mjs';
const b=await openGame();await b.ev(readFileSync(join(ROOT,'tests/simlib.js'),'utf8'));
const results=[],R=(name,pass,info)=>{results.push({name,status:pass?'PASS':'FAIL',info});console.log(pass?'PASS':'FAIL',name,JSON.stringify(info||''));};
const initial=await b.run(`return TRACKS.map(function(track){NVSIM.prepare(track.id,1,null,7);return {id:track.id,bad:TF.filter(function(t){return !trafficPlaceOk(t);}).length};});`);R('Initial traffic placements valid on all 13 circuits',initial.every(x=>x.bad===0),initial);
const race=await b.run(`var a=NVSIM.race('k9',{seed:42});settings.qual=0;var b=NVSIM.race('k9',{seed:42});return {same:JSON.stringify(a)===JSON.stringify(b),a:a.racers,b:b.racers};`);R('Same seed repeats identical race after host-quality variation',race.same,race);
let q=await b.run(`NVSIM.prepare('k9',1,null,7);var old=OB,rr=Math.random,c=racers[0],t=newTraffic(4,1);Math.random=function(){return 0;};racers.forEach(function(r){r.s=0;});t.st=TFS.DEAD;respawnTraffic(t);Math.random=rr;OB=old;return {state:t.st,dead:TFS.DEAD};`);R('Failed traffic spawn search remains hidden and retries',q.state===q.dead,q);
q=await b.run(`NVSIM.prepare('k9',1,null,7);var old=OB,c=racers[0];c.st=RS.DEAD;c.sW=1000;c.dW=1000;c.rtW=0;OB=[{s:950,hs:300,x0:-100,x1:100,y0:-100,y1:100,k:'box',ax:'any'}];respawnRacer(c);OB=old;return {state:c.st,dead:RS.DEAD};`);R('Pilot respawn never falls back to an occupied centre',q.state===q.dead,q);
for(const mode of ['forward','vertical']){
q=await b.run(`NVSIM.prepare('k9',1,null,7);var old=OB,t=newTraffic(4,1);t.s=1000;t.x=0;t.cy=${mode==='forward'?0:6};t.y=t.cy;t.vk=1;var p={s:t.s,x:0,cy:t.cy,rt:0};OB=[{s:${mode==='forward'?1008:1000},hs:1,x0:-2,x1:2,y0:${mode==='forward'?-2:1},y1:${mode==='forward'?2:3},k:'box',rt:0}];${mode==='forward'?'t.s=1010;':'t.cy=0;'}trafficSweep(t,p);var o=OB[0],hit=Math.abs(wrapD(o.s-t.s))<o.hs+t.hs&&t.x+t.hx>o.x0&&t.x-t.hx<o.x1&&t.cy+t.hy>o.y0&&t.cy-t.hy<o.y1;OB=old;return {hit:hit,s:t.s,cy:t.cy,contacts:t.solidContacts,vk:t.vk};`);R('Solid '+mode+' contact stops penetration',!q.hit&&q.contacts>0,q);
}
q=await b.run(`NVSIM.prepare('k9',1,null,7);var t=newTraffic(4,1),u=TUN[0];t.s=(u.s0+u.s1)/2;tfr(t.s,0);t.y=F.yMax+t.hy+1;t.x=0;return !trafficPlaceOk(t);`);R('Tunnel band is part of spawn validation',q===true);
R('No errors in safety regressions',!b.logs.some(x=>x.type==='exception'||x.type==='error'),b.logs.filter(x=>x.type==='exception'||x.type==='error'));
writeFileSync(join(ROOT,'work/codex-recovery/safety.json'),JSON.stringify(results,null,2));await b.close();process.exitCode=results.some(x=>x.status==='FAIL')?1:0;
