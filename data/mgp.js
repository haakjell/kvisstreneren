// One entry per MGP final, 1971 onwards. a = the artist who represented Norway in Eurovision
// (the answer), s = the song as sung there. m = members of a group, and also = others who sang
// the winning song in the MGP final (1972–1976 every song was performed twice). Anyone in a, m or
// also is never offered as a wrong option for that year. al = other spellings accepted when typed.
// e = placing in the Eurovision final: 'semi' = out in the semi-final, 'x' = contest cancelled;
// last:1 = last place, zero:1 = no points. n = a note shown after answering.
const MGP=[
 {y:1971,a:'Hanne Krogh',s:'Lykken er',e:17,n:'Hun var 15 år.'},
 {y:1972,a:'Grethe Kausland og Benny Borg',s:'Småting',e:14,also:['Hanne Krogh'],n:'I MGP-finalen ble låta også sunget av Hanne Krogh.'},
 {y:1973,a:'Bendik Singers',s:'It\'s Just a Game',e:7,m:['Anne-Karine Strøm','Ellen Nikolaysen'],n:'I MGP het låta «Å, for et spill».'},
 {y:1974,a:'Anne-Karine Strøm og Bendik Singers',s:'The First Day of Love',e:14,last:1,m:['Ellen Nikolaysen'],also:['Jahn Teigen'],n:'I MGP het låta «Hvor er du?» og ble også sunget av Jahn Teigen.'},
 {y:1975,a:'Ellen Nikolaysen',s:'Touch My Life (With Summer)',e:18,also:['Stein Ingebrigtsen'],n:'I MGP het låta «Det skulle ha vært sommer nå» og ble også sunget av Stein Ingebrigtsen.'},
 {y:1976,a:'Anne-Karine Strøm',s:'Mata Hari',e:18,last:1,also:['Gudny Aspaas'],n:'I MGP-finalen ble låta også sunget av Gudny Aspaas.'},
 {y:1977,a:'Anita Skorgan',s:'Casanova',e:14},
 {y:1978,a:'Jahn Teigen',s:'Mil etter mil',e:20,last:1,zero:1},
 {y:1979,a:'Anita Skorgan',s:'Oliver',e:11},
 {y:1980,a:'Sverre Kjelsberg og Mattis Hætta',s:'Sámiid ædnan',e:16},
 {y:1981,a:'Finn Kalvik',s:'Aldri i livet',e:20,last:1,zero:1},
 {y:1982,a:'Jahn Teigen og Anita Skorgan',s:'Adieu',e:12},
 {y:1983,a:'Jahn Teigen',s:'Do Re Mi',e:9},
 {y:1984,a:'Dollie de Luxe',s:'Lenge leve livet',e:17},
 {y:1985,a:'Bobbysocks',s:'La det swinge',e:1,m:['Hanne Krogh','Elisabeth Andreassen'],n:'Duoen var Hanne Krogh og Elisabeth Andreassen.'},
 {y:1986,a:'Ketil Stokkan',s:'Romeo',e:12},
 {y:1987,a:'Kate Gulbrandsen',s:'Mitt liv',e:9},
 {y:1988,a:'Karoline Krüger',s:'For vår jord',e:5},
 {y:1989,a:'Britt Synnøve Johansen',s:'Venners nærhet',e:17},
 {y:1990,a:'Ketil Stokkan',s:'Brandenburger Tor',e:21,last:1},
 {y:1992,a:'Merethe Trøan',s:'Visjoner',e:18},
 {y:1993,a:'Silje Vige',s:'Alle mine tankar',e:5},
 {y:1994,a:'Elisabeth Andreassen og Jan Werner Danielsen',s:'Duett',e:6,al:['Elisabeth Andreasson og Jan Werner Danielsen']},
 {y:1995,a:'Secret Garden',s:'Nocturne',e:1},
 {y:1996,a:'Elisabeth Andreassen',s:'I evighet',e:2},
 {y:1997,a:'Tor Endresen',s:'San Francisco',e:24,last:1,zero:1},
 {y:1998,a:'Lars A. Fredriksen',s:'Alltid sommer',e:8,al:['Lars Fredriksen'],n:'I MGP ble låta sunget på engelsk, som «All I Ever Wanted (Was You)».'},
 {y:1999,a:'Stig van Eijk',s:'Living My Life Without You',e:14,al:['Van Eijk']},
 {y:2000,a:'Charmed',s:'My Heart Goes Boom',e:11},
 {y:2001,a:'Haldor Lægreid',s:'On My Own',e:22,last:1},
 {y:2003,a:'Jostein Hasselgård',s:'I\'m Not Afraid to Move On',e:4},
 {y:2004,a:'Knut Anders Sørum',s:'High',e:24,last:1},
 {y:2005,a:'Wig Wam',s:'In My Dreams',e:9},
 {y:2006,a:'Christine Guldbrandsen',s:'Alvedansen',e:14},
 {y:2007,a:'Guri Schanke',s:'Ven a bailar conmigo',e:'semi'},
 {y:2008,a:'Maria Haukaas Storeng',s:'Hold On Be Strong',e:5,al:['Maria Haukaas Mittet','Maria Haukaas','Maria']},
 {y:2009,a:'Alexander Rybak',s:'Fairytale',e:1},
 {y:2010,a:'Didrik Solli-Tangen',s:'My Heart Is Yours',e:20},
 {y:2011,a:'Stella Mwangi',s:'Haba Haba',e:'semi'},
 {y:2012,a:'Tooji',s:'Stay',e:26,last:1},
 {y:2013,a:'Margaret Berger',s:'I Feed You My Love',e:4},
 {y:2014,a:'Carl Espen',s:'Silent Storm',e:8},
 {y:2015,a:'Mørland og Debrah Scarlett',s:'A Monster Like Me',e:8,al:['Kjetil Mørland og Debrah Scarlett']},
 {y:2016,a:'Agnete',s:'Icebreaker',e:'semi',al:['Agnete Johnsen']},
 {y:2017,a:'JOWST',s:'Grab the Moment',e:10,m:['Aleksander Walmann'],al:['Jowst og Aleksander Walmann'],n:'Aleksander Walmann sang.'},
 {y:2018,a:'Alexander Rybak',s:'That\'s How You Write a Song',e:15},
 {y:2019,a:'KEiiNO',s:'Spirit in the Sky',e:6},
 {y:2020,a:'Ulrikke',s:'Attention',e:'x',al:['Ulrikke Brandstorp']},
 {y:2021,a:'TIX',s:'Fallen Angel',e:18},
 {y:2022,a:'Subwoolfer',s:'Give That Wolf a Banana',e:10},
 {y:2023,a:'Alessandra',s:'Queen of Kings',e:5,al:['Alessandra Mele']},
 {y:2024,a:'Gåte',s:'Ulveham',e:25,last:1},
 {y:2025,a:'Kyle Alessandro',s:'Lighter',e:18},
 {y:2026,a:'Jonas Lovv',s:'Ya Ya Ya',e:14}
];
// Years with no MGP final. They are listed under «Pugg» but never asked about.
const MGP_GAPS=[
 {y:1970,n:'NRK boikottet Eurovision dette året.'},
 {y:1991,n:'NRK avlyste finalen og valgte selv «Mrs. Thompson» med Just 4 Fun, som ble nummer 17 i Eurovision.'},
 {y:2002,n:'Norge var rykket ned etter sisteplassen i 2001.'}
];
