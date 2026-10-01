# Kvisstreneren

Én enkelt statisk side — `index.html` — med all HTML, CSS, JavaScript og alle data i samme fil.
Ingen byggesteg, ingen avhengigheter, ingen pakkefil. Åpne fila i nettleseren for å teste.
Det eneste utenfor er `manifest.webmanifest` og ikonene i `icons/` — se «Hjemskjermen».

Se «Konvensjoner» nederst for språkreglene — kort sagt: norsk ut til brukeren, engelsk i koden.

## Struktur

Sida har en forside (`#home`) med nedtelling til neste kviss og én knapp per modus, og seks visninger som byttes med `goMode()`:

| Modus | Seksjon | Innhold |
|---|---|---|
| `prep` | `#prepApp` | Ukas kvissprep — se under |
| `tbane` | `#tbaneApp` | T-banen: «neste stopp»-kviss og kart (`TBANE`) — se under |
| `vapen` | `#vapenApp` | Fylkes- og kommunevåpen (`FYLKER`, `KOMMUNER`, `SETS`) |
| `bydel` | `#bydelApp` | Oslos bydeler (`BSETS`) |
| `caesar` | `#caesarApp` | Hotel Cæsar: roller og skuespillere (`CAESAR`, `CAESAR_OUT`) — se under |
| `mgp` | `#mgpApp` | Melodi Grand Prix: vinnere og årstall (`MGP`, `MGP_GAPS`) — se under |

`goMode()` viser/skjuler seksjonene. Hver modus har sin egen adresse med hash — `#prep`, `#tbane`,
`#vapen`, `#bydel`, `#caesar`, `#mgp`; forsida har ingen hash — så tilbakeknappen i nettleseren,
tilbakegesten på Android, oppdatering og lenker rett til en modus virker. Hash er valgt fordi
GitHub Pages bare serverer `index.html`: stier som `/kvisstreneren/tbane` ville gitt 404.
Knappene på forsida går via `openMode()` (`pushState`); «← Alle kvisser» (`goHome()`) går ett
steg tilbake i historikken hvis man kom fra forsida, og bytter ellers ut oppføringen, så
historikken ikke hoper seg opp. `syncMode()` følger `popstate`/`hashchange`; ukjent hash gir
forsida. Fanene inne i en modus («Kviss», «Kart», «Pugg» …) har ingen egen adresse.

Ny modus krever fire ting: en `<section>`/`<div>` i HTML, en linje i `goMode()`, navnet i
`MODES`, og en `addEventListener` med `openMode()` på knappen på forsida.

## Ukas kvissprep

Forsidas øverste knapp åpner `#prepApp`, som rendrer markdown-rapporten fra **quizprep**-skillen.
To steder er involvert:

- `#prepSource` i markupen (inne i `#prepApp`) — en `<script type="text/markdown">`-blokk som
  holder selve rapporten, ordrett. Attributtet `data-uke` holder quizdatoen.
- Nederst i `<script>`: `prepMarkdown()` / `prepInline()` (en liten markdown-renderer) og
  `renderPrep()`, som fyller `#prepBody` og teksten på forsideknappen ved oppstart.

### Slik legger du inn ny prep

Kjør quizprep-skillen. Lagre rapporten som `prep/<quizdato>.md` (f.eks.
`prep/2026-10-07.md`) — den mappa er arkivet over gamle preper. Kjør så, fra reporoten:

```bash
node tools/set-prep.mjs <rapport.md> "onsdag 7. oktober 2026"
```

Skriptet legger rapporten inn i `#prepSource` og setter `data-uke`. Åpne `index.html` i
nettleseren etterpå og se over at det ser riktig ut. Datoargumentet er valgfritt, men det er
det som gir teksten «Klar til onsdag 7. oktober 2026» på forsideknappen.

Mellom to preper:

```bash
node tools/set-prep.mjs --clear
```

Da viser sida placeholderen «Ukas prep kommer snart» igjen, og forsideknappen sier «Kommer
snart». Ingen andre endringer trengs.

**Kjøres quizprep herfra, hører dette med til jobben.** Skriv rapporten til `prep/<dato>.md`,
kjør `set-prep.mjs`, sjekk sida i nettleseren, og commit både rapporten og `index.html`. Ikke
lim rapporten inn for hånd, og ikke forhåndsformater markdownen — skriptet og rendreren tar den
som den er.

Sida viser bare den nyeste prepen; `prep/`-mappa er arkivet.

Når kvissdagen er over (fra dagen etter datoen i `data-uke`, eller i rapportens første linje om
attributtet mangler), viser `renderPrep()` et varsel øverst (`#prepStale`) om at prepen er
utdatert og at ny kommer neste onsdag — på selve onsdagen «Ny prep til i kveld kommer snart». Forsideknappen
sier det samme i stedet for «Klar til …». Datoen leses fra teksten, så den må ha dag, måned og
år («onsdag 7. oktober 2026»). Varselet regnes ut på nytt hver gang man går til forsida eller
prepen, og forsvinner av seg selv når `set-prep.mjs` legger inn en ny rapport.

### Hva rendreren støtter

Rapporten fra quizprep bruker bare dette, og rendreren dekker akkurat det:

- `#` til `####` overskrifter
- punktlister med `-` eller `*`
- `**fet**` og `` `kode` ``
- `[tekst](url)` og bare URL-er — begge blir klikkbare lenker som åpner i ny fane
- `---` som skillelinje
- vanlige linjer blir avsnitt; blanke linjer skiller blokker

Alt annet (tabeller, bilder, kursiv, kodeblokker, nøstede lister) blir stående som rå tekst.
Trenger rapporten mer, utvid `prepMarkdown()` — ikke forhåndsformater markdownen for hånd, for
da må jobben gjøres på nytt neste uke.

All tekst HTML-escapes før den rendres, så rapporten kan legges inn ordrett — backticks,
anførselstegn og spesialtegn går fint. Det eneste `set-prep.mjs` må røre er en bokstavelig
`</script` i teksten, som ellers ville lukket blokken for tidlig.

## T-banen

Kartet tegnes som SVG fra `TBANE` — ingen bilder. `TBANE` er generert; ikke rediger den for hånd.
Når Ruter endrer linjer eller stopp, kjør fra reporoten:

```bash
node tools/update-tbane.mjs
```

Skriptet henter linjene fra Entur (der Ruter publiserer rutene), tar det lengste stoppmønsteret
i hver retning per linje, og legger stasjoner, stoppfølger og spor inn i `index.html`.
Stoppfølgen er per retning fordi den ikke alltid er lik begge veier — Gulleråsen har bare
plattform mot Frognerseteren. Sentrum forstørres med en fiskeøyeprojeksjon (`FISH_R`/`FISH_P`
i skriptet). Linjefargene ligger i CSS som `--l1`…`--l5`, ikke i dataene.

Bryteren øverst («Geografisk» / «Linjekart») gjelder både «Kviss» og «Kart», og huskes i
`localStorage` under `tMapKind`. «Geografisk» er SVG-en fra `TBANE`. «Linjekart» er Ruters eget
schematiske linjekart: et bilde som lenkes direkte fra Ruters CDN, på samme måte som våpnene lenkes
fra Wikimedia — det ligger ikke i repoet. Siden Ruters kart har alle stasjonsnavnene trykt på seg,
dekker kvissen til alle navn (også endestasjonsoverskriftene) unntatt de to viste stoppene, med
felt i kartets bakgrunnsfarge (`.rc`), så man ikke ser hvor lange navnene er. Svaret
får en «?»-pille som er minst like lang som det lengste svaralternativet, så lengden ikke røper noe.
Etter svaret vises alle navnene. I «Kart» kan man trykke på navnene; linjevelgeren skjules der, siden
den ikke kan dimme linjer i et bilde. Får ikke sida hentet bildet, faller begge fanene tilbake til
det geografiske kartet med en melding (`#tMapNote`).

`T_RUTER` holder bildelenken og hvor hvert navn står på bildet (senter, lengde, høyde og vinkel i
bildepiksler). Den er generert; ikke rediger den for hånd:

```bash
node tools/update-ruter-map.mjs
```

Skriptet laster ned Ruters PDF og trenger `pdftocairo` (poppler-utils). PDF-en har ikke noe
tekstlag — hver bokstav er en omriss-figur — så skriptet grupperer bokstavene til ord, regner like
figurer som samme bokstav og løser det som et chiffer mot stasjonsnavnene i `TBANE`. Når Ruter
publiserer et nytt kart, får PDF-en og bildet nye adresser: hent dem fra T-bane-sida på ruter.no
(«Linjekart for T-banen» og bildet «Oversikt over alle t-banelinjer»), sett dem inn øverst i
skriptet og kjør det. Finner det ikke alle stasjonene entydig, stopper det og sier hvilke.

Kvissen spør om neste stopp i en retning, og viser de to foregående stoppene. Spørsmål der de
viste stoppene ikke avgjør svaret, droppes (linje 5 passerer Tøyen og Carl Berners plass to
ganger). Er det skjulte stoppet en endestasjon, spørres det etter endestasjonen i stedet, siden
«mot X» ellers ville røpet svaret.

## Hotel Cæsar

Kviss om hvem som spilte hvem i TV 2-såpen (1998–2017). Tre spørsmålstyper, valgt med knappene
øverst: rolle → skuespiller, skuespiller → rolle, og «Skriv svaret» (begge veier, uten
alternativer, med litt slingringsmonn for skrivefeil). «Pugg»-fanen viser hele lista.

- `CAESAR` — én rad per rollefigur: `r` rolle, `a` skuespiller, `also` andre som har spilt samme
  rolle (omcasting eller barneversjonen; teller som riktig og brukes aldri som feil alternativ),
  `g` rollefigurens kjønn (`'k'`/`'m'`, så feilalternativene blir troverdige), `y` år i serien,
  `n` kort beskrivelse, og `top:1` for de største rollene.
- Spørsmålene hentes bare fra `top:1`-radene. De andre rollene brukes som feil alternativer når
  svaret er en rolle, og deres skuespillere når svaret er en skuespiller.
- `CAESAR_OUT` — kjente norske skuespillere som **ikke** var med i serien. Når svaret er en
  skuespiller, er to av de fem feilalternativene herfra. Legg bare til navn du har sjekket; serien
  hadde hundrevis av gjesteroller.

### Bilder av rollefigurene

Hvert spørsmål viser et bilde av rollefiguren, og «Pugg» (og lista over bom på slutten) viser
miniatyrbilder. Bare `top:1`-rollene har bilde — det er bare de det spørres om; de andre rollene
vises uten bilde i «Pugg». Bryteren «Vis bilder» slår dem av og på for både «Kviss» og «Pugg», og huskes i
`localStorage` under `cPics` (bilder er på som standard). Bildene er infoboksbildene fra
rollefigur-artiklene på hotelcaesar.fandom.com. De lenkes direkte fra Fandoms CDN, på samme måte som
våpnene lenkes fra Wikimedia, og ligger ikke i repoet. Fandom avviser forespørsler med en
fremmed `Referer`, så `<img>` må ha `referrerpolicy="no-referrer"` (det har `cPic()`). Får et bilde
ikke lastet, fjernes det, og resten av sida virker som før.

`CAESAR_IMG` (rolle → bildelenke) er generert; ikke rediger den for hånd. Når du har endret
`top:1`-rollene i `CAESAR`, eller vil ha nye bilder fra wikien, kjør fra reporoten:

```bash
node tools/update-caesar-images.mjs
```

Wikien skriver av og til navnet annerledes enn vi gjør («Åge Nygaard»);
slike avvik står i `TITLES` øverst i skriptet. Er infoboksbildet dårlig, kan du velge et bilde fra
artikkelens galleri i `FILES`. Skriptet sier fra om roller det ikke fant noe bilde for.

### Utvalget

`top:1` er de rundt 30 rollene med flest episoder på IMDb (tt0177446, summert over alle som har
spilt rollen): alle med minst 310 episoder, der tre roller deler plassen på grensa. To unntak:
Georg Anker-Hansen er med selv om han bare var med i et drøyt år, fordi han er seriens mest kjente
rolle, og resepsjonisten Fiona er holdt utenfor fordi hun er en bakgrunnsrolle uten etternavn.

Lista er satt sammen for hånd. Episodetallene er fra IMDb-sida med full rolleliste (hentet via
Wayback Machine, februar 2023 — IMDb blokkerer direkte henting). Årstall og beskrivelser er
sjekket mot fandom-wikien hotelcaesar.fandom.com (infoboksene har årene), «Liste over tidligere
rollefigurer i Hotel Cæsar» og rollefigur-artiklene på no.wikipedia. Der kildene er uenige om
årstall, er fandom-wikien fulgt. `CAESAR_OUT` er sjekket mot hele IMDb-rollelista, fandom-wikien
og skuespillernes egne Wikipedia-artikler (september 2026). Det finnes ikke noe skript for lista.

## Melodi Grand Prix

Kviss om hvem som vant MGP hvilket år. Tre spørsmålstyper, som i Hotel Cæsar: år → artist,
artist → år (med låttittelen, så artister med flere seire får et entydig spørsmål), og «Skriv
svaret» (begge veier; årstall kan skrives med to sifre, «85»). Chipene «Fra og med» setter
tidligste år som spørres om (Alle, 1980, 1990, 2000, 2010) og huskes i `localStorage` under
`mgpFrom`. Det finnes bevisst ingen øvre grense. «Pugg»-fanen viser alle år i utvalget, per tiår.

- `MGP` — én rad per MGP-finale fra 1971: `y` år, `a` artisten som representerte Norge i
  Eurovision (det er svaret), `s` låta slik den het i Eurovision, `e` plassering i
  Eurovision-finalen (`'semi'` = røk ut i semifinalen, `'x'` = avlyst i 2020), `last`/`zero` for
  sisteplass og null poeng, `m` medlemmer av en gruppe, `also` andre som sang vinnerlåta i
  MGP-finalen, `al` andre skrivemåter som godtas, og `n` en merknad som vises etter svaret.
- Ingen i `a`, `m` eller `also` brukes som feil alternativ for sitt eget år — så Jahn Teigen
  dukker ikke opp som feil svar for 1974, og Hanne Krogh ikke for 1985 (Bobbysocks). Når du
  legger til en gruppe, før opp medlemmene som har vunnet på egen hånd i `m`.
- `MGP_GAPS` — år uten MGP-finale, som vises i «Pugg», men aldri spørres om: 1970 (boikott),
  1991 (NRK avlyste finalen og valgte «Mrs. Thompson» med Just 4 Fun selv) og 2002 (rykket ned).
- 1972–1976 ble hver låt framført to ganger i MGP, av to ulike artister; bare den som dro til
  Eurovision står i `a`, den andre står i `also` og godtas som svar i «Skriv svaret».

Kilder: «Melodi Grand Prix» (vinnertabellen) og årsartiklene på no.wikipedia, og «Norway in the
Eurovision Song Contest» på en.wikipedia (plasseringene), sjekket september 2026. Etter hvert
års MGP: legg til en rad nederst i `MGP` (plasseringen kommer i mai). Det finnes ikke noe skript.

## Nedtellingen

Øverst på forsida (`#countdown`) står en nedtelling til neste kviss, onsdag kl. 19. Mens kvissen
pågår, onsdag 19–22, står det i stedet at man ikke har lov til å være her, og at juks er strengt
forbudt. Fra kl. 22 teller den ned til neste onsdag. Tidene gjelder norsk tid (`Europe/Oslo`)
uansett hvilken tidssone enheten står i, og sommertidsskiftet er regnet med. Dag og klokkeslett
står i `QUIZ_DAY`, `QUIZ_START` og `QUIZ_END`; `renderCountdown()` kjøres hvert sekund.

Enheter som er null foran, vises ikke («5 timer 0 minutter 30 sekunder», ikke «0 dager …»);
nuller i midten blir stående. Den siste timen vises også millisekunder, og da tegnes nedtellingen
hver frame (`requestAnimationFrame`) — men bare mens forsida vises; ellers er det ett sekund
igjen. Markupen bygges bare på nytt når oppsettet endres; ellers skrives bare tallene
(`cdShow()`), så det koster nesten ingenting.

## Hjemskjermen

På mobil (berøringsskjerm) viser forsida knappen «Legg til på hjemskjermen» øverst til høyre
(`#installBtn`). Knappen skjules når sida allerede kjører som app fra hjemskjermen, og når
brukeren har trykket «Ikke vis knappen igjen» (`localStorage`-nøkkelen `installHidden`).
I Chrome på Android åpner knappen nettleserens egen installeringsdialog (`beforeinstallprompt`);
ellers, blant annet på iPhone, der det ikke finnes noen slik dialog, åpner den et ark
(`#installSheet`) med stegene for iOS eller for andre nettlesere. Chrome kan også vise sitt eget
installeringsbanner uoppfordret; det lar vi være, med mindre brukeren har skjult knappen —
da undertrykkes banneret også (`preventDefault()` på `beforeinstallprompt`).

Sida har bevisst ingen service worker og ingen offline-modus: bildene (våpen, Ruters kart)
skal alltid hentes rett fra kilden, uten mellomlagring som kan komme i veien.

Dette trenger to ting utenfor `index.html`, siden nettleserne henter dem som egne filer:
`manifest.webmanifest` (navn, farger, `display: standalone`) og ikonene i `icons/`.
`icons/icon.svg` er kilden og brukes også som favicon; PNG-ene (180, 192 og 512 piksler) er
rendret fra den. Endrer du ikonet, rendre PNG-ene på nytt, f.eks. med Playwright/Chromium.

## Testing

Det finnes ingen testpakke. Etter en endring:

```bash
node -e "const s=require('fs').readFileSync('index.html','utf8');[...s.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach((b,i)=>{new Function(b[1]);console.log('block',i,'ok')})"
```

Det fanger syntaksfeil. Resten må sjekkes i nettleseren: forsida, alle seks modusene, og både
lys og mørk modus (temaet følger `prefers-color-scheme`). Knappen for hjemskjermen vises bare
med mobilemulering (berøring) i utviklerverktøyene.

## Konvensjoner

- **Alt brukeren ser skal være på norsk** (bokmål): knappetekster, overskrifter, tilbakemeldinger,
  feilmeldinger, `<title>`, `aria-label` og annen skjermlesertekst. Ingen engelske ord i
  grensesnittet — heller ikke i midlertidig tekst eller placeholdere.
- **Koden er på engelsk**: variabel- og funksjonsnavn, id-er, CSS-klasser og kommentarer.
  Unntaket er egennavn og faguttrykk som ikke har noen naturlig engelsk form — `FYLKER`,
  `KOMMUNER`, `bydel`, `vapen` — de blir stående som de er.
- **Commit-meldinger skrives alltid på engelsk**, selv om sida og denne fila er på norsk.
- **Før push til main:** squash alle commits i branchen til én, rebase den på nyeste
  `origin/main`, og fast-forward main til den (`git push origin HEAD:main`, aldri force-push
  til main). Kjør syntakssjekken under «Testing» på nytt etter rebasen.
- Denne fila (CLAUDE.md) er på norsk, som dokumentasjon for deg.
