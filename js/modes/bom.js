// ---------- Bommedatabasen ----------
// The questions we got wrong at the Wednesday quiz (BOM in data/bom.js), one closed <details> per
// question, grouped by quiz with the newest first. «Se svar» opens it to the right answer and what
// the team answered. Picture and sound questions (m in BOM) are only a record for the team: one
// small closed accordion per quiz, under the others, with a line each. A question with audio gets a
// play button.
// 'YYYY-MM-DD' as «Onsdag 14. oktober 2026»
function boDate(iso){
  const d=new Date(iso+'T12:00:00Z'), w=WEEKDAYS[d.getUTCDay()];
  return `${w[0].toUpperCase()+w.slice(1)} ${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
function boRender(){
  const days=[...new Set(BOM.map(e=>e.d))].sort().reverse();
  const item=e=>`<details class="boitem"><summary><span>${e.q}${e.audio?` <button type="button" class="boplay" data-src="${e.audio}">${L('▶ Hør','▶ Høyr')}</button>`:''}</span><span class="bosee" aria-hidden="true"><span class="boshow">${L('Se svar','Sjå svar')}</span><span class="bohide">Skjul svar</span></span></summary>
    <div class="bobody"><p class="boright"><small>${L('Riktig svar','Rett svar')}</small><strong>${e.a}</strong></p><p class="boteam"><small>Kvisslaget svarte</small><strong>${e.t||'Ingenting'}</strong></p>${e.n?`<p class="bonote">${e.n}</p>`:''}</div></details>`;
  const kind=e=>e.m==='pic'?L('Bildeoppgave','Bildeoppgåve'):L('Lydoppgave','Lydoppgåve');
  const media=list=>!list.length?'':`<details class="boextra"><summary>${L(`Bilde- og lydoppgaver (${list.length})`,`Bilde- og lydoppgåver (${list.length})`)}</summary>
    <ul>${list.map(e=>`<li><small>${kind(e)}${e.q?` · ${e.q}`:''}</small>${L('Riktig','Rett')}: <strong>${e.a}</strong> · ${e.t===null?L('husker ikke hva vi svarte, men det var uansett feil','hugsar ikkje kva vi svarte, men det var uansett feil'):`vi svarte ${e.t||'ingenting'}`}</li>`).join('')}</ul></details>`;
  $('boList').innerHTML=days.map(d=>{
    const all=BOM.filter(e=>e.d===d);
    return `<section class="boweek"><h2 class="chead">${boDate(d)}</h2>${BOM_PLACE[d]?`<p class="boplace">Resultat: ${BOM_PLACE[d]}. plass</p>`:''}<div class="bolist">${all.filter(e=>!e.m).map(item).join('')}${media(all.filter(e=>e.m))}</div></section>`;
  }).join('');
}
boRender();
// The play button sits in the summary, so it must not open the question as well
$('boList').addEventListener('click',ev=>{
  const b=ev.target.closest('.boplay');
  if(!b)return;
  ev.preventDefault();
  new Audio(b.dataset.src).play().catch(()=>{});
});
const boQuizzes=new Set(BOM.map(e=>e.d)).size;
$('boSub').textContent=boQuizzes===1?L(`${BOM.length} spørsmål fra 1 kviss`,`${BOM.length} spørsmål frå 1 kviss`)
  :L(`${BOM.length} spørsmål fra ${boQuizzes} kvisser`,`${BOM.length} spørsmål frå ${boQuizzes} kvissar`);
addMode('bom');
