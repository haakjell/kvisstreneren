// ---------- Ukas kvissprep ----------
// The report itself lives in the #prepSource block up in the markup, so it survives
// pasting verbatim — backticks and all; its nynorsk version in #prepSourceNn. See CLAUDE.md for
// the weekly routine.
function prepInline(t){
  t = t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const parked = [];
  const park = html => { parked.push(html); return '\u0000' + (parked.length-1) + '\u0000'; };
  const link = (url,text) => '<a href="'+url+'" target="_blank" rel="noopener">'+text+'</a>';
  t = t.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, (m,text,url) => park(link(url,text)));
  t = t.replace(/https?:\/\/[^\s<]+/g, url => {
    const tail = url.match(/[.,;:)]+$/);
    if(tail) url = url.slice(0, -tail[0].length);
    return park(link(url,url)) + (tail ? tail[0] : '');
  });
  t = t.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  t = t.replace(/`([^`]+)`/g,'<code>$1</code>');
  return t.replace(/\u0000(\d+)\u0000/g, (m,i) => parked[+i]);
}
function prepMarkdown(md){
  const out = []; let inList = false;
  const closeList = () => { if(inList){ out.push('</ul>'); inList = false; } };
  md.split(/\r?\n/).forEach(raw => {
    const line = raw.trim(); let m;
    if(!line){ closeList(); return; }
    if(m = line.match(/^(#{1,4})\s+(.*)$/)){ closeList(); const n = m[1].length; out.push('<h'+n+'>'+prepInline(m[2])+'</h'+n+'>'); return; }
    if(/^([-*_])\1{2,}$/.test(line)){ closeList(); out.push('<hr>'); return; }
    if(m = line.match(/^[-*]\s+(.*)$/)){ if(!inList){ out.push('<ul>'); inList = true; } out.push('<li>'+prepInline(m[1])+'</li>'); return; }
    closeList(); out.push('<p>'+prepInline(line)+'</p>');
  });
  closeList();
  return out.join('');
}
// Reads the quiz date out of text like "onsdag 7. oktober 2026", as 'YYYY-MM-DD'; null if there is none.
function prepDate(t){
  const m = (t||'').toLowerCase().match(/(\d{1,2})\.\s*([a-zæøå]+)\s+(\d{4})/);
  const mon = m ? MONTHS.indexOf(m[2]) : -1;
  return mon < 0 ? null : new Date(Date.UTC(+m[3], mon, +m[1])).toISOString().slice(0,10);
}
// The ISO week number of a 'YYYY-MM-DD' date
function prepWeek(ymd){
  const d = new Date(ymd); d.setUTCDate(d.getUTCDate() + 3 - (d.getUTCDay() + 6) % 7);   // the Thursday of its week
  return Math.ceil(((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
}
// The same report as a newspaper, «Kvissposten» (with a long s in the last one, «Kvisspoſten», as in
// the old Norwegian mastheads; the masthead is PAPER_LOGO), as pages. The first ## part (the news) is
// split in two: the front page has the masthead from the # title and the first half, with the first
// article as the lead story across the page, and page 2 the rest. Each of the other parts (the name
// days, then «på denne dagen» on the back page) gets a page of its own. The inner pages have a running
// head. The ### articles are set in columns; a part without any (a plain list) is one column. All this
// follows from the report's headings, so quizprep's report goes in as it is. uke is the quiz date
// written out («onsdag 25. november 2026»), as in data-uke.
function prepPaperPages(md, uke){
  const lines = md.split(/\r?\n/), title = (lines[0].match(/^#\s+(.*)$/) || [])[1] || '';
  const body = (title ? lines.slice(1) : lines).join('\n');
  const parts = body.split(/^##(?!#)\s*/m), front = parts.shift();
  const day = prepDate(uke) || prepDate(title);
  const date = uke || title.split(/[:—]/).pop().trim();   // the first reports had «Quizprep — onsdag …»
  const Date1 = prepInline(date.charAt(0).toUpperCase() + date.slice(1));
  const md2 = t => prepMarkdown(t).replace(/<li><strong>(Kilde|Kjelde):<\/strong>/g, '<li class="src"><strong>$1:</strong>');
  const art = (a, lead) => { const [h, ...b] = a.split('\n');
    return '<article class="' + (lead ? 'lead' : 'art') + '"><h3>' + prepInline(h.replace(/^\d+\.\s*/, '')) + '</h3>' + md2(b.join('\n')) + '</article>'; };
  const section = (head, intro, arts, lead) => '<section><h2>' + head + '</h2>' + (lead ? art(lead, true) : '')
    + (arts.length ? '<div class="cols">' + md2(intro) + arts.map(a => art(a)).join('') + '</div>' : '<div class="one">' + md2(intro) + '</div>') + '</section>';
  const secs = parts.map(part => {
    const [head, ...rest] = part.split('\n'), arts = rest.join('\n').split(/^###\s*/m);
    return {head: prepInline(head.replace(/^Del\s+\d+\s*[:—–]\s*/i, '')), intro: arts.shift(), arts};
  });
  const week = day ? prepWeek(day) : null, year = day ? +day.slice(0, 4) : null;
  const mast = '<header class="mast"><div class="meta"><span>' + (week ? 'Nr. ' + week + ' · ' + `${year - 2025}. årgang` : '') + '</span><span>'
    + L('Løssalg kr 0,–', 'Laussal kr 0,–') + '</span></div><div class="name">' + PAPER_LOGO + '</div>'
    + '<div class="tag">' + L('Uavhengig, upartisk og helt uten fasit', 'Uavhengig, upartisk og heilt utan fasit') + '</div>'
    + '<div class="date"><span>' + Date1 + '</span>'
    + (week ? '<span>' + L(`Uke ${week}`, `Veke ${week}`) + '</span>' : '') + '</div></header>';
  const pages = [mast + (front.trim() ? '<div class="ear">' + md2(front) + '</div>' : '')];
  const inner = html => pages.push('<header class="runhead"><span class="mini">' + PAPER_LOGO + '</span><span class="rdate">' + Date1
    + '</span><span>' + `Side ${pages.length + 1}` + '</span></header>' + html);
  const news = secs.shift();
  if(news){
    const arts = news.arts.slice(), lead = arts.length > 1 ? arts.shift() : null;
    const half = Math.max(0, Math.ceil((arts.length + (lead ? 1 : 0)) / 2) - (lead ? 1 : 0));
    pages[0] += section(news.head, news.intro, arts.slice(0, half), lead);
    if(arts.length > half) inner(section(L(`${news.head}, forts.`, `${news.head}, framh.`), '', arts.slice(half)));
  }
  secs.forEach(sec => inner(section(sec.head, sec.intro, sec.arts)));
  // An ad at the foot of the back page, like a real newspaper (only shown with ads on; see fillAds())
  if(pages.length > 1) pages[pages.length - 1] += '<div class="adslot ad-all" data-fmt="box"></div>';
  return pages;
}
// The newspaper turns its pages. Each leaf is a sheet with a page on each side, turned about the
// spine with a 3D rotation. With room for two pages side by side (ppSpread), it is a real newspaper:
// the front page alone, then opened out to pages 2 and 3, and so on; on a phone, one page at a time,
// and a leaf turned away leaves the next page under it. ppView is how many leaves are turned.
let ppPages = [], ppSpread = false, ppView = 0, ppTimer = 0;
// A page may grow after it is shown (an ad comes in), and the book with it
const ppFit = new ResizeObserver(() => { if($('ppBook').children.length) $('ppBook').style.height = ppHeight() + 'px'; });
const PP_TURN = 900;   // ms; as .leaf's transition in modes.css
const ppLeaves = () => [...$('ppBook').children];
const ppMax = () => ppSpread ? Math.floor(ppPages.length / 2) : ppPages.length - 1;
function ppBuild(){
  const n = ppPages.length;
  // The folded corners a page is turned by, top and bottom: on the outer edge of a page in a spread
  // (forward on the right page, back on the left one); on a phone, forward on the right and back on
  // the left of the one page
  const curl = (dir, corner) => '<button type="button" class="curl ' + corner + '" data-dir="' + dir + '" aria-label="'
    + (dir > 0 ? 'Bla om' : 'Bla tilbake') + '"></button>';   // the same in nynorsk
  const curls = (i, side) => (side === 'recto' && i < n - 1 ? curl(1, 'tr') + curl(1, 'br') : '')
    + ((ppSpread ? side === 'verso' : side === 'recto') && i > 0 ? curl(-1, 'tl') + curl(-1, 'bl') : '');
  const face = (i, side) => '<div class="face ' + side + '">' + (i >= 0 && i < n
    ? '<div class="pg">' + ppPages[i] + '</div>' + curls(i, side) : '<div class="pg blank"></div>') + '</div>';
  const leaves = [];
  for(let i = 0; i < (ppSpread ? Math.ceil(n / 2) : n); i++)
    leaves.push('<div class="leaf">' + face(ppSpread ? 2 * i : i, 'recto') + face(ppSpread ? 2 * i + 1 : -1, 'verso') + '</div>');
  ppFit.disconnect();
  $('ppBook').innerHTML = leaves.join('');
  $('ppBook').querySelectorAll('.pg').forEach(pg => ppFit.observe(pg));
  $('ppBook').classList.toggle('spread', ppSpread);
  if(adsOn()) fillAds();   // the ad slot on the last page is new
  ppShow(Math.min(ppView, ppMax()), false);
}
// The faces in view: the back (verso) of the last leaf turned, on the left, and the front (recto) of
// the next one
function ppFaces(v){
  const lv = ppLeaves(), out = [];
  if(ppSpread && v > 0) out.push(lv[v - 1].querySelector('.verso'));
  if(lv[v]) out.push(lv[v].querySelector('.recto'));
  return out;
}
// Every page is as tall as the longest one, as in a real newspaper
const ppHeight = () => Math.max(0, ...[...$('ppBook').querySelectorAll('.pg')].map(pg => pg.offsetHeight));
function ppShow(v, animate){
  const book = $('ppBook'), lv = ppLeaves(), from = ppView, moving = Math.min(from, v);
  ppView = v;
  clearTimeout(ppTimer); ppTimer = 0;
  book.classList.toggle('still', !animate);
  const stack = () => lv.forEach((leaf, i) => { leaf.style.zIndex = i < ppView ? i + 1 : lv.length * 2 - i; });
  stack();
  lv.forEach((leaf, i) => leaf.classList.toggle('turned', i < v));
  lv.forEach(leaf => leaf.classList.remove('moving'));
  if(animate){ lv[moving].style.zIndex = 999; lv[moving].classList.add('moving'); }   // the leaf in motion goes over the others
  lv.forEach(leaf => leaf.querySelectorAll('.face').forEach(f => { f.inert = true; }));
  ppFaces(v).forEach(f => { f.inert = false; });
  // Closed, the front page sits in the middle; with only a left page at the end, so does that
  book.style.setProperty('--shift', !ppSpread ? '0%' : v === 0 ? '-25%' : !lv[v] ? '25%' : '0%');
  book.style.height = ppHeight() + 'px';
  if(animate) ppTimer = setTimeout(() => { ppTimer = 0; stack(); lv[moving].classList.remove('moving'); }, PP_TURN);
}
function ppTurn(d){
  const v = Math.max(0, Math.min(ppMax(), ppView + d));
  if(v === ppView) return;
  ppShow(v, true);
  const top = $('prepPaper').getBoundingClientRect().top;
  if(top < 0) window.scrollBy({top: top - 12, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
}
// ---------- The issues and the shelf ----------
// Every prep is an issue of the newspaper. This week's is the report in the markup (#prepSource); the
// old ones are in data/prep-archive.js (written by set-prep.mjs from prep/), loaded the first time the
// shelf is needed. An issue is {d:'YYYY-MM-DD', md, uke:'onsdag 25. november 2026'}.
// The report in the language picked; the bokmål one if there is no nynorsk one
const prepSource=()=>((LANG==='nn'&&$('prepSourceNn').textContent.trim())||$('prepSource').textContent||'').trim();
const prepUke = d => { const t = new Date(d); return WEEKDAYS[t.getUTCDay()] + ' ' + t.getUTCDate() + '. ' + MONTHS[t.getUTCMonth()] + ' ' + t.getUTCFullYear(); };
const prepCur = (() => {
  const md = prepSource(); if(!md) return null;
  const uke = $('prepSource').dataset.uke, d = prepDate(uke) || prepDate(md.split('\n')[0]);
  return {d, md, uke: uke || (d ? prepUke(d) : '')};
})();
// The quiz of the issue for date d is over, Wednesday at QUIZ_END in Oslo, by the server's clock
const prepOver = d => { const now = serverNow(); return !!d && now >= osloAt(d + ' ' + QUIZ_END + ':00', now); };
let prepArchiveP = null;
function prepLoadArchive(){
  if(!prepArchiveP) prepArchiveP = new Promise(ok => {
    const s = document.createElement('script');
    s.src = 'data/prep-archive.js';   // a plain <script>, so it works from file:// too
    s.onload = () => ok(typeof PREP_ARCHIVE === 'undefined' ? [] : PREP_ARCHIVE);
    s.onerror = () => { prepArchiveP = null; s.remove(); ok(null); };   // offline: tried again next time
    document.body.append(s);
  });
  return prepArchiveP;
}
// All the issues, newest first: the old ones, and this week's from the markup
function prepIssues(arch){
  const list = (arch || []).map(x => ({d: x.d, md: (LANG === 'nn' && x.nn) || x.nb, uke: prepUke(x.d)}));
  if(prepCur && prepCur.d){ const i = list.findIndex(x => x.d === prepCur.d); if(i >= 0) list[i] = prepCur; else list.push(prepCur); }
  return list.sort((a, b) => a.d < b.d ? 1 : -1);
}
// Once the quiz is over (Wednesday at 22, in Oslo, by the server's clock), this week's report is last
// week's: the shelf says when the next one is due, and so does the button on the home page.
function prepStale(){
  if(!prepCur || !prepOver(prepCur.d)) return null;
  const t = Date.parse(osloDay(serverNow())), season = seasonState(serverNow());
  // The next Wednesday after the quiz day; between seasons the first of the new season, or not known yet (null)
  const from = Math.max(t, Date.parse(prepCur.d) + 864e5);
  const next = season === 'broken' ? null : new Date(season === 'waiting' ? Date.parse(SEASON_NEXT) : from + (QUIZ_DAY - new Date(from).getUTCDay() + 7) % 7 * 864e5);
  const fmt = d => (d.getUTCDay()===QUIZ_DAY ? 'onsdag ' : '') + d.getUTCDate() + '. ' + MONTHS[d.getUTCMonth()];
  return { next: next && fmt(next), isToday: !!next && +next === t };
}
// The headlines of an issue's news, as plain text, for its cover on the shelf
function prepHeadlines(md){
  const news = (md.split(/^##(?!#)/m)[1] || '');
  return [...news.matchAll(/^###\s+(.*)$/gm)].map(m => m[1].replace(/^\d+\.\s*/, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\*\*|`/g, ''));
}
const prepEsc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// The shelf: a cover for each issue, by season (autumn from August), newest first. With the newspaper
// off (prepView), the same list as plain cards (.plain, in modes.css).
let prepShelfN = 0;
async function prepRenderShelf(){
  const arch = await prepLoadArchive();
  const issues = prepIssues(arch);
  if(!issues.length){ if(prepOnShelf){ prepAuto = false; prepShowIssue(null); } return; }   // nothing at all: «kommer snart»
  if(prepShelfN === issues.length && arch) return;   // the same as last time
  prepShelfN = arch ? issues.length : 0;
  const seasons = [];
  issues.forEach(x => {
    const y = +x.d.slice(0, 4), autumn = +x.d.slice(5, 7) >= 8;
    const name = autumn ? L(`Høsten ${y}`, `Hausten ${y}`) : L(`Våren ${y}`, `Våren ${y}`);
    if(!seasons.length || seasons[seasons.length - 1].name !== name) seasons.push({name, issues: []});
    seasons[seasons.length - 1].issues.push(x);
  });
  const cover = x => {
    const h = prepHeadlines(x.md), Uke = x.uke.charAt(0).toUpperCase() + x.uke.slice(1);
    return '<li><button type="button" class="pcover" data-d="' + x.d + '" aria-label="' + prepEsc('Kvissposten, ' + x.uke + (h[0] ? ': ' + h[0] : '')) + '">'
      + '<span class="pcnew">' + L('Denne uka', 'Denne veka') + '</span>'
      + '<span class="pcmast" aria-hidden="true">' + PAPER_LOGO + '</span>'
      + '<span class="pcdate"><span>' + L(`Uke ${prepWeek(x.d)}`, `Veke ${prepWeek(x.d)}`) + '</span><span>' + prepEsc(x.d.slice(8, 10).replace(/^0/, '') + '. ' + MONTHS[+x.d.slice(5, 7) - 1]) + '</span></span>'
      + '<span class="pcplain">' + prepEsc(Uke) + '</span>'
      + (h[0] ? '<span class="pclead">' + prepEsc(h[0]) + '</span>' : '')
      + '<span class="pcmore">' + h.slice(1, 4).map(t => '<span>' + prepEsc(t) + '</span>').join('') + '</span>'
      + '</button></li>';
  };
  $('prepShelfList').innerHTML = seasons.map(s => '<h2 class="season">' + s.name + '</h2><ul class="pshelf">' + s.issues.map(cover).join('') + '</ul>').join('');
  renderPrep();   // marks this week's issue
}
$('prepShelfList').addEventListener('click', e => { const b = e.target.closest('.pcover'); if(b) prepOpen(b.dataset.d, true); });

// What the prep shows: the shelf (prepOnShelf), or one issue (prepIssue; null = «kommer snart»), as a
// newspaper or a plain page. prepAuto: the view was picked by the date, and nobody has moved since, so
// it may be picked again when the server's clock comes in. prepPushed: the issue was opened from the
// shelf, with its own history entry, so the back gesture goes back to the shelf.
let prepOnShelf = false, prepIssue = null, prepAuto = true, prepPushed = false;
const prepPaperWanted = () => store.get('prepView') !== 'plain';
function prepRenderIssue(x){
  let h2 = 0;   // an ad slot between each ## section (only shown with ads on; see fillAds())
  $('prepBody').innerHTML = x ? prepMarkdown(x.md).replace(/<h2>/g, m => h2++ ? '<div class="adslot ad-all" data-fmt="box"></div>' + m : m)
    : L('<div class="prepsoon"><strong>Ukas prepp kommer snart</strong><p>Her dukker ferske nyhetssaker, navnedagene for uka og «på denne dagen» opp så snart ukas quizprep er kjørt.</p></div>',
        '<div class="prepsoon"><strong>Vekas prepp kjem snart</strong><p>Her dukkar ferske nyheitssaker, namnedagane for veka og «på denne dagen» opp så snart vekas quizprep er køyrd.</p></div>');
  ppPages = x ? prepPaperPages(x.md, x.uke) : [];
  ppView = 0; ppWidth = 0; ppFit.disconnect(); $('ppBook').innerHTML = '';   // built when it gets a width (ppResize())
}
function prepLayout(){
  const want = prepPaperWanted(), paper = want && !prepOnShelf && !!prepIssue;
  $('prepShelf').hidden = !prepOnShelf;
  $('prepShelf').classList.toggle('plain', !want);
  $('prepShelfTitle').textContent = want ? 'Avishylla' : L('Alle preppene', 'Alle preppane');
  $('prepShelfSub').textContent = want ? L('Alle utgavene av Kvissposten', 'Alle utgåvene av Kvissposten') : L('Nyeste først', 'Nyaste først');
  $('prepBody').hidden = prepOnShelf || paper;
  $('prepPaper').hidden = !paper;
  document.body.classList.toggle('paperview', paper);   // wider on desktop (base.css)
  $('prepPaperBtn').hidden = !prepOnShelf && !prepIssue;
  $('prepPaperBtn').setAttribute('aria-checked', want);
  $('prepBack').textContent = prepOnShelf || !prepIssue ? L('← Alle kvisser', '← Alle kvissar') : want ? '← Avishylla' : L('← Alle preppene', '← Alle preppane');
  if(paper) requestAnimationFrame(ppResize);   // after goMode() has filled the ads, as the ResizeObserver would
}
// ads: new ads for the view (not when the mode is just being opened: goMode() fills them then)
function prepShowShelf(ads = true){
  prepOnShelf = true; prepPushed = false;
  prepLayout(); prepRenderShelf();
  if(ads && adsOn()) fillAds();
}
function prepShowIssue(x, ads = true){
  prepOnShelf = false;
  if(x !== prepIssue || !$('prepBody').innerHTML){ prepIssue = x; prepRenderIssue(x); }
  prepLayout();
  if(ads && adsOn()) fillAds();
}
// Opens the issue for date d: from the shelf (push: a history entry of its own), or from history
async function prepOpen(d, push){
  prepAuto = false;
  const x = prepCur && prepCur.d === d ? prepCur : prepIssues(await prepLoadArchive()).find(x => x.d === d);
  if(curMode !== 'prep') return;
  if(!x){ prepShowShelf(); return; }
  if(push) history.pushState({ppIssue: d}, '', location.href);
  prepPushed = true;
  prepShowIssue(x);
  window.scrollTo(0, 0);
}
// By the date: this week's issue until its quiz is over, then the shelf until set-prep.mjs puts in the next
const prepWantShelf = () => !prepCur || prepOver(prepCur.d);
function prepPick(ads){
  prepAuto = true; prepPushed = false;
  if(prepWantShelf()) prepShowShelf(ads); else prepShowIssue(prepCur, ads);
}
function prepOpenMode(){
  const d = history.state && history.state.ppIssue;   // a reload, or forward again, onto an issue
  if(d) prepOpen(d, false); else prepPick(false);
  renderPrep();
}
$('prepBack').addEventListener('click', () => {
  if(prepOnShelf || !prepIssue){ goHome(); return; }
  prepAuto = false;
  if(history.state && history.state.ppIssue) history.back(); else { prepShowShelf(); window.scrollTo(0, 0); }
});
addEventListener('popstate', () => {
  if(curMode !== 'prep' || hashMode() !== 'prep') return;
  const d = history.state && history.state.ppIssue;
  if(d) prepOpen(d, false); else if(prepPushed){ prepShowShelf(); window.scrollTo(0, 0); }
});
$('ppBook').addEventListener('click', e => { const c = e.target.closest('.curl'); if(c) ppTurn(+c.dataset.dir); });
document.addEventListener('keydown', e => {
  if(curMode !== 'prep' || $('prepPaper').hidden || e.target.closest('input,textarea,select,dialog')) return;
  if(e.key === 'ArrowRight') ppTurn(1); else if(e.key === 'ArrowLeft') ppTurn(-1);
});
// Two pages side by side when each gets at least 420 px. Built again only when that changes (or the
// issue does); any other change of width only changes the pages' heights.
let ppWidth = 0;
function ppResize(){
  const w = $('prepPaper').clientWidth;
  if(!w || w === ppWidth || !ppPages.length) return;
  ppWidth = w;
  const spread = w >= 840;
  if(!$('ppBook').children.length || spread !== ppSpread){
    const first = ppSpread && ppView ? 2 * ppView - 1 : ppView;   // keep the first page in view
    ppSpread = spread; ppView = spread ? Math.ceil(first / 2) : first; ppBuild();
  } else ppShow(ppView, false);
}
new ResizeObserver(ppResize).observe($('prepPaper'));
// «Avis»: the newspaper, or the plain page, top right; for the shelf too. The newspaper is the
// default; turning it off is remembered under prepView.
$('prepPaperBtn').addEventListener('click', () => {
  store.set('prepView', prepPaperWanted() ? 'plain' : null); prepLayout();
  if(adsOn()) fillAds();   // the ad slots of the view just hidden are left out
});
// What goes by the date: the notice on the shelf of when the next prep is due, this week's issue
// marked on it, the text on the prep's button, and the view itself if nobody has moved since it was picked
function renderPrep(){
  const stale = prepStale();
  $('prepStale').hidden = !!prepCur && !stale;
  if(!$('prepStale').hidden) $('prepStale').innerHTML = '<strong>' + (!prepCur ? L('Ukas prepp kommer snart','Vekas prepp kjem snart')
    : stale.isToday ? L('Ny prepp til i kveld kommer snart','Ny prepp til i kveld kjem snart')
    : !stale.next ? L('Ny prepp kommer når neste sesong begynner','Ny prepp kjem når neste sesong byrjar')
    : L(`Ny prepp kommer ${stale.next}`,`Ny prepp kjem ${stale.next}`)) + '</strong><p>' + L('Til da kan du lese de gamle her.','Til då kan du lese dei gamle her.') + '</p>';
  document.querySelectorAll('.pcover').forEach(b => b.classList.toggle('now', !!prepCur && !stale && b.dataset.d === prepCur.d));
  $('prepTeaser').textContent = !prepCur ? L('Kommer snart','Kjem snart')
    : stale ? (stale.isToday ? L('Ny prepp til i kveld kommer snart','Ny prepp til i kveld kjem snart') : !stale.next ? L('Ny prepp kommer neste sesong','Ny prepp kjem neste sesong') : L(`Ny prepp kommer ${stale.next}`,`Ny prepp kjem ${stale.next}`))
    : prepCur.uke ? 'Klar til ' + prepCur.uke : L('Nyheter, navnedager og datoen','Nyheiter, namnedagar og datoen');
  if(curMode === 'prep' && prepAuto && prepWantShelf() !== prepOnShelf) prepPick(true);
}
addMode('prep',prepOpenMode,{wide:true});
