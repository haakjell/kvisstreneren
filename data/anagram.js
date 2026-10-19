// Anagrams of Norwegian celebrities, as in the two rounds of the Wednesday quiz: the letters of the
// name, shuffled into other words, with a hint. Everyone gets them in this order (see CLAUDE.md,
// «Anagram»), so new ones go at the bottom; progress is stored by name, so the order of those
// already solved must not change.
//   a  the anagram, as shown
//   n  the name, which is the answer: the same letters as a (case, spaces and hyphens aside)
//   h  the hint shown in brackets: programleder, komiker, politiker, realitykjendis …
//   f  a line shown after it is solved
const ANAGRAMS=[
  {a:'Dagbøkene Røra', n:'Dan Børge Akerø', h:L('programleder','programleiar'),
   f:L('Dan Børge Akerø ledet «Casino» på TV 2.','Dan Børge Akerø leidde «Casino» på TV 2.')},
  {a:'Bergens Lora', n:'Erna Solberg', h:L('politiker','politikar'),
   f:L('Erna Solberg var statsminister fra 2013 til 2021.','Erna Solberg var statsminister frå 2013 til 2021.')},
  {a:'Mandolinen', n:'Anne Lindmo', h:L('programleder','programleiar'),
   f:L('Anne Lindmo er kjent fra talkshowet «Lindmo» på NRK.','Anne Lindmo er kjend frå talkshowet «Lindmo» på NRK.')},
  {a:'Nesten atonal', n:'Atle Antonsen', h:L('komiker','komikar'),
   f:L('Atle Antonsen er kjent fra «Team Antonsen» og «Uti vår hage».','Atle Antonsen er kjend frå «Team Antonsen» og «Uti vår hage».')},
  {a:'Røas hjortesang', n:'Jonas Gahr Støre', h:L('politiker','politikar'),
   f:L('Jonas Gahr Støre har vært statsminister siden 2021.','Jonas Gahr Støre har vore statsminister sidan 2021.')},
];

// Treasure chests on the road, each after a number of anagrams (after): it opens once the
// anagrams before it are solved. id is what is stored when it has been opened, so it must not
// change. The prize is plain text (a blank line starts a new paragraph). unlock names something
// the chest unlocks, with its switch on the chest's page: 'gold' is the gold countdown.
const ANAGRAM_CHESTS=[
  {id:'kiste-1', after:5, unlock:'gold', title:L('Nedtelling i gull!','Nedteljing i gull!'),
   prize:L('Du har låst opp en nedtelling i gull. Skru den på her, eller senere i innstillingene.',
     'Du har låst opp ei nedteljing i gull. Skru ho på her, eller seinare i innstillingane.')},
];
