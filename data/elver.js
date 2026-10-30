// The main rivers of the world, with an extra share from Europe and Norway. One row per river:
//   n  the river's name, as on no.wikipedia
//   w  where it is: no (Norway), eu (the rest of Europe), af, as, na, sa
//   c  cities it flows through, upstream first; the answers in «Elv → by». Only cities the river
//      really runs through, not ones nearby.
//   cq the cities in c asked about in «By → elv»: capitals, and cities about as well known
//      (more of them in Norway). A river without cq isn't asked about there.
//   k  the countries it flows through, as ISO codes in FLAGG (data/flagg.js); the answers in
//      «Elv → land». A river only in Norway isn't asked about there.
//   kx countries that are never wrong options for it: it runs along them, or its headwaters do
//   m  where it ends: a sea, a fjord, a lake or the river it runs into (read after «ut i»)
//   l  its length in km
//   f  a note after the answer
const ELVER=[
  // Norge
  {n:'Glomma',w:'no',c:['Røros','Elverum','Kongsvinger','Sarpsborg','Fredrikstad'],cq:['Røros','Elverum','Kongsvinger','Sarpsborg','Fredrikstad'],
    k:['no'],m:'Oslofjorden',l:621,f:L('Norges lengste elv.','Den lengste elva i Noreg.')},
  {n:'Gudbrandsdalslågen',w:'no',c:['Otta','Vinstra','Lillehammer'],cq:['Otta','Lillehammer'],k:['no'],m:'Mjøsa',l:204},
  {n:'Numedalslågen',w:'no',c:['Kongsberg','Larvik'],cq:['Kongsberg','Larvik'],k:['no'],m:'Skagerrak',l:352},
  {n:'Otra',w:'no',c:['Kristiansand'],cq:['Kristiansand'],k:['no'],m:'Skagerrak',l:245},
  // Europa
  {n:'Volga',w:'eu',c:['Tver','Jaroslavl','Nizjnij Novgorod','Kazan','Samara','Volgograd','Astrakhan'],cq:['Kazan','Volgograd'],
    k:['ru'],m:'Kaspihavet',l:3530,f:L('Europas lengste elv.','Den lengste elva i Europa.')},
  {n:'Donau',w:'eu',c:['Ulm','Regensburg','Passau','Linz','Wien','Bratislava','Budapest','Novi Sad','Beograd'],cq:['Wien','Bratislava','Budapest','Beograd'],
    k:['de','at','sk','hu','hr','rs','ro','bg','md','ua'],m:'Svartehavet',l:2850,
    f:L('Renner gjennom fire hovedsteder og ti land, flere land enn noen annen elv.','Renn gjennom fire hovudstader og ti land, fleire land enn nokon annan elv.')},
  {n:'Dnipro',w:'eu',c:['Smolensk','Kyiv','Dnipro','Zaporizjzja'],cq:['Kyiv'],k:['ru','by','ua'],m:'Svartehavet',l:2201,
    f:L('Heter Dnepr på russisk. Byen Dnipro har navnet sitt fra elva.','Heiter Dnepr på russisk. Byen Dnipro har namnet sitt frå elva.')},
  {n:'Rhinen',w:'eu',c:['Konstanz','Basel','Strasbourg','Mannheim','Mainz','Koblenz','Bonn','Köln','Düsseldorf','Duisburg'],cq:['Basel','Strasbourg','Bonn','Köln','Düsseldorf'],
    k:['ch','li','at','de','fr','nl'],m:'Nordsjøen',l:1233,f:L('Renner gjennom Bodensjøen.','Renn gjennom Bodensjøen.')},
  {n:'Elben',w:'eu',c:['Dresden','Magdeburg','Hamburg'],cq:['Dresden','Hamburg'],k:['cz','de'],m:'Nordsjøen',l:1094},
  {n:'Vltava',w:'eu',c:['Český Krumlov','České Budějovice','Praha'],cq:['Praha'],k:['cz'],m:'Elben',l:430,
    f:L('Heter Moldau på tysk.','Heiter Moldau på tysk.')},
  {n:'Wisła',w:'eu',c:['Kraków','Warszawa','Toruń'],cq:['Kraków','Warszawa'],k:['pl'],m:'Østersjøen',l:1022,
    f:L('Polens lengste elv.','Den lengste elva i Polen.')},
  {n:'Weser',w:'eu',c:['Hameln','Bremen','Bremerhaven'],cq:['Bremen'],k:['de'],m:'Nordsjøen',l:452},
  {n:'Main',w:'eu',c:['Schweinfurt','Würzburg','Frankfurt'],cq:['Frankfurt'],k:['de'],m:'Rhinen',l:527},
  {n:'Mosel',w:'eu',c:['Metz','Trier','Koblenz'],k:['fr','lu','de'],m:'Rhinen',l:544,
    f:L('Er en del av grensa mellom Luxembourg og Tyskland.','Er ein del av grensa mellom Luxembourg og Tyskland.')},
  {n:'Neckar',w:'eu',c:['Stuttgart','Heidelberg','Mannheim'],cq:['Stuttgart','Heidelberg'],k:['de'],m:'Rhinen',l:367},
  {n:'Spree',w:'eu',c:['Cottbus','Berlin'],cq:['Berlin'],k:['de'],m:'Havel',l:382},
  {n:'Isar',w:'eu',c:['München'],cq:['München'],k:['at','de'],m:'Donau',l:295},
  {n:'Aare',w:'eu',c:['Bern'],cq:['Bern'],k:['ch'],m:'Rhinen',l:288},
  {n:'Sava',w:'eu',c:['Zagreb','Beograd'],cq:['Zagreb','Beograd'],k:['si','hr','ba','rs'],m:'Donau',l:945},
  {n:'Daugava',w:'eu',c:['Vitebsk','Daugavpils','Riga'],cq:['Riga'],k:['ru','by','lv'],m:'Rigabukta',l:1020},
  {n:'Themsen',w:'eu',c:['Oxford','Reading','Windsor','London'],cq:['Oxford','London'],k:['gb'],m:'Nordsjøen',l:346},
  {n:'Mersey',w:'eu',c:['Liverpool'],cq:['Liverpool'],k:['gb'],m:'Irskesjøen',l:113},
  {n:'Clyde',w:'eu',c:['Glasgow'],cq:['Glasgow'],k:['gb'],m:'Firth of Clyde',l:176},
  {n:'Liffey',w:'eu',c:['Dublin'],cq:['Dublin'],k:['ie'],m:'Irskesjøen',l:125},
  {n:'Seinen',w:'eu',c:['Troyes','Paris','Rouen','Le Havre'],cq:['Paris'],k:['fr'],m:'Den engelske kanal',l:777},
  {n:'Rhône',w:'eu',c:['Genève','Lyon','Avignon','Arles'],cq:['Genève','Lyon','Avignon'],k:['ch','fr'],m:'Middelhavet',l:813,
    f:L('Renner gjennom Genfersjøen.','Renn gjennom Genfersjøen.')},
  {n:'Tajo',w:'eu',c:['Aranjuez','Toledo','Lisboa'],cq:['Toledo','Lisboa'],k:['es','pt'],m:'Atlanterhavet',l:1007,
    f:L('Den lengste elva på Den iberiske halvøy. Heter Tejo på portugisisk. Madrid ligger ved Manzanares.',
      'Den lengste elva på Den iberiske halvøya. Heiter Tejo på portugisisk. Madrid ligg ved Manzanares.')},
  {n:'Douro',w:'eu',c:['Zamora','Porto'],cq:['Porto'],k:['es','pt'],m:'Atlanterhavet',l:897,
    f:L('Heter Duero i Spania.','Heiter Duero i Spania.')},
  {n:'Tiber',w:'eu',c:['Roma'],cq:['Roma'],k:['it'],m:'Middelhavet',l:406},
  {n:'Arno',w:'eu',c:['Firenze','Pisa'],cq:['Firenze','Pisa'],k:['it'],m:'Middelhavet',l:241},
  // Afrika
  {n:'Nilen',w:'af',c:['Jinja','Juba','Khartoum','Aswan','Luxor','Kairo'],cq:['Khartoum','Luxor','Kairo'],
    k:['ug','ss','sd','eg'],kx:['et','rw','bi','tz','ke','cd'],m:'Middelhavet',l:6650,
    f:L('Verdens lengste elv. Den hvite og den blå Nilen møtes i Khartoum; Den blå Nilen kommer fra Etiopia.',
      'Den lengste elva i verda. Den kvite og den blå Nilen møtest i Khartoum; Den blå Nilen kjem frå Etiopia.')},
  {n:'Kongo',w:'af',c:['Kisangani','Kinshasa','Brazzaville'],cq:['Kinshasa','Brazzaville'],k:['cd','cg'],kx:['ao','zm'],m:'Atlanterhavet',l:4700,
    f:L('Verdens dypeste elv. Kinshasa og Brazzaville ligger på hver sin side.','Den djupaste elva i verda. Kinshasa og Brazzaville ligg på kvar si side.')},
  // Asia
  {n:'Yangtze',w:'as',c:['Chongqing','Wuhan','Nanjing'],cq:['Wuhan','Nanjing'],k:['cn'],m:L('Øst-Kina-havet','Aust-Kina-havet'),l:6300,
    f:L('Asias lengste elv, med De tre kløfters demning.','Den lengste elva i Asia, med Dei tre kløftene-demninga.')},
  {n:'Mekong',w:'as',c:['Luang Prabang','Vientiane','Phnom Penh'],cq:['Vientiane','Phnom Penh'],k:['cn','mm','la','th','kh','vn'],m:'Sør-Kina-havet',l:4909},
  {n:'Ganges',w:'as',c:['Haridwar','Kanpur','Prayagraj','Varanasi','Patna'],cq:['Varanasi'],k:['in','bd'],m:'Bengalbukta',l:2525,
    f:L('Hellig i hinduismen.','Heilag i hinduismen.')},
  {n:'Brahmaputra',w:'as',c:['Dibrugarh','Guwahati'],k:['cn','in','bd'],m:'Bengalbukta',l:2900,
    f:'Møter Ganges i deltaet før Bengalbukta.'},
  {n:'Indus',w:'as',c:['Leh','Sukkur','Hyderabad'],k:['cn','in','pk'],m:'Arabiahavet',l:3180,
    f:L('Har gitt navn til India. Hyderabad her er byen i Pakistan.','Har gitt namn til India. Hyderabad her er byen i Pakistan.')},
  {n:'Tigris',w:'as',c:['Diyarbakır','Mosul','Bagdad'],cq:['Mosul','Bagdad'],k:['tr','sy','iq'],m:'Persiabukta',l:1900,
    f:'Møter Eufrat og når havet som Shatt al-Arab.'},
  {n:'Eufrat',w:'as',c:['Raqqa','Deir ez-Zor','Falluja'],k:['tr','sy','iq'],m:'Persiabukta',l:2800,
    f:L('Mesopotamia er landet mellom Eufrat og Tigris.','Mesopotamia er landet mellom Eufrat og Tigris.')},
  {n:'Ob',w:'as',c:['Barnaul','Novosibirsk'],cq:['Novosibirsk'],k:['ru'],kx:['kz','cn'],m:'Karahavet',l:3650},
  {n:'Han',w:'as',c:['Seoul'],cq:['Seoul'],k:['kr'],kx:['kp'],m:'Gulehavet',l:508},
  // Nord-Amerika
  {n:'Mississippi',w:'na',c:['Minneapolis','St. Louis','Memphis','Baton Rouge','New Orleans'],cq:['Minneapolis','St. Louis','Memphis','New Orleans'],
    k:['us'],kx:['ca'],m:'Mexicogolfen',l:3730},
  {n:'Missouri',w:'na',c:['Bismarck','Omaha','Kansas City'],cq:['Kansas City'],k:['us'],kx:['ca'],m:'Mississippi',l:3767,
    f:L('Nord-Amerikas lengste elv, litt lengre enn Mississippi.','Den lengste elva i Nord-Amerika, litt lengre enn Mississippi.')},
  {n:'Rio Grande',w:'na',c:['Albuquerque','El Paso','Ciudad Juárez','Laredo'],cq:['El Paso'],k:['us','mx'],m:'Mexicogolfen',l:3051,
    f:L('Er grensa mellom USA og Mexico fra El Paso til havet.','Er grensa mellom USA og Mexico frå El Paso til havet.')},
  {n:'Hudson',w:'na',c:['Albany','New York'],cq:['New York'],k:['us'],m:'Atlanterhavet',l:507},
  {n:'Potomac',w:'na',c:['Washington, D.C.'],cq:['Washington, D.C.'],k:['us'],m:'Chesapeakebukta',l:652},
  {n:'St. Lawrence',w:'na',c:['Montréal','Québec'],cq:['Montréal','Québec'],k:['ca','us'],m:'St. Lawrence-bukta',l:1197,
    f:L('Er en del av grensa mellom Canada og USA.','Er ein del av grensa mellom Canada og USA.')},
  {n:'Yukon',w:'na',c:['Whitehorse','Dawson City'],k:['ca','us'],m:'Beringhavet',l:3190},
  // Sør-Amerika
  {n:'Amazonas',w:'sa',c:['Iquitos','Santarém','Macapá'],k:['pe','co','br'],kx:['ec','bo','ve'],m:'Atlanterhavet',l:6400,
    f:L('Verdens største elv målt i vannføring. Manaus ligger ved Rio Negro, like før den møter Amazonas.','Den største elva i verda målt i vassføring. Manaus ligg ved Rio Negro, like før han møter Amazonas.')},
  {n:'Paraná',w:'sa',c:['Encarnación','Posadas','Rosario'],k:['br','py','ar'],m:'Río de la Plata',l:4880,
    f:L('Buenos Aires ligger ved Río de la Plata, der Paraná og Uruguay renner ut.','Buenos Aires ligg ved Río de la Plata, der Paraná og Uruguay renn ut.')},
  {n:'Orinoco',w:'sa',c:['Puerto Ayacucho','Ciudad Bolívar'],k:['ve','co'],m:'Atlanterhavet',l:2140},
];
