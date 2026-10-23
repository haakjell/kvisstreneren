// Regression snapshots for Kvisstreneren (see CLAUDE.md, «Regresjonstest»). Drives every mode
// through the UI only (no internal function names), so the same run works before and after a
// refactor. Output: <out>/<test>.json with one record per step, <out>/html/<hash>.html with the
// markup, <out>/shots/*.png and <out>/errors.json. Compare two runs with compare.mjs.
//   node tools/regression/run.mjs <repoDir> <outDir> [only-test-prefix]
// Needs Playwright with Chromium, installed locally or globally (npm i -g playwright).
import { createRequire } from 'module';
import { execSync } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
let pw;
try { pw = await import('playwright'); }
catch { pw = createRequire(path.join(execSync('npm root -g').toString().trim(), 'x.js'))('playwright'); }
const { chromium } = pw;

const [repoArg, out, only] = process.argv.slice(2);
if (!repoArg || !out) { console.error('usage: run.mjs <repo> <out> [only]'); process.exit(1); }
const repo = path.resolve(repoArg);
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'html'), { recursive: true });
fs.mkdirSync(path.join(out, 'shots'), { recursive: true });

// ---- static server ----
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.md': 'text/markdown', '.json': 'application/json', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const f = path.join(repo, p === '/' ? '/index.html' : p);
  if (!f.startsWith(path.resolve(repo)) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  // The version changes with every push to main, so it is locked to one value
  let body = fs.readFileSync(f);
  if (p === '/js/core.js') body = body.toString().replace(/^const VERSION='[^']*';/m, "const VERSION='0.0.0';");
  res.end(req.method === 'HEAD' ? undefined : body);
});
await new Promise(r => server.listen(0, r));
const BASE = `http://127.0.0.1:${server.address().port}/index.html`;
const FILE = 'file://' + path.resolve(repo, 'index.html');

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
const DEVICE_NOW = Date.parse('2026-10-08T10:00:00Z');   // a Thursday: the countdown shakes, no lock

const browser = await chromium.launch();
const errors = [];

// In-page helpers, injected before any page script runs
const INIT = () => {
  // Seeded Math.random, so the free quizzes deal the same cards every run
  let a = 42; Math.random = () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  window.__shared = [];
  Object.defineProperty(navigator, 'share', { value: async d => { window.__shared.push(d.text); }, configurable: true });
  const T = window.__T = {
    vis: el => !!el && !el.closest('[hidden]') && el.getClientRects().length > 0,
    app: () => [...document.querySelectorAll('.wrap > *')].find(e => e.matches('#home,[id$=App]') && !e.hidden),
    // The shake on each second (.tick) comes and goes, so it is left out
    clean(el) { const c = el.cloneNode(true); c.querySelectorAll('#cdBody').forEach(x => x.innerHTML = ''); c.querySelectorAll('#countdown').forEach(x => x.classList.remove('tick')); c.querySelectorAll('script:not([type])').forEach(x => x.remove()); return c; },
    snap(full) {
      const a = full ? document.body : T.app();
      const cd = document.getElementById('cdBody'), cdText = cd ? cd.innerText : '';
      let text = a.innerText; if (cdText) text = text.split(cdText).join('');
      const dl = [...document.querySelectorAll('dialog[open]')].map(d => d.id + ':' + T.clean(d).innerHTML).join('\n');
      const ae = document.activeElement;
      return { html: T.clean(a).innerHTML + (dl ? '\n<!--dialogs-->\n' + dl : ''), text: text + (dl ? '\n[dialog] ' + [...document.querySelectorAll('dialog[open]')].map(d => d.innerText).join('\n') : ''),
        url: location.hash + location.search, mode: document.body.dataset.mode || '', bodyCls: document.body.className,
        wrapCls: document.querySelector('.wrap').className,
        focus: ae && ae !== document.body ? ae.tagName + ':' + (ae.textContent || ae.value || '').trim().slice(0, 40) : '',
        ls: JSON.stringify(Object.keys(localStorage).sort().filter(k => !k.startsWith('wd-')).map(k => [k, localStorage.getItem(k)])) };
    },
    card() { const a = T.app(); return [...a.querySelectorAll('.card')].find(T.vis); },
    state() {
      const a = T.app(); if (!a) return 'none';
      const o = [...a.querySelectorAll('.options')].find(x => T.vis(x) && x.querySelector('button:not(:disabled)'));
      if (o) return 'options';
      if ([...a.querySelectorAll('.card.done')].some(T.vis)) return 'done';
      return 'none';
    },
    expected() {
      const box = T.card().querySelector('.cprompt'); if (!box) return null;
      const s = box.querySelector('strong')?.textContent, small = box.querySelector('small')?.textContent, song = box.querySelector('.song')?.textContent.slice(1, -1);
      if (small === 'Melodi Grand Prix') return MGP.find(x => String(x.y) === s).a;
      if (small === 'Vinneren' || small === 'Vinnaren') return String(MGP.find(x => x.a === s && x.s === song).y);
      if (small === 'Rollefigur') return CAESAR.find(x => x.r === s).a;
      if (small === 'Skuespiller' || small === 'Skodespelar') return CAESAR.find(x => x.a === s).r;
      return null;
    },
    // Answer the current question (button step%n), snapshot right after, then press the visible primary action button.
    answer(step) {
      const a = T.app(), st = T.state(), before = T.snap();
      let how = '';
      if (st === 'options') {
        const bs = [...[...a.querySelectorAll('.options')].find(T.vis).querySelectorAll('button')];
        const b = bs[step % bs.length]; how = 'pick:' + b.textContent; b.click();
      } else return { before, how: 'state:' + st };
      const after = T.snap();
      const act = [...a.querySelectorAll('.card .btns .primary')].find(T.vis);
      if (act && T.state() !== 'done') act.click();
      return { before, after, how };
    },
    click(sel, i = 0, root) {
      const r = root || T.app(); const els = [...r.querySelectorAll(sel)].filter(T.vis);
      if (!els[i]) return false; els[i].click(); return true;
    },
    count(sel) { return [...T.app().querySelectorAll(sel)].filter(T.vis).length; },
    texts(sel) { return [...T.app().querySelectorAll(sel)].filter(T.vis).map(e => e.textContent.trim()); },
  };
};

const hashes = new Set();
function store(rec) {
  const h = crypto.createHash('sha1').update(rec.html).digest('hex').slice(0, 16);
  if (!hashes.has(h)) { hashes.add(h); fs.writeFileSync(path.join(out, 'html', h + '.html'), rec.html); }
  const { html, ...rest } = rec; return { ...rest, h };
}

async function newPage(test, { width = 412, height = 915, mobile = true, headDate = null, storage = {}, url = BASE, deviceNow = DEVICE_NOW, offline = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'no-preference', locale: 'nb-NO', timezoneId: 'America/New_York' });
  const page = await ctx.newPage();
  page.__head = { date: headDate, offline };
  await page.clock.setFixedTime(deviceNow);
  await page.addInitScript(INIT);
  if (Object.keys(storage).length) await page.addInitScript(s => { if (!sessionStorage.__init) { sessionStorage.__init = 1; for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); } }, storage);
  await page.route('**/*', route => {
    const req = route.request(), u = new URL(req.url());
    if (u.protocol === 'file:') return route.continue();
    if (u.hostname === '127.0.0.1') {
      if (req.method() === 'HEAD') {
        if (page.__head.offline) return route.abort();
        // As GitHub Pages' cache answers: Date is now, Age how long the page has sat in the cache
        return route.fulfill({ status: 200, headers: page.__head.date ? { date: new Date(page.__head.date).toUTCString(), age: '300' } : {} });
      }
      return route.continue();
    }
    if (u.hostname === 'fonts.googleapis.com') return route.fulfill({ status: 200, contentType: 'text/css', body: '' });
    if (u.hostname === 'query.wikidata.org') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"results":{"bindings":[]}}' });
    return route.fulfill({ status: 200, contentType: 'image/png', body: PNG });
  });
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push({ test, type: m.type(), text: m.text() }); });
  page.on('pageerror', e => errors.push({ test, type: 'pageerror', text: String(e.stack || e) }));
  await page.goto(url);
  await page.waitForLoadState('load');
  await page.waitForTimeout(150);
  return page;
}

class Rec {
  constructor(name) { this.name = name; this.rows = []; this.shot = 0; }
  push(label, snap) { this.rows.push({ label, ...store(snap) }); }
  async snap(page, label, full = false) { this.push(label, await page.evaluate(f => __T.snap(f), full)); }
  async shoot(page, label) {
    await page.waitForFunction(() => !document.querySelector('.ad.wait'), null, { timeout: 3000 }).catch(() => {});
    const f = `${this.name}-${String(++this.shot).padStart(2, '0')}-${label.replace(/[^a-z0-9]+/gi, '_')}.png`;
    await page.screenshot({ path: path.join(out, 'shots', f), fullPage: !this.name.startsWith('ads'), animations: 'disabled', mask: [page.locator('#cdBody')], caret: 'hide' });
    this.rows.push({ label: 'shot:' + label, shot: f });
  }
  save() { fs.writeFileSync(path.join(out, this.name + '.json'), JSON.stringify(this.rows, null, 1)); }
}

async function waitReady(page) {
  await page.waitForFunction(() => window.__T && ['options', 'done'].includes(__T.state()), null, { timeout: 5000 }).catch(() => {});
}

// Play until the done card shows; records before/after of each answer.
async function playRound(page, rec, tag, startStep = 0) {
  for (let s = 0; s < 80; s++) {
    await waitReady(page);
    const st = await page.evaluate(() => __T.state());
    if (st === 'done') { await rec.snap(page, `${tag}:done`); return; }
    const r = await page.evaluate(k => __T.answer(k), s + startStep);
    rec.push(`${tag}:q${s}:before`, r.before);
    if (r.after) rec.push(`${tag}:q${s}:after:${r.how}`, r.after);
    else { rec.rows.push({ label: `${tag}:stuck:${r.how}` }); return; }
  }
  rec.rows.push({ label: `${tag}:too-long` });
}

const tests = {};

tests.home = async () => {
  for (const [cfg, opt] of [['mobile', {}], ['desktop', { width: 1280, height: 900, mobile: false }]]) {
    const rec = new Rec('home-' + cfg), page = await newPage(rec.name, opt);
    await rec.snap(page, 'home-full', true); await rec.shoot(page, 'home');
    await page.goto(BASE + '#prep'); await page.waitForTimeout(150);
    await rec.snap(page, 'prep'); await rec.shoot(page, 'prep');
    // Every home button, then back via «← Alle kvisser»
    await page.goto(BASE); await page.waitForTimeout(100);
    const n = await page.evaluate(() => document.querySelectorAll('#home .mode').length);
    for (let i = 0; i < n; i++) {
      await page.evaluate(i => document.querySelectorAll('#home .mode')[i].click(), i);
      await page.waitForTimeout(150);
      await rec.snap(page, 'mode-button-' + i);
      await page.evaluate(() => __T.click('.back'));
      await page.waitForTimeout(100);
      await rec.snap(page, 'back-' + i);
    }
    // History: open from home, browser back
    await page.evaluate(() => document.querySelectorAll('#home .mode')[3].click()); await page.waitForTimeout(100);
    await page.goBack(); await page.waitForTimeout(150); await rec.snap(page, 'history-back');
    await page.goForward(); await page.waitForTimeout(150); await rec.snap(page, 'history-forward');
    await page.goto(BASE + '#ukjent'); await page.waitForTimeout(150); await rec.snap(page, 'unknown-hash');
    if (cfg === 'mobile') {
      await page.goto(BASE); await page.waitForTimeout(100);
      await page.evaluate(() => __T.click('.install')); await page.waitForTimeout(100);
      await rec.snap(page, 'install-sheet', true);
    }
    // Dark mode screenshots of home and a quiz
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(BASE); await page.waitForTimeout(150); await rec.shoot(page, 'home-dark');
    await page.goto(BASE + '#caesar'); await page.waitForTimeout(150); await rec.shoot(page, 'caesar-dark');
    rec.save(); await page.context().close();
  }
};

// Each quiz mode: every radio, a round each, retry, restart, extra switches, the study tab
const MODES = ['bydel', 'tbane', 'regjering', 'vapen', 'mgp', 'caesar'];
for (const m of MODES) for (const [cfg, opt] of [['mobile', {}], ['desktop', { width: 1280, height: 900, mobile: false }]]) {
  tests[`mode-${m}-${cfg}`] = async () => {
    const rec = new Rec(`mode-${m}-${cfg}`), page = await newPage(rec.name, { ...opt, url: BASE + '#' + m });
    await waitReady(page);
    await rec.snap(page, 'open'); await rec.shoot(page, 'open');
    const radios = await page.evaluate(() => __T.texts('.setswitch [role=radio]'));
    for (let r = 0; r < radios.length; r++) {
      await page.evaluate(r => __T.click('.setswitch [role=radio]', r), r);
      await page.waitForTimeout(80);
      await rec.snap(page, `radio:${radios[r]}`);
      await playRound(page, rec, `r${r}`, r);
      if (r === 0) await rec.shoot(page, 'done');
      // retry missed, then restart
      if (await page.evaluate(() => __T.click('.card.done .btns .primary'))) { await playRound(page, rec, `r${r}-retry`, 1); }
      await page.evaluate(() => __T.click('.card.done .btns .ghost')); await page.waitForTimeout(50);
      await rec.snap(page, `r${r}-restarted`);
    }
    if (m === 'mgp') {
      const chips = await page.evaluate(() => __T.texts('.mgfrom .chips button'));
      for (let c = 0; c < chips.length; c++) {
        await page.evaluate(c => __T.click('.mgfrom .chips button', c), c); await page.waitForTimeout(50);
        await rec.snap(page, `from:${chips[c]}`);
      }
      await page.evaluate(() => __T.click('.mgfrom .chips button', 3));
      await playRound(page, rec, 'from2000');
    }
    if (m === 'tbane') {
      await page.evaluate(() => __T.click('.setswitch [role=radio]', 0)); await page.waitForTimeout(80);   // Geografisk
      await rec.snap(page, 'geo'); await rec.shoot(page, 'geo');
      await page.evaluate(() => __T.click('.linepick button', 0)); await page.waitForTimeout(50);
      await page.evaluate(() => __T.click('.linepick button', 2)); await page.waitForTimeout(50);
      await rec.snap(page, 'lines-off');
      await page.evaluate(() => __T.click('.card.done .btns .ghost'));
      await playRound(page, rec, 'geo-lines');
      await page.evaluate(() => __T.click('.setswitch [role=radio]', 1)); await page.waitForTimeout(80);
    }
    if (m === 'caesar') {
      await page.evaluate(() => __T.click('[role=switch]')); await page.waitForTimeout(50);
      await rec.snap(page, 'pics-off');
      await page.evaluate(() => __T.click('.card.done .btns .ghost'));
      await playRound(page, rec, 'nopics');
      await page.evaluate(() => __T.click('[role=switch]')); await page.waitForTimeout(50);
      await rec.snap(page, 'pics-on');
    }
    // keyboard: 1..6 and Enter
    await page.evaluate(() => __T.click('.setswitch [role=radio]', 0)); await page.waitForTimeout(80);
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.press('2'); await rec.snap(page, 'key-2');
    await page.keyboard.press('Enter'); await page.waitForTimeout(30); await rec.snap(page, 'key-enter');
    await page.keyboard.press('1'); await rec.snap(page, 'key-1');
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.press('Enter'); await page.waitForTimeout(30); await rec.snap(page, 'key-enter2');
    // study tab
    await page.evaluate(() => __T.click('[role=tab]', 1)); await page.waitForTimeout(150);
    await rec.snap(page, 'study'); await rec.shoot(page, 'study');
    if (m === 'tbane') {
      for (const id of ['#tZoomIn', '#tZoomIn', '#tZoomOut', '#tZoomAll']) { await page.click(id); await page.waitForTimeout(60); }
      const box = await page.locator('.tstudy').boundingBox();
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2); await page.waitForTimeout(80);
      await rec.snap(page, 'study-tap');
      await page.evaluate(() => __T.click('.setswitch [role=radio]', 0)); await page.waitForTimeout(100);
      await rec.snap(page, 'study-geo');
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2); await page.waitForTimeout(80);
      await page.evaluate(() => __T.click('.linepick button', 1)); await page.waitForTimeout(80);
      await rec.snap(page, 'study-geo-tap'); await rec.shoot(page, 'study-geo');
    } else if (m === 'bydel') {
      for (let i of [0, 3, 3, 5]) { await page.evaluate(i => __T.click('.chips button', i), i); await page.waitForTimeout(30); await rec.snap(page, 'chip' + i); }
      await page.evaluate(() => __T.click('.setswitch [role=radio]', 1)); await page.waitForTimeout(50);
      await rec.snap(page, 'study-new');
      await page.evaluate(() => { const p = [...__T.app().querySelectorAll('path.bd')].filter(x => x.dataset.i !== '')[2]; p.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
      await rec.snap(page, 'study-map-click');
    } else {
      await page.evaluate(() => __T.click('.studybar button')); await page.waitForTimeout(30);
      await rec.snap(page, 'study-hidden');
      await page.evaluate(() => { __T.click('.study figure, li[tabindex]', 0); __T.click('.study figure, li[tabindex]', 2); });
      await rec.snap(page, 'study-revealed'); await rec.shoot(page, 'study-revealed');
      await page.evaluate(() => { const el = [...__T.app().querySelectorAll('.study figure, li[tabindex]')].filter(__T.vis)[4]; el.focus(); });
      await page.keyboard.press('Enter'); await rec.snap(page, 'study-key');
      await page.evaluate(() => __T.click('.studybar button')); await page.waitForTimeout(30);
      await rec.snap(page, 'study-shown');
      // The other modes hide their question type in «Pugg», where it does nothing
      if (m === 'vapen') {
        await page.evaluate(() => __T.click('.setswitch [role=radio]', 1)); await page.waitForTimeout(50);
        await rec.snap(page, 'study-radio1');
      }
    }
    await page.evaluate(() => __T.click('[role=tab]', 0)); await page.waitForTimeout(80);
    await rec.snap(page, 'back-to-quiz');
    rec.save(); await page.context().close();
  };
}

// Dagens kviss: a run of days, played through; the share text at the end
const DAY0 = Date.parse('2026-10-01T11:00:00Z');
const dagensDays = (from, n, step = 1) => Array.from({ length: n }, (_, i) => DAY0 + (from + i * step) * 864e5);
for (const [name, days, opt] of [
  ['dagens-mobile', dagensDays(0, 45), {}],
  ['dagens-later', dagensDays(45, 15, 23), {}],
  ['dagens-desktop', dagensDays(3, 8, 5), { width: 1280, height: 900, mobile: false }],
  ['dagens-geo', dagensDays(1, 10, 3), { storage: { tMapKind: 'geo' } }],
]) {
  tests[name] = async () => {
    const rec = new Rec(name);
    for (const d of days) {
      const page = await newPage(name, { ...opt, headDate: d, url: BASE + '#dagens' });
      const tag = new Date(d).toISOString().slice(0, 10);
      await waitReady(page);
      await playRound(page, rec, tag, Math.floor(d / 864e5) % 7);
      await page.evaluate(() => __T.click('.card.done .btns .primary')); await page.waitForTimeout(30);
      rec.rows.push({ label: tag + ':shared', text: await page.evaluate(() => window.__shared.join('|')) });
      if (d === days[0]) await rec.shoot(page, 'done-' + tag);
      await page.context().close();
    }
    rec.save();
  };
}

tests['dagens-flow'] = async () => {
  const rec = new Rec('dagens-flow');
  const d = Date.parse('2026-10-09T09:00:00Z');
  let page = await newPage('dagens-flow', { headDate: d, url: BASE + '#dagens' });
  await waitReady(page); await rec.shoot(page, 'first');
  for (let s = 0; s < 3; s++) { const r = await page.evaluate(k => __T.answer(k), s); rec.push('q' + s, r.after); }
  // reload mid-round: carries on at question 4
  await page.reload(); await waitReady(page); await rec.snap(page, 'reloaded');
  await playRound(page, rec, 'rest', 3);
  await page.reload(); await waitReady(page); await rec.snap(page, 'reloaded-done');
  // free round, then back to today's result
  await page.evaluate(() => __T.click('.card.done .btns .ghost', 0)); await waitReady(page);
  await rec.snap(page, 'free-start');
  await playRound(page, rec, 'free', 2);
  await page.evaluate(() => __T.click('.card.done .btns .ghost', 1)); await waitReady(page);
  await rec.snap(page, 'today-again');
  // the next two days, same browser: streak
  for (const k of [1, 2]) {
    page.__head.date = d + k * 864e5;
    await page.goto(BASE); await page.goto(BASE + '#dagens'); await waitReady(page);
    await playRound(page, rec, 'day+' + k, k);
  }
  // keyboard
  page.__head.date = d + 3 * 864e5;
  await page.goto(BASE); await page.goto(BASE + '#dagens'); await waitReady(page);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.keyboard.press('3'); await rec.snap(page, 'key-3');
  await page.keyboard.press('Enter'); await page.waitForTimeout(30); await rec.snap(page, 'key-enter');
  await page.context().close();
  // Wednesday during the quiz: closed
  page = await newPage('dagens-flow', { headDate: Date.parse('2026-10-14T18:30:00Z'), url: BASE + '#dagens' });
  await page.waitForTimeout(300); await rec.snap(page, 'locked'); await rec.shoot(page, 'locked');
  await page.context().close();
  // Offline, then retry
  page = await newPage('dagens-flow', { offline: true, headDate: d, url: BASE + '#dagens' });
  await page.waitForTimeout(300); await rec.snap(page, 'offline'); await rec.shoot(page, 'offline');
  page.__head.offline = false;
  await page.evaluate(() => __T.click('.card.done .btns .primary')); await waitReady(page);
  await rec.snap(page, 'offline-retried');
  await page.context().close();
  // Opened as a local file: the device clock decides the day (2026-10-08)
  page = await newPage('dagens-flow', { url: FILE + '#dagens' });
  await waitReady(page); await playRound(page, rec, 'file');
  await page.context().close();
  page = await newPage('dagens-flow', { url: FILE });
  await rec.snap(page, 'file-home', true);
  await page.context().close();
  rec.save();
};

// Innstillinger: every setting, that the modes follow them, and a round without auto-advance
tests.settings = async () => {
  for (const [cfg, opt] of [['mobile', {}], ['desktop', { width: 1280, height: 900, mobile: false }]]) {
    const rec = new Rec('settings-' + cfg), page = await newPage(rec.name, opt);
    const click = async (sel, label) => { await page.click(sel); await page.waitForTimeout(80); await rec.snap(page, label); };
    await page.evaluate(() => document.querySelector('#home .gear').click()); await page.waitForTimeout(150);
    await rec.snap(page, 'open');
    await click('#stAuto', 'auto-off');
    await click('#stPics', 'pics-off');
    await click('#stMapGeo', 'map-geo');
    await click('#stThemeDark', 'theme-dark');
    await click('#stPalGran', 'palette-gran');
    if (cfg === 'mobile') { await click('#stInstall', 'install-off'); await page.evaluate(() => __T.click('.back')); await page.waitForTimeout(100); await rec.snap(page, 'home-no-install', true); }
    // The modes follow, also after a reload
    await page.reload(); await page.waitForTimeout(150);
    await page.goto(BASE + '#tbane'); await waitReady(page); await rec.snap(page, 'tbane');
    await page.goto(BASE + '#caesar'); await waitReady(page); await rec.snap(page, 'caesar');
    // A right answer waits for «Neste» instead of going on by itself
    await page.goto(BASE + '#mgp'); await waitReady(page);
    await page.evaluate(() => { const a = __T.expected(); [...__T.app().querySelectorAll('.options button')].find(b => b.textContent === a).click(); });
    await page.waitForTimeout(1300); await rec.snap(page, 'mgp-right-waits');
    await page.keyboard.press('Enter'); await page.waitForTimeout(80); await rec.snap(page, 'mgp-enter');
    await playRound(page, rec, 'mgp', 1);
    // Back to the defaults
    await page.goto(BASE + '#settings'); await page.waitForTimeout(100);
    for (const id of ['#stAuto', '#stPics', '#stMapRuter', '#stThemeAuto', '#stPalLyng']) await page.click(id);
    if (cfg === 'mobile') await page.click('#stInstall');
    await page.waitForTimeout(80); await rec.snap(page, 'defaults');
    // Screenshots last: a full-page one of a page taller than the screen loses the touch emulation,
    // and the switch for the home screen (touch only) would be gone after the reload above
    await rec.shoot(page, 'open');
    await page.click('#stThemeDark'); await rec.shoot(page, 'dark'); await page.click('#stThemeAuto');
    await page.click('#stPalMulte'); await rec.shoot(page, 'multe'); await page.click('#stPalLyng');
    rec.save(); await page.context().close();
  }
};

// Nynorsk, picked in Innstillinger (the page reloads), then every page, a round of each quiz, the
// countdown and the sheets in nynorsk; and back
const NN_NOW = Date.parse('2026-10-15T10:00:00Z');   // a Thursday
tests.nynorsk = async () => {
  for (const [cfg, opt] of [['mobile', {}], ['desktop', { width: 1280, height: 900, mobile: false }]]) {
    const rec = new Rec('nynorsk-' + cfg), page = await newPage(rec.name, { ...opt, deviceNow: NN_NOW, url: BASE + '#settings' });
    await Promise.all([page.waitForEvent('load'), page.click('#stLangNn')]); await page.waitForTimeout(200);
    await rec.snap(page, 'settings', true); await rec.shoot(page, 'settings');
    await page.goto(BASE); await page.waitForTimeout(150); await rec.snap(page, 'home', true); await rec.shoot(page, 'home');
    for (const m of ['prep', 'dagens', ...MODES]) {
      await page.goto(BASE + '#' + m); await page.waitForTimeout(150);
      await rec.snap(page, m);
      if (m !== 'prep') await playRound(page, rec, m, 2);
      if (await page.evaluate(() => __T.click('[role=tab]', 1))) { await page.waitForTimeout(150); await rec.snap(page, m + ':study'); }
    }
    await page.goto(BASE + '#mgp'); await page.evaluate(() => __T.click('[role=tab]', 0)); await waitReady(page);
    await page.evaluate(() => __T.click('.setswitch [role=radio]', 1)); await page.waitForTimeout(80);
    await page.evaluate(() => { const a = __T.expected(); [...__T.app().querySelectorAll('.options button')].find(b => b.textContent === a).click(); });
    await rec.snap(page, 'mgp-artist-right');
    if (cfg === 'mobile') {
      await page.goto(BASE); await page.waitForTimeout(100);
      await page.evaluate(() => __T.click('.install')); await page.waitForTimeout(100);
      await rec.snap(page, 'install-sheet', true);
    }
    await page.goto(BASE); await page.waitForTimeout(150);
    await page.evaluate(() => document.getElementById('shakeBtn').click()); await page.waitForTimeout(50);
    await rec.snap(page, 'shake-sheet', true);
    await page.click('#shakeAds'); await page.waitForTimeout(700);
    await page.evaluate(() => { const a = [...document.querySelectorAll('.adwhy')].find(x => x.getClientRects().length); a.click(); });
    await page.waitForTimeout(50); await rec.snap(page, 'why', true);
    await page.click('#adWhyShake'); await page.waitForTimeout(100);
    await page.goto(BASE + '#settings'); await page.waitForTimeout(100);
    await Promise.all([page.waitForEvent('load'), page.click('#stLangNb')]); await page.waitForTimeout(200);
    await rec.snap(page, 'back-to-bokmal', true);
    rec.save(); await page.context().close();
  }
  // The countdown in nynorsk: plural forms, «I morgon», and during the quiz
  const rec = new Rec('nynorsk-clock');
  for (const [label, at] of [['thursday', '2026-10-15T10:00:00Z'], ['tuesday', '2026-10-20T08:00:00Z'], ['last-hour', '2026-10-21T16:30:00Z'], ['quiz-live', '2026-10-21T18:30:00Z'], ['stale-prep', '2026-10-22T10:00:00Z']]) {
    const page = await newPage('nynorsk-clock', { deviceNow: Date.parse(at), storage: { lang: 'nn' } });
    rec.rows.push({ label: 'countdown:' + label, text: await page.evaluate(() => document.getElementById('cdBody').innerText.replace(/\s+/g, ' ').replace(/\d+ (sekund|millisekund)\b.*$/, '')) });
    await rec.snap(page, label, true);
    await page.context().close();
  }
  rec.save();
};

// Ads, and the shaking all week but for the quiz itself
tests.ads = async () => {
  const rec = new Rec('ads');
  for (const [cfg, opt] of [['mobile', {}], ['desktop', { width: 1280, height: 900, mobile: false }]]) {
    const page = await newPage('ads', { ...opt, url: BASE });
    await rec.snap(page, cfg + ':shaking', true);
    await page.evaluate(() => document.getElementById('shakeBtn').click()); await page.waitForTimeout(50);
    await rec.snap(page, cfg + ':shake-sheet', true);
    await page.click('#shakeAds'); await page.waitForTimeout(700);
    await rec.snap(page, cfg + ':ads-home', true); await rec.shoot(page, cfg + '-ads-home');
    await page.goto(BASE + '#prep'); await page.waitForTimeout(700);
    await rec.snap(page, cfg + ':ads-prep', true); await rec.shoot(page, cfg + '-ads-prep');
    await page.goto(BASE + '#mgp'); await page.waitForTimeout(700);
    await rec.snap(page, cfg + ':ads-mgp', true);
    const ad = page.locator('.ad').first();
    if (await ad.count()) {
      await page.evaluate(() => { const a = [...document.querySelectorAll('.ad')].find(x => x.getClientRects().length); a.click(); });
      await page.waitForTimeout(100);
      await rec.snap(page, cfg + ':ad-full', true); await rec.shoot(page, cfg + '-ad-full');
      await page.evaluate(() => { const b = document.querySelector('#adFull .big, #adFull button:not(.adfullx)'); if (b) b.click(); });
      await rec.snap(page, cfg + ':ad-full-big', true);
      await page.keyboard.press('Escape'); await page.waitForTimeout(100);
      await rec.snap(page, cfg + ':ad-full-closed', true);
      await page.evaluate(() => { const a = [...document.querySelectorAll('.adwhy')].find(x => x.getClientRects().length); a.click(); });
      await page.waitForTimeout(50);
      await rec.snap(page, cfg + ':why', true);
      await page.click('#adWhyShake'); await page.waitForTimeout(100);
      await rec.snap(page, cfg + ':shake-back', true);
    }
    await page.context().close();
  }
  // Just the shaking off, from the countdown's sheet; then the ads on and off again, from their own sheet
  {
    const page = await newPage('ads', { url: BASE });
    await page.evaluate(() => document.getElementById('shakeBtn').click()); await page.waitForTimeout(50);
    await page.click('#shakeStop'); await page.waitForTimeout(700);
    await rec.snap(page, 'calm:home', true);
    await page.goto(BASE + '#settings'); await page.waitForTimeout(100);
    await page.click('#stAdsOn'); await page.waitForTimeout(80); await rec.snap(page, 'calm:settings-ads-on', true);
    await page.goto(BASE); await page.waitForTimeout(700);
    await page.evaluate(() => { const a = [...document.querySelectorAll('.adwhy')].find(x => x.getClientRects().length); a.click(); });
    await page.waitForTimeout(50); await rec.snap(page, 'calm:why', true);
    await page.click('#adWhyOff'); await page.waitForTimeout(100);
    await rec.snap(page, 'calm:ads-off', true);
    await page.goto(BASE); await page.waitForTimeout(150); await rec.snap(page, 'calm:reloaded', true);
    await page.context().close();
  }
  // The same in Innstillinger: two switches, each on its own
  {
    const page = await newPage('ads', { url: BASE + '#settings' });
    await rec.snap(page, 'settings:shaking', true);
    await page.click('#stShake'); await page.waitForTimeout(80); await rec.snap(page, 'settings:shake-off', true);
    await page.goto(BASE); await page.waitForTimeout(700); await rec.snap(page, 'settings:calm-home', true);
    await page.goto(BASE + '#settings'); await page.waitForTimeout(100);
    await page.click('#stAdsOn'); await page.waitForTimeout(80); await rec.snap(page, 'settings:ads-on', true);
    await page.click('#stShake'); await page.waitForTimeout(80); await rec.snap(page, 'settings:both-on', true);
    await page.goto(BASE); await page.waitForTimeout(700); await rec.snap(page, 'settings:both-home', true);
    await page.goto(BASE + '#settings'); await page.waitForTimeout(100);
    await page.click('#stAdsOn'); await page.waitForTimeout(80); await rec.snap(page, 'settings:ads-off', true);
    await page.goto(BASE); await page.waitForTimeout(150); await rec.snap(page, 'settings:shaking-home', true);
    await page.context().close();
  }
  // The prep during the quiz, Wednesday 19:00 Oslo: no shaking and no ads
  const page2 = await newPage('ads', { deviceNow: Date.parse('2026-10-14T17:00:00Z'), url: BASE + '#prep', storage: { ads: '1' } });
  await rec.snap(page2, 'wednesday-quiz-prep', true);
  await page2.context().close();
  // The shaking lasts all week but for the quiz itself, Wednesday 19–22 Oslo
  for (const [label, at] of [['tuesday', '2026-10-20T18:00:00Z'], ['before-quiz', '2026-10-21T16:59:00Z'],
    ['quiz-start', '2026-10-21T17:01:00Z'], ['quiz-end', '2026-10-21T20:01:00Z'], ['thursday', '2026-10-22T10:00:00Z']]) {
    const p = await newPage('ads', { deviceNow: Date.parse(at) });
    await rec.snap(p, 'window:' + label, true);
    await p.context().close();
  }
  // Loading the prep with a server that answers with the time: the prep is redrawn when it has
  // answered, and what was filled into it must still be there. Saved from before the shaking and
  // the ads were split: shakeOff alone still means ads
  const page4 = await newPage('ads', { url: BASE + '#prep', headDate: DEVICE_NOW, storage: { shakeOff: '1' } });
  await page4.waitForTimeout(700);
  await rec.snap(page4, 'prep-load-server-clock', true); await rec.shoot(page4, 'prep-load-server-clock');
  await page4.context().close();
  // Ads on from before the split: told once that both can now be turned off, then never again
  for (const [label, btn] of [['news-off', '#adsNewsOff'], ['news-keep', '#adsNewsKeep']]) {
    const p = await newPage('ads', { url: BASE, storage: { ads: '1', shakeOff: '1' } });
    await p.waitForTimeout(150); await rec.snap(p, label + ':sheet', true);
    await p.click(btn); await p.waitForTimeout(700); await rec.snap(p, label + ':after', true);
    await p.goto(BASE); await p.waitForTimeout(150); await rec.snap(p, label + ':reloaded', true);
    await p.context().close();
  }
  rec.save();
};

// Anagram: the map, a stop's page, a wrong and a right answer, back via the button and the back
// gesture, all of them in order, the treasure chest and the gold countdown, a solved stop again, the progress after a reload, and the home
// button; also in nynorsk and dark. Reads ANAGRAMS for the answers.
tests.anagram = async () => {
  for (const [cfg, opt] of [['mobile', {}], ['desktop', { width: 1280, height: 900, mobile: false }], ['nynorsk', { storage: { lang: 'nn', theme: 'dark' } }]]) {
    const rec = new Rec('anagram-' + cfg), page = await newPage(rec.name, { ...opt, url: BASE + '#anagram' });
    await page.waitForTimeout(150);
    await rec.snap(page, 'map'); await rec.shoot(page, 'map');
    const stop = async label => { await page.click('.agnode.cur'); await page.waitForTimeout(80); await rec.snap(page, label); };
    const answer = async (v, label) => { await page.fill('#agInput', v); await page.press('#agInput', 'Enter'); await page.waitForTimeout(80); await rec.snap(page, label); };
    await stop('stop-0'); await rec.shoot(page, 'stop');
    await page.goBack(); await page.waitForTimeout(100); await rec.snap(page, 'back-gesture');
    await stop('stop-0-again');
    await answer('Dan Brøge Akerø', 'wrong'); await rec.shoot(page, 'wrong');
    await page.click('#agBack'); await page.waitForTimeout(100); await rec.snap(page, 'back-button');
    const names = await page.evaluate(() => ANAGRAMS.map(x => x.n));
    for (let i = 0; i < names.length; i++) {
      await stop('stop-' + i);
      await answer(i % 2 ? names[i].toUpperCase() : names[i].toLowerCase().replace(/ /g, ''), 'right-' + i);
      if (i === 0) await rec.shoot(page, 'right');
      await page.keyboard.press('Enter'); await page.waitForTimeout(100); await rec.snap(page, 'map-' + i);
    }
    await rec.shoot(page, 'chest-waits');
    // The chest: opened, then the cloud shows
    await stop('chest'); await page.click('#agOpenChest'); await page.waitForTimeout(1800);
    await rec.snap(page, 'chest-open'); await rec.shoot(page, 'chest-open');
    // The gold countdown it unlocks: on here, seen on the home page and in Innstillinger, and off there
    await page.click('#agGold'); await page.waitForTimeout(80); await rec.snap(page, 'gold-on'); await rec.shoot(page, 'gold-on');
    await page.goto(BASE); await page.waitForTimeout(150); await rec.snap(page, 'gold-home', true); await rec.shoot(page, 'gold-home');
    await page.goto(BASE + '#settings'); await page.waitForTimeout(100); await rec.snap(page, 'gold-settings');
    await page.click('#stGold'); await page.waitForTimeout(80); await rec.snap(page, 'gold-off', true);
    await page.goto(BASE + '#anagram'); await page.waitForTimeout(150); await page.click('.agnode.chest'); await page.waitForTimeout(80);
    await page.click('#agChestOn'); await page.waitForTimeout(1000); await rec.snap(page, 'map-cloud'); await rec.shoot(page, 'all-done');
    await page.click('.agnode.chest'); await page.waitForTimeout(80); await rec.snap(page, 'chest-again'); await page.goBack(); await page.waitForTimeout(100);
    await page.click('.agnode.solved'); await page.waitForTimeout(80); await rec.snap(page, 'solved-stop');
    await page.reload(); await page.waitForTimeout(150); await rec.snap(page, 'reloaded');
    await page.evaluate(() => __T.click('.back')); await page.waitForTimeout(100); await rec.snap(page, 'home', true);
    rec.save(); await page.context().close();
  }
};

// Server and device disagree about the time: the countdown and the prep's «utdatert» notice
// should follow the server (the device's clock is only a fallback before it has answered)
// Kvisslagets offisielle bommedatabase: the list of questions, opened by click and by Enter, on both screens and in
// nynorsk with the dark theme
tests.bom = async () => {
  for (const [cfg, opt] of [['mobile', {}], ['desktop', { width: 1280, height: 900, mobile: false }], ['nynorsk', { storage: { lang: 'nn', theme: 'dark' } }]]) {
    const rec = new Rec('bom-' + cfg), page = await newPage(rec.name, opt);
    await rec.snap(page, 'home'); await rec.shoot(page, 'home');
    await page.evaluate(() => __T.click('.mode[data-mode=bom]')); await page.waitForTimeout(100);
    await rec.snap(page, 'open'); await rec.shoot(page, 'open');
    await page.evaluate(() => __T.click('summary', 0)); await page.waitForTimeout(30);
    await rec.snap(page, 'opened'); await rec.shoot(page, 'opened');
    await page.evaluate(() => [...__T.app().querySelectorAll('summary')].filter(__T.vis).at(-1).focus());
    await page.keyboard.press('Enter'); await page.waitForTimeout(30); await rec.snap(page, 'key-enter');
    await page.evaluate(() => __T.click('summary', 0)); await page.waitForTimeout(30); await rec.snap(page, 'closed');
    await page.evaluate(() => __T.click('.boextra summary')); await page.waitForTimeout(30);
    await rec.snap(page, 'media'); await rec.shoot(page, 'media');
    await page.evaluate(() => __T.click('.back')); await page.waitForTimeout(100); await rec.snap(page, 'back');
    rec.save(); await page.context().close();
  }
};

// Flagg: the start page, a round each way (Oseania, Antarktis and a part of the whole world), retry,
// restart, another part, back from the quiz with «← Verdensdelene» and the back gesture, the
// keyboard, and «Pugg»; on both screens and in nynorsk with the dark theme
tests.flagg = async () => {
  for (const [cfg, opt] of [['mobile', {}], ['desktop', { width: 1280, height: 900, mobile: false }], ['nynorsk', { storage: { lang: 'nn', theme: 'dark' } }]]) {
    const rec = new Rec('flagg-' + cfg), page = await newPage(rec.name, opt);
    await page.evaluate(() => __T.click('.mode[data-mode=flagg]')); await page.waitForTimeout(100);
    await rec.snap(page, 'pick'); await rec.shoot(page, 'pick');
    const part = async p => { await page.evaluate(p => __T.click(`[data-part="${p}"]`), p); await waitReady(page); };
    // Flag → country, Oseania: a round, retry the misses, start again
    await part('oc'); await rec.snap(page, 'oc-open'); await rec.shoot(page, 'oc-open');
    await playRound(page, rec, 'oc', 1); await rec.shoot(page, 'oc-done');
    if (await page.evaluate(() => __T.click('.card.done .btns .primary'))) await playRound(page, rec, 'oc-retry', 2);
    await page.evaluate(() => __T.click('.card.done .btns .ghost', 0)); await waitReady(page);
    await rec.snap(page, 'oc-restarted');
    // Halfway through: back with the back gesture, then the other way round
    await page.evaluate(() => __T.answer(0)); await page.goBack(); await page.waitForTimeout(150);
    await rec.snap(page, 'back-gesture');
    await page.evaluate(() => __T.click('.setswitch [role=radio]', 1)); await page.waitForTimeout(30);
    await rec.snap(page, 'dir-land');
    await part('an'); await rec.snap(page, 'an-land'); await playRound(page, rec, 'an-land'); await rec.shoot(page, 'an-done');
    await page.evaluate(() => __T.click('.card.done .btns .ghost', 1)); await page.waitForTimeout(100);
    await rec.snap(page, 'other-part');
    await part('sa'); await rec.shoot(page, 'sa-land');
    await playRound(page, rec, 'sa-land', 3);
    await page.evaluate(() => __T.click('#fgBack')); await page.waitForTimeout(100);
    await page.evaluate(() => __T.click('.setswitch [role=radio]', 0)); await page.waitForTimeout(30);
    await part('an'); await playRound(page, rec, 'an-flag');
    await page.evaluate(() => __T.click('#fgBack')); await page.waitForTimeout(100);
    // The whole world: a few questions, by keyboard
    await part('all'); await rec.snap(page, 'all');
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    for (const k of ['3', 'Enter', '1', 'Enter']) { await page.keyboard.press(k); await page.waitForTimeout(30); await rec.snap(page, 'key-' + k); }
    await page.evaluate(() => __T.click('#fgBack')); await page.waitForTimeout(100);
    // «Pugg»
    await page.evaluate(() => __T.click('[role=tab]', 1)); await page.waitForTimeout(150);
    await rec.snap(page, 'study'); await rec.shoot(page, 'study');
    await page.evaluate(() => __T.click('.studybar button')); await page.waitForTimeout(30);
    await page.evaluate(() => __T.click('.study figure', 2)); await rec.snap(page, 'study-hidden');
    await page.evaluate(() => __T.click('[role=tab]', 0)); await page.waitForTimeout(50);
    await page.evaluate(() => __T.click('.back')); await page.waitForTimeout(100); await rec.snap(page, 'home');
    rec.save(); await page.context().close();
  }
};

tests.clock = async () => {
  const rec = new Rec('clock');
  const cd = async (page, label) => rec.rows.push({ label: 'countdown:' + label,
    text: await page.evaluate(() => document.getElementById('countdown').className.replace(/ ?\btick\b/, '') + ' | ' + document.getElementById('cdBody').innerText.replace(/\s+/g, ' ').replace(/\d+ (sekund|sekunder|millisekund|millisekunder)\b.*$/, '')) });
  for (const [label, device, server] of [
    ['device-late', '2026-10-20T10:00:00Z', '2026-10-08T10:00:00Z'],
    ['device-early', '2026-09-20T10:00:00Z', '2026-10-08T10:00:00Z'],
    ['server-quiz-live', '2026-10-08T10:00:00Z', '2026-10-14T18:30:00Z'],
    ['server-tuesday-evening', '2026-10-08T10:00:00Z', '2026-10-13T18:00:00Z'],
    ['server-wednesday-morning', '2026-10-08T10:00:00Z', '2026-10-14T08:00:00Z'],
  ]) {
    const page = await newPage('clock', { deviceNow: Date.parse(device), headDate: Date.parse(server) });
    await page.waitForTimeout(400);
    await rec.snap(page, label + ':home'); await cd(page, label + ':home');
    await page.evaluate(() => document.querySelectorAll('#home .mode')[0].click()); await page.waitForTimeout(200);
    await rec.snap(page, label + ':prep'); await cd(page, label + ':prep');
    // back on screen after a while: the server is asked again
    page.__head.date = Date.parse(server) + 7 * 864e5;
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await page.waitForTimeout(300);
    await page.evaluate(() => __T.click('.back')); await page.waitForTimeout(200);
    await rec.snap(page, label + ':week-later'); await cd(page, label + ':week-later');
    await page.context().close();
  }
  rec.save();
};

// The captcha before Ukas prepp: the distorted text the week from 21 October 10:00, the checkbox
// the week from 28 October, and nothing from 4 November; each asked once, also for a link straight
// to #prep, and only the second for whoever skipped the first week
tests.captcha = async () => {
  const rec = new Rec('captcha');
  const state = p => p.evaluate(() => { const d = document.getElementById('captchaSheet'); return (d.open ? 'captcha:' + d.dataset.kind : 'open') + ' ' + document.body.dataset.mode + ' ' + location.hash; });
  for (const [label, at, storage] of [['before', '2026-10-21T07:59:00Z', {}], ['week1', '2026-10-21T08:01:00Z', {}],
    ['week1-solved', '2026-10-27T10:00:00Z', { captcha: 'text' }], ['week2', '2026-10-28T09:01:00Z', { captcha: 'text' }],
    ['week2-skipped-first', '2026-10-28T09:01:00Z', {}], ['week2-solved', '2026-11-03T10:00:00Z', { captcha: 'robot' }], ['after', '2026-11-04T09:01:00Z', {}]]) {
    const p = await newPage('captcha', { deviceNow: Date.parse(at), storage });
    await p.evaluate(() => document.querySelector('#home .mode').click()); await p.waitForTimeout(100);
    rec.rows.push({ label: label + ':state', text: await state(p) });
    await p.context().close();
  }
  // The checkbox: tick it, and the prep opens; not asked again, also after a reload
  {
    const p = await newPage('captcha', { deviceNow: Date.parse('2026-10-29T10:00:00Z') });
    await p.evaluate(() => document.querySelector('#home .mode').click()); await p.waitForTimeout(100);
    await rec.snap(p, 'robot:sheet', true); await rec.shoot(p, 'robot');
    await p.click('#capCheck'); await p.waitForTimeout(300); await rec.snap(p, 'robot:spinning', true);
    await p.waitForTimeout(2000); await rec.snap(p, 'robot:passed', true);
    await p.goto(BASE + '#prep'); await p.waitForTimeout(150);
    rec.rows.push({ label: 'robot:reloaded', text: await state(p) });
    await p.context().close();
  }
  // The text, from a link straight to #prep, in nynorsk: cancel, a wrong answer, then the right one
  {
    const p = await newPage('captcha', { deviceNow: Date.parse('2026-10-22T10:00:00Z'), url: BASE + '#prep', storage: { lang: 'nn' } });
    await rec.snap(p, 'text:sheet', true); await rec.shoot(p, 'text');
    await p.mouse.click(5, 5); await p.waitForTimeout(100);
    rec.rows.push({ label: 'text:cancelled', text: await state(p) });
    await p.evaluate(() => document.querySelector('#home .mode').click()); await p.waitForTimeout(100);
    await p.fill('#capInput', 'kokekult'); await p.keyboard.press('Enter'); await p.waitForTimeout(100);
    await rec.snap(p, 'text:wrong', true);
    await p.fill('#capInput', ' KokkeKult'); await p.click('#capVerify'); await p.waitForTimeout(200);
    await rec.snap(p, 'text:passed', true);
    await p.evaluate(() => __T.click('.back')); await p.waitForTimeout(200);
    rec.rows.push({ label: 'text:home', text: await state(p) });
    await p.context().close();
  }
  rec.save();
};

for (const [name, fn] of Object.entries(tests)) {
  if (only && !name.startsWith(only)) continue;
  const t = Date.now();
  try { await fn(); } catch (e) { errors.push({ test: name, type: 'harness', text: String(e.stack || e) }); }
  console.log(name.padEnd(24), ((Date.now() - t) / 1000).toFixed(1) + 's');
}
fs.writeFileSync(path.join(out, 'errors.json'), JSON.stringify(errors, null, 1));
console.log('errors:', errors.length);
await browser.close(); server.close();
