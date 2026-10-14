import { openGame } from './harness.mjs';
const b = await openGame({ src: process.argv[2] });
console.log('boot ms', b.bootMs);
console.log(JSON.stringify(await b.run(`return {state:state,track:CFG.id,N:N,L:Math.round(L),gl:!!gl,au:AU.stats(),err:errShown,tracks:TRACKS.length,ships:SHIPS.length};`)));
await b.sleep(4000);
console.log(JSON.stringify(await b.run(`return {au:AU.stats(),sfx:AU.sfxStat,mu:MU.stats().song,apex:MENU_APEX.stats(),fps:fpsShow};`)));
console.log(b.logs.slice(0, 20));
await b.close();
