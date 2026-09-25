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
