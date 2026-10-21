// ---------- Bommet på onsdag ----------
// The questions we got wrong at the Wednesday quiz (BOM in data/bom.js), one closed <details> per
// question, grouped by quiz with the newest first. «Se svar» opens it to the right answer and what
// the team answered.
// 'YYYY-MM-DD' as «Onsdag 14. oktober 2026»
function boDate(iso){
  const d=new Date(iso+'T12:00:00Z'), w=WEEKDAYS[d.getUTCDay()];
  return `${w[0].toUpperCase()+w.slice(1)} ${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
function boRender(){
  const days=[...new Set(BOM.map(e=>e.d))].sort().reverse();
  const item=e=>`<details class="boitem"><summary><span>${e.q}</span><span class="bosee" aria-hidden="true"><span class="boshow">${L('Se svar','Sjå svar')}</span><span class="bohide">Skjul svar</span></span></summary>
    <div class="bobody"><p class="boright"><small>${L('Riktig svar','Rett svar')}</small><strong>${e.a}</strong></p><p class="boteam"><small>Kvisslaget svarte</small><strong>${e.t||'Ingenting'}</strong></p>${e.n?`<p class="bonote">${e.n}</p>`:''}</div></details>`;
  $('boList').innerHTML=days.map(d=>`<section class="boweek"><h2 class="chead">${boDate(d)}</h2><div class="bolist">${BOM.filter(e=>e.d===d).map(item).join('')}</div></section>`).join('');
}
boRender();
const boQuizzes=new Set(BOM.map(e=>e.d)).size;
$('boSub').textContent=boQuizzes===1?L(`${BOM.length} spørsmål fra 1 kviss`,`${BOM.length} spørsmål frå 1 kviss`)
  :L(`${BOM.length} spørsmål fra ${boQuizzes} kvisser`,`${BOM.length} spørsmål frå ${boQuizzes} kvissar`);
addMode('bom',()=>{},{newUntil:'2026-11-04 19:00'});
