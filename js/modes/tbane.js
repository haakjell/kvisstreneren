// ---------- T-banen ----------
const T_RANK='14325';              // left-to-right slot order where lines share track
const T_LINE_PX=5, T_FONT_PX=13;   // on-screen sizes, kept constant at every zoom level
const T_DECK=10;
const tKey=(a,b)=>a<b?a+'|'+b:b+'|'+a;
const T_CODES=Object.keys(TBANE.lines).sort();
const tSt=TBANE.st.map(([name,x,y],i)=>({i,name,x,y,lines:new Set(),edges:[],rr:T_RUTER.st[name]}));
const tByName=Object.fromEntries(tSt.map(s=>[s.name,s.i]));
const tEdges=new Map();
TBANE.edges.forEach(([a,b,ls,flat])=>{
  const pts=[[tSt[a].x,tSt[a].y]];
  for(let k=0;k<flat.length;k+=2) pts.push([flat[k],flat[k+1]]);
  pts.push([tSt[b].x,tSt[b].y]);
  const e={a,b,pts,lines:[...ls].sort((p,q)=>T_RANK.indexOf(p)-T_RANK.indexOf(q)),oriented:false};
  tEdges.set(tKey(a,b),e); tSt[a].edges.push(e); tSt[b].edges.push(e);
});
// Each line is drawn along its longer stopping pattern, turned so it runs west through the
// centre. Edges take the direction of the first line to cross them, so parallel lines keep
// the same side of each other from one edge to the next.
const tDraw={};
T_CODES.forEach(c=>{
  const [s0,s1]=TBANE.lines[c];
  let seq=s0.length>=s1.length?s0:s1;
  if(seq.indexOf(tByName['Tøyen'])>seq.indexOf(tByName['Majorstuen'])) seq=seq.slice().reverse();
  tDraw[c]=seq;
  [s0,s1].forEach(sq=>sq.forEach(i=>tSt[i].lines.add(c)));
  for(let k=0;k+1<seq.length;k++){
    const e=tEdges.get(tKey(seq[k],seq[k+1]));
    if(e&&!e.oriented){ e.oriented=true; if(e.a!==seq[k]){ [e.a,e.b]=[e.b,e.a]; e.pts.reverse(); } }
  }
});
const tUnit=(x,y)=>{const l=Math.hypot(x,y)||1; return [x/l,y/l];};
// Station tangent (along the busiest through-route) and bundle width, for markers and labels
tSt.forEach(s=>{
  const out=s.edges.slice().sort((p,q)=>q.lines.length-p.lines.length).map(e=>{
    const p=e.a===s.i?e.pts:e.pts.slice().reverse(); return tUnit(p[1][0]-p[0][0],p[1][1]-p[0][1]); });
  const t=out.length>1?tUnit(out[0][0]-out[1][0],out[0][1]-out[1][1]):out[0];
  s.t=t; s.n=[-t[1],t[0]];
  s.nb=Math.max(...s.edges.map(e=>e.lines.length));
  s.end=T_CODES.some(c=>TBANE.lines[c].some(sq=>sq[0]===s.i||sq[sq.length-1]===s.i));
});

function tOffset(pts,o){
  if(!o) return pts;
  const nrm=(p,q)=>{const [x,y]=tUnit(q[0]-p[0],q[1]-p[1]); return [y,-x];};
  return pts.map((p,i)=>{
    const a=i>0?nrm(pts[i-1],p):null, b=i<pts.length-1?nrm(p,pts[i+1]):null;
    let [nx,ny]=a&&b?tUnit(a[0]+b[0],a[1]+b[1]):(a||b);
    if(a&&b){ const c=Math.max(.5,nx*a[0]+ny*a[1]); nx/=c; ny/=c; }
    return [p[0]+nx*o,p[1]+ny*o];
  });
}
function tLinePts(c,w){
  const seq=tDraw[c]; let pts=[];
  for(let k=0;k+1<seq.length;k++){
    const e=tEdges.get(tKey(seq[k],seq[k+1])); if(!e) continue;
    const n=e.lines.length, slot=e.lines.indexOf(c);
    const p=tOffset(e.pts,((n-1)/2-slot)*w);
    pts=pts.concat(e.a===seq[k]?p:p.slice().reverse());
  }
  return pts;
}

const tMeasure=document.createElement('canvas').getContext('2d');
let tWidths={};
function tTextW(name){
  if(!(name in tWidths)){ tMeasure.font=`700 ${T_FONT_PX}px "Figtree", system-ui, sans-serif`; tWidths[name]=tMeasure.measureText(name).width; }
  return tWidths[name];
}
const tF=v=>Math.round(v*100)/100;

// Render the map for a viewBox v={x,y,w,h} shown pxW pixels wide.
// o.focus: Set of line codes drawn in full colour (others dimmed); o.hide: station shown as "?";
// o.ctx: stations whose labels must show; o.reveal: 'ok'|'no' to show the hidden name; o.sel: selected station.
// Returns {svg, labeled:Set of station indexes that got a label}.
function tRender(v,pxW,o={}){
  const z=pxW/v.w, w=T_LINE_PX/z, fs=T_FONT_PX/z, px=1/z;
  const focus=o.focus||new Set(T_CODES), ctx=new Set(o.ctx||[]);
  const inView=(x,y,m)=>x>v.x-m&&x<v.x+v.w+m&&y>v.y-m&&y<v.y+v.h+m;
  let s=`<svg viewBox="${tF(v.x)} ${tF(v.y)} ${tF(v.w)} ${tF(v.h)}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="T-banekart">`;
  // Lines, dimmed ones first
  const obst=[];
  const order=T_CODES.filter(c=>!focus.has(c)).concat(T_CODES.filter(c=>focus.has(c)));
  s+=`<g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="${tF(w)}">`;
  order.forEach(c=>{
    const pts=tLinePts(c,w);
    s+=`<path${focus.has(c)?'':' class="dim"'} stroke="var(--l${c})" d="M${pts.map(p=>tF(p[0])+' '+tF(p[1])).join('L')}"/>`;
    for(let k=0;k+1<pts.length;k++){
      const [a,b]=[pts[k],pts[k+1]], n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/(3*px));
      for(let j=0;j<n;j++){ const x=a[0]+(b[0]-a[0])*j/n, y=a[1]+(b[1]-a[1])*j/n; if(inView(x,y,60*px)) obst.push([x,y]); }
    }
  });
  s+='</g>';
  // Station markers: a white capsule across the bundle
  const r=w*.8, vis=tSt.filter(st=>inView(st.x,st.y,40*px));
  vis.forEach(st=>{
    if(st.i===o.hide) return;
    const h=(st.nb-1)*w/2, [nx,ny]=st.n, d=`M${tF(st.x-nx*h)} ${tF(st.y-ny*h)}L${tF(st.x+nx*h+.001)} ${tF(st.y+ny*h)}`;
    const dim=[...st.lines].some(c=>focus.has(c))?'':' class="dim"';
    s+=`<g${dim} fill="none" stroke-linecap="round"><path class="ts" stroke-width="${tF(2*r)}" d="${d}"/><path class="ts" stroke-width="${tF(2*r-2.4*px)}" d="${d}"/></g>`;
    if(st.i===o.sel) s+=`<circle cx="${tF(st.x)}" cy="${tF(st.y)}" r="${tF(r+h+5*px)}" fill="none" stroke="var(--ink)" stroke-width="${tF(2*px)}"/>`;
    obst.push([st.x,st.y]);
  });
  if(o.hide!=null){
    const st=tSt[o.hide], c=o.qline, R=Math.max(r*1.5,9*px);
    s+=`<circle cx="${tF(st.x)}" cy="${tF(st.y)}" r="${tF(R)}" fill="${o.reveal==='ok'?'var(--ok)':o.reveal==='no'?'var(--bad)':`var(--l${c})`}" stroke="#fff" stroke-width="${tF(2.5*px)}"/>`;
    if(!o.reveal) s+=`<text class="qm" x="${tF(st.x)}" y="${tF(st.y+R*.42)}" font-size="${tF(R*1.25)}">?</text>`;
  }
  // Labels, placed greedily: forced ones first, then termini, interchanges, the rest
  const placed=[], labeled=new Set();
  const prio=st=>(ctx.has(st.i)||st.i===o.hide||st.i===o.sel?0:4)+(st.end?0:1)+(st.lines.size>1?0:1)+([...st.lines].some(c=>focus.has(c))?0:2);
  const th=fs*1.15, gap=1.5*px;
  vis.filter(st=>inView(st.x,st.y,0)).sort((a,b)=>prio(a)-prio(b)).forEach(st=>{
    if(st.i===o.hide&&!o.reveal) return;
    const tw=tTextW(st.name)*px, [nx,ny]=st.n, h=(st.nb-1)*w/2;
    const R0=st.i===o.hide?Math.max(r*1.5,9*px):r;
    const dirs=[[nx,ny,0],[-nx,-ny,0],[1,0,1],[-1,0,1],[0,-1,1],[0,1,1],[.7,-.7,2],[-.7,-.7,2],[.7,.7,2],[-.7,.7,2]];
    let best=null;
    dirs.flatMap(d=>[[...d,0],[...d,7*px]]).forEach(([ux,uy,pen,more])=>{
      const dd=R0+4*px+more+Math.abs(ux*nx+uy*ny)*h, lx=st.x+ux*dd, ly=st.y+uy*dd;
      let x0,y0,anchor;
      if(Math.abs(ux)>=.4){ anchor=ux>0?'start':'end'; x0=ux>0?lx:lx-tw; y0=ly-th/2+uy*th*.35; }
      else { anchor='middle'; x0=lx-tw/2; y0=uy>0?ly:ly-th; }
      const box=[x0-gap,y0-gap,x0+tw+gap,y0+th+gap];
      if(placed.some(b=>box[0]<b[2]&&box[2]>b[0]&&box[1]<b[3]&&box[3]>b[1])) return;
      let p=pen*4+(more?3:0);
      obst.forEach(([x,y])=>{ if(x>box[0]&&x<box[2]&&y>box[1]&&y<box[3]) p++; });
      if(box[0]<v.x||box[2]>v.x+v.w||box[1]<v.y||box[3]>v.y+v.h) p+=40;
      if(!best||p<best.p) best={p,box,anchor,x:anchor==='start'?x0:anchor==='end'?x0+tw:x0+tw/2,y:y0+th/2+fs*.34};
    });
    // Unforced labels give way rather than sit on top of the tracks
    if(!best||(prio(st)>=4&&best.p>9)) return;
    placed.push(best.box); labeled.add(st.i);
    const cls=st.i===o.hide?o.reveal:[...st.lines].some(c=>focus.has(c))?'':'mute';
    s+=`<text${cls?` class="${cls}"`:''} x="${tF(best.x)}" y="${tF(best.y)}" font-size="${tF(fs)}" stroke-width="${tF(3.5*px)}" text-anchor="${best.anchor}">${st.name}</text>`;
  });
  return {svg:s+'</svg>',labeled};
}

// ---------- T-banen: kviss ----------
const tBadge=c=>`<span class="lbadge" style="--c:var(--l${c})">${c}</span>`;
let tSel=new Set(T_CODES);

// Every (line, direction, position) that can be asked. The shown stops before the hidden one
// must pin down the answer: on line 5 the ring passes Tøyen and Carl Berners plass twice, so
// "after Tøyen, Carl Berners plass" is dropped there (Sinsen and Hasle are asked other ways).
function tCandidates(sel){
  const out=[];
  T_CODES.filter(c=>sel.has(c)).forEach(c=>TBANE.lines[c].forEach((seq,d)=>{
    for(let k=1;k<seq.length;k++){
      const ctx=seq.slice(Math.max(0,k-2),k);
      const same=j=>{const c2=seq.slice(Math.max(0,j-2),j); return c2.length===ctx.length&&c2.every((v,x)=>v===ctx[x]);};
      if(seq.some((v,j)=>j>0&&j!==k&&v!==seq[k]&&same(j))) continue;
      out.push({c,d,k,st:seq[k],ctx,last:k===seq.length-1,to:seq[seq.length-1]});
    }
  }));
  return out;
}
// Pick a random stop on a random selected line, then a random direction that works for it.
function tNewDeck(sel=tSel, n=T_DECK){
  const groups={};
  tCandidates(sel).forEach(q=>(groups[q.c+'|'+q.st]??=[]).push(q));
  return shuffle(Object.values(groups)).slice(0,n).map(g=>g[Math.floor(rnd()*g.length)]);
}
function tQView(q){
  const pts=[...q.ctx,q.st].map(i=>tSt[i]), xs=pts.map(p=>p.x), ys=pts.map(p=>p.y);
  const bw=Math.max(...xs)-Math.min(...xs), bh=Math.max(...ys)-Math.min(...ys);
  const w=Math.max(bw*2.4,bh*2.4/.75,240), h=w*.75;
  return {x:(Math.max(...xs)+Math.min(...xs))/2-w/2,y:(Math.max(...ys)+Math.min(...ys))/2-h/2,w,h};
}
// ---------- T-banen: Ruters linjekart ----------
// Ruter's map is the default. tMapKind is only written when someone picks a map kind, so a stored
// 'geo' is a choice and is kept; no value (new, or never picked) gets Ruter's map.
let tKind='ruter', tRuterFailed=false, tRuterImg=null;
if(store.get('tMapKind')==='geo') tKind='geo';
const tRuterOn=()=>tKind==='ruter'&&!tRuterFailed;
// Label rectangles are [centre x, centre y, length, height, angle in degrees] in image pixels.
function tRCorners([x,y,l,h,a]){
  const c=Math.cos(a*Math.PI/180), s=Math.sin(a*Math.PI/180);
  return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,v])=>[x+u*l/2*c-v*h/2*s,y+u*l/2*s+v*h/2*c]);
}
// Drawn as a pill whose round ends reach past the text, so no letter corner shows
const tRRect=([x,y,l,h,a],attr,pad=0)=>{
  const hw=l/2+h/2+pad, hh=h/2+pad;
  return `<rect x="${tF(x-hw)}" y="${tF(y-hh)}" width="${tF(2*hw)}" height="${tF(2*hh)}" rx="${tF(hh)}"${a?` transform="rotate(${a} ${tF(x)} ${tF(y)})"`:''} ${attr}/>`;
};
const tRHit=(st,ux,uy,pad)=>st.rr.some(([x,y,l,h,a])=>{
  const c=Math.cos(a*Math.PI/180), s=Math.sin(a*Math.PI/180), dx=ux-x, dy=uy-y;
  return Math.abs(dx*c+dy*s)<=l/2+pad&&Math.abs(dy*c-dx*s)<=h/2+pad;
});
// The first line of a name as one rectangle: «Carl Berners» of «Carl Berners plass»
function tRLead(st){
  const f=st.rr[0], line=st.rr.filter(r=>r[4]===f[4]&&Math.abs(r[1]-f[1])<f[3]/2);
  if(line.length===1) return f;
  const x0=Math.min(...line.map(r=>r[0]-r[2]/2)), x1=Math.max(...line.map(r=>r[0]+r[2]/2));
  return [(x0+x1)/2,f[1],x1-x0,f[3],f[4]];
}
function tRuterLoad(){
  if(tRuterImg) return;
  tRuterImg=new Image();
  tRuterImg.onerror=()=>{ tRuterFailed=true; tMapChanged(); };
  tRuterImg.src=T_RUTER.src;
}
// Ruter's map prints every name, so the quiz covers them all but the stops it gives.
function tRuterQMap(q,reveal){
  const R=T_RUTER, pts=[...q.ctx,q.st].flatMap(i=>tSt[i].rr.flatMap(tRCorners)), xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]);
  const bw=Math.max(...xs)-Math.min(...xs), bh=Math.max(...ys)-Math.min(...ys);
  const w=Math.min(Math.max(bw*1.5,bh*1.5/.75,700),R.w), h=w*.75;
  const x=Math.min(Math.max((Math.max(...xs)+Math.min(...xs)-w)/2,0),R.w-w), y=Math.min(Math.max((Math.max(...ys)+Math.min(...ys)-h)/2,0),R.h-h);
  let s=`<svg viewBox="${tF(x)} ${tF(y)} ${tF(w)} ${tF(h)}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ruters linjekart for T-banen"><image href="${R.src}" width="${R.w}" height="${R.h}"/>`;
  if(!reveal){
    tSt.forEach(st=>{ if(!q.ctx.includes(st.i)) st.rr.forEach(r=>s+=tRRect(r,'class="rc"')); });
    Object.values(R.heads).flat().forEach(r=>s+=tRRect(r,'class="rc"'));
  }
  q.ctx.forEach(i=>tSt[i].rr.forEach(r=>s+=tRRect(r,`class="rh" style="stroke:var(--l${q.c})"`,4)));
  if(reveal) tSt[q.st].rr.forEach(r=>s+=tRRect(r,`class="ra ${reveal}"`,5));
  else {
    // The answer's pill is as long as the longest option, so its length gives nothing away
    const [cx,cy,l,hh,a]=tRLead(tSt[q.st]), L=Math.max(l,...(q.opts||[]).map(i=>tRLead(tSt[i])[2]));
    const mx=cx+(L-l)/2*Math.cos(a*Math.PI/180), my=cy+(L-l)/2*Math.sin(a*Math.PI/180);
    s+=tRRect([mx,my,L,hh,a],`style="fill:var(--l${q.c})"`,2)+
      `<text class="qm" x="${tF(mx)}" y="${tF(my)}" dy=".35em" font-size="${tF(hh)}"${a?` transform="rotate(${a} ${tF(mx)} ${tF(my)})"`:''}>?</text>`;
  }
  return s+'</svg>';
}
function tGeoQMap(q,reveal,pxW){
  return tRender(tQView(q),pxW||520,{focus:new Set([q.c]),hide:q.st,qline:q.c,ctx:q.ctx,reveal});
}
function tQMap(q,reveal,pxW){
  if(tRuterOn()) return {svg:tRuterQMap(q,reveal),labeled:[]};
  return tGeoQMap(q,reveal,pxW);
}
const tDirHTML=q=>`<div class="dir"><span class="sr">Linje</span>${tBadge(q.c)}${q.last?'':`<span>${tSt[q.to].name}</span>`}</div>`;
const tQText=q=>`${q.last?'Hva heter endestasjonen etter':'Hva er neste stopp etter'} ${tSt[q.ctx[q.ctx.length-1]].name}?`;
// Distractors: nearby stops on the same line first, then nearby stations, never one that is labelled
// on the map. Sets q.opts (Ruter's map sizes the answer's pill by them) and returns all six, shuffled.
function tPickOpts(q,labeled){
  const seq=TBANE.lines[q.c][q.d], shown=new Set([...labeled,...q.ctx,q.st]);
  const ok=i=>!shown.has(i)&&tSt[i].name!==tSt[q.st].name;
  const near=[...new Set(seq.filter((v,j)=>Math.abs(j-q.k)>=2&&Math.abs(j-q.k)<=6))].filter(ok);
  const dist=i=>Math.hypot(tSt[i].x-tSt[q.st].x,tSt[i].y-tSt[q.st].y);
  const around=tSt.map(s=>s.i).filter(i=>ok(i)&&!near.includes(i)).sort((a,b)=>dist(a)-dist(b));
  const picks=shuffle(near).slice(0,3);
  picks.push(...shuffle(around.slice(0,12)).slice(0,5-picks.length));
  q.opts=picks;
  return shuffle([q.st,...picks]);
}
// The trip, and what's worth knowing about the answer
function tFact(q){
  const also=[...tSt[q.st].lines].filter(c=>c!==q.c).sort();
  // Stops made only in the other direction, like Gulleråsen, which has a platform on one side
  const back=TBANE.lines[q.c][1-q.d].slice().reverse(), bi=back.indexOf(q.ctx[q.ctx.length-1]), bj=back.indexOf(q.st);
  const skip=bi>=0&&bj>bi+1?`Linje ${q.c} stopper ikke på ${back.slice(bi+1,bj).map(i=>tSt[i].name).join(' og ')} i denne retningen. `:'';
  const extra=skip+(q.last?`${tSt[q.st].name} er endestasjon for linje ${q.c}.`:also.length?`Her går også linje ${also.join(', ').replace(/, (\d)$/,' og $1')}.`:'');
  return tTrip(q)+(extra?'. '+extra:'');
}
const tMissLi=q=>`${tBadge(q.c)}<div>${tTrip(q).replace(/[^→]+$/,m=>` <strong>${m.trim()}</strong>`)}<small>${q.last?'Endestasjon':`Mot ${tSt[q.to].name}`}</small></div>`;
function tTrip(q){ return [...q.ctx,q.st].map(i=>tSt[i].name).join(' → '); }
// A question about stop q (from tNewDeck), for the quiz here and the mixed one. The options are
// picked when the map is drawn, at the width it gets, so none of them is labelled on it; on
// Ruter's map the answer's pill is sized by them, so it is drawn after.
function tQuestion(q){
  const m={q:tQText(q), head:tDirHTML(q), cls:'tmap', fact:tFact(q), miss:tMissLi(q),
    prompt(box){
      // The geographic map decides which names it labels; on Ruter's map only the given stops show
      const w=box.clientWidth, ruter=tRuterOn(), first=ruter?{labeled:[]}:tQMap(q,undefined,w);
      m.opts=tPickOpts(q,first.labeled).map(i=>({label:tSt[i].name,ok:i===q.st}));
      return ruter?tQMap(q,undefined,w).svg:first.svg;
    },
    redraw:box=>tQMap(q,undefined,box.clientWidth).svg,
    reveal:(r,box)=>tQMap(q,r.ok?'ok':'no',box.clientWidth).svg};
  return m;
}
const tQuiz=makeQuiz('tQuiz',{ask:tQuestion, newDeck:()=>tNewDeck(), qFirst:true});

// Mixed quiz: all lines, on the map kind chosen here ("Geografisk" / "Linjekart")
MIX.tbane={label:'T-banen', deal(n){
  if(tKind==='ruter') tRuterLoad();
  return tNewDeck(new Set(T_CODES),n).map(tQuestion);
}};

// Line picker, shared by the quiz and the map
function tRenderLines(){
  $('tLines').innerHTML='<span>Linjer</span>'+T_CODES.map(c=>`<button style="--c:var(--l${c})" data-c="${c}" aria-pressed="${tSel.has(c)}" aria-label="Linje ${c}">${c}</button>`).join('');
  const sel=T_CODES.filter(c=>tSel.has(c));
  $('tSub').textContent=sel.length===T_CODES.length?'Alle fem linjer':sel.length===1?`Linje ${sel[0]}`:`Linje ${sel.slice(0,-1).join(', ')} og ${sel[sel.length-1]}`;
}
$('tLines').addEventListener('click',e=>{
  const el=e.target.closest('button'); if(!el) return;
  const c=el.dataset.c;
  if(tSel.has(c)){ if(tSel.size===1) return; tSel.delete(c); } else tSel.add(c);
  tRenderLines(); tQuiz.start(tNewDeck()); tStudyRender();
});

// ---------- T-banen: kart ----------
let tv=null, tStudySel=-1, tRaf=0;
const tBox=$('tStudyMap');
const tDim=()=>tRuterOn()?T_RUTER:TBANE;
function tFit(){
  const r=tBox.getBoundingClientRect(), a=r.width/r.height, W=tDim().w, H=tDim().h;
  tv= a>W/H ? {w:H*a,h:H,x:(W-H*a)/2,y:0} : {w:W,h:W/a,x:0,y:(H-W/a)/2};
}
function tStudyRender(){
  if($('tbaneApp').hidden||$('tStudy').hidden) return;
  const r=tBox.getBoundingClientRect(); if(!r.width) return;
  if(!tv) tFit();
  const ruter=tRuterOn(), st=tSt[tStudySel];
  tBox.classList.toggle('ruter',ruter);
  let old=tBox.querySelector('svg');
  if(ruter){
    // Keep the image element between frames so it isn't decoded again on every zoom step
    if(!old||old.dataset.kind!=='ruter'){
      if(old) old.remove();
      tBox.insertAdjacentHTML('afterbegin',`<svg data-kind="ruter" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ruters linjekart for T-banen"><image href="${T_RUTER.src}" width="${T_RUTER.w}" height="${T_RUTER.h}"/><g></g></svg>`);
      old=tBox.querySelector('svg');
    }
    old.setAttribute('viewBox',`${tF(tv.x)} ${tF(tv.y)} ${tF(tv.w)} ${tF(tv.h)}`);
    old.querySelector('g').innerHTML=st?st.rr.map(r=>tRRect(r,'class="rh" style="stroke:var(--azure)"',5)).join(''):'';
  } else {
    if(old) old.remove();
    tBox.insertAdjacentHTML('afterbegin',tRender(tv,r.width,{focus:tSel,sel:tStudySel}).svg);
  }
  $('tInfo').innerHTML=st?`<strong>${st.name}</strong><div class="badges">${[...st.lines].sort().map(tBadge).join('')}</div>`
    :ruter?`<span>Ruters linjekart: avstandene stemmer ikke, men linjene er lette å følge. Trykk på et navn for å se hvilke linjer som stopper der. Kilde: <a href="${T_RUTER.page}" target="_blank" rel="noopener">ruter.no</a>.</span>`
    :'<span>Trykk på en stasjon for å se hvilke linjer som stopper der. Dra for å flytte, knip eller rull for å zoome.</span>';
}
const tLater=()=>{ cancelAnimationFrame(tRaf); tRaf=requestAnimationFrame(tStudyRender); };
function tZoom(f,cx,cy){
  const r=tBox.getBoundingClientRect();
  if(cx==null){ cx=r.left+r.width/2; cy=r.top+r.height/2; }
  const W=tDim().w, w=Math.min(Math.max(tv.w*f,W/18),W*1.5), k=w/tv.w;
  const ux=tv.x+(cx-r.left)/r.width*tv.w, uy=tv.y+(cy-r.top)/r.height*tv.h;
  tv={x:ux-(ux-tv.x)*k,y:uy-(uy-tv.y)*k,w,h:tv.h*k};
  tLater();
}
const tPtr=new Map(); let tMoved=0;
tBox.addEventListener('pointerdown',e=>{
  if(e.target.closest('button')) return;
  tBox.setPointerCapture(e.pointerId); tPtr.set(e.pointerId,[e.clientX,e.clientY]); if(tPtr.size===1) tMoved=0;
});
tBox.addEventListener('pointermove',e=>{
  if(!tPtr.has(e.pointerId)) return;
  const [px,py]=tPtr.get(e.pointerId), r=tBox.getBoundingClientRect();
  if(tPtr.size===1){
    tv.x-=(e.clientX-px)*tv.w/r.width; tv.y-=(e.clientY-py)*tv.h/r.height;
    const svg=tBox.querySelector('svg'); if(svg) svg.setAttribute('viewBox',`${tv.x} ${tv.y} ${tv.w} ${tv.h}`);
  } else {
    const [ox,oy]=[...tPtr.entries()].find(([id])=>id!==e.pointerId)[1];
    tZoom(Math.hypot(px-ox,py-oy)/(Math.hypot(e.clientX-ox,e.clientY-oy)||1),(e.clientX+ox)/2,(e.clientY+oy)/2);
  }
  tMoved+=Math.abs(e.clientX-px)+Math.abs(e.clientY-py);
  tPtr.set(e.pointerId,[e.clientX,e.clientY]);
});
const tUp=e=>{
  if(!tPtr.delete(e.pointerId)) return;
  if(tPtr.size) return;
  if(tMoved<6&&e.type==='pointerup'){
    const r=tBox.getBoundingClientRect(), ux=tv.x+(e.clientX-r.left)/r.width*tv.w, uy=tv.y+(e.clientY-r.top)/r.height*tv.h;
    const lim=18*tv.w/r.width; let best=-1, bd=lim;
    if(tRuterOn()) best=tSt.findIndex(s=>tRHit(s,ux,uy,lim/3));
    else tSt.forEach(s=>{ const d=Math.hypot(s.x-ux,s.y-uy); if(d<bd){ bd=d; best=s.i; } });
    tStudySel=best===tStudySel?-1:best;
  }
  tLater();
};
tBox.addEventListener('pointerup',tUp); tBox.addEventListener('pointercancel',tUp);
tBox.addEventListener('wheel',e=>{ e.preventDefault(); tZoom(Math.exp(e.deltaY*.0015),e.clientX,e.clientY); },{passive:false});
$('tZoomIn').addEventListener('click',()=>tZoom(1/1.6));
$('tZoomOut').addEventListener('click',()=>tZoom(1.6));
$('tZoomAll').addEventListener('click',()=>{ tFit(); tLater(); });
window.addEventListener('resize',()=>{ if(tv){ const r=tBox.getBoundingClientRect(); if(r.width){ tv.h=tv.w*r.height/r.width; tLater(); } } });

tabs('tTabQuiz','tTabStudy','tQuiz','tStudy',q=>{
  tQuiz.stop();
  tLinesShown();
  if(!q) tStudyRender();
});
// The line picker dims lines on the geographic map and filters the quiz; Ruter's map is a fixed image.
const tLinesShown=()=>{ $('tLines').hidden=!$('tStudy').hidden&&tRuterOn(); };
const tMarkKind=radios({geo:'tKindGeo',ruter:'tKindRuter'},k=>tSetKind(k));
function tSetKind(k){
  tKind=k;
  store.set('tMapKind',k);
  tMarkKind(k);
  if(k==='ruter') tRuterLoad();
  tMapChanged();
}
// Redraw both tabs after the map kind changes, or after Ruter's image failed to load
function tMapChanged(){
  tv=null; tLinesShown(); tStudyRender();
  const note=$('tMapNote'); note.hidden=!(tKind==='ruter'&&tRuterFailed);
  if(!note.hidden) note.innerHTML=`Fikk ikke hentet linjekartet fra Ruter, så sida viser det geografiske kartet. Kartet kan ha fått ny adresse – se <a href="${T_RUTER.page}" target="_blank" rel="noopener">ruter.no</a>.`;
  tQuiz.reshow();   // the options depend on which names the map shows
}
tMarkKind(tKind);
function tOpen(){ if(tKind==='ruter') tRuterLoad(); if(!tQuiz.started()){ tRenderLines(); tQuiz.start(tNewDeck()); } tStudyRender(); }
addMode('tbane',tOpen);
// Label widths depend on the web font; redo the current views once it has loaded.
document.fonts&&document.fonts.ready.then(()=>{ tWidths={}; if(!$('tbaneApp').hidden) tQuiz.redrawBox(); tStudyRender(); });
