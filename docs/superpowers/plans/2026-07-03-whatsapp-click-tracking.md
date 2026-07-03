# Tracciamento click WhatsApp via GA4 - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tracciare in GA4 (`G-EQSCT1RWG4`) i click sui bottoni WhatsApp del sito, distinguendo bottone flottante da altri CTA, su tutte le 25 pagine statiche che oggi contengono un link `wa.me`.

**Architecture:** Un blocco `<script>` identico, inserito prima di `</body>` in ciascuna delle 25 pagine, registra un listener di click a livello di `document` (event delegation su `a[href*="wa.me"]`) e invia `gtag('event', 'click_whatsapp', { posizione })` solo se `gtag` è già definito (rispetta il consenso cookie esistente). Nessuna modifica ai tag `<a>` esistenti.

**Tech Stack:** HTML statico, JavaScript vanilla, gtag.js (GA4) già presente sul sito. Nessun framework di test automatico nel progetto (sito statico senza build JS) — la verifica è manuale via browser e GA4 DebugView, oltre a verifiche testuali (grep/diff) sui file modificati.

## Global Constraints

- Nome evento GA: `click_whatsapp` (esatto, invariato in tutte le pagine).
- Parametro evento: `posizione` con valori esatti `flottante` o `altro`.
- Il bottone flottante è identificato da `aria-label="Contattaci su WhatsApp"`; qualunque altro link `wa.me` è `altro`.
- Non aggiungere `onclick` inline sui tag `<a>` esistenti: il tracciamento vive solo nello script iniettato.
- Non chiamare `gtag` se non è definito (`typeof gtag === 'function'` come guardia) — non deve bypassare il banner cookie esistente.
- Lo script va inserito immediatamente prima di `</body>` in ciascuna delle 25 pagine elencate nello spec (`docs/superpowers/specs/2026-07-03-whatsapp-click-tracking-design.md`), invariato carattere per carattere.
- Nessuna pagina blog priva del bottone WhatsApp va toccata.
- (Aggiunto dopo la revisione finale di Task 1+2) 10 delle 25 pagine non avevano affatto GA4/banner cookie installato, quindi il loro script di tracciamento non poteva mai inviare eventi. Il Task 3 aggiunge a queste 10 pagine l'identica infrastruttura di consenso cookie + GA4 già presente nelle altre 15, byte-per-byte (copiata da `chi-siamo.html`), senza inventare nulla di nuovo.
- Non viene aggiunto il pulsante "Gestisci preferenze cookie" nel footer di queste 10 pagine (richiederebbe modificare la struttura del footer di ciascun file, fuori scope per questo task): resta un follow-up eventuale, da segnalare all'utente, non da fare qui.

---

### Task 1: Inserire lo script di tracciamento in `index.html` e validarlo in browser

**Files:**
- Modify: `index.html` (inserimento prima di `</body>`, riga 1421 nella versione corrente del file)

**Interfaces:**
- Produces: blocco `<script>` con evento `click_whatsapp` e parametro `posizione` (`flottante` | `altro`) — questo identico blocco verrà riusato testualmente nel Task 2 per le altre 24 pagine.

- [ ] **Step 1: Inserire il blocco script prima di `</body>` in `index.html`**

Usa l'Edit tool per sostituire l'ultima occorrenza di `</body>` con il blocco seguente + `</body>`:

```html
    <script>
    (function() {
        function trackWhatsAppClick(pos) {
            if (typeof gtag === 'function') {
                gtag('event', 'click_whatsapp', { posizione: pos });
            }
        }
        document.addEventListener('click', function(e) {
            var link = e.target.closest('a[href*="wa.me"]');
            if (!link) return;
            var pos = link.getAttribute('aria-label') === 'Contattaci su WhatsApp' ? 'flottante' : 'altro';
            trackWhatsAppClick(pos);
        });
    })();
    </script>
</body>
```

- [ ] **Step 2: Verifica statica**

Run: `grep -n "click_whatsapp" index.html`
Expected: una sola occorrenza, all'interno del nuovo blocco `<script>`.

- [ ] **Step 3: Verifica manuale in browser**

Avvia un server statico locale (il progetto non ha un dev server dedicato):

Run: `npx serve . -l 5000` (oppure `python -m http.server 5000`)

Apri `http://localhost:5000/index.html`, apri la Console DevTools, accetta il banner cookie (bottone "Accetta"), poi:
1. Clicca il bottone WhatsApp flottante in basso a destra.
2. Clicca il CTA WhatsApp nell'hero ("Scrivici su WhatsApp" / bottone verde vicino a "Prenota una consulenza gratuita").

In Console, digita `dataLayer` e verifica che compaiano due voci con `event: "click_whatsapp"`, una con `posizione: "flottante"` e una con `posizione: "altro"`.

Expected: entrambe le voci presenti con i valori corretti. Se usi l'estensione "Google Analytics Debugger" o l'URL con `?gtm_debug=1`, puoi anche verificarlo in GA4 DebugView (Analytics > Admin > DebugView) sulla property `G-EQSCT1RWG4`.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: traccia click WhatsApp in GA4 (index.html)"
```

---

### Task 2: Propagare lo stesso blocco script alle altre 24 pagine

**Files:**
- Modify (24 file, inserimento prima di `</body>` in ciascuno):
  `prodotti.html`, `chi-siamo.html`, `faq.html`, `glossario.html`, `cookie.html`, `privacy.html`, `contaminanti-acqua.html`, `guida-osmosi-inversa.html`, `acqua-bambini-famiglia.html`, `acqua-milano.html`, `acqua-roma.html`, `acqua-napoli.html`, `acqua-padova.html`, `acqua-torino.html`, `blog/index.html`, `blog/acqua-e-gravidanza.html`, `blog/acqua-calcare-pelle-capelli.html`, `blog/detrazione-fiscale-50-impianto-filtrazione-acqua.html`, `blog/quanto-dura-impianto-osmosi-inversa.html`, `blog/certificazioni-impianti-acqua-nsf-ce.html`, `blog/come-leggere-analisi-acqua.html`, `blog/migliori-impianti-osmosi-inversa-2026.html`, `blog/osmosi-inversa-appartamento-affitto.html`, `blog/acqua-contatore-tds-risultati.html`
- Create (temporaneo, da cancellare a fine task): `scripts/insert-wa-tracking.mjs`

**Interfaces:**
- Consumes: il blocco `<script>` esatto prodotto nel Task 1 (deve essere byte-identico in tutte le pagine).

- [ ] **Step 1: Verificare che ognuno dei 24 file abbia esattamente un `</body>`**

Run:
```bash
for f in prodotti.html chi-siamo.html faq.html glossario.html cookie.html privacy.html contaminanti-acqua.html guida-osmosi-inversa.html acqua-bambini-famiglia.html acqua-milano.html acqua-roma.html acqua-napoli.html acqua-padova.html acqua-torino.html blog/index.html blog/acqua-e-gravidanza.html blog/acqua-calcare-pelle-capelli.html blog/detrazione-fiscale-50-impianto-filtrazione-acqua.html blog/quanto-dura-impianto-osmosi-inversa.html blog/certificazioni-impianti-acqua-nsf-ce.html blog/come-leggere-analisi-acqua.html blog/migliori-impianti-osmosi-inversa-2026.html blog/osmosi-inversa-appartamento-affitto.html blog/acqua-contatore-tds-risultati.html; do
  c=$(grep -c "</body>" "$f")
  if [ "$c" != "1" ]; then echo "ATTENZIONE: $f ha $c occorrenze di </body>"; fi
done
```
Expected: nessun output (già verificato in fase di brainstorming, ma da ri-confermare prima di modificare).

- [ ] **Step 2: Scrivere lo script di inserimento**

Create `scripts/insert-wa-tracking.mjs`:

```javascript
import { readFileSync, writeFileSync } from 'node:fs';

const files = [
  'prodotti.html', 'chi-siamo.html', 'faq.html', 'glossario.html',
  'cookie.html', 'privacy.html', 'contaminanti-acqua.html',
  'guida-osmosi-inversa.html', 'acqua-bambini-famiglia.html',
  'acqua-milano.html', 'acqua-roma.html', 'acqua-napoli.html',
  'acqua-padova.html', 'acqua-torino.html', 'blog/index.html',
  'blog/acqua-e-gravidanza.html', 'blog/acqua-calcare-pelle-capelli.html',
  'blog/detrazione-fiscale-50-impianto-filtrazione-acqua.html',
  'blog/quanto-dura-impianto-osmosi-inversa.html',
  'blog/certificazioni-impianti-acqua-nsf-ce.html',
  'blog/come-leggere-analisi-acqua.html',
  'blog/migliori-impianti-osmosi-inversa-2026.html',
  'blog/osmosi-inversa-appartamento-affitto.html',
  'blog/acqua-contatore-tds-risultati.html',
];

const snippet = `    <script>
    (function() {
        function trackWhatsAppClick(pos) {
            if (typeof gtag === 'function') {
                gtag('event', 'click_whatsapp', { posizione: pos });
            }
        }
        document.addEventListener('click', function(e) {
            var link = e.target.closest('a[href*="wa.me"]');
            if (!link) return;
            var pos = link.getAttribute('aria-label') === 'Contattaci su WhatsApp' ? 'flottante' : 'altro';
            trackWhatsAppClick(pos);
        });
    })();
    </script>
</body>`;

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  if (content.includes('click_whatsapp')) {
    console.log(`SKIP (già presente): ${file}`);
    continue;
  }
  const lastIndex = content.lastIndexOf('</body>');
  if (lastIndex === -1) {
    console.error(`ERRORE: nessun </body> trovato in ${file}`);
    process.exitCode = 1;
    continue;
  }
  const updated = content.slice(0, lastIndex) + snippet + content.slice(lastIndex + '</body>'.length);
  writeFileSync(file, updated, 'utf8');
  console.log(`OK: ${file}`);
}
```

- [ ] **Step 3: Eseguire lo script**

Run: `node scripts/insert-wa-tracking.mjs`
Expected: una riga `OK: <file>` per ciascuno dei 24 file, nessun `ERRORE`.

- [ ] **Step 4: Verifica statica su tutti i 25 file**

Run: `grep -rl "click_whatsapp" --include="*.html" .`
Expected: esattamente 25 file elencati (i 24 di questo task + `index.html` del Task 1).

Run: `grep -c "click_whatsapp" index.html prodotti.html chi-siamo.html`
Expected: `1` per ciascun file (nessun inserimento duplicato).

- [ ] **Step 5: Rimuovere lo script temporaneo**

Run: `rm scripts/insert-wa-tracking.mjs`

Se la cartella `scripts/` risulta vuota dopo la rimozione, rimuovila anch'essa (era stata creata solo per questo script):
Run: `rmdir scripts 2>/dev/null || true`

- [ ] **Step 6: Verifica manuale a campione in browser**

Con il server locale ancora attivo (`npx serve . -l 5000`), apri:
- `http://localhost:5000/prodotti.html` (ha 2 bottoni come index.html)
- `http://localhost:5000/blog/acqua-e-gravidanza.html` (ha solo il bottone flottante)

Su entrambe: accetta i cookie, clicca il/i bottone/i WhatsApp, verifica in Console (`dataLayer`) che l'evento `click_whatsapp` compaia con `posizione` corretta.

Expected: evento presente con `posizione: "flottante"` su entrambe le pagine, e `posizione: "altro"` in aggiunta su `prodotti.html`.

- [ ] **Step 7: Commit**

```bash
git add prodotti.html chi-siamo.html faq.html glossario.html cookie.html privacy.html contaminanti-acqua.html guida-osmosi-inversa.html acqua-bambini-famiglia.html acqua-milano.html acqua-roma.html acqua-napoli.html acqua-padova.html acqua-torino.html blog/index.html "blog/acqua-e-gravidanza.html" "blog/acqua-calcare-pelle-capelli.html" "blog/detrazione-fiscale-50-impianto-filtrazione-acqua.html" "blog/quanto-dura-impianto-osmosi-inversa.html" "blog/certificazioni-impianti-acqua-nsf-ce.html" "blog/come-leggere-analisi-acqua.html" "blog/migliori-impianti-osmosi-inversa-2026.html" "blog/osmosi-inversa-appartamento-affitto.html" "blog/acqua-contatore-tds-risultati.html"
git commit -m "feat: traccia click WhatsApp in GA4 su tutte le pagine del sito"
```

Nota: non aggiungere `scripts/` allo staging (è stato rimosso al Step 5, non deve comparire nel commit).

---

### Task 3: Aggiungere consenso cookie + GA4 alle 10 pagine che ne sono prive

**Perché:** la revisione finale di Task 1+2 ha scoperto che 10 delle 25 pagine (elencate sotto) non hanno mai avuto GA4 installato: nessun banner cookie, nessuna funzione `loadGA`, nessun `gwi_consent`. Lo script `click_whatsapp` inserito nel Task 2 su queste pagine è corretto ma inerte, perché `gtag` non è mai definito. Questo task porta l'infrastruttura mancante, copiata byte-per-byte da una pagina che già funziona (`chi-siamo.html`).

**Files:**
- Modify (10 file, inserimento prima del blocco `<script>` di tracciamento `click_whatsapp` già presente da Task 2):
  `prodotti.html`, `blog/acqua-calcare-pelle-capelli.html`, `blog/acqua-contatore-tds-risultati.html`, `blog/acqua-e-gravidanza.html`, `blog/certificazioni-impianti-acqua-nsf-ce.html`, `blog/come-leggere-analisi-acqua.html`, `blog/detrazione-fiscale-50-impianto-filtrazione-acqua.html`, `blog/migliori-impianti-osmosi-inversa-2026.html`, `blog/osmosi-inversa-appartamento-affitto.html`, `blog/quanto-dura-impianto-osmosi-inversa.html`
- Create (temporaneo, da cancellare a fine task): `scripts/insert-cookie-ga.mjs`

**Interfaces:**
- Consumes: il blocco `<script>` `click_whatsapp` prodotto in Task 2 (usato solo come punto di ancoraggio per l'inserimento: il nuovo contenuto va subito prima di esso).
- Produces: su queste 10 pagine, `window.gtag` diventa disponibile dopo l'accettazione del banner, esattamente come sulle altre 15 — nessuna nuova interfaccia per task successivi.

- [ ] **Step 1: Verificare che nessuna delle 10 pagine abbia già `id="cookie-banner"` o funzioni `loadGA`/`setCookie`**

Run:
```bash
grep -l "cookie-banner\|function loadGA" prodotti.html blog/acqua-calcare-pelle-capelli.html blog/acqua-contatore-tds-risultati.html blog/acqua-e-gravidanza.html blog/certificazioni-impianti-acqua-nsf-ce.html blog/come-leggere-analisi-acqua.html blog/detrazione-fiscale-50-impianto-filtrazione-acqua.html blog/migliori-impianti-osmosi-inversa-2026.html blog/osmosi-inversa-appartamento-affitto.html blog/quanto-dura-impianto-osmosi-inversa.html
```
Expected: nessun output (nessuna delle 10 pagine ha già questa infrastruttura — già verificato in fase di pianificazione, da ri-confermare prima di modificare).

- [ ] **Step 2: Scrivere lo script di inserimento**

Create `scripts/insert-cookie-ga.mjs`:

```javascript
import { readFileSync, writeFileSync } from 'node:fs';

const files = [
  'prodotti.html',
  'blog/acqua-calcare-pelle-capelli.html',
  'blog/acqua-contatore-tds-risultati.html',
  'blog/acqua-e-gravidanza.html',
  'blog/certificazioni-impianti-acqua-nsf-ce.html',
  'blog/come-leggere-analisi-acqua.html',
  'blog/detrazione-fiscale-50-impianto-filtrazione-acqua.html',
  'blog/migliori-impianti-osmosi-inversa-2026.html',
  'blog/osmosi-inversa-appartamento-affitto.html',
  'blog/quanto-dura-impianto-osmosi-inversa.html',
];

// Ancora: l'esatto inizio del blocco <script> click_whatsapp inserito nel Task 2.
const anchor = `<script>
    (function() {
        function trackWhatsAppClick(pos) {`;

const snippet = `<!-- Cookie Consent Banner -->
<div id="cookie-banner" class="fixed bottom-0 left-0 right-0 z-[100] bg-ink border-t border-white/10 shadow-2xl px-6 py-5" style="display:none">
    <div class="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-5">
        <p class="flex-1 text-sm text-white/70 leading-relaxed">
            Utilizziamo <strong class="text-white">cookie analitici</strong> (Google Analytics) per migliorare l'esperienza sul sito. Puoi accettarli o continuare solo con i cookie tecnici necessari. Leggi la nostra <a href="/cookie.html" class="text-brand underline">Cookie Policy</a> e la <a href="/privacy.html" class="text-brand underline">Privacy Policy</a>.
        </p>
        <div class="flex gap-3 shrink-0">
            <button id="cookie-reject" class="px-5 py-2.5 rounded-full border border-white/30 text-sm font-medium text-white/70 hover:border-white hover:text-white transition-colors">Solo necessari</button>
            <button id="cookie-accept" class="px-5 py-2.5 rounded-full bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors">Accetta tutti</button>
        </div>
    </div>
</div>

<script>
    function setCookie(name, value, days) {
        var d = new Date();
        d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = name + '=' + value + '; expires=' + d.toUTCString() + '; path=/; SameSite=Lax';
    }
    function getCookie(name) {
        var v = '; ' + document.cookie;
        var parts = v.split('; ' + name + '=');
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
    function loadGA() {
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=G-EQSCT1RWG4';
        document.head.appendChild(s);
        s.onload = function() {
            window.dataLayer = window.dataLayer || [];
            window.gtag = function(){dataLayer.push(arguments);};
            window.gtag('js', new Date());
            window.gtag('config', 'G-EQSCT1RWG4');
        };
    }
    function mostraBannerCookie() {
        setCookie('gwi_consent', '', -1);
        document.getElementById('cookie-banner').style.display = 'block';
        window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'});
    }
    (function() {
        var consent = getCookie('gwi_consent');
        if (consent === 'accepted') {
            loadGA();
        } else if (!consent) {
            document.getElementById('cookie-banner').style.display = 'block';
        }
        document.getElementById('cookie-accept').addEventListener('click', function() {
            setCookie('gwi_consent', 'accepted', 365);
            document.getElementById('cookie-banner').style.display = 'none';
            loadGA();
        });
        document.getElementById('cookie-reject').addEventListener('click', function() {
            setCookie('gwi_consent', 'rejected', 365);
            document.getElementById('cookie-banner').style.display = 'none';
        });
    })();
</script>

`;

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  if (content.includes('id="cookie-banner"')) {
    console.log(`SKIP (già presente): ${file}`);
    continue;
  }
  const anchorIndex = content.indexOf(anchor);
  if (anchorIndex === -1) {
    console.error(`ERRORE: ancora click_whatsapp non trovata in ${file}`);
    process.exitCode = 1;
    continue;
  }
  const updated = content.slice(0, anchorIndex) + snippet + content.slice(anchorIndex);
  writeFileSync(file, updated, 'utf8');
  console.log(`OK: ${file}`);
}
```

- [ ] **Step 3: Eseguire lo script**

Run: `node scripts/insert-cookie-ga.mjs`
Expected: una riga `OK: <file>` per ciascuno dei 10 file, nessun `ERRORE`.

- [ ] **Step 4: Verifica statica**

Run: `grep -rlc 'id="cookie-banner"' prodotti.html blog/acqua-calcare-pelle-capelli.html blog/acqua-contatore-tds-risultati.html blog/acqua-e-gravidanza.html blog/certificazioni-impianti-acqua-nsf-ce.html blog/come-leggere-analisi-acqua.html blog/detrazione-fiscale-50-impianto-filtrazione-acqua.html blog/migliori-impianti-osmosi-inversa-2026.html blog/osmosi-inversa-appartamento-affitto.html blog/quanto-dura-impianto-osmosi-inversa.html`
Expected: `1` per ciascuno dei 10 file.

Run: `grep -c "</body>" prodotti.html` (e ripeti per gli altri 9)
Expected: `1` per ciascun file — l'inserimento non deve aver introdotto o rimosso tag.

Confronta che il banner+script appena inserito sia identico byte-per-byte in tutti i 10 file e coincida con quello già presente in una delle 15 pagine esistenti (es. `chi-siamo.html`, righe 391-402 e 412-458): estrai il blocco da `<!-- Cookie Consent Banner -->` a `</script>` (il primo, quello del banner) in un file temporaneo per ciascuna pagina e confrontali con `diff` o hash.

- [ ] **Step 5: Rimuovere lo script temporaneo**

Run: `rm scripts/insert-cookie-ga.mjs`
Run: `rmdir scripts 2>/dev/null || true`

- [ ] **Step 6: Verifica manuale in browser**

Se disponibile un browser reale (altrimenti documenta chiaramente che questo step non è stato eseguito, come già accaduto nei Task 1-2): avvia `npx serve . -l 5000`, apri `http://localhost:5000/prodotti.html`, verifica che il banner cookie compaia in basso, cliccalo su "Accetta tutti", poi clicca i bottoni WhatsApp e controlla in console che `dataLayer` contenga sia l'evento GA standard (`config`) sia `click_whatsapp` con `posizione` corretta.

- [ ] **Step 7: Commit**

```bash
git add prodotti.html blog/acqua-calcare-pelle-capelli.html blog/acqua-contatore-tds-risultati.html blog/acqua-e-gravidanza.html blog/certificazioni-impianti-acqua-nsf-ce.html blog/come-leggere-analisi-acqua.html blog/detrazione-fiscale-50-impianto-filtrazione-acqua.html blog/migliori-impianti-osmosi-inversa-2026.html blog/osmosi-inversa-appartamento-affitto.html blog/quanto-dura-impianto-osmosi-inversa.html
git commit -m "feat: aggiungi consenso cookie e GA4 alle pagine che ne erano prive"
```

Nota: non aggiungere `scripts/` allo staging.

---

### Task 4: Verifica finale in GA4 DebugView

**Files:** nessuna modifica — solo verifica.

**Interfaces:** nessuna (task di sola verifica).

- [ ] **Step 1: Deploy o preview**

Se il progetto è collegato a Vercel per il deploy automatico su push, procedi con un push su un branch di preview (non su `main` senza conferma dell'utente) oppure chiedi conferma prima di eseguire `git push`. In alternativa, verifica su `localhost` è sufficiente se l'utente non richiede una verifica in produzione.

- [ ] **Step 2: Aprire GA4 DebugView**

Vai su Google Analytics > proprietà `G-EQSCT1RWG4` > Admin > DebugView. Se il browser di test non è in "debug mode", installa temporaneamente l'estensione "Google Analytics Debugger" per Chrome/Firefox oppure aggiungi `gtag('config', 'G-EQSCT1RWG4', {'debug_mode': true})` temporaneamente in console.

- [ ] **Step 3: Generare eventi di test**

Su 2-3 pagine diverse (una con solo bottone flottante, una con entrambi), accetta i cookie e clicca i bottoni WhatsApp.

- [ ] **Step 4: Confermare in DebugView**

Expected: gli eventi `click_whatsapp` compaiono nel flusso in tempo reale con il parametro `posizione` valorizzato correttamente (`flottante` o `altro`).

Se tutto corrisponde, il task/piano è da considerarsi completo.
