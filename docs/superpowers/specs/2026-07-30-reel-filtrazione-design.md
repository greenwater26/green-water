# Reel Instagram "Microfiltrazione vs Ultrafiltrazione vs Osmosi Inversa" — Design

## Obiettivo

Creare un terzo reel verticale per Instagram (dopo "WaterReel" e "DetrazioneReel") nello stesso stile: motion graphics puro con Remotion (kinetic typography, nessun filmato reale), musica di sottofondo senza voce, testi animati, impattante e leggibile in autoplay muto.

Argomento: differenza tra i tre livelli di filtrazione dell'acqua trattati nell'articolo del blog [osmosi-inversa-ultrafiltrazione-microfiltrazione.html](../../../blog/osmosi-inversa-ultrafiltrazione-microfiltrazione.html) — Carbon Block (microfiltrazione), Ultrafiltrazione a 3 stadi, Osmosi Inversa.

## Perché motion graphics puro (non clip Higgsfield)

I due reel esistenti (`DetrazioneReel.tsx`, `Composition.tsx`/WaterReel) sono realizzati al 100% con Remotion: nessun filmato reale, solo tipografia animata, gradient, numeri che contano, card e transizioni fade. L'utente ha confermato di voler restare fedele a questo stile per coerenza di brand, quindi non si useranno clip generate con Higgsfield.

## Struttura tecnica

- Nuovo file `video-reel/src/FiltrazioneReel.tsx`, che replica il pattern dei due file esistenti: helper locali `fi()` (fade in), `su()` (slide up), `sc()` (scale in), `counter()` (numero animato), font `loadFont` Oswald (700) e Inter (400/600/700), palette condivisa (`BLUE #2596be`, `GOLD #FFB800`, `GREEN #35d07a`, `RED #ff4040`, `MUTED #8090b0`).
- Componente esportato `FiltrazioneReel`, composto con `TransitionSeries` + `fade()` (15 frame) tra le scene, come negli altri due reel.
- Audio: `Audio src={staticFile("go-beyond.mp3")} volume={0.28}` — l'unica delle tre tracce disponibili in `public/` non ancora usata (le altre due sono già assegnate a WaterReel e DetrazioneReel).
- Registrazione in `Root.tsx`: nuova `<Composition id="FiltrazioneReel" component={FiltrazioneReel} fps={30} width={1080} height={1920} />`, con `durationInFrames` calcolato come somma esatta delle durate di scena definite nel `TransitionSeries` (vedi storyboard sotto) meno l'overlap delle transizioni fade, esattamente come fanno `WaterReel` (900f) e `DetrazioneReel` (825f).
- Formato: 1080×1920 (9:16), 30fps.

## Storyboard (7 scene)

Durate indicative in frame @30fps; possono essere affinate in fase di implementazione per il ritmo del rendering, mantenendo l'ordine e il contenuto.

1. **Scena 1 — HOOK** (~150f / 5s)
   Testo che entra in sequenza: "MICROFILTRAZIONE." → "ULTRAFILTRAZIONE." → "OSMOSI INVERSA." → "SEMBRANO LA STESSA COSA?" → reveal a impatto "NON LO SONO" (badge/glow, stile analogo al badge "−50%" di Scene1 in DetrazioneReel).

2. **Scena 2 — MICROFILTRAZIONE (Carbon Block)** (~150f)
   Titolo "MICROFILTRAZIONE" (Carbon Block). Lista con icone check (componente `Check` riusato/adattato):
   - ✓ Cloro e odore (verde)
   - ~ Alcuni batteri, parzialmente (oro/amber)
   - ✗ Metalli pesanti (rosso)
   - ✗ PFAS (rosso)
   - ✗ Residuo fisso (rosso)
   Chiusura: "Migliora il gusto. Non purifica chimicamente."

3. **Scena 3 — ULTRAFILTRAZIONE** (~150f)
   Titolo "ULTRAFILTRAZIONE" (3 stadi, membrana 0,01–0,1 micron). Lista:
   - ✓ Cloro (verde)
   - ✓ Batteri e virus (verde)
   - ✗ Metalli pesanti (rosso)
   - ~ PFAS, solo parziali (oro)
   - ✗ Residuo fisso (rosso)
   Chiusura: "Sicurezza batterica. Non basta per PFAS e metalli pesanti."

4. **Scena 4 — OSMOSI INVERSA** (~165f)
   Titolo "OSMOSI INVERSA" (membrana 0,001 micron — mille volte più fitta). Lista tutta verde: cloro, batteri e virus, metalli pesanti, PFAS, nitrati e pesticidi. Counter animato del residuo fisso che scende da 300 a 15–30 mg/L (pattern `counter()` già usato per gli importi in €), con etichetta "RESIDUO FISSO -90/95%".

5. **Scena 5 — TABELLA COMPARATIVA** (~180f)
   La tabella richiesta esplicitamente: intestazione con le 3 tecnologie come colonne (Carbon Block / Ultrafiltrazione / Osmosi Inversa), righe che entrano in sequenza (una ogni ~20-25f) per: Cloro/odori, Batteri e virus, Metalli pesanti, PFAS, Residuo fisso — con simbolo colorato ✓/~/✗ per cella, fedele alla tabella HTML dell'articolo. Stile a card semi-trasparenti con bordo colorato, coerente con `StatCard`/`Card` dei reel esistenti, ma in forma tabellare (griglia a 4 colonne: etichetta riga + 3 celle simbolo).

6. **Scena 6 — VERDETTO** (~120f)
   "VUOI LA SOLUZIONE COMPLETA?" → reveal "OSMOSI INVERSA" (grande, glow, colore brand/verde) → checkmark finali: "Zero PFAS · Zero metalli pesanti · Acqua leggera e pura".

7. **Scena 7 — CTA** (~90f)
   Identica in struttura alle CTA esistenti: "GREEN WATER ITALIA" → divider → "SCOPRI QUALE FILTRO TI SERVE" → box pill con "greenwateritalia.it" (pulse animation) → sottotitolo "Consulenza gratuita · Analisi TDS inclusa".

Durata totale stimata: ~1005 frame (~33.5s), in linea con gli altri due reel (825f/900f).

## Palette semantica

Riuso della palette esistente con significato semantico coerente in tutte le scene con liste/tabella:
- `GREEN` (#35d07a) = rimosso efficacemente (✓)
- `GOLD` (#FFB800) = rimosso parzialmente (~)
- `RED` (#ff4040) = non rimosso (✗)

## Output

- Render in `video-reel/out/FiltrazioneReel.mp4` via `npx remotion render`.
- Pubblicazione come asset statico in `video/` (stesso pattern del reel Detrazione 50%: commit separato "chore: pubblica reel ... come asset statico").

## Fuori scope

- Nessuna clip video reale/generata (Higgsfield) — solo motion graphics.
- Nessuna voce narrante — solo testo animato e musica di sottofondo.
- Non si modifica l'articolo del blog né altre pagine del sito.
