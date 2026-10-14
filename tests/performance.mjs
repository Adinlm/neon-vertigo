import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {openGame,ROOT} from './harness.mjs';
const results={method:'180 requestAnimationFrame intervals and lastFrameMs samples after 60 warmup frames; fixed high quality, DPR 1, Edge SwiftShader. JS heap is not whole-process RAM. Sequential runs on the same host; no physical GPU/device claim.',runs:[]};
for(const [version,src] of [['legacy',join(ROOT,'work/index_363.html')],['experimental',join(ROOT,'index.html')]]){
const b=await openGame({src});await b.viewport(1280,720,false,1);await b.ev(readFileSync(join(ROOT,'tests/simlib.js'),'utf8'));
for(const track of ['k9','iab','orb']){
 await b.run(`NVSIM.seedRandom(7);NVSIM.prepare('${track}',1,null,7);only(null);setHUD(true);settings.qual=2;resize();state='race';demo=false;readInput=function(dt){var p=racers[0];p.ai={prec:0.8,risk:0.35,alt:0.4,turbo:0.6,aggr:0,block:0};aiDrive(p,dt);IN.steer=p.inS;IN.climb=p.inC;IN.thr=p.inT;IN.brk=p.inB;if(p.inTurbo)IN.turEdge=true;};return 1;`);
 const sample=await b.runAsync(`return await new Promise(function(resolve){var d=[],cpu=[],dc=[],last=performance.now(),i=0;function f(t){if(i++>=60){d.push(t-last);cpu.push(lastFrameMs);dc.push(STATS.dc);}last=t;if(d.length<180)requestAnimationFrame(f);else{function sum(a){a.sort(function(a,b){return a-b;});return {n:a.length,mean:a.reduce(function(s,v){return s+v;},0)/a.length,median:a[Math.floor(a.length/2)],p95:a[Math.floor(a.length*0.95)],max:a[a.length-1]};}resolve({rafMs:sum(d),tickMs:sum(cpu),drawCalls:sum(dc),trackedGPUBytes:GPU.bytes,traffic:TF.length,quality:settings.qual,canvas:[cv.width,cv.height],renderer:gl.getParameter(gl.RENDERER)});}}requestAnimationFrame(f);});`);
 const heap=await b.send('Runtime.getHeapUsage');const q={version,track,...sample,heap};results.runs.push(q);console.log(JSON.stringify(q));
}
await b.close();}
writeFileSync(join(ROOT,'work/codex-recovery/performance.json'),JSON.stringify(results,null,2));
