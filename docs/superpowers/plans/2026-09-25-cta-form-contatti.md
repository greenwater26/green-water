# Form contatti riusabile e barra CTA mobile — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portare un form contatti (invio senza lasciare la pagina) in fondo a home, 18 pagine di contenuto e 32 articoli del blog, più una barra fissa Chiama · WhatsApp · Preventivo su smartphone.

**Architecture:** Due script vanilla JS nella root: `form-contatti.js` genera il form dentro ogni `<div data-form-contatti>` e invia a Formspree via `fetch`; `barra-mobile.js` aggiunge la barra in fondo al `body`. Le pagine HTML statiche ricevono solo una `<section>` contenitore e due tag `<script defer>`. I test sono pagine HTML in `tests/` eseguite con Chromium headless (`--dump-dom`) con `fetch` e `gtag` sostituiti da stub.

**Tech Stack:** HTML statico, Tailwind CSS 3 (build CLI), JavaScript ES5 senza dipendenze, Formspree, GA4 (`gtag`), Chromium headless + `python3 -m http.server` per i test.

**Spec:** `docs/superpowers/specs/2026-09-25-cta-form-contatti-design.md`

## Global Constraints

- Endpoint Formspree: `https://formspree.io/f/mojnkvgl` (invariato).
- Telefono: `tel:+393204478319`, visualizzato `+39 3204478319`. WhatsApp: `https://wa.me/393204478319`.
- Campi del form, con questi `name` esatti: `Nome`, `Email`, `Telefono` (obbligatori), `Messaggio` (facoltativo), `Privacy` (checkbox obbligatoria), `_gotcha` (honeypot), `Pagina` (hidden = `location.pathname`), `_subject` (hidden = `Nuova richiesta da <pathname>`). Nessun altro campo.
- Testo di conferma: "Grazie! Abbiamo ricevuto la tua richiesta e ti ricontatteremo al più presto." Nessuna promessa di tempi.
- Evento GA solo a invio riuscito: `gtag('event', 'generate_lead', { metodo: 'form_consulenza', pagina: location.pathname })`, e solo se `typeof gtag === 'function'`.
- Barra mobile: visibile solo sotto `md` (768px), `z-40`; il banner cookie (`z-[100]`) resta sopra.
- Eventi barra: `click_telefono` / `click_whatsapp` / `click_preventivo` con `posizione: 'barra_mobile'`.
- Pagine escluse: `cookie.html`, `privacy.html`, `carosello-*.html`.
- Rebuild CSS sempre con `node node_modules/tailwindcss/lib/cli.js -i src/input.css -o dist/styles.css --minify` (il binario `npx tailwindcss` è rotto in questo ambiente).
- Molti file hanno cambi di permessi non committati estranei al lavoro: fare sempre `git -c core.fileMode=false add <file>` e mai `git add -A` / `git add .`.
- Copy in italiano, tono del sito esistente.

## Review Focus

- Doppio clic su "invia" mentre la richiesta è in corso → deve partire una sola richiesta (test in Task 1).
- Formspree risponde con errore (es. 422 per email rifiutata) o la rete cade → messaggio d'errore, dati conservati, bottone di nuovo utilizzabile, nessun evento GA (test in Task 1).
- Visitatore che non ha accettato i cookie (`gtag` non definito) → invio e barra funzionano senza eccezioni (test in Task 1 e Task 2).
- Script incluso due volte o due form nella stessa pagina → nessun form duplicato, ID univoci e label collegate alla checkbox giusta (test in Task 1); una sola barra (test in Task 2).
- Header fisso che copre il titolo del form dopo il clic su "Preventivo"/CTA → la sezione ha `scroll-mt-24` (verifica screenshot in Task 5).

---

## File Structure

| File | Responsabilità |
|---|---|
| `form-contatti.js` (nuovo) | Genera il form nei contenitori, gestisce invio, conferma, errore, evento GA |
| `barra-mobile.js` (nuovo) | Barra fissa mobile, padding del body, bolla WhatsApp solo desktop, eventi GA |
| `tests/run.sh` (nuovo) | Avvia server locale, esegue una pagina di test in Chromium headless, esce ≠0 se un test fallisce |
| `tests/form-contatti.test.html` (nuovo) | Test del form con `fetch`/`gtag` stub |
| `tests/barra-mobile.test.html`, `tests/barra-mobile-senza-form.test.html` (nuovi) | Test della barra |
| `.vercelignore` (nuovo) | Esclude `tests/` dal deploy |
| `tailwind.config.js` | Aggiunge `./*.js` al `content` |
| `index.html` | Form attuale sostituito dal contenitore; rimosso vecchio listener |
| 18 pagine root + `blog/index.html` + 32 articoli | Sezione `#contatti`, script, link `#form` → `#contatti` |

---

### Task 1: `form-contatti.js` con test

**Files:**
- Create: `form-contatti.js`
- Create: `tests/run.sh`
- Create: `tests/form-contatti.test.html`
- Create: `.vercelignore`
- Modify: `tailwind.config.js` (array `content`)

**Interfaces:**
- Consumes: niente.
- Produces: contratto HTML `<div data-form-contatti [data-titolo="…"]>fallback</div>`; dopo l'inizializzazione il contenitore ha `data-fc-pronto="1"`. Dentro: `form[data-fc-form]`, bottone `[data-fc-invia]`, paragrafo errore `[data-fc-errore]`, conferma `[data-fc-conferma]`. `tests/run.sh <file-di-test>` stampa i risultati ed esce con 0 solo se tutti passano.

- [ ] **Step 1: Crea il runner dei test**

`tests/run.sh`:

```bash
#!/usr/bin/env bash
# Uso: tests/run.sh form-contatti.test.html
set -euo pipefail
cd "$(dirname "$0")/.."
PORT=8799
python3 -m http.server "$PORT" >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
sleep 1
OUT=$(chromium --headless --disable-gpu --no-sandbox --virtual-time-budget=15000 \
  --dump-dom "http://localhost:$PORT/tests/$1" 2>/dev/null)
RIS=$(printf '%s' "$OUT" | sed -n '/<pre id="risultati">/,/<\/pre>/p' | sed 's/<[^>]*>//g')
printf '%s\n' "$RIS"
printf '%s' "$RIS" | grep -q '^FINE' || { echo "ERRORE: test non completati"; exit 1; }
! printf '%s' "$RIS" | grep -q '^FAIL'
```

Run: `chmod +x tests/run.sh`

- [ ] **Step 2: Scrivi il test del form**

`tests/form-contatti.test.html`:

```html
<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><title>Test form contatti</title></head>
<body>
<pre id="risultati"></pre>

<section id="contatti"><div data-form-contatti data-titolo="Titolo di prova"><a href="/index.html#form">fallback</a></div></section>
<section id="secondo"><div data-form-contatti><a href="/index.html#form">fallback</a></div></section>

<script>
// Stub di fetch: ogni chiamata resta in sospeso finché il test non la risolve.
window.__chiamate = [];
window.fetch = function (url, opzioni) {
  return new Promise(function (resolve, reject) {
    window.__chiamate.push({ url: url, opzioni: opzioni, resolve: resolve, reject: reject });
  });
};
window.__eventi = [];
window.gtag = function () { window.__eventi.push(Array.prototype.slice.call(arguments)); };
</script>
<script src="/form-contatti.js"></script>
<script>
(function () {
  var out = document.getElementById('risultati');
  var righe = [];
  function ok(nome, cond, msg) { righe.push((cond ? 'PASS ' : 'FAIL ') + nome + (cond ? '' : ': ' + (msg || ''))); }
  function attendi() { return new Promise(function (r) { setTimeout(r, 0); }); }
  function contenitori() { return document.querySelectorAll('[data-form-contatti]'); }
  function compila(form) {
    form.querySelector('[name="Nome"]').value = 'Mario Rossi';
    form.querySelector('[name="Email"]').value = 'mario@example.com';
    form.querySelector('[name="Telefono"]').value = '3331234567';
    form.querySelector('[name="Messaggio"]').value = 'Vorrei info';
    form.querySelector('[name="Privacy"]').checked = true;
  }
  function nuovoForm(indice) {
    // Ricrea un form pulito nel contenitore `indice` per isolare i test.
    var c = contenitori()[indice];
    c.removeAttribute('data-fc-pronto');
    c.innerHTML = '<a href="/index.html#form">fallback</a>';
    window.FormContatti.inizializza();
    return c.querySelector('form[data-fc-form]');
  }

  async function esegui() {
    // 1. Rendering in entrambi i contenitori
    var forms = document.querySelectorAll('form[data-fc-form]');
    ok('rende un form per contenitore', forms.length === 2, 'trovati ' + forms.length);
    ok('segna il contenitore come pronto', contenitori()[0].getAttribute('data-fc-pronto') === '1');
    ok('titolo da data-titolo', contenitori()[0].querySelector('h2').textContent === 'Titolo di prova');
    ok('titolo di default', contenitori()[1].querySelector('h2').textContent === 'Richiedi informazioni');

    // 2. Campi esatti
    var nomi = Array.prototype.map.call(forms[0].elements, function (e) { return e.name; }).filter(Boolean).sort().join(',');
    ok('campi esatti', nomi === 'Email,Messaggio,Nome,Pagina,Privacy,Telefono,_gotcha,_subject', nomi);
    ok('obbligatori', ['Nome', 'Email', 'Telefono', 'Privacy'].every(function (n) { return forms[0].querySelector('[name="' + n + '"]').required; }));
    ok('Messaggio facoltativo', !forms[0].querySelector('[name="Messaggio"]').required);
    ok('campo Pagina', forms[0].querySelector('[name="Pagina"]').value === location.pathname);
    ok('campo _subject', forms[0].querySelector('[name="_subject"]').value === 'Nuova richiesta da ' + location.pathname);

    // 3. ID univoci e label collegate
    var check0 = forms[0].querySelector('[name="Privacy"]'), check1 = forms[1].querySelector('[name="Privacy"]');
    ok('ID checkbox univoci', check0.id && check0.id !== check1.id);
    ok('label collegata', forms[1].querySelector('label[for="' + check1.id + '"]') !== null);

    // 4. Script incluso di nuovo: nessun duplicato
    var s = document.createElement('script');
    s.src = '/form-contatti.js?bis';
    await new Promise(function (r) { s.onload = r; document.body.appendChild(s); });
    ok('nessun form duplicato', document.querySelectorAll('form[data-fc-form]').length === 2);

    // 5. Invio riuscito + doppio clic
    var f = nuovoForm(0); compila(f);
    window.__chiamate = []; window.__eventi = [];
    f.requestSubmit(); await attendi();
    var bottone = f.querySelector('[data-fc-invia]');
    ok('bottone disabilitato durante invio', bottone.disabled === true);
    ok('testo invio in corso', bottone.textContent.trim() === 'Invio in corso…', bottone.textContent);
    f.requestSubmit(); await attendi();
    ok('doppio invio bloccato', window.__chiamate.length === 1, 'chiamate ' + window.__chiamate.length);
    var c0 = window.__chiamate[0];
    ok('endpoint', c0.url === 'https://formspree.io/f/mojnkvgl');
    ok('header Accept JSON', c0.opzioni.headers.Accept === 'application/json');
    ok('body FormData con Nome', c0.opzioni.body.get('Nome') === 'Mario Rossi');
    c0.resolve({ ok: true, status: 200 }); await attendi(); await attendi();
    var conf = contenitori()[0].querySelector('[data-fc-conferma]');
    ok('conferma mostrata', conf && conf.textContent.indexOf('Grazie! Abbiamo ricevuto la tua richiesta e ti ricontatteremo al più presto.') !== -1);
    ok('form rimosso dopo successo', contenitori()[0].querySelector('form') === null);
    var ev = window.__eventi[0];
    ok('evento generate_lead', ev && ev[0] === 'event' && ev[1] === 'generate_lead' && ev[2].metodo === 'form_consulenza' && ev[2].pagina === location.pathname, JSON.stringify(ev));

    // 6. Errore HTTP (422)
    f = nuovoForm(0); compila(f);
    window.__chiamate = []; window.__eventi = [];
    f.requestSubmit(); await attendi();
    window.__chiamate[0].resolve({ ok: false, status: 422 }); await attendi(); await attendi();
    var err = f.querySelector('[data-fc-errore]');
    ok('errore visibile su 422', !err.classList.contains('hidden') && err.textContent.indexOf('Invio non riuscito') !== -1);
    ok('dati conservati su 422', f.querySelector('[name="Email"]').value === 'mario@example.com');
    ok('bottone riabilitato su 422', f.querySelector('[data-fc-invia]').disabled === false);
    ok('testo bottone ripristinato', f.querySelector('[data-fc-invia]').textContent.trim() === 'Richiedi il tuo preventivo gratuito');
    ok('nessun evento su errore', window.__eventi.length === 0);

    // 7. Errore di rete
    window.__chiamate = [];
    f.requestSubmit(); await attendi();
    ok('errore nascosto durante nuovo invio', f.querySelector('[data-fc-errore]').classList.contains('hidden'));
    window.__chiamate[0].reject(new TypeError('rete')); await attendi(); await attendi();
    ok('errore visibile su rete', !f.querySelector('[data-fc-errore]').classList.contains('hidden'));
    ok('link WhatsApp nell\'errore', f.querySelector('[data-fc-errore] a[href^="https://wa.me/393204478319"]') !== null);

    // 8. gtag assente (cookie non accettati)
    var gtagSalvato = window.gtag; delete window.gtag;
    f = nuovoForm(0); compila(f);
    window.__chiamate = [];
    var eccezione = null;
    window.addEventListener('error', function (e) { eccezione = e.message; });
    f.requestSubmit(); await attendi();
    window.__chiamate[0].resolve({ ok: true, status: 200 }); await attendi(); await attendi();
    ok('successo senza gtag', contenitori()[0].querySelector('[data-fc-conferma]') !== null && eccezione === null, eccezione);
    window.gtag = gtagSalvato;

    righe.push('FINE');
    out.textContent = righe.join('\n');
  }
  window.addEventListener('load', function () {
    esegui().catch(function (e) { righe.push('FAIL eccezione: ' + e.message); righe.push('FINE'); out.textContent = righe.join('\n'); });
  });
})();
</script>
</body>
</html>
```

- [ ] **Step 3: Esegui il test e verifica che fallisca**

Run: `tests/run.sh form-contatti.test.html; echo "exit=$?"`
Expected: righe `FAIL` (es. `FAIL rende un form per contenitore: trovati 0` oppure `FAIL eccezione: window.FormContatti is undefined`), `exit=1`.

- [ ] **Step 4: Implementa `form-contatti.js`**

```js
/*
 * Form contatti riusabile.
 * Genera il form dentro ogni <div data-form-contatti> e lo invia a Formspree
 * senza lasciare la pagina. Spec: docs/superpowers/specs/2026-09-25-cta-form-contatti-design.md
 */
(function () {
  'use strict';

  var ENDPOINT = 'https://formspree.io/f/mojnkvgl';
  var WHATSAPP = 'https://wa.me/393204478319?text=Ciao%2C%20vorrei%20informazioni';
  var TESTO_BOTTONE = 'Richiedi il tuo preventivo gratuito';
  var INPUT = 'w-full p-4 bg-surface border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition';

  // Il contatore vive su window così una seconda inclusione dello script non riusa gli ID.
  function nuovoId() {
    window.__fcContatore = (window.__fcContatore || 0) + 1;
    return 'fc-' + window.__fcContatore;
  }

  function htmlForm(id) {
    return '' +
      '<div class="max-w-xl mx-auto bg-white p-6 md:p-14 rounded-[28px] shadow-sm" data-fc-card>' +
        '<h2 class="text-2xl md:text-4xl font-semibold text-center text-ink"></h2>' +
        '<p class="text-center text-sub mb-10 mt-3 leading-relaxed">Scrivici e ti aiutiamo a scegliere l\'impianto giusto per casa, ufficio o locale. Consulenza gratuita e senza impegno.</p>' +
        '<form data-fc-form class="space-y-4">' +
          '<input type="text" name="Nome" aria-label="Nome e Cognome / Azienda" placeholder="Nome e Cognome / Azienda" autocomplete="name" class="' + INPUT + '" required>' +
          '<input type="email" name="Email" aria-label="Indirizzo Email" placeholder="Indirizzo Email" autocomplete="email" class="' + INPUT + '" required>' +
          '<input type="tel" name="Telefono" aria-label="Telefono Cellulare" placeholder="Telefono Cellulare" autocomplete="tel" class="' + INPUT + '" required>' +
          '<textarea name="Messaggio" rows="4" aria-label="Messaggio" placeholder="Scrivi qui la tua richiesta o eventuali domande..." class="' + INPUT + '"></textarea>' +
          '<div class="flex items-start gap-3 pt-1">' +
            '<input type="checkbox" name="Privacy" id="' + id + '-privacy" required class="mt-1 w-4 h-4 accent-brand cursor-pointer shrink-0">' +
            '<label for="' + id + '-privacy" class="text-sm text-sub leading-relaxed">Ho letto e accetto la <a href="/privacy.html" target="_blank" class="text-brand underline hover:no-underline">Privacy Policy</a>. Acconsento al trattamento dei miei dati personali per ricevere informazioni sui prodotti e servizi Green Water Italia.</label>' +
          '</div>' +
          '<input type="hidden" name="Pagina">' +
          '<input type="hidden" name="_subject">' +
          '<button type="submit" data-fc-invia class="w-full bg-brand text-white py-4 rounded-full font-medium text-lg hover:bg-brand-dark transition-colors disabled:opacity-60 disabled:cursor-wait">' + TESTO_BOTTONE + '</button>' +
          '<p data-fc-errore role="alert" class="hidden text-sm text-center text-red-600 leading-relaxed"></p>' +
          '<p class="text-xs text-center text-sub mt-4">I tuoi dati sono al sicuro.</p>' +
          '<input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute!important;left:-9999px!important;width:1px;height:1px;opacity:0;overflow:hidden">' +
        '</form>' +
      '</div>';
  }

  function htmlConferma() {
    return '' +
      '<div data-fc-conferma role="status" class="max-w-xl mx-auto bg-white p-6 md:p-14 rounded-[28px] shadow-sm text-center">' +
        '<h2 class="text-2xl md:text-3xl font-semibold text-ink mb-3">Richiesta inviata</h2>' +
        '<p class="text-sub leading-relaxed">Grazie! Abbiamo ricevuto la tua richiesta e ti ricontatteremo al più presto.</p>' +
        '<p class="text-sub text-sm mt-4">Hai fretta? <a href="' + WHATSAPP + '" target="_blank" rel="noopener noreferrer" class="text-brand font-medium hover:underline">Scrivici su WhatsApp</a>.</p>' +
      '</div>';
  }

  var TESTO_ERRORE = 'Invio non riuscito. Riprova tra poco oppure scrivici su ' +
    '<a href="' + WHATSAPP + '" target="_blank" rel="noopener noreferrer" class="underline">WhatsApp</a> ' +
    'o chiama il <a href="tel:+393204478319" class="underline">+39 3204478319</a>.';

  function monta(contenitore) {
    if (contenitore.getAttribute('data-fc-pronto') === '1') return;
    contenitore.setAttribute('data-fc-pronto', '1');

    contenitore.innerHTML = htmlForm(nuovoId());
    contenitore.querySelector('h2').textContent = contenitore.getAttribute('data-titolo') || 'Richiedi informazioni';

    var form = contenitore.querySelector('form[data-fc-form]');
    var pagina = window.location.pathname;
    form.querySelector('[name="Pagina"]').value = pagina;
    form.querySelector('[name="_subject"]').value = 'Nuova richiesta da ' + pagina;

    var bottone = form.querySelector('[data-fc-invia]');
    var errore = form.querySelector('[data-fc-errore]');
    var inCorso = false;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (inCorso) return;
      inCorso = true;
      bottone.disabled = true;
      bottone.textContent = 'Invio in corso…';
      errore.classList.add('hidden');

      fetch(ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (risposta) {
        if (!risposta.ok) throw new Error('HTTP ' + risposta.status);
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'generate_lead', { metodo: 'form_consulenza', pagina: pagina });
        }
        contenitore.innerHTML = htmlConferma();
      }).catch(function () {
        errore.innerHTML = TESTO_ERRORE;
        errore.classList.remove('hidden');
        bottone.disabled = false;
        bottone.textContent = TESTO_BOTTONE;
        inCorso = false;
      });
    });
  }

  function inizializza() {
    var contenitori = document.querySelectorAll('[data-form-contatti]');
    for (var i = 0; i < contenitori.length; i++) monta(contenitori[i]);
  }

  window.FormContatti = { inizializza: inizializza };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inizializza);
  } else {
    inizializza();
  }
})();
```

- [ ] **Step 5: Esegui il test e verifica che passi**

Run: `tests/run.sh form-contatti.test.html; echo "exit=$?"`
Expected: tutte le righe `PASS …`, ultima riga `FINE`, `exit=0`.

- [ ] **Step 6: Tailwind legge i file JS e i test non vanno in produzione**

In `tailwind.config.js` sostituisci:

```js
  content: [
    "./*.html",
    "./blog/*.html"
  ],
```

con:

```js
  content: [
    "./*.html",
    "./blog/*.html",
    "./*.js"
  ],
```

Crea `.vercelignore`:

```
tests
```

Run: `node node_modules/tailwindcss/lib/cli.js -i src/input.css -o dist/styles.css --minify && grep -c 'disabled\\:opacity-60' dist/styles.css`
Expected: `Done in …` e poi `1`.

- [ ] **Step 7: Commit**

```bash
git -c core.fileMode=false add form-contatti.js tests/run.sh tests/form-contatti.test.html .vercelignore tailwind.config.js dist/styles.css
git commit -m "feat: aggiungi form contatti riusabile con invio via fetch"
```

---

### Task 2: `barra-mobile.js` con test

**Files:**
- Create: `barra-mobile.js`
- Create: `tests/barra-mobile.test.html`
- Create: `tests/barra-mobile-senza-form.test.html`
- Modify: `docs/superpowers/specs/2026-09-25-cta-form-contatti-design.md` (sezione `barra-mobile.js`, ultimo punto)

**Interfaces:**
- Consumes: il contratto `[data-form-contatti]` del Task 1 (solo per trovare la sezione di destinazione; non chiama `FormContatti`).
- Produces: `nav[data-barra-mobile]` con tre `a[data-azione]` (`telefono`, `whatsapp`, `preventivo`); classi `pb-16 md:pb-0` sul `body`.

- [ ] **Step 1: Scrivi i test della barra**

`tests/barra-mobile.test.html`:

```html
<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><title>Test barra mobile</title></head>
<body>
<pre id="risultati"></pre>
<a href="https://wa.me/393204478319" aria-label="Contattaci su WhatsApp" class="fixed bottom-6 right-6 z-50 flex items-center">bolla</a>
<section id="contatti"><div data-form-contatti></div></section>
<script>
window.__eventi = [];
window.gtag = function () { window.__eventi.push(Array.prototype.slice.call(arguments)); };
// Come lo snippet di tracciamento WhatsApp già presente nelle pagine.
window.__documento = 0;
document.addEventListener('click', function (e) { if (e.target.closest('a[href*="wa.me"]')) window.__documento++; });
// Evita la navigazione durante i test.
window.addEventListener('click', function (e) { if (e.target.closest('a')) e.preventDefault(); }, true);
</script>
<script src="/barra-mobile.js"></script>
<script src="/barra-mobile.js?bis"></script>
<script>
window.addEventListener('load', function () {
  var righe = [];
  function ok(n, c, m) { righe.push((c ? 'PASS ' : 'FAIL ') + n + (c ? '' : ': ' + (m || ''))); }
  var barre = document.querySelectorAll('[data-barra-mobile]');
  ok('una sola barra', barre.length === 1, 'trovate ' + barre.length);
  var b = barre[0];
  ok('solo mobile', b.classList.contains('md:hidden') && b.classList.contains('fixed') && b.classList.contains('z-40'));
  var tel = b.querySelector('[data-azione="telefono"]'), wa = b.querySelector('[data-azione="whatsapp"]'), pr = b.querySelector('[data-azione="preventivo"]');
  ok('link telefono', tel && tel.getAttribute('href') === 'tel:+393204478319');
  ok('link whatsapp', wa && wa.getAttribute('href').indexOf('https://wa.me/393204478319') === 0);
  ok('preventivo verso sezione della pagina', pr && pr.getAttribute('href') === '#contatti', pr && pr.getAttribute('href'));
  ok('padding body', document.body.classList.contains('pb-16') && document.body.classList.contains('md:pb-0'));
  var bolla = document.querySelector('a[aria-label="Contattaci su WhatsApp"]');
  ok('bolla solo desktop', bolla.classList.contains('hidden') && bolla.classList.contains('md:flex') && !bolla.classList.contains('flex'));
  window.__eventi = [];
  wa.click(); tel.click(); pr.click();
  var nomi = window.__eventi.map(function (e) { return e[1] + ':' + e[2].posizione; }).join(',');
  ok('eventi barra', nomi === 'click_whatsapp:barra_mobile,click_telefono:barra_mobile,click_preventivo:barra_mobile', nomi);
  ok('nessun doppio conteggio whatsapp', window.__documento === 0, 'listener documento chiamato ' + window.__documento);
  delete window.gtag;
  var eccezione = null;
  window.addEventListener('error', function (e) { eccezione = e.message; });
  wa.click();
  ok('click senza gtag', eccezione === null, eccezione);
  righe.push('FINE');
  document.getElementById('risultati').textContent = righe.join('\n');
});
</script>
</body>
</html>
```

`tests/barra-mobile-senza-form.test.html`:

```html
<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><title>Test barra mobile senza form</title></head>
<body>
<pre id="risultati"></pre>
<script src="/barra-mobile.js"></script>
<script>
window.addEventListener('load', function () {
  var pr = document.querySelector('[data-barra-mobile] [data-azione="preventivo"]');
  var ok = pr && pr.getAttribute('href') === '/index.html#form';
  document.getElementById('risultati').textContent =
    (ok ? 'PASS' : 'FAIL') + ' preventivo verso la home senza form' + (ok ? '' : ': ' + (pr && pr.getAttribute('href'))) + '\nFINE';
});
</script>
</body>
</html>
```

- [ ] **Step 2: Esegui i test e verifica che falliscano**

Run: `tests/run.sh barra-mobile.test.html; echo "exit=$?"; tests/run.sh barra-mobile-senza-form.test.html; echo "exit=$?"`
Expected: `FAIL una sola barra: trovate 0` … e `exit=1` per entrambi.

- [ ] **Step 3: Implementa `barra-mobile.js`**

```js
/*
 * Barra CTA fissa su smartphone: Chiama · WhatsApp · Preventivo.
 * Spec: docs/superpowers/specs/2026-09-25-cta-form-contatti-design.md
 */
(function () {
  'use strict';

  function crea() {
    if (document.querySelector('[data-barra-mobile]')) return;

    // "Preventivo" porta al form della pagina se esiste, altrimenti a quello della home.
    var contenitore = document.querySelector('[data-form-contatti]');
    var sezione = contenitore && contenitore.closest('[id]');
    var preventivo = sezione ? '#' + sezione.id : '/index.html#form';

    var link = 'flex flex-col items-center justify-center gap-0.5 h-16 text-xs font-medium';
    var barra = document.createElement('nav');
    barra.setAttribute('data-barra-mobile', '');
    barra.setAttribute('aria-label', 'Contatti rapidi');
    barra.className = 'md:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-3 bg-white border-t border-line shadow-[0_-4px_16px_rgba(0,0,0,0.06)]';
    barra.innerHTML = '' +
      '<a href="tel:+393204478319" data-azione="telefono" class="' + link + ' text-ink">' +
        '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>' +
        'Chiama</a>' +
      '<a href="https://wa.me/393204478319?text=Ciao%2C%20vorrei%20informazioni" target="_blank" rel="noopener noreferrer" data-azione="whatsapp" class="' + link + ' text-[#128C7E]">' +
        '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0012.05 0zm0 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884z"/></svg>' +
        'WhatsApp</a>' +
      '<a href="' + preventivo + '" data-azione="preventivo" class="' + link + ' bg-brand text-white">' +
        '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>' +
        'Preventivo</a>';

    // Traccia i click della barra e ferma la propagazione: lo snippet WhatsApp
    // già presente nelle pagine ascolta sul document e li conterebbe due volte.
    barra.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-azione]');
      if (!a) return;
      e.stopPropagation();
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'click_' + a.getAttribute('data-azione'), { posizione: 'barra_mobile' });
      }
    });

    document.body.appendChild(barra);
    document.body.classList.add('pb-16', 'md:pb-0');

    // Su smartphone la barra sostituisce la bolla WhatsApp, che resta su desktop.
    var bolla = document.querySelector('a[aria-label="Contattaci su WhatsApp"]');
    if (bolla) {
      bolla.classList.remove('flex');
      bolla.classList.add('hidden', 'md:flex');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', crea);
  } else {
    crea();
  }
})();
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `tests/run.sh barra-mobile.test.html; echo "exit=$?"; tests/run.sh barra-mobile-senza-form.test.html; echo "exit=$?"`
Expected: tutte `PASS`, `FINE`, `exit=0` per entrambi.

- [ ] **Step 5: Allinea la spec**

Nel file spec, sezione `### 2. barra-mobile.js`, sostituisci il punto:

```
- La barra ha l'attributo `data-barra-mobile`. Lo snippet di
  tracciamento WhatsApp esistente viene aggiornato per ignorare i click
  dentro `[data-barra-mobile]`, evitando il doppio conteggio.
```

con:

```
- La barra ha l'attributo `data-barra-mobile` e ferma la propagazione
  dei propri click (`stopPropagation`), così lo snippet di tracciamento
  WhatsApp esistente, che ascolta sul `document`, non li conta due
  volte. Lo snippet non viene modificato.
```

- [ ] **Step 6: Rebuild CSS e commit**

Run: `node node_modules/tailwindcss/lib/cli.js -i src/input.css -o dist/styles.css --minify && grep -c 'pb-16' dist/styles.css`
Expected: `Done in …` e un numero ≥ 1.

```bash
git -c core.fileMode=false add barra-mobile.js tests/barra-mobile.test.html tests/barra-mobile-senza-form.test.html dist/styles.css docs/superpowers/specs/2026-09-25-cta-form-contatti-design.md
git commit -m "feat: aggiungi barra CTA fissa su smartphone"
```

---

### Task 3: Home — sostituzione del form esistente

**Files:**
- Modify: `index.html` — sezione `<section id="form" …>` (circa righe 1133-1160) e blocco script `lead-form` (circa righe 1509-1519)

**Interfaces:**
- Consumes: `form-contatti.js` (contratto `data-form-contatti`), `barra-mobile.js`.
- Produces: sezione `#form` con contenitore; i 101 link `index.html#form` del sito continuano a funzionare.

- [ ] **Step 1: Verifica lo stato di partenza**

Run: `grep -c 'id="lead-form"' index.html; grep -c 'data-form-contatti' index.html`
Expected: `1` e `0`.

- [ ] **Step 2: Sostituisci il form con il contenitore**

Esegui:

```bash
python3 - <<'EOF'
import re
f = 'index.html'
t = open(f).read()
sezione = re.search(r'    <section id="form" class="py-16 md:py-28 bg-surface px-6">.*?</section>\n', t, re.S)
assert sezione, 'sezione form non trovata'
nuova = '''    <section id="form" class="py-16 md:py-28 bg-surface px-6 scroll-mt-24">
        <div data-form-contatti>
            <p class="text-center text-sub">Scrivici a <a href="mailto:commercialegreenwater@protonmail.com" class="text-brand underline">commercialegreenwater@protonmail.com</a> o chiama il <a href="tel:+393204478319" class="text-brand underline">+39 3204478319</a>.</p>
        </div>
    </section>
'''
t = t.replace(sezione.group(0), nuova)
vecchio = '''    <script>
    (function() {
        var leadForm = document.getElementById('lead-form');
        if (leadForm) {
            leadForm.addEventListener('submit', function() {
                if (typeof gtag === 'function') {
                    gtag('event', 'generate_lead', { metodo: 'form_consulenza' });
                }
            });
        }
    })();
    </script>
'''
assert t.count(vecchio) == 1, 'listener lead-form non trovato'
t = t.replace(vecchio, '    <script src="/form-contatti.js" defer></script>\n    <script src="/barra-mobile.js" defer></script>\n')
open(f, 'w').write(t)
EOF
```

- [ ] **Step 3: Verifica**

Run: `grep -c 'lead-form' index.html; grep -c 'data-form-contatti' index.html; grep -c 'src="/form-contatti.js"' index.html; grep -c 'src="/barra-mobile.js"' index.html`
Expected: `0`, `1`, `1`, `1`.

Run (screenshot desktop e mobile della sezione):

```bash
S=$(mktemp -d); (python3 -m http.server 8765 >/dev/null 2>&1 &); sleep 1
chromium --headless --disable-gpu --no-sandbox --hide-scrollbars --window-size=1280,900 --virtual-time-budget=3000 --screenshot=$S/home-desktop.png "http://localhost:8765/index.html#form" 2>/dev/null
chromium --headless --disable-gpu --no-sandbox --hide-scrollbars --window-size=390,844 --virtual-time-budget=3000 --screenshot=$S/home-mobile.png "http://localhost:8765/index.html#form" 2>/dev/null
pkill -f "http.server 8765"; echo $S
```

Expected: aprendo i due PNG si vede la card "Richiedi informazioni" con i 4 campi e la checkbox; su mobile la barra Chiama · WhatsApp · Preventivo in basso e nessuna bolla WhatsApp.

- [ ] **Step 4: Commit**

```bash
git -c core.fileMode=false add index.html
git commit -m "feat: usa il form contatti riusabile in home"
```

---

### Task 4: Form in fondo alle pagine di contenuto e agli articoli del blog

**Files:**
- Modify (17): `privati.html`, `prodotti.html`, `erogatore-boccioni.html`, `erogatore-rete-idrica.html`, `acqua-milano.html`, `acqua-napoli.html`, `acqua-padova.html`, `acqua-roma.html`, `acqua-torino.html`, `acqua-bambini-famiglia.html`, `contaminanti-acqua.html`, `guida-osmosi-inversa.html`, `faq.html`, `glossario.html`, `residuo-fisso-acque-in-bottiglia.html`, `chi-siamo.html`, `blog/index.html`
- Modify (32): tutti i `blog/*.html` tranne `blog/index.html` (lo script dello Step 2 esce con errore se i conteggi non sono 17 e 32)
- Modify: `dist/styles.css` (rebuild)

**Interfaces:**
- Consumes: `form-contatti.js`, `barra-mobile.js`.
- Produces: in ogni pagina `<section id="contatti" …><div data-form-contatti>…</div></section>` subito prima del primo `<footer`, i due script prima di `</body>`, nessun link `#form` residuo.

- [ ] **Step 1: Verifica lo stato di partenza**

Run: `grep -l 'data-form-contatti' *.html blog/*.html`
Expected: solo `index.html`.

- [ ] **Step 2: Inserisci sezione, script e aggiorna i link**

```bash
python3 - <<'EOF'
import glob, re
root = ['privati.html', 'prodotti.html', 'erogatore-boccioni.html', 'erogatore-rete-idrica.html',
        'acqua-milano.html', 'acqua-napoli.html', 'acqua-padova.html', 'acqua-roma.html', 'acqua-torino.html',
        'acqua-bambini-famiglia.html', 'contaminanti-acqua.html', 'guida-osmosi-inversa.html', 'faq.html',
        'glossario.html', 'residuo-fisso-acque-in-bottiglia.html', 'chi-siamo.html', 'blog/index.html']
articoli = sorted(f for f in glob.glob('blog/*.html') if f != 'blog/index.html')
assert len(root) == 17 and len(articoli) == 32, (len(root), len(articoli))

SEZIONE = '''<section id="contatti" class="py-16 md:py-24 bg-surface px-6 scroll-mt-24">
    <div data-form-contatti>
        <p class="text-center"><a href="/index.html#form" class="inline-flex bg-brand text-white px-8 py-3.5 rounded-full font-medium hover:bg-brand-dark transition-colors">Richiedi informazioni</a></p>
    </div>
</section>

'''
SCRIPT = '<script src="/form-contatti.js" defer></script>\n<script src="/barra-mobile.js" defer></script>\n'
LINK = re.compile(r'href="(?:\.\./|/)?(?:index\.html)?#form"')

for f in root + articoli:
    t = open(f).read()
    assert 'data-form-contatti' not in t, f + ': già presente'
    # Prima i link, poi la sezione: così il link di fallback dentro la sezione resta /index.html#form.
    t, n = LINK.subn('href="#contatti"', t)
    i = t.index('<footer')
    riga = t.rfind('\n', 0, i) + 1          # inizio della riga del footer, per non spezzare l'indentazione
    t = t[:riga] + SEZIONE + t[riga:]
    j = t.rindex('</body>')
    t = t[:j] + SCRIPT + t[j:]
    open(f, 'w').write(t)
    print(f, 'link aggiornati:', n)
EOF
```

- [ ] **Step 3: Verifica con grep**

Run:

```bash
for f in $(grep -l 'data-form-contatti' *.html blog/*.html | grep -v '^index.html$'); do
  printf '%s sez=%s js=%s bar=%s formlink=%s\n' "$f" \
    "$(grep -c 'id="contatti"' "$f")" "$(grep -c 'src="/form-contatti.js"' "$f")" \
    "$(grep -c 'src="/barra-mobile.js"' "$f")" "$(grep -oE 'href="(\.\./|/)?(index\.html)?#form"' "$f" | wc -l)"
done | grep -v 'sez=1 js=1 bar=1 formlink=1$'
echo "pagine con form: $(grep -l 'data-form-contatti' *.html blog/*.html | wc -l)"
```

Expected: nessuna riga stampata dal ciclo (ogni pagina ha esattamente una sezione, i due script e un solo link `#form`, cioè il fallback dentro il contenitore); poi `pagine con form: 50` (17 + 32 + home).

- [ ] **Step 4: Rebuild CSS e commit**

Run: `node node_modules/tailwindcss/lib/cli.js -i src/input.css -o dist/styles.css --minify && grep -c 'scroll-mt-24' dist/styles.css`
Expected: `Done in …` e `1`.

```bash
git -c core.fileMode=false add $(grep -l 'data-form-contatti' *.html blog/*.html) dist/styles.css
git commit -m "feat: aggiungi form contatti e barra mobile a pagine di contenuto e blog"
```

---

### Task 5: Verifica visiva, invio reale e pubblicazione

**Files:** nessuna modifica prevista (solo correzioni se la verifica trova problemi).

**Interfaces:**
- Consumes: tutto quanto sopra.
- Produces: sito pubblicato su `origin/main`.

- [ ] **Step 1: Rilancia tutti i test**

Run: `for t in form-contatti barra-mobile barra-mobile-senza-form; do tests/run.sh $t.test.html >/dev/null && echo "$t ok" || echo "$t FALLITO"; done`
Expected: `form-contatti ok`, `barra-mobile ok`, `barra-mobile-senza-form ok`.

- [ ] **Step 2: Screenshot delle pagine campione**

```bash
S=$(mktemp -d); (python3 -m http.server 8765 >/dev/null 2>&1 &); sleep 1
for p in privati.html erogatore-rete-idrica.html acqua-milano.html blog/depuratore-acqua-casa.html chi-siamo.html; do
  n=$(echo $p | tr '/' '_')
  chromium --headless --disable-gpu --no-sandbox --hide-scrollbars --window-size=1280,900 --virtual-time-budget=3000 --screenshot=$S/$n-desk.png "http://localhost:8765/$p#contatti" 2>/dev/null
  chromium --headless --disable-gpu --no-sandbox --hide-scrollbars --window-size=390,844 --virtual-time-budget=3000 --screenshot=$S/$n-mob.png "http://localhost:8765/$p#contatti" 2>/dev/null
done
pkill -f "http.server 8765"; echo $S
```

Expected, aprendo i PNG:
- il titolo "Richiedi informazioni" è visibile sotto l'header fisso (non coperto);
- su mobile la barra in basso non copre i campi né il footer; il banner cookie, se presente, sta sopra la barra;
- su desktop nessuna barra e la bolla WhatsApp è presente.

Se l'header copre il titolo, aumenta `scroll-mt-24` a `scroll-mt-28` nelle sezioni `#contatti` e `#form`, rebuild CSS, ripeti.

- [ ] **Step 3: Invio reale (solo con l'ok del titolare)**

Chiedi al titolare l'autorizzazione. Se concessa: servi il sito (`python3 -m http.server 8765`), apri `http://localhost:8765/privati.html#contatti` in un browser, compila con Nome "TEST sito", un'email aziendale, telefono e messaggio "Test form nuovo, ignorare", invia.
Expected: messaggio "Grazie! Abbiamo ricevuto la tua richiesta…"; email Formspree con oggetto "Nuova richiesta da /privati.html" e campo `Pagina: /privati.html`.

Nota: Formspree può rifiutare invii da `localhost` se il dominio è limitato nelle impostazioni del form; in quel caso fai il test dopo il push, sul sito pubblicato.

- [ ] **Step 4: Push**

```bash
git status -sb | head -1
git push origin main
```

Expected: `main -> main` senza errori.
