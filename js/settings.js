// ---------- Innstillinger ----------
// The page behind the cog on the home page. Each setting lives with the code that uses it, and is
// stored there: lang (core.js), autoNext (quiz.js), cPics (Hotel Cæsar), tMapKind (T-banen), theme
// (theme.js), shakeOff (ads.js) and installHidden (install.js). This page only shows them and changes
// them through the same functions as the modes' own switches, so the two always agree; open() reads them again each time.
const stSwitch=(id,on)=>$(id).setAttribute('aria-checked',on);

// The language is read once, at start-up (core.js), so picking the other one reloads the page
const stMarkLang=radios({nb:'stLangNb',nn:'stLangNn'},k=>{
  if(k===LANG) return;
  store.set('lang',k==='nn'?'nn':null); stMarkLang(k); location.reload();
});
$('stAuto').addEventListener('click',()=>{ const on=!quizAuto(); store.set('autoNext',on?null:'0'); stSwitch('stAuto',on); });
$('stPics').addEventListener('click',()=>{ cSetPics(!cPics); stSwitch('stPics',cPics); });
const stMarkMap=radios({geo:'stMapGeo',ruter:'stMapRuter'},k=>{ tSetKind(k); stMarkMap(k); });
const stMarkTheme=radios({auto:'stThemeAuto',light:'stThemeLight',dark:'stThemeDark'},k=>{
  const t=k==='auto'?null:k;
  store.set('theme',t); applyTheme(t); stMarkTheme(k);
});
// Shaking or ads, like the countdown's own button: two switches, but one setting (shakeOff), so
// they are always opposite: turning the shaking off turns the ads on, and the other way round.
// Only there from the launch, and not for those who ask for less motion (they get neither).
const stMarkShake=()=>{ stSwitch('stShake',!shakeOff); stSwitch('stAdsOn',shakeOff); };
for(const id of ['stShake','stAdsOn']) $(id).addEventListener('click',()=>{ setShakeOff(!shakeOff); stMarkShake(); });
$('stInstall').addEventListener('click',()=>{
  const on=installHidden();   // hidden now: show it again
  store.set('installHidden',on?null:'1'); installShow(); stSwitch('stInstall',on);
});

function stOpen(){
  $('stLangRow').hidden=!launched(serverNow());
  stMarkLang(LANG);
  stSwitch('stAuto',quizAuto());
  stSwitch('stPics',cPics);
  stMarkMap(tKind);
  stMarkTheme(document.documentElement.dataset.theme||'auto');
  $('stShakeRow').hidden=!launched(serverNow())||calmMotion.matches;
  stMarkShake();
  $('stInstallRow').hidden=!installable;
  stSwitch('stInstall',!installHidden());
}
addMode('settings',stOpen);
