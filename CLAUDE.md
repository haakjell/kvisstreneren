# Kvisstreneren

En statisk side på GitHub Pages som trener til onsdagskvissen: `index.html` med markupen, og CSS,
JavaScript og data i egne filer ved siden av. Ingen byggesteg, ingen avhengigheter, ingen
pakkefil. Åpne `index.html` i nettleseren for å teste — det virker også som lokal fil (`file://`),
fordi skriptene er vanlige `<script src>`, ikke ES-moduler. Hold det sånn: moduler
(`import`/`export`) lastes ikke fra `file://`.

Se «Konvensjoner» nederst for språkreglene — kort sagt: norsk ut til brukeren, engelsk i koden.

## Filene

```
index.html            markupen: forsida, alle modusene, innstillingene, arkene — og ukas prepp (#prepSource)
css/base.css          tema (lys/mørk), layout, kort, knapper, faner, alternativer, brytere, «Skjul navn»
css/modes.css         forsida, hver modus og innstillingene, i hver sin bolk
css/countdown.css · install.css · ads.css
js/core.js            felles hjelpere: $(), store, navn (normName()), tilfeldighet (rnd()),
                      tid (serverNow(), osloWall(), quizLive() …), modusregisteret (addMode()) og MIX
js/ui.js              felles grensesnitt: tabs(), radios(), hideAnswers(), dropBrokenPics()
js/quiz.js            spillmotoren, makeQuiz(): spørsmåls- og resultatkortet for alle kvissene
js/modes/<modus>.js   hver kvissmodus: spørsmålene, valgene øverst, «Pugg» og kilden i MIX
js/theme.js           lyst/mørkt tema fra innstillingene — lastes i <head>, se «Innstillinger»
js/prep.js · dagens.js · ads.js · countdown.js · install.js
js/settings.js        Innstillinger — se under
js/app.js             modusbytte og ruting (goMode()) og oppstart
data/<navn>.js        dataene, én fil per tema — se tabellen under
tools/                skript som oppdaterer data og prepp, og regresjonstesten — se «Verktøy»
prep/                 arkivet over ukas prepp, én markdown-fil per kviss
manifest.webmanifest, icons/   for hjemskjermen — se «Hjemskjermen»
ads/                  fotoer til annonsene — se «Reklame»
```

Skriptene lastes i rekkefølgen nederst i `index.html`: `core.js`, `ui.js` og `quiz.js`, så alle
`data/`-filene, så modusene og resten, og `app.js` til slutt. Unntaket er `theme.js`, som lastes i
`<head>` så sida ikke blinker i feil tema før skriptene nederst har kjørt. Alle deler samme globale navnerom,
så kode på toppnivå i en fil kan bare bruke det som er lastet før den. Ny fil = ny
`<script src>`-linje på riktig plass. Det som er privat for en modus, har modusens prefiks
(`t…` for T-banen, `mg…` for MGP osv.), så navnene ikke kolliderer.

Hvor ny kode hører hjemme: data i `data/`, alt som gjelder én modus i `js/modes/<modus>.js` (og
CSS-en i dens bolk i `modes.css`), og bare det flere filer bruker, i `core.js` (logikk) eller
`ui.js` (grensesnitt). Ingen inline `<script>` eller `<style>` i `index.html`, bortsett fra
preppens markdown-blokk.

GitHub Pages lar nettleseren mellomlagre filene i ti minutter, så rett etter en publisering kan
noen få ny `index.html` med gamle skript; en oppdatering av sida retter det.

## Struktur

Sida har en forside (`#home`) med nedtelling til neste kviss og én knapp per modus, og åtte
moduser. I tillegg er det innstillingene (`#settings`), som åpnes med tannhjulet til høyre for
tittelen på forsida — se «Innstillinger». Tabellen står i samme rekkefølge som knappene på forsida.

| Modus | Kode | Data | Innhold |
|---|---|---|---|
| `prep` | `js/prep.js` | `#prepSource` i `index.html` | Ukas prepp — se under |
| `dagens` | `js/dagens.js` | — | Dagens kviss: blandede spørsmål fra de andre modusene (`MIX`) — se under |
| `bydel` | `js/modes/bydel.js` | `data/bydeler.js` | Bydelene: Oslos bydeler (`BSETS`) |
| `tbane` | `js/modes/tbane.js` | `data/tbane.js`, `data/ruter-map.js` | T-banen: «neste stopp»-kviss og kart — se under |
| `regjering` | `js/modes/regjering.js` | `data/statsrad.js` | Regjeringen: statsrådene og postene deres — se under |
| `vapen` | `js/modes/vapen.js` | `data/vapen.js` | Fylkes- og kommunevåpen (`FYLKER`, `KOMMUNER`, `SETS`) |
| `mgp` | `js/modes/mgp.js` | `data/mgp.js` | Melodi Grand Prix: vinnere og årstall — se under |
| `caesar` | `js/modes/caesar.js` | `data/caesar.js`, `data/caesar-img.js` | Hotel Cæsar: roller og skuespillere — se under |

Hver modus melder seg på selv med `addMode(navn, open)` nederst i fila si. Navnet gir alt annet:
seksjonen i markupen er `#<navn>App`, adressen er `#<navn>`, og knappen på forsida har
`data-mode="<navn>"`. `goMode()` i `app.js` viser den ene seksjonen, skjuler resten og kaller
modusens `open()` hver gang den vises. Forsida er den eneste visningen som ikke er en modus.

Adressen med hash — `#prep`, `#dagens`, `#tbane` …; forsida har ingen — gjør at tilbakeknappen i
nettleseren, tilbakegesten på Android, oppdatering og lenker rett til en modus virker. Hash er
valgt fordi GitHub Pages bare serverer `index.html`: stier som `/kvisstreneren/tbane` ville gitt
404. Knappene på forsida går via `openMode()` (`pushState`); «← Alle kvisser» (`goHome()`) går ett
steg tilbake i historikken hvis man kom fra forsida, og bytter ellers ut oppføringen, så
historikken ikke hoper seg opp. `syncMode()` følger `popstate`/`hashchange`; ukjent hash gir
forsida. Fanene inne i en modus («Kviss», «Kart», «Pugg» …) har ingen egen adresse.

Ny modus krever tre ting: en `<div id="<navn>App" hidden>` i HTML med en tom `<main>` til
kvisskortet, en knapp på forsida med `data-mode="<navn>"`, og en fil i `js/modes/` (og data i
`data/`) med `<script src>` i `index.html`, som avslutter med `addMode('<navn>', open)`. Kvissen
selv er `makeQuiz()` — se «Spillmotoren». Skal den være med i Dagens kviss, trenger den også en
kilde i `MIX` — se «Dagens kviss».

### Spillmotoren

Alle kvissene, også Dagens kviss, kjøres av `makeQuiz()` i `js/quiz.js`. Den skriver
spørsmålskortet og resultatkortet inn i modusens `<main>` og står for alt som er likt:
telleren, poengene, fremdriftslinja, alternativene, «Riktig!» /
«Det var X», videre etter 1000 ms ved riktig svar (`QUIZ_AUTO`; kan skrus av i innstillingene,
`quizAuto()`), lista over bom, «Øv på dem du
bommet på» og «Ti nye spørsmål», og tastene 1–6 og Enter (én lytter for alle).

En modus gir motoren spørsmål på én felles form, beskrevet øverst i `quiz.js`: spørsmålstekst,
HTML i boksen (`prompt()`), eventuelt ny HTML etter svaret (`reveal()`), alternativene som
`{label, ok, info}`, faktateksten og raden i lista over bom. Hver
modus har én funksjon som lager et spørsmål — `vQuestion()`, `bQuestion()`, `tQuestion()`,
`rgQuestion()`, `cQuestion()`, `mgQuestion()` — og den brukes både av modusens egen kviss (via
`ask`) og av kilden i `MIX`. Det modusen selv gjør, er å lage stokken (`newDeck`), valgene øverst
og «Pugg».

Motoren gir tilbake `start(stokk)`, `stop()` (stopper tidtakeren; `goMode()` og fanene kaller den),
`redrawBox()` (tegner boksen på nytt, f.eks. når bilder slås av), `reshow()` (spør det samme
spørsmålet på nytt med nye alternativer, for T-banens karttype), `renderMissed()`, `button(act)`
og noen flere — se slutten av `makeQuiz()`.

### Felles byggeklosser

Bruk det som finnes i stedet for å lage nye varianter:

- `$(id)` for `document.getElementById`.
- `store.get/set/getJSON/setJSON` for `localStorage` — de tåler at lagringen mangler eller nekter
  (privat modus), så ingen try/catch rundt. `store.set(nøkkel, null)` fjerner nøkkelen.
- `tabs()` for «Kviss»/«Pugg»-fanene, `radios()` for en rad med valgknapper (`role="radio"`).
- `hideAnswers()` for «Skjul navn»-knappen i «Pugg»: svaret i hver rad har klassen `ans`, og raden
  har `tabindex`, så den kan trykkes fram. CSS-en ligger én gang i `base.css` (`.hide-answers`).
- `dropBrokenPics()` fjerner bilder som ikke laster, i stedet for å vise dem ødelagt.
- `normName()` for å sammenligne navn uten store bokstaver, aksenter og bindestreker (MGP bruker
  den for å holde artistene i et år utenfor feilalternativene).

### Tid

**All tid kommer fra serveren, ikke fra enheten**, siden alle kan stille klokka si. `syncClock()`
(i `core.js`) sender en HEAD-forespørsel etter sida selv og leser `Date`-headeren (pluss `Age`, om
det var en mellomlagring som svarte). Derfra regner `serverNow()` seg videre med
`performance.now()`, som ikke flytter seg når klokka på enheten endres. Klokka spørres ved
oppstart, hver gang sida kommer tilbake på skjermen (`visibilitychange` — `performance.now()` kan
stå stille mens en telefon sover), og hver gang Dagens kviss åpnes. Bruk `serverNow()`, aldri
`Date.now()` eller `new Date()`, når noe avhenger av hva klokka er. Datoer og klokkeslett regnes i
norsk tid uansett hvilken tidssone enheten står i: `osloWall()`, `osloDay()` og `quizLive()`
(onsdag 19–22), med sommertid. Før serveren har svart, og når sida er åpnet som lokal fil
(`file://`, bare for testing), gir `serverNow()` enhetens klokke.

### Tilfeldighet

Alle tilfeldige valg i kvissene (`shuffle()`, feilalternativer, retning på spørsmålet) går gjennom
`rnd()`, ikke `Math.random()`. Det er det som lar Dagens kviss bytte inn en generator med frø
(`withSeed()`) og gi alle de samme spørsmålene. Bruk `rnd()` også i ny kode.

## Innstillinger

Tannhjulet på forsida (`.gear`, høyrestilt på linje med tittelen i `.hometitle`, under
nedtellingen) åpner `#settingsApp`. Den er registrert med `addMode('settings', …)` som en modus,
så den får adresse (`#settings`) og tilbakeknappen virker, men den er ingen kviss, ikke med i
tabellen over og ikke i Dagens kviss. Alt lagres i `localStorage` på enheten.

| Innstilling | Nøkkel | Bor i |
|---|---|---|
| Gå videre av seg selv ved riktig svar (standard på) | `autoNext` (`'0'` = av) | `quizAuto()` i `quiz.js` |
| Bilder i Hotel Cæsar (standard på) | `cPics` | `cSetPics()` i `caesar.js` |
| T-banekartet: Geografisk / Linjekart | `tMapKind` | `tSetKind()` i `tbane.js` |
| Utseende: Som enheten / Lyst / Mørkt | `theme` (ingen = som enheten) | `applyTheme()` i `theme.js` |
| Vis «Legg til på hjemskjermen» (bare på berøringsskjerm, ikke installert) | `installHidden` | `installShow()` i `install.js` |

Hver innstilling bor hos koden som bruker den; `js/settings.js` viser dem bare og endrer dem med
de samme funksjonene som modusenes egne brytere, så de alltid er enige, og leser dem på nytt hver
gang sida åpnes. Ny innstilling: en rad i `#settingsApp` (`.switch` for av/på, `.setswitch` for
valg), og koden i `settings.js`. Når automatisk videre er av, venter et riktig svar på «Neste»
(eller Enter), akkurat som et feil.

Temaet setter `data-theme="light|dark"` på `<html>`; CSS-en har fargene for begge, både under
`prefers-color-scheme` og for `[data-theme]`. `applyTheme()` bytter også fargen på nettleserlinja
(`theme-color`). Skjuler man «Legg til på hjemskjermen» med «Ikke vis knappen igjen», kan den slås
på igjen her.

Reklamevalget (`shakeOff`) står bevisst ikke i innstillingene ennå — det kommer senere.

## Ukas prepp

Forsidas øverste knapp åpner `#prepApp`, som rendrer markdown-rapporten fra **quizprep**-skillen.
To steder er involvert:

- `#prepSource` i markupen (inne i `#prepApp`) — en `<script type="text/markdown">`-blokk som
  holder selve rapporten, ordrett. Attributtet `data-uke` holder quizdatoen.
- `js/prep.js`: `prepMarkdown()` / `prepInline()` (en liten markdown-renderer) og
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

Da viser sida placeholderen «Ukas prepp kommer snart» igjen, og forsideknappen sier «Kommer
snart». Ingen andre endringer trengs.

**Kjøres quizprep herfra, hører dette med til jobben.** Skriv rapporten til `prep/<dato>.md`,
kjør `set-prep.mjs`, sjekk sida i nettleseren, og commit både rapporten og `index.html`. Ikke
lim rapporten inn for hånd, og ikke forhåndsformater markdownen — skriptet og rendreren tar den
som den er.

Sida viser bare den nyeste prepen; `prep/`-mappa er arkivet.

På desktop (fra 900 px) er preppen bredere enn resten av sida, siden den bare er tekst:
`goMode()` setter klassen `wide` på `.wrap` når preppen vises (`addMode('prep', …, {wide:true})`),
og den får da `clamp(560px, 60vw, 960px)` — omtrent halve skjermen på en vanlig 1920-skjerm. Forsida og
kvissene beholder 560 px.

Når kvissdagen er over (fra dagen etter datoen i `data-uke`, eller i rapportens første linje om
attributtet mangler), viser `renderPrep()` et varsel øverst (`#prepStale`) om at preppen er
utdatert («Denne preppen er utdatert») og at ny kommer neste onsdag — på selve onsdagen «Ny prepp
til i kveld kommer snart». Forsideknappen sier det samme i stedet for «Klar til …». Datoen leses fra teksten, så den må ha dag, måned og
år («onsdag 7. oktober 2026»). Varselet regnes ut på nytt hver gang man går til forsida eller
prepen (og når klokka er spurt på nytt), og forsvinner av seg selv når `set-prep.mjs` legger inn
en ny rapport. «Dagen etter» regnes i norsk tid etter serverens klokke (se «Tid»).

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

## Dagens kviss

Ti blandede spørsmål med svaralternativer, alltid to fra hver modus og alltid i samme rekkefølge:
to om bydelene, to om T-banen, to våpenskjold, to MGP og to Hotel Cæsar (`MX_ORDER`, `MX_EACH`).
Det er et krav at hver runde har to fra hver modus, i den rekkefølgen.

Dagens runde trekkes med et frø laget av datoen i norsk tid, så alle får de samme spørsmålene
samme dag, og nye ved midnatt. Hver modus' trekning og hvert spørsmåls tegning får hvert sitt frø
(`mxSeeded()`), så én modus ikke kan forskyve de andre. T-banens feilalternativer velges når kartet
tegnes, ut fra hvilke navn som får plass, og kan derfor variere litt med skjermbredden og
karttypen; spørsmålene er de samme.

**Datoen kommer fra serveren** (se «Tid»), og hver gang modusen åpnes, eller sida kommer tilbake
på skjermen mens den er åpen, spør `mxOpen()` serveren på nytt før den bestemmer hvilken dag det
er. Er det blitt en ny dag, starter dagens runde. Dagens kviss starter aldri på enhetens klokke:
får sida ikke kontakt og har ingen tid fra før, vises «Fikk ikke hentet datoen» med en knapp for
å prøve igjen (`#mxOffline`). Også stengingen onsdag 19–22 går etter serverens klokke.

Svarene lagres etter hvert spørsmål i `localStorage` under `dagens` (`day`, `marks` som «1»/«0»
per spørsmål, og `log` med poeng per dag). Oppdaterer man sida midt i runden, fortsetter den
der man slapp, uten å gi samme spørsmål på nytt. `log` gir «N dager på rad».

Rundene er nummerert fra `MX_FIRST` (1. oktober 2026 er #0, dagen etter #1 osv.), og nummeret
står under overskriften. Etter runden kan resultatet deles som i Wordle (delingsarket på mobil,
ellers utklippstavla), i akkurat dette formatet:

```
Kvisstreneren #N
8 av 10
🟩🟥🟩🟩🟩🟩🟩🟥🟩🟩
https://haakjell.github.io/kvisstreneren/#dagens
```

Lenken står i `MX_URL`. «Ti blandede spørsmål til» gir en fri runde uten frø, som ikke lagres.
Onsdag 19–22 er modusen stengt, som nedtellingen. Endres dataene i en modus (en ny rad i `MGP`), kan dagens spørsmål bli andre for dem
som ikke har spilt ennå; det er greit.

### Kildene i `MIX`

Hver modus legger inn sin egen kilde, `MIX.<modus> = {label, deal(n)}`, rett etter sin egen kviss.
`deal(n)` gir `n` ulike spørsmål på motorens form (se «Spillmotoren»), laget av den samme
`…Question()`-funksjonen som modusens egen kviss bruker, så det finnes bare én versjon av
logikken. Kilden bytter bare ut det som er annerledes i Dagens kviss, som raden i lista over bom.
Endrer du hvordan en modus lager spørsmål, gjør det i `…Question()`, så følger Dagens kviss med.
Pass på rekkefølgen av `rnd()`-kallene: flytter du dem, blir dagens spørsmål andre for dem som
allerede har startet (regresjonstesten fanger det).

Valgene i modusene selv gjelder ikke i Dagens kviss. Utvalget der er fast:

- **Bydelene:** tilfeldig blant alle, både dagens 15 og de 8 nye fra 2028. De nye er merket, både
  i spørsmålet («Hvilken av de nye bydelene er markert?») og i telleren («Bydelene, de nye fra
  2028», via `tag` i kilden).
- **T-banen:** alle linjer, på det kartet som er valgt i T-banemodusen («Geografisk» eller
  «Linjekart», `tMapKind`), eller i innstillingene.
- **Våpenskjold:** tilfeldig blant alle, både fylkesvåpen og kommunevåpen.
- **MGP:** bare fra og med 2000 (`MG_MIX_FROM`), også feilalternativene, og det står i telleren
  («MGP fra og med 2000») og i teksten under kortet. År → artist eller artist → år, tilfeldig.
- **Hotel Cæsar:** bare rolle → skuespiller.

## T-banen

Kartet tegnes som SVG fra `TBANE` — ingen bilder. `TBANE` er generert; ikke rediger den for hånd.
Når Ruter endrer linjer eller stopp, kjør fra reporoten:

```bash
node tools/update-tbane.mjs
```

Skriptet henter linjene fra Entur (der Ruter publiserer rutene), tar det lengste stoppmønsteret
i hver retning per linje, og skriver stasjoner, stoppfølger og spor til `data/tbane.js`.
Stoppfølgen er per retning fordi den ikke alltid er lik begge veier — Gulleråsen har bare
plattform mot Frognerseteren. Sentrum forstørres med en fiskeøyeprojeksjon (`FISH_R`/`FISH_P`
i skriptet). Linjefargene ligger i CSS som `--l1`…`--l5`, ikke i dataene.

Bryteren øverst («Geografisk» / «Linjekart») gjelder både «Kviss» og «Kart», og huskes i
`localStorage` under `tMapKind`. «Linjekart» er standard. Valget finnes også i innstillingene. Nøkkelen skrives bare når noen trykker
på bryteren, så en lagret `'geo'` er et valg og blir respektert; alle uten lagret verdi får
linjekartet. «Geografisk» er SVG-en fra `TBANE`. «Linjekart» er Ruters eget
schematiske linjekart: et bilde som lenkes direkte fra Ruters CDN, på samme måte som våpnene lenkes
fra Wikimedia — det ligger ikke i repoet. Siden Ruters kart har alle stasjonsnavnene trykt på seg,
dekker kvissen til alle navn (også endestasjonsoverskriftene) unntatt de to viste stoppene, med
felt i kartets bakgrunnsfarge (`.rc`), så man ikke ser hvor lange navnene er. Svaret
får en «?»-pille som er minst like lang som det lengste svaralternativet, så lengden ikke røper noe.
Etter svaret vises alle navnene. I «Kart» kan man trykke på navnene; linjevelgeren skjules der, siden
den ikke kan dimme linjer i et bilde. Får ikke sida hentet bildet, faller begge fanene tilbake til
det geografiske kartet med en melding (`#tMapNote`).

`T_RUTER` (`data/ruter-map.js`) holder bildelenken og hvor hvert navn står på bildet (senter,
lengde, høyde og vinkel i bildepiksler). Den er generert; ikke rediger den for hånd:

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

## Regjeringen

Kviss om hvem som har hvilken post i regjeringen. To spørsmålstyper, valgt med knappene øverst:
«Statsråd → post» (navn og bilde, velg posten) og «Post → statsråd» (bare posten, uten bilde, velg
navnet; bildet vises etter svaret). Alle statsrådene kommer før noen gjentas. «Pugg»-fanen viser
hele regjeringen, med en knapp som skjuler navnene.

- `STATSRAD` (`data/statsrad.js`) — én rad per regjeringsmedlem, i samme rekkefølge som i
  «Pugg»: `p` posten slik regjeringen skriver tittelen, `n` navnet, `d` departementet, `s` i posten siden, og `f`
  filnavnet til et portrett på Wikimedia Commons (tom når Commons ikke har noe). Bildene lenkes via
  `WM()` med `?width=320`, som våpnene; får et bilde ikke lastet, fjernes det.
- `RG_ASOF` er datoen lista gjelder fra, og står i teksten under kortet.
- Feilalternativene er de andre statsrådene (eller postene deres).

Modusen er ikke med i Dagens kviss.

Lista er satt sammen for hånd fra «Jonas Gahr Støres regjering» på no.wikipedia og regjeringen.no
(«Endringer i regjeringen», 11. september 2026). Regjeringen.no står bak en Cloudflare-sjekk som
stopper skript, så sida kan ikke hentes automatisk. Portrettene er bildet i Wikidata (P18) for
hver statsråd. Det finnes ikke noe skript: **ved en ny regjering eller en rokade**, oppdater
`STATSRAD` og `RG_ASOF` for hånd.

## Hotel Cæsar

Kviss om hvem som spilte hvem i TV 2-såpen (1998–2017). To spørsmålstyper, valgt med knappene
øverst: rolle → skuespiller og skuespiller → rolle. «Pugg»-fanen viser hele lista.

- `CAESAR` (`data/caesar.js`, sammen med `CAESAR_OUT`) — én rad per rollefigur: `r` rolle, `a`
  skuespiller, `also` andre som har spilt samme rolle (omcasting eller barneversjonen; teller som riktig og brukes aldri som feil alternativ),
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
vises uten bilde i «Pugg». Bryteren «Vis bilder» slår dem av og på for både «Kviss» og «Pugg»,
og huskes i `localStorage` under `cPics` (bilder er på som standard). Den finnes også i innstillingene. Bildene er infoboksbildene fra
rollefigur-artiklene på hotelcaesar.fandom.com. De lenkes direkte fra Fandoms CDN, på samme måte som
våpnene lenkes fra Wikimedia, og ligger ikke i repoet. Fandom avviser forespørsler med en
fremmed `Referer`, så `<img>` må ha `referrerpolicy="no-referrer"` (det har `cPic()`). Får et bilde
ikke lastet, fjernes det, og resten av sida virker som før.

`CAESAR_IMG` (`data/caesar-img.js`, rolle → bildelenke) er generert; ikke rediger den for hånd.
Når du har endret `top:1`-rollene i `CAESAR`, eller vil ha nye bilder fra wikien, kjør fra reporoten:

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

Kviss om hvem som vant MGP hvilket år. To spørsmålstyper, som i Hotel Cæsar: år → artist og
artist → år (med låttittelen, så artister med flere seire får et entydig spørsmål). Chipene «Fra og med» setter
tidligste år som spørres om (Alle, 1980, 1990, 2000, 2010) og huskes i `localStorage` under
`mgpFrom`. Det finnes bevisst ingen øvre grense. «Pugg»-fanen viser alle år i utvalget, per tiår.

- `MGP` (`data/mgp.js`, sammen med `MGP_GAPS`) — én rad per MGP-finale fra 1971: `y` år, `a`
  artisten som representerte Norge i Eurovision (det er svaret), `s` låta slik den het i Eurovision, `e` plassering i
  Eurovision-finalen (`'semi'` = røk ut i semifinalen, `'x'` = avlyst i 2020), `last`/`zero` for
  sisteplass og null poeng, `m` medlemmer av en gruppe, `also` andre som sang vinnerlåta i
  MGP-finalen, og `n` en merknad som vises etter svaret.
- Ingen i `a`, `m` eller `also` brukes som feil alternativ for sitt eget år — så Jahn Teigen
  dukker ikke opp som feil svar for 1974, og Hanne Krogh ikke for 1985 (Bobbysocks). Når du
  legger til en gruppe, før opp medlemmene som har vunnet på egen hånd i `m`.
- `MGP_GAPS` — år uten MGP-finale, som vises i «Pugg», men aldri spørres om: 1970 (boikott),
  1991 (NRK avlyste finalen og valgte «Mrs. Thompson» med Just 4 Fun selv) og 2002 (rykket ned).
- 1972–1976 ble hver låt framført to ganger i MGP, av to ulike artister; bare den som dro til
  Eurovision står i `a`, den andre står i `also`.

Kilder: «Melodi Grand Prix» (vinnertabellen) og årsartiklene på no.wikipedia, og «Norway in the
Eurovision Song Contest» på en.wikipedia (plasseringene), sjekket september 2026. Etter hvert
års MGP: legg til en rad nederst i `MGP` (plasseringen kommer i mai). Det finnes ikke noe skript.

## Nedtellingen

Øverst på forsida (`#countdown`) står en nedtelling til neste kviss, onsdag kl. 19. Den vises
også øverst i Ukas prepp (under «← Alle kvisser»), men ikke i de andre modusene. Det er ett og
samme element, som flyttes mellom forsida (`goMode()`) og preppen (preppens `open()`). Mens kvissen
pågår, onsdag 19–22, står det i stedet at man ikke har lov til å være her, og at juks er strengt
forbudt. Fra kl. 22 teller den ned til neste onsdag. Den går etter serverens klokke, i norsk tid
(se «Tid»). Dag og klokkeslett står i `QUIZ_DAY`, `QUIZ_START` og `QUIZ_END` i `core.js`;
`renderCountdown()` kjøres hvert sekund.

Enheter som er null foran, vises ikke («5 timer 0 minutter 30 sekunder», ikke «0 dager …»);
nuller i midten blir stående. Den siste timen vises også millisekunder, og da tegnes nedtellingen
hver frame (`requestAnimationFrame`) — men bare mens nedtellingen vises; ellers er det ett sekund
igjen. Markupen bygges bare på nytt når oppsettet endres; ellers skrives bare tallene
(`cdShow()`), så det koster nesten ingenting.

Det siste døgnet dirrer boksen kort (0,3 s, klassen `tick`) hver gang sekundet teller ned; den
siste timen rister den kraftigere hele tiden (klassen `rumble`). Begge slås av med
`prefers-reduced-motion`. Ristingen kan skrus av, men da blir det reklame i stedet — se «Reklame».
Derfor skriver `cdShow()` i `#cdBody`, mens klassene står på `#countdown` rundt den: knappen
«Skru av risting» ligger i `#countdown`, utenfor det som bygges på nytt, og rister med boksen.

## Reklame

Det siste døgnet før kvissen (tirsdag kl. 19 til onsdag kl. 19 — det samme som `tick` over) kan
man skru av ristingen i nedtellingen, men da får man falsk reklame på sida i stedet. Under
kvissen og resten av uka er det ingen knapp, ingen risting og ingen reklame. Den som har slått på
`prefers-reduced-motion`, får heller ingenting av det.

- Valget lagres for godt i `localStorage` under `shakeOff`, men brukes bare i ristetida.
- `shakeState()` avgjør både om det rister og om det vises reklame (klassen `ads` på `<body>`).
  `renderCountdown()` kaller den hvert sekund, så reklamen kommer og går av seg selv.
- **Knappen** «Skru av risting» (`#shakeBtn`) åpner arket `#shakeSheet`: «Ja takk, vis meg
  reklame», en Premium-knapp som ikke går an å trykke på, og «Nei, jeg vil riste».
- **Angre:** ▷-merket på hver annonse åpner «Hvorfor ser jeg denne annonsen?» (`#adWhySheet`), med
  «Gi meg ristingen tilbake».
- **Testbryter:** `?ristetid` i adressen (f.eks. `index.html?ristetid#prep`) later som det er
  ristetid, så alt kan testes alle dager. Uten den: still klokka, f.eks. med `page.clock` i Playwright.

### Annonsene

Annonsene ligger i `ADS` (`data/ads.js`), som `MGP` og `CAESAR`: en ny annonse er en ny rad.
Feltene står beskrevet over lista. `type` (`pharma`, `clickbait`, `paywall`, `product`,
`restaurant`, `dating`) velger malen i `AD_TYPES` (`js/ads.js`); formatet på plassen (`data-fmt`: `side`, `banner`, `card`, `box`, `tile`) avgjør i CSS
hvordan den legges ut. En ny type trenger en mal i `AD_TYPES` og eventuelt CSS (`.ad-<type>`).

- **Bilder:** `svg:'…'` (tegnet) og/eller `img:'ads/…'` (et foto i `ads/`). Fem av annonsene har
  foto (KvissMax, Kvissblyanten, Navnedaxin, «Leger hater ham» og Neiu), resten er tegnet. Med begge
  ligger tegningen som et merke oppå fotoet (kalenderen på Navnedaxin, våpenet på «Leger hater ham»). Hold fotoene under rundt 100 kB. Får et foto ikke lastet, fjernes det.
- **Utseende:** de skal se ut som ekte reklame, med egne skrifter og liten grå «Annonse»-merking
  (eller «Sponset»), og står bevisst som skarpe hvite bokser også i mørk modus — de bruker ikke
  temafargene.
- **Utvalg:** `fillAds()` trekker på nytt hver gang man bytter side (fra `goMode()`), og samme annonse
  vises aldri to ganger samtidig. Er det flere plasser enn annonser, skjules resten (`.none`).
- **All tekst vises alltid:** hver linje i en annonse (overskrift, undertekst, liten skrift, knapp,
  avsender) vises i alle formatene og i fullskjerm — ingenting kuttes eller skjules, fordi poenget
  ofte ligger i undertekst eller liten skrift (Nicolas-bordet). Plassene har en minstehøyde og vokser
  med annonsen. Sjekk nye annonser i alle formatene, også i den smaleste sidekolonnen (160 px).
- **Innlasting:** annonsen legges inn skjult med en gang den er trukket, så plassen får riktig
  størrelse og sida ikke hopper; en grå boks med «Annonse» vises til annonsen kommer, etter 50–500 ms,
  så de dukker opp hver for seg.
- **Fullskjerm:** trykk på en annonse åpner `#adFull`, en falsk landingsside med større bilde,
  alt annonsen selv sier, ekstra tekst fra `more` og en overdreven knapp (`big`), som bare bytter
  tekst til `after`. Den lukkes med ✕, Esc og tilbakegesten (den har sin egen historikkoppføring).
- **Offentlig side:** pass på at alle som er med på bilder og internvitser, er med på det.

Annonsene som ligger inne, er godkjent. Gulleråsen-annonsen er kommentert ut i `ADS` — den var
litt for vag, men kan tas inn igjen senere. **Nye annonser legges bare inn etter klarsignal fra
eieren** — kom gjerne med forslag, men ikke implementer dem før de er godkjent. Lagnavnet vårt er
«Dan Børge Bukkakerø» (på t-skjorta); Nord-Trøndelag Samtykkelag er et tidligere rivallag og greit
å bruke.

### Plassene

| Plass | Hvor | Skjerm |
|---|---|---|
| Sidekolonner (`side`) | Én høy annonse fast på hver side av innholdet, på alle sidene | Fra 1100 px |
| Toppbanner (`#adTop`, `banner`) | Rett under nedtellingen; `goMode()` flytter den med | Under 1100 px |
| «Sponset» i lista (`card`) | Mellom Dagens kviss og Bydelene på forsida | Alle |
| I preppen (`box`) | Mellom hver `##`-del, lagt inn av `renderPrep()` | Alle |
| «Anbefalt for deg» (`tile`) | Fire småsaker nederst i preppen | Alle |

Kvissmodusene får ikke reklame inne i innholdet, bare sidekolonnene på desktop. Plassene som bare
vises på mobil, har klassen `ad-in`, de som vises på alle skjermer `ad-all`, og sidekolonnene
`ad-side`. Sidekolonnene er så brede det er plass til (160–300 px), regnet ut fra `--wrapw`, som er
bredere når preppen vises.

## Hjemskjermen

På mobil (berøringsskjerm) viser forsida knappen «Legg til på hjemskjermen» øverst til høyre
(`#installBtn`). Knappen skjules når sida allerede kjører som app fra hjemskjermen, og når
brukeren har trykket «Ikke vis knappen igjen» (`localStorage`-nøkkelen `installHidden`; kan slås
på igjen i innstillingene).
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

Etter en endring, fra reporoten:

```bash
for f in js/*.js js/modes/*.js data/*.js tools/*.mjs tools/regression/*.mjs; do node --check "$f" || echo "FEIL i $f"; done
```

Det fanger syntaksfeil. Kjør også regresjonstesten under, og se selv i nettleseren: forsida, alle åtte modusene, innstillingene, og både
lys og mørk modus (temaet følger `prefers-color-scheme`, eller valget i innstillingene). Knappen for hjemskjermen vises bare
med mobilemulering (berøring) i utviklerverktøyene. Reklamen og knappen for risting testes med
`?ristetid`, både smalt (under 1100 px) og bredt.

### Regresjonstest

`tools/regression/` er et Playwright-oppsett som kjører gjennom hele sida bare via grensesnittet
(ingen interne funksjonsnavn), og lagrer et øyeblikksbilde etter hvert steg: markup, synlig tekst,
fokus, adresse og `localStorage`, pluss skjermbilder. Det spiller alle modusene med alle
spørsmålstypene, «Pugg»-fanene og tastaturet, 78 runder av Dagens kviss på ulike datoer, skjermer
og karttyper (samme dato skal alltid gi samme spørsmål), fortsettelse etter oppdatering, rekke, innstillingene (også en runde uten automatisk videre),
stengt onsdag kveld, uten nett og som lokal fil, reklamen, og at nedtellingen og preppen følger
serverens klokke når enheten tar feil. `Math.random`, klokka, serverdatoen og alle eksterne bilder
og fonter er låst, så to kjøringer av samme kode gir identisk resultat. Trenger Playwright (Chromium), og
Python med Pillow for å sammenligne skjermbilder.

Kjør det på koden før en endring (f.eks. en `git worktree` på forrige commit) og etter, og
sammenlign. Ved en ren refaktorering skal alt være likt; ved en endring skal bare det man ventet,
være annerledes:

```bash
node tools/regression/run.mjs <gammel-kopi> /tmp/reg-for
node tools/regression/run.mjs . /tmp/reg-etter
node tools/regression/compare.mjs /tmp/reg-for /tmp/reg-etter          # alt må være likt
node tools/regression/compare.mjs /tmp/reg-for /tmp/reg-etter --text   # bare synlig tekst o.l.
```

Skjermbilder som bare skiller seg med kantutjevning (maks 8 i fargeforskjell), regnes som like.
`compare.mjs` viser de første forskjellene per test med litt tekst rundt; `--max N` viser flere.
Testen klikker seg fram med vanlige klasser (`.options`, `.card.done`, `.qnext`, `[role=tab]`,
`.setswitch` …) og leser `MGP` og `CAESAR` for å finne riktige svar. Endres de, må
`tools/regression/run.mjs` følge med. Legg til nye tester der når en ny modus eller funksjon
kommer.

## Verktøy

Alle kjøres fra reporoten med `node`. Ingen av dem trengs for at sida skal virke.

| Skript | Gjør | Se |
|---|---|---|
| `tools/set-prep.mjs` | Legger ukas prepp inn i `index.html` (eller tømmer den) | «Ukas prepp» |
| `tools/update-tbane.mjs` | Henter linjene fra Entur og skriver `data/tbane.js` | «T-banen» |
| `tools/update-ruter-map.mjs` | Finner navnene på Ruters linjekart og skriver `data/ruter-map.js` | «T-banen» |
| `tools/update-caesar-images.mjs` | Henter bilder fra Hotel Cæsar-wikien og skriver `data/caesar-img.js` | «Hotel Cæsar» |
| `tools/regression/` | Regresjonstesten (Playwright) | «Testing» |

De tre `update-`skriptene skriver datafila si helt på nytt; ikke rediger de filene for hånd.

## Konvensjoner

- **Alt brukeren ser skal være på norsk** (bokmål): knappetekster, overskrifter, tilbakemeldinger,
  feilmeldinger, `<title>`, `aria-label` og annen skjermlesertekst. Ingen engelske ord i
  grensesnittet — heller ikke i midlertidig tekst eller placeholdere.
  Det heter «prepp» (og «preppen») i teksten brukeren ser; i koden og filnavnene er det `prep`.
- **Koden er på engelsk**: variabel- og funksjonsnavn, id-er, CSS-klasser og kommentarer.
  Unntaket er egennavn og faguttrykk som ikke har noen naturlig engelsk form — `FYLKER`,
  `KOMMUNER`, `bydel`, `vapen` — de blir stående som de er.
- **Commit-meldinger skrives alltid på engelsk**, selv om sida og denne fila er på norsk.
- **Før push til main:** squash alle commits i branchen til én, rebase den på nyeste
  `origin/main`, og fast-forward main til den (`git push origin HEAD:main`, aldri force-push
  til main). Kjør syntakssjekken under «Testing» på nytt etter rebasen.
- Denne fila (CLAUDE.md) er på norsk, som dokumentasjon for deg.
