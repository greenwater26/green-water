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
