import {execFileSync} from 'node:child_process';
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const expected='f194b6d190406574869caf5dcd358804205a25914bcaa7ecbf3c27e17b9c928a',file='work/index_363.html';
const hash=b=>createHash('sha256').update(b).digest('hex');
if(existsSync(file)){if(hash(readFileSync(file))!==expected)throw Error('Existing Legacy file differs; preserve and inspect it before replacement');}
else {const b=execFileSync('git',['show','16a83f7:index.html'],{maxBuffer:64*1024*1024});if(hash(b)!==expected)throw Error('Unexpected Legacy blob');mkdirSync('work',{recursive:true});writeFileSync(file,b);}
console.log(file,expected);
