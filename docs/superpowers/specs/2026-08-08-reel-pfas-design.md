# Reel Instagram "PFAS: cosa sono, dove sono, come proteggersi" — Design

## Obiettivo

Creare un quarto reel verticale per Instagram (dopo "WaterReel", "DetrazioneReel" e "FiltrazioneReel") nello stesso stile: motion graphics puro con Remotion (kinetic typography, nessun filmato reale), musica di sottofondo senza voce, testi animati, impattante e leggibile in autoplay muto.

Argomento: PFAS nell'acqua potabile italiana, tratto dall'articolo del blog [pfas-acqua-italia-rischi-come-eliminarli.html](../../../blog/pfas-acqua-italia-rischi-come-eliminarli.html) — cosa sono, la PFAS Valley del Veneto, dove si trovano in Italia, i rischi per la salute (in particolare per i bambini), i nuovi limiti EU 2026, e quale tecnologia li rimuove davvero.

## Angolo scelto: allarme territoriale

Tra i tre angoli possibili (mito sfatato, allarme territoriale, allarme famiglia/bambini), l'utente ha scelto l'apertura territoriale: il caso PFAS Valley del Veneto (300.000 persone, decenni di contaminazione, sentenza 2024) come gancio shock, per poi allargare il quadro a tutta Italia e ai nuovi limiti 2026. Il rischio per i bambini viene comunque trattato in Scena 4 come secondo picco emotivo.

## Struttura tecnica

- Nuovo file `video-reel/src/PfasReel.tsx`, che replica il pattern dei tre file esistenti: helper locali `fi()` (fade in), `su()` (slide up), `sc()` (scale in), `counter()` (numero animato), font `loadFont` Oswald (700) e Inter (400/600/700), palette condivisa (`BLUE #2596be`, `GOLD #FFB800`, `GREEN #35d07a`, `RED #ff4040`, `MUTED #8090b0`).
- Componente esportato `PfasReel`, composto con `TransitionSeries` + `fade()` (15 frame) tra le scene, come negli altri tre reel.
- Audio: `Audio src={staticFile("bold-statement.mp3")} volume={0.28}`. Le tre tracce in `public/` sono già assegnate (solutions-that-work→WaterReel, bold-statement→DetrazioneReel, go-beyond→FiltrazioneReel); si riusa `bold-statement.mp3` per il tono più teso, coerente con l'hook territoriale.
- Registrazione in `Root.tsx`: nuova `<Composition id="PfasReel" component={PfasReel} fps={30} width={1080} height={1920} />`, con `durationInFrames` calcolato come somma esatta delle durate di scena nel `TransitionSeries` meno l'overlap delle transizioni fade, come per gli altri tre reel.
- Formato: 1080×1920 (9:16), 30fps.

## Storyboard (7 scene)

Durate indicative in frame @30fps; possono essere affinate in fase di implementazione per il ritmo del rendering, mantenendo l'ordine e il contenuto.

1. **Scena 1 — HOOK territoriale** (~150f / 5s)
   Testo che entra in sequenza: "300.000 PERSONE." → "DECENNI." → "ACQUA CONTAMINATA SENZA SAPERLO." → reveal a impatto "PFAS VALLEY, VENETO" (badge/glow rosso) → "MA NON FINISCE QUI" (tensione, aggancio alla scena successiva).

2. **Scena 2 — COSA SONO** (~150f)
   Titolo "FOREVER CHEMICALS". Testo: "+4.700 sostanze chimiche" · "non si degradano MAI" (legame carbonio-fluoro). Reveal a impatto: badge rosso "PFOA = CANCEROGENO" (classificazione IARC 2023, Gruppo 1).

3. **Scena 3 — DOVE SI TROVANO IN ITALIA** (~150f)
   Titolo "DOVE SI TROVANO IN ITALIA". Barre orizzontali animate (fill da 0 alla percentuale target), una per regione, in sequenza:
   - Veneto (PFAS Valley: Vicenza, Verona, Padova) — "Criticità elevata storica" — rosso, 95%
   - Piemonte (aree industriali TO/AL) — "Moderata" — arancio/oro, 45%
   - Lombardia (aree con basi AFFF aeroportuali) — "Localizzata" — giallo/oro, 30%
   - Lazio, Toscana, resto d'Italia — "Sotto i limiti EU" — verde, 15%
   Fonte in piccolo: "Dati ISPRA 2023 / ISS".

4. **Scena 4 — RISCHI PER LA SALUTE (focus bambini)** (~150f)
   Titolo "RISCHI PER LA SALUTE". Apertura emotiva: "I PFAS PASSANO NEL LATTE MATERNO" (dato EFSA 2020). Lista con icone (pattern `Check`/icona adattata):
   - Riduzione risposta immunitaria ai vaccini (bambini)
   - Alterazioni dello sviluppo tiroideo
   - Aumento rischio tumori renali e testicolari (PFOA)
   - Complicanze in gravidanza
   Chiusura: "I bambini sono i più esposti."

5. **Scena 5 — NUOVI LIMITI 2026** (~150f)
   Titolo "NUOVI LIMITI EU (D.Lgs. 18/2023)". Due counter animati in sequenza, pattern `counter()` già usato per gli importi in €:
   - 0,00 → 0,01 µg/L — etichetta "per ogni singolo PFAS"
   - 0,00 → 0,1 µg/L — etichetta "somma di 20 PFAS"
   Chiusura a impatto: "TRA I PIÙ SEVERI AL MONDO".

6. **Scena 6 — COSA FUNZIONA DAVVERO** (~180f)
   Tabella comparativa (stesso pattern a card/griglia della Scena 5 di `FiltrazioneReel.tsx`), righe che entrano in sequenza (una ogni ~20-25f), colonna tecnologia + colonna efficacia PFAS colorata:
   - Osmosi inversa — >95% — verde
   - Carbone attivo granulare — 70–90% — oro
   - Filtro a brocca — 30–50% — oro/rosso
   - Bollitura — 0% — rosso, con nota "concentra i PFAS, non li elimina"

7. **Scena 7 — CTA** (~90f)
   Identica in struttura alle CTA esistenti: "GREEN WATER ITALIA" → divider → "PROTEGGI LA TUA FAMIGLIA DAI PFAS" → box pill con "greenwateritalia.it" (pulse animation) → sottotitolo "Osmosi inversa certificata NSF/ANSI 58 · Analisi PFAS inclusa".

Durata totale stimata: ~1020 frame (~34s), in linea con gli altri tre reel (825f/900f/915f).

## Palette semantica

Riuso della palette esistente con significato semantico coerente in Scena 3 (barre regionali) e Scena 6 (tabella tecnologie):
- `RED` (#ff4040) = criticità alta / inefficace
- `GOLD` (#FFB800) = criticità moderata / parzialmente efficace
- `GREEN` (#35d07a) = sotto i limiti / efficace

## Output

- Render in `video-reel/out/PfasReel.mp4` via `npx remotion render`.
- Pubblicazione come asset statico in `video/pfas-reel.mp4` (stesso pattern degli altri reel: commit separato "chore: pubblica reel ... come asset statico").

## Fuori scope

- Nessuna clip video reale/generata (Higgsfield) — solo motion graphics.
- Nessuna voce narrante — solo testo animato e musica di sottofondo.
- Non si modifica l'articolo del blog né altre pagine del sito.
