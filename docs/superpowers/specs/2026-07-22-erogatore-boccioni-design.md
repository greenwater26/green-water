# Erogatore a boccioni — nuova categoria prodotto

## Contesto

Il sito Green Water Italia ha oggi due categorie prodotto in `prodotti.html`: **Casa** (osmosi inversa e frigogasatori) e **Uffici/HoReCa** (totem e colonnine ad osmosi collegati alla rete idrica). Si aggiunge una terza categoria, **Ufficio — Erogatore a boccioni**, dedicata al noleggio di un erogatore da appoggio/pavimento alimentato da boccioni d'acqua minerale intercambiabili (nessun collegamento alla rete idrica).

A differenza delle categorie esistenti, questa nuova categoria vive su una **pagina singola dedicata** (`erogatore-boccioni.html`), non su una sezione ancorata dentro `prodotti.html`, perché descrive un prodotto/servizio (colonnina + boccioni in noleggio) concettualmente diverso da un impianto installato.

Ispirazione strutturale (non testuale) da https://www.culligan.it/ufficio/prodotti/erogatori-a-boccione/ — hero, catalogo prodotto, vantaggi, FAQ, confronto soluzioni.

Prodotti reali forniti dall'azienda, usati come fonte delle specifiche tecniche:
- Boccione: "Splendida" 18L (https://govita.it/products/spledida) — acqua minerale naturale Fonte Bauda
- Colonnina: Emax AC (https://www.acquaallaspinastore.it/dispenser-boccione-acqua/63-emax-ac.html)

Nessun prezzo viene mostrato in pagina: solo CTA "Richiedi preventivo" / WhatsApp, come già avviene per le altre card prodotto del sito.

**Nota di terminologia decisa con l'utente:** non usare la dicitura "installazione gratuita" — scrivere solo "installazione" ovunque nel testo (hero, step del noleggio, sezione servizi, FAQ).

## Dati tecnici di riferimento

**Boccione Splendida 18L**
- Acqua minerale naturale, Fonte Bauda (Calizzano, Savona — Alpi Marittime, oltre 1.000 m di altitudine)
- Capacità: 18 litri
- Boccione monouso in PET alimentare, riciclabile, certificato CE
- Tappo anti-manomissione, attacco standard compatibile con qualsiasi colonnina/refrigeratore
- Dimensioni: 20,6 × 20,6 × 60 cm

**Colonnina Emax AC**
- Eroga acqua naturale a temperatura ambiente e naturale refrigerata (nessuna funzione calda)
- Produzione acqua fredda: 20 L/h, temperatura 8–12°C
- Raffreddamento a serbatoio, compressore 1/12 HP
- Assorbimento: 150 W
- Altezza punto di erogazione: 20 cm
- Vaschetta raccogli gocce (senza scarico)
- Dimensioni: 32 × 32,5 × 100 cm — peso 17 kg
- Indicata per uffici fino a circa 15 persone

**Servizio di noleggio (da comunicare senza la parola "gratuita")**
- Installazione della colonnina
- Manutenzione periodica con sanificazione
- Assistenza full-service, con sostituzione dell'apparecchio in caso di guasto
- Consegna boccioni (formato 12 o 18 litri) a domicilio/ufficio
- Ritiro dei boccioni vuoti e avvio al riciclo

## Struttura pagina `erogatore-boccioni.html`

Chrome identico a `prodotti.html`: stessa nav (con dropdown Prodotti a 3 voci, vedi sotto), stesso footer, cookie banner, bolla WhatsApp, stessi script (mobile menu, cookie consent, tracking click WhatsApp).

1. **Hero**
   - Breadcrumb: Home / Prodotti / Erogatore a boccioni
   - H1: erogatore a boccioni per ufficio a noleggio
   - Sottotitolo: acqua naturale e fredda senza allaccio idraulico, per piccoli uffici e reception
   - CTA: "Richiedi preventivo" (→ `index.html#form`) + "Scrivici su WhatsApp"

2. **Due card prodotto** (stesso componente visivo delle card in `prodotti.html`: `bg-surface rounded-[28px] p-7`, immagine in riquadro bianco, titolo, bullet list specifiche, CTA "Richiedi info")
   - Card **Colonnina** — immagine `immagini/5940735430699453882.jpg`, bullet con le specifiche Emax AC sopra
   - Card **Boccione 18L** — immagine `immagini/5940735430699453880.jpg`, bullet con le specifiche Splendida sopra

3. **Come funziona il noleggio** — 3 step in sequenza (card o timeline orizzontale):
   1. Consegna e installazione della colonnina
   2. Consegna periodica dei boccioni pieni e ritiro dei vuoti
   3. Manutenzione periodica e assistenza inclusa

4. **Vantaggi** — griglia di 4 punti con icone, nello stile delle sezioni "vantaggi" già presenti sul sito:
   - Nessuna opera idraulica: si posiziona ovunque ci sia una presa elettrica
   - Attacco igienico monouso ad ogni cambio boccione — immagine di dettaglio `immagini/5940735430699453949.jpg`
   - Ingombro minimo, adatto a piccoli uffici, reception, studi professionali
   - Acqua naturale e fredda sempre disponibile, senza gestione di bottiglie in cassa

5. **Cosa include il noleggio** — bullet list basata sui "Dati tecnici di riferimento" sopra (installazione, manutenzione con sanificazione, assistenza full-service, consegna/ritiro boccioni)

6. **Boccione a noleggio vs sistema ad osmosi collegato alla rete** — confronto sintetico a due colonne, con link alla sezione `prodotti.html#uffici` (Linea Thanta, T40 Totem, Totem Bollicina) per chi ha bisogno di portate più alte o continuità senza ricariche:
   - *Erogatore a boccioni*: nessun collegamento idraulico, installazione rapida ovunque, richiede sostituzione periodica dei boccioni, adatto a uffici fino a ~15 persone
   - *Totem/colonnina ad osmosi*: erogazione continua senza ricariche, nessuno stoccaggio boccioni, richiede allaccio alla rete idrica, adatto a volumi più alti (uffici grandi, HoReCa)

7. **FAQ** (contenuto originale, con markup `FAQPage`):
   - Quanto pesa un boccione da 18 litri e come avviene il cambio?
   - Quanto dura un boccione da 18 litri in un ufficio medio?
   - Quante persone può servire un erogatore a boccioni?
   - Che differenza c'è tra erogatore a boccioni e sistema ad osmosi inversa collegato alla rete?
   - Serve un allaccio idraulico per installare la colonnina?
   - Cosa succede quando il boccione è vuoto?
   - Come funziona la manutenzione della colonnina?

8. **CTA finale** — stesso pattern grafico delle altre pagine prodotto (box con gradiente, bottone "Prenota una consulenza gratuita" + bottone WhatsApp)

### SEO / dati strutturati
- `<title>` e meta description dedicati
- Canonical + hreflang coerenti con le altre pagine
- JSON-LD: `BreadcrumbList`, `FAQPage` (domande sopra), `Product` per la colonnina Emax AC in noleggio con `name`/`image`/`description`/`brand`, **senza blocco `offers`** (evita di dover dichiarare un prezzo o un'availability che non si vuole comunicare)

## Aggiornamento menu Prodotti (sito-wide)

Il dropdown desktop, il sotto-menu mobile e il blocco footer "Prodotti" attualmente hanno 2 voci (Casa, Uffici/HoReCa) e sono duplicati identici in circa 18 pagine root + un sottoinsieme di pagine `blog/*.html` (footer semplificato, senza dropdown).

Diventano 3 voci, ciascuna con un sottotitolo descrittivo sotto il nome (solo nel dropdown desktop e nel sotto-menu mobile; il footer resta con link singola riga):

| Voce menu | Sottotitolo | Link |
|---|---|---|
| Casa | Sistemi di filtrazione a osmosi inversa | `prodotti.html#casa` |
| Uffici/HoReCa | Sistemi di filtrazione | `prodotti.html#uffici` |
| Ufficio | Erogatore a boccioni | `erogatore-boccioni.html` |

L'aggiornamento va applicato in modo identico ovunque compaia il blocco (stesso markup, path relativo già usato in ciascun file — es. `prodotti.html#casa` su root, `../prodotti.html#casa` dentro `blog/`).

## Aggiornamento `prodotti.html`

- Nella sezione `#uffici`, in coda, un banner di rimando alla nuova pagina (stile coerente con le card esistenti): "Cerchi un erogatore a boccioni per l'ufficio? Scopri la soluzione a noleggio" con link a `erogatore-boccioni.html`.
- Il JSON-LD `ItemList` di `prodotti.html` **non viene esteso**: resta l'elenco dei soli prodotti effettivamente presenti su quella pagina. Il banner di rimando è solo un link HTML, senza voce corrispondente nell'ItemList.

## Fuori scope
- Nessuna pagina di dettaglio separata per la sola colonnina o il solo boccione: tutto vive in `erogatore-boccioni.html`.
- Nessun prezzo o simulatore di costo.
- Non si modifica la logica del quiz "Qual è l'impianto giusto per te?" in `prodotti.html` per includere l'erogatore a boccioni (resta focalizzato su osmosi/frigogasatori/totem).
