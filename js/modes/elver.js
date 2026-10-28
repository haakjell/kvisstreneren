// ---------- Elver ----------
// Which cities the rivers of the world run through, and where they end. Three kinds of question:
// a city → its river, a river → one of its cities, and a river → where it runs out. The chips
// pick the part of the world; wrong options come from the same part first, so they are plausible.
const EL_DECK=10;
const EL_PARTS={
  all:{n:L('Hele verden','Heile verda'), w:['no','eu','af','as','na','sa']},
  eu:{n:'Europa', w:['no','eu']},
  no:{n:L('Norge','Noreg'), w:['no']},
  world:{n:L('Resten av verden','Resten av verda'), w:['af','as','na','sa']},
};
const EL_HEADS={no:L('Norge','Noreg'), eu:'Europa', af:'Afrika', as:'Asia', na:'Nord-Amerika', sa:'Sør-Amerika'};
let elMode='city', elPart='all', elQueue=[];
{ const p=store.get('elverPart'); if(EL_PARTS[p]) elPart=p; }

const elPool=(part=elPart)=>ELVER.filter(r=>EL_PARTS[part].w.includes(r.w));
// «A, B og C»
const elList=xs=>xs.length<2?xs.join(''):xs.slice(0,-1).join(', ')+' og '+xs[xs.length-1];
// The rivers running through a city
const elAt=city=>ELVER.filter(r=>r.c.includes(city));
const elFact=r=>L(`${r.n} renner gjennom ${elList(r.c)}, og ut i ${r.m}. Den er ${r.l.toLocaleString('nb')} km lang.`,
  `${r.n} renn gjennom ${elList(r.c)}, og ut i ${r.m}. Ho er ${r.l.toLocaleString('nb')} km lang.`)+(r.f?' '+r.f:'');
const elMissLi=r=>`<div><strong>${r.n}</strong><small>${r.c.join(', ')} · ut i ${r.m}</small></div>`;
// Wrong options: those from the river's own part of the world first, then the rest, each shuffled
const elNear=(r,xs)=>[...shuffle(xs.filter(x=>x.w===r.w)),...shuffle(xs.filter(x=>x.w!==r.w))];

// Rounds walk through a shuffled queue of the rivers in range, so all come up before any repeats.
// The city asked about in «By → elv» and «Elv → by» is drawn here.
function elNewDeck(){
  const pool=elPool();
  elQueue=elQueue.filter(r=>pool.includes(r));
  if(elQueue.length<EL_DECK) elQueue=elQueue.concat(shuffle(pool.filter(r=>!elQueue.includes(r))));
  return elQueue.splice(0,EL_DECK).map(r=>({r, dir:elMode, city:r.c[Math.floor(rnd()*r.c.length)]}));
}
// q = {r, dir, city}. pool: the rivers the wrong options come from.
// dir 'city': the city is shown, and the answer is one of six rivers (none of the others runs
// through it). dir 'river': the river is shown, and the answer is one of six cities (none on it).
// dir 'mouth': the river is shown, and the answer is one of six places rivers run out.
function elQuestion(q, pool=elPool()){
  const r=q.r, others=elNear(r,pool.filter(x=>x!==r));
  const river=`<small>${'Elva'}</small><strong>${r.n}</strong>`;
  if(q.dir==='city'){
    const opts=shuffle([{label:r.n,ok:true},...others.filter(x=>!x.c.includes(q.city)).slice(0,5)
      .map(x=>({label:x.n,info:L(`${x.n} renner gjennom ${elList(x.c)}.`,`${x.n} renn gjennom ${elList(x.c)}.`)}))]);
    return {q:L('Hvilken elv renner gjennom byen?','Kva elv renn gjennom byen?'), cls:'cprompt',
      prompt:()=>`<small>${'Byen'}</small><strong>${q.city}</strong>`, opts, fact:elFact(r), miss:elMissLi(r)};
  }
  if(q.dir==='river'){
    const seen=new Set(r.c), cities=[];
    for(const x of others) for(const c of shuffle(x.c)) if(!seen.has(c)&&cities.length<5){ seen.add(c); cities.push(c); break; }
    const opts=shuffle([{label:q.city,ok:true},...cities.map(c=>({label:c,
      info:L(`${c} ligger ved ${elList(elAt(c).map(x=>x.n))}.`,`${c} ligg ved ${elList(elAt(c).map(x=>x.n))}.`)}))]);
    return {q:L('Hvilken by renner elva gjennom?','Kva by renn elva gjennom?'), cls:'cprompt', prompt:()=>river,
      opts, fact:elFact(r), miss:elMissLi(r)};
  }
  const seen=new Set([r.m,r.n]), mouths=[];   // not the river itself
  for(const x of others) if(!seen.has(x.m)&&mouths.length<5){ seen.add(x.m); mouths.push(x.m); }
  const into=m=>elList(pool.filter(x=>x.m===m).map(x=>x.n));
  const opts=shuffle([{label:r.m,ok:true},...mouths.map(m=>({label:m,
    info:L(`Ut i ${m} renner ${into(m)}.`,`Ut i ${m} renn ${into(m)}.`)}))]);
  return {q:L('Hvor renner elva ut?','Kvar renn elva ut?'), cls:'cprompt', prompt:()=>river,
    opts, fact:elFact(r), miss:elMissLi(r)};
}
const elQuiz=makeQuiz('elQuiz',{ask:q=>elQuestion(q), newDeck:elNewDeck});

// Study list: the rivers in range by part of the world, longest first, with their cities
function elRenderStudy(){
  const pool=elPool();
  $('elStudyList').innerHTML=Object.keys(EL_HEADS).map(w=>{
    const xs=pool.filter(r=>r.w===w).sort((a,b)=>b.l-a.l); if(!xs.length) return '';
    const head=w==='eu'&&pool.some(r=>r.w==='no')?'Resten av Europa':EL_HEADS[w];
    return `<h2 class="chead">${head}</h2><ul class="clist">${xs.map(r=>`<li tabindex="0"><strong>${r.n}</strong><span class="act ans">${r.c.join(', ')}</span><small>Ut i ${r.m} · ${r.l.toLocaleString('nb')} km</small></li>`).join('')}</ul>`;
  }).join('');
}
hideAnswers('elToggle','elStudyList',L(['Skjul byene','Vis byene'],['Skjul byane','Vis byane']));
// The question type only matters to the quiz, so it is hidden in «Pugg»
tabs('elTabQuiz','elTabStudy','elQuiz','elStudy',q=>{ elQuiz.stop(); $('elSets').hidden=!q; });
const EL_SUBS={city:'Finn elva', river:'Finn byen', mouth:'Finn utløpet'};
const elMarkMode=radios({city:'elSetCity',river:'elSetRiver',mouth:'elSetMouth'},m=>elUse(m));
function elUse(m){
  elMode=m;
  elMarkMode(m);
  $('elSub').textContent=`${EL_SUBS[m]} · ${EL_PARTS[elPart].n}`;
  elQuiz.start(elNewDeck());
}
// The part of the world. Changing it starts a new round and redraws the study list.
function elRenderParts(){
  $('elParts').innerHTML=Object.keys(EL_PARTS).map(k=>`<button type="button" data-part="${k}" aria-pressed="${k===elPart}">${EL_PARTS[k].n}</button>`).join('');
}
$('elParts').addEventListener('click',e=>{
  const el=e.target.closest('button'); if(!el||el.dataset.part===elPart) return;
  elPart=el.dataset.part; store.set('elverPart',elPart==='all'?null:elPart);
  elRenderParts(); elRenderStudy(); elUse(elMode);
});
function elOpen(){ if(!elQuiz.started()){ elRenderParts(); elRenderStudy(); elUse('city'); } }
addMode('elver',elOpen,{newUntil:'2026-11-25 19:00'});
$('elNote').textContent=L(`${ELVER.length} elver: de viktigste i verden, med litt ekstra fra Europa og Norge. Kilde: Wikipedia.`,
  `${ELVER.length} elvar: dei viktigaste i verda, med litt ekstra frå Europa og Noreg. Kjelde: Wikipedia.`);
