// Renders the new Sony/Vader turbo layers in headless Chromium and writes float WAV files (stereo, 48 kHz).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from '../tests/cdp.mjs';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..'); const OUT = join(ROOT, 'work', 'turbo'); mkdirSync(OUT, { recursive: true });
function wav(path, sr, L, R) { const n = L.length, b = Buffer.alloc(44 + n * 8); b.write('RIFF', 0); b.writeUInt32LE(36 + n * 8, 4); b.write('WAVE', 8); b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(3, 20); b.writeUInt16LE(2, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 8, 28); b.writeUInt16LE(8, 32); b.writeUInt16LE(32, 34); b.write('data', 36); b.writeUInt32LE(n * 8, 40);
  for (let i = 0; i < n; i++) { b.writeFloatLE(L[i], 44 + i * 8); b.writeFloatLE(R[i], 48 + i * 8); } writeFileSync(path, b); }
const br = await launch();
await br.eval('window.NV_HARM=' + readFileSync(join(ROOT, 'tools', 'turbo_harmony.json'), 'utf8') + ';1');
await br.eval(readFileSync(join(ROOT, 'tools', 'turbo_compose.js'), 'utf8'));
for (const w of ['sony', 'vader']) {
  const r = await br.eval(`NV_TURBO.render('${w}').then(function(r){return {sr:r.sr,frames:r.frames,loop:r.loop,tail:r.tail,L:btoa(String.fromCharCode.apply(null,new Uint8Array(r.L.buffer).subarray(0,0)))+Array.from(r.L).join(','),R:Array.from(r.R).join(',')};})`);
  const L = Float32Array.from(r.L.split(',').map(Number)), R = Float32Array.from(r.R.split(',').map(Number));
  wav(join(OUT, `${w}_turbo_new.wav`), r.sr, L, R);
  console.log(w, 'frames', r.frames, 'loop s', r.loop.toFixed(5), 'tail', r.tail);
}
await br.close();
