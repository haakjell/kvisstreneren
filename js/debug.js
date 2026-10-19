// ---------- Debug ----------
// An overview of the test switches in the address (?captcha=…), with links, plus the
// modes, the clocks and what is in localStorage. It only exists behind a secret query parameter:
// only its hash (seedOf() in core.js) is here, so the name isn't in the source. Without it, #debug
// is an unknown hash and gives the home page. With it and no hash, the page opens on #debug.
const DB_KEY=4181429119;
const DEBUG=[...new URLSearchParams(location.search).keys()].some(k=>seedOf(k)===DB_KEY);

// Each test switch the page reads from the address: the query, what it does, and links to try it
const DB_FLAGS=[
  {q:'captcha=robot', what:L('Later som det er den første captcha-uka: «Jeg er ikke en kvissmaster» (captcha.js).',
                             'Lèt som det er den første captcha-veka: «Jeg er ikke en kvissmaster» (captcha.js).'),
   links:['?captcha=robot#prep']},
  {q:'captcha=text', what:L('Later som det er den andre captcha-uka: den forvrengte teksten (captcha.js).',
                            'Lèt som det er den andre captcha-veka: den forvrengde teksten (captcha.js).'),
   links:['?captcha=text#prep']},
];

const dbEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dbTime=t=>new Date(osloWall(t)).toISOString().slice(0,19).replace('T',' ');

function dbStore(){
  let keys=[];
  try{ keys=Object.keys(localStorage).sort(); }catch(e){}
  $('dbStore').innerHTML=keys.length ? keys.map(k=>{
    const v=store.get(k)??'';
    return `<li><code>${dbEsc(k)}</code> <span class="dbval">${dbEsc(v.length>80?v.slice(0,80)+'…':v)}</span>
      <button class="linkbtn" data-key="${dbEsc(k)}">Slett</button></li>`;
  }).join('') : `<li class="dbnone">Ingenting</li>`;
  $('dbClear').hidden=!keys.length;
}

function dbOpen(){
  // Just the links; what the switch does folds out from the arrow
  $('dbFlags').innerHTML=DB_FLAGS.map(f=>`<li><details><summary>
    <span class="dblinks">${f.links.map(h=>`<a href="${h}">${h}</a>`).join('')}</span></summary><p>${f.what}</p></details></li>`).join('');
  $('dbModes').innerHTML=Object.keys(MODES).filter(k=>k!=='debug').map(k=>`<li><a href="#${k}">#${k}</a></li>`).join('');
  const now=serverNow();
  const rows=[
    [L('Serverens klokke','Klokka til serveren'), serverClock ? dbTime(now) : L('ikke spurt ennå','ikkje spurd enno')],
    [L('Enhetens klokke','Klokka til eininga'), dbTime(Date.now())],
    ['Avvik', serverClock ? Math.round((Date.now()-now)/1000)+' s' : '–'],
    [L('Kvissen pågår','Kvissen er i gang'), quizLive(now) ? 'ja' : 'nei'],
    ['Captcha', captchaDue(now) || 'ingen'],
    ['Språk', LANG],
  ];
  $('dbStatus').innerHTML=rows.map(([k,v])=>`<dt>${k}</dt><dd>${dbEsc(v)}</dd>`).join('');
  dbStore();
}

if(DEBUG){
  $('dbStore').addEventListener('click',e=>{ const k=e.target.dataset.key; if(k!=null){ store.set(k,null); dbStore(); } });
  $('dbClear').addEventListener('click',()=>{ try{ localStorage.clear(); }catch(e){} dbStore(); });
  if(!location.hash) history.replaceState(null,'','#debug');
  addMode('debug',dbOpen);
}
