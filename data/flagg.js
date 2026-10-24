// The flags of the world: the 193 members of the UN, the Vatican, Palestine, Kosovo and Taiwan,
// and Antarctica's proposed flag for fun (Graham Bartram's, 1996), which has a part of its own.
//   c  the ISO 3166-1 code, which gives the picture (FG_IMG in js/modes/flagg.js)
//   n  the country's name, as the answer
//   w  the part of the world: af, as, eu, na (Central America and the Caribbean too), sa, oc, an;
//      a list for a country in two (Russia, Turkey, Cyprus, Egypt, Indonesia). Kazakhstan and the
//      Caucasus are in Asia only.
//   k  the capital: the answer in Hovedsteder (js/modes/hovedsteder.js), and the line after the
//      answer in Flagg; kf a whole line instead, where it needs more. Israel, Palestine, Nauru and
//      Antarctica have no k, and aren't in Hovedsteder.
//   kx cities often taken for the capital, which come first among the wrong options in
//      «Land → hovedstad»
//   f  a note after it (flags that look alike)
const FLAGG=[
  // Europa
  {c:'al',n:'Albania',w:'eu',k:'Tirana'},
  {c:'ad',n:'Andorra',w:'eu',k:'Andorra la Vella'},
  {c:'be',n:'Belgia',w:'eu',k:'Brussel'},
  {c:'by',n:'Belarus',w:'eu',k:'Minsk'},
  {c:'ba',n:'Bosnia-Hercegovina',w:'eu',k:'Sarajevo'},
  {c:'bg',n:'Bulgaria',w:'eu',k:'Sofia'},
  {c:'dk',n:'Danmark',w:'eu',k:'København',f:L('Dannebrog regnes som det eldste nasjonalflagget som fortsatt er i bruk.','Dannebrog blir rekna som det eldste nasjonalflagget som framleis er i bruk.')},
  {c:'ee',n:'Estland',w:'eu',k:'Tallinn'},
  {c:'fi',n:'Finland',w:'eu',k:'Helsinki'},
  {c:'fr',n:'Frankrike',w:'eu',k:'Paris'},
  {c:'gr',n:'Hellas',w:'eu',k:'Aten'},
  {c:'ie',n:'Irland',w:'eu',k:'Dublin',f:L('Grønt ved stanga – Elfenbenskysten har oransje ved stanga.','Grønt ved stonga – Elfenbeinskysten har oransje ved stonga.')},
  {c:'is',n:'Island',w:'eu',k:'Reykjavík'},
  {c:'it',n:'Italia',w:'eu',k:'Roma'},
  {c:'xk',n:'Kosovo',w:'eu',k:'Pristina'},
  {c:'hr',n:'Kroatia',w:'eu',k:'Zagreb'},
  {c:'cy',n:'Kypros',w:['eu','as'],k:'Nikosia'},
  {c:'lv',n:'Latvia',w:'eu',k:'Riga'},
  {c:'li',n:'Liechtenstein',w:'eu',k:'Vaduz'},
  {c:'lt',n:'Litauen',w:'eu',k:'Vilnius'},
  {c:'lu',n:'Luxembourg',w:'eu',k:'Luxembourg',f:L('Flagget ligner Nederlands, men det blå er lysere.','Flagget liknar flagget til Nederland, men det blå er lysare.')},
  {c:'mt',n:'Malta',w:'eu',k:'Valletta'},
  {c:'md',n:'Moldova',w:'eu',k:'Chișinău'},
  {c:'mc',n:'Monaco',w:'eu',k:'Monaco',f:L('Flagget er likt Indonesias, bare kortere.','Flagget er likt flagget til Indonesia, berre kortare.')},
  {c:'me',n:'Montenegro',w:'eu',k:'Podgorica'},
  {c:'nl',n:'Nederland',w:'eu',k:'Amsterdam',kf:L('Hovedstaden i Nederland er Amsterdam, men regjeringen sitter i Haag.','Hovudstaden i Nederland er Amsterdam, men regjeringa sit i Haag.')},
  {c:'mk',n:'Nord-Makedonia',w:'eu',k:'Skopje'},
  {c:'no',n:L('Norge','Noreg'),w:'eu',k:'Oslo'},
  {c:'pl',n:'Polen',w:'eu',k:'Warszawa'},
  {c:'pt',n:'Portugal',w:'eu',k:'Lisboa'},
  {c:'ro',n:'Romania',w:'eu',k:'București',f:L('Flagget er nesten likt Tsjads.','Flagget er nesten likt flagget til Tsjad.')},
  {c:'ru',n:'Russland',w:['eu','as'],k:'Moskva'},
  {c:'sm',n:'San Marino',w:'eu',k:'San Marino'},
  {c:'rs',n:'Serbia',w:'eu',k:'Beograd'},
  {c:'sk',n:'Slovakia',w:'eu',k:'Bratislava'},
  {c:'si',n:'Slovenia',w:'eu',k:'Ljubljana'},
  {c:'es',n:'Spania',w:'eu',k:'Madrid'},
  {c:'gb',n:'Storbritannia',w:'eu',k:'London'},
  {c:'ch',n:'Sveits',w:'eu',k:'Bern',kx:['Zürich','Genève'],f:L('Flagget er kvadratisk, som Vatikanstatens.','Flagget er kvadratisk, som flagget til Vatikanstaten.')},
  {c:'se',n:'Sverige',w:'eu',k:'Stockholm'},
  {c:'cz',n:'Tsjekkia',w:'eu',k:'Praha'},
  {c:'de',n:'Tyskland',w:'eu',k:'Berlin'},
  {c:'ua',n:'Ukraina',w:'eu',k:'Kyiv'},
  {c:'hu',n:'Ungarn',w:'eu',k:'Budapest'},
  {c:'va',n:'Vatikanstaten',w:'eu',k:'Vatikanstaten',kf:L('Vatikanstaten er en bystat, verdens minste land.','Vatikanstaten er ein bystat, det minste landet i verda.')},
  {c:'at',n:L('Østerrike','Austerrike'),w:'eu',k:'Wien'},
  // Asia
  {c:'af',n:'Afghanistan',w:'as',k:'Kabul'},
  {c:'am',n:'Armenia',w:'as',k:'Jerevan'},
  {c:'az',n:'Aserbajdsjan',w:'as',k:'Baku'},
  {c:'bh',n:'Bahrain',w:'as',k:'Manama'},
  {c:'bd',n:'Bangladesh',w:'as',k:'Dhaka'},
  {c:'bt',n:'Bhutan',w:'as',k:'Thimphu'},
  {c:'bn',n:'Brunei',w:'as',k:'Bandar Seri Begawan'},
  {c:'ae',n:L('De forente arabiske emirater','Dei sameinte arabiske emirata'),w:'as',k:'Abu Dhabi',kx:['Dubai']},
  {c:'ph',n:L('Filippinene','Filippinane'),w:'as',k:'Manila'},
  {c:'ge',n:'Georgia',w:'as',k:'Tbilisi'},
  {c:'in',n:'India',w:'as',k:'New Delhi',kx:['Mumbai']},
  {c:'id',n:'Indonesia',w:['as','oc'],k:'Jakarta',f:L('Flagget er likt Monacos, bare lengre.','Flagget er likt flagget til Monaco, berre lengre.')},
  {c:'iq',n:'Irak',w:'as',k:'Bagdad'},
  {c:'ir',n:'Iran',w:'as',k:'Teheran'},
  {c:'il',n:'Israel',w:'as',kf:L('Israel regner Jerusalem som hovedstad, men de fleste land har ambassaden sin i Tel Aviv.','Israel reknar Jerusalem som hovudstad, men dei fleste land har ambassaden sin i Tel Aviv.')},
  {c:'jp',n:'Japan',w:'as',k:'Tokyo'},
  {c:'ye',n:'Jemen',w:'as',k:'Sana'},
  {c:'jo',n:'Jordan',w:'as',k:'Amman'},
  {c:'kh',n:'Kambodsja',w:'as',k:'Phnom Penh',f:L('Angkor Wat er med i flagget.','Angkor Wat er med i flagget.')},
  {c:'kz',n:'Kasakhstan',w:'as',k:'Astana',kx:['Almaty']},
  {c:'cn',n:'Kina',w:'as',k:'Beijing',kx:['Shanghai']},
  {c:'kg',n:'Kirgisistan',w:'as',k:'Bisjkek'},
  {c:'kw',n:'Kuwait',w:'as',k:'Kuwait by'},
  {c:'la',n:'Laos',w:'as',k:'Vientiane'},
  {c:'lb',n:'Libanon',w:'as',k:'Beirut'},
  {c:'my',n:'Malaysia',w:'as',k:'Kuala Lumpur'},
  {c:'mv',n:L('Maldivene','Maldivane'),w:'as',k:'Malé'},
  {c:'mn',n:'Mongolia',w:'as',k:'Ulaanbaatar'},
  {c:'mm',n:'Myanmar',w:'as',k:'Naypyidaw',kx:['Yangon']},
  {c:'np',n:'Nepal',w:'as',k:'Katmandu',f:L('Det er det eneste nasjonalflagget som ikke er firkantet.','Det er det einaste nasjonalflagget som ikkje er firkanta.')},
  {c:'kp',n:'Nord-Korea',w:'as',k:'Pyongyang'},
  {c:'om',n:'Oman',w:'as',k:'Muskat'},
  {c:'pk',n:'Pakistan',w:'as',k:'Islamabad',kx:['Karachi']},
  {c:'ps',n:'Palestina',w:'as',kf:L('Palestina regner Øst-Jerusalem som hovedstad; de palestinske myndighetene sitter i Ramallah.','Palestina reknar Aust-Jerusalem som hovudstad; dei palestinske styresmaktene sit i Ramallah.')},
  {c:'qa',n:'Qatar',w:'as',k:'Doha'},
  {c:'sa',n:'Saudi-Arabia',w:'as',k:'Riyadh',kx:['Jidda']},
  {c:'sg',n:'Singapore',w:'as',k:'Singapore'},
  {c:'lk',n:'Sri Lanka',w:'as',k:'Sri Jayawardenepura Kotte',kx:['Colombo'],kf:L('Hovedstaden i Sri Lanka er Sri Jayawardenepura Kotte; den største byen er Colombo.','Hovudstaden i Sri Lanka er Sri Jayawardenepura Kotte; den største byen er Colombo.')},
  {c:'sy',n:'Syria',w:'as',k:'Damaskus'},
  {c:'kr',n:'Sør-Korea',w:'as',k:'Seoul'},
  {c:'tj',n:'Tadsjikistan',w:'as',k:'Dusjanbe'},
  {c:'tw',n:'Taiwan',w:'as',k:'Taipei'},
  {c:'th',n:'Thailand',w:'as',k:'Bangkok'},
  {c:'tr',n:'Tyrkia',w:['as','eu'],k:'Ankara',kx:['Istanbul']},
  {c:'tm',n:'Turkmenistan',w:'as',k:'Asjkhabad'},
  {c:'uz',n:'Usbekistan',w:'as',k:'Tasjkent'},
  {c:'vn',n:'Vietnam',w:'as',k:'Hanoi',kx:['Ho Chi Minh-byen']},
  {c:'tl',n:L('Øst-Timor','Aust-Timor'),w:'as',k:'Dili'},
  // Afrika
  {c:'dz',n:'Algerie',w:'af',k:'Alger'},
  {c:'ao',n:'Angola',w:'af',k:'Luanda'},
  {c:'bj',n:'Benin',w:'af',k:'Porto-Novo',kx:['Cotonou']},
  {c:'bw',n:'Botswana',w:'af',k:'Gaborone'},
  {c:'bf',n:'Burkina Faso',w:'af',k:'Ouagadougou'},
  {c:'bi',n:'Burundi',w:'af',k:'Gitega'},
  {c:'cd',n:'Den demokratiske republikken Kongo',w:'af',k:'Kinshasa'},
  {c:'cf',n:L('Den sentralafrikanske republikk','Den sentralafrikanske republikken'),w:'af',k:'Bangui'},
  {c:'dj',n:'Djibouti',w:'af',k:'Djibouti'},
  {c:'eg',n:'Egypt',w:['af','as'],k:'Kairo'},
  {c:'gq',n:'Ekvatorial-Guinea',w:'af',k:'Malabo'},
  {c:'ci',n:L('Elfenbenskysten','Elfenbeinskysten'),w:'af',k:'Yamoussoukro',kx:['Abidjan'],f:L('Oransje ved stanga – Irland har grønt ved stanga.','Oransje ved stonga – Irland har grønt ved stonga.')},
  {c:'er',n:'Eritrea',w:'af',k:'Asmara'},
  {c:'sz',n:'Eswatini',w:'af',k:'Mbabane'},
  {c:'et',n:'Etiopia',w:'af',k:'Addis Abeba'},
  {c:'ga',n:'Gabon',w:'af',k:'Libreville'},
  {c:'gm',n:'Gambia',w:'af',k:'Banjul'},
  {c:'gh',n:'Ghana',w:'af',k:'Accra'},
  {c:'gn',n:'Guinea',w:'af',k:'Conakry'},
  {c:'gw',n:'Guinea-Bissau',w:'af',k:'Bissau'},
  {c:'cm',n:'Kamerun',w:'af',k:'Yaoundé',kx:['Douala']},
  {c:'cv',n:'Kapp Verde',w:'af',k:'Praia'},
  {c:'ke',n:'Kenya',w:'af',k:'Nairobi'},
  {c:'km',n:L('Komorene','Komorane'),w:'af',k:'Moroni'},
  {c:'cg',n:'Republikken Kongo',w:'af',k:'Brazzaville'},
  {c:'ls',n:'Lesotho',w:'af',k:'Maseru'},
  {c:'lr',n:'Liberia',w:'af',k:'Monrovia'},
  {c:'ly',n:'Libya',w:'af',k:'Tripoli'},
  {c:'mg',n:'Madagaskar',w:'af',k:'Antananarivo'},
  {c:'mw',n:'Malawi',w:'af',k:'Lilongwe'},
  {c:'ml',n:'Mali',w:'af',k:'Bamako'},
  {c:'ma',n:'Marokko',w:'af',k:'Rabat',kx:['Casablanca']},
  {c:'mr',n:'Mauritania',w:'af',k:'Nouakchott'},
  {c:'mu',n:'Mauritius',w:'af',k:'Port Louis'},
  {c:'mz',n:'Mosambik',w:'af',k:'Maputo',f:L('Det er et automatgevær i flagget.','Det er eit automatgevær i flagget.')},
  {c:'na',n:'Namibia',w:'af',k:'Windhoek'},
  {c:'ne',n:'Niger',w:'af',k:'Niamey'},
  {c:'ng',n:'Nigeria',w:'af',k:'Abuja',kx:['Lagos']},
  {c:'rw',n:'Rwanda',w:'af',k:'Kigali'},
  {c:'st',n:'São Tomé og Príncipe',w:'af',k:'São Tomé'},
  {c:'sn',n:'Senegal',w:'af',k:'Dakar'},
  {c:'sc',n:L('Seychellene','Seychellane'),w:'af',k:'Victoria'},
  {c:'sl',n:'Sierra Leone',w:'af',k:'Freetown'},
  {c:'so',n:'Somalia',w:'af',k:'Mogadishu'},
  {c:'sd',n:'Sudan',w:'af',k:'Khartoum'},
  {c:'za',n:'Sør-Afrika',w:'af',k:'Pretoria',kx:['Johannesburg'],kf:L('Sør-Afrika har tre hovedsteder: Pretoria, Kapp og Bloemfontein.','Sør-Afrika har tre hovudstader: Pretoria, Kapp og Bloemfontein.')},
  {c:'ss',n:'Sør-Sudan',w:'af',k:'Juba'},
  {c:'tz',n:'Tanzania',w:'af',k:'Dodoma',kx:['Dar es Salaam']},
  {c:'td',n:'Tsjad',w:'af',k:'N’Djamena',f:L('Flagget er nesten likt Romanias; det blå er litt mørkere.','Flagget er nesten likt flagget til Romania; det blå er litt mørkare.')},
  {c:'tg',n:'Togo',w:'af',k:'Lomé'},
  {c:'tn',n:'Tunisia',w:'af',k:'Tunis'},
  {c:'ug',n:'Uganda',w:'af',k:'Kampala'},
  {c:'zm',n:'Zambia',w:'af',k:'Lusaka'},
  {c:'zw',n:'Zimbabwe',w:'af',k:'Harare'},
  // Nord-Amerika, med Mellom-Amerika og Karibia
  {c:'ag',n:'Antigua og Barbuda',w:'na',k:'St. John’s'},
  {c:'bs',n:'Bahamas',w:'na',k:'Nassau'},
  {c:'bb',n:'Barbados',w:'na',k:'Bridgetown'},
  {c:'bz',n:'Belize',w:'na',k:'Belmopan',kx:['Belize City']},
  {c:'ca',n:'Canada',w:'na',k:'Ottawa',kx:['Toronto','Montréal']},
  {c:'cr',n:'Costa Rica',w:'na',k:'San José'},
  {c:'cu',n:'Cuba',w:'na',k:'Havanna'},
  {c:'dm',n:'Dominica',w:'na',k:'Roseau'},
  {c:'do',n:L('Den dominikanske republikk','Den dominikanske republikken'),w:'na',k:'Santo Domingo'},
  {c:'sv',n:'El Salvador',w:'na',k:'San Salvador'},
  {c:'gd',n:'Grenada',w:'na',k:'St. George’s'},
  {c:'gt',n:'Guatemala',w:'na',k:'Guatemala by'},
  {c:'ht',n:'Haiti',w:'na',k:'Port-au-Prince'},
  {c:'hn',n:'Honduras',w:'na',k:'Tegucigalpa'},
  {c:'jm',n:'Jamaica',w:'na',k:'Kingston'},
  {c:'mx',n:'Mexico',w:'na',k:'Mexico by'},
  {c:'ni',n:'Nicaragua',w:'na',k:'Managua'},
  {c:'pa',n:'Panama',w:'na',k:'Panama by'},
  {c:'kn',n:'Saint Kitts og Nevis',w:'na',k:'Basseterre'},
  {c:'lc',n:'Saint Lucia',w:'na',k:'Castries'},
  {c:'vc',n:L('Saint Vincent og Grenadinene','Saint Vincent og Grenadinane'),w:'na',k:'Kingstown'},
  {c:'tt',n:'Trinidad og Tobago',w:'na',k:'Port of Spain'},
  {c:'us',n:'USA',w:'na',k:'Washington, D.C.',kx:['New York']},
  // Sør-Amerika
  {c:'ar',n:'Argentina',w:'sa',k:'Buenos Aires'},
  {c:'bo',n:'Bolivia',w:'sa',k:'Sucre',kf:L('Hovedstaden i Bolivia er Sucre, men regjeringen sitter i La Paz.','Hovudstaden i Bolivia er Sucre, men regjeringa sit i La Paz.')},
  {c:'br',n:'Brasil',w:'sa',k:'Brasília',kx:['Rio de Janeiro','São Paulo']},
  {c:'cl',n:'Chile',w:'sa',k:'Santiago'},
  {c:'co',n:'Colombia',w:'sa',k:'Bogotá'},
  {c:'ec',n:'Ecuador',w:'sa',k:'Quito',kx:['Guayaquil']},
  {c:'gy',n:'Guyana',w:'sa',k:'Georgetown'},
  {c:'py',n:'Paraguay',w:'sa',k:'Asunción',f:L('Flagget har ulikt merke på for- og baksiden.','Flagget har ulikt merke på framsida og baksida.')},
  {c:'pe',n:'Peru',w:'sa',k:'Lima'},
  {c:'sr',n:'Surinam',w:'sa',k:'Paramaribo'},
  {c:'uy',n:'Uruguay',w:'sa',k:'Montevideo'},
  {c:'ve',n:'Venezuela',w:'sa',k:'Caracas'},
  // Oseania
  {c:'au',n:'Australia',w:'oc',k:'Canberra',kx:['Sydney','Melbourne'],f:L('Seks hvite stjerner – New Zealand har fire røde.','Seks kvite stjerner – New Zealand har fire raude.')},
  {c:'fj',n:'Fiji',w:'oc',k:'Suva'},
  {c:'ki',n:'Kiribati',w:'oc',k:'Tarawa'},
  {c:'mh',n:L('Marshalløyene','Marshalløyane'),w:'oc',k:'Majuro'},
  {c:'fm',n:'Mikronesiaføderasjonen',w:'oc',k:'Palikir'},
  {c:'nr',n:'Nauru',w:'oc',kf:L('Nauru har ingen offisiell hovedstad; regjeringen sitter i Yaren.','Nauru har ingen offisiell hovudstad; regjeringa sit i Yaren.')},
  {c:'nz',n:'New Zealand',w:'oc',k:'Wellington',kx:['Auckland'],f:L('Fire røde stjerner – Australia har seks hvite.','Fire raude stjerner – Australia har seks kvite.')},
  {c:'pw',n:'Palau',w:'oc',k:'Ngerulmud'},
  {c:'pg',n:'Papua Ny-Guinea',w:'oc',k:'Port Moresby'},
  {c:'sb',n:L('Salomonøyene','Salomonøyane'),w:'oc',k:'Honiara'},
  {c:'ws',n:'Samoa',w:'oc',k:'Apia'},
  {c:'to',n:'Tonga',w:'oc',k:'Nukuʻalofa'},
  {c:'tv',n:'Tuvalu',w:'oc',k:'Funafuti'},
  {c:'vu',n:'Vanuatu',w:'oc',k:'Port Vila'},
  // Antarktis
  {c:'aq',n:'Antarktis',w:'an',kf:L('Antarktis har ikke noe offisielt flagg. Dette er Graham Bartrams forslag fra 1996.','Antarktis har ikkje noko offisielt flagg. Dette er forslaget til Graham Bartram frå 1996.')},
];

// Flags that look alike, by code: the others in a flag's group come first among its wrong options
// (only those in the part of the world being played; a group bigger than the options gets a random
// few). A country may be in more than one group.
const FLAGG_LIKE=[
  ['td','ro','ad','md'],             // blue, yellow and red, upright
  ['id','mc','pl'],                  // red over white, white over red
  ['ie','ci','it'],                  // green, white and orange or red, upright
  ['nl','lu','py'],                  // red, white and blue, lying
  ['ru','sk','si','rs','hr'],        // white, blue and red, the Slavic colours
  ['no','is','dk','se','fi'],        // the Nordic cross
  ['au','nz','tv','fj'],             // the Union Jack in the corner
  ['ml','gn','sn','cm'],             // green, yellow and red, upright
  ['co','ec','ve'],                  // yellow, blue and red, lying
  ['hn','ni','sv','gt','ar'],        // blue and white
  ['jo','ps','sd'],                  // black, white and green with a red triangle
  ['kw','ae'],                       // the same with the red bar upright
  ['eg','iq','sy','ye'],             // red, white and black
  ['qa','bh'],                       // white and maroon with a zigzag
  ['hu','ir','tj','bg'],             // red, white and green, lying
  ['at','lv'],                       // red, white, red
  ['ht','li'],                       // blue over red
  ['be','de'],                       // black, yellow and red
  ['tr','tn'],                       // a white crescent and star on red
  ['jp','bd','pw'],                  // a disc
  ['us','lr','my'],                  // stripes and a canton
  ['cn','vn'],                       // yellow stars on red
  ['xk','cy','ba'],                  // the country's map
  ['ne','in'],                       // orange, white and green with a disc
  ['so','fm'],                       // white stars on light blue
  ['bo','gh'],                       // red, yellow and green, lying
];

// Flags so alike that the line after the answer shows them side by side, with their names
// (a narrower pick from FLAGG_LIKE)
const FLAGG_TWINS=[
  ['id','mc','pl'], ['td','ro'], ['ad','md'], ['ie','ci'], ['nl','lu'], ['au','nz'], ['ml','gn','sn'],
  ['co','ec'], ['ni','sv','hn'], ['jo','ps'], ['kw','ae'], ['eg','iq','sy','ye'], ['qa','bh'],
  ['at','lv'], ['ht','li'], ['ru','si','sk'], ['ne','in'], ['us','lr','my'], ['tr','tn'], ['no','is'],
];
