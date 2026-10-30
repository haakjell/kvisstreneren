// ---------- Elver ----------
// Which cities and countries the rivers of the world run through, and where they end. Four kinds
// of question: a city → its river, a river → one of its cities, a river → one of its countries,
// and a river → where it runs out. The chips pick the part of the world; wrong options come from
// the same part first, so they are plausible.
const EL_DECK=10;
const EL_PARTS={
  all:{n:L('Hele verden','Heile verda'), w:['no','eu','af','as','na','sa']},
  eu:{n:'Europa', w:['no','eu']},
  world:{n:L('Resten av verden','Resten av verda'), w:['af','as','na','sa']},
};
const EL_HEADS={no:L('Norge','Noreg'), eu:'Europa', af:'Afrika', as:'Asia', na:'Nord-Amerika', sa:'Sør-Amerika'};
let elMode='city', elPart='all', elQueue=[];
{ const p=store.get('elverPart'); if(EL_PARTS[p]) elPart=p; }

const elPool=(part=elPart)=>ELVER.filter(r=>EL_PARTS[part].w.includes(r.w));
// Whether river r is asked about in mode dir: «By → elv» only has the well-known cities (cq),
// and «Elv → land» leaves out the rivers only in Norway
const elAsks=(r,dir)=>dir==='city'?!!r.cq:dir==='land'?r.k.some(c=>c!=='no'):true;
const elLand=c=>FLAGG.find(f=>f.c===c).n;
const elLands=r=>r.k.map(elLand);
// «A, B og C»
const elList=xs=>xs.length<2?xs.join(''):xs.slice(0,-1).join(', ')+' og '+xs[xs.length-1];
// The rivers running through a city
const elAt=city=>ELVER.filter(r=>r.c.includes(city));
// The line after the answer: the cities (or the countries, in «Elv → land»), the mouth and the length
const elFact=(r,xs=r.c)=>L(`${r.n} renner gjennom ${elList(xs)}, og ut i ${r.m}. Den er ${r.l.toLocaleString('nb')} km lang.`,
  `${r.n} renn gjennom ${elList(xs)}, og ut i ${r.m}. Ho er ${r.l.toLocaleString('nb')} km lang.`)+(r.f?' '+r.f:'');
const elMissLi=r=>`<div><strong>${r.n}</strong><small>${r.c.join(', ')} · ut i ${r.m}</small></div>`;
// Wrong options: those from the river's own part of the world first, then the rest, each shuffled
const elNear=(r,xs)=>[...shuffle(xs.filter(x=>x.w===r.w)),...shuffle(xs.filter(x=>x.w!==r.w))];

// Rounds walk through a shuffled queue of the rivers asked about, so all come up before any
// repeats. The city or country asked about is drawn here.
const elPick=xs=>xs[Math.floor(rnd()*xs.length)];
const elItem=(r,dir)=>({r, dir, city:elPick(dir==='city'?r.cq:r.c), land:elPick(r.k.filter(c=>c!=='no'))});
function elNewDeck(){
  const pool=elPool().filter(r=>elAsks(r,elMode));
  elQueue=elQueue.filter(r=>pool.includes(r));
  if(elQueue.length<EL_DECK) elQueue=elQueue.concat(shuffle(pool.filter(r=>!elQueue.includes(r))));
  return elQueue.splice(0,EL_DECK).map(r=>elItem(r,elMode));
}
// q = {r, dir, city, land}. pool: the rivers the wrong options come from.
// dir 'city': the city is shown, and the answer is one of six rivers (none of the others runs
// through it). dir 'river': the river is shown, and the answer is one of six cities (none on it).
// dir 'land': the river is shown, and the answer is one of six countries (none it runs through,
// or along: kx). dir 'mouth': the river is shown, and the answer is one of six places rivers run out.
function elQuestion(q, pool=elPool()){
  const r=q.r, others=elNear(r,pool.filter(x=>x!==r));
  const river=`<small>Elva</small><strong>${r.n}</strong>`;
  if(q.dir==='city'){
    const opts=shuffle([{label:r.n,ok:true},...others.filter(x=>!x.c.includes(q.city)).slice(0,5)
      .map(x=>({label:x.n,info:L(`${x.n} renner gjennom ${elList(x.c)}.`,`${x.n} renn gjennom ${elList(x.c)}.`)}))]);
    return {q:L('Hvilken elv renner gjennom byen?','Kva elv renn gjennom byen?'), cls:'cprompt',
      prompt:()=>`<small>Byen</small><strong>${q.city}</strong>`, opts, fact:elFact(r), miss:elMissLi(r)};
  }
  if(q.dir==='river'){
    const seen=new Set(r.c), cities=[];
    for(const x of others) for(const c of shuffle(x.c)) if(!seen.has(c)&&cities.length<5){ seen.add(c); cities.push(c); break; }
    const opts=shuffle([{label:q.city,ok:true},...cities.map(c=>({label:c,
      info:L(`${c} ligger ved ${elList(elAt(c).map(x=>x.n))}.`,`${c} ligg ved ${elList(elAt(c).map(x=>x.n))}.`)}))]);
    return {q:L('Hvilken by renner elva gjennom?','Kva by renn elva gjennom?'), cls:'cprompt', prompt:()=>river,
      opts, fact:elFact(r), miss:elMissLi(r)};
  }
  if(q.dir==='land'){
    const seen=new Set([...r.k,...(r.kx||[])]), lands=[];
    for(const x of others) for(const c of shuffle(x.k)) if(!seen.has(c)&&lands.length<5){ seen.add(c); lands.push(c); break; }
    const through=c=>elList(pool.filter(x=>x.k.includes(c)).map(x=>x.n));
    const opts=shuffle([{label:elLand(q.land),ok:true},...lands.map(c=>({label:elLand(c),
      info:L(`Gjennom ${elLand(c)} renner ${through(c)}.`,`Gjennom ${elLand(c)} renn ${through(c)}.`)}))]);
    return {q:L('Hvilket land renner elva gjennom?','Kva land renn elva gjennom?'), cls:'cprompt', prompt:()=>river,
      opts, fact:elFact(r,elLands(r)), miss:elMissLi(r)};
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

// Study list: the rivers in range by part of the world, longest first, with their cities and countries
function elRenderStudy(){
  const pool=elPool();
  $('elStudyList').innerHTML=Object.keys(EL_HEADS).map(w=>{
    const xs=pool.filter(r=>r.w===w).sort((a,b)=>b.l-a.l); if(!xs.length) return '';
    const head=w==='eu'&&pool.some(r=>r.w==='no')?'Resten av Europa':EL_HEADS[w];
    return `<h2 class="chead">${head}</h2><ul class="clist">${xs.map(r=>`<li tabindex="0"><strong>${r.n}</strong><span class="act ans">${r.c.join(', ')}</span><small>${elLands(r).join(', ')}</small><small>Ut i ${r.m} · ${r.l.toLocaleString('nb')} km</small></li>`).join('')}</ul>`;
  }).join('');
}
hideAnswers('elToggle','elStudyList',L(['Skjul byene','Vis byene'],['Skjul byane','Vis byane']));
// The question type only matters to the quiz, so it is hidden in «Pugg»
tabs('elTabQuiz','elTabStudy','elQuiz','elStudy',q=>{ elQuiz.stop(); $('elSets').hidden=!q; });
const EL_SUBS={city:'Finn elva', river:'Finn byen', land:'Finn landet', mouth:'Finn utløpet'};
const elMarkMode=radios({city:'elSetCity',river:'elSetRiver',land:'elSetLand',mouth:'elSetMouth'},m=>elUse(m));
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
addMode('elver',elOpen,{newUntil:'2026-11-04 19:00'});
$('elNote').textContent=L(`${ELVER.length} elver: de viktigste i verden, med litt ekstra fra Europa og Norge. Kilde: Wikipedia.`,
  `${ELVER.length} elvar: dei viktigaste i verda, med litt ekstra frå Europa og Noreg. Kjelde: Wikipedia.`);
