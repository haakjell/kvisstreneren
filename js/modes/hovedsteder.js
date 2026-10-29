// ---------- Hovedsteder ----------
// The capitals of the countries in FLAGG, the same way as Flagg (fgMakeMode() in flagg.js): a start
// page with the way round and the part of the world, then every country in that part. Only the
// countries with a capital (k) are in; Antarctica isn't, so it has no part.
const HS_PARTS=fgParts(FLAGG.filter(f=>f.k));
const hsCount=n=>n===1?'1 land':`${n} land`;
const hsFact=f=>f.kf||L(`Hovedstaden i ${f.n} er ${f.k}.`,`Hovudstaden i ${f.n} er ${f.k}.`);
// dir 'cap': the country is shown, and the answer is one of six capitals; the cities often taken
// for its capital (kx) come first among the wrong ones, at most two, then other capitals in the pool.
// dir 'land': the capital is shown, and the answer is one of six countries.
function hsQuestion(f, dir, pool){
  const rest=shuffle(pool.filter(x=>x!==f));
  if(dir==='cap'){
    const fake=shuffle(f.kx||[]).slice(0,2).map(k=>({k}));
    const opts=shuffle([f,...fake,...rest].slice(0,6)).map(x=>({label:x.k, ok:x===f,
      info:x===f?'':x.n?L(`${x.k} er hovedstaden i ${x.n}.`,`${x.k} er hovudstaden i ${x.n}.`):L(`${x.k} er ikke hovedstaden.`,`${x.k} er ikkje hovudstaden.`)}));
    return {q:L('Hva er hovedstaden i landet?','Kva er hovudstaden i landet?'), cls:'cprompt', prompt:()=>`<small>Landet</small><strong>${f.n}</strong>`,
      opts, fact:hsFact(f), miss:fgMissLi(f)};
  }
  const opts=shuffle([f,...rest.slice(0,5)]).map(x=>({label:x.n, ok:x===f,
    info:x===f?'':L(`Hovedstaden i ${x.n} er ${x.k}.`,`Hovudstaden i ${x.n} er ${x.k}.`)}));
  return {q:L('Hvilket land har denne hovedstaden?','Kva land har denne hovudstaden?'), cls:'cprompt', prompt:()=>`<small>${L('Hovedstaden','Hovudstaden')}</small><strong>${f.k}</strong>`,
    opts, fact:hsFact(f), miss:fgMissLi(f)};
}

fgMakeMode('hs',{mode:'hovedsteder', parts:HS_PARTS, question:hsQuestion, count:hsCount,
  dirs:{cap:[L('Land → hovedstad','Land → hovudstad'),'hsDirCap'], land:[L('Hovedstad → land','Hovudstad → land'),'hsDirLand']},
  sub:[L('Velg retning og verdensdel','Vel retning og verdsdel'),L('Alle hovedstedene, etter verdensdel','Alle hovudstadene, etter verdsdel')],
  study:list=>`<ul class="hslist">${list.map(f=>`<li tabindex="0"><img src="${FG_IMG(f)}" alt="" loading="lazy"><div><strong>${f.n}</strong><span class="ans">${f.k}</span></div></li>`).join('')}</ul>`,
  toggle:L(['Skjul hovedstedene','Vis hovedstedene'],['Skjul hovudstadene','Vis hovudstadene'])});

// Mixed quiz: any country in the world with a capital, either way round, wrong options from all of them
MIX.hovedsteder={label:L('Hovedsteder','Hovudstader'), deal(n){
  const pool=HS_PARTS.all.list;
  return shuffle(pool).slice(0,n).map(f=>hsQuestion(f,rnd()<.5?'cap':'land',pool));
}};
