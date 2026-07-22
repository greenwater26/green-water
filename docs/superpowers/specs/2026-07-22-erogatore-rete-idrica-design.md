# Erogatore a rete idrica — quarta categoria prodotto

## Contesto

Il sito ha già tre categorie in `prodotti.html`/menu Prodotti: **Casa** (osmosi inversa), **Uffici/HoReCa** (totem e colonnine ad osmosi, acquisto/installazione per volumi alti), e la pagina dedicata **Ufficio — Erogatore a boccioni** (`erogatore-boccioni.html`, noleggio, nessun allaccio idraulico). Si aggiunge una quarta categoria, **Ufficio — Erogatore a rete idrica**, anch'essa una pagina singola dedicata (`erogatore-rete-idrica.html`), sullo stesso modello di noleggio per piccoli/medi uffici ma con collegamento diretto alla rete idrica (nessun boccione da sostituire).

Ispirazione strutturale (non testuale) da https://www.culligan.it/ufficio/prodotti/erogatori-a-rete-idrica-per-uffici/.

Prodotto reale: refrigeratore GREENQUALITY (scheda tecnica Green Water Italia allegata dall'utente; il prodotto fisico corrisponde a Celli Acquality POU, https://www.celligroup.com/en/products/freestanding/acquality-pou, usato solo come riferimento di ricerca, non da copiare).

Nessun prezzo/canone mostrato in pagina: solo CTA "Richiedi preventivo" / WhatsApp, come le altre pagine prodotto del sito.

## Dati tecnici (da scheda tecnica GREENQUALITY, fornita dall'utente)

**GREENQUALITY AC** (versione base — naturale + fredda)
- Tipologia di acqua erogata: temperatura ambiente + fredda
- Consigliato per: fino a 30–40 persone
- Kit di filtrazione: microfine 8", capacità filtrante in condizioni standard 3.000 litri
- Capacità refrigerante: 28 L/h
- Quantità d'acqua fredda in continuo: 5 litri
- Modalità di prelievo consigliate: bicchiere + borraccia
- Altezza punto di erogazione: 256 mm
- Vaschetta raccogli gocce: collegamento allo scarico possibile
- Tecnologia di refrigerazione: banco ghiaccio
- Alimentazione elettrica: 230V – 50Hz monofase
- Dimensioni: L 334 × P 330 × H 1120 mm
- Costruito nel rispetto del DM 25/2012 — progettato e fabbricato in Italia

**GREENQUALITY GAS** (versione con frizzante)
- Stesse identiche caratteristiche tecniche della versione AC.
- Unica differenza: aggiunge bombola CO2 e carbonatore per erogare anche acqua frizzante (temperatura ambiente + fredda + frizzante).
- Nessun dato tecnico aggiuntivo da riportare (confermato dall'utente: "hanno le stesse caratteristiche, cambia che quella frizzante ha la bombola co2 e il carbonatore").

## Termini del noleggio (da comunicare senza mostrare cifre)

- Noleggio 48 mesi
- Installazione a nostro carico, compresa nel canone
- Manutenzione a nostro carico, senza limiti di interventi ("illimitata")
- Cambio filtri e sanificazione una volta all'anno, inclusi nel canone (confermato dall'utente: "cambio filtri una volta all'anno" — NON due volte l'anno né due volte sui 48 mesi)
- Analisi batteriologica disponibile su richiesta del cliente, una volta all'anno

## Struttura pagina `erogatore-rete-idrica.html`

Chrome identico a `erogatore-boccioni.html`/`prodotti.html`: stessa nav (dropdown Prodotti a 4 voci, vedi sotto), footer, cookie banner, bolla WhatsApp, script.

1. **Hero**
   - Breadcrumb: Home / Prodotti / Erogatore a rete idrica
   - H1: erogatore a rete idrica per ufficio, a noleggio
   - Sottotitolo: acqua naturale e fredda erogata direttamente dalla rete idrica, con manutenzione e assistenza incluse nel canone di noleggio
   - CTA: "Richiedi preventivo" (→ `index.html#form`) + "Scrivici su WhatsApp"

2. **Card prodotto** (stesso componente delle altre pagine: `bg-surface rounded-[28px] p-7`, immagine in riquadro bianco, titolo, bullet list, CTA "Richiedi info")
   - Immagine: `immagini/erogatoreareteidrica.PNG`
   - Titolo: GREENQUALITY — bullet con tutte le specifiche AC elencate sopra, più una riga che rimanda alla versione GAS (senza tabella tecnica separata, come da conferma utente)

3. **Le due versioni** — due colonne/card sintetiche affiancate:
   - GREENQUALITY AC: naturale + fredda
   - GREENQUALITY GAS: naturale + fredda + frizzante (bombola CO2 e carbonatore integrati) — stesse caratteristiche tecniche della AC

4. **Come funziona il noleggio** — 3 step:
   1. Sopralluogo e allaccio alla rete idrica — installazione a nostro carico
   2. Erogazione continua di acqua filtrata, senza boccioni da sostituire
   3. Manutenzione, cambio filtri e sanificazione una volta l'anno, inclusi nel canone

5. **Vantaggi** — griglia di 4 punti:
   - Erogazione continua, senza ricariche né boccioni da gestire
   - Manutenzione inclusa per tutta la durata del noleggio (48 mesi)
   - Installazione a nostro carico, nessun costo aggiuntivo
   - Analisi batteriologica disponibile su richiesta ogni anno

6. **Cosa include il canone** — bullet list:
   - Noleggio 48 mesi
   - Installazione a nostro carico
   - Manutenzione a nostro carico, senza limiti di interventi
   - Cambio filtri e sanificazione una volta all'anno
   - Analisi batteriologica disponibile su richiesta una volta all'anno

7. **Confronto con l'erogatore a boccioni** — due colonne, con link a `erogatore-boccioni.html`:
   - *Erogatore a rete idrica*: erogazione continua senza ricariche, richiede allaccio idraulico, canone include manutenzione annuale, indicato fino a 30–40 persone
   - *Erogatore a boccioni*: nessun collegamento idraulico, richiede sostituzione periodica dei boccioni, indicato fino a circa 15 persone
   - Frase di chiusura con link anche a `prodotti.html#uffici` per chi ha bisogno di portate ancora più alte (Totem/colonnine Uffici-HoReCa)

8. **FAQ** (contenuto originale, con markup `FAQPage`):
   - Serve un allaccio idraulico per installare l'erogatore?
   - Quante persone può servire un erogatore a rete idrica?
   - Cosa include il canone di noleggio?
   - Che differenza c'è tra la versione AC e la versione GAS?
   - Che differenza c'è tra erogatore a rete idrica ed erogatore a boccioni?
   - Quanto dura il contratto di noleggio?

9. **CTA finale** — stesso pattern grafico delle altre pagine prodotto

### SEO / dati strutturati
- `<title>`, meta description, canonical/hreflang dedicati, coerenti con le altre pagine
- JSON-LD: `BreadcrumbList` (Home/Prodotti/Erogatore a rete idrica), `Product` (GREENQUALITY, **senza blocco `offers`**, stesso approccio della pagina boccioni), `FAQPage` (le 6 domande sopra)
- Il JSON-LD `ItemList` di `prodotti.html` **non viene esteso** (stessa decisione presa per la pagina boccioni)

## Aggiornamento menu Prodotti (sito-wide)

Il dropdown desktop, il sotto-menu mobile e il footer "Prodotti" (attualmente 3 voci: Casa, Uffici/HoReCa, Ufficio→boccioni) diventano 4 voci. La nuova voce riusa lo stesso titolo "Ufficio" già usato per i boccioni (coerente con la richiesta dell'utente, che chiama entrambe le nuove categorie "Ufficio - ..."), distinta da sottotitolo e icona:

| Voce menu | Sottotitolo | Link | Icona (dropdown/mobile) |
|---|---|---|---|
| Casa | Sistemi di filtrazione a osmosi inversa | `prodotti.html#casa` | (invariata) |
| Uffici/HoReCa | Sistemi di filtrazione | `prodotti.html#uffici` | (invariata) |
| Ufficio | Erogatore a boccioni | `erogatore-boccioni.html` | (invariata, icona "beaker") |
| Ufficio | Erogatore a rete idrica | `erogatore-rete-idrica.html` | nuova icona a goccia d'acqua |

Nel footer (dove non ci sono sottotitoli) la voce boccioni è oggi etichettata semplicemente "Ufficio", il che creerebbe ambiguità con una seconda voce "Ufficio" per la rete idrica. Per restare simmetrici e distinguibili, **si rinomina anche la riga footer già esistente** e si aggiunge la nuova, nello stesso passaggio sugli stessi file:
- riga esistente: "↳ Ufficio" → "↳ Ufficio – boccioni" (continua a puntare a `erogatore-boccioni.html`)
- riga nuova: "↳ Ufficio – rete idrica" (punta a `erogatore-rete-idrica.html`), inserita subito dopo

Questo tocca una seconda volta la riga footer boccioni già pubblicata (rinominata, non lo href), sugli stessi identici 20 file già toccati per la categoria boccioni (stesso markup, stesso path relativo per file). Il titolo "Ufficio" nel dropdown/sotto-menu mobile (con sottotitoli) **non cambia** — la ridenominazione riguarda solo le righe footer prive di sottotitolo.

## Aggiornamento `erogatore-boccioni.html`

- Il banner di confronto/rimando esistente in fondo alla pagina rimane invariato (punta a `prodotti.html#uffici`). Si aggiunge la nuova sezione "Confronto con l'erogatore a boccioni" **sulla nuova pagina** `erogatore-rete-idrica.html`, che linka verso `erogatore-boccioni.html` — non serve modificare `erogatore-boccioni.html` in senso inverso (fuori scope, evita di riaprire una pagina già pubblicata senza necessità).

## Aggiornamento `prodotti.html`

- Nessuna modifica al banner già presente nella sezione Uffici/HoReCa (punta genericamente al noleggio boccioni). Non si aggiunge un secondo banner per la rete idrica: la sezione Uffici/HoReCa di `prodotti.html` resta come oggi, e la nuova pagina è raggiungibile solo dal menu Prodotti a 4 voci — coerente con l'approccio già usato per i boccioni (scoperta solo via menu, senza duplicare banner promozionali in più punti).

## Fuori scope
- Nessun prezzo o simulatore di costo.
- Nessuna tabella tecnica separata per la versione GAS (specifiche identiche alla AC, differenza descritta solo a parole).
- Non si modifica la sezione Uffici/HoReCa di `prodotti.html` né si aggiunge un banner di rimando lì per la nuova pagina.
- Non si modifica la pagina `erogatore-boccioni.html` oltre a quanto già pubblicato.
