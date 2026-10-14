// Minimal Chrome DevTools Protocol driver for Microsoft Edge / Chrome (no npm dependencies).
// Launches a headless browser, opens a page and evaluates JavaScript inside it.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CANDIDATES = [
  process.env.NV_BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].filter(Boolean);

export function browserPath() {
  for (const p of CANDIDATES) if (existsSync(p)) return p;
  throw new Error('No Chromium browser found; set NV_BROWSER');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch({ width = 1280, height = 720, extraArgs = [], headless = true } = {}) {
  const profile = mkdtempSync(join(tmpdir(), 'nv-cdp-'));
  const port = 9300 + Math.floor(Math.random() * 500);
  const args = [
    headless ? '--headless=new' : '',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--edge-skip-compat-layer-relaunch',
    '--autoplay-policy=no-user-gesture-required',
    '--allow-file-access-from-files',
    '--enable-unsafe-swiftshader', '--use-angle=swiftshader',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows',
    ...extraArgs,
    'about:blank',
  ].filter(Boolean);
  const proc = spawn(browserPath(), args, { stdio: 'ignore' });
  let wsUrl = null;
  for (let i = 0; i < 100 && !wsUrl; i++) {
    await sleep(150);
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const pg = list.find((t) => t.type === 'page');
      if (pg) wsUrl = pg.webSocketDebuggerUrl;
    } catch (e) { /* not ready */ }
  }
  if (!wsUrl) { proc.kill(); throw new Error('browser did not expose CDP'); }
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(); const listeners = [];
  const logs = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { const { res, rej } = pending.get(msg.id); pending.delete(msg.id); msg.error ? rej(new Error(msg.error.message)) : res(msg.result); }
    else if (msg.method) {
      if (msg.method === 'Runtime.consoleAPICalled') logs.push({ type: msg.params.type, text: msg.params.args.map((a) => a.value ?? a.description ?? '').join(' ') });
      if (msg.method === 'Runtime.exceptionThrown') logs.push({ type: 'exception', text: msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text });
      listeners.forEach((l) => l(msg));
    }
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Runtime.enable'); await send('Page.enable'); await send('Log.enable').catch(() => {});
  const api = {
    send, logs,
    async goto(url, waitMs = 0) {
      const loaded = new Promise((res) => { const l = (m) => { if (m.method === 'Page.loadEventFired') { listeners.splice(listeners.indexOf(l), 1); res(); } }; listeners.push(l); });
      await send('Page.navigate', { url }); await loaded; if (waitMs) await sleep(waitMs);
    },
    async eval(expr, { awaitPromise = true, timeout = 600000 } = {}) {
      const r = await send('Runtime.evaluate', { expression: expr, awaitPromise, returnByValue: true, timeout });
      if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
      return r.result.value;
    },
    async viewport(width, height, mobile = false, dpr = 1) {
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile });
    },
    async screenshot(path) {
      const r = await send('Page.captureScreenshot', { format: 'png' });
      const { writeFileSync } = await import('node:fs'); writeFileSync(path, Buffer.from(r.data, 'base64'));
    },
    async close() { try { await Promise.race([send('Browser.close'), sleep(1500)]); } catch (e) {} try { ws.close(); } catch (e) {} proc.kill(); await sleep(400); try { rmSync(profile, { recursive: true, force: true }); } catch (e) {} },
    sleep,
  };
  return api;
}
