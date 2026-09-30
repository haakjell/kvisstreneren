#!/usr/bin/env node
// Rebuilds the label positions for Ruter's schematic line map (const T_RUTER) in index.html.
//
//   node tools/update-ruter-map.mjs            download Ruter's PDF and update index.html
//   node tools/update-ruter-map.mjs map.pdf    use a saved copy of the PDF instead
//
// The page shows Ruter's own image of the map (IMAGE below) and needs to know where each
// station name sits on it, so the quiz can cover the names. The PDF has no text layer: every
// letter is an outline. So the outlines are grouped into words, identical outlines are taken
// to be the same letter, and the words are solved like a substitution cipher against the
// station names in TBANE. Needs pdftocairo (poppler-utils). Run from anywhere; see CLAUDE.md.
//
// When Ruter publishes a new map, copy the new links from PAGE («Linjekart for T-banen» and
// the picture «Oversikt over alle t-banelinjer») into PDF and IMAGE, and run this again.

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PAGE = 'https://ruter.no/planlegg-reise/rutetabeller-og-linjekart/t-bane';
const PDF = 'https://cdn.sanity.io/files/5a84xxkm/prod/e46cf566dd5b9cc4e323b70b168115d7bc3c911f.pdf';
const IMAGE = 'https://cdn.sanity.io/images/5a84xxkm/prod/9a9d6e9ae2f93879355052feb1800a371ea7d2c9-2480x2480.png';
const IMAGE_PX = 2480; // the image is the PDF page rendered at this width and height

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const page = resolve(root, 'index.html');
const die = msg => { console.error('update-ruter-map: ' + msg); process.exit(1); };

const html = readFileSync(page, 'utf8');
const tbane = html.match(/^const TBANE=(\{.*\});$/m);
if (!tbane) die('fant ikke linja «const TBANE=…;» i index.html.');
const names = JSON.parse(tbane[1]).st.map(s => s[0]);

// ---------- PDF → SVG outlines ----------
const tmp = mkdtempSync(join(tmpdir(), 'ruter-map-'));
let svg;
try {
  let pdf = process.argv[2] && resolve(process.cwd(), process.argv[2]);
  if (!pdf) {
    const res = await fetch(PDF);
    if (!res.ok) die(`fikk ${res.status} fra Ruter for PDF-en. Sjekk lenken på ${PAGE}.`);
    pdf = join(tmp, 'map.pdf');
    writeFileSync(pdf, Buffer.from(await res.arrayBuffer()));
  }
  try { execFileSync('pdftocairo', ['-svg', pdf, join(tmp, 'map.svg')]); }
  catch (e) { die('pdftocairo feilet (installer poppler-utils): ' + e.message); }
  svg = readFileSync(join(tmp, 'map.svg'), 'utf8');
} finally { rmSync(tmp, { recursive: true, force: true }); }
// pdftocairo draws the page into the artwork's clip box (594.55 pt on a 595.28 pt page), while
// Ruter's image is the whole page; scaling by the clip box lines the two up to the pixel.
const clip = svg.match(/<clipPath id="clip-0">\s*<path[^>]*d="M 0 0 L ([\d.]+) 0 /);
const side = +(clip || svg.match(/<svg[^>]*width="([\d.]+)"/) || [])[1];
if (!side) die('fant ikke sidestørrelsen i PDF-en.');

// Letters are filled near-black (station names) or mid-grey (English subtitles).
const glyphs = [];
for (const [, r, d] of svg.matchAll(/<path [^>]*fill="rgb\(([\d.]+)%[^"]*"[^>]*d="([^"]+)"/g)) {
  const red = +r;
  if (!(red < 12 || (red > 53 && red < 53.2))) continue;
  const n = d.match(/-?[\d.]+/g).map(Number), xs = n.filter((_, i) => i % 2 === 0), ys = n.filter((_, i) => i % 2);
  const g = { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys),
    sig: d.replace(/[^A-Z]/g, ''), rel: n.map((v, i) => v - n[i % 2]), grey: red > 50 };
  // Icons and arrows, not letters
  if (g.x1 - g.x0 > 12 || g.y1 - g.y0 > 12) continue;
  glyphs.push(g);
}

// Same outline (within rounding) = same letter at the same size and angle.
const shapes = [];
for (const g of glyphs) {
  let s = shapes.find(s => s.sig === g.sig && s.rel.length === g.rel.length && s.rel.every((v, i) => Math.abs(v - g.rel[i]) < 0.12));
  if (!s) shapes.push(s = { sig: g.sig, rel: g.rel, id: shapes.length });
  g.k = s.id;
}

// ---------- letters → words ----------
const h = g => g.y1 - g.y0;
function union(items, join) {
  const parent = items.map((_, i) => i), find = i => parent[i] === i ? i : (parent[i] = find(parent[i]));
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++)
    if (join(items[i], items[j])) parent[find(i)] = find(j);
  const groups = new Map();
  items.forEach((it, i) => { const r = find(i); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(it); });
  return [...groups.values()];
}
const between = (a, b) => [Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0), Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)];
const toWord = gs => {
  gs.sort((a, b) => (a.x0 + a.x1) - (b.x0 + b.x1));
  const hs = gs.map(h).sort((a, b) => a - b);
  return { gs, keys: gs.map(g => g.k), x0: Math.min(...gs.map(g => g.x0)), x1: Math.max(...gs.map(g => g.x1)),
    y0: Math.min(...gs.map(g => g.y0)), y1: Math.max(...gs.map(g => g.y1)), mid: hs[hs.length >> 1] };
};
let words = union(glyphs, (a, b) => {
  if (a.grey !== b.grey) return false;
  const [oy, ox] = between(a, b);
  // Side by side on a line, or overlapping boxes (letters on a slant)
  return (oy > 0.8 && -ox < Math.max(1.4, 0.3 * Math.max(h(a), h(b)))) || (oy > 0.3 && ox > 0.3);
}).map(toWord);
// Headings are set larger and more loosely than the station lists; join their pieces again.
const heading = w => w.mid > 6;
words = [...words.filter(w => !heading(w)), ...union(words.filter(heading), (a, b) => {
  const [oy, ox] = between(a, b);
  return oy > 3 && -ox < 5;
}).map(ws => ({ ...toWord(ws.flatMap(w => w.gs)), big: true }))];

// ---------- solve the cipher ----------
const EXTRA = 'T-bane Metro Ringen Sentrum City centre Oslo S bussterminal Gulleråsen: Stopp i pilretningen Stop in direction of arrow';
function solve(ws, vocab) {
  const dict = [...new Set(vocab)].map(s => [...s]), map = new Map(), out = new Map();
  const fits = (w, c) => {
    if (c.length !== w.keys.length) return false;
    const local = new Map();
    for (let i = 0; i < c.length; i++) {
      const k = w.keys[i], m = map.get(k) ?? local.get(k);
      if (m !== undefined && m !== c[i]) return false;
      local.set(k, c[i]);
    }
    return true;
  };
  for (let changed = true; changed;) {
    changed = false;
    for (const w of ws) {
      if (out.has(w)) continue;
      const cs = dict.filter(c => fits(w, c));
      if (cs.length !== 1) continue;
      out.set(w, cs[0].join('')); cs[0].forEach((ch, i) => map.set(w.keys[i], ch)); changed = true;
    }
  }
  return out;
}
const parts = names.flatMap(n => n.split(' '));
const small = solve(words.filter(w => !w.big), [...parts, ...EXTRA.split(' ')]);
const heads = solve(words.filter(w => w.big), [...names.filter(n => !n.includes(' ')), ...EXTRA.split(' ')]);

// ---------- words → rectangles in image pixels ----------
const k = IMAGE_PX / side, r1 = v => Math.round(v * 10) / 10;
function rect(w) {
  const c = w.gs.map(g => [(g.x0 + g.x1) / 2, (g.y0 + g.y1) / 2]), [f, l] = [c[0], c[c.length - 1]];
  // Ruter slants names at 45°; a descender alone can tilt the line between the end letters a little
  const slant = c.length > 1 && Math.abs(l[1] - f[1]) > 0.5 * Math.abs(l[0] - f[0]);
  const a = slant ? Math.round(Math.atan2(l[1] - f[1], l[0] - f[0]) / (Math.PI / 4)) * Math.PI / 4 : 0, u = [Math.cos(a), Math.sin(a)], n = [-u[1], u[0]];
  const pu = [], pn = [];
  for (const g of w.gs) for (const x of [g.x0, g.x1]) for (const y of [g.y0, g.y1]) { pu.push(x * u[0] + y * u[1]); pn.push(x * n[0] + y * n[1]); }
  let n0 = Math.min(...pn), n1 = Math.max(...pn);
  // Upright boxes around slanted letters are too fat; keep the height of a line of text
  if (slant) { const m = (n0 + n1) / 2, half = Math.min((n1 - n0) / 2, 3.7); n0 = m - half; n1 = m + half; }
  const u0 = Math.min(...pu), u1 = Math.max(...pu), cu = (u0 + u1) / 2, cn = (n0 + n1) / 2;
  const pad = 0.8;
  return [r1((cu * u[0] + cn * n[0]) * k), r1((cu * u[1] + cn * n[1]) * k), r1((u1 - u0 + 2 * pad) * k), r1((n1 - n0 + 2 * pad) * k), r1(a * 180 / Math.PI)];
}
const byName = (m, name) => [...m].filter(([, v]) => v === name).map(([w]) => w);
const dist = (a, b) => Math.hypot((a.gs[0].x0 - b.gs[0].x0), (a.gs[0].y0 - b.gs[0].y0));
const st = {}, missing = [];
for (const name of new Set(names)) {
  const ps = name.split(' '), first = byName(small, ps[0]);
  // A multi-word name is the words that sit close together, like «Carl Berners» over «plass»
  const pick = first.map(w0 => [w0, ...ps.slice(1).map(p => byName(small, p).sort((a, b) => dist(a, w0) - dist(b, w0))[0])])
    .find(ws => ws.every(w => w && dist(w, ws[0]) < 40));
  if (!pick || first.length > 1) { missing.push(name); continue; }
  st[name] = pick.map(rect);
}
if (missing.length) die('fant ikke navnet entydig på kartet: ' + missing.join(', ') + '. Er kartet endret?');
const hd = {};
for (const [w, name] of heads) if (names.includes(name)) (hd[name] ??= []).push(rect(w));

const out = { src: IMAGE + '?auto=format', page: PAGE, w: IMAGE_PX, h: IMAGE_PX, st, heads: hd };
const marker = /^const T_RUTER=.*;$/m;
if (!marker.test(html)) die('fant ikke linja «const T_RUTER=…;» i index.html.');
writeFileSync(page, html.replace(marker, () => 'const T_RUTER=' + JSON.stringify(out) + ';'));
console.log(`update-ruter-map: ${Object.keys(st).length} stasjoner og ${Object.keys(hd).length} endestasjonsoverskrifter lagt inn i index.html.`);
