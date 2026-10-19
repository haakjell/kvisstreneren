// ---------- Shaking and ads ----------
// The countdown shakes all week, except while the quiz is on, and the page can show (fake) ads.
// Both can be turned off, each on its own; the choices are kept for good (localStorage 'shakeOff'
// and 'ads'). While the quiz is on there is no button, no shaking and no ads. Those who ask for less motion get none of it.
// Until the two were split, turning the shaking off meant ads instead, so with no 'ads' saved,
// the ads follow 'shakeOff'.
const calmMotion=matchMedia('(prefers-reduced-motion: reduce)');
let shakeOff=store.get('shakeOff')==='1';
let adsWanted=store.get('ads')?store.get('ads')==='1':shakeOff;
let shaking=false, adsShown=false;   // as last applied
// Those who had the ads on when the two were split are told once that they can now turn off both
// (#adsNewsSheet); choosing the ads afterwards counts as having heard it ('adsNewsSeen').
let adsNews=adsWanted&&!store.get('adsNewsSeen');
function adsNewsSeen(){ adsNews=false; store.set('adsNewsSeen','1'); }
const adsOn=()=>adsShown;
// Decides both whether the countdown shakes and whether the ads show. renderCountdown() calls it
// on every tick (with false while the quiz is on), so the ads come and go by themselves.
// Returns whether to shake.
function shakeState(on,now){
  const live=on&&!calmMotion.matches, sh=live&&!shakeOff, ad=live&&adsWanted;
  if(sh!==shaking){
    shaking=sh;
    $('shakeBtn').hidden=!sh;
    if(!sh) $('countdown').classList.remove('tick');
  }
  if(ad!==adsShown){
    adsShown=ad;
    document.body.classList.toggle('ads',ad);
    if(ad) fillAds(); else adGen++;   // drops ads still on their way
  }
  if(ad&&adsNews&&!document.querySelector('dialog[open]')){ adsNewsSeen(); $('adsNewsSheet').showModal(); }
  return sh;
}
function setShakeOff(off){
  shakeOff=off;
  store.set('shakeOff',off?'1':null);
  store.set('ads',adsWanted?'1':'0');   // or 'shakeOff' alone would bring the ads after a reload
  renderCountdown();
}
function setAds(on){
  adsWanted=on;
  store.set('ads',on?'1':'0');
  if(on) adsNewsSeen();
  renderCountdown();
}
calmMotion.addEventListener('change',()=>renderCountdown());

const adPart=(tag,cls,t)=>t?`<${tag} class="${cls}">${t}</${tag}>`:'';
const adArt=ad=>'<div class="adart'+(ad.fit==='contain'?' contain':'')+'"'+(ad.bg?` style="--adbg:${ad.bg}"`:'')+'>'+(ad.img?`<img src="${ad.img}" alt="" onerror="this.remove()">`:'')+(ad.svg||'')+'</div>';
// The advertiser's name; `logo` gives it a little logo of its own (.logo-<name> in ads.css)
const adSrc=ad=>adPart('span','adsrc'+(ad.logo?' logo logo-'+ad.logo:''),ad.src||ad.brand);
const adPrice=ad=>ad.price?`<span class="adprice"><b>${ad.price}</b>${ad.was?' <s>'+ad.was+'</s>':''}</span>`:'';
const AD_TYPES={
  pharma:ad=>adArt(ad)+'<div class="adtxt">'+adSrc(ad)+adPart('b','adhead',ad.head)+adPart('span','adtext',ad.text)+adPart('span','adcta',ad.cta)+adPart('small','adsmall',ad.small)+'</div>',
  clickbait:ad=>adArt(ad)+'<div class="adtxt">'+adPart('b','adhead',ad.head)+adSrc(ad)+'</div>',
  paywall:ad=>adArt(ad)+'<div class="adtxt">'+adPart('span','admast',ad.mast)+adPart('span','adkick',ad.kick)+adPart('b','adhead','<i class="adplus">+</i> '+ad.head)+adPart('span','adcta',ad.cta)+'</div>',
  product:ad=>adArt(ad)+'<div class="adtxt">'+adSrc(ad)+adPart('b','adhead',ad.head)+adPart('span','adtext',ad.text)+'<div class="adbuy">'+adPrice(ad)+adPart('span','adcta',ad.cta)+'</div>'+adPart('small','adsmall',ad.small)+'</div>',
  restaurant:ad=>adArt(ad)+'<div class="adtxt">'+adPart('b','adhead',ad.head)+adPart('span','adtext',ad.text)+adPart('span','adcta',ad.cta)+adPart('small','adsmall',ad.small)+'</div>',
  dating:ad=>adArt(ad)+'<div class="adtxt">'+adSrc(ad)+adPart('b','adhead',ad.head)+adPart('span','adcta',ad.cta)+'</div>',
};
// Fills every slot that shows on this page at this width, at random and never the same ad twice
// at once; slots left over are hidden. Each slot is an empty grey box at its final size first (the
// ad is already in it, hidden), and the ad shows 50–500 ms later, one by one, like from a slow ad server.
let adGen=0;
function fillAds(){
  const gen=++adGen, pool=shuffle(ADS);
  document.querySelectorAll('.adslot').forEach(slot=>{
    slot.classList.remove('none'); slot.innerHTML='';
    if(!slot.getClientRects().length) return;
    const ad=pool.pop();
    if(!ad){ slot.classList.add('none'); return; }
    const label=`<span class="adlabel">${slot.dataset.label||'Annonse'}</span>`;
    slot.innerHTML=label+`<div class="ad wait ad-${ad.type} fmt-${slot.dataset.fmt}" role="link" tabindex="0" data-ad="${ad.id}">${label}<button class="adwhy" aria-label="${L('Hvorfor ser jeg denne annonsen?','Kvifor ser eg denne annonsen?')}">▷</button>${AD_TYPES[ad.type](ad)}</div>`;
    setTimeout(()=>{
      if(gen!==adGen) return;
      slot.firstChild.remove(); slot.firstChild.classList.remove('wait');
    },50+rnd()*450);
  });
}
matchMedia('(min-width:1100px)').addEventListener('change',()=>{ if(adsOn()) fillAds(); });
document.addEventListener('click',e=>{
  const el=e.target.closest('.ad'), ad=el&&ADS.find(a=>a.id===el.dataset.ad);
  if(!ad) return;
  if(e.target.closest('.adwhy')) adWhy(ad); else adFull(ad);
});
document.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ') && e.target.classList && e.target.classList.contains('ad')){ e.preventDefault(); e.target.click(); }
});
// The sheets: the button on the countdown, and «Hvorfor ser jeg denne annonsen?» on every ad
$('shakeBtn').addEventListener('click',()=>$('shakeSheet').showModal());
$('shakeStop').addEventListener('click',()=>{ $('shakeSheet').close(); setShakeOff(true); });
$('shakeAds').addEventListener('click',()=>{ $('shakeSheet').close(); setShakeOff(true); setAds(true); });
$('shakeKeep').addEventListener('click',()=>$('shakeSheet').close());
function adWhy(ad){
  $('adWhyList').innerHTML=(ad.why||AD_WHY).map(t=>'<li>'+t+'</li>').join('');
  $('adWhyShake').hidden=!shakeOff;
  $('adWhySheet').showModal();
}
$('adWhyOff').addEventListener('click',()=>{ $('adWhySheet').close(); setAds(false); });
$('adWhyShake').addEventListener('click',()=>{ $('adWhySheet').close(); setAds(false); setShakeOff(false); });
$('adWhyKeep').addEventListener('click',()=>$('adWhySheet').close());
$('adsNewsOff').addEventListener('click',()=>{ $('adsNewsSheet').close(); setAds(false); setShakeOff(true); });
$('adsNewsKeep').addEventListener('click',()=>$('adsNewsSheet').close());
// Full screen, like a landing page. It gets a history entry of its own, so Android's back gesture
// closes it; ✕ and Esc step back out of that entry.
let adFullAd=null;
function adFull(ad){
  const d=$('adFull');
  if(d.open) return;
  adFullAd=ad;
  const more=(ad.more||'').split(/\n\n/).map(p=>adPart('p','',p)).join('');
  $('adFullBody').innerHTML=`<div class="adfullin ad-${ad.type}"><span class="adlabel">Annonse</span>${adArt(ad)}`
    +adPart('span','admast',ad.mast)+adPart('span','adkick',ad.kick)+adSrc(ad)
    +`<h2>${ad.type==='paywall'?'<i class="adplus">+</i> ':''}${ad.head}</h2>${adPart('p','adlead',ad.text)}${more}${adPrice(ad)}<button class="adbig">${ad.big||'BESTILL NÅ'}</button>${adPart('p','adsmall',ad.small)}</div>`;
  d.showModal(); d.scrollTop=0;
  history.pushState({adFull:true},'',location.href);
}
$('adFullBody').addEventListener('click',e=>{
  const btn=e.target.closest('.adbig');
  if(!btn || btn.classList.contains('done')) return;
  btn.textContent=adFullAd.after||'Beklager, noe gikk galt. Prøv igjen neste onsdag.';
  btn.classList.add('done');
});
$('adFullClose').addEventListener('click',()=>$('adFull').close());
$('adFull').addEventListener('close',()=>{ if(history.state && history.state.adFull) history.back(); });
addEventListener('popstate',()=>{ if($('adFull').open) $('adFull').close(); });
