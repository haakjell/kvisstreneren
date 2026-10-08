// ---------- Melodi Grand Prix ----------
const MG_FROM=[1970,1980,1990,2000,2010], MG_DECK=10, MG_LAST=MGP[MGP.length-1].y;
let mgMode='year', mgFrom=1970, mgQueue=[];
{ const f=+store.get('mgpFrom'); if(MG_FROM.includes(f)) mgFrom=f; }

const mgPool=()=>MGP.filter(e=>e.y>=mgFrom);
const mgByYear=y=>MGP.find(e=>e.y===y);
const mgHalves=e=>e.a.split(' og ');
const mgPeople=e=>new Set([...mgHalves(e),...(e.m||[]),...(e.also||[])].map(normName));
const mgWins=a=>MGP.filter(e=>e.a===a).map(e=>e.y);
const mgList=xs=>xs.length<2?xs.join(''):xs.slice(0,-1).join(', ')+' og '+xs[xs.length-1];
function mgPlace(e,short){
  if(e.e==='x') return short?'Eurovision avlyst':'Eurovision ble avlyst det året.';
  if(e.e==='semi') return short?'ut i semifinalen':'Røk ut i semifinalen i Eurovision.';
  if(e.e===1) return short?'vant Eurovision':'Vant Eurovision!';
  const tail=e.last?(e.zero?', sist med null poeng':', sist'):'';
  return short?`${e.e}. plass${tail}`:`${e.e}. plass i Eurovision${tail}.`;
}
function mgFact(e){ return `${e.y}: ${e.a} med «${e.s}». ${mgPlace(e)}${e.n?' '+e.n:''}`; }

// Rounds walk through a shuffled queue of the years in range, so all come up before any repeats
function mgNewDeck(){
  const pool=mgPool().map(e=>e.y);
  mgQueue=mgQueue.filter(y=>y>=mgFrom);
  if(mgQueue.length<MG_DECK) mgQueue=mgQueue.concat(shuffle(pool.filter(y=>!mgQueue.includes(y))));
  return mgQueue.splice(0,MG_DECK).map(y=>({y,dir:mgMode==='type'?(rnd()<.5?'year':'artist'):mgMode}));
}
// dir 'year': the year is shown and the answer is an artist. dir 'artist': the other way round.
// Wrong options come from nearby years, so they are plausible.
const mgNear=(xs,y,spread)=>xs.map(x=>({x,k:Math.abs(x.y-y)+rnd()*spread})).sort((p,q)=>p.k-q.k).map(p=>p.x);
// pool: the years asked about, and the wrong years; names: the years the wrong artists come from
function mgOptions(q,pool=mgPool(),names=MGP){
  const e=mgByYear(q.y);
  if(q.dir==='year'){
    const mine=mgPeople(e), seen=new Set([e.a]);
    const others=mgNear(names.filter(x=>![...mgPeople(x)].some(p=>mine.has(p))),e.y,10)
      .filter(x=>!seen.has(x.a)&&seen.add(x.a)).slice(0,5)
      .map(x=>({label:x.a,info:`${x.a} vant i ${mgList(mgWins(x.a))}.`}));
    return shuffle([{label:e.a,ok:true},...others]);
  }
  const years=mgNear(pool.filter(x=>x!==e),e.y,12).slice(0,5)
    .map(x=>({label:x.y,y:x.y,info:`I ${x.y} vant ${x.a} med «${x.s}».`}));
  return [{label:e.y,y:e.y,ok:true},...years].sort((p,q)=>p.y-q.y);
}
function mgPromptHTML(q){
  const e=mgByYear(q.y);
  return q.dir==='year'?`<small>Melodi Grand Prix</small><strong>${e.y}</strong>`
    :`<small>Vinneren</small><strong>${e.a}</strong><span class="song">«${e.s}»</span>`;
}
const mgQText=q=>q.dir==='year'?'Hvem vant MGP det året?':'Hvilket år vant låta MGP?';
const mgMissLi=q=>{const e=mgByYear(q.y); return `<div><strong>${e.y}: ${e.a}</strong><small>«${e.s}»</small></div>`;};
// Typed artists: the full name or an accepted spelling, with one or two typos forgiven depending on
// the length. Half of a duo, or someone who also sang the song in the MGP final, counts too.
// Typed years: four digits, or the last two ("85").
function mgJudge(input,q){
  const e=mgByYear(q.y);
  if(q.dir==='artist'){
    const d=input.replace(/\D/g,''); if(!d) return input.trim()?'wrong':'empty';
    const y=d.length===2?(+d>=60?1900:2000)+ +d:+d;
    return y===e.y?'exact':'wrong';
  }
  const x=normName(input); if(!x) return 'empty';
  const full=[e.a,...(e.al||[])].map(normName);
  const part=[...(mgHalves(e).length>1?mgHalves(e):[]),...(e.also||[])].map(normName);
  if(full.includes(x)) return 'exact';
  if(full.some(t=>nearly(x,t))) return 'close';
  if(part.some(t=>t===x||nearly(x,t))) return 'part';
  return 'wrong';
}
// A question about year q = {y, dir}, for the quiz here and the mixed one; typed asks for the
// answer to be written instead of picked. pool and names as in mgOptions().
function mgQuestion(q, typed, pool, names){
  const e=mgByYear(q.y), year=q.dir==='year';
  return {q:mgQText(q), cls:'cprompt', prompt:()=>mgPromptHTML(q), fact:mgFact(e), miss:mgMissLi(q),
    ...(typed?{typed:{answer:year?e.a:String(e.y), placeholder:year?'Artistens navn':'Årstall',
        inputMode:year?'text':'numeric', autocapitalize:year?'words':'off', judge:x=>mgJudge(x,q)}}
      :{opts:mgOptions(q,pool,names)})};
}
const mgQuiz=makeQuiz('mgQuiz',{ask:q=>mgQuestion(q,mgMode==='type'), newDeck:mgNewDeck, typed:true});

// Mixed quiz: only from 2000 on (wrong options too), whatever "Fra og med" is set to, either way
// round, with options
const MG_MIX_FROM=2000;
MIX.mgp={label:`MGP fra og med ${MG_MIX_FROM}`, deal(n){
  const pool=MGP.filter(e=>e.y>=MG_MIX_FROM);
  return shuffle(pool).slice(0,n).map(e=>mgQuestion({y:e.y,dir:rnd()<.5?'year':'artist'},false,pool,pool));
}};
// Study list: every year in range, grouped by decade, with the years without a final in between
function mgRenderStudy(){
  const rows=[...mgPool(),...MGP_GAPS.filter(g=>g.y>=mgFrom).map(g=>({...g,gap:1}))].sort((p,q)=>p.y-q.y);
  const li=e=>e.gap?`<li class="gap"><b>${e.y}</b><div><strong>Ingen MGP</strong><small>${e.n}</small></div></li>`
    :`<li tabindex="0"><b>${e.y}</b><div><strong class="ans">${e.a}</strong><small>«${e.s}» · ${mgPlace(e,true)}</small></div></li>`;
  let html='';
  for(let d=Math.floor(mgFrom/10)*10; d<=MG_LAST; d+=10){
    const xs=rows.filter(e=>e.y>=d&&e.y<d+10); if(!xs.length) continue;
    html+=`<h2 class="chead">${d}-tallet</h2><ul class="mglist">${xs.map(li).join('')}</ul>`;
  }
  $('mgStudyList').innerHTML=html;
}
hideAnswers('mgToggle','mgStudyList',['Skjul artistene','Vis artistene']);
tabs('mgTabQuiz','mgTabStudy','mgQuiz','mgStudy',q=>{ mgQuiz.stop(); if(q) mgQuiz.refocus(); });
const MG_SUBS={year:'Finn vinneren',artist:'Finn året',type:'Uten alternativer, begge veier'};
function mgSub(){ $('mgSub').textContent=`${MG_SUBS[mgMode]} · ${mgPool()[0].y}–${MG_LAST}`; }
const mgMarkMode=radios({year:'mgSetYear',artist:'mgSetArtist',type:'mgSetType'},m=>mgUse(m));
function mgUse(m){
  mgMode=m;
  mgMarkMode(m);
  mgSub(); mgQuiz.start(mgNewDeck());
}
// Earliest year asked about. Changing it starts a new round and redraws the study list.
function mgRenderFrom(){
  $('mgFrom').innerHTML=MG_FROM.map(y=>`<button type="button" data-y="${y}" aria-pressed="${y===mgFrom}">${y===MG_FROM[0]?'Alle':y}</button>`).join('');
}
$('mgFrom').addEventListener('click',e=>{
  const el=e.target.closest('button'); if(!el||+el.dataset.y===mgFrom) return;
  mgFrom=+el.dataset.y; store.set('mgpFrom',mgFrom);
  mgRenderFrom(); mgRenderStudy(); mgUse(mgMode);
});
function mgOpen(){ if(!mgQuiz.started()){ mgRenderFrom(); mgRenderStudy(); mgUse('year'); } }
addMode('mgp',mgOpen);
$('mgNote').textContent='Vinnerne fra 1971, da Norge var tilbake etter boikotten i 1970, til '+MG_LAST+'. Det var ingen MGP i 1991 og 2002. Kilde: Wikipedia.';
