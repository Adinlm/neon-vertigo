// Analysis-only source view. Embedded media are omitted; never distribute or run the view as the game.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
const src=process.argv[2]||'index.html',out=process.argv[3]||'work/source-view.js';
const h=readFileSync(src,'utf8'),m=/<script\b[^>]*>([\s\S]*?)<\/script>/.exec(h);if(!m)throw Error('script missing');
const start=h.slice(0,m.index+m[0].indexOf(m[1])).split('\n').length;
const js=m[1].replace(/(['"])(?:data:[^,'"\r\n]+;base64,)?[A-Za-z0-9+/=]{500,}\1/g,"'__EMBEDDED_MEDIA_OMITTED__'");
mkdirSync(dirname(out),{recursive:true});writeFileSync(out,'// Analysis only. Original HTML script starts at line '+start+' in '+resolve(src)+'\n'+js);console.log(out,Buffer.byteLength(js),'bytes');
