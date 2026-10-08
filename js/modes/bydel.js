// ---------- Oslos bydeler ----------
let BS=BSETS.old;

// Build a map SVG. hl: index to highlight, cls: extra class map {index:class}, labels: bool
function bMap(hl=-1, cls={}, labels=false, fs=14, set=BS){
  const all=set.list.concat(set.extra);
  let s=`<svg viewBox="8 8 584 636" role="img" aria-label="Kart over Oslos bydeler"><path class="mk" d="${GEO.marka}"/>`;
  all.forEach((b,i)=>{ const c=['bd']; if(b.off) c.push('off'); if(i===hl) c.push('hi'); if(cls[i]) c.push(cls[i]);
    s+=`<path class="${c.join(' ')}" data-i="${b.off?'':i}" d="${b.d}"/>`; });
  if(labels) all.forEach((b,i)=>{ const o=LBL[b.name+'|'+set.key]||{}, [x,y]=o.at||b.l, lines=(o.t||b.name).split('\n'), f=b.off?fs*.75:fs;
    s+=`<text x="${x}" y="${y+f*.35-(lines.length-1)*f*.5}" font-size="${f}" class="${i===hl?'on':''}">${lines.map((t,k)=>`<tspan x="${x}" dy="${k?f:0}">${t}</tspan>`).join('')}</text>`; });
  return s+'</svg>';
}

// A question about district i in set (BSETS.old or BSETS.new), for the quiz here and the mixed one
function bQuestion(set,i){
  const b=set.list[i];
  return {q:set.q, cls:'omap', prompt:()=>bMap(i,{},false,14,set),
    reveal:r=>bMap(i,r.ok?{[i]:'ok'}:{[r.pick.i]:'no'},false,14,set),
    opts:shuffle([i,...otherIx(set.list.length,i)]).map(k=>({label:set.list[k].name,ok:k===i,i:k})),
    fact:`Bydel ${b.num}. ${b.note}`,
    miss:`<figure><div class="omap">${bMap(i,{},false,14,set)}</div><figcaption>${b.name}</figcaption></figure>`};
}
const bAll=()=>shuffle(BS.list.map((_,i)=>i));
const bQuiz=makeQuiz('bQuiz',{ask:i=>bQuestion(BS,i), newDeck:bAll, missed:'minimaps'});

// Mixed quiz: any of the districts, today's or the 2028 ones
MIX.bydel={label:'Bydelene', deal(n){
  return shuffle([BSETS.old,BSETS.new].flatMap(set=>set.list.map((_,cur)=>({set,cur})))).slice(0,n).map(({set,cur})=>{
    const b=set.list[cur];
    return {...bQuestion(set,cur), tag:set.tag,
      miss:`<span class="mxthumb omap">${bMap(cur,{},false,14,set)}</span><div><strong>${b.name}</strong><small>${set.kind}</small></div>`};
  });
}};

// Study
let bSel=-1;
function bRenderStudy(){
  $('bStudyMap').innerHTML=bMap(bSel,{},true,BS.fs);
  const b=BS.list[bSel];
  $('bInfo').innerHTML= b ? `<strong>${b.name}</strong><span>Bydel ${b.num}. ${b.note}</span>` : `<span>Trykk på en bydel i kartet eller et navn under.</span>`;
  $('bChips').innerHTML=BS.list.map((x,i)=>`<button data-i="${i}" aria-pressed="${i===bSel}">${x.name}</button>`).join('');
}
function bSelect(i){ bSel = bSel===i ? -1 : i; bRenderStudy(); }
$('bStudyMap').addEventListener('click',e=>{const p=e.target.closest('path.bd'); if(p&&p.dataset.i!=='') bSelect(+p.dataset.i);});
$('bChips').addEventListener('click',e=>{const el=e.target.closest('button'); if(el) bSelect(+el.dataset.i);});
tabs('bTabQuiz','bTabStudy','bQuiz','bStudy',()=>bQuiz.stop());
const bMarkSet=radios({old:'bSetOld',new:'bSetNew'},key=>bUse(key));
function bUse(key){
  BS=BSETS[key]; bSel=-1;
  bMarkSet(key);
  $('bSub').textContent=BS.sub; $('bNote').textContent=BS.note;
  bQuiz.button('restart').textContent=`Start på nytt med alle ${BS.list.length}`;
  bRenderStudy(); bQuiz.start(bAll());
}
addMode('bydel',()=>{ if(!bQuiz.started()) bUse('old'); });
$('modeMapIcon').innerHTML=bMap(4,{},false,14,BSETS.new);   // on the home page
