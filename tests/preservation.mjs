import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const s=readFileSync('index.html','utf8');
const old=execFileSync('git',['show','16a83f7:index.html'],{encoding:'utf8',maxBuffer:64*1024*1024});
const wip=execFileSync('git',['show','0a83587:index.html'],{encoding:'utf8',maxBuffer:64*1024*1024});
const rows=[],hash=b=>createHash('sha256').update(b).digest('hex');
function R(name,ok,info){rows.push({name,status:ok?'PASS':'FAIL',info});console.log(ok?'PASS':'FAIL',name,JSON.stringify(info||''));}
function bank(src,name){const st=src.indexOf('var '+name+'=')+('var '+name+'=').length;if(st<name.length+5)throw Error(name);const end=src.indexOf(';',st);return vm.runInNewContext('('+src.slice(st,end)+')');}
const manifest={};
for(const name of ['STEMB64','VADERSTEMB64','COOPERSTEMB64','CROWNSTEMB64']){
 const a=bank(old,name),b=bank(s,name);manifest[name]={};
 for(const k of Object.keys(a)){const ha=hash(Buffer.from(a[k].d,'base64')),hb=hash(Buffer.from(b[k].d,'base64'));const changed=(name==='STEMB64'||name==='VADERSTEMB64')&&k==='tur';manifest[name][k]={legacy:ha,final:hb,bytes:Buffer.from(b[k].d,'base64').length};R(name+'.'+k+(changed?' intended new turbo':' preserved'),changed?ha!==hb:ha===hb,{legacy:ha,final:hb});}
}
const images=src=>[...src.matchAll(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/g)].map(x=>hash(Buffer.from(x[1],'base64')));
const imgsA=images(old),imgsB=images(s);R('20 WebP images byte-identical to Legacy',imgsB.length===20&&JSON.stringify(imgsA)===JSON.stringify(imgsB),{n:imgsB.length,hashes:imgsB});
const blobs=src=>[...src.matchAll(/(['"])([A-Za-z0-9+/=]{500,})\1/g)].map(x=>hash(Buffer.from(x[2],'base64')));
R('All embedded resource blobs identical to recovered WIP',JSON.stringify(blobs(s))===JSON.stringify(blobs(wip)),{count:blobs(s).length});
function section(src,a,b){const i=src.indexOf(a),j=src.indexOf(b,i);if(i<0||j<i)throw Error(a);return src.slice(i,j);}
R('Engine profiles and engine synthesis preserved',section(s,'var ENGINE_PROFILES=','var AU=')===section(old,'var ENGINE_PROFILES=','var AU='));
R('HTML script parses',(()=>{new vm.Script(s.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]);return true})());
const external=[...s.matchAll(/<(?:script|link|img|audio|video|source)\b[^>]*(?:src|href)\s*=\s*['"]((?:https?:)?\/\/[^'"]+)/gi)].map(x=>x[1]);
R('No external runtime markup assets',external.length===0,external);
writeFileSync('work/codex-recovery/preservation.json',JSON.stringify({results:rows,stems:manifest,images:imgsB,sha256:hash(Buffer.from(s)),bytes:Buffer.byteLength(s)},null,2));
process.exitCode=rows.some(x=>x.status==='FAIL')?1:0;
