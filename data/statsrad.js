// One entry per member of the government, as listed on regjeringen.no: p = the post (the title as
// the government writes it), n = the name, d = the ministry, s = in the post since, f = portrait
// on Wikimedia Commons (empty when Commons has none). Update by hand after a reshuffle.
const RG_ASOF='11. september 2026';
const STATSRAD=[
 {p:'Statsminister',n:'Jonas Gahr Støre',d:'Statsministerens kontor',s:'14. oktober 2021',f:'Jonas Gahr Støre under åpningen av det nye regjeringskvartalet 130426 (cropped).jpg'},
 {p:'Utenriksminister',n:'Espen Barth Eide',d:'Utenriksdepartementet',s:'16. oktober 2023',f:'Espen Barth Eide in Washington, D.C. 2024.jpg'},
 {p:'Utviklingsminister',n:'Åsmund Aukrust',d:'Utenriksdepartementet',s:'4. februar 2025',f:'Åsmund Aukrust 2025 (cropped).jpg'},
 {p:'Finansminister',n:'Jens Stoltenberg',d:'Finansdepartementet',s:'4. februar 2025',f:'Jens Stoltenberg, Minister of Finance of Norway, at the Munich Security Conference in Munich, Germany on February 14, 2025 (cropped).jpg'},
 {p:'Arbeids- og inkluderingsminister',n:'Kjersti Stenseng',d:'Arbeids- og inkluderingsdepartementet',s:'16. september 2025',f:'Kjersti Stenseng (2017).jpeg'},
 {p:'Barne- og familieminister',n:'Lene Vågslid',d:'Barne- og familiedepartementet',s:'4. februar 2025',f:'Lene Vågslid (cropped).jpg'},
 {p:'Digitaliserings- og forvaltningsminister',n:'Torgeir Micaelsen',d:'Digitaliserings- og forvaltningsdepartementet',s:'11. september 2026',f:'Torgeir Micaelsen - Arbeiderpartiet.jpg'},
 {p:'Forsvarsminister',n:'Tore O. Sandvik',d:'Forsvarsdepartementet',s:'4. februar 2025',f:'Energy Secretary Ed Miliband attends COP29 (54150088131) (cropped).jpg'},
 {p:'Helse- og omsorgsminister',n:'Jan Christian Vestre',d:'Helse- og omsorgsdepartementet',s:'19. april 2024',f:'JanChristianVestre.jpg'},
 {p:'Justis- og beredskapsminister',n:'Astri Aas-Hansen',d:'Justis- og beredskapsdepartementet',s:'4. februar 2025',f:'Astri Aas-Hansen, 2025.jpg'},
 {p:'Kommunal- og distriktsminister',n:'Bjørnar Selnes Skjæran',d:'Kommunal- og distriktsdepartementet',s:'16. september 2025',f:'Kommunal- og distriktsminister Bjørnar Selnes Skjæran.jpg'},
 {p:'Kultur- og likestillingsminister',n:'Lubna Jaffery',d:'Kultur- og likestillingsdepartementet',s:'28. juni 2023',f:'2025-03-27 Event, Leipziger Buchmesse und Manga-Comic-Con 2025 STP 1603.jpg'},
 {p:'Kunnskapsminister',n:'Kari Nessa Nordtun',d:'Kunnskapsdepartementet',s:'16. oktober 2023',f:'Kari Nessa Nordtun.png'},
 {p:'Forsknings- og høyere utdanningsminister',n:'Eileen Fugelsnes',d:'Kunnskapsdepartementet',s:'11. september 2026',f:''},
 {p:'Landbruks- og matminister',n:'Nils Kristen Sandtrøen',d:'Landbruks- og matdepartementet',s:'4. februar 2025',f:'Sandtrøen Ski-VM Foto Amanda Ramstad IMG 0214 (cropped).jpg'},
 {p:'Klima- og miljøminister',n:'Sigrun Aasland',d:'Klima- og miljødepartementet',s:'11. september 2026',f:'Sigrun Gjerløw Aasland, NTP-konferanse, april 2024 (cropped).jpg'},
 {p:'Næringsminister',n:'Cecilie Myrseth',d:'Nærings- og fiskeridepartementet',s:'19. april 2024',f:'Cecilie Myrseth.jpg'},
 {p:'Fiskeri- og havminister',n:'Marianne Sivertsen Næss',d:'Nærings- og fiskeridepartementet',s:'19. april 2024',f:'Marianne Sivertsen Næss, 2025 (cropped).jpg'},
 {p:'Energiminister',n:'Terje Aasland',d:'Energidepartementet',s:'7. mars 2022',f:'Terje Aasland, 2025 (cropped).jpg'},
 {p:'Samferdselsminister',n:'Kamzy Gunaratnam',d:'Samferdselsdepartementet',s:'11. september 2026',f:'NMD 2019 Aarebrotsamtalen 17 (40851056673) (cropped2).jpg'}
];
