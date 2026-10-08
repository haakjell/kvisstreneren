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
    shakeState(false);
    cdShow('countdown live','<strong>Kvissen pågår!</strong><p>Du har ikke lov til å være her nå. Juks er strengt forbudt.</p>');
    return false;
  }
  let ahead=(QUIZ_DAY-day+7)%7;
  if(ahead===0 && h>=QUIZ_END) ahead=7;
  const tw=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()+ahead,QUIZ_START);
  const ms=Math.max(0,osloInstant(tw,now)-now), fine=ms<3600000;
  // Rounded up to whole seconds, except in the last hour, where milliseconds are shown too
  const left=fine?Math.floor(ms/1000):Math.ceil(ms/1000);
  const shake=shakeState(ms<86400000);   // from Tuesday 19:00, unless ads were chosen instead
  const units=[[Math.floor(left/86400),'dag','dager'],[Math.floor(left/3600)%24,'time','timer'],[Math.floor(left/60)%60,'minutt','minutter'],[left%60,'sekund','sekunder']];
  if(fine) units.push([ms%1000,'millisekund','millisekunder']);
  while(units.length>1 && units[0][0]===0) units.shift();   // drop leading zero units: no "0 dager"
  const td=new Date(tw);
  const when=ahead===0?'I kveld':ahead===1?'I morgen':'Onsdag '+td.getUTCDate()+'. '+MONTHS[td.getUTCMonth()];
  // Milliseconds always keep plural and three digits, so the layout stays put while they spin
  cdShow(fine&&shake?'countdown rumble':'countdown','<p>Neste kviss begynner om</p><div class="cdunits">'+units.map(([n,one,many],i)=>'<div'+(fine&&i===units.length-1?' class="cdms"':'')+'><b></b><span>'+(fine&&i===units.length-1?many:cdPlural(n,one,many))+'</span></div>').join('')+'</div><p>'+when+' kl. '+QUIZ_START+'</p>',
    units.map(([n],i)=>fine&&i===units.length-1?String(n).padStart(3,'0'):String(n)));
  // Inside the last day, a short jolt each time the seconds tick down (the last hour shakes nonstop)
  if(!fine && shake && left!==cdLeft){ const el=$('countdown'); el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); }
  cdLeft=left;
  return fine;
}
// Once a second, aimed just past the second; every frame while milliseconds show and the countdown
// is in view (animation frames also pause by themselves in background tabs).
(function tick(){
  if(renderCountdown() && !$('countdown').closest('[hidden]')) requestAnimationFrame(tick);
  else setTimeout(tick,1000-serverNow()%1000+5);
})();
