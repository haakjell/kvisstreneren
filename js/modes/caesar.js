// ---------- Hotel Cæsar ----------
const C_DECK=10;
const cActors=e=>[e.a,...(e.also||[])];
const cTop=CAESAR.map((_,i)=>i).filter(i=>CAESAR[i].top);
let cMode='role', cQueue=[];
// Pictures are on unless turned off. Fandom refuses a foreign Referer, hence no-referrer.
let cPics=true;
cPics=store.get('cPics')!=='0';
const cPic=(e,cls,alt='')=>cPics&&CAESAR_IMG[e.r]?`<img class="${cls}" src="${CAESAR_IMG[e.r]}" alt="${alt}" referrerpolicy="no-referrer">`:'';
function cPreload(deck){
  if(cPics) deck.forEach(q=>{ const src=CAESAR_IMG[CAESAR[q.i].r]; if(src){ const im=new Image(); im.referrerPolicy='no-referrer'; im.src=src; } });
}

// Rounds walk through a shuffled queue of the top roles, so all of them come up before any repeats
function cNewDeck(){
  if(cQueue.length<C_DECK) cQueue=cQueue.concat(shuffle(cTop.filter(i=>!cQueue.includes(i))));
  return cQueue.splice(0,C_DECK).map(i=>({i,dir:cMode}));
}
// dir 'role': the role is shown and the answer is an actor. dir 'actor': the other way round.
function cOptions(q){
  const e=CAESAR[q.i], same=x=>x.g===e.g;
  if(q.dir==='role'){
    const mine=new Set(cActors(e)), seen=new Set();
    const inside=shuffle(CAESAR.filter(x=>x!==e&&!mine.has(x.a)))
      .filter(x=>!seen.has(x.a)&&seen.add(x.a))
      .sort((x,y)=>same(y)-same(x)).slice(0,3)
      .map(x=>({label:x.a,info:L(`${x.a} spilte ${x.r}.`,`${x.a} spelte ${x.r}.`)}));
    const outside=shuffle(CAESAR_OUT).sort((x,y)=>same(y)-same(x)).slice(0,5-inside.length)
      .map(x=>({label:x.a,info:`${x.a} var aldri med i Hotel Cæsar.`}));
    return shuffle([{label:e.a,ok:true},...inside,...outside]);
  }
  const others=shuffle(CAESAR.filter(x=>x!==e&&!cActors(x).some(a=>a===e.a)))
    .sort((x,y)=>same(y)-same(x)).slice(0,5)
    .map(x=>({label:x.r,info:L(`${x.r} ble spilt av ${x.a}.`,`${x.r} vart spelt av ${x.a}.`)}));
  return shuffle([{label:e.r,ok:true},...others]);
}
const cQText=q=>q.dir==='role'?L('Hvem spilte rollen?','Kven spelte rolla?'):L('Hvilken rolle spilte skuespilleren?','Kva rolle spelte skodespelaren?');
function cPromptHTML(q){
  const e=CAESAR[q.i];
  return cPic(e,'cpic','Bilde av rollefiguren')+`<small>${q.dir==='role'?'Rollefigur':L('Skuespiller','Skodespelar')}</small><strong>${q.dir==='role'?e.r:e.a}</strong>`;
}
function cFact(e){ const y=e.y?` (${e.y})`:''; return L(`${e.a} spilte ${e.r}${y}. ${e.n}`,`${e.a} spelte ${e.r}${y}. ${e.n}`); }
const cMissLi=q=>{const e=CAESAR[q.i]; return `${cPic(e,'thumb')}<div><strong>${e.r}</strong><small>${e.a}</small></div>`;};
// A question about role q = {i, dir}, for the quiz here and the mixed one
function cQuestion(q){
  const e=CAESAR[q.i];
  return {q:cQText(q), cls:'cprompt', prompt:()=>cPromptHTML(q), fact:cFact(e), miss:()=>cMissLi(q), opts:cOptions(q)};
}
const cQuiz=makeQuiz('cQuiz',{ask:cQuestion, newDeck:cNewDeck, onStart:cPreload});

// Mixed quiz: the top roles, role → actor only
MIX.caesar={label:'Hotel Cæsar', deal(n){
  const deck=shuffle(cTop).slice(0,n).map(i=>({i,dir:'role'}));
  cPreload(deck);
  return deck.map(q=>({...cQuestion(q), miss:cMissLi(q)}));
}};

// Study list
function cRenderStudy(){
  const li=e=>{ const pic=cPic(e,'thumb'); return `<li tabindex="0"${pic?' class="pic"':''}>${pic}<strong>${e.r}</strong><span class="act ans">${cActors(e).join(' / ')}</span><small>${e.y?e.y+'. ':''}${e.n}</small></li>`; };
  $('cStudyList').innerHTML=`<h2 class="chead">${L(`De ${cTop.length} største rollene`,`Dei ${cTop.length} største rollene`)}</h2><ul class="clist">${cTop.map(i=>li(CAESAR[i])).join('')}</ul>`+
    `<h2 class="chead">${L('Flere rollefigurer','Fleire rollefigurar')}</h2><ul class="clist">${CAESAR.filter(e=>!e.top).map(li).join('')}</ul>`;
}
hideAnswers('cToggle','cStudyList',L(['Skjul skuespillere','Vis skuespillere'],['Skjul skodespelarar','Vis skodespelarar']));
// «Vis bilder», here and in Innstillinger
function cSetPics(on){
  cPics=on; $('cPics').setAttribute('aria-checked',on);
  store.set('cPics',on?'1':'0');
  // On the result screen there is no question left to redraw, only the list of misses
  cQuiz.redrawBox(); cQuiz.renderMissed(); cPreload(cQuiz.upcoming());
  cRenderStudy();
}
$('cPics').setAttribute('aria-checked',cPics);
$('cPics').addEventListener('click',()=>cSetPics(!cPics));
dropBrokenPics('caesarApp');
dropBrokenPics('dagensApp');
// The question type only matters to the quiz, so it is hidden in «Pugg»
tabs('cTabQuiz','cTabStudy','cQuiz','cStudy',q=>{ cQuiz.stop(); $('cSets').hidden=!q; });
const C_SUBS={role:L('Finn skuespilleren','Finn skodespelaren'),actor:L('Finn rollen','Finn rolla')};
const cMarkMode=radios({role:'cSetRole',actor:'cSetActor'},m=>cUse(m));
function cUse(m){
  cMode=m;
  cMarkMode(m);
  $('cSub').textContent=C_SUBS[m];
  cQuiz.start(cNewDeck());
}
function cOpen(){ if(!cQuiz.started()){ cRenderStudy(); cUse('role'); } }
addMode('caesar',cOpen);
$('cNote').textContent=L('Roller og skuespillere: IMDb, Wikipedia og Hotel Cæsar-wikien. Bilder: Hotel Cæsar-wikien på Fandom. Spørsmålene gjelder de '+cTop.length+' rollene med flest episoder; de andre rollefigurene dukker opp som feil alternativer.',
  'Roller og skodespelarar: IMDb, Wikipedia og Hotel Cæsar-wikien. Bilde: Hotel Cæsar-wikien på Fandom. Spørsmåla gjeld dei '+cTop.length+' rollene med flest episodar; dei andre rollefigurane dukkar opp som feil alternativ.');
// The original Hotel Cæsar logo (1998): an Ionic capital whose volutes curl round a battlemented
// column (red and orange in the original; here in the colour theme's ink and accent). Each volute is a stem up the side of the column that turns into a spiral;
// R is the spiral's radius every quarter turn, and m mirrors it for the right-hand side.
function cVolute(m){
  const X=x=>m?1206-x:x, R=[160,158,152,142,94,68,62,46,26];
  let d=`M${X(448)} 652Q${X(482)} 430 ${X(460)} 245`;
  for(let t=.25;t<=4*Math.PI;t+=.25){
    const k=t/(Math.PI/2), i=Math.min(Math.floor(k),R.length-2), r=R[i]+(R[i+1]-R[i])*(k-i);
    d+=`L${X(300+r*Math.cos(t)).toFixed(0)} ${(245-r*Math.sin(t)).toFixed(0)}`;
  }
  return `<path d="${d}"/>`;
}
$('modeCaesarIcon').innerHTML=`<svg viewBox="100 50 1006 624" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="var(--ink)" stroke-width="34" stroke-linecap="round" stroke-linejoin="round">${cVolute(0)+cVolute(1)}</g>
  <g fill="var(--accent)">
    <rect x="470" y="84" width="266" height="44" rx="8"/>
    <path fill-rule="evenodd" d="M498 188L520 176L518 144Q536 124 554 144L556 158Q603 176 650 158L652 144Q670 124 688 144L686 176L708 188L660 292L714 652H492L546 292Z
      M568 300H580L582 652H540Z M626 300H638L666 652H624Z"/>
  </g>
</svg>`;
