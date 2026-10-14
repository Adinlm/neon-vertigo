import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {openGame,ROOT} from './harness.mjs';
const out=join(ROOT,'work/codex-recovery');mkdirSync(join(out,'visual'),{recursive:true});
const b=await openGame({src:process.argv[2]||join(ROOT,'index.html'),lang:null});
const results=[],R=(name,pass,info)=>{results.push({name,status:pass?'PASS':'FAIL',info});console.log(pass?'PASS':'FAIL',name,JSON.stringify(info||''));};
R('Language gate visible on real browser boot',await b.eval("getComputedStyle(document.getElementById('langS')).display!=='none'"));
await b.eval("document.getElementById('bLangEN').click()");
R('English gate opens title',await b.ev("I18N.lang==='en'&&!I18N.gate&&state==='title'"));
await b.ev(readFileSync(join(ROOT,'tests/simlib.js'),'utf8'));
const inventory=await b.ev(`({tracks:TRACKS.map(function(t){return {id:t.id,name:t.name,seed:t.seed,hw:t.hw,ymin:t.ymin,ymax:t.ymax,traffic:t.traffic,district:t.art&&t.art.d};}),ships:SHIPS,routeDefs:ROUTEDEFS,traffic:TKIND,profiles:DTRAF,hud:HUDCFG,stem:[STEM.CFG,STEM.VCFG,STEM.CCFG,STEM.RCFG],events:EVENTS,saveKeys:[CAREER_KEY,SETTINGS_KEY,'nv3_lang','nv3_best_<track>_<difficulty>']})`);
const geometry={};
for(const t of inventory.tracks){
 const q=await b.run(`NVSIM.seedRandom(7);NVSIM.prepare('${t.id}');var p=racers[0];only(null);setHUD(true);state='race';p.v=0;cam.init=false;vehPose(p,0);tick(0,false);return {L:L,routes:ROUTES.slice(1).map(function(r){return {id:r.id,name:r.def.name,span:r.span,real:r.Lreal,entry:r.sA,exit:r.sB,sSep:r.sSep,sJoin:r.sJoin,geometry:routeValidate(r)};}),gl:gl.getError(),verts:CHL.reduce(function(n,c){return n+c.n;},0),glow:GCHL.reduce(function(n,c){return n+c.n;},0),traffic:TF.length};`);
 geometry[t.id]=q;R(t.id+' renders main corridor',q.gl===0,{verts:q.verts,traffic:q.traffic});
 await b.screenshot(join(out,'visual',t.id+'_main.png'));
 for(const r of q.routes){const gl=await b.run(`var p=racers[0],r=ROUTES[${r.id}];p.s=r.sA+r.span*0.5;p.rt=r.id;p.x=0;p.y=0;p.v=0;cam.init=false;vehPose(p,0);tick(0,false);return gl.getError();`);R(t.id+' R'+r.id+' renders route',gl===0);await b.screenshot(join(out,'visual',t.id+'_r'+r.id+'.png'));}
}
const viewports=[];
for(const [name,w,h,mobile] of [['desktop',1280,720,false],['phone',844,390,true],['folded',904,412,true],['unfolded',1080,884,true],['extreme',1600,500,false]]){
 await b.viewport(w,h,mobile,1);await b.run(`NVSIM.prepare('k9');only(null);setHUD(true);state='race';demo=false;resize();tick(0,false);HUDL.req();return 1;`);await b.sleep(150);
 const q=await b.run(`return {width:innerWidth,height:innerHeight,canvas:[cv.width,cv.height],controlRects:CTL.btn.map(function(b){return {k:b.k,x:b.x,y:b.y,r:b.r};}), hud:$('hud').getBoundingClientRect().toJSON(),hudVisible:getComputedStyle($('hud')).display!=='none',gl:gl.getError()};`);
 R(name+' HUD renders',q.hudVisible&&q.gl===0,q);viewports.push({name,...q});await b.screenshot(join(out,'visual','viewport_'+name+'.png'));
}
await b.viewport(844,390,true,1);await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
await b.run(`NVSIM.prepare('k9');only(null);setHUD(true);state='race';demo=false;settings.autoAcc=false;syncAutoControls();resize();return 1;`);await b.sleep(100);
for(const key of ['thr','brk','tur']){const pos=await b.run(`var p=CTL.btn.find(function(x){return x.k==='${key}';});return {x:p.x,y:p.y};`);await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...pos,id:1}]});const q=await b.ev(`TCH.${key}`);R('Emulated touch '+key,q===true);await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:110,y:290,id:1}]});await b.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:155,y:250,id:1}]});R('Emulated touch joystick',await b.ev('JS.raw[0]>0&&JS.raw[1]>0'));await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});R('Touch release clears controls',await b.ev('JS.id===null&&!TCH.thr&&!TCH.brk&&!TCH.tur'));
await b.send('Emulation.setTouchEmulationEnabled',{enabled:false});
await b.viewport(1280,720,false,1);
await b.run(`NVSIM.prepare('k9');only(null);setHUD(true);state='race';demo=false;settings.autoAcc=false;return 1;`);
for(const [code,field] of [['KeyD','steer'],['KeyW','climb'],['KeyK','thr'],['KeyJ','brk']]){
 await b.send('Input.dispatchKeyEvent',{type:'keyDown',code,key:code.slice(3)});const q=await b.run(`readInput(1/60);return IN.${field};`);R('Keyboard '+code+' reaches '+field,typeof q==='number'?q!==0:q===true,q);await b.send('Input.dispatchKeyEvent',{type:'keyUp',code,key:code.slice(3)});
}
await b.send('Input.dispatchKeyEvent',{type:'keyDown',code:'KeyP',key:'p'});R('Keyboard pause',await b.ev("state==='paused'"));await b.send('Input.dispatchKeyEvent',{type:'keyUp',code:'KeyP',key:'p'});await b.send('Input.dispatchKeyEvent',{type:'keyDown',code:'KeyP',key:'p'});R('Keyboard resume',await b.ev("state==='race'"));await b.send('Input.dispatchKeyEvent',{type:'keyUp',code:'KeyP',key:'p'});
R('Automatic acceleration',await b.run(`settings.autoAcc=true;readInput(1/60);return IN.thr;`));
await b.run(`career.conq={k9:true,ia:true,sv:true};career.finalDone=true;career.unlocks.projectZeroUnlocked=true;return 1;`);
for(const ship of inventory.ships){const q=await b.run(`var selected=FLEET.select('${ship.id}');NVSIM.prepare('k9');only(null);setHUD(true);state='race';cam.init=false;tick(0,false);return {selected:selected,ship:racers[0].ship,mesh:racers[0].mesh,gl:gl.getError()};`);R('Ship '+ship.id+' renders',q.selected&&q.ship===ship.id&&q.gl===0,q);await b.screenshot(join(out,'visual','ship_'+ship.id+'.png'));}
const errs=b.logs.filter(x=>x.type==='exception'||x.type==='error');R('No JavaScript errors in real-browser integration',errs.length===0,errs);
writeFileSync(join(out,'integration.json'),JSON.stringify({results,inventory,geometry,viewports,browser:await b.send('Browser.getVersion')},null,2));
await b.close();process.exitCode=results.some(x=>x.status==='FAIL')?1:0;
