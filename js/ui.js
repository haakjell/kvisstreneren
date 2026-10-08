// Shared UI pieces the modes are built from: tabs, radio rows, study lists with hidden answers,
// and pictures that fail to load.

// The two tabs of a mode, «Kviss» and «Pugg» (or «Kart»): shows one view and hides the other.
// onSwitch(quiz) runs after every switch. Returns show(quiz), to switch from code.
function tabs(quizTab, studyTab, quizView, studyView, onSwitch){
  const show=quiz=>{
    $(quizTab).setAttribute('aria-selected',quiz); $(studyTab).setAttribute('aria-selected',!quiz);
    $(quizView).hidden=!quiz; $(studyView).hidden=quiz;
    if(onSwitch) onSwitch(quiz);
  };
  $(quizTab).addEventListener('click',()=>show(true));
  $(studyTab).addEventListener('click',()=>show(false));
  return show;
}

// A row of role="radio" buttons, given as {key: id}. A click calls onPick(key); mark(key), which
// is returned, checks that one and unchecks the rest.
function radios(ids, onPick){
  for(const k in ids) $(ids[k]).addEventListener('click',()=>onPick(k));
  return key=>{ for(const k in ids) $(ids[k]).setAttribute('aria-checked',k===key); };
}

// A study list whose answers (marked class="ans") can be hidden with a button, «Skjul navn».
// While hidden, a tap or Enter/Space on an item (anything with tabindex) shows its answer.
// labels = [text to hide, text to show]. Returns set(hide), e.g. set(false) to start over shown.
function hideAnswers(btn, list, labels){
  const set=hide=>{
    $(list).classList.toggle('hide-answers',hide);
    $(list).querySelectorAll('.show').forEach(el=>el.classList.remove('show'));
    $(btn).textContent=labels[hide?1:0];
  };
  const reveal=el=>{ if(el&&el.closest('.hide-answers')) el.classList.toggle('show'); };
  $(btn).addEventListener('click',()=>set(!$(list).classList.contains('hide-answers')));
  $(list).addEventListener('click',e=>reveal(e.target.closest('[tabindex]')));
  $(list).addEventListener('keydown',e=>{
    if(e.key!=='Enter'&&e.key!==' ') return;
    const el=e.target.closest('[tabindex]'); if(el){ e.preventDefault(); reveal(el); }
  });
  return set;
}

// A picture that fails to load is dropped rather than shown broken (the coats of arms, img.coa,
// fall back to their drawings instead; see vapen.js). li.pic is a list row laid out for a picture.
function dropBrokenPics(root){
  $(root).addEventListener('error',e=>{
    if(e.target.tagName!=='IMG'||e.target.classList.contains('coa')) return;
    const li=e.target.closest('li.pic'); if(li) li.classList.remove('pic');
    e.target.remove();
  },true);
}
