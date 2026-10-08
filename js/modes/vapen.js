// ---------- Våpenskjold ----------
const vReg=[];
// A file is a Commons name, or a full URL (e.g. Commons' own PNG rendering of an SVG).
// Each Commons SVG gets Commons' PNG rendering of it (?width=500) as a last resort.
const vCands=f=>{ const u=(f.wd?[f.wd]:[]).concat(f.files.map(n=>/^https:/.test(n)?n:WM(n)));
  return [...new Set(u.concat(u.filter(x=>/Special:FilePath\/[^?]+\.svg$/i.test(x)).map(x=>x+'?width=500')))]; };
function vImgify(list){ list.forEach(f=>{ const g=vReg.push(f)-1; f.g=g; f.draw=f.svg;
  f.svg=()=>`<img class="coa" src="${vCands(f)[0]}" data-g="${g}" data-i="0" alt="Våpen" referrerpolicy="no-referrer">`; }); }
vImgify(FYLKER); vImgify(KOMMUNER);
document.addEventListener('error',e=>{
  const el=e.target; if(!el.classList||!el.classList.contains('coa')) return;
  const f=vReg[+el.dataset.g], c=vCands(f), i=+el.dataset.i+1;
  if(i<c.length){ el.dataset.i=i; el.src=c[i]; } else { el.outerHTML=f.draw(); }
},true);
const SETS={
  fylker:{list:FYLKER, sub:'De 15 fylkene fra 2024', q:'Hvilket fylke er dette?', kind:'Fylkesvåpen'},
  kommuner:{list:KOMMUNER, sub:'De 30 største kommunene (folketall 1. januar 2026)', q:'Hvilken kommune er dette?', kind:'Kommunevåpen'}
};

// Ask Wikidata which image is the *current* coat of arms (P94, best rank) for each
// active Norwegian municipality (P31 = Q755707, no dissolution date P576).
const V_WD_KEY='wd-kommunevapen-v1';
function vApplyWD(map){
  KOMMUNER.forEach(f=>{ const u=map[f.name]; if(!u||f.noWD) return; const url=u.replace(/^http:/,'https:'); // noWD: our own file list wins
    if(f.wd===url) return; f.wd=url;
    document.querySelectorAll(`img.coa[data-g="${f.g}"]`).forEach(el=>{ el.dataset.i='0'; el.src=url; });
  });
}
async function vLoadWD(){
  const c=store.getJSON(V_WD_KEY); if(c&&c.m&&serverNow()-c.t<7*864e5){ vApplyWD(c.m); return; }
  const vals=KOMMUNER.map(f=>JSON.stringify(f.name)+'@nb').join(' ');
  const q=`SELECT ?name ?img WHERE { VALUES ?name { ${vals} } ?item rdfs:label ?name; wdt:P31 wd:Q755707; wdt:P94 ?img. FILTER NOT EXISTS { ?item wdt:P576 ?end } }`;
  try{
    const r=await fetch('https://query.wikidata.org/sparql?format=json&query='+encodeURIComponent(q),{headers:{Accept:'application/sparql-results+json'}});
    if(!r.ok) return;
    const j=await r.json(), m={};
    j.results.bindings.forEach(b=>{ const n=b.name.value; if(!m[n]) m[n]=b.img.value; });
    vApplyWD(m);
    store.setJSON(V_WD_KEY,{t:serverNow(),m});
  }catch(e){ /* offline or blocked: static file list is used */ }
}
vLoadWD();
// A question about arms i in set S (SETS.fylker or SETS.kommuner), for the quiz here and the mixed one
function vQuestion(S,i){
  const list=S.list, f=list[i];
  return {q:S.q, cls:'shield', prompt:()=>f.svg(),
    opts:shuffle([i,...otherIx(list.length,i)]).map(k=>({label:list[k].name,ok:k===i})),
    fact:f.motif, miss:`<figure>${f.svg()}<figcaption>${f.name}</figcaption></figure>`};
}
let vSet=SETS.fylker;
const vAll=()=>shuffle(vSet.list.map((_,i)=>i));
const vQuiz=makeQuiz('quizView',{ask:i=>vQuestion(vSet,i), newDeck:vAll, missed:'minigrid'});

// Mixed quiz: any of the arms, county or municipality
MIX.vapen={label:'Våpenskjold', deal(n){
  return shuffle([SETS.fylker,SETS.kommuner].flatMap(S=>S.list.map((_,cur)=>({S,cur})))).slice(0,n).map(({S,cur})=>{
    const f=S.list[cur];
    return {...vQuestion(S,cur), miss:`<span class="mxthumb">${f.svg()}</span><div><strong>${f.name}</strong><small>${S.kind}</small></div>`};
  });
}};

// Study view
function vRenderStudy(){
  $('studyGrid').innerHTML = vSet.list.map(f=>`<figure tabindex="0">${f.svg()}<figcaption class="ans"><strong>${f.name}</strong><span>${f.motif}</span></figcaption></figure>`).join('');
}
const vHideNames=hideAnswers('toggleNames','studyGrid',['Skjul navn','Vis navn']);
tabs('tabQuiz','tabStudy','quizView','studyView',()=>vQuiz.stop());

const vMarkSet=radios({fylker:'setF',kommuner:'setK'},key=>vUse(key));
function vUse(key){
  vSet=SETS[key];
  vMarkSet(key);
  $('sub').textContent=vSet.sub;
  vQuiz.button('restart').textContent=`Start på nytt med alle ${vSet.list.length}`;
  vHideNames(false);
  vRenderStudy(); vQuiz.start(vAll());
}
vUse('fylker');
addMode('vapen');
$('modeShieldIcon').innerHTML=shield(V,'rogaland');   // on the home page
