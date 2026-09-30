# Kvisstreneren

Én enkelt statisk side — `index.html` — med all HTML, CSS, JavaScript og alle data i samme fil.
Ingen byggesteg, ingen avhengigheter, ingen pakkefil. Åpne fila i nettleseren for å teste.

Se «Konvensjoner» nederst for språkreglene — kort sagt: norsk ut til brukeren, engelsk i koden.

## Struktur

Sida har en forside (`#home`) med én knapp per modus, og tre visninger som byttes med `goMode()`:

| Modus | Seksjon | Innhold |
|---|---|---|
| `prep` | `#prepApp` | Ukas kvissprep — se under |
| `vapen` | `#vapenApp` | Fylkes- og kommunevåpen (`FYLKER`, `KOMMUNER`, `SETS`) |
| `bydel` | `#bydelApp` | Oslos bydeler (`BSETS`) |

`goMode()` viser/skjuler seksjonene og husker valget i `sessionStorage` under nøkkelen `mode`.
Ny modus krever tre ting: en `<section>`/`<div>` i HTML, en linje i `goMode()`, og en
`addEventListener` på knappen på forsida.

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

## Testing

Det finnes ingen testpakke. Etter en endring:

```bash
node -e "const s=require('fs').readFileSync('index.html','utf8');[...s.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach((b,i)=>{new Function(b[1]);console.log('block',i,'ok')})"
```

Det fanger syntaksfeil. Resten må sjekkes i nettleseren: forsida, alle tre modusene, og både
lys og mørk modus (temaet følger `prefers-color-scheme`).

## Konvensjoner

- **Alt brukeren ser skal være på norsk** (bokmål): knappetekster, overskrifter, tilbakemeldinger,
  feilmeldinger, `<title>`, `aria-label` og annen skjermlesertekst. Ingen engelske ord i
  grensesnittet — heller ikke i midlertidig tekst eller placeholdere.
- **Koden er på engelsk**: variabel- og funksjonsnavn, id-er, CSS-klasser og kommentarer.
  Unntaket er egennavn og faguttrykk som ikke har noen naturlig engelsk form — `FYLKER`,
  `KOMMUNER`, `bydel`, `vapen` — de blir stående som de er.
- **Commit-meldinger skrives alltid på engelsk**, selv om sida og denne fila er på norsk.
- Denne fila (CLAUDE.md) er på norsk, som dokumentasjon for deg.
