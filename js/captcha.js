// ---------- The captcha before Ukas prepp ----------
// For two weeks, Ukas prepp asks for a captcha first, once per week: from Wednesday 21 October
// 10:00 the distorted text, from Wednesday 28 October 09:00 the checkbox («Jeg er ikke en
// kvissmaster»), and from 4 November nothing. Oslo time, by the server's clock. The one solved
// last is kept in localStorage ('captcha'), so each is asked once, and whoever skipped the first
// week gets just the second. ?captcha=text or ?captcha=robot in the address pretends it is that
// week, so they can be tested any day (the answer is still kept).
const CAPTCHAS=[['text','2026-10-21 10:00'],['robot','2026-10-28 09:00']], CAPTCHA_END='2026-11-04 10:00';
const CAPTCHA_TEST=new URLSearchParams(location.search).get('captcha');
const CAPTCHA_WORD='kokkekult';
function captchaDue(now){
  const week=CAPTCHAS.some(c=>c[0]===CAPTCHA_TEST) ? CAPTCHA_TEST
    : now<osloAt(CAPTCHA_END,now) ? CAPTCHAS.filter(c=>now>=osloAt(c[1],now)).map(c=>c[0]).pop() : null;
  return week && store.get('captcha')!==week ? week : null;
}

let capThen=null, capTimer=null;
// Shows the captcha that is due, over the page as it is, and returns true; then() runs once it is
// solved. False if none is due.
function captchaAsk(then){
  const kind=captchaDue(serverNow());
  if(!kind) return false;
  capThen=then;
  const d=$('captchaSheet');
  if(d.open) return true;
  $('capRobot').hidden=kind!=='robot'; $('capText').hidden=kind!=='text';
  $('capRobot').className='cap'; $('capCheck').setAttribute('aria-checked','false');
  $('capInput').value=''; $('capErr').hidden=true;
  if(kind==='text') capDraw();
  d.dataset.kind=kind;
  d.showModal();
  (kind==='text' ? $('capInput') : $('capCheck')).focus();
  return true;
}
function capPass(){
  store.set('captcha',$('captchaSheet').dataset.kind);
  const then=capThen;
  $('captchaSheet').close();
  if(then) then();
}
$('captchaSheet').addEventListener('close',()=>{ clearTimeout(capTimer); capThen=null; });
// No button to cancel: Esc, or a tap outside the box, leaves it (the dialog is only the box)
$('captchaSheet').addEventListener('click',e=>{ if(e.target===$('captchaSheet')) $('captchaSheet').close(); });

// The checkbox: it thinks for a moment, ticks, and lets you in
$('capCheck').addEventListener('click',()=>{
  const rc=$('capRobot');
  if(rc.className!=='cap') return;
  rc.className='cap spin';
  capTimer=setTimeout(()=>{
    rc.className='cap ok'; $('capCheck').setAttribute('aria-checked','true');
    capTimer=setTimeout(capPass,700);
  },1300);
});

// The distorted text: each letter tilted, scaled and moved on its own, lines across, and a
// displacement filter over it all. Drawn anew for each try.
function capDraw(){
  const r=(a,b)=>a+rnd()*(b-a);
  let x=r(12,22), text='', dots='';
  for(const ch of CAPTCHA_WORD){
    const size=r(44,56), y=r(54,68);
    text+=`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${size.toFixed(1)}"${rnd()<.4?' font-style="italic"':''} transform="rotate(${r(-22,22).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})">${ch}</text>`;
    x+=size*r(.47,.54);
  }
  const wave=()=>{ const y0=r(30,70), y1=r(25,75); return `<path d="M${r(0,20).toFixed(1)} ${y0.toFixed(1)} Q${r(80,140).toFixed(1)} ${r(0,100).toFixed(1)} ${r(150,170).toFixed(1)} ${r(30,70).toFixed(1)} T${r(280,300).toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="#333" stroke-width="${r(2,3.5).toFixed(1)}"/>`; };
  for(let i=0;i<70;i++) dots+=`<circle cx="${r(0,300).toFixed(1)}" cy="${r(0,100).toFixed(1)}" r="${r(.6,1.8).toFixed(1)}" fill="#${rnd()<.5?'777':'aaa'}"/>`;
  $('capImg').innerHTML=`<svg viewBox="0 0 300 100" aria-hidden="true"><defs><filter id="capWarp" x="-5%" y="-5%" width="110%" height="110%">`
    +`<feTurbulence type="fractalNoise" baseFrequency="0.018 0.045" numOctaves="2" seed="${Math.floor(r(1,999))}"/>`
    +`<feDisplacementMap in="SourceGraphic" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter></defs>`
    +dots+`<g filter="url(#capWarp)" fill="#222" font-family="Georgia,'Times New Roman',serif" font-weight="700">${text}${wave()}${wave()}</g></svg>`;
}
const capRetry=()=>{ $('capInput').value=''; capDraw(); $('capInput').focus(); };
$('capNew').addEventListener('click',()=>{ $('capErr').hidden=true; capRetry(); });
$('capText').addEventListener('submit',e=>{
  e.preventDefault();
  if($('capInput').value.toLowerCase().replace(/\s+/g,'')===CAPTCHA_WORD) capPass();
  else{ $('capErr').hidden=false; capRetry(); }
});
