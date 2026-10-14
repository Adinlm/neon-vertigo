import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {openGame,ROOT} from './harness.mjs';
const dir=join(ROOT,'work/codex-recovery/visual');mkdirSync(dir,{recursive:true});
const b=await openGame({width:960,height:540,out:join(ROOT,'work/nv_visual_test.html')});await b.viewport(960,540,false,1);
await b.ev('settings.qual=2;resize();1');const ids=await b.ev('TRACKS.map(function(t){return t.id;})');const results=[];
for(const id of ids){const rs=await b.run(`loadTrack(trackIdx('${id}'));EV=null;resetRace(false);only(null);setHUD(true);state='paused';return ROUTES.slice(1).map(function(r){return {id:r.id,span:r.span};});`);
for(const r of rs){const frames=[];
for(const [label,u] of [['entry',0.02],['ramp',0.18],['interior',0.5],['merge',0.98]]){const file=join(dir,`${id}_r${r.id}_${label}.png`);const info=await b.run(`var r=ROUTES[${r.id}],p=racers[0];p.s=r.sA+r.span*${u};p.dist=p.s;p.rt=r.id;p.x=0;p.y=0;p.v=0;p.st=RS.ACT;CINE.on=false;CRASH.on=false;cam.init=true;vehPose(p,0);updateCam(0);buildDynamic(0);render();updateHUD(0.1);drawMini();return {s:p.s,rt:p.rt,x:p.x,y:p.y,gl:gl.getError()};`);await b.screenshot(file);frames.push({label,file: file.split('visual').pop().replaceAll('\\','/'),...info});}
const sheet=join(dir,`${id}_r${r.id}_review.png`),args=[];for(const f of frames)args.push('-i',join(dir,`${id}_r${r.id}_${f.label}.png`));
execFileSync('ffmpeg',['-y','-loglevel','error',...args,'-filter_complex','[0:v]scale=480:270[a];[1:v]scale=480:270[b];[2:v]scale=480:270[c];[3:v]scale=480:270[d];[a][b][c][d]xstack=inputs=4:layout=0_0|480_0|0_270|480_270',sheet]);
results.push({name:id+':R'+r.id+' entry/ramp/interior/merge render',status:frames.every(x=>x.gl===0)?'PASS':'FAIL',frames});console.log(results.at(-1).status,id,r.id);
}}
const errors=b.logs.filter(x=>x.type==='error'||x.type==='exception');writeFileSync(join(ROOT,'work/codex-recovery/route-visual.json'),JSON.stringify({results,errors},null,2));await b.close();process.exitCode=errors.length||results.some(x=>x.status==='FAIL')?1:0;
