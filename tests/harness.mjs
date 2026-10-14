// Test harness: builds an instrumented copy of the game (outside the shipped file) and drives it through CDP.
// The only change to the copy is one line that exposes a closure-scoped evaluator (window.__NVT.ev) for tests.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launch } from './cdp.mjs';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const WORK = join(ROOT, 'work');

const MARK = '\n})();\n\n</script>';
export function instrument(src = join(ROOT, 'index.html'), out = join(WORK, 'nv_test.html')) {
  const html = readFileSync(src, 'utf8');
  const at = html.lastIndexOf(MARK);
  if (at < 0) throw new Error('closure end marker not found');
  const hook = '\nwindow.__NVT={ev:function(s){return eval(s);}};';
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html.slice(0, at) + hook + html.slice(at));
  return out;
}

export async function openGame({ src, width = 1280, height = 720, lang = 'es', mobile = false, dpr = 1 } = {}) {
  const file = instrument(src);
  const b = await launch({ width, height });
  if (mobile || dpr !== 1) await b.viewport(width, height, mobile, dpr);
  const t0 = Date.now();
  await b.goto(pathToFileURL(file).href);
  for (let i = 0; i < 400; i++) {
    const ok = await b.eval("!!(window.__NVT&&__NVT.ev('typeof state!==\"undefined\"&&state===\"title\"&&curTrack>=0'))").catch(() => false);
    if (ok) break; await b.sleep(100);
  }
  const bootMs = Date.now() - t0;
  b.ev = (code) => b.eval(`__NVT.ev(${JSON.stringify(code)})`);
  b.run = (fnBody) => b.eval(`__NVT.ev(${JSON.stringify('(function(){' + fnBody + '})()')})`);
  b.runAsync = (fnBody) => b.eval(`__NVT.ev(${JSON.stringify('(async function(){' + fnBody + '})()')})`);
  if (lang) await b.ev(`I18N.choose(${JSON.stringify(lang)})`);
  b.bootMs = bootMs;
  return b;
}
