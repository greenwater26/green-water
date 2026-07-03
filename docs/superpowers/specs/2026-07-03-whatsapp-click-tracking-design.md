# Tracciamento click WhatsApp via Google Analytics

## Obiettivo

Tracciare in GA4 (proprietà esistente `G-EQSCT1RWG4`) i click sui bottoni
WhatsApp del sito, distinguendo il bottone flottante dagli altri CTA
WhatsApp presenti in pagina (es. hero di home/prodotti).

## Contesto

- Il sito è composto da pagine HTML statiche indipendenti (nessun sistema
  di template/include), quindi ogni snippet condiviso è duplicato
  identico in ogni pagina.
- GA4 è già installato tramite `gtag.js` caricato dinamicamente da
  `loadGA()`, invocata solo dopo che l'utente accetta il banner cookie
  (variabile `gwi_consent`). Se il consenso non è stato dato, `gtag` non
  esiste come funzione globale.
- I bottoni WhatsApp (link `href` contenente `wa.me`) sono presenti su 25
  pagine (verificate via grep). Il bottone flottante ha sempre
  `aria-label="Contattaci su WhatsApp"`; eventuali altri bottoni
  WhatsApp (es. CTA nell'hero di `index.html` e `prodotti.html`) non
  hanno questo attributo.
- Alcune pagine blog non hanno alcun bottone WhatsApp e sono escluse.

## Approccio

Aggiungere, prima del tag `</body>` di ciascuna delle 25 pagine
interessate, un blocco `<script>` identico che:

1. Registra un listener di click a livello di `document` (event
   delegation), individuando i click su `a[href*="wa.me"]` tramite
   `event.target.closest(...)`.
2. Determina la posizione: `flottante` se l'elemento ha
   `aria-label="Contattaci su WhatsApp"`, altrimenti `altro`.
3. Se `typeof gtag === 'function'`, invia
   `gtag('event', 'click_whatsapp', { posizione })`. Se `gtag` non è
   definito (consenso cookie non dato), non fa nulla — nessun bypass del
   consenso esistente.

Non vengono modificati i tag `<a>` esistenti (nessun `onclick` inline),
così il tracciamento continua a funzionare anche per eventuali bottoni
WhatsApp aggiunti in futuro con lo stesso pattern.

## Nomenclatura evento

- Nome evento: `click_whatsapp`
- Parametro: `posizione` con valori `flottante` | `altro`

## Ambito

Le 25 pagine che contengono oggi almeno un link `wa.me` (verificate via
grep, elenco stabile al momento della stesura):

`index.html`, `prodotti.html`, `chi-siamo.html`, `faq.html`,
`glossario.html`, `cookie.html`, `privacy.html`,
`contaminanti-acqua.html`, `guida-osmosi-inversa.html`,
`acqua-bambini-famiglia.html`, `acqua-milano.html`, `acqua-roma.html`,
`acqua-napoli.html`, `acqua-padova.html`, `acqua-torino.html`,
`blog/index.html`, `blog/acqua-e-gravidanza.html`,
`blog/acqua-calcare-pelle-capelli.html`,
`blog/detrazione-fiscale-50-impianto-filtrazione-acqua.html`,
`blog/quanto-dura-impianto-osmosi-inversa.html`,
`blog/certificazioni-impianti-acqua-nsf-ce.html`,
`blog/come-leggere-analisi-acqua.html`,
`blog/migliori-impianti-osmosi-inversa-2026.html`,
`blog/osmosi-inversa-appartamento-affitto.html`,
`blog/acqua-contatore-tds-risultati.html`

Pagine blog senza bottone WhatsApp non vengono toccate.

## Verifica

Dopo l'implementazione: aprire una pagina con GA in modalità debug
(estensione GA Debugger o parametro `debug_mode`), accettare i cookie,
cliccare sia il bottone flottante che (in home) il CTA nell'hero, e
confermare in DebugView di Google Analytics la ricezione dell'evento
`click_whatsapp` con il parametro `posizione` corretto per ciascun click.
