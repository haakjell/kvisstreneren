// Compares two runs of run.mjs (see CLAUDE.md, «Regresjonstest»).
//   node tools/regression/compare.mjs <outA> <outB> [--text] [--noshots] [--max N]
// Default: the markup (whitespace aside) must match too; --text: only the visible text, focus, url
// and storage. Screenshots may differ by anti-aliasing (max 8 per pixel); pixdiff.py needs Pillow.
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
const args = process.argv.slice(2);
const [A, B] = args.filter(a => !a.startsWith('--') && !/^\d+$/.test(a));
const textOnly = args.includes('--text'), noShots = args.includes('--noshots');
const max = +(args[args.indexOf('--max') + 1]) || 8;
const files = fs.readdirSync(A).filter(f => f.endsWith('.json') && f !== 'errors.json');
let noise = 0, bad = 0, rows = 0, shots = 0, shotBad = 0;
const firstDiff = (x, y) => { let i = 0; while (i < x.length && x[i] === y[i]) i++; return i; };
const ctx = (s, i) => JSON.stringify(s.slice(Math.max(0, i - 120), i + 200));
for (const f of files) {
  if (!fs.existsSync(path.join(B, f))) { console.log('MISSING in B:', f); bad++; continue; }
  const a = JSON.parse(fs.readFileSync(path.join(A, f))), b = JSON.parse(fs.readFileSync(path.join(B, f)));
  let shown = 0;
  if (a.length !== b.length) { console.log(`${f}: ${a.length} vs ${b.length} rows`); bad++; }
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const x = a[i], y = b[i]; rows++;
    const probs = [];
    if (x.label !== y.label) probs.push(`label ${x.label} ≠ ${y.label}`);
    if (x.shot) {
      if (noShots) continue;
      shots++;
      const p = fs.readFileSync(path.join(A, 'shots', x.shot)), q = y.shot && fs.readFileSync(path.join(B, 'shots', y.shot));
      if (!q || !p.equals(q)) { const why = q ? execFileSync('python3', ['-W', 'ignore', new URL('pixdiff.py', import.meta.url).pathname, path.join(A, 'shots', x.shot), path.join(B, 'shots', y.shot)]).toString().trim() : 'missing'; const mx = +((why.match(/^max (\d+)/) || [])[1] ?? 999); if (mx > 8) { probs.push('screenshot differs: ' + x.shot + ' (' + why + ')'); shotBad++; } else noise++; }
    } else {
      for (const k of ['text', 'url', 'mode', 'bodyCls', 'wrapCls', 'focus', 'ls']) if (x[k] !== y[k]) {
        const j = firstDiff(x[k] || '', y[k] || ''); probs.push(`${k}: A ${ctx(x[k] || '', j)}\n         B ${ctx(y[k] || '', j)}`);
      }
      if (!textOnly && x.h !== y.h) {
        const ws = s => s.replace(/\s+/g, ' ');
        const p = ws(fs.readFileSync(path.join(A, 'html', x.h + '.html'), 'utf8')), q = ws(fs.readFileSync(path.join(B, 'html', y.h + '.html'), 'utf8'));
        if (p !== q) { const j = firstDiff(p, q); probs.push(`html @${j}: A ${ctx(p, j)}\n         B ${ctx(q, j)}`); }
      }
    }
    if (probs.length) { bad++; if (shown++ < max) console.log(`${f} #${i} ${x.label}\n  ${probs.join('\n  ')}`); }
  }
}
const ea = JSON.parse(fs.readFileSync(path.join(A, 'errors.json'))), eb = JSON.parse(fs.readFileSync(path.join(B, 'errors.json')));
const norm = e => e.map(x => x.test + ' ' + x.type + ' ' + x.text.split('\n')[0].replace(/127\.0\.0\.1:\d+/g, 'HOST'));
const na = norm(ea), nb = norm(eb);
const onlyB = nb.filter(x => !na.includes(x)), onlyA = na.filter(x => !nb.includes(x));
console.log(`\nscreenshots with only anti-aliasing noise (max ≤ 8): ${noise}`); console.log(`rows ${rows}, differing ${bad}; screenshots ${shots}, differing ${shotBad}`);
console.log(`errors A ${ea.length}, B ${eb.length}`); onlyB.forEach(x => console.log('  new in B:', x)); onlyA.forEach(x => console.log('  gone in B:', x));
process.exit(bad || onlyB.length ? 1 : 0);
