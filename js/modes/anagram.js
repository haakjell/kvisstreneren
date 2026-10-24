// ---------- Anagram ----------
// A road on a map, up the screen in a zigzag, with a stop for each anagram (ANAGRAMS) and the
// treasure chests between them (ANAGRAM_CHESTS), in the same order for everyone. The next stop
// opens when the one before is done: an anagram solved, or a chest opened. Unless the road ends
// in a chest that is still shut, a cloud at the top says more are coming. An anagram opens on its
// own page (#agPlayView, #agPlay) where the name is typed in: every letter must be right, case
// aside (spaces and hyphens don't count), and the answer is simply right or wrong. A chest opens
// on the same page (#agChest), and shows its prize; the first unlocks the gold countdown. Done stops can be opened again. Progress is
// stored in localStorage under 'anagram' as {done:[names], chests:[ids]}, by name and id, so new
// anagrams and chests can be added at the end without upsetting it. Not in Dagens kviss: it has
// no options, and its order is fixed.
const AG_STEP=118, AG_BOTTOM=96;   // px between stops, and below the first
const agTop=cloud=>cloud?150:80;   // px above the last stop: room for the cloud's text, or for a chest
let agDone=[], agOpened=[], agOpenAt=null, agFresh=-1;

// The letters that count, in lower case: æ, ø and å are letters of their own
const agLetters=s=>s.toLowerCase().replace(/[^\p{L}]/gu,'');
// The anagram with a capital letter at the start of each word
const agTitle=a=>a.split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
function agLoad(){
  const s=store.getJSON('anagram');
  agDone=Array.isArray(s?.done)?s.done:[]; agOpened=Array.isArray(s?.chests)?s.chests:[];
}
function agSave(){ store.setJSON('anagram',{done:agDone,chests:agOpened}); agTeaser(); }
const agIsDone=x=>agDone.includes(x.n);
// The gold countdown: unlocked by opening its chest, then switched on and off (here and in
// Innstillinger), stored under 'goldCountdown' ('1' = on) and drawn by applyGold() in theme.js
const agUnlocked=u=>ANAGRAM_CHESTS.some(c=>c.unlock===u&&agOpened.includes(c.id));
const agGold=()=>store.get('goldCountdown')==='1';
function agSetGold(on){ store.set('goldCountdown',on?'1':null); applyGold(on); }
const agCount=()=>ANAGRAMS.filter(agIsDone).length;

// The stops on the road, from the bottom: {x, i} for anagram number i, {c} for a chest
function agStops(){
  const s=[];
  ANAGRAMS.forEach((x,i)=>{ s.push({x,i}); ANAGRAM_CHESTS.filter(c=>c.after===i+1).forEach(c=>s.push({c})); });
  return s;
}
const agStopDone=s=>s.c?agOpened.includes(s.c.id):agIsDone(s.x);
// The cloud comes after the last stop, unless that is a chest still shut: then it is the goal
const agCloud=st=>!st.length||!st[st.length-1].c||agStopDone(st[st.length-1]);

// Where stop k is: x in % of the width (a winding road; chests and the cloud in the middle), y in
// px from the top. n is the number of places on the road, the cloud included.
const agX=(k,s)=>!s||s.c?50:50+28*Math.round(Math.sin(k*Math.PI/2));
const agH=(n,cloud)=>agTop(cloud)+(n-1)*AG_STEP+AG_BOTTOM;
// The road from the start through points pts[0..to], as an SVG path (x 0–100, y in px), from point `from`
function agRoad(pts,from,to,H){
  let [x,y]=from?pts[from-1]:[50,H-18], d=`M${x} ${y}`;
  for(let k=from;k<=to;k++){ const [x1,y1]=pts[k], m=(y+y1)/2; d+=` C${x} ${m} ${x1} ${m} ${x1} ${y1}`; [x,y]=[x1,y1]; }
  return d;
}
const AG_CHECK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const AG_LOCK='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" stroke-width="2.6"/></svg>';
const AG_TREE='<svg viewBox="0 0 40 52" aria-hidden="true"><rect x="17" y="34" width="6" height="16" rx="3" fill="var(--muted)" opacity=".5"/><circle cx="20" cy="22" r="18" fill="var(--accent2)"/></svg>';
// A treasure chest, shut or open. Both lids are drawn, so the opening can be animated (.open).
function agChestSVG(open){
  return `<svg class="agchestsvg${open?' open':''}" viewBox="-10 -24 120 110" aria-hidden="true">
    <g class="agrays" stroke="var(--accent2)" stroke-width="5" stroke-linecap="round"><path d="M50 -4V-20M26 2L16 -10M74 2L84 -10M12 20H-4M88 20H104"/></g>
    <rect x="10" y="40" width="80" height="42" rx="7" fill="var(--accent)" stroke="var(--ink)" stroke-width="4"/>
    <path d="M24 40v42M76 40v42" stroke="var(--accent2)" stroke-width="7"/>
    <g class="agopenlid"><rect class="agmouth" x="14" y="30" width="72" height="12" rx="3"/><path d="M12 32L18 6Q50 -4 82 6L88 32Z" fill="var(--accent)" stroke="var(--ink)" stroke-width="4" stroke-linejoin="round"/></g>
    <g class="agshutlid"><path d="M10 44V30Q10 12 50 12Q90 12 90 30V44Z" fill="var(--accent)" stroke="var(--ink)" stroke-width="4" stroke-linejoin="round"/><path d="M24 15v29M76 15v29" stroke="var(--accent2)" stroke-width="7"/></g>
    <rect x="42" y="34" width="16" height="18" rx="4" fill="var(--accent2)" stroke="var(--ink)" stroke-width="3.5"/>
  </svg>`;
}

function agRenderMap(){
  const st=agStops(), cur=st.findIndex(s=>!agStopDone(s)), cloud=agCloud(st), n=st.length+(cloud?1:0), H=agH(n,cloud), y=k=>H-AG_BOTTOM-k*AG_STEP;
  const pts=[...st.map((s,k)=>[agX(k,s),y(k)]), ...(cloud?[[50,y(st.length)]]:[])];
  const node=(s,k)=>{
    const [x,y]=pts[k], state=agStopDone(s)?'solved':k===cur?'cur':'locked', fresh=k===agFresh?' fresh':'';
    const at=`data-k="${k}" style="left:${x}%;top:${y}px"${state==='locked'?' disabled':''}`;
    let btn, label, aria;
    if(s.c){
      label=state==='solved'?L('Åpnet','Opna'):state==='cur'?L('Åpne meg!','Opne meg!'):L('Skattekiste','Skattekiste');
      aria=state==='solved'?L('Skattekista, åpnet','Skattekista, opna'):state==='cur'?L('Skattekista: åpne den','Skattekista: opne henne'):L('Skattekista, låst','Skattekista, låst');
      btn=`<button class="agnode chest ${state}${fresh}" ${at} aria-label="${aria}">${agChestSVG(state==='solved')}</button>`;
    } else {
      const x=s.x, i=s.i;
      label=state==='solved'?x.n:state==='cur'?x.h:'';
      aria=state==='solved'?L(`Anagram ${i+1}, løst: ${x.n}`,`Anagram ${i+1}, løyst: ${x.n}`):state==='cur'?`Anagram ${i+1}, ${x.h}`:`Anagram ${i+1}, låst`;
      btn=`<button class="agnode ${state}${fresh}" ${at} aria-label="${aria}">${state==='solved'?AG_CHECK:state==='locked'?AG_LOCK:i+1}</button>`;
    }
    const side=x>50?`right:calc(${100-x}% + ${s.c?64:46}px)`:`left:calc(${x}% + ${s.c?64:46}px)`;
    return btn+(label?`<span class="aglabel ${state}" style="${side};top:${y}px">${label}</span>`:'');
  };
  // A tree on the free side of every anagram
  const trees=st.map((s,k)=>s.c?'':`<span class="agtree" style="left:${pts[k][0]<50?86:9}%;top:${pts[k][1]-30}px">${AG_TREE}</span>`).join('');
  const all=cur<0;
  const soon=all
    ?[L('Du har kommet helt til enden!','Du har kome heilt til enden!'),L('Det neste anagrammet er ikke kommet ennå. Kom tilbake senere.','Det neste anagrammet har ikkje kome enno. Kom tilbake seinare.')]
    :[L('Flere kommer','Fleire kjem'),L('Nye anagrammer legges til etter hvert.','Nye anagram blir lagde til etter kvart.')];
  const last=st.length-1, reached=all?last:cur;
  $('agMap').style.height=H+'px';
  $('agMap').innerHTML=`<svg viewBox="0 0 100 ${H}" preserveAspectRatio="none" aria-hidden="true">
      <path class="agroad" d="${agRoad(pts,0,last,H)}"/>${cloud?`<path class="agroad soon" d="${agRoad(pts,last+1,last+1,H)}"/>`:''}
      <path class="agroad walked" d="${agRoad(pts,0,reached,H)}"/>
    </svg>${trees}
    <div class="agstart" style="top:${H-18}px">Start</div>
    ${st.map(node).join('')}
    ${cloud?`<div class="agsoon${all?' all':''}${agFresh===st.length?' fresh':''}" style="left:50%;top:${pts[last+1][1]}px"><strong>${soon[0]}</strong><small>${soon[1]}</small><span class="agcloud" aria-hidden="true">…</span></div>`:''}`;
  agFresh=-1;
}
// The home page's button and the line under the title tell how far you have come
function agTeaser(){
  const st=agStops(), n=agCount(), N=ANAGRAMS.length, chest=st.find(s=>s.c&&!agStopDone(s));
  const t=!n?L('Finn kjendisen bak bokstavene','Finn kjendisen bak bokstavane')
    :n<N?L(`${n} av ${N} løst`,`${n} av ${N} løyste`)
    :chest?L('Skattekista venter!','Skattekista ventar!'):L('Alle løst – flere kommer','Alle løyste – fleire kjem');
  $('agTeaser').textContent=t; $('agSub').textContent=t;
}

// The map, or the page for one stop
function agView(play){
  $('agMapView').hidden=play; $('agPlayView').hidden=!play;
  if(play){ window.scrollTo(0,0); return; }
  $('home').querySelector('.hometitle').before($('countdown'));   // back from the chest's page, if it was there
  agOpenAt=null; agRenderMap(); agScrollToStop();
}
// The stop you're at, or the cloud when all are done, in the middle of the screen
function agScrollToStop(){ const b=$('agMap').querySelector('.agnode.cur')||$('agMap').querySelector('.agsoon'); if(b) b.scrollIntoView({block:'center'}); }
// The page for stop k: an anagram to be solved or solved already (the answer is shown), or a chest
function agOpenStop(k){
  const s=agStops()[k], done=agStopDone(s);
  agOpenAt=s;
  $('agPlay').hidden=!!s.c; $('agChest').hidden=!s.c;
  if(s.c) agShowChest(s.c,done,false);
  else {
    const x=s.x, inp=$('agInput');
    $('agNum').textContent=`Anagram ${s.i+1}`;
    $('agPlaySub').textContent=done?L('Løst','Løyst'):L('Finn kjendisen bak bokstavene','Finn kjendisen bak bokstavane');
    $('agWord').textContent=agTitle(x.a);
    $('agClue').textContent=`(${x.h})`;
    inp.value=done?x.n:''; inp.disabled=done; inp.classList.toggle('ok',done); inp.classList.remove('no');
    $('agCheck').hidden=done;
    $('agFeedback').innerHTML=done?`<div class="motif">${x.f}</div>`:'';
    $('agOn').hidden=!done; $('agOn').textContent='Tilbake til kartet';
  }
  agView(true);
  history.pushState({agPlay:true},'',location.href);
  (s.c?(done?$('agChestOn'):$('agOpenChest')):done?$('agOn'):$('agInput')).focus({preventScroll:true});
}
function agCheck(e){
  e.preventDefault();
  const s=agOpenAt, inp=$('agInput');
  if(!s||s.c||agIsDone(s.x)||!agLetters(inp.value)) return;
  inp.classList.remove('no'); void inp.offsetWidth;   // so a second wrong answer shakes too
  if(agLetters(inp.value)!==agLetters(s.x.n)){
    inp.classList.add('no');
    $('agFeedback').innerHTML='<div class="verdict bad">Feil</div>';
    inp.select(); return;
  }
  agDone.push(s.x.n); agSave();
  agFresh=agStops().findIndex(t=>!agStopDone(t));   // the stop that opens pops in on the map
  inp.value=s.x.n; inp.disabled=true; inp.classList.add('ok'); $('agCheck').hidden=true;
  $('agFeedback').innerHTML=`<div class="verdict ok">${L('Riktig!','Rett!')}</div><div class="motif">${s.x.f}</div>`;
  $('agOn').textContent=L('Videre','Vidare'); $('agOn').hidden=false; $('agOn').focus();
}
// The chest's page: shut with «Åpne kista», or open with its prize (opening: just opened, animated)
function agShowChest(c,open,opening){
  $('agNum').textContent='Skattekista';
  $('agPlaySub').textContent=open?L('Dette lå i kista','Dette låg i kista')
    :L('Du har løst alle anagrammene hit. Hva er det i kista?','Du har løyst alle anagramma hit. Kva er det i kista?');
  $('agBigChest').innerHTML=agChestSVG(open);
  $('agBigChest').classList.toggle('opening',opening);
  $('agPrizeTitle').textContent=c.title;
  $('agPrizeText').replaceChildren(...c.prize.split('\n\n').map(t=>{ const p=document.createElement('p'); p.textContent=t; return p; }));
  $('agPrize').hidden=!open;
  $('agOpenChest').hidden=open; $('agChestOn').hidden=!open;
  // The gold countdown's switch, with the countdown itself above it to show what it does
  const gold=open&&c.unlock==='gold';
  $('agGoldRow').hidden=!gold;
  if(gold){ $('agGoldRow').prepend($('countdown')); $('agGold').setAttribute('aria-checked',agGold()); }
}
$('agOpenChest').addEventListener('click',()=>{
  const s=agOpenAt; if(!s||!s.c||agStopDone(s)) return;
  agOpened.push(s.c.id); agSave();
  const st=agStops(), next=st.findIndex(t=>!agStopDone(t));
  agFresh=next<0?st.length:next;   // the next stop, or the cloud that now shows, pops in
  agShowChest(s.c,true,true); $('agChestOn').focus({preventScroll:true});
});
$('agGold').addEventListener('click',()=>{ agSetGold(!agGold()); $('agGold').setAttribute('aria-checked',agGold()); });
$('agForm').addEventListener('submit',agCheck);
$('agInput').addEventListener('input',()=>{ $('agInput').classList.remove('no'); $('agFeedback').innerHTML=''; });
// The page has its own history entry, so the back gesture goes back to the map, where the stop
// that just opened pops in
function agToMap(){ if(history.state&&history.state.agPlay) history.back(); else agView(false); }
$('agOn').addEventListener('click',agToMap);
$('agChestOn').addEventListener('click',agToMap);
$('agBack').addEventListener('click',agToMap);
addEventListener('popstate',()=>{ if(!$('agPlayView').hidden&&!(history.state&&history.state.agPlay)) agView(false); });
$('agMap').addEventListener('click',e=>{ const b=e.target.closest('.agnode'); if(b&&!b.disabled) agOpenStop(+b.dataset.k); });

function agOpen(){
  agLoad(); agTeaser(); $('agMapView').hidden=false; $('agPlayView').hidden=true; agRenderMap();
  requestAnimationFrame(agScrollToStop);   // goMode() scrolls to the top after this
}
agLoad(); agTeaser();
addMode('anagram',agOpen);
