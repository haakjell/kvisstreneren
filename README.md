# Kvisstreneren

En samleside for å forberede seg til kviss: kvisser på ulike temaer man kan øve på, lister man
kan pugge, og en oppsummering av det som kan dukke opp før hver kviss.

**[haakjell.github.io/kvisstreneren](https://haakjell.github.io/kvisstreneren/)**

Sida finnes på bokmål og nynorsk, og kan legges til på hjemskjermen på mobil.

## Innhold

- **Ukas prepp:** nyheter og navnedager før onsdagens kviss
- **Dagens kviss:** ti blandede spørsmål, de samme for alle hver dag, med resultat som kan deles
- **Anagram:** kjendiser med bokstavene stokket om
- **Kvisslagets offisielle bommedatabase™:** spørsmålene vi har bommet på
- **Bydelene:** Oslos bydeler, både dagens og de nye fra 2028
- **T-banen:** neste stopp på linjene og kartet
- **Regjeringen:** statsrådene og postene deres
- **Våpenskjold:** fylkes- og kommunevåpen
- **Melodi Grand Prix:** vinnerne og årstallene
- **Hotel Cæsar:** roller og skuespillere

De fleste modusene har også en «Pugg»-fane der man kan se gjennom hele lista.

## Kjøre lokalt

Sida er statisk HTML, CSS og JavaScript, uten byggesteg eller avhengigheter. Klon repoet og
åpne `index.html` i nettleseren; det virker også som lokal fil (`file://`).

## Struktur

| Mappe / fil | Innhold |
|---|---|
| `index.html` | Markupen og ukas prepp |
| `css/` | Stilarket, med fargetemaene i `themes.css` |
| `js/` | Felles kode, spillmotoren og én fil per modus i `js/modes/` |
| `data/` | Dataene, én fil per tema |
| `prep/` | Arkivet over gamle preper |
| `tools/` | Skript som oppdaterer data og prepp, og regresjonstesten |

## Oppdatere data

Skriptene i `tools/` kjøres fra reporoten med Node:

- `node tools/set-prep.mjs …`: legger inn ukas prepp (eller tømmer den med `--clear`)
- `node tools/update-tbane.mjs`: henter T-banelinjene fra Entur
- `node tools/update-ruter-map.mjs`: leser stasjonsnavnene på Ruters linjekart
- `node tools/update-caesar-images.mjs`: henter bildene av rollefigurene i Hotel Cæsar

Resten av dataene (regjeringen, MGP, anagrammene, bommedatabasen) oppdateres for hånd i
`data/`.

## Testing

`tools/regression/` er en Playwright-test som går gjennom hele sida og sammenligner
øyeblikksbilder før og etter en endring. Den trenger Chromium og Python med Pillow.

## Utvikling

Utviklerdokumentasjonen, med konvensjoner, hvordan hver modus er bygd og hvordan man legger til
en ny, står i [CLAUDE.md](CLAUDE.md).

Sida publiseres med GitHub Pages fra `main`.
