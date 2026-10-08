// ---------- Innstillinger ----------
// The page behind the cog on the home page. Each setting lives with the code that uses it, and is
// stored there: autoNext (quiz.js), cPics (Hotel Cæsar), tMapKind (T-banen), theme (theme.js) and
// installHidden (install.js). This page only shows them and changes them through the same functions
// as the modes' own switches, so the two always agree; open() reads them again each time.
const stSwitch=(id,on)=>$(id).setAttribute('aria-checked',on);

$('stAuto').addEventListener('click',()=>{ const on=!quizAuto(); store.set('autoNext',on?null:'0'); stSwitch('stAuto',on); });
$('stPics').addEventListener('click',()=>{ cSetPics(!cPics); stSwitch('stPics',cPics); });
const stMarkMap=radios({geo:'stMapGeo',ruter:'stMapRuter'},k=>{ tSetKind(k); stMarkMap(k); });
const stMarkTheme=radios({auto:'stThemeAuto',light:'stThemeLight',dark:'stThemeDark'},k=>{
  const t=k==='auto'?null:k;
  store.set('theme',t); applyTheme(t); stMarkTheme(k);
});
$('stInstall').addEventListener('click',()=>{
  const on=installHidden();   // hidden now: show it again
  store.set('installHidden',on?null:'1'); installShow(); stSwitch('stInstall',on);
});

function stOpen(){
  stSwitch('stAuto',quizAuto());
  stSwitch('stPics',cPics);
  stMarkMap(tKind);
  stMarkTheme(document.documentElement.dataset.theme||'auto');
  $('stInstallRow').hidden=!installable;
  stSwitch('stInstall',!installHidden());
}
addMode('settings',stOpen);
