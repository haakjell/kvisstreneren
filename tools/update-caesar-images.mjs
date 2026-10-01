#!/usr/bin/env node
// Rebuilds the character pictures for Hotel Cæsar (const CAESAR_IMG) in index.html.
//
//   node tools/update-caesar-images.mjs
//
// For every role in CAESAR, looks up the character's article on the Hotel Cæsar wiki
// (hotelcaesar.fandom.com), takes the picture in the infobox («bilde=») and stores a link to a
// thumbnail of it. The page loads the pictures straight from Fandom's CDN; nothing is
// downloaded into the repo. Fandom refuses requests with a foreign Referer, so the page loads
// them with referrerpolicy="no-referrer". Run from anywhere; see CLAUDE.md.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://hotelcaesar.fandom.com/api.php';
const WIDTH = 320; // thumbnail width; smaller originals are used as they are

// Roles whose wiki article has a different name than the role in CAESAR
const TITLES = {
  'Åge Nygård': 'Åge Nygaard',
  'Henning Nygård': 'Henning Nygaard',
  'Mercedes Gonzales Nygård': 'Mercedes Gonzales Nygaard',
  'Hugo Anker-Hansen': 'Hugo Anker-Hansen jr.',
  'Nadia Selam-Tefari': 'Nadia Selam Tefari',
};
// Roles where the infobox picture is too small or unclear; a picture from the article's gallery instead
const FILES = {
  'Knut Arne Olsen': 'Knut Arne, sesong 5.jpg',
};

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const page = resolve(root, 'index.html');
const die = msg => { console.error('update-caesar-images: ' + msg); process.exit(1); };

const html = readFileSync(page, 'utf8');
const src = html.match(/^const CAESAR=(\[[\s\S]*?\n\]);$/m);
if (!src) die('fant ikke «const CAESAR=[…];» i index.html.');
const roles = new Function('return ' + src[1])().map(e => e.r);

async function api(params) {
  const url = API + '?' + new URLSearchParams({ format: 'json', formatversion: '2', ...params });
  const res = await fetch(url);
  if (!res.ok) die(`${res.status} fra ${url}`);
  return res.json();
}
const chunks = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));

// ---------- role → infobox file name ----------
const file = {};
const title = r => TITLES[r] || r;
for (const batch of chunks(roles.filter(r => !FILES[r]), 50)) {
  const j = await api({ action: 'query', redirects: '1', prop: 'revisions|pageimages', rvprop: 'content',
    rvslots: 'main', piprop: 'name', titles: batch.map(title).join('|') });
  // Follow normalisation and redirects back to the title we asked for
  const back = {};
  for (const n of [...(j.query.normalized || []), ...(j.query.redirects || [])]) back[n.to] = back[n.from] || n.from;
  for (const p of j.query.pages) {
    const asked = back[p.title] || p.title;
    const r = batch.find(r => title(r) === asked);
    if (!r || p.missing) continue;
    const text = p.revisions?.[0]?.slots?.main?.content || '';
    const m = text.match(/\|\s*bilde\s*=\s*\[\[\s*(?:Fil|File|Bilde|Image)\s*:\s*([^|\]]+)/i);
    file[r] = m ? m[1].trim() : p.pageimage;
  }
}
Object.assign(file, FILES);

// ---------- file name → thumbnail ----------
const img = {};
const files = [...new Set(Object.values(file).filter(Boolean))];
for (const batch of chunks(files, 50)) {
  const j = await api({ action: 'query', prop: 'imageinfo', iiprop: 'url', iiurlwidth: String(WIDTH),
    titles: batch.map(f => 'Fil:' + f).join('|') });
  const back = {};
  for (const n of j.query.normalized || []) back[n.to] = n.from;
  for (const p of j.query.pages) {
    const ii = p.imageinfo?.[0];
    if (ii) img[(back[p.title] || p.title).replace(/^Fil:/, '')] = ii.thumburl || ii.url;
  }
}

const out = {};
for (const r of roles) {
  const f = file[r];
  if (f && img[f]) out[r] = img[f];
}
const missing = roles.filter(r => !out[r]);

const marker = /^const CAESAR_IMG=.*;$/m;
if (!marker.test(html)) die('fant ikke linja «const CAESAR_IMG=…;» i index.html.');
writeFileSync(page, html.replace(marker, () => 'const CAESAR_IMG=' + JSON.stringify(out) + ';'));
console.log(`update-caesar-images: bilder av ${Object.keys(out).length} av ${roles.length} rollefigurer lagt inn i index.html.`);
if (missing.length) console.log('Uten bilde: ' + missing.join(', ') + '. Legg til artikkelnavnet i TITLES eller et bilde i FILES.');
