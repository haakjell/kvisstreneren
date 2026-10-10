// ---------- Shaking or ads ----------
// The last day before the quiz (Tuesday 19:00 until it starts) the countdown shakes. The shaking
// can be turned off, but then the page shows (fake) ads instead. The choice is kept for good
// (localStorage 'shakeOff'), but only matters in that window: outside it there is no button,
// no shaking and no ads. Those who ask for less motion get none of it.
// ?ristetid in the address pretends it is the shaking time, so it can be tested any day.
const SHAKE_TEST=new URLSearchParams(location.search).has('ristetid');
const calmMotion=matchMedia('(prefers-reduced-motion: reduce)');
let shakeOff=store.get('shakeOff')==='1';
let shakeMode='';   // as last applied: 'off', 'shake' or 'ads'
const adsOn=()=>shakeMode==='ads';
// Decides both whether the countdown shakes and whether the ads show. renderCountdown() calls it
// on every tick, so the ads come and go by themselves. Returns whether to shake.
function shakeState(lastDay){
  const m=calmMotion.matches||!(lastDay||SHAKE_TEST)?'off':shakeOff?'ads':'shake';
  if(m!==shakeMode){
    shakeMode=m;
    document.body.classList.toggle('ads',m==='ads');
    $('shakeBtn').hidden=m!=='shake';
    if(m!=='shake') $('countdown').classList.remove('tick');
    if(m==='ads') fillAds(); else adGen++;   // drops ads still on their way
  }
  return m==='shake';
}
function setShakeOff(off){
  shakeOff=off;
  store.set('shakeOff',off?'1':null);
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
    slot.innerHTML=label+`<div class="ad wait ad-${ad.type} fmt-${slot.dataset.fmt}" role="link" tabindex="0" data-ad="${ad.id}">${label}<button class="adwhy" aria-label="Hvorfor ser jeg denne annonsen?">▷</button>${AD_TYPES[ad.type](ad)}</div>`;
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
// The sheets: the button on the countdown, and «Hvorfor ser jeg denne annonsen?», the way back
$('shakeBtn').addEventListener('click',()=>$('shakeSheet').showModal());
$('shakeAds').addEventListener('click',()=>{ $('shakeSheet').close(); setShakeOff(true); });
$('shakeKeep').addEventListener('click',()=>$('shakeSheet').close());
function adWhy(ad){
  $('adWhyList').innerHTML=(ad.why||AD_WHY).map(t=>'<li>'+t+'</li>').join('');
  $('adWhySheet').showModal();
}
$('adWhyShake').addEventListener('click',()=>{ $('adWhySheet').close(); setShakeOff(false); });
$('adWhyKeep').addEventListener('click',()=>$('adWhySheet').close());
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
