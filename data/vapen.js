// Coats of arms: the drawn fallbacks, the 15 counties (FYLKER) and the 30 largest municipalities (KOMMUNER)
const R='#C4122F', B='#1B4F9C', G='#E8B422', S='#F5F5F2', K='#161616', V='#2D7A3E', DB='#163A70';
const SH='M8,8 H192 V128 C192,188 150,226 100,234 C50,226 8,188 8,128 Z';

const charges = {
  ostfold:`<g fill="${G}">
    <path d="M166,204 L22,104 L30,86 Z"/>
    <path d="M166,204 L128,150 L118,148 L112,132 L100,128 L94,112 L82,108 L76,92 L64,88 L58,72 L46,66 L42,50 L66,36 L68,52 L80,56 L86,72 L98,76 L104,92 L116,96 L122,112 L134,116 L140,132 L150,136 Z"/>
    <path d="M166,204 L90,24 L110,22 Z"/></g>`,
  akershus:`<path fill="${S}" d="M38,240 V150 H56 V122 H74 V94 H90 V62 H110 V94 H126 V122 H144 V150 H162 V240 Z"/>
    <path fill="${B}" d="M92,154 V132 a8,8 0 0 1 16,0 V154 Z"/>`,
  innlandet:`<g fill="none" stroke="${S}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">
    <path d="M30,80 L48,55 L66,80 L84,55 L102,80 L120,55 L138,80 L156,55 L172,80"/>
    <path d="M26,150 L80,104 L108,128 L130,112 L174,150"/>
    <path d="M36,190 Q52,176 68,190 T100,190 T132,190 T164,190"/></g>`,
  buskerud:`<path fill="${B}" d="M46,70 L52,60 Q58,50 66,48 L66,38 L76,40 L77,48 Q92,50 102,64 Q130,82 140,120 Q146,150 140,168 L152,200 L160,206 L158,214 L126,214 L124,204 L118,176 Q110,160 100,154 L96,150 L74,158 L62,166 L56,160 L60,150 L84,136 Q88,124 86,118 L64,120 L50,126 L46,118 L52,110 L80,98 Q82,88 76,82 L58,80 L50,78 Z"/>
    <circle cx="64" cy="58" r="3" fill="${S}"/>`,
  vestfold:`<g fill="${G}">
    <path d="M48,150 L52,112 L64,138 L76,100 L88,138 L100,86 L112,138 L124,100 L136,138 L148,112 L152,150 Z"/>
    <rect x="48" y="148" width="104" height="28"/>
    <circle cx="52" cy="108" r="7"/><circle cx="76" cy="96" r="7"/><circle cx="100" cy="80" r="8"/><circle cx="124" cy="96" r="7"/><circle cx="148" cy="108" r="7"/></g>
    <g fill="${R}"><circle cx="72" cy="162" r="5"/><circle cx="100" cy="162" r="5"/><circle cx="128" cy="162" r="5"/></g>`,
  telemark:`<g fill="${K}">
    <rect x="94" y="58" width="12" height="190"/>
    <path d="M94,40 L100,24 L106,40 L106,60 L94,60 Z"/>
    <path d="M94,62 L74,54 Q46,52 36,72 Q30,102 44,132 L58,120 Q72,98 94,98 Z"/>
    <path d="M106,68 L132,78 L106,88 Z"/></g>`,
  agder:`<g fill="${G}">
    <path d="M92,212 L94,160 Q80,150 68,140 L76,136 Q90,146 96,150 L96,128 L104,128 L104,150 Q112,146 124,134 L132,138 Q118,152 106,160 L108,212 Q120,220 134,224 L66,224 Q80,220 92,212 Z"/>
    <circle cx="100" cy="82" r="34"/><circle cx="62" cy="100" r="26"/><circle cx="138" cy="100" r="26"/>
    <circle cx="72" cy="64" r="22"/><circle cx="128" cy="64" r="22"/><circle cx="100" cy="50" r="24"/>
    <circle cx="82" cy="120" r="20"/><circle cx="118" cy="120" r="20"/></g>`,
  rogaland:`<path fill="${S}" d="M85,40 L115,40 L108,92 L152,82 L152,128 L108,118 L114,176 L100,208 L86,176 L92,118 L48,128 L48,82 L92,92 Z"/>`,
  vestland:`<path fill="${S}" d="M6,240 L78,70 L150,240 Z"/>
    <path fill="${S}" stroke="${DB}" stroke-width="7" stroke-linejoin="round" d="M86,244 L142,116 L200,244 Z"/>`,
  more:`<g fill="${G}">
    ${[[62,84],[138,84],[100,164]].map(([x,y])=>`<g transform="translate(${x} ${y}) scale(1.25)">
      <path d="M-24,18 Q0,36 24,18 L17,12 Q0,24 -17,12 Z"/>
      <path d="M-5,22 L-5,-22 Q-5,-38 9,-38 Q20,-38 20,-27 Q20,-18 11,-18 Q5,-18 5,-24 L5,22 Z"/></g>`).join('')}</g>`,
  trondelag:`<path fill="${G}" stroke="#A87A0C" stroke-width="2" d="M68,6 L132,6 Q106,55 108,102 Q150,100 196,78 L196,142 Q150,120 108,118 Q106,170 132,244 L68,244 Q94,170 92,118 Q50,120 4,142 L4,78 Q50,100 92,102 Q94,55 68,6 Z"/>`,
  nordland:`<g fill="${K}">
    <rect x="97" y="38" width="6" height="116"/>
    <rect x="52" y="54" width="96" height="7" rx="2"/>
    <path d="M58,61 L142,61 L136,134 L64,134 Z"/>
    <path d="M26,150 C28,126 34,112 42,104 L50,108 C48,128 54,142 70,150 L130,150 C146,142 152,128 150,108 L158,104 C166,112 172,126 174,150 C152,184 48,184 26,150 Z"/></g>
    <g stroke="${G}" stroke-width="2.5"><line x1="62" y1="86" x2="138" y2="86"/><line x1="63" y1="110" x2="137" y2="110"/></g>`,
  troms:`<path fill="${G}" d="M44,62 Q52,50 62,46 Q74,38 84,44 L92,32 L95,48 Q100,56 100,68 L118,40 L150,28 L140,48 L164,42 L148,62 L172,62 L150,80 L164,88 L136,96 Q146,120 142,150 Q150,170 168,188 Q184,200 172,214 Q162,202 146,190 L150,208 L160,212 L158,220 L128,220 L126,210 L122,180 Q112,166 102,160 L84,168 L70,180 L62,174 L66,164 L90,146 Q94,132 92,124 L70,126 L54,134 L48,126 L56,118 L84,104 Q86,92 80,84 L62,76 L56,70 Q50,72 44,62 Z"/>
    <circle cx="72" cy="54" r="3.5" fill="${R}"/>`,
  finnmark:`<g fill="${G}">
    <rect x="40" y="132" width="120" height="100"/>
    <rect x="30" y="92" width="38" height="140"/><rect x="132" y="92" width="38" height="140"/>
    <rect x="78" y="70" width="44" height="70"/>
    ${[30,45,60].map(x=>`<rect x="${x}" y="80" width="8" height="14"/>`).join('')}
    ${[132,147,162].map(x=>`<rect x="${x}" y="80" width="8" height="14"/>`).join('')}
    ${[78,96,114].map(x=>`<rect x="${x}" y="58" width="8" height="14"/>`).join('')}
    ${[68,84,100,116].map(x=>`<rect x="${x}" y="122" width="8" height="12"/>`).join('')}</g>
    <g fill="${K}"><path d="M86,232 V196 a14,14 0 0 1 28,0 V232 Z"/>
    <rect x="45" y="118" width="8" height="16" rx="4"/><rect x="147" y="118" width="8" height="16" rx="4"/><rect x="96" y="86" width="8" height="16" rx="4"/></g>`
};

function shield(field, key){ return shieldInner(field, charges[key]); }
function shieldInner(field, inner){
  const id='c'+Math.random().toString(36).slice(2,8);
  return `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fylkesvåpen">
    <defs><clipPath id="${id}"><path d="${SH}"/></clipPath></defs>
    <g clip-path="url(#${id})"><rect width="200" height="240" fill="${field}"/>${inner}</g>
    <path d="${SH}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="3"/></svg>`;
}

function osloSeal(){
  const id='o'+Math.random().toString(36).slice(2,8);
  return `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Byvåpen">
    <defs><path id="${id}" d="M28,120 a72,72 0 1 1 144,0"/></defs>
    <circle cx="100" cy="120" r="94" fill="${G}"/>
    <circle cx="100" cy="120" r="80" fill="${B}"/>
    <text font-family="Georgia,serif" font-size="11" font-weight="700" fill="${B}" letter-spacing="1.5"><textPath href="#${id}" startOffset="50%" text-anchor="middle">UNANIMITER · ET · CONSTANTER</textPath></text>
    <rect x="56" y="108" width="88" height="80" rx="6" fill="${G}"/>
    <circle cx="56" cy="112" r="9" fill="${G}"/><circle cx="144" cy="112" r="9" fill="${G}"/>
    <circle cx="100" cy="76" r="23" fill="none" stroke="${G}" stroke-width="5"/>
    <path d="M76,102 Q100,90 124,102 L134,184 L66,184 Z" fill="${R}"/>
    <circle cx="100" cy="78" r="13" fill="#F1C9A5"/>
    <path d="M122,110 L140,122" stroke="${R}" stroke-width="9" stroke-linecap="round"/>
    <circle cx="146" cy="126" r="15" fill="#A3ACB4" stroke="#6B747C" stroke-width="2"/><circle cx="146" cy="126" r="4" fill="${B}"/>
    <path d="M78,110 L62,124" stroke="${R}" stroke-width="9" stroke-linecap="round"/>
    <g stroke="${S}" stroke-width="3" fill="${S}">
      <line x1="52" y1="96" x2="58" y2="160"/><line x1="60" y1="94" x2="62" y2="160"/><line x1="68" y1="96" x2="66" y2="160"/>
      <path d="M49,98 L52,86 L56,97 Z"/><path d="M57,96 L60,84 L63,96 Z"/><path d="M65,97 L68,85 L71,98 Z"/></g>
    <ellipse cx="100" cy="194" rx="34" ry="7" fill="#F1C9A5"/>
    <circle cx="68" cy="192" r="6" fill="#F1C9A5"/></svg>`;
}

const FYLKER = [
  {name:'Oslo', svg:()=>osloSeal(), motif:'Rundt bysegl: St. Hallvard på en trone med glorie, med tre piler og en kvernstein.'},
  {name:'Akershus', svg:()=>shield(B,'akershus'), motif:'Trappegavl i sølv på blått – Akershus festning.'},
  {name:'Østfold', svg:()=>shield(R,'ostfold'), motif:'Tre gullstråler på rødt; den midterste flammeskåret.'},
  {name:'Buskerud', svg:()=>shield(S,'buskerud'), motif:'Blå bjørn på sølv.'},
  {name:'Vestfold', svg:()=>shield(R,'vestfold'), motif:'Kongekrone i gull på rødt – Ynglingekongene.'},
  {name:'Telemark', svg:()=>shield(G,'telemark'), motif:'Svart bondestridsøks som stiger opp fra skjoldfoten, på gull.'},
  {name:'Innlandet', svg:()=>shield(V,'innlandet'), motif:'Tre sølvlinjer på grønt: tretopper, fjell og vann.'},
  {name:'Agder', svg:()=>shield(R,'agder'), motif:'Eik i gull på rødt.'},
  {name:'Rogaland', svg:()=>shield(B,'rogaland'), motif:'Kors med spiss fot i sølv på blått – Erling Skjalgssons steinkors.'},
  {name:'Vestland', svg:()=>shield(DB,'vestland'), motif:'To fjell i sølv på dypblått.'},
  {name:'Møre og Romsdal', svg:()=>shield(B,'more'), motif:'Tre skipsstavner i gull sett forfra, på blått.'},
  {name:'Trøndelag', svg:()=>shield(S,'trondelag'), motif:'Gullkors med utoverbuede armer på sølv (fra Nord-Trøndelag).'},
  {name:'Nordland', svg:()=>shield(G,'nordland'), motif:'Svart nordlandsbåt med mast og råseil, på gull.'},
  {name:'Troms', svg:()=>shield(R,'troms'), motif:'Griff i gull på rødt – Bjarkøyættens våpen.'},
  {name:'Finnmark', svg:()=>shield(K,'finnmark'), motif:'Borg i gull på svart – Vardøhus festning.'}
];

const FILES={
  'Oslo':['Oslo komm.svg'],
  'Akershus':['Akershus våpen.svg'],
  'Østfold':['Østfold våpen.svg'],
  'Buskerud':['Buskerud fylkesvåpen.svg','Buskerud våpen.svg'],
  'Vestfold':['Vestfold våpen.svg'],
  'Telemark':['Telemark våpen.svg'],
  'Innlandet':['Innlandet våpen.svg'],
  'Agder':['Agder våpen.svg'],
  'Rogaland':['Rogaland våpen.svg'],
  'Vestland':['Vestland våpen.svg'],
  'Møre og Romsdal':['Møre og Romsdal våpen.svg'],
  'Trøndelag':['Trøndelag våpen.svg'],
  'Nordland':['Nordland våpen.svg'],
  'Troms':['Troms våpen.svg'],
  'Finnmark':['Finnmark våpen.svg']
};
FYLKER.forEach(f=>{ f.files=FILES[f.name]; });
// ---- Kommunevåpen: top 30 by population (SSB, 1 Jan 2026) ----
const BEAR='M46,70 L52,60 Q58,50 66,48 L66,38 L76,40 L77,48 Q92,50 102,64 Q130,82 140,120 Q146,150 140,168 L152,200 L160,206 L158,214 L126,214 L124,204 L118,176 Q110,160 100,154 L96,150 L74,158 L62,166 L56,160 L60,150 L84,136 Q88,124 86,118 L64,120 L50,126 L46,118 L52,110 L80,98 Q82,88 76,82 L58,80 L50,78 Z';
const WALK='M36,118 Q40,100 58,98 L64,86 L70,88 L70,100 Q84,104 96,112 L150,108 Q170,110 172,130 L174,152 L166,152 L162,136 L160,176 L148,176 L146,144 L114,146 L110,176 L98,176 L98,144 Q86,140 80,132 L74,176 L62,176 L64,128 Q52,128 42,130 Z';
const kCastle=(c,w)=>`<g fill="${c}"><rect x="40" y="132" width="120" height="100"/><rect x="30" y="92" width="38" height="140"/><rect x="132" y="92" width="38" height="140"/><rect x="78" y="70" width="44" height="70"/>${[30,45,60,132,147,162].map(x=>`<rect x="${x}" y="80" width="8" height="14"/>`).join('')}${[78,96,114].map(x=>`<rect x="${x}" y="58" width="8" height="14"/>`).join('')}</g><path fill="${w}" d="M86,232 V196 a14,14 0 0 1 28,0 V232 Z"/>`;
const kTree=c=>`<g fill="${c}"><path d="M92,212 L94,160 Q80,150 68,140 L76,136 Q90,146 96,150 L96,128 L104,128 L104,150 Q112,146 124,134 L132,138 Q118,152 106,160 L108,212 Q120,220 134,224 L66,224 Q80,220 92,212 Z"/><circle cx="100" cy="82" r="34"/><circle cx="62" cy="100" r="26"/><circle cx="138" cy="100" r="26"/><circle cx="72" cy="64" r="22"/><circle cx="128" cy="64" r="22"/><circle cx="100" cy="50" r="24"/><circle cx="82" cy="120" r="20"/><circle cx="118" cy="120" r="20"/></g>`;
const kAntlers=c=>`<g stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"><path d="M62,88 L54,64 M56,72 L44,64 M54,64 L58,50"/><path d="M68,88 L76,64 M74,72 L86,64 M76,64 L72,50"/></g>`;
const kStar=(cx,cy,n,r1,r2,c)=>{let p=[];for(let i=0;i<n*2;i++){const r=i%2?r2:r1,a=Math.PI*i/n-Math.PI/2;p.push((cx+r*Math.cos(a)).toFixed(1)+','+(cy+r*Math.sin(a)).toFixed(1));}return `<polygon fill="${c}" points="${p.join(' ')}"/>`;};
const kEar=(c,bg)=>`<path d="M100,225 V70" stroke="${c}" stroke-width="6"/>${[0,1,2,3,4].map(i=>`<ellipse cx="86" cy="${150-i*20}" rx="9" ry="16" transform="rotate(-25 86 ${150-i*20})" fill="${c}"/><ellipse cx="114" cy="${140-i*20}" rx="9" ry="16" transform="rotate(25 114 ${140-i*20})" fill="${c}"/>`).join('')}<ellipse cx="100" cy="52" rx="8" ry="18" fill="${c}"/>`;
const kWaves=(c,y)=>`<path fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round" d="M30,${y} q17,-12 34,0 t34,0 t34,0 t34,0"/>`;
const kGull=(x,y,c)=>`<path fill="${c}" transform="translate(${x} ${y})" d="M-34,0 Q-17,-22 0,0 Q17,-22 34,0 Q17,-10 0,8 Q-17,-10 -34,0Z"/>`;
const kFigure=(x,c)=>`<g fill="${c}" transform="translate(${x} 0)"><circle cx="0" cy="92" r="11"/><path d="M-14,106 H14 L20,172 H-20 Z"/></g>`;

const KOMMUNER=[
 {name:'Oslo', svg:()=>osloSeal(), files:['Oslo komm.svg'], motif:'Byseglet: St. Hallvard på en trone med tre piler og en kvernstein (samme som fylket).'},
 {name:'Bergen', svg:()=>shieldInner(R,`<path fill="${G}" d="M0,244 V196 Q30,180 60,192 Q100,176 140,192 Q170,182 200,196 V244Z"/><g transform="translate(20 -20) scale(.8)">${kCastle(S,R)}</g>`), files:['Bergen komm.svg'], motif:'Borg i sølv på gyllen fjellgrunn, på rødt.'},
 {name:'Trondheim', svg:()=>shieldInner(R,`<g fill="${G}"><path d="M28,180 V84 a36,36 0 0 1 72,0 V180Z"/><rect x="106" y="64" width="66" height="116"/>${[106,124,142,160].map(x=>`<rect x="${x}" y="50" width="12" height="16"/>`).join('')}<circle cx="70" cy="212" r="11"/><circle cx="100" cy="212" r="11"/><circle cx="130" cy="212" r="11"/></g>${kFigure(64,R)}${kFigure(139,R)}<path d="M56,80 L64,64 L72,80Z" fill="${R}"/>`), files:['Trondheim komm.svg'], motif:'Gammelt bysegl: en biskop i en kirkeportal og en konge i en borg, med tre hoder under (bystyret).'},
 {name:'Stavanger', svg:()=>shieldInner(B,`<path d="M100,220 Q86,170 100,130 Q114,90 98,36" fill="none" stroke="${G}" stroke-width="8" stroke-linecap="round"/><g fill="${G}"><ellipse cx="66" cy="112" rx="28" ry="14" transform="rotate(-30 66 112)"/><ellipse cx="136" cy="84" rx="28" ry="14" transform="rotate(30 136 84)"/><ellipse cx="70" cy="58" rx="22" ry="12" transform="rotate(-30 70 58)"/>${[[128,146],[142,146],[135,158],[121,158],[149,158],[128,170],[142,170],[135,182]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7"/>`).join('')}</g>`), files:['Stavanger komm.svg'], motif:'Forgrenet vinranke i gull på blått.'},
 {name:'Bærum', svg:()=>shieldInner(V,`<path fill="${S}" d="M64,220 L80,56 H120 L136,220 Z"/><path fill="${V}" d="M88,220 V186 a12,12 0 0 1 24,0 V220Z"/>`), files:['https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/B%C3%A6rum_komm.svg/500px-B%C3%A6rum_komm.svg.png','Bærum komm.svg'], noWD:1, motif:'Kalkovn i sølv (et tårn uten tinder) på grønt.'},
 {name:'Kristiansand', svg:()=>shieldInner(G,`${kTree(V)}<g transform="translate(30 88) scale(.62)"><path fill="${R}" d="${BEAR}"/></g>`), files:['Kristiansand komm.svg'], motif:'Den norske løven foran et tre, med mottoet «Causa triumphat tandem bona».'},
 {name:'Drammen', svg:()=>shieldInner(B,`<path fill="${G}" d="M20,244 V206 Q60,186 100,198 Q140,186 180,206 V244Z"/><rect x="88" y="62" width="24" height="140" fill="${S}"/><rect x="80" y="54" width="40" height="12" fill="${S}"/><path d="M44,70 L156,186" stroke="${S}" stroke-width="7"/><path d="M156,70 L44,186" stroke="${G}" stroke-width="7"/><circle cx="160" cy="64" r="11" fill="none" stroke="${G}" stroke-width="6"/>`), files:['Drammen komm.svg'], motif:'En søyle på berggrunn, krysset av en nøkkel og et sverd – tro, rettferd og styrke.'},
 {name:'Asker', svg:()=>shieldInner(B,`<path fill="${S}" d="M46,196 L46,72 L82,196Z M92,196 L92,50 L132,196Z M142,196 L142,84 L170,196Z"/>`), files:['Asker komm 2020.svg'], reformed:true, motif:'Tre seil i sølv på blått – ett for hver sammenslåtte kommune (2020).'},
 {name:'Lillestrøm', svg:()=>shieldInner(B,`<g fill="${S}">${[74,122,170].map(y=>`<path d="M36,${y} Q100,${y+20} 170,${y-10} Q104,${y+34} 36,${y} Z"/>`).join('')}</g>`), files:['Lillestrøm komm.svg'], reformed:true, motif:'Tre stokkebåter i sølv på blått (fra det 2200 år gamle funnet i Sørum).'},
 {name:'Fredrikstad', svg:()=>shieldInner(R,`<g transform="translate(30 76) scale(.7)">${kCastle(G,R)}</g><g transform="translate(14 -38) scale(.85)"><path fill="${G}" d="${WALK}"/></g>`), files:['Fredrikstad komm.svg'], motif:'Bjørn og tårn i gull på rødt (lånt fra Sarpsborg).'},
 {name:'Sandnes', svg:()=>shieldInner(V,`<g fill="${S}"><ellipse cx="108" cy="140" rx="50" ry="36"/><circle cx="64" cy="100" r="22"/><path d="M44,98 L24,104 L44,110Z"/><path d="M152,128 L182,98 L174,142Z"/><rect x="88" y="170" width="40" height="30" rx="6"/></g><circle cx="60" cy="95" r="4" fill="${V}"/>`), files:['Sandnes komm.svg'], motif:'Leirgauk i sølv – en fløyte av leire fra pottemakeriene i Sandnes – på grønt.'},
 {name:'Tromsø', svg:()=>shieldInner(B,`<g transform="translate(-6 20)"><path fill="${S}" d="${WALK}"/>${kAntlers(S)}</g>`), files:['Tromsø komm.svg'], motif:'Gående rein i sølv på blått.'},
 {name:'Sandefjord', svg:()=>shieldInner(G,`<g fill="${K}"><circle cx="92" cy="66" r="14"/><path d="M76,84 H108 L114,142 L108,180 H76 L80,142 Z"/><path d="M152,26 L162,10 L158,34Z"/><path d="M0,244 V190 Q20,176 40,180 H160 Q180,176 200,190 V244Z"/></g><path d="M106,90 L132,56" stroke="${K}" stroke-width="10" stroke-linecap="round"/><path d="M154,28 L64,196" stroke="${K}" stroke-width="5"/>`), files:['Sandefjord komm 2017.svg'], reformed:true, motif:'Svart hvalfanger med hevet harpun i en båt, på gull – fra hvalfangstmonumentet (2017).'},
 {name:'Nordre Follo', svg:()=>shieldInner(B,kEar(S)), files:['Nordre Follo komm.svg'], reformed:true, motif:'Havreaks i sølv på blått (2020).'},
 {name:'Sarpsborg', svg:()=>shieldInner(G,`<g transform="translate(30 76) scale(.7)">${kCastle(K,G)}</g><g transform="translate(14 -38) scale(.85)"><path fill="${K}" d="${WALK}"/></g>`), files:['Sarpsborg komm.svg'], motif:'Svart gående bjørn over en svart borg, på gull.'},
 {name:'Tønsberg', svg:()=>shieldInner(B,`<path fill="${G}" d="M60,215 Q60,110 96,64 Q116,40 140,52 Q156,62 146,82 Q138,96 122,88 Q112,82 118,72 Q100,90 92,130 Q84,172 92,215 Z"/><path d="M130,215 V160" stroke="${G}" stroke-width="6"/><ellipse cx="118" cy="162" rx="14" ry="7" transform="rotate(-35 118 162)" fill="${G}"/><ellipse cx="142" cy="150" rx="14" ry="7" transform="rotate(35 142 150)" fill="${G}"/>`), files:['Tønsberg komm 2020.svg'], reformed:true, motif:'En stavn fra Osebergskipet og en spire (2020).'},
 {name:'Ålesund', svg:()=>shieldInner(B,`<path fill="${S}" d="M36,96 C40,84 46,80 50,78 L56,82 C56,92 62,98 72,100 L128,100 C138,98 144,92 144,82 L150,78 C154,80 160,84 164,96 C146,122 54,122 36,96 Z"/><rect x="97" y="40" width="6" height="60" fill="${S}"/>${kWaves(S,132)}${kWaves(S,150)}<g fill="${S}">${[[62,194],[100,204],[138,194]].map(([x,y])=>`<path transform="translate(${x} ${y})" d="M-22,0 Q-4,-12 14,0 L24,-9 L24,9 L14,0 Q-4,12 -22,0Z"/>`).join('')}</g>${kWaves(S,168)}`), files:['Ålesund komm.svg'], motif:'Båt i sølv på fire bølger med tre torsk under – fiskeri.'},
 {name:'Skien', svg:()=>shieldInner(B,`<path d="M72,210 L128,70 M128,210 L72,70" stroke="${S}" stroke-width="7" stroke-linecap="round"/>${kStar(100,56,6,18,8,G)}<g transform="translate(-34 70) scale(.5)">${kTree(G)}</g><g transform="translate(134 70) scale(.5)">${kTree(G)}</g>`), files:['Skien komm.svg'], motif:'To skistaver kronet av en sekstakket stjerne, mellom to rosentrær i gull.'},
 {name:'Bodø', svg:()=>shieldInner(R,kStar(100,118,12,78,44,G)), files:['Bodø komm.svg'], motif:'Sol med tolv stråler i gull på rødt – midnattssolen.'},
 {name:'Moss', svg:()=>shieldInner(R,`<path fill="none" stroke="${G}" stroke-width="14" stroke-linecap="round" d="M40,86 Q40,176 104,176 Q150,176 150,132"/><path d="M150,132 L150,104" stroke="${G}" stroke-width="10"/>${kStar(150,76,6,26,10,G)}`), files:['Rygge komm.svg'], reformed:true, motif:'Spore i gull på rødt (fra vikingtidsfunnet på Rød; Rygges gamle våpen, brukt av Moss siden 2020).'},
 {name:'Lørenskog', svg:()=>shieldInner(G,`<g fill="none" stroke="${R}" stroke-width="10"><circle cx="100" cy="118" r="62"/><circle cx="100" cy="118" r="12"/></g><g stroke="${R}" stroke-width="7">${[0,45,90,135].map(a=>`<line x1="${100+62*Math.cos(a*Math.PI/180)}" y1="${118+62*Math.sin(a*Math.PI/180)}" x2="${100-62*Math.cos(a*Math.PI/180)}" y2="${118-62*Math.sin(a*Math.PI/180)}"/>`).join('')}</g><g fill="${R}">${[0,45,90,135,180,225,270,315].map(a=>`<rect x="92" y="34" width="16" height="22" transform="rotate(${a} 100 118)"/>`).join('')}</g>`), files:['Lørenskog komm.svg'], motif:'Rødt vannhjul på gull – sagbruk og skogbruk.'},
 {name:'Larvik', svg:()=>shieldInner(V,`<path d="M100,240 V110" stroke="${S}" stroke-width="10"/><g fill="${S}">${[[100,52,0],[70,70,-35],[130,70,35],[58,104,-60],[142,104,60],[76,134,-45],[124,134,45]].map(([x,y,r])=>`<path transform="translate(${x} ${y}) rotate(${r})" d="M0,-24 Q14,0 0,20 Q-14,0 0,-24Z"/>`).join('')}</g>`), files:['Larvik komm 2018.svg'], reformed:true, motif:'Et voksende tre med sju dråpeformede blader (2017).'},
 {name:'Indre Østfold', svg:()=>shieldInner(K,kEar(G)), files:['Indre Østfold komm.svg'], reformed:true, motif:'Kornaks i gull på svart – jordbruk (2020).'},
 {name:'Arendal', svg:()=>shieldInner(B,`<path fill="${S}" d="M40,150 L160,150 L146,172 L56,172 Z"/><rect x="98" y="40" width="5" height="110" fill="${S}"/><path fill="${S}" d="M92,50 L92,140 L50,140Z M108,46 L108,140 L150,140Z"/>${kWaves(S,188)}${kWaves(S,204)}${kWaves(S,220)}`), files:['Arendal komm.svg'], motif:'Seilskip i sølv på tre sølvbølger, på blått.'},
 {name:'Ullensaker', svg:()=>shieldInner(B,`<g fill="${G}"><circle cx="96" cy="62" r="14"/><path d="M80,80 H112 L118,140 L108,196 H96 L98,150 L90,150 L84,196 H72 L78,140 Z"/></g><path d="M40,206 Q100,196 164,210" stroke="${G}" stroke-width="7" fill="none"/><path d="M132,56 Q162,110 132,164" stroke="${G}" stroke-width="6" fill="none"/><path d="M132,56 L132,164" stroke="${G}" stroke-width="2"/>`), files:['Ullensaker komm.svg'], motif:'Guden Ull fra norrøn mytologi (ikke et tradisjonelt heraldisk motiv).'},
 {name:'Karmøy', svg:()=>shieldInner(R,`<g fill="none" stroke="${S}" stroke-width="10" stroke-linejoin="round"><path d="M84,38 H116 V98 H168 V130 H116 V204 H84 V130 H32 V98 H84 Z"/><path d="M100,38 V204 M32,114 H168"/></g>`), files:['Karmøy komm.svg'], motif:'Sprossekors i sølv på rødt – «karm», kristendommen og en knute for øya som knutepunkt.'},
 {name:'Øygarden', svg:()=>shieldInner(S,`<g fill="${B}"><path d="M68,92 L100,48 L132,92Z"/><rect x="72" y="96" width="56" height="70"/><rect x="62" y="166" width="76" height="16"/><rect x="80" y="182" width="40" height="30"/></g><g fill="${S}"><rect x="80" y="104" width="16" height="54"/><rect x="104" y="104" width="16" height="54"/></g>`), files:['Øygarden komm.svg'], motif:'Blå fyrlykt på sølv – havet.'},
 {name:'Haugesund', svg:()=>shieldInner(B,kGull(64,90,S)+kGull(136,90,S)+kGull(100,160,S)), files:['Haugesund komm.svg'], motif:'Tre måker i sølv på blått – sild og skipsfart.'},
 {name:'Porsgrunn', svg:()=>shieldInner(B,`<path d="M0,40 L200,220 L200,260 L0,80Z" fill="${S}"/><g fill="none" stroke="${G}" stroke-width="7" stroke-linecap="round"><path d="M146,40 V110 M128,56 H164 M118,96 Q146,124 174,96"/></g><path d="M40,200 Q60,150 80,120" stroke="${G}" stroke-width="5" fill="none"/>${[[50,176],[62,156],[72,138]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="12" ry="6" transform="rotate(-50 ${x} ${y})" fill="${G}"/>`).join('')}`), files:['Porsgrunn komm.svg'], motif:'En kvist av pors, et anker og et skråbånd i sølv for elva.'},
 {name:'Ringsaker', svg:()=>shieldInner(R,`<g transform="translate(-6 20)"><path fill="${S}" d="${WALK}"/>${kAntlers(S)}</g>`), files:['Ringsaker komm.svg'], motif:'Stående elg i sølv på rødt – inspirert av helleristningene på Stein.'}
];
