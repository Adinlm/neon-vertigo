import {resolve} from 'node:path';
import {launch} from './cdp.mjs';
import {pathToFileURL} from 'node:url';
import {writeFileSync} from 'node:fs';
const b=await launch({width:1280,height:720});await b.send('Network.enable');await b.send('Network.setBlockedURLs',{urls:['http://*','https://*']});await b.goto(pathToFileURL(process.argv[2]||resolve('index.html')).href);await b.sleep(1200);
const rows=[];function R(name,pass,info){rows.push({name,status:pass?'PASS':'FAIL',info});console.log(pass?'PASS':'FAIL',name,JSON.stringify(info||''));}
R('Distributable has no test evaluator',await b.eval('typeof window.__NVT==="undefined"'));
R('Offline file language selector',await b.eval("getComputedStyle(document.getElementById('langS')).display!=='none'"));
await b.eval("document.getElementById('bLangEN').click()");await b.sleep(250);await b.eval("document.getElementById('bFree').click()");await b.sleep(250);
const ids=await b.eval("Array.from(document.querySelectorAll('#tracks .tcard')).map(x=>+x.dataset.i)");R('Offline free race respects fresh campaign locks',ids.join(',')==='0,1,2,3,6,9',ids);
await b.eval("document.getElementById('bPlay').click()");await b.sleep(600);await b.eval("document.getElementById('gSel').click()");await b.sleep(1800);
await b.eval("document.getElementById('intro').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:640,clientY:360}))");await b.sleep(8000);
R('Offline raw HTML starts a race through normal UI',await b.eval("getComputedStyle(document.getElementById('hud')).display!=='none'&&getComputedStyle(document.getElementById('intro')).display==='none'"));
await b.screenshot('work/codex-recovery/visual/offline_raw.png');
R('WebGL context stays valid offline',await b.eval("(()=>{let g=document.getElementById('gl').getContext('webgl');return !!g&&!g.isContextLost()&&g.getError()===0;})()"));
const remote=await b.eval("performance.getEntriesByType('resource').filter(x=>/^https?:/.test(x.name)).map(x=>x.name)");R('No HTTP resources with networking blocked',remote.length===0,remote);
const errors=b.logs.filter(x=>x.type==='error'||x.type==='exception');R('No JavaScript errors opening raw file offline',errors.length===0,errors);
writeFileSync('work/codex-recovery/offline.json',JSON.stringify(rows,null,2));await b.close();process.exitCode=rows.some(x=>x.status==='FAIL')?1:0;
