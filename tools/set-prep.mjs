#!/usr/bin/env node
// Drops this week's quiz prep report into index.html, in bokmål and (optionally) nynorsk.
//
//   node tools/set-prep.mjs <report.md> ["onsdag 7. oktober 2026"] [--nn <report-nn.md>]
//   node tools/set-prep.mjs --clear
//
// The reports are written verbatim into the #prepSource and #prepSourceNn blocks; the page renders
// the one in the language picked at runtime (bokmål, if there is no nynorsk one). Run from the repo
// root. See CLAUDE.md.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const page = resolve(root, 'index.html');

const die = msg => { console.error('set-prep: ' + msg); process.exit(1); };

const args = process.argv.slice(2);
let nnArg = '';
const nnAt = args.indexOf('--nn');
if (nnAt >= 0) { nnArg = args[nnAt + 1] || die('--nn mangler fil.'); args.splice(nnAt, 2); }
const [arg, uke = ''] = args;
if (!arg) die('mangler argument. Bruk: node tools/set-prep.mjs <rapport.md> ["onsdag 7. oktober 2026"] [--nn <rapport-nn.md>]');
const clear = arg === '--clear';
if (clear && nnArg) die('--clear og --nn kan ikke brukes sammen.');

const read = file => {
  const text = readFileSync(resolve(process.cwd(), file), 'utf8').replace(/\r\n/g, '\n').trim();
  if (!text) die(file + ' er tom.');
  // A literal </script> inside the block would close it early.
  return text.replace(/<\/script/gi, '<\/script');
};
const report = clear ? '' : read(arg);
const reportNn = nnArg ? read(nnArg) : '';

let html = readFileSync(page, 'utf8');
const before = html;
const block = /(<script type="text\/markdown" id="prepSource" data-uke=")([^"]*)(">)([\s\S]*?)(<\/script>)/;
const blockNn = /(<script type="text\/markdown" id="prepSourceNn">)([\s\S]*?)(<\/script>)/;
if (!block.test(html)) die('fant ikke #prepSource i index.html — er blokken endret?');
if (!blockNn.test(html)) die('fant ikke #prepSourceNn i index.html — er blokken endret?');

const escapeAttr = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const body = text => text ? '\n' + text + '\n' : '';
html = html.replace(block, (m, open, oldUke, gt, oldBody, close) =>
  open + escapeAttr(clear ? '' : uke) + gt + body(report) + close);
html = html.replace(blockNn, (m, open, oldBody, close) => open + body(reportNn) + close);

if (html === before) die('ingen endring — rapporten er allerede inne?');
writeFileSync(page, html);

const lines = report ? report.split('\n').length : 0;
console.log(clear
  ? 'set-prep: tømt — sida viser «Ukas prepp kommer snart» igjen.'
  : `set-prep: la inn ${lines} linjer${uke ? ` for ${uke}` : ''}${reportNn ? `, og ${reportNn.split('\n').length} på nynorsk` : ', uten nynorsk (sida viser bokmål på nynorsk)'}. Åpne index.html og sjekk.`);
