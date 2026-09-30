Jeg jobber i repoet `haakjell/kvisstreneren` (én statisk side, `index.html` — les CLAUDE.md først). I en tidligere økt ble det laget en ny modus for Hotel Cæsar. Den ligger på branchen `claude/hotel-caesar-quiz-module-s9doso` på GitHub.

1. Sjekk ut branchen `claude/hotel-caesar-quiz-module-s9doso` og fortsett der. Ikke jobb på main, og ikke lag PR før jeg ber om det.

2. Hva som er gjort: ny modus `caesar` (`#caesarApp`) med forsideknapp, tre spørsmålstyper (rolle → skuespiller, skuespiller → rolle, «Skriv svaret» uten alternativer) og en «Pugg»-fane. Dataene ligger i `CAESAR` (30 roller med `top:1` som det spørres om, pluss 29 mindre roller som bare brukes som feilalternativer) og `CAESAR_OUT` (norske skuespillere som ikke var med, brukt som 2 av 5 feilalternativer når svaret er en skuespiller). Formatet står i CLAUDE.md under «Hotel Cæsar».

3. Hva som gjenstår: Forrige økt kunne ikke nå Wikipedia eller IMDb direkte (bare nettsøk), så dataene må kvalitetssikres nå som nettet er åpent:
   - Sjekk rangeringen av de 30 største rollene mot episodetall på IMDb (tt0177446) eller «Liste over rollefigurer i Hotel Cæsar» på no.wikipedia, og bytt ut roller som ikke hører hjemme i topp 30.
   - Sjekk årstallene (`y`) og beskrivelsene (`n`) for alle rollene, særlig Georg Anker-Hansen (står nå som 1998–1999) og Svein Krogstad.
   - Sjekk at ingen i `CAESAR_OUT` har hatt noen rolle, heller ikke en gjesterolle, i Hotel Cæsar. Lena Kristin Ellingsen, Pia Tjelta, Helge Jordal og Thea Sofie Loch Næss er holdt utenfor med vilje, fordi kildene tyder på at de var med.
   - Test i nettleseren (lys og mørk modus), commit med engelsk commit-melding, og push til branchen.
   - Slett denne fila (`HOTEL-CAESAR-PROMPT.md`) i samme commit; den er bare en overlevering mellom øktene.

Stopp og spør meg hvis noe er uklart.
