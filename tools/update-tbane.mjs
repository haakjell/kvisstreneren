#!/usr/bin/env node
// Rebuilds the T-bane map data (const TBANE) in index.html from Entur's journey planner,
// which is where Ruter publishes its routes.
//
//   node tools/update-tbane.mjs            fetch from Entur and update index.html
//   node tools/update-tbane.mjs lines.json use a saved API response instead of fetching
//
// Per line it keeps the longest stopping pattern in each direction (so one-sided stops
// like Gulleråsen come out right), and the track geometry between stations. Coordinates
// are projected and run through a fisheye around Stortinget so the city centre gets room.
// Run from anywhere; see CLAUDE.md.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const page = resolve(root, 'index.html');
const die = msg => { console.error('update-tbane: ' + msg); process.exit(1); };

const QUERY = `{ lines(transportModes:[metro], authorities:["RUT:Authority:RUT"]) {
  publicCode name
  journeyPatterns { directionType pointsOnLink { points }
    quays { stopPlace { id name latitude longitude } } } } }`;

let data;
const src = process.argv[2];
if (src) data = JSON.parse(readFileSync(resolve(process.cwd(), src), 'utf8'));
else {
  const res = await fetch('https://api.entur.io/journey-planner/v3/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'ET-Client-Name': 'kvisstreneren-update-tbane' },
    body: JSON.stringify({ query: QUERY })
  });
  if (!res.ok) die('Entur svarte ' + res.status);
  data = await res.json();
}
const apiLines = data?.data?.lines;
if (!apiLines?.length) die('fant ingen T-banelinjer i svaret.');

// ---- projection: metres around Stortinget, then fisheye, then scaled to ~1000 wide ----
const LAT0 = 59.9127, LON0 = 10.7406, KX = 111320 * Math.cos(LAT0 * Math.PI / 180), KY = 110540;
const FISH_R = 2500, FISH_P = 0.7;           // r -> R*(r/R)^p: stretches the centre, squeezes the ends
const SCALE = 0.11;
function project(lat, lon) {
  const mx = (lon - LON0) * KX, my = -(lat - LAT0) * KY, r = Math.hypot(mx, my);
  if (!r) return [0, 0];
  const f = FISH_R * Math.pow(r / FISH_R, FISH_P) / r;
  return [mx * f * SCALE, my * f * SCALE];
}

function decodePolyline(str) {
  const out = []; let i = 0, lat = 0, lon = 0;
  while (i < str.length) {
    for (const k of [0, 1]) {
      let shift = 0, result = 0, b;
      do { b = str.charCodeAt(i++) - 63; result |= (b & 31) << shift; shift += 5; } while (b >= 32);
      const d = result & 1 ? ~(result >> 1) : result >> 1;
      if (k === 0) lat += d; else lon += d;
    }
    out.push([lat / 1e5, lon / 1e5]);
  }
  return out;
}

function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
  let best = -1, bi = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(dy * (pts[i][0] - a[0]) - dx * (pts[i][1] - a[1])) / len;
    if (d > best) { best = d; bi = i; }
  }
  if (best <= tol) return [a, b];
  return simplify(pts.slice(0, bi + 1), tol).slice(0, -1).concat(simplify(pts.slice(bi), tol));
}

// ---- stations, sequences and edges ----
const stations = [], stIndex = new Map();
const stationOf = sp => {
  if (!stIndex.has(sp.id)) { stIndex.set(sp.id, stations.length); stations.push({ name: sp.name, lat: sp.latitude, lon: sp.longitude }); }
  return stIndex.get(sp.id);
};

const lines = {}, edges = new Map();
for (const l of apiLines.sort((a, b) => a.publicCode.localeCompare(b.publicCode))) {
  const [endA, endB] = l.name.split(/\s+-\s+/);
  const full = l.journeyPatterns.filter(jp => {
    const q = jp.quays; const f = q[0].stopPlace.name, t = q[q.length - 1].stopPlace.name;
    return (f === endA && t === endB) || (f === endB && t === endA);
  });
  const pick = to => full.filter(jp => jp.quays[jp.quays.length - 1].stopPlace.name === to)
    .sort((a, b) => b.quays.length - a.quays.length)[0];
  const toB = pick(endB), toA = pick(endA);
  if (!toB || !toA) die(`linje ${l.publicCode}: fant ikke hele ruta i begge retninger.`);
  const seqs = [toB, toA].map(jp => jp.quays.map(q => stationOf(q.stopPlace)));
  lines[l.publicCode] = seqs;

  // Draw from the direction with more stops; geometry split at each station.
  const drawJp = toB.quays.length >= toA.quays.length ? toB : toA;
  const seq = drawJp.quays.map(q => stationOf(q.stopPlace));
  const pts = decodePolyline(drawJp.pointsOnLink.points);
  const dist = (p, s) => Math.hypot((p[1] - s.lon) * KX, (p[0] - s.lat) * KY);
  let cut = [0];
  for (let k = 1; k < seq.length; k++) {
    const s = stations[seq[k]], from = cut[k - 1];
    // Nearest point ahead, but stop looking once we're well past it (the ring revisits stations).
    let best = Infinity, bi = from;
    for (let i = from; i < pts.length; i++) {
      const d = dist(pts[i], s);
      if (d < best) { best = d; bi = i; }
      else if (d > best + 1500) break;
    }
    cut.push(bi);
  }
  for (let k = 0; k + 1 < seq.length; k++) {
    const a = seq[k], b = seq[k + 1], key = a < b ? a + '|' + b : b + '|' + a;
    if (!edges.has(key)) {
      const sa = stations[a], sb = stations[b];
      const raw = [[sa.lat, sa.lon], ...pts.slice(cut[k] + 1, cut[k + 1]), [sb.lat, sb.lon]];
      edges.set(key, { a, b, lines: new Set(), pts: simplify(raw.map(p => project(p[0], p[1])), 0.5) });
    }
    edges.get(key).lines.add(l.publicCode);
  }
}

// ---- normalise to a compact, positive coordinate space ----
const proj = stations.map(s => project(s.lat, s.lon));
const all = proj.concat([...edges.values()].flatMap(e => e.pts));
const minX = Math.min(...all.map(p => p[0])), minY = Math.min(...all.map(p => p[1]));
const PAD = 40, r1 = v => Math.round(v * 10) / 10;
const fx = x => r1(x - minX + PAD), fy = y => r1(y - minY + PAD);
const W = Math.ceil(Math.max(...all.map(p => fx(p[0]))) + PAD), H = Math.ceil(Math.max(...all.map(p => fy(p[1]))) + PAD);

const out = {
  w: W, h: H,
  st: stations.map((s, i) => [s.name, fx(proj[i][0]), fy(proj[i][1])]),
  lines,
  edges: [...edges.values()].map(e => [e.a, e.b, [...e.lines].join(''), e.pts.slice(1, -1).flatMap(p => [fx(p[0]), fy(p[1])])])
};

const html = readFileSync(page, 'utf8');
const marker = /^const TBANE=.*;$/m;
if (!marker.test(html)) die('fant ikke linja «const TBANE=…;» i index.html.');
const updated = html.replace(marker, () => 'const TBANE=' + JSON.stringify(out) + ';');
if (updated === html) { console.log('update-tbane: ingen endringer.'); process.exit(0); }
writeFileSync(page, updated);
console.log(`update-tbane: ${stations.length} stasjoner, ${Object.keys(lines).length} linjer, ${edges.size} strekninger.`);
