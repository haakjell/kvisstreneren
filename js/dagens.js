// ---------- Dagens kviss ----------
// Two questions from each mode, from the sources in MIX, always in the order of MX_ORDER.
// The day's round is dealt from a seed made from the date (Oslo time), so everyone gets the same
// questions; each mode's deal and each question's drawing get their own seed, so one can't throw
// the others off. Progress is saved after every answer, which also means a reload doesn't give
// the question again. "Ti blandede spørsmål til" deals a free round the same way, but unseeded
// and unsaved.
const MX_ORDER=['bydel','tbane','vapen','mgp','caesar'], MX_EACH=2, MX_KEY='dagens';
const MX_FIRST='2026-10-01', MX_URL='https://haakjell.github.io/kvisstreneren/#dagens';   // round #0, and the link shared
let mxDay='';   // '' = a free round
const mxLoad=()=>store.getJSON(MX_KEY)||{};
const mxSave=st=>store.setJSON(MX_KEY,st);
// The day and the closing hours go by the server's clock (serverNow() in core.js); the round
// can't start before the server has answered at least once.
const mxToday=()=>osloDay(serverNow());
function mxDate(day){ const d=new Date(day+'T12:00:00Z'); return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]}`; }
const mxNumber=day=>Math.round((Date.parse(day)-Date.parse(MX_FIRST))/864e5);
const mxSubText=()=>mxDay?mxDate(mxDay).replace(/^./,c=>c.toUpperCase())+` · #${mxNumber(mxDay)}`:'Blandet runde';
const mxScoreOf=marks=>marks.split('').filter(m=>m==='1').length;
// Days in a row with a finished round, counting back from today (or yesterday, before today's is done)
function mxStreak(log,today){
  let t=Date.parse(today), n=0;
  if(!(today in log)) t-=864e5;
  while(new Date(t).toISOString().slice(0,10) in log){ n++; t-=864e5; }
  return n;
}
const mxSeeded=(key,fn)=>mxDay?withSeed(seedOf(mxDay+'|'+key),fn):fn();
function mxDeal(){
  const deck=MX_ORDER.flatMap(k=>mxSeeded(k,()=>MIX[k].deal(MX_EACH)).map(q=>Object.assign(q,{src:MIX[k].label+(q.tag?', '+q.tag:'')})));
  // Each question's drawing gets a seed of its own too (T-banen picks its options there)
  deck.forEach((q,i)=>{ const draw=q.prompt; q.prompt=box=>mxSeeded('q'+i,()=>draw(box)); });
  return deck;
}
const mxQuiz=makeQuiz('mxMain',{marks:true, hint:true,
  buttons:[{act:'share',cls:'primary',label:'Del resultatet'},{act:'more',cls:'ghost',label:'Ti blandede spørsmål til'},{act:'today',cls:'ghost',label:'Dagens resultat'}],
  actions:{share:()=>mxShare(), more:()=>mxStart(''), today:()=>mxStart(mxToday())},
  // Saved after every answer, and the day's score in the log once the round is done
  onAnswer(marks){
    if(!mxDay) return;
    const st=mxLoad(); st.day=mxDay; st.marks=marks;
    if(marks.length===mxQuiz.size()) (st.log??={})[mxDay]=mxScoreOf(marks);
    mxSave(st);
  },
  donePrefix(){ const n=mxDay?mxStreak(mxLoad().log||{},mxDay):0; return n>1?`${n} dager på rad. `:''; },
  onFinish(z){
    z.button('share').hidden=!mxDay; z.button('today').hidden=!!mxDay; z.hint().textContent='';
    z.button('more').textContent=mxDay?'Ti blandede spørsmål til':'Ti nye blandede spørsmål';
    (mxDay?z.button('share'):z.button('more')).focus({preventScroll:true});
  }
});
// day '' deals a free round. A round of today's that was left half-way carries on where it was.
function mxStart(day){
  mxDay=day;
  const deck=mxDeal(); let marks='';
  if(day){ const st=mxLoad(); if(st.day===day) marks=(st.marks||'').slice(0,deck.length); }
  $('mxSub').textContent=mxSubText();
  mxQuiz.start(deck,{marks});
}
// Like Wordle: the round's number, the score, a row of squares and the link, through the phone's
// share sheet when there is one, and the clipboard otherwise
async function mxShare(){
  const marks=mxQuiz.marks();
  const text=[`Kvisstreneren #${mxNumber(mxDay)}`,`${mxScoreOf(marks)} av ${mxQuiz.size()}`,
    marks.split('').map(m=>m==='1'?'🟩':'🟥').join(''),MX_URL].join('\n');
  if(navigator.share){ try{ await navigator.share({text}); return; }catch(e){ if(e.name==='AbortError') return; } }
  try{ await navigator.clipboard.writeText(text); mxQuiz.hint().textContent='Kopiert. Lim det inn der du vil dele det.'; }
  catch(e){ mxQuiz.hint().textContent=text; }
}
// Opening the mode: ask the server what time it is, then carry on with the round on screen,
// unless it's yesterday's; then today's
async function mxOpen(){
  if(!serverClock){ $('mxMain').hidden=true; $('mxClosed').hidden=true; $('mxOffline').hidden=true; $('mxSub').textContent='Henter dagens dato …'; }
  const ok=await syncClock();
  if(curMode!=='dagens') return;
  $('mxOffline').hidden=ok;
  if(!ok){ $('mxMain').hidden=true; $('mxClosed').hidden=true; $('mxSub').textContent='Fikk ikke hentet datoen'; return; }
  const locked=quizLive(serverNow());
  $('mxClosed').hidden=!locked; $('mxMain').hidden=locked;
  if(locked){ $('mxSub').textContent='Stengt mens kvissen pågår'; return; }
  if(!mxQuiz.started()||(mxDay&&mxDay!==mxToday())) mxStart(mxToday());
  else $('mxSub').textContent=mxSubText();
}
$('mxRetry').addEventListener('click',mxOpen);
addMode('dagens',mxOpen);
