# Form contatti riusabile e barra CTA mobile

## Obiettivo

Aumentare le richieste di contatto portando un form contatti in fondo a
tutte le pagine di contenuto del sito (oggi esiste solo in home) e
aggiungendo su smartphone una barra fissa con Chiama · WhatsApp ·
Preventivo. Chi legge una pagina deve poter chiedere informazioni senza
lasciarla.

## Contesto

- Sito statico: pagine HTML indipendenti, nessun sistema di include.
  Tailwind 3 compilato in `dist/styles.css`; la config legge solo
  `./*.html` e `./blog/*.html`.
- Unico form contatti: `index.html#form` (`id="lead-form"`), POST HTML
  classico a Formspree `https://formspree.io/f/mojnkvgl`, con honeypot
  `_gotcha`. Dopo l'invio l'utente finisce sulla pagina di conferma di
  Formspree. L'evento GA `generate_lead` (`metodo: form_consulenza`)
  parte al submit, anche se l'invio poi fallisce.
- 101 link nel sito puntano a `index.html#form` / `/#form`.
- Il form "guide gratuite" usa `api/subscribe.js` (Brevo) ed è fuori
  scope.
- GA4 (`G-EQSCT1RWG4`) è caricato solo dopo consenso cookie; `gtag` può
  non esistere.
- Tracciamento WhatsApp esistente (spec 2026-07-03): snippet inline con
  listener delegato su `a[href*="wa.me"]`, `posizione` = `flottante`
  se `aria-label="Contattaci su WhatsApp"`, altrimenti `altro`.
- Contatti aziendali: tel `+393204478319`, WhatsApp
  `https://wa.me/393204478319`.

## Decisioni

- Approccio A: un unico script che genera il form nei contenitori
  presenti in pagina (scartati: HTML copiato in ogni pagina; popup).
- Backend invariato: Formspree, stesso endpoint.
- CTA extra: solo barra fissa mobile. Niente box a metà articolo né CTA
  aggiuntive tra le sezioni.
- Form anche nei 32 articoli del blog.

## Componenti

### 1. `form-contatti.js` (root, caricato con `<script src="/form-contatti.js" defer>`)

Per ogni elemento `[data-form-contatti]` nella pagina:

- Sostituisce il contenuto con il form. Il contenuto originale del
  contenitore è il fallback senza JS: un link "Richiedi informazioni" a
  `/index.html#form`.
- Attributo opzionale del contenitore: `data-titolo` — titolo della
  card (default "Richiedi informazioni").
- Campi (i `name` sono le etichette che compaiono nell'email Formspree):
  | name | tipo | obbligatorio |
  |---|---|---|
  | `Nome` | text | sì |
  | `Email` | email | sì |
  | `Telefono` | tel | sì |
  | `Messaggio` | textarea | no |
  | `Privacy` | checkbox (testo e link identici al form attuale) | sì |
  | `_gotcha` | honeypot nascosto (come oggi) | — |
  | `Pagina` | hidden = `location.pathname` | — |
  | `_subject` | hidden = `Nuova richiesta da <pathname>` | — |
- ID univoci per istanza (label `for`, checkbox privacy), così più form
  nella stessa pagina non entrano in conflitto.
- Stile: stesse classi Tailwind del form attuale in home (card bianca
  `rounded-[28px]`, input `bg-surface rounded-2xl`, bottone
  `bg-brand rounded-full`). Testo bottone: "Richiedi il tuo preventivo
  gratuito".

**Invio**

1. `preventDefault`; validazione nativa del browser (`required`,
   `type=email`) già avvenuta.
2. Bottone disabilitato, testo "Invio in corso…".
3. `fetch(endpoint, { method: 'POST', body: FormData, headers: { Accept: 'application/json' } })`.
4. Risposta `ok` → il form viene sostituito da un messaggio di conferma
   ("Grazie! Abbiamo ricevuto la tua richiesta e ti ricontatteremo al
   più presto." + link WhatsApp per chi ha fretta); se `gtag` esiste:
   `gtag('event', 'generate_lead', { metodo: 'form_consulenza', pagina: location.pathname })`.
5. Errore di rete o risposta non `ok` → messaggio d'errore sotto il
   bottone con alternativa WhatsApp e telefono; dati conservati; bottone
   riabilitato. Nessun evento GA.

### 2. `barra-mobile.js` (root, `defer`)

- Inserisce in fondo al `body` una barra `fixed bottom-0 inset-x-0
  md:hidden` con tre bottoni di uguale larghezza:
  - **Chiama** → `tel:+393204478319`
  - **WhatsApp** → `https://wa.me/393204478319?text=…` (testo generico)
  - **Preventivo** → `#contatti` se nella pagina esiste un
    `[data-form-contatti]`, altrimenti `/index.html#form`
- Aggiunge al `body` un `padding-bottom` pari all'altezza della barra
  sotto `md`, così footer e contenuti non restano coperti.
- Nasconde sotto `md` la bolla WhatsApp flottante
  (`a[aria-label="Contattaci su WhatsApp"]`), che resta visibile su
  desktop.
- Il banner cookie (`z-[100]`) resta sopra la barra (barra `z-40`).
- Tracciamento click, se `gtag` esiste:
  `click_telefono` / `click_whatsapp` / `click_preventivo` con
  `posizione: 'barra_mobile'`.
- La barra ha l'attributo `data-barra-mobile`. Lo snippet di
  tracciamento WhatsApp esistente viene aggiornato per ignorare i click
  dentro `[data-barra-mobile]`, evitando il doppio conteggio.

## Posizionamento

Sezione `<section id="contatti">` con il contenitore
`<div data-form-contatti …>`, subito prima del footer, in:

- `privati.html`, `prodotti.html`, `erogatore-boccioni.html`,
  `erogatore-rete-idrica.html`
- pagine città ×5, `acqua-bambini-famiglia.html`,
  `contaminanti-acqua.html`, `guida-osmosi-inversa.html`, `faq.html`,
  `glossario.html`, `residuo-fisso-acque-in-bottiglia.html`,
  `chi-siamo.html`, `blog/index.html`
- i 32 articoli del blog, dopo il box CTA finale esistente

**Home:** il form attuale viene sostituito dal contenitore, con
`id="form"` mantenuto sulla sezione, così i 101 link esistenti
continuano a funzionare. Il vecchio listener `lead-form` viene rimosso.

**Link:** nelle pagine che ricevono il form, i link `index.html#form` /
`/#form` / `../index.html#form` diventano `#contatti`.

Esclusi: `cookie.html`, `privacy.html`, pagine `carosello-*`.

**Script:** `barra-mobile.js` va in tutte le pagine elencate più la
home; `form-contatti.js` in tutte le pagine che hanno un contenitore.

## Build

- `tailwind.config.js`: aggiungere `./*.js` a `content`, altrimenti le
  classi usate solo negli script non vengono compilate.
- Rebuild con `node node_modules/tailwindcss/lib/cli.js -i src/input.css -o dist/styles.css --minify`.

## Test

- Screenshot headless desktop (1280) e mobile (390) di home, privati, un
  erogatore, una città e un articolo del blog: form visibile, barra
  mobile presente solo sotto 768px, footer non coperto, cookie banner
  sopra la barra.
- Pagina di test locale (non pubblicata) che sostituisce `fetch` con uno
  stub: verifica stato "invio in corso", conferma su successo, messaggio
  d'errore e dati conservati su fallimento, presenza dei campi `Pagina`
  e `_subject`, ID univoci con due form in pagina.
- Verifica grep: ogni pagina in elenco ha il contenitore e gli script;
  nessun `#form` residuo nelle pagine con form (esclusa la home).
- Un invio reale su Formspree solo con l'ok del titolare (arriva
  nell'email aziendale).

## Fuori scope

- Form guide gratuite / `api/subscribe.js`.
- Invio dei contatti a Brevo o a un CRM, risposta automatica al cliente.
- Box CTA a metà articolo, CTA tra le sezioni, popup.
- Campi di qualificazione (tipo di cliente, comune): scartati per tenere
  il form corto.
