# Kvisstreneren

Én enkelt statisk side — `index.html` — med all HTML, CSS, JavaScript og alle data i samme fil.
Ingen byggesteg, ingen avhengigheter, ingen pakkefil. Åpne fila i nettleseren for å teste.

Språk: alt brukervendt er på norsk (bokmål). Hold kode og kommentarer på norsk der det finnes
norske kommentarer fra før.

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
Alt ligger nederst i `<script>`, rett før `// ---------- Mode switching ----------`:

- `PREP` — dataene. Dette er det eneste som skal endres når det kommer ny prep.
- `prepMarkdown()` / `prepInline()` — en liten markdown-renderer.
- `renderPrep()` — fyller `#prepBody` og teksten på forsideknappen. Kalles én gang ved oppstart.

### Slik legger du inn ny prep

1. Kjør quizprep-skillen. Den skriver en markdown-rapport.
2. Lim hele rapporten inn mellom bakteksene i `PREP.markdown`, og sett `PREP.uke` til quizdatoen:

```js
const PREP = {
  uke: 'onsdag 7. oktober 2026',
  markdown: String.raw`
# Quizprep — onsdag 7. oktober 2026
...hele rapporten...
`
};
```

3. Åpne `index.html` i nettleseren og sjekk at sida rendrer som forventet.

Detaljer som er verdt å vite:

- **`String.raw` er med vilje** — den gjør at `\` i teksten står som det er. Til gjengjeld kan
  ikke rapporten inneholde backticks; de avslutter strengen. Bytt dem ut hvis de dukker opp.
- **Tom `markdown` gir automatisk placeholderen** «Ukas prep kommer snart», og forsideknappen
  sier «Kommer snart». Det er tilstanden mellom to preper — ingen andre endringer trengs.
- Forrige ukes prep erstattes rett og slett. Det finnes ikke noe arkiv; vil du ha et, må det
  bygges.

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

All tekst HTML-escapes før den rendres, så innliming er trygt.

## Testing

Det finnes ingen testpakke. Etter en endring:

```bash
node -e "const s=require('fs').readFileSync('index.html','utf8');[...s.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach((b,i)=>{new Function(b[1]);console.log('block',i,'ok')})"
```

Det fanger syntaksfeil. Resten må sjekkes i nettleseren: forsida, alle tre modusene, og både
lys og mørk modus (temaet følger `prefers-color-scheme`).

## Konvensjoner

- **Commit-meldinger skrives alltid på engelsk**, selv om sida, koden og denne fila er på norsk.
