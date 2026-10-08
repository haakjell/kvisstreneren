// ---------- The quiz engine ----------
// One question card and its result card, used by every mode and by Dagens kviss. makeQuiz()
// writes the markup into the mode's <main> and runs the round: counter, score, options or a typed
// answer, the verdict, on to the next question, the list of misses, retry and restart.
//
// A question is
//   {q, head?, src?, cls, prompt(box), redraw?(box), reveal?(r, box), opts:[{label, ok, info?}],
//    answer?, fact, miss, typed?}
// q is the question, head HTML above the box (T-banen's line and direction), src an addition to
// the counter ("· Bydelene"), and prompt() the HTML of the box, which gets the class cls. prompt()
// runs before opts are read, so a question may fill opts in there: T-banen picks options that the
// map doesn't label. redraw(), if there is one, draws the box again without changing the options,
// and reveal() draws it after the answer (r = {ok, pick}). On a wrong answer the verdict is
// «Det var <answer>», answer defaulting to the right option's label, and the picked option's info
// goes before fact. miss (a string, or a function for HTML that can change) is the inside of the
// row in the list of misses.
// typed = {answer, placeholder, inputMode?, autocapitalize?, judge(input)} asks for the answer to
// be written instead of picked; judge() returns 'exact', 'close' (a typo), 'part' (half of a duo),
// 'wrong' or 'empty'.
//
// Options:
//   ask(item, i)  turns an item of the deck into a question when it is shown (default: the item is one)
//   newDeck()     a new round, for «Ti nye spørsmål»
//   qFirst        the question goes above the box, with head (T-banen); otherwise below it
//   typed         the card has a field for typed answers
//   missed        class of the list of misses: 'tmissed' rows (default), or a grid ('minigrid', 'minimaps')
//   restartLabel  the restart button's text (default «Ti nye spørsmål»)
//   marks         a row of green and red squares on the result card (Dagens kviss)
//   buttons       the result card's buttons instead of retry and restart: [{act, cls, label}]
//   actions       {act: fn} for those buttons
//   hint          a line under the buttons on the result card
//   onStart(items)           when a round starts, e.g. to load its pictures ahead
//   onAnswer(marks)          after every answer; marks is '1'/'0' per question so far
//   onFinish(quiz)           after the result card is filled in, e.g. to change its buttons
//   donePrefix()             text before «Disse bommet du på:» (Dagens kviss: the streak)
const QUIZ_AUTO=1000;   // ms on a right answer before the next question
// On unless turned off in Innstillinger: then a right answer waits for «Neste», like a wrong one
const quizAuto=()=>store.get('autoNext')!=='0';
const quizzes=[];       // every engine: goMode() stops their timers, and one keydown listener serves them

function makeQuiz(mount, o={}){
  const root=$(mount), qid=mount+'Q', list=o.missed||'tmissed', listTag=list==='tmissed'?'ul':'div';
  const buttons=o.buttons||[{act:'retry',cls:'primary',label:'Øv på dem du bommet på'},{act:'restart',cls:'ghost',label:o.restartLabel||'Ti nye spørsmål'}];
  root.insertAdjacentHTML('beforeend',`<section class="card qplay">
      <div class="meta"><span class="qcount"></span><span class="qscore"></span></div>
      <div class="bar"><i></i></div>
      ${o.qFirst?`<div class="tq"><div class="qhead"></div><div class="q" id="${qid}"></div></div>`:'<div class="tq qhead" hidden></div>'}
      <div class="qbox"></div>
      ${o.qFirst?'':`<div class="q" id="${qid}"></div>`}
      <div class="options" role="group" aria-labelledby="${qid}"></div>
      ${o.typed?`<form class="row" hidden autocomplete="off">
        <input type="text" aria-labelledby="${qid}" spellcheck="false">
        <button class="primary" type="submit">Svar</button>
      </form>
      <div class="aux" hidden><button type="button">Vis svaret</button></div>`:''}
      <div class="feedback" aria-live="polite"></div>
      <div class="btns"><button class="primary qnext" hidden>Neste</button></div>
    </section>
    <section class="card done qdone" hidden>
      <h2></h2>
      ${o.marks?'<div class="mxmarks" role="img"></div>':''}
      <p class="qdonetext"></p>
      <${listTag} class="${list}"></${listTag}>
      <div class="btns">${buttons.map(b=>`<button class="${b.cls}" data-act="${b.act}">${b.label}</button>`).join('')}</div>
      ${o.hint?'<p class="hint" aria-live="polite"></p>':''}
    </section>`);
  const el=s=>root.querySelector(s);
  const play=el('.qplay'), done=el('.qdone'), head=el('.qhead'), box=el('.qbox'), qEl=el('.q'), opts=el('.options');
  const form=el('form'), inp=el('form input'), aux=el('.aux'), feedback=el('.feedback'), next=el('.qnext');
  const count=el('.qcount'), score=el('.qscore'), bar=el('.bar i'), missEl=done.querySelector('.'+list);
  let deck=[], asked=[], pos=0, marks='', cur=null, answered=false, last=null, timer=null;

  const stop=()=>{ clearTimeout(timer); timer=null; };
  const right=()=>marks.split('').filter(m=>m==='1').length;
  const missedAt=()=>[...marks].map((m,i)=>m==='0'?i:-1).filter(i=>i>=0);
  const askAt=i=>asked[i]||(asked[i]=o.ask?o.ask(deck[i],i):deck[i]);

  // from.marks resumes a round that was left: the questions already answered are skipped
  function start(items, from={}){
    stop();
    deck=items; asked=[]; marks=from.marks||''; pos=marks.length; cur=null;
    if(o.onStart) o.onStart(items);
    pos<deck.length?show():finish();
  }
  function show(){
    asked[pos]=null;
    const q=cur=askAt(pos); answered=false; last=null;
    play.hidden=false; done.hidden=true;
    head.innerHTML=q.head||''; if(!o.qFirst) head.hidden=!q.head;
    box.className='qbox '+(q.cls||''); void box.offsetWidth;
    box.innerHTML=q.prompt(box); box.classList.add('pop');
    qEl.textContent=q.q||'';
    count.textContent=`${pos+1} / ${deck.length}${q.src?' · '+q.src:''}`;
    score.textContent=`${right()} riktige`;
    bar.style.width=`${pos/deck.length*100}%`;
    feedback.innerHTML=''; next.hidden=true;
    const typed=!!q.typed;
    opts.hidden=typed; if(form){ form.hidden=!typed; aux.hidden=!typed; }
    if(typed){
      const t=q.typed;
      inp.value=''; inp.disabled=false; inp.className='';
      inp.placeholder=t.placeholder; inp.inputMode=t.inputMode||'text'; inp.autocapitalize=t.autocapitalize||'words';
      form.querySelector('button').disabled=false; aux.querySelector('button').disabled=false;
      inp.focus({preventScroll:true});
      return;
    }
    opts.innerHTML=q.opts.map((x,k)=>`<button data-k="${k}">${x.label}</button>`).join('');
  }
  function pick(k){
    if(answered) return;
    const q=cur, x=q.opts[k], ok=!!x.ok;
    opts.querySelectorAll('button').forEach(b=>{ const bk=+b.dataset.k; b.disabled=true;
      b.classList.add(q.opts[bk].ok?'right':bk===k?'wrong':'dim'); });
    resolve(ok, ok?'Riktig!':`Det var ${q.answer??q.opts.find(y=>y.ok).label}`, ok?'':x.info, {ok,pick:x});
  }
  function submit(giveUp){
    if(answered) return;
    const t=cur.typed, v=giveUp?'wrong':t.judge(inp.value);
    if(v==='empty'){ inp.focus(); return; }
    inp.disabled=true; form.querySelector('button').disabled=true; aux.querySelector('button').disabled=true;
    const ok=v!=='wrong'; inp.className=ok?'right':'wrong';
    if(giveUp) inp.value=t.answer;
    resolve(ok, ok?(v==='close'?'Nesten riktig!':'Riktig!'):`Det var ${t.answer}`,
      v==='close'?`Det staves ${t.answer}.`:v==='part'?`Hele svaret er ${t.answer}.`:'', {ok});
  }
  // Shared tail of answering, for both buttons and typed answers
  function resolve(ok, verdict, extra, r){
    answered=true; last=r;
    if(cur.reveal){ box.classList.remove('pop'); box.innerHTML=cur.reveal(r,box); }
    marks+=ok?'1':'0';
    if(o.onAnswer) o.onAnswer(marks);
    feedback.innerHTML=`<div class="verdict ${ok?'ok':'bad'}">${verdict}</div><div class="motif">${extra?extra+' ':''}${cur.fact}</div>`;
    score.textContent=`${right()} riktige`;
    next.textContent=pos===deck.length-1?'Se resultat':'Neste';
    next.hidden=false;
    if(ok&&quizAuto()){ next.blur(); timer=setTimeout(advance,QUIZ_AUTO); } else next.focus({preventScroll:true});
  }
  function advance(){ stop(); if(!answered) return; pos++; pos<deck.length?show():finish(); }
  function renderMissed(){
    missEl.innerHTML=missedAt().map(i=>{ const m=askAt(i).miss, h=typeof m==='function'?m():m; return listTag==='ul'?`<li>${h}</li>`:h; }).join('');
  }
  function finish(){
    stop(); cur=null;
    bar.style.width='100%'; play.hidden=true; done.hidden=false;
    const n=deck.length, k=right(), miss=missedAt().length;
    done.querySelector('h2').textContent=k===n?'Alle riktige!':`${k} av ${n}`;
    done.querySelector('.qdonetext').textContent=(o.donePrefix?o.donePrefix():'')+(miss?'Disse bommet du på:':'Klar til onsdag.');
    renderMissed();
    if(o.marks){
      const m=done.querySelector('.mxmarks');
      m.innerHTML=[...marks].map(x=>`<span${x==='1'?'':' class="no"'}></span>`).join('');
      m.setAttribute('aria-label',`${k} riktige og ${n-k} feil`);
    }
    if(o.onFinish) o.onFinish(api);
    else{ button('retry').hidden=!miss; (miss?button('retry'):button('restart')).focus({preventScroll:true}); }
  }
  const button=act=>done.querySelector(`[data-act="${act}"]`);
  const actions={retry:()=>start(shuffle(missedAt().map(i=>deck[i]))), restart:()=>start(o.newDeck()), ...o.actions};
  done.addEventListener('click',e=>{ const b=e.target.closest('[data-act]'); if(b) actions[b.dataset.act](); });
  next.addEventListener('click',advance);
  opts.addEventListener('click',e=>{ const b=e.target.closest('button'); if(b) pick(+b.dataset.k); });
  if(form){
    form.addEventListener('submit',e=>{ e.preventDefault(); submit(false); });
    aux.querySelector('button').addEventListener('click',()=>submit(true));
  }

  const api={
    start, stop, renderMissed, button,
    started:()=>deck.length>0,
    current:()=>cur,
    marks:()=>marks,
    upcoming:()=>deck.slice(pos),
    size:()=>deck.length,
    hint:()=>done.querySelector('.hint'),
    // Draw the box again in its current state (a setting changed, or the font loaded)
    redrawBox(){
      if(!cur) return;
      box.innerHTML=answered&&cur.reveal?cur.reveal(last,box):cur.redraw?cur.redraw(box):cur.prompt(box);
    },
    // Ask the current question again, with new options, unless it has been answered (T-banen's map kind)
    reshow(){ if(!cur) return; if(!answered){ show(); return; } api.redrawBox(); },
    // Back on the quiz tab: the field for a typed answer gets the focus again
    refocus(){ if(cur&&cur.typed&&!answered&&!play.closest('[hidden]')) inp.focus({preventScroll:true}); },
    active:()=>!!cur&&!play.closest('[hidden]'),
    key(e){
      if(!answered&&!cur.typed&&/^[1-6]$/.test(e.key)){ const b=opts.children[+e.key-1]; if(b) pick(+b.dataset.k); }
      else if(answered&&e.key==='Enter'&&document.activeElement!==next){ e.preventDefault(); advance(); }
    }
  };
  quizzes.push(api);
  return api;
}
// 1–6 picks an option, Enter goes on after an answer, in whichever quiz is on screen
document.addEventListener('keydown',e=>{ const z=quizzes.find(z=>z.active()); if(z) z.key(e); });
