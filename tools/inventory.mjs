import {writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {openGame,ROOT} from '../tests/harness.mjs';
mkdirSync(join(ROOT,'work/codex-recovery'),{recursive:true});
const b=await openGame({out:join(ROOT,'work/nv_inventory_test.html')});
const q=await b.ev('({tracks:TRACKS,ships:SHIPS,quality:QL,constants:{baseVMAX:125,baseVBOOST:168,CHX:CHX,CHY:CHY,CHS:CHS},hud:HUDCFG,events:EVENTS})');
writeFileSync(join(ROOT,'work/codex-recovery/config-final.json'),JSON.stringify(q,null,2));await b.close();
