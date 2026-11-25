// ---------- Countdown to the next quiz ----------
// Counts down to Wednesday 19:00 Oslo time by the server's clock (serverNow(), see core.js).
// During the quiz it is replaced by a warning; after 22:00 it counts to next Wednesday.
function cdPlural(n,one,many){ return n===1?one:many; }
// The markup is only rebuilt when the layout changes (units, labels, text); otherwise just the
// numbers are written, which keeps the millisecond ticking in the last hour cheap.
let cdLayout='', cdLeft=-1;
function cdShow(cls,html,nums){
  const el=$('cdBody');
  if(cls+html!==cdLayout){ cdLayout=cls+html; $('countdown').className=cls; el.innerHTML=html; }
  if(nums) el.querySelectorAll('b').forEach((b,i)=>{ if(b.textContent!==nums[i]) b.textContent=nums[i]; });
}
// Returns true while milliseconds are shown, so the caller ticks every frame instead of every second.
function renderCountdown(){
  const now=serverNow(), d=new Date(osloWall(now)), day=d.getUTCDay(), h=d.getUTCHours();
  if(quizLive(now)){
    shakeState(false,now);
    cdShow('countdown live',L('<strong>Kvissen pågår!</strong><p>Du har ikke lov til å være her nå. Juks er strengt forbudt.</p>',
      '<strong>Kvissen er i gang!</strong><p>Du har ikkje lov til å vere her no. Juks er strengt forbode.</p>'));
    return false;
  }
  const season=seasonState(now);
  if(season==='broken'){ cdBroken(now); return false; }
  let ahead=(QUIZ_DAY-day+7)%7;
  if(ahead===0 && h>=QUIZ_END) ahead=7;
  if(season==='waiting') ahead=Math.round((Date.parse(SEASON_NEXT)-Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()))/864e5);
  const tw=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()+ahead,QUIZ_START);
  const ms=Math.max(0,osloInstant(tw,now)-now), fine=ms<3600000;
  // Rounded up to whole seconds, except in the last hour, where milliseconds are shown too
  const left=fine?Math.floor(ms/1000):Math.ceil(ms/1000);
  const shake=shakeState(true,now);   // unless ads were chosen instead
  const units=[[Math.floor(left/86400),'dag',L('dager','dagar')],[Math.floor(left/3600)%24,'time',L('timer','timar')],[Math.floor(left/60)%60,'minutt',L('minutter','minutt')],[left%60,'sekund',L('sekunder','sekund')]];
  if(fine) units.push([ms%1000,'millisekund',L('millisekunder','millisekund')]);
  while(units.length>1 && units[0][0]===0) units.shift();   // drop leading zero units: no "0 dager"
  const td=new Date(tw);
  const when=ahead===0?'I kveld':ahead===1?L('I morgen','I morgon'):WEEKDAYS[td.getUTCDay()].replace(/^./,c=>c.toUpperCase())+' '+td.getUTCDate()+'. '+MONTHS[td.getUTCMonth()];
  // Milliseconds always keep plural and three digits, so the layout stays put while they spin
  cdShow(fine&&shake?'countdown rumble':'countdown','<p>'+L('Neste kviss begynner om','Neste kviss byrjar om')+'</p><div class="cdunits">'+units.map(([n,one,many],i)=>'<div'+(fine&&i===units.length-1?' class="cdms"':'')+'><b></b><span>'+(fine&&i===units.length-1?many:cdPlural(n,one,many))+'</span></div>').join('')+'</div><p>'+when+' kl. '+QUIZ_START+'</p>',
    units.map(([n],i)=>fine&&i===units.length-1?String(n).padStart(3,'0'):String(n)));
  // A short jolt each time the seconds tick down (the last hour shakes nonstop)
  if(!fine && shake && left!==cdLeft){ const el=$('countdown'); el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); }
  cdLeft=left;
  return fine;
}
// Between seasons, before the next date is known (seasonState(), core.js): the countdown is broken.
// Askew, cracked and smoking, stuck on nines, as many as each unit can hold. It still sputters
// now and then if shaking is on, and the ads carry on as usual.
// The crack is a gap right through the box, filled with the page's background, so it looks as if
// you see through it: jagged polygons around a line (x, y, half the width of the gap), widest at the
// top where it broke, with thin hairlines out from it. In a 100×100 box stretched over the countdown.
// The gap is filled without a stroke; its two sides get one each, so there is no line across the
// top, where the gap meets the edge of the box.
const cdGap=pts=>{ const l=pts.map(([x,y,w])=>(x-w)+' '+y), r=pts.map(([x,y,w])=>(x+w)+' '+y).reverse(); return 'M'+l.concat(r).join(' L')+'Z'; };
const cdSides=pts=>{ const p=pts.filter(([,y])=>y>=0); return 'M'+p.map(([x,y,w])=>(x-w)+' '+y).join(' L')+' M'+p.map(([x,y,w])=>(x+w)+' '+y).join(' L'); };
const CD_CRACK_GAPS=[
  [[57.6,-1,2.2],[57.5,0,2.2],[56.4,8,1.8],[56,14,1.5],[61,22,1.3],[54,38,1.2],[58,47,1],[51,63,.9],[54,71,.7],[48,86,.5],[50,101,.35]],
  [[54,38,.8],[47,34,.5],[41,41,.2],[39,44,0]],
  [[51,63,.6],[58,67,.4],[62,78,.15],[63,82,0]],
  [[56,14,.7],[63,8,.3],[67,6,0]]];
const CD_CRACK_HAIR='M61 22 L67 25 L71 23 M58 47 L64 50 M54 71 L47 74 L44 79 M47 34 L44 27 M48 86 L54 92 M41 41 L37 39';
const CD_CRACK='<svg class="cdcrack" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="hair" d="'+CD_CRACK_HAIR+'"/><path class="gap" d="'+CD_CRACK_GAPS.map(cdGap).join(' ')+'"/><path class="side" d="'+CD_CRACK_GAPS.map(cdSides).join(' ')+'"/></svg>';
// Smoke: a steady stream of soft puffs, all at the same pace and evenly spaced in time (negative
// delays, so it is already going when the page opens), each drifting and swelling a little differently
const CD_SMOKE_N=18, CD_SMOKE_T=5.4;
const CD_SMOKE='<i class="cdsmoke" aria-hidden="true">'+Array.from({length:CD_SMOKE_N},(_,i)=>{
  const v=k=>((i*k)%7)/6;   // a fixed spread of 0…1, different per puff and per property
  return `<i style="--d:${(-i*CD_SMOKE_T/CD_SMOKE_N).toFixed(2)}s;--t:${CD_SMOKE_T}s;--s:${Math.round(26+v(3)*14)}px;--x:${Math.round(28+v(5)*28)}px;--o:${Math.round(-3+v(2)*6)}px"></i>`;
}).join('')+'</i>';
function cdBroken(now){
  const shake=shakeState(true,now);
  const units=[['999',L('dager','dagar')],['99',L('timer','timar')],['99',L('minutter','minutt')],['99',L('sekunder','sekund')]];
  cdShow('countdown broken'+(shake?' sputter':''),CD_CRACK+CD_SMOKE+'<p>'+L('Neste kviss begynner om','Neste kviss byrjar om')+'</p><div class="cdunits">'+units.map(([n,w])=>'<div><b>'+n+'</b><span>'+w+'</span></div>').join('')+'</div><p>'+L('Onsdag ??. ??? kl. ??','Onsdag ??. ??? kl. ??')+'</p>');
  cdLeft=-1;
}
// Sparks: a burst out of the crack a couple of seconds after the page opens, then every ten
// seconds, that falls down the screen and off it. In a fixed layer over the whole page, so they fall
// past everything below. Only while the broken countdown is on screen, and not with reduced motion.
const CD_SPARK_FROM=[54,38];   // where in the crack (its 100×100 box) they come out
function cdSparks(){
  const svg=document.querySelector('#countdown.broken .cdcrack');
  if(!svg || svg.closest('[hidden]') || document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const m=svg.getScreenCTM(); if(!m) return;
  const at=new DOMPoint(...CD_SPARK_FROM).matrixTransform(m), H=innerHeight;
  if(at.y<-20 || at.y>H) return;   // scrolled out of view
  let layer=$('cdSparkLayer');
  if(!layer){ layer=document.createElement('div'); layer.id='cdSparkLayer'; layer.setAttribute('aria-hidden','true'); document.body.append(layer); }
  const n=12+Math.floor(Math.random()*8), g=900;   // px/s²
  for(let i=0;i<n;i++){
    const sp=document.createElement('i'), vx=(Math.random()-.5)*420, vy=-120-Math.random()*320, size=3+Math.random()*2.5;
    sp.style.cssText=`left:${at.x}px;top:${at.y}px;width:${size}px;height:${size}px`;
    layer.append(sp);
    // Time until it is below the screen, and its path there as keyframes (a parabola)
    const fall=H-at.y+30, T=(-vy+Math.sqrt(vy*vy+2*g*fall))/g, steps=Math.max(8,Math.round(T*30)), frames=[];
    for(let k=0;k<=steps;k++){
      const t=T*k/steps;
      frames.push({transform:`translate(${vx*t}px,${vy*t+g*t*t/2}px)`,opacity:k===0?1:Math.max(.25,1-t/T*.6)});
    }
    sp.animate(frames,{duration:T*1000,delay:Math.random()*120,easing:'linear',fill:'backwards'}).onfinish=()=>sp.remove();
  }
}
setTimeout(function spark(){ cdSparks(); setTimeout(spark,10000); },2500);
// Once a second, aimed just past the second; every frame while milliseconds show and the countdown
// is in view (animation frames also pause by themselves in background tabs).
(function tick(){
  if(renderCountdown() && !$('countdown').closest('[hidden]')) requestAnimationFrame(tick);
  else setTimeout(tick,1000-serverNow()%1000+5);
})();
