// Shared helpers, loaded first: $, storage, Commons links, text matching, randomness (rnd), the
// time (Oslo, by the server's clock), and the mixed quiz sources (MIX).
const $=id=>document.getElementById(id);

// localStorage can be missing or refuse (private mode, blocked site data): reads then give null
// and writes do nothing. set() with null removes the key.
const store={
  get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
  set(k,v){ try{ if(v==null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){} },
  getJSON(k){ try{ return JSON.parse(store.get(k)); }catch(e){ return null; } },
  setJSON(k,v){ store.set(k,JSON.stringify(v)); }
};

const WM=n=>'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(n);

// ---------- Names ----------
// For comparing names: no case, accents, punctuation or hyphens ("Anker-Hansen", "Anker Hansen")
function norm(s){
  return s.toLowerCase().trim()
    .replace(/&/g,' og ')
    .replace(/æ/g,'ae').replace(/[øö]/g,'o').replace(/[åä]/g,'a')
    .replace(/[^a-z ]/g,'').replace(/\s+/g,' ').trim();
}
const normName=s=>norm(s.replace(/-/g,' '));

// ---------- Randomness ----------
// Every random choice the quizzes make goes through rnd(), so the daily quiz can swap in a seeded
// generator for a while (withSeed) and give everyone the same questions on the same day.
let rnd=Math.random;
function seedOf(str){ let h=2166136261; for(const ch of str){ h^=ch.codePointAt(0); h=Math.imul(h,16777619); } return h>>>0; }
function withSeed(seed, fn){
  let a=seed>>>0; const was=rnd;
  rnd=()=>{ a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };   // mulberry32
  try{ return fn(); } finally{ rnd=was; }
}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
// k random indices into a list of n, other than cur: the wrong options
const otherIx=(n,cur,k=5)=>shuffle([...Array(n).keys()].filter(i=>i!==cur)).slice(0,k);

// ---------- Time ----------
// The quiz runs Wednesdays 19:00–22:00, Oslo time, whatever the visitor's own time zone.
const QUIZ_DAY=3, QUIZ_START=19, QUIZ_END=22;
const MONTHS=['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember'];
const WEEKDAYS=['søndag','mandag','tirsdag','onsdag','torsdag','fredag','lørdag'];

// The time comes from the server's clock, not the device's, which anyone can set: the Date header
// (plus Age, if a cache answered) of a request for this page. performance.now() carries it on from
// there, since it doesn't move when the device's clock is changed. It is asked at start-up, each
// time the page comes back on screen (performance.now() may stand still while a phone sleeps) and
// each time Dagens kviss opens. Until the server has answered, serverNow() is the device's clock;
// opened as a local file there is no server, so the device's clock is used for good (for testing).
let serverClock=null;   // {at: server time in ms, perf: performance.now() at that moment}
async function syncClock(){
  if(location.protocol==='file:'){ serverClock={at:Date.now(),perf:performance.now()}; return true; }
  try{
    const r=await fetch(location.pathname+'?t='+performance.now(),{method:'HEAD',cache:'no-store'});
    const at=Date.parse(r.headers.get('Date'));
    if(!isNaN(at)) serverClock={at:at+(+r.headers.get('Age')||0)*1000,perf:performance.now()};
  }catch(e){ /* offline: keep the clock from an earlier sync, if any */ }
  return !!serverClock;
}
const serverNow=()=>serverClock?serverClock.at+performance.now()-serverClock.perf:Date.now();

let osloFmt=null;
try{ osloFmt=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Oslo',hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'}); }catch(e){}
// Oslo wall-clock time at instant t, as if it were UTC (falls back to the device's own time zone)
function osloWall(t){
  if(!osloFmt){ const d=new Date(t); return t-d.getTimezoneOffset()*60000; }
  const p={}; osloFmt.formatToParts(new Date(t)).forEach(x=>p[x.type]=+x.value);
  return Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)+t%1000;   // the parts stop at whole seconds
}
// The instant Oslo's clock shows wall time w (offset taken at the target, so DST changes are handled).
// Takes the same `now` as the caller: a second serverNow() a millisecond later would put the
// target a millisecond off, and the countdown would jump back and forth by a second.
function osloInstant(w,now){ const g=w-(osloWall(now)-now); return w-(osloWall(g)-g); }
// The date in Oslo at instant t, as 'YYYY-MM-DD'
const osloDay=t=>new Date(osloWall(t)).toISOString().slice(0,10);
// Wednesday 19–22 in Oslo: the quiz is on
function quizLive(t){ const d=new Date(osloWall(t)), h=d.getUTCHours(); return d.getUTCDay()===QUIZ_DAY&&h>=QUIZ_START&&h<QUIZ_END; }

// ---------- Modes ----------
// Every view but the home page registers itself with addMode(name, open, opts): its section in the
// markup is #<name>App, its address #<name>, and its button on the home page has
// data-mode="<name>". open() runs each time it is shown; opts.wide gives it the wide layout on
// desktop (Ukas prepp), and opts.newUntil ('YYYY-MM-DD HH:MM', Oslo time) puts «Ny» in the corner
// of its button until then (renderNewTags()). app.js switches between them (goMode()).
const MODES={};
const addMode=(name, open=()=>{}, opts={})=>{ MODES[name]={open, ...opts}; };

// ---------- Dagens kviss ----------
// Question sources for the mixed quiz ("Dagens kviss"), one per mode: MIX.<mode> = {label, deal(n)},
// where deal(n) returns n different questions in the shape quiz.js describes, made by the same
// function as the mode's own questions. A question may have a tag, an addition to the mode's name
// in the counter ("Bydelene, de nye fra 2028").
const MIX={};
