// ---------- Flagg ----------
// A start page where the way round (flag → country or country → flag) and the part of the world
// are picked, then a page with the quiz: every flag in that part, in random order. The quiz has
// its own history entry, as Anagram's stops do, so the back gesture goes back to the start page;
// halfway through a round it asks first (#fgLeaveSheet), since the round is lost.
// Wrong options come from the same part of the world; Antarctica has only itself.
const FG_IMG=f=>`https://flagcdn.com/${f.c}.svg`;
const FG_PARTS={
  all:{n:L('Hele verden','Heile verda'), list:FLAGG.filter(f=>f.w!=='an')},
  af:{n:'Afrika'}, as:{n:'Asia'}, eu:{n:'Europa'}, na:{n:'Nord-Amerika'}, sa:{n:'Sør-Amerika'}, oc:{n:'Oseania'}, an:{n:'Antarktis'}
};
// A country in two parts of the world (w is a list) is in both
for(const k in FG_PARTS) if(!FG_PARTS[k].list) FG_PARTS[k].list=FLAGG.filter(f=>[].concat(f.w).includes(k));
const FG_DIRS={flag:'Flagg → land', land:'Land → flagg'};
let fgDir='flag', fgPart=null;

const fgCount=n=>n===1?'1 flagg':`${n} flagg`;
const fgFact=f=>(f.kf||L(`Hovedstaden i ${f.n} er ${f.k}.`,`Hovudstaden i ${f.n} er ${f.k}.`))+(f.f?' '+f.f:'');
const fgMissLi=f=>`<span class="mxthumb"><img class="fgthumb" src="${FG_IMG(f)}" alt=""></span><div><strong>${f.n}</strong>${f.k?`<small>${f.k}</small>`:''}</div>`;
// dir 'flag': the flag is shown, and the answer is one of six names. dir 'land': the name is
// shown, and the answer is one of four flags.
function fgQuestion(f, dir, pool){
  const others=shuffle(pool.filter(x=>x!==f)).slice(0,dir==='flag'?5:3);
  const opts=shuffle([f,...others]).map(x=>dir==='flag'
    ?{label:x.n, ok:x===f}
    :{flag:x, ok:x===f, info:x===f?'':L(`Du valgte flagget til ${x.n}.`,`Du valde flagget til ${x.n}.`)});
  // The flags' alt text is only their number, so it doesn't give the answer away
  opts.forEach((o,k)=>{ if(o.flag) o.label=`<img class="fgopt" src="${FG_IMG(o.flag)}" alt="Flagg ${k+1}">`; });
  return dir==='flag'
    ?{q:L('Hvilket land har dette flagget?','Kva land har dette flagget?'), cls:'fgflag', prompt:()=>`<img src="${FG_IMG(f)}" alt="Flagget">`,
      opts, fact:fgFact(f), miss:fgMissLi(f)}
    :{q:L('Hvilket flagg har landet?','Kva flagg har landet?'), cls:'cprompt fgname', prompt:()=>`<small>Landet</small><strong>${f.n}</strong>`,
      opts, answer:`flagget til ${f.n}`, fact:fgFact(f), miss:fgMissLi(f)};
}
const fgAll=()=>shuffle(FG_PARTS[fgPart].list);
const fgQuiz=makeQuiz('fgQuiz',{
  ask:f=>fgQuestion(f,fgDir,FG_PARTS[fgPart].list), newDeck:fgAll,
  buttons:[{act:'retry',cls:'primary',label:L('Øv på dem du bommet på','Øv på dei du bomma på')},
    {act:'restart',cls:'ghost',label:''},{act:'pick',cls:'ghost',label:L('Velg en annen verdensdel','Vel ein annan verdsdel')}],
  actions:{pick:()=>fgToPick()},
  onFinish(z){ const miss=z.marks().includes('0'); z.button('retry').hidden=!miss; (miss?z.button('retry'):z.button('restart')).focus({preventScroll:true}); }
});

// The start page: the way round, then a button for each part of the world
function fgRenderParts(){
  $('fgParts').innerHTML=Object.keys(FG_PARTS).map(k=>`<button type="button" data-part="${k}"><strong>${FG_PARTS[k].n}</strong><span>${fgCount(FG_PARTS[k].list.length)}</span></button>`).join('');
}
const fgMarkDir=radios({flag:'fgDirFlag',land:'fgDirLand'},d=>{ fgDir=d; fgMarkDir(d); });
$('fgParts').addEventListener('click',e=>{ const b=e.target.closest('[data-part]'); if(b) fgStart(b.dataset.part); });
function fgStart(k){
  fgPart=k;
  const n=FG_PARTS[k].list.length;
  $('fgTitle').textContent=FG_PARTS[k].n;
  $('fgPlaySub').textContent=`${FG_DIRS[fgDir]} · ${fgCount(n)}`;
  fgQuiz.button('restart').textContent=n===1?'Start på nytt':`Start på nytt med alle ${n}`;
  fgView(true); $('fgAuto').setAttribute('aria-checked',quizAuto());
  history.pushState({fgPlay:true},'',location.href);
  fgQuiz.start(fgAll());
}
function fgView(play){
  $('fgPickView').hidden=play; $('fgPlayView').hidden=!play;
  if(!play) fgQuiz.stop();
  window.scrollTo(0,0);
}
function fgToPick(){ if(history.state&&history.state.fgPlay) history.back(); else fgView(false); }
// Halfway through a round: at least one answer, and not at the result yet
const fgMidway=()=>!!fgQuiz.current()&&fgQuiz.marks().length>0;
let fgLeaving=false;   // the back was confirmed, so the popstate it causes goes through
$('fgBack').addEventListener('click',()=>fgMidway()?$('fgLeaveSheet').showModal():fgToPick());
// The back gesture has already left the quiz's entry: put it back while the sheet asks
addEventListener('popstate',()=>{
  if($('fgPlayView').hidden||(history.state&&history.state.fgPlay)) return;
  if(fgMidway()&&!fgLeaving){ history.pushState({fgPlay:true},'',location.href); $('fgLeaveSheet').showModal(); return; }
  fgLeaving=false; fgView(false);
});
$('fgLeaveStay').addEventListener('click',()=>$('fgLeaveSheet').close());
$('fgLeaveGo').addEventListener('click',()=>{ $('fgLeaveSheet').close(); fgLeaving=true; fgToPick(); });
// «Gå videre av seg selv», the same setting as in Innstillinger, as «Auto» in the quiz's header
$('fgAuto').addEventListener('click',()=>{ setQuizAuto(!quizAuto()); $('fgAuto').setAttribute('aria-checked',quizAuto()); });

// Study list: every flag, by part of the world
function fgRenderStudy(){
  const fig=f=>`<figure tabindex="0"><img src="${FG_IMG(f)}" alt="" loading="lazy"><figcaption class="ans"><strong>${f.n}</strong>${f.k?`<span>${f.k}</span>`:''}</figcaption></figure>`;
  $('fgStudyGrid').innerHTML=['eu','as','af','na','sa','oc','an'].map(k=>
    `<h2 class="chead">${FG_PARTS[k].n}</h2><div class="study fgstudy">${FG_PARTS[k].list.slice().sort((a,b)=>a.n.localeCompare(b.n,'nb')).map(fig).join('')}</div>`).join('');
}
hideAnswers('fgToggle','fgStudyGrid',L(['Skjul navn','Vis navn'],['Skjul namn','Vis namn']));
tabs('fgTabQuiz','fgTabStudy','fgPick','fgStudy',q=>{ $('fgSub').textContent=q?L('Velg retning og verdensdel','Vel retning og verdsdel'):L('Alle flaggene, etter verdensdel','Alle flagga, etter verdsdel'); });

function fgOpen(){ fgView(false); }
fgRenderParts(); fgRenderStudy(); fgMarkDir(fgDir);
addMode('flagg',fgOpen,{newUntil:'2026-11-11 19:00'});
