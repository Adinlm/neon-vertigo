// 3.7 alternative-route tests (behaviour of the real engine, not names): geometry continuity, both paths drivable, laps and
// checkpoints, ranking continuity, collision separation, respawn validity, navigable space, AI usage and route traffic.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openGame, ROOT } from './harness.mjs';
const results = []; const R = (name, pass, info) => { results.push({ name, status: pass ? 'PASS' : 'FAIL', info }); console.log(pass ? 'PASS' : 'FAIL', name, info !== undefined ? JSON.stringify(info).slice(0, 400) : ''); };
const b = await openGame({ src: process.argv[2] || join(ROOT, 'index.html') });
await b.ev(readFileSync(join(ROOT, 'tests', 'simlib.js'), 'utf8'));
const only = process.argv[3] ? process.argv[3].split(',') : null;
const tracks = (await b.ev('TRACKS.map(function(t){return t.id;})')).filter((id) => !only || only.includes(id));
const seeds = (process.env.SEEDS || '1,2,3').split(',').map(Number);
const summary = {};
for (const id of tracks) {
  const info = await b.run(`NVSIM.prepare(${JSON.stringify(id)});return ROUTES.slice(1).map(function(r){var a=[0,0,0],z=[0,0,0];wpv(r.sA,r.ax,0,a);wpv(r.sB,r.bx,0,z);tf(r.sA);var ta=[F.tx,F.ty,F.tz];tf(r.sB);var tb=[F.tx,F.ty,F.tz];
      var d0=Math.hypot(r.P[0]-a[0],r.P[1]-a[1],r.P[2]-a[2]),d1=Math.hypot(r.P[r.n*3]-z[0],r.P[r.n*3+1]-z[1],r.P[r.n*3+2]-z[2]),c0=r.T[0]*ta[0]+r.T[1]*ta[1]+r.T[2]*ta[2],c1=r.T[r.n*3]*tb[0]+r.T[r.n*3+1]*tb[1]+r.T[r.n*3+2]*tb[2];
      return {id:r.id,name:r.def.name,kind:r.kind,a:r.def.a,b:r.def.b,span:Math.round(r.span),Lreal:Math.round(r.Lreal),sep:Math.round(r.sSep-r.sA),join:Math.round(r.sB-r.sJoin),val:routeValidate(r),d0:+d0.toFixed(3),d1:+d1.toFixed(3),c0:+c0.toFixed(4),c1:+c1.toFixed(4),
        kmin:+Math.min.apply(null,r.K).toFixed(3),kmax:+Math.max.apply(null,r.K).toFixed(3),obs:OB.filter(function(o){return o.rt===r.id;}).length,div:OB.filter(function(o){return o.route===r.id;}).length};});`);
  summary[id] = { routes: info };
  if (!info.length) continue;
  for (const r of info) {
    R(`${id} R${r.id} '${r.name}' (${r.kind}): no geometric conflicts`, r.val.length === 0, r.val);
    R(`${id} R${r.id}: route joins the avenue continuously at both ends (position < 0.5 m, tangent > 0.995)`, r.d0 < 0.5 && r.d1 < 0.5 && r.c0 > 0.995 && r.c1 > 0.995, { d0: r.d0, d1: r.d1, c0: r.c0, c1: r.c1 });
    R(`${id} R${r.id}: advance factor stays physical (0.7..1.4)`, r.kmin > 0.7 && r.kmax < 1.4, { kmin: r.kmin, kmax: r.kmax, span: r.span, real: r.Lreal });
  }
  // forced traversals: player AI planning each route and planning the avenue; dist must be continuous and laps exact
  for (const r of info) for (const via of ['route', 'main']) {
    const t = await b.ev(`(function(){var log=[],maxJump=0,maxInv=0,prev=null,okBand=true,p=null;
      var res=NVSIM.race(${JSON.stringify(id)},{seed:7,playerAI:{prec:0.95,risk:0.2,alt:0.2,turbo:0.5,aggr:0,block:0},maxT:400,hooks:[function(tt){if(p!==racers[0]){p=racers[0];p.routeLog=[];}p.planFor=${r.id};p.planLap=p.cp;p.plan=${via === 'route' ? r.id : 0};
        if(prev!==null&&p.st===RS.ACT&&prev.st===RS.ACT){var dd=p.dist-prev.d,dsv=wrapD(p.s-prev.s),inv=Math.abs(dd-dsv);if(inv>maxInv)maxInv=inv;if(dd>maxJump)maxJump=dd;}prev={d:p.dist,s:p.s,st:p.st};
        if(p.st===RS.ACT){tfc(p);if(p.y<F.yMin-0.05||p.y>F.yMax+0.05||Math.abs(p.x)>F.hw+0.05)okBand=false;}}]});
      return {routeLog:p.routeLog,finished:res.racers[0].finished,time:res.racers[0].time,dist:res.racers[0].dist,wrecks:res.racers[0].wrecks,L:Math.round(L),maxJump:+maxJump.toFixed(3),maxInv:+maxInv.toFixed(5),okBand:okBand,nan:res.nan};})()`);
    // The simulator continues the player's celebration drive until all rivals finish; only race-distance events count.
    const raceLog = t.routeLog.filter((x) => +x.split('@')[1] < 3 * t.L);
    const ins = raceLog.filter((x) => x.startsWith('in' + r.id)).length, outs = raceLog.filter((x) => x.startsWith('out' + r.id)).length;
    const inLaps = new Set(raceLog.filter(x => x.startsWith('in'+r.id)).map(x => Math.floor(+x.split('@')[1]/t.L)));
    const outLaps = new Set(raceLog.filter(x => x.startsWith('out'+r.id)).map(x => Math.floor(+x.split('@')[1]/t.L)));
    if (via === 'route') R(`${id} R${r.id}: drivable through the route every lap (enters ${ins}x, exits ${outs}x) and finishes`, t.finished && ins >= 3 && outs >= 3 && inLaps.size === 3 && outLaps.size === 3 && t.nan === 0, t);
    else R(`${id} R${r.id}: drivable on the avenue every lap without entering the route`, t.finished && ins === 0 && t.nan === 0, t);
    R(`${id} R${r.id} via ${via}: progress equals travelled s every frame (no checkpoint skipping), no teleport (<6 m/frame), pilot inside its corridor band`, t.maxInv < 1e-3 && t.maxJump < 6 && t.okBand, { maxInv: t.maxInv, maxStep: t.maxJump, okBand: t.okBand });
  }
  // lap integrity: dist after N laps = N*L exactly when crossing the line (laps counted by distance travelled along corridors)
  const lap = await b.ev(`(function(){var laps=[];var res=NVSIM.race(${JSON.stringify(id)},{seed:11,hooks:[function(){var p=racers[0];if(p.cp%8===0&&p.cp>0&&laps.indexOf(p.cp)<0)laps.push(p.cp);}]});
    return {cps:laps,finished:res.racers.map(function(x){return x.finished;}),times:res.racers.map(function(x){return x.time;})};})()`);
  R(`${id}: laps counted at 8 checkpoints each, everyone finishes`, lap.cps.join(',') === '8,16,24' && lap.finished.every(Boolean), lap);
  // collision separation: two racers overlapping in world space but in different corridors never collide
  if (info.length) {
    const sep = await b.run(`NVSIM.prepare(${JSON.stringify(id)});var r=ROUTES[1],a=racers[0],c=racers[1];state='race';
      var s=r.sA+(r.sSep-r.sA)+r.span*0.15;a.s=wrapS(s);a.rt=r.id;a.x=0;a.y=0;a.v=100;c.s=wrapS(s);c.rt=0;c.x=r.ax;c.y=r.up[Math.round((s-r.sA)/r.ds)];c.v=140;
      var va=a.v,vc=c.v,da=a.dmg,dc=c.dmg;racerCol(a,c);racerCol(c,a);var same=(a.v===va&&c.v===vc&&a.dmg===da&&c.dmg===dc);
      c.rt=r.id;c.x=0.5;c.y=0;c.s=wrapS(s-1);c.v=140;vc=140;a.v=100;va=100;racerCol(a,c);var hit=!(a.v===va&&c.v===vc);return {differentCorridorsNoContact:same,sameCorridorContact:hit};`);
    R(`${id}: pilots in different corridors at the same place never collide; in the same corridor they do`, sep.differentCorridorsNoContact && sep.sameCorridorContact, sep);
    // respawn: wreck in the middle of each route -> reappears on that route, inside its band and not in an obstacle; wreck just after
    // the mouth -> walks back onto the avenue
    for (const r of info) {
      const rs = await b.run(`NVSIM.prepare(${JSON.stringify(id)});var r=ROUTES[${r.id}],c=racers[1],out=[];state='race';
        [[0.5,r.id],[0.02,r.id]].forEach(function(q){c.st=RS.ACT;c.inv=0;c.s=wrapS(r.sA+r.span*q[0]);c.rt=q[1];c.x=0;c.y=0;c.v=100;c.dist=1000;vehPose(c,0);wreckRacer(c,'test');c.st=RS.DEAD;c.stT=9;respawnRacer(c);tfc(c);
          var inObs=OB.some(function(o){var ro=rel(c,o.rt||0,o.s,false);return ro&&obHit(o,c.x-ro[0],c.y-ro[1],c.s,CHX,CHY,CHS,0);});
          out.push({at:q[0],rt:c.rt,x:+c.x.toFixed(2),y:+c.y.toFixed(2),band:[+F.yMin.toFixed(1),+F.yMax.toFixed(1)],hw:F.hw,inBand:c.y>=F.yMin&&c.y<=F.yMax&&Math.abs(c.x)<=F.hw,inObs:inObs,back:+wrapD(c.s-(r.sA+r.span*q[0])).toFixed(1)});});return out;`);
      R(`${id} R${r.id}: respawn after a wreck on the route reappears on a valid corridor (route mid-way stays on it), inside the band and clear of obstacles`,
        rs[0].rt === r.id && rs.every((x) => x.inBand && !x.inObs), rs);
    }
    // navigable space: every 2 m along each route (and the avenue beside its mouth zones) there is a free cross-section
    const nav = await b.run(`NVSIM.prepare(${JSON.stringify(id)});var out=[];ROUTES.slice(1).forEach(function(r){var minFree=1,minS=0,minMain=1,mS=0;
      [[r.id,0,r.span],[0,0,r.span]].forEach(function(z,zi){for(var d=z[1];d<=z[2];d+=2){var s=r.sA+d,E={rt:z[0]};tfr(s,z[0]);var y0=F.yMin+CHY,y1=F.yMax-CHY,hw=F.hw-CHX,free=0,tot=0;
        for(var x=-hw;x<=hw;x+=hw/6)for(var y=y0;y<=y1;y+=(y1-y0)/6){tot++;var blocked=OB.some(function(o){if(o.k==='press'&&zi===1)return false;var ro=rel(E,o.rt||0,o.s,false);return ro&&obHit(o,x-ro[0],y-ro[1],s,CHX,CHY,CHS,0);});if(!blocked)free++;}
        var f=free/tot;if(zi===0&&f<minFree){minFree=f;minS=d;}if(zi===1&&f<minMain){minMain=f;mS=d;}}});
      out.push({route:r.id,minFreeRoute:+minFree.toFixed(2),at:Math.round(minS),minFreeAvenue:+minMain.toFixed(2),atAvenue:Math.round(mS)});});return out;`);
    R(`${id}: no invisible blocking geometry — every 2 m of each route and of the avenue beside it keeps a passable cross-section`, nav.every((n) => n.minFreeRoute >= 0.12 && n.minFreeAvenue >= 0.12), nav);
  }
  // AI usage and fairness across seeds (all racers AI-driven)
  const use = { route: 0, main: 0, wrecks: 0, unfinished: 0, traffic: 0, trafficBad: 0, per: {} };
  for (const sd of seeds) {
    const r = await b.ev(`(function(){var tr=0,bad=0,BD=[];var res=NVSIM.race(${JSON.stringify(id)},{seed:${sd},hooks:[function(){racers.forEach(function(c){if(!c.routeLog)c.routeLog=[];});
        TF.forEach(function(t){if(!t.rt||t.st!==TFS.ACT)return;tr++;tfr(t.s,t.rt);if(t.cy-t.hy<F.yMin-0.05||t.cy+t.hy>F.yMax+0.05||Math.abs(t.x+t.ox)+t.hx>F.hw+0.05){bad++;if(BD.length<5)BD.push('band/wall '+TKIND[t.kind].id+' d='+rtD(ROUTES[t.rt],t.s).toFixed(1)+' x='+(t.x+t.ox).toFixed(2)+' cy='+t.cy.toFixed(2)+' band='+F.yMin.toFixed(2)+'/'+F.yMax.toFixed(2)+' hw='+F.hw);}
          var x=t.x+t.ox;if(OB.some(function(o){var ro=rel(t,o.rt||0,o.s,false);return ro&&o.k!=='mouth'&&Math.abs(wrapD(o.s-t.s))<o.hs+t.hs&&x+t.hx>o.x0+ro[0]&&x-t.hx<o.x1+ro[0]&&t.cy+t.hy>o.y0+ro[1]&&t.cy-t.hy<o.y1+ro[1];})){bad++;if(BD.length<5)BD.push('obstacle '+TKIND[t.kind].id+' d='+rtD(ROUTES[t.rt],t.s).toFixed(1)+' st'+t.st+' x='+x.toFixed(2)+' cy='+t.cy.toFixed(2)+' avoid '+t.avoid+' blk '+t.blocked);}});}]});
      return {L:L,r:res.racers.map(function(x){return {routes:x.routes,f:x.finished,w:x.wrecks};}),tr:tr,bad:bad,bd:BD};})()`);
    r.r.forEach((x) => { info.forEach((ri) => { const n = (x.routes || []).filter((q) => q.split('@')[0] === 'in' + ri.id && +q.split('@')[1] < 3 * r.L).length, k = 'R' + ri.id; use.per[k] = use.per[k] || { route: 0, main: 0 };
      const nIn = Math.min(3, n); use.per[k].route += nIn; use.per[k].main += 3 - nIn; use.route += nIn; use.main += 3 - nIn; }); use.wrecks += x.w; if (!x.f) use.unfinished++; });
    use.traffic += r.tr; use.trafficBad += r.bad; if (r.bd && r.bd.length) use.badDetail = (use.badDetail || []).concat(r.bd).slice(0, 8);
  }
  if (info.length) {
    R(`${id}: AI pilots choose both the route and the avenue at every fork (variety)`, Object.values(use.per).every((q) => q.route > 0 && q.main > 0) && use.unfinished === 0, use);
    R(`${id}: traffic on routes stays in its corridor and never overlaps route obstacles`, use.trafficBad === 0, { trafficSteps: use.traffic, bad: use.trafficBad, detail: use.badDetail });
  }
  summary[id].use = use;
}
const errs = b.logs.filter((l) => l.type === 'exception' || l.type === 'error');
R('No page errors during route tests', errs.length === 0, errs.slice(0, 5));
mkdirSync(join(ROOT, 'work', 'routes'), { recursive: true });
writeFileSync(join(ROOT, 'work', 'routes', 'routes_results.json'), JSON.stringify({ results, summary }, null, 1));
await b.close();
process.exit(results.some((x) => x.status === 'FAIL') ? 1 : 0);
