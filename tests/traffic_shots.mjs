// Visual check of the district traffic: one real WebGL frame per vehicle type, camera placed beside the vehicle in its district.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { openGame, ROOT } from './harness.mjs';
const OUT = join(ROOT, 'work', 'shots', 'traffic'); mkdirSync(OUT, { recursive: true });
const b = await openGame({ src: process.argv[2], width: 960, height: 540 });
await b.ev("settings.qual=2;resize();1");
const plan = { k9a: [4, 5, 6, 7, 8], iaa: [9, 10, 11, 12, 13], sva: [14, 15, 16, 17, 18], orb: [19, 20, 21, 22, 23] };
const files = [];
for (const ISO of [0, 1]) for (const [track, kinds] of Object.entries(plan)) {
  for (const k of kinds) {
    const info = await b.run(`var ti=trackIdx(${JSON.stringify(track)});if(curTrack!==ti)loadTrack(ti);EV=null;resetRace(true);demo=false;state='paused';setHUD(false);only(null);
      var t=null;for(var i=0;i<TF.length;i++)if(TF[i].kind===${k}&&TF[i].dir>0){t=TF[i];break;}
      if(!t){t=TF[0];var K=TKIND[${k}];t.kind=${k};t.hx=K.hx;t.hy=K.hy;t.hs=K.hs;t.tint=K.tint[0];t.dir=1;}
      t.st=TFS.ACT;var s0=L*0.33;for(var g=0;g<60&&(inTunnel(s0,60)||OB.some(function(o){return Math.abs(wrapD(o.s-s0))<40;}));g++)s0+=37;t.s=wrapS(s0);tf(t.s);t.x=-HW*0.25;t.cy=t.y=YMIN+4;for(i=0;i<TF.length;i++)if(TF[i]!==t)TF[i].s=wrapS(t.s+400+i*30);
      racers.forEach(function(c,j){c.s=wrapS(t.s+300+j*20);});for(i=0;i<racers.length;i++)vehPose(racers[i],0);for(i=0;i<TF.length;i++)trafficMatrix(TF[i],i);
      DBG.chunks=!${ISO};DBG.glow=!${ISO};var M=t.M,P=[M[12],M[13],M[14]],f=[M[8],M[9],M[10]],r=[M[0],M[1],M[2]],d=t.hs*1.25+2.2;
      cam.eye=[P[0]-f[0]*d+r[0]*(t.hx*1.6+2.2),P[1]+0.9+t.hy*0.9,P[2]-f[2]*d+r[2]*(t.hx*1.6+2.2)];cam.look=[P[0],P[1],P[2]];cam.up=[0,1,0];cam.vel=[0,0,0];
      return {id:TKIND[${k}].id,kind:t.kind,track:CFG.id};`);
    await b.sleep(250);
    const f = join(OUT, `${ISO ? 'iso' : 'ctx'}_${track}_${String(k).padStart(2, '0')}_${info.id}.png`); await b.screenshot(f); files.push(f);
    console.log('shot', info.id, track);
  }
}
await b.close();
// contact sheet per district (ffmpeg xstack 3x2)
for (const ISO of ['ctx', 'iso']) for (const track of Object.keys(plan)) {
  const fs = files.filter((f) => f.includes(`${ISO}_${track}_`));
  const args = []; fs.forEach((f) => args.push('-i', f));
  const layout = ['0_0', 'w0_0', 'w0+w1_0', '0_h0', 'w0_h0'].slice(0, fs.length).join('|');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args, '-filter_complex', `${fs.map((_, i) => `[${i}:v]scale=480:270[v${i}]`).join(';')};${fs.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${fs.length}:layout=${layout}:fill=black`, join(OUT, `sheet_${ISO}_${track}.png`)]);
}
console.log('sheets written to', OUT);
