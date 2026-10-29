// ---------- Flagg ----------
// A start page where the way round (flag → country or country → flag) and the part of the world
// are picked, then a page with the quiz: every flag in that part, in random order. The quiz has
// its own history entry, as Anagram's stops do, so the back gesture goes back to the start page;
// halfway through a round it asks first (#fgLeaveSheet), since the round is lost.
// Wrong options come from the same part of the world; Antarctica has only itself.
// Hovedsteder (js/modes/hovedsteder.js) is the same machinery, fgMakeMode(), with capitals.
const FG_IMG=f=>`https://flagcdn.com/${f.c}.svg`;
const FG_NAMES={
  all:L('Hele verden','Heile verda'), af:'Afrika', as:'Asia', eu:'Europa', na:'Nord-Amerika', sa:'Sør-Amerika', oc:'Oseania', an:'Antarktis'
};
// The parts of the world of the countries in list (an empty part is left out). A country in two
// parts (w is a list) is in both, and once in the whole world, which has no Antarctica.
function fgParts(list){
  const parts={};
  for(const k in FG_NAMES){
    const xs=k==='all'?list.filter(f=>f.w!=='an'):list.filter(f=>[].concat(f.w).includes(k));
    if(xs.length) parts[k]={n:FG_NAMES[k], list:xs};
  }
  return parts;
}
const FG_PARTS=fgParts(FLAGG);
const fgCount=n=>n===1?'1 flagg':`${n} flagg`;
// The line after the answer: the capital, a note, and the flags very like it side by side (FLAGG_TWINS)
function fgFact(f){
  const twins=(FLAGG_TWINS.find(g=>g.includes(f.c))||[]).map(c=>FLAGG.find(x=>x.c===c));
  const side=twins.length?`<span class="fgtwins">${twins.map(x=>`<figure${x===f?' class="me"':''}><img src="${FG_IMG(x)}" alt=""><figcaption>${x.n}</figcaption></figure>`).join('')}</span>`:'';
  return (f.kf||L(`Hovedstaden i ${f.n} er ${f.k}.`,`Hovudstaden i ${f.n} er ${f.k}.`))+(f.f?' '+f.f:'')+side;
}
const fgMissLi=f=>`<span class="mxthumb"><img class="fgthumb" src="${FG_IMG(f)}" alt=""></span><div><strong>${f.n}</strong>${f.k?`<small>${f.k}</small>`:''}</div>`;
// dir 'flag': the flag is shown, and the answer is one of six names. dir 'land': the name is
// shown, and the answer is one of four flags.
// Flags that look like f's (FLAGG_LIKE) come first among the wrong options, then any in the pool.
function fgQuestion(f, dir, pool){
  const codes=new Set(FLAGG_LIKE.filter(g=>g.includes(f.c)).flat());
  const rest=pool.filter(x=>x!==f), like=shuffle(rest.filter(x=>codes.has(x.c)));
  const others=[...like,...shuffle(rest.filter(x=>!codes.has(x.c)))].slice(0,dir==='flag'?5:3);
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

// The leave sheet is shared: it goes back in the mode that opened it
let fgLeaveTo=null;
$('fgLeaveStay').addEventListener('click',()=>$('fgLeaveSheet').close());
$('fgLeaveGo').addEventListener('click',()=>{ $('fgLeaveSheet').close(); fgLeaveTo(); });

// A mode of this kind. p is the prefix of its ids in the markup (fgPickView, fgQuiz …); o has
//   mode      its name, for addMode()
//   parts     fgParts() of its countries
//   dirs      {dir: [text, id of its radio button]}, the first one picked to begin with
//   question  (f, dir, pool) → a question for the engine
//   count     n → «N flagg»
//   sub       [the start page's subtitle in «Kviss», in «Pugg»]
//   study     (part) → the HTML of a part in «Pugg»
//   toggle    the labels of «Skjul navn»
//   addMode   options for addMode() ({newUntil})
function fgMakeMode(p, o){
  const id=s=>$(p+s), dirs=Object.keys(o.dirs);
  let dir=dirs[0], part=null;
  const all=()=>shuffle(o.parts[part].list);
  const quiz=makeQuiz(p+'Quiz',{
    ask:f=>o.question(f,dir,o.parts[part].list), newDeck:all,
    buttons:[{act:'retry',cls:'primary',label:L('Øv på dem du bommet på','Øv på dei du bomma på')},
      {act:'restart',cls:'ghost',label:''},{act:'pick',cls:'ghost',label:L('Velg en annen verdensdel','Vel ein annan verdsdel')}],
    actions:{pick:()=>toPick()},
    onFinish(z){ const miss=z.marks().includes('0'); z.button('retry').hidden=!miss; (miss?z.button('retry'):z.button('restart')).focus({preventScroll:true}); }
  });

  // The start page: the way round, then a button for each part of the world
  id('Parts').innerHTML=Object.keys(o.parts).map(k=>`<button type="button" data-part="${k}"><strong>${o.parts[k].n}</strong><span>${o.count(o.parts[k].list.length)}</span></button>`).join('');
  const markDir=radios(Object.fromEntries(dirs.map(d=>[d,o.dirs[d][1]])),d=>{ dir=d; markDir(d); });
  id('Parts').addEventListener('click',e=>{ const b=e.target.closest('[data-part]'); if(b) start(b.dataset.part); });
  function start(k){
    part=k;
    const n=o.parts[k].list.length;
    id('Title').textContent=o.parts[k].n;
    id('PlaySub').textContent=`${o.dirs[dir][0]} · ${o.count(n)}`;
    quiz.button('restart').textContent=n===1?'Start på nytt':`Start på nytt med alle ${n}`;
    view(true); id('Auto').setAttribute('aria-checked',quizAuto());
    history.pushState({fgPlay:true},'',location.href);
    quiz.start(all());
  }
  function view(play){
    id('PickView').hidden=play; id('PlayView').hidden=!play;
    if(!play) quiz.stop();
    window.scrollTo(0,0);
  }
  function toPick(){ if(history.state&&history.state.fgPlay) history.back(); else view(false); }
  // Halfway through a round: at least one answer, and not at the result yet
  const midway=()=>!!quiz.current()&&quiz.marks().length>0;
  let leaving=false;   // the back was confirmed, so the popstate it causes goes through
  const ask=()=>{ fgLeaveTo=()=>{ leaving=true; toPick(); }; $('fgLeaveSheet').showModal(); };
  id('Back').addEventListener('click',()=>midway()?ask():toPick());
  // The back gesture has already left the quiz's entry: put it back while the sheet asks
  addEventListener('popstate',()=>{
    if(id('PlayView').hidden||(history.state&&history.state.fgPlay)) return;
    if(midway()&&!leaving){ history.pushState({fgPlay:true},'',location.href); ask(); return; }
    leaving=false; view(false);
  });
  // «Gå videre av seg selv», the same setting as in Innstillinger, as «Auto» in the quiz's header
  id('Auto').addEventListener('click',()=>{ setQuizAuto(!quizAuto()); id('Auto').setAttribute('aria-checked',quizAuto()); });

  // Study list: by part of the world
  id('StudyGrid').innerHTML=['eu','as','af','na','sa','oc','an'].filter(k=>o.parts[k]).map(k=>
    `<h2 class="chead">${o.parts[k].n}</h2>${o.study(o.parts[k].list.slice().sort((a,b)=>a.n.localeCompare(b.n,'nb')))}`).join('');
  hideAnswers(p+'Toggle',p+'StudyGrid',o.toggle);
  tabs(p+'TabQuiz',p+'TabStudy',p+'Pick',p+'Study',q=>{ id('Sub').textContent=o.sub[q?0:1]; });

  markDir(dir);
  addMode(o.mode,()=>view(false),o.addMode);
}

fgMakeMode('fg',{mode:'flagg', parts:FG_PARTS, question:fgQuestion, count:fgCount,
  dirs:{flag:['Flagg → land','fgDirFlag'], land:['Land → flagg','fgDirLand']},
  sub:[L('Velg retning og verdensdel','Vel retning og verdsdel'),L('Alle flaggene, etter verdensdel','Alle flagga, etter verdsdel')],
  study:list=>`<div class="study fgstudy">${list.map(f=>`<figure tabindex="0"><img src="${FG_IMG(f)}" alt="" loading="lazy"><figcaption class="ans"><strong>${f.n}</strong>${f.k?`<span>${f.k}</span>`:''}</figcaption></figure>`).join('')}</div>`,
  toggle:L(['Skjul navn','Vis navn'],['Skjul namn','Vis namn'])});

// Mixed quiz: any country in the world (not Antarctica), either way round, wrong options from all of them
MIX.flagg={label:'Flagg', deal(n){
  const pool=FG_PARTS.all.list;
  return shuffle(pool).slice(0,n).map(f=>fgQuestion(f,rnd()<.5?'flag':'land',pool));
}};
