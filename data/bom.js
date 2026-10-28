// The questions we got wrong at the Wednesday quiz, one entry per question: d = the date of the
// quiz ('YYYY-MM-DD'), q = the question, a = the right answer, t = what our team answered ('' if
// nothing), n = a note shown with the answer (optional), and
// audio = a sound file in bom/ that is played with a button by the question, for a question that was read
// aloud (optional). Picture and sound questions have
// m:'pic' or m:'sound' and no q (q, if given, says what the clip or picture was); they are only kept
// as a record (t:null if we don't remember what we answered), in a small accordion of their own under the quiz's other questions. Write the text with L('bokmål','nynorsk') where the two differ; an answer that is a name or
// a number is written once.
const BOM=[
 {d:'2026-10-21',q:L('Ranger fra først til sist etter når produktet ble lansert: Grandiosa, Hapå, Nugatti.','Ranger frå først til sist etter når produktet vart lansert: Grandiosa, Hapå, Nugatti.'),
  a:'Hapå, Nugatti, Grandiosa',t:'Hapå, Grandiosa, Nugatti',
  n:'Hapå kom i 1949, Nugatti i 1969 og Grandiosa 11. februar 1980.'},
 {d:'2026-10-21',q:L('Hvor mange av «de fire store» (Bjørnson, Ibsen, Kielland og Lie) har vunnet nobelprisen i litteratur?','Kor mange av «dei fire store» (Bjørnson, Ibsen, Kielland og Lie) har vunne nobelprisen i litteratur?'),
  a:'1 (Bjørnstjerne Bjørnson)',t:'0',
  n:L('Bjørnson fikk prisen i 1903, for diktningen sin, som Svenska Akademien kalte edel, storslått og allsidig. Han var den første nordmannen som fikk en nobelpris. Ibsen, Kielland og Lie fikk den aldri.','Bjørnson fekk prisen i 1903, for diktinga si, som Svenska Akademien kalla edel, storslått og allsidig. Han var den første nordmannen som fekk ein nobelpris. Ibsen, Kielland og Lie fekk han aldri.')},
 {d:'2026-10-21',m:'pic',a:'Wenche Foss',t:'Sonja Henie'},
 {d:'2026-10-21',m:'pic',a:'Carina Dahl',t:'Bettan'},
 {d:'2026-10-21',m:'sound',a:'Emilie Voe Nereng',t:null},
 {d:'2026-10-21',m:'sound',a:'Thorbjørn Jagland',t:'Dan Børge Akerø'},
 {d:'2026-10-28',q:L('Nevn et år Aksel Hennie og Tone Damli var offisielt sammen.','Nemn eitt år Aksel Hennie og Tone Damli var offisielt saman.'),
  a:'2009–2013',t:'2008'},
 {d:'2026-10-28',q:L('Hva slags dyr er på logoen til Tottenham?','Kva slags dyr er på logoen til Tottenham?'),
  a:'Hane',t:'Høne',
  n:L('Hanen står på en fotball og har vært klubbens merke siden 1920-tallet. Den kommer fra Harry Hotspur, som klubben har navnet sitt etter: han skal ha hatt sporer, og kamphaner ble utstyrt med sporer.','Hanen står på ein fotball og har vore merket til klubben sidan 1920-talet. Han kjem frå Harry Hotspur, som klubben har namnet sitt etter: han skal ha hatt sporar, og kamphanar vart utstyrte med sporar.')},
 {d:'2026-10-28',q:L('Hvor mye lagringsplass hadde den aller første iPoden?','Kor mykje lagringsplass hadde den aller første iPoden?'),
  a:'5 GB',t:'4 GB',
  n:L('Den første iPoden kom i oktober 2001 med en harddisk på 5 GB: «1000 sanger i lomma».','Den første iPoden kom i oktober 2001 med ein harddisk på 5 GB: «1000 songar i lomma».')},
 {d:'2026-10-28',q:'Stav dette landet på norsk.',audio:'bom/aserbajdsjan.mp3',
  a:'Aserbajdsjan',t:'Aserbadsjan'},
 {d:'2026-10-28',q:L('Det finnes ett selvstendig land i verden som i sin helhet ligger over 1000 meter over havet. Hvilket?','Det finst eitt sjølvstendig land i verda som i heilskap ligg over 1000 meter over havet. Kva for eitt?'),
  a:'Lesotho',t:'Bolivia',
  n:L('Det laveste punktet i Lesotho er rundt 1400 meter over havet. Bolivia har store lavland i øst.','Det lågaste punktet i Lesotho er rundt 1400 meter over havet. Bolivia har store låglandsområde i aust.')}
];
// Where the team placed at each quiz ('YYYY-MM-DD' → place), shown under the date
const BOM_PLACE={'2026-10-21':3,'2026-10-28':3};
