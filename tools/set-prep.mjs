#!/usr/bin/env node
// Drops this week's quiz prep report into index.html.
//
//   node tools/set-prep.mjs <report.md> ["onsdag 7. oktober 2026"]
//   node tools/set-prep.mjs --clear
//
// The report is written verbatim into the #prepSource block; the page renders it
// at runtime. Run from the repo root. See CLAUDE.md.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const page = resolve(root, 'index.html');

const die = msg => { console.error('set-prep: ' + msg); process.exit(1); };

const [arg, uke = ''] = process.argv.slice(2);
if (!arg) die('mangler argument. Bruk: node tools/set-prep.mjs <rapport.md> ["onsdag 7. oktober 2026"]');

let report = '';
if (arg !== '--clear') {
  report = readFileSync(resolve(process.cwd(), arg), 'utf8').replace(/\r\n/g, '\n').trim();
  if (!report) die('rapporten er tom.');
  // A literal </script> inside the block would close it early.
  report = report.replace(/<\/script/gi, '<\/script');
}

const html = readFileSync(page, 'utf8');
const block = /(<script type="text\/markdown" id="prepSource" data-uke=")([^"]*)(">)([\s\S]*?)(<\/script>)/;
if (!block.test(html)) die('fant ikke #prepSource i index.html — er blokken endret?');

const escapeAttr = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const updated = html.replace(block, (m, open, oldUke, gt, oldBody, close) =>
  open + escapeAttr(arg === '--clear' ? '' : uke) + gt +
  (report ? '\n' + report + '\n' : '') + close);

if (updated === html) die('ingen endring — rapporten er allerede inne?');
writeFileSync(page, updated);

const lines = report ? report.split('\n').length : 0;
console.log(arg === '--clear'
  ? 'set-prep: tømt — sida viser «Ukas prep kommer snart» igjen.'
  : `set-prep: la inn ${lines} linjer${uke ? ` for ${uke}` : ''}. Åpne index.html og sjekk.`);
