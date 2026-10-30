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
// The same report as a newspaper, «Kvissposten»: a masthead from the # title, each ## part a
// section under a kicker, each ### an article, set in columns, and the first article of the first
// part as the lead story across the page. The markdown itself is rendered by prepMarkdown().
function prepPaper(md){
  const lines = md.split(/\r?\n/), title = (lines[0].match(/^#\s+(.*)$/) || [])[1] || '';
  const body = (title ? lines.slice(1) : lines).join('\n');
  const parts = body.split(/^##(?!#)\s*/m), front = parts.shift();
  const day = prepDate($('prepSource').dataset.uke) || prepDate(title);
  const date = (title.split(':').pop().trim() || $('prepSource').dataset.uke || '');
  const md2 = t => prepMarkdown(t).replace(/<li><strong>(Kilde|Kjelde):<\/strong>/g, '<li class="src"><strong>$1:</strong>');
  let ads = 0;
  const sections = parts.map((part, i) => {
    const [head, ...rest] = part.split('\n'), arts = rest.join('\n').split(/^###\s*/m), intro = arts.shift();
    const art = (a, lead) => { const [h, ...b] = a.split('\n');
      return '<article class="' + (lead ? 'lead' : 'art') + '"><h3>' + prepInline(h.replace(/^\d+\.\s*/, '')) + '</h3>' + md2(b.join('\n')) + '</article>'; };
    const lead = i === 0 && arts.length > 1 ? art(arts.shift(), true) : '';
    return (ads++ ? '<div class="adslot ad-all" data-fmt="box"></div>' : '')
      + '<section><h2>' + prepInline(head.replace(/^Del\s+\d+:\s*/i, '')) + '</h2>' + lead
      + '<div class="cols">' + md2(intro) + arts.map(a => art(a)).join('') + '</div></section>';
  });
  const week = day ? prepWeek(day) : null, year = day ? +day.slice(0, 4) : null;
  return '<header class="mast"><div class="meta"><span>' + (week ? 'Nr. ' + week + ' · ' + L(`${year - 2025}. årgang`, `${year - 2025}. årgang`) : '') + '</span><span>'
    + L('Løssalg kr 0,–', 'Laussal kr 0,–') + '</span></div><div class="name">Kvissposten</div>'
    + '<div class="tag">' + L('Uavhengig, upartisk og helt uten fasit', 'Uavhengig, upartisk og heilt utan fasit') + '</div>'
    + '<div class="date"><span>' + prepInline(date.charAt(0).toUpperCase() + date.slice(1)) + '</span>'
    + (week ? '<span>' + L(`Uke ${week}`, `Veke ${week}`) + '</span>' : '') + '</div></header>'
    + (front.trim() ? '<div class="ear">' + md2(front) + '</div>' : '') + sections.join('');
}
// The report in the language picked; the bokmål one if there is no nynorsk one
const prepSource=()=>((LANG==='nn'&&$('prepSourceNn').textContent.trim())||$('prepSource').textContent||'').trim();
// Once the quiz day is over (in Oslo, by the server's clock), the report is last week's: say so,
// and when the next one is due.
function prepStale(md, uke){
  const quiz = prepDate(uke) || prepDate(md.split('\n')[0]), today = osloDay(serverNow());
  if(!quiz || today <= quiz) return null;
  const t = Date.parse(today), next = new Date(t + (QUIZ_DAY - new Date(t).getUTCDay() + 7) % 7 * 864e5);
  const fmt = d => (d.getUTCDay()===QUIZ_DAY ? 'onsdag ' : '') + d.getUTCDate() + '. ' + MONTHS[d.getUTCMonth()];
  return { was: fmt(new Date(quiz)), next: fmt(next), isToday: +next === t };
}
// The report doesn't change while the page is open, so it is rendered once, here. Rendering it again
// would throw away what has been filled into it since.
{
  const md = prepSource();
  let h2 = 0;   // an ad slot between each ## section (only shown with ads on; see fillAds())
  $('prepBody').innerHTML = md ? prepMarkdown(md).replace(/<h2>/g, m => h2++ ? '<div class="adslot ad-all" data-fmt="box"></div>' + m : m)
    : L('<div class="prepsoon"><strong>Ukas prepp kommer snart</strong><p>Her dukker ferske nyhetssaker, navnedagene for uka og «på denne dagen» opp så snart ukas quizprep er kjørt.</p></div>',
        '<div class="prepsoon"><strong>Vekas prepp kjem snart</strong><p>Her dukkar ferske nyheitssaker, namnedagane for veka og «på denne dagen» opp så snart vekas quizprep er køyrd.</p></div>');
  if(md) $('prepPaper').innerHTML = prepPaper(md);
  $('prepView').hidden = !md;
}
// «Vanlig» or «Avis»: the same report as a page or as a newspaper. Remembered under prepView.
function prepSetView(v){
  const paper = v === 'paper' && !!prepSource();
  $('prepBody').hidden = paper; $('prepPaper').hidden = !paper;
  prepMarkView(paper ? 'paper' : 'plain');
}
const prepMarkView = radios({plain:'prepViewPlain', paper:'prepViewPaper'}, v => {
  store.set('prepView', v === 'paper' ? 'paper' : null); prepSetView(v);
  if(adsOn()) fillAds();   // the ad slots of the view just hidden are left out
});
prepSetView(store.get('prepView'));
// What goes by the date: the notice that the prep is out of date, and the text on its button
function renderPrep(){
  const md = prepSource(), uke = $('prepSource').dataset.uke;
  const stale = md ? prepStale(md, uke) : null;
  $('prepStale').hidden = !stale;
  if(stale) $('prepStale').innerHTML = '<strong>Denne preppen er utdatert</strong><p>Den var til kvissen ' + stale.was + '. '
    + (stale.isToday ? L('Ny prepp til i kveld kommer snart.','Ny prepp til i kveld kjem snart.') : L(`Ny prepp kommer ${stale.next}.`,`Ny prepp kjem ${stale.next}.`)) + '</p>';
  $('prepTeaser').textContent = !md ? L('Kommer snart','Kjem snart')
    : stale ? (stale.isToday ? L('Ny prepp til i kveld kommer snart','Ny prepp til i kveld kjem snart') : L(`Ny prepp kommer ${stale.next}`,`Ny prepp kjem ${stale.next}`))
    : uke ? 'Klar til ' + uke : L('Nyheter, navnedager og datoen','Nyheiter, namnedagar og datoen');
}
// The countdown sits at the top of the prep too: it is one element, moved here from the home page
addMode('prep',()=>{ $('prepStale').before($('countdown')); renderPrep(); },{wide:true});
