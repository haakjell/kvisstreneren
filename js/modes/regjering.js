// ---------- Regjeringen ----------
const RG_DECK=10;
const rgLow=p=>p[0].toLowerCase()+p.slice(1);
let rgMode='person', rgQueue=[];
const rgSrc=e=>e.f?WM(e.f)+'?width=320':'';
const rgPic=(e,cls,alt='')=>e.f?`<img class="${cls}" src="${rgSrc(e)}" alt="${alt}">`:'';
function rgPreload(deck){ deck.forEach(q=>{ const src=rgSrc(STATSRAD[q.i]); if(src) new Image().src=src; }); }

// Rounds walk through a shuffled queue, so everyone comes up before any repeats
function rgNewDeck(){
  if(rgQueue.length<RG_DECK) rgQueue=rgQueue.concat(shuffle(STATSRAD.map((_,i)=>i).filter(i=>!rgQueue.includes(i))));
  return rgQueue.splice(0,RG_DECK).map(i=>({i,dir:rgMode}));
}
// dir 'person': the name and picture are shown and the answer is the post.
// dir 'post': the post is shown, without a picture, and the answer is the name.
function rgOptions(q){
  const e=STATSRAD[q.i], others=shuffle(STATSRAD.filter(x=>x!==e)).slice(0,5);
  return q.dir==='person'
    ? shuffle([{label:e.p,ok:true},...others.map(x=>({label:x.p,info:`${x.p} er ${x.n}.`}))])
    : shuffle([{label:e.n,ok:true},...others.map(x=>({label:x.n,info:`${x.n} er ${rgLow(x.p)}.`}))]);
}
const rgQText=q=>q.dir==='person'?'Hvilken post har statsråden?':'Hvem har posten?';
// The picture is part of the question for 'person', and shows up after answering for 'post'
function rgPromptHTML(q,answered){
  const e=STATSRAD[q.i];
  if(q.dir==='person') return rgPic(e,'cpic','Bilde av statsråden')+`<small>Statsråd</small><strong>${e.n}</strong>`;
  return (answered?rgPic(e,'cpic',e.n):'')+`<small>Post</small><strong class="rgpost">${e.p}</strong>`;
}
const rgFact=e=>`${e.n} har vært ${rgLow(e.p)} siden ${e.s} (${e.d}).`;
// A question about member q = {i, dir}. The answer to 'person' is a post, which reads in lower case
// after «Det var».
function rgQuestion(q){
  const e=STATSRAD[q.i];
  return {q:rgQText(q), cls:'cprompt', prompt:()=>rgPromptHTML(q,false),
    reveal:q.dir==='post'?()=>rgPromptHTML(q,true):undefined,
    opts:rgOptions(q), answer:q.dir==='person'?rgLow(e.p):e.n, fact:rgFact(e),
    miss:`${rgPic(e,'thumb')}<div><strong>${e.n}</strong><small>${e.p}</small></div>`};
}
const rgQuiz=makeQuiz('rgQuiz',{ask:rgQuestion, newDeck:rgNewDeck, onStart:rgPreload});

// Study list: post, name and since when. The names can be hidden and revealed one by one.
function rgRenderStudy(){
  const li=e=>{ const pic=rgPic(e,'thumb'); return `<li tabindex="0"${pic?' class="pic"':''}>${pic}<strong>${e.p}</strong><span class="act ans">${e.n}</span><small>Siden ${e.s}</small></li>`; };
  $('rgStudyList').innerHTML=`<h2 class="chead">Støres regjering</h2><ul class="clist">${STATSRAD.map(li).join('')}</ul>`;
}
hideAnswers('rgToggle','rgStudyList',['Skjul navn','Vis navn']);
dropBrokenPics('regjeringApp');
tabs('rgTabQuiz','rgTabStudy','rgQuiz','rgStudy',()=>rgQuiz.stop());
const RG_SUBS={person:'Finn posten',post:'Finn statsråden'};
const rgMarkMode=radios({person:'rgSetPerson',post:'rgSetPost'},m=>rgUse(m));
function rgUse(m){
  rgMode=m;
  rgMarkMode(m);
  $('rgSub').textContent=RG_SUBS[m];
  rgQuiz.start(rgNewDeck());
}
function rgOpen(){ if(!rgQuiz.started()){ rgRenderStudy(); rgUse('person'); } }
addMode('regjering',rgOpen,{newUntil:'2026-10-14 19:00'});
$('rgNote').textContent=`Statsrådene per ${RG_ASOF}: regjeringen.no og Wikipedia. Bilder: Wikimedia Commons.`;
