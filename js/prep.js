// ---------- Ukas kvissprep ----------
// The report itself lives in the #prepSource block up in the markup, so it survives
// pasting verbatim — backticks and all. See CLAUDE.md for the weekly routine.
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
// Once the quiz day is over (in Oslo, by the server's clock), the report is last week's: say so,
// and when the next one is due.
function prepStale(md, uke){
  const quiz = prepDate(uke) || prepDate(md.split('\n')[0]), today = osloDay(serverNow());
  if(!quiz || today <= quiz) return null;
  const t = Date.parse(today), next = new Date(t + (QUIZ_DAY - new Date(t).getUTCDay() + 7) % 7 * 864e5);
  const fmt = d => (d.getUTCDay()===QUIZ_DAY ? 'onsdag ' : '') + d.getUTCDate() + '. ' + MONTHS[d.getUTCMonth()];
  return { was: fmt(new Date(quiz)), next: fmt(next), isToday: +next === t };
}
function renderPrep(){
  const src = $('prepSource');
  const md = (src.textContent||'').trim(), uke = src.dataset.uke;
  const stale = md ? prepStale(md, uke) : null;
  let h2 = 0;   // an ad slot between each ## section (only shown with ads on; see fillAds())
  $('prepBody').innerHTML = md ? prepMarkdown(md).replace(/<h2>/g, m => h2++ ? '<div class="adslot ad-all" data-fmt="box"></div>' + m : m)
    : '<div class="prepsoon"><strong>Ukas prepp kommer snart</strong><p>Her dukker ferske nyhetssaker, navnedagene for uka og «på denne dagen» opp så snart ukas quizprep er kjørt.</p></div>';
  $('prepStale').hidden = !stale;
  if(stale) $('prepStale').innerHTML = '<strong>Denne preppen er utdatert</strong><p>Den var til kvissen ' + stale.was + '. '
    + (stale.isToday ? 'Ny prepp til i kveld kommer snart.' : 'Ny prepp kommer ' + stale.next + '.') + '</p>';
  $('prepTeaser').textContent = !md ? 'Kommer snart'
    : stale ? (stale.isToday ? 'Ny prepp til i kveld kommer snart' : 'Ny prepp kommer ' + stale.next)
    : uke ? 'Klar til ' + uke : 'Nyheter, navnedager og datoen';
}
// The countdown sits at the top of the prep too: it is one element, moved here from the home page
addMode('prep',()=>{ $('prepStale').before($('countdown')); renderPrep(); },{wide:true});
