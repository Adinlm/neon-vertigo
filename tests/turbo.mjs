// 3.7 turbo music tests. Renders the game's real stem player (stemOffline: same code path as the race, OfflineAudioContext)
// for 3.6.3 and 3.7 with identical lap/turbo event lists, then compares the PCM sample by sample in Python (tools/turbo_verify.py).
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { openGame, ROOT } from './harness.mjs';
const OUT = join(ROOT, 'work', 'turbo', 'renders'); mkdirSync(OUT, { recursive: true });
const OLD = process.argv[2] || join(ROOT, 'work', 'index_363.html'), NEW = process.argv[3] || join(ROOT, 'index.html');
const SEC = 34;
// lap 2 and 3 early so every layer combination is exercised; turbo: short burst mid-bar, long burst across a lap change,
// rapid re-activations and a burst that crosses the 16-bar loop seam (t0 + 26.48 s)
const EVS = {
  none: [{ k: 'lap', n: 2, t: 6.1 }, { k: 'lap', n: 3, t: 12.3 }],
  turbo: [{ k: 'turbo', on: true, t: 2.73 }, { k: 'turbo', on: false, t: 3.11 }, { k: 'lap', n: 2, t: 6.1 }, { k: 'turbo', on: true, t: 5.2 }, { k: 'turbo', on: false, t: 9.9 },
    { k: 'lap', n: 3, t: 12.3 }, { k: 'turbo', on: true, t: 13.05 }, { k: 'turbo', on: false, t: 13.4 }, { k: 'turbo', on: true, t: 13.75 }, { k: 'turbo', on: false, t: 14.3 },
    { k: 'turbo', on: true, t: 14.6 }, { k: 'turbo', on: false, t: 19.2 }, { k: 'turbo', on: true, t: 25.3 }, { k: 'turbo', on: false, t: 30.4 }],
};
for (const [tag, file] of [['old', OLD], ['ctl', OLD], ['new', NEW]]) {
  const b = await openGame({ src: file });
  for (const bank of ['sony', 'vader', 'cooper', 'crown']) {
    for (const ev of ['none', 'turbo']) {
      if (bank !== 'sony' && bank !== 'vader' && ev === 'none') continue;
      if (tag === 'ctl' && !(bank === 'cooper' || (bank === 'sony' && ev === 'none'))) continue;
      const r = await b.runAsync(`STEM.bank=${JSON.stringify(bank)};var r=await stemOffline(${SEC},${JSON.stringify(EVS[ev])},0.5);return {sr:r.sr,t0:r.t0,pcm:r.pcm};`);
      writeFileSync(join(OUT, `${tag}_${bank}_${ev}.pcm`), Buffer.from(r.pcm, 'base64'));
      console.log(tag, bank, ev, 'rendered', r.sr);
    }
  }
  await b.close();
}
writeFileSync(join(OUT, 'events.json'), JSON.stringify({ SEC, EVS }));
// fade mechanics are unchanged (linear gain ramps): record the configuration used by the race
{ const b = await openGame({ src: NEW }); const cf = await b.run(`return [STEM.CFG,STEM.VCFG].map(function(c){return {turboIn:c.turboIn,turboOut:c.turboOut,tur:c.gain.tur,bpm:c.bpm,bars:c.bars};});`);
  writeFileSync(join(ROOT, 'work', 'turbo', 'fade_cfg.json'), JSON.stringify(cf)); console.log('fade cfg', JSON.stringify(cf)); await b.close(); }
const out = execFileSync(process.env.NV_PYTHON || 'python', [join(ROOT, 'tools', 'turbo_verify.py'), OUT, join(ROOT, 'work', 'turbo', 'turbo_verify.json')], { encoding: 'utf8' });
console.log(out);
// in-game: the campaign events decode the new banks through the real STEM path and the turbo gain follows the player's boost
{ const b = await openGame({ src: NEW }); await b.ev('AU.init()');
  for (let i = 0; i < 100; i++) { if (await b.ev('AU.ready')) break; await b.sleep(100); }
  for (const id of ['k9_3', 'ia_3', 'k9_1', 'ia_1']) {
    const r = await b.runAsync(`career.fleet.chosen=true;var e=evById(${JSON.stringify(id)});STEM.activate(e);await STEM.prepare();STEM.begin();await new Promise(function(r){setTimeout(r,300);});
      var t=AU.ctx.currentTime;STEM.setTurbo(true);await new Promise(function(r){setTimeout(r,900);});var on=STEM.stats().gains.tur;STEM.setTurbo(false);await new Promise(function(r){setTimeout(r,1800);});var off=STEM.stats().gains.tur;
      var st=STEM.stats();STEM.activate(null);return {bank:st.bank,st:st.st,err:st.err,loopFrames:st.loopFrames,decodedMB:st.decodedMB,turOn:on,turOff:off,sources:st.sources};`);
    const ok = !r.err && r.turOn > 1 && r.turOff === 0 && r.sources === 5;
    console.log(ok ? 'PASS' : 'FAIL', `in-game ${id}: bank decodes and turbo gain ramps on/off`, JSON.stringify(r));
    if (!ok) process.exitCode = 1;
  }
  await b.close(); }
