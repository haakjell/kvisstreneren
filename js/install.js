// ---------- Add to home screen ----------
// The button shows on touch devices only, and never once the page runs as an installed app.
// Chrome on Android hands us a native install prompt (beforeinstallprompt); everywhere else,
// notably iOS, which has no such prompt, the button opens a sheet with the steps.
// Chrome may also show its own install banner unprompted; we let it, unless the user has
// asked us to stop ("Ikke vis knappen igjen").
let installEvt=null;
const isIOS=/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
const installHidden=()=>store.get('installHidden')==='1';
// A touch device, not already running as the installed app: the button is offered (and its switch in Innstillinger)
const installable=!(matchMedia('(display-mode: standalone)').matches || navigator.standalone===true)
  && matchMedia('(hover:none) and (pointer:coarse)').matches;
const installShow=()=>{ $('installBtn').hidden=installHidden()||!installable; };
installShow();
addEventListener('beforeinstallprompt',e=>{ if(installHidden()) e.preventDefault(); installEvt=e; });
addEventListener('appinstalled',()=>{ installEvt=null; $('installBtn').hidden=true; });
$('installBtn').addEventListener('click',async()=>{
  if(installEvt){
    const e=installEvt; installEvt=null;   // a prompt can only be shown once
    e.prompt();
    if((await e.userChoice).outcome==='accepted') $('installBtn').hidden=true;
    return;
  }
  $('installIOS').hidden=!isIOS; $('installOther').hidden=isIOS;
  $('installSheet').showModal();
});
document.querySelectorAll('dialog.sheet').forEach(sheet=>sheet.addEventListener('click',e=>{   // tap on the backdrop above the sheet
  if(e.target===sheet && e.clientY<sheet.getBoundingClientRect().top) sheet.close();
}));
$('installClose').addEventListener('click',()=>$('installSheet').close());
$('installNever').addEventListener('click',()=>{
  store.set('installHidden','1');
  $('installBtn').hidden=true; $('installSheet').close();
});
