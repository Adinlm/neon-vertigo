// Top-down engineering maps of every track (s fractions, tunnels, obstacles, altitude, routes when present) -> PNG
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openGame, ROOT } from './harness.mjs';
const OUT = join(ROOT, 'work', 'maps'); mkdirSync(OUT, { recursive: true });
const b = await openGame({ src: process.argv[2] });
const only = process.argv[3] ? process.argv[3].split(',') : null;
const ids = only || await b.ev('TRACKS.map(function(t){return t.id;})');
for (const id of ids) {
  const png = await b.run(`var ti=trackIdx(${JSON.stringify(id)});if(curTrack!==ti)loadTrack(ti);var S=1100,c=document.createElement('canvas');c.width=S;c.height=S;var x=c.getContext('2d');
    var mnx=1e9,mxx=-1e9,mnz=1e9,mxz=-1e9,i,R2=(typeof ROUTES!=='undefined'?ROUTES:[]);function acc(px,pz){mnx=Math.min(mnx,px);mxx=Math.max(mxx,px);mnz=Math.min(mnz,pz);mxz=Math.max(mxz,pz);}
    for(i=0;i<N;i++)acc(TP[i*3],TP[i*3+2]);R2.forEach(function(r){if(!r)return;for(var j=0;j<=r.n;j++)acc(r.P[j*3],r.P[j*3+2]);});
    var sc=(S-140)/Math.max(mxx-mnx,mxz-mnz),ox=70-mnx*sc,oz=70-mnz*sc;function X(px){return ox+px*sc;}function Z(pz){return oz+pz*sc;}
    x.fillStyle='#0b0b14';x.fillRect(0,0,S,S);x.font='13px monospace';
    // corridor width band + centre line coloured by altitude
    var ymin=1e9,ymax=-1e9;for(i=0;i<N;i++){ymin=Math.min(ymin,TP[i*3+1]);ymax=Math.max(ymax,TP[i*3+1]);}
    x.lineCap='round';for(i=0;i<N;i+=2){var j=(i+2)%N,k=(TP[i*3+1]-ymin)/Math.max(1,ymax-ymin);x.strokeStyle='rgba(255,255,255,0.08)';x.lineWidth=HW*2*sc;x.beginPath();x.moveTo(X(TP[i*3]),Z(TP[i*3+2]));x.lineTo(X(TP[j*3]),Z(TP[j*3+2]));x.stroke();
      x.strokeStyle='hsl('+Math.round(220-200*k)+',90%,60%)';x.lineWidth=2;x.beginPath();x.moveTo(X(TP[i*3]),Z(TP[i*3+2]));x.lineTo(X(TP[j*3]),Z(TP[j*3+2]));x.stroke();}
    TUN.forEach(function(t){x.strokeStyle='#ff2bd6';x.lineWidth=6;x.beginPath();for(var s=t.s0;s<=t.s1;s+=6){tf(s);if(s===t.s0)x.moveTo(X(F.px),Z(F.pz));else x.lineTo(X(F.px),Z(F.pz));}x.stroke();});
    OB.forEach(function(o){if(o.k==='mouth')return;tf(o.s);x.fillStyle={bridge:'#ffaa00',box:'#00e5ff',pylon:'#ff3030',pipe:'#ff8800',narrow:'#aa66ff',tower:'#ffd36b',press:'#ff00ff',div:'#ffffff'}[o.k]||'#ccc';x.fillRect(X(F.px)-3,Z(F.pz)-3,6,6);});
    PADS.forEach(function(p){tf(p.s);x.strokeStyle='#ffb000';x.lineWidth=1.5;x.beginPath();x.arc(X(F.px),Z(F.pz),5,0,6.3);x.stroke();});
    R2.forEach(function(r){if(!r)return;x.strokeStyle=r.def.col||'#39ff88';x.lineWidth=Math.max(2,r.hw*2*sc);x.globalAlpha=0.35;x.beginPath();for(var j=0;j<=r.n;j++){if(j)x.lineTo(X(r.P[j*3]),Z(r.P[j*3+2]));else x.moveTo(X(r.P[j*3]),Z(r.P[j*3+2]));}x.stroke();x.globalAlpha=1;x.lineWidth=2;x.stroke();
      x.fillStyle=r.def.col||'#39ff88';x.fillText('R'+r.id+' '+r.def.kind+' '+Math.round(r.span)+'m->'+Math.round(r.Lreal)+'m',X(r.P[Math.floor(r.n/2)*3])+8,Z(r.P[Math.floor(r.n/2)*3+2]));});
    // s-fraction ticks every 0.05 L
    for(var f=0;f<1;f+=0.05){tf(f*L);x.fillStyle=f===0?'#fff':'#9fe9ff';x.beginPath();x.arc(X(F.px),Z(F.pz),f===0?7:3.5,0,6.3);x.fill();x.fillText(f.toFixed(2),X(F.px)+F.rx*26*sc/sc*1+6,Z(F.pz)+F.rz*26+4);}
    tf(0);x.strokeStyle='#fff';x.beginPath();x.moveTo(X(F.px),Z(F.pz));x.lineTo(X(F.px+F.tx*120),Z(F.pz+F.tz*120));x.stroke();
    x.fillStyle='#fff';x.font='bold 18px monospace';x.fillText(CFG.id+' · '+CFG.name+' · L='+Math.round(L)+' m · HW='+HW+' · alt '+Math.round(ymin)+'..'+Math.round(ymax),16,26);
    x.font='13px monospace';x.fillText('magenta: túneles · naranja: puentes/tuberías · cian: cajas · rojo: pilones · violeta: estrechamientos · dorado: torres · anillos: turbo',16,S-14);
    return c.toDataURL('image/png').split(',')[1];`);
  writeFileSync(join(OUT, `map_${id}.png`), Buffer.from(png, 'base64')); console.log('map', id);
}
await b.close();
