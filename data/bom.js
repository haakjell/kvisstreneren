// The questions we got wrong at the Wednesday quiz, one entry per question: d = the date of the
// quiz ('YYYY-MM-DD'), q = the question, a = the right answer, t = what our team answered ('' if
// nothing), and n = a note shown with the answer (optional). Picture and sound questions have
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
 {d:'2026-10-21',m:'sound',a:'Thorbjørn Jagland',t:'Dan Børge Akerø'}
];
