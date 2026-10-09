// ---------- Mode switching ----------
// Each mode has its own URL hash (#tbane, #mgp …; the home page has none), so the browser's
// back button, Android's back gesture and reloads all work. Tabs inside a mode are not routed.
// The modes register themselves (addMode() in core.js); the home page is the one view that isn't one.
let curMode=null;
function goMode(m){
  curMode=m; document.body.dataset.mode=m;
  quizzes.forEach(z=>z.stop());
  $('home').hidden=m!=='home';
  for(const k in MODES) $(k+'App').hidden=k!==m;
  document.querySelector('.wrap').classList.toggle('wide',!!MODES[m]?.wide);
  if(m==='home'){
    $('home').querySelector('.hometitle').before($('countdown'));   // back from the prep, if it was there
    renderPrep();   // the button's text; the page may have been open since before the quiz
    renderNewTags();
  } else MODES[m].open();
  $('countdown').after($('adTop'));
  if(adsOn()) fillAds();   // new ads on every page
  window.scrollTo(0,0);
}
// «Ny» in the corner of a mode's button on the home page, until the time in its opts.newUntil
// (Oslo time, by the server's clock). Checked each time the home page is shown.
function renderNewTags(){
  const now=serverNow();
  for(const k in MODES){
    const btn=document.querySelector(`.mode[data-mode="${k}"]`), until=MODES[k].newUntil;
    if(!btn) continue;
    const on=!!until && now<osloInstant(Date.parse(until.replace(' ','T')+'Z'),now);
    const tag=btn.querySelector('.newtag');
    if(on&&!tag) btn.insertAdjacentHTML('beforeend','<span class="newtag">Ny</span>');
    else if(!on&&tag) tag.remove();
  }
}
function hashMode(){ const h=location.hash.slice(1); return h in MODES ? h : 'home'; }
function openMode(m){   // from a button on the home page: a new history entry
  history.pushState({fromHome:true},'','#'+m);
  goMode(m);
}
function goHome(){
  // Came here from the home page: step back, so back/forward don't pile up entries.
  // Opened straight on a mode's URL: swap this entry for the home page instead.
  if(history.state && history.state.fromHome){ history.back(); return; }
  history.replaceState(null,'',location.pathname+location.search);
  goMode('home');
}
function syncMode(){   // back/forward, or a hash typed into the address bar
  const m=hashMode();
  if(location.hash && m==='home') history.replaceState(null,'',location.pathname+location.search);
  if(m!==curMode) goMode(m);
}
window.addEventListener('popstate',syncMode);
window.addEventListener('hashchange',syncMode);
document.querySelectorAll('[data-mode]').forEach(el=>el.addEventListener('click',()=>openMode(el.dataset.mode)));
document.querySelectorAll('[data-home]').forEach(el=>el.addEventListener('click',goHome));
renderPrep();

// Ask the server what time it is (core.js), at start-up and whenever the page comes back on
// screen, and redraw what goes by the date: the countdown, the prep's notice, and Dagens kviss,
// which may be yesterday's (it asks the server itself, in mxOpen()).
async function refreshClock(){
  if(curMode==='dagens'){ mxOpen(); return; }
  if(!await syncClock()) return;
  renderCountdown();
  if(curMode==='home'||curMode==='prep') renderPrep();
  if(curMode==='home') renderNewTags();
}
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') refreshClock(); });

syncMode();
if(curMode!=='dagens') refreshClock();   // Dagens kviss has just asked for itself
