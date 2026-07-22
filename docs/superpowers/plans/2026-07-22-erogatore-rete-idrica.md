# Erogatore a Rete Idrica — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fourth product category, "Erogatore a rete idrica", as a standalone page (`erogatore-rete-idrica.html`), and make it discoverable from the Prodotti menu on every page of the site that currently links to Casa/Uffici/Ufficio (boccioni).

**Architecture:** Static HTML/Tailwind site, no build step beyond `npm run build:css` (Tailwind purges classes from `*.html` and `blog/*.html`). The new page reuses the exact chrome (nav/footer/cookie-banner/card-component markup) already live on `erogatore-boccioni.html`, extended from 3 to 4 Prodotti-menu items. Site-wide nav updates are pure HTML edits — no JS logic changes.

**Tech Stack:** HTML, Tailwind CSS (compiled via `tailwindcss` CLI into `dist/styles.css`), vanilla JS (already present, no new JS needed).

**Environment note:** `npm run build:css` does not work as-written on this Windows checkout (`node_modules/.bin/*` are non-Windows stub files). Use `node node_modules/tailwindcss/lib/cli.js -i ./src/input.css -o ./dist/styles.css --minify` instead — same tool, same output.

## Global Constraints

- No price/canone figure is shown anywhere on the new page. CTAs are "Richiedi preventivo" / "Richiedi info" / WhatsApp only. The `Product` JSON-LD has no `offers` block.
- The GAS (frizzante) version has **identical technical specs** to the AC version — do not invent numbers for it. The only stated difference is "bombola CO2 e carbonatore" for sparkling water.
- Filter change + sanitization happens **once a year** (not twice, not once per 48 months) — this exact frequency must appear correctly everywhere it's mentioned (product card, come funziona, vantaggi, cosa include, FAQ).
- Spec source of truth: `docs/superpowers/specs/2026-07-22-erogatore-rete-idrica-design.md`.
- Site convention: every root-level HTML page shares the same `<nav>`/footer/cookie-banner/WhatsApp-bubble chrome; blog pages under `blog/` use `../` relative paths instead of bare relative paths.
- After all HTML edits are done, run the CSS build (see Environment note above) once (final task) to regenerate `dist/styles.css`.

---

## Reference content (used verbatim across multiple tasks)

### A. New 4th desktop dropdown item (append after the existing "Ufficio → Erogatore a boccioni" item, before the dropdown's closing `</div>`)

8-space base indentation (matches `prodotti.html` and `erogatore-boccioni.html`'s existing dropdown items exactly — see each task for the file-specific indentation used):

```html
                    <a href="erogatore-rete-idrica.html" class="flex items-start gap-2.5 px-4 py-3 text-sm text-sub hover:bg-surface hover:text-brand transition-colors rounded-xl mx-1">
                        <svg class="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2.25c-4.5 6-7.5 10.5-7.5 13.5a7.5 7.5 0 0015 0c0-3-3-7.5-7.5-13.5z"/></svg>
                        <span class="flex flex-col leading-tight">
                            <span class="font-medium">Ufficio</span>
                            <span class="text-xs opacity-70">Erogatore a rete idrica</span>
                        </span>
                    </a>
```

### B. New 4th mobile submenu item (append after the existing "Ufficio → Erogatore a boccioni" item, before the submenu's closing `</div>`)

8-space base indentation:

```html
                <a href="erogatore-rete-idrica.html" class="mobile-link flex items-start gap-2 text-base text-sub hover:text-brand transition-colors">
                    <svg class="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2.25c-4.5 6-7.5 10.5-7.5 13.5a7.5 7.5 0 0015 0c0-3-3-7.5-7.5-13.5z"/></svg>
                    <span class="flex flex-col text-center leading-tight">
                        <span class="font-medium">Ufficio</span>
                        <span class="text-xs opacity-70">Erogatore a rete idrica</span>
                    </span>
                </a>
```

### C. Footer nav — renamed + new line (replaces the single existing "↳ Ufficio" line)

Bare-relative variant (used in `index.html`, `prodotti.html`, `erogatore-boccioni.html`):

```html
            <a href="erogatore-boccioni.html" class="hover:text-brand transition-colors pl-3 text-xs">↳ Ufficio – boccioni</a>
            <a href="erogatore-rete-idrica.html" class="hover:text-brand transition-colors pl-3 text-xs">↳ Ufficio – rete idrica</a>
```

Leading-slash variant (used in the 13 root Group-B pages + `blog/index.html`):

```html
            <a href="/erogatore-boccioni.html" class="hover:text-brand transition-colors pl-3 text-xs">↳ Ufficio – boccioni</a>
            <a href="/erogatore-rete-idrica.html" class="hover:text-brand transition-colors pl-3 text-xs">↳ Ufficio – rete idrica</a>
```

`../`-relative peer-link variant (used in the 4 blog articles, no `↳` arrow, no "Prodotti" parent label):

```html
                        <a href="../erogatore-boccioni.html" class="hover:text-white transition-colors">Ufficio – boccioni</a>
                        <a href="../erogatore-rete-idrica.html" class="hover:text-white transition-colors">Ufficio – rete idrica</a>
```

---

## Task 1: Scaffold `erogatore-rete-idrica.html` — head, nav (4 items), hero

**Files:**
- Create: `erogatore-rete-idrica.html`

**Interfaces:**
- Produces: a complete HTML file with `<head>`, full 4-item nav (desktop dropdown + mobile submenu, using Reference A/B above already merged into a 4-item list alongside Casa/Uffici/Ufficio-boccioni), and hero section. Later tasks (2–5) insert `<main>` content and footer/scripts.
- Consumes: nothing (first task). Unlike the original `erogatore-boccioni.html` build (which started with 2 items and was upgraded to 3 in a later task), this page is created fresh with the **final 4-item nav already in place** — there is no separate "upgrade nav" step for this file.

- [ ] **Step 1: Write the file**

Create `erogatore-rete-idrica.html` with this content:

```html
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Erogatore a Rete Idrica per Ufficio a Noleggio | Green Water Italia</title>
    <meta name="description" content="Refrigeratore GREENQUALITY a rete idrica in noleggio per l'ufficio: acqua naturale e fredda (anche frizzante nella versione GAS), senza boccioni da sostituire. Installazione e manutenzione incluse nel canone.">
    <link rel="canonical" href="https://www.greenwateritalia.it/erogatore-rete-idrica.html">
    <link rel="alternate" hreflang="it" href="https://www.greenwateritalia.it/erogatore-rete-idrica.html">
    <link rel="alternate" hreflang="x-default" href="https://www.greenwateritalia.it/erogatore-rete-idrica.html">
    <link rel="preload" as="image" href="/logo.webp" fetchpriority="high">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Erogatore a Rete Idrica per Ufficio a Noleggio | Green Water Italia">
    <meta property="og:description" content="Acqua naturale e fredda in ufficio direttamente dalla rete idrica: refrigeratore GREENQUALITY in noleggio, con installazione e manutenzione incluse.">
    <meta property="og:url" content="https://www.greenwateritalia.it/erogatore-rete-idrica.html">
    <meta property="og:site_name" content="Green Water Italia">
    <meta property="og:locale" content="it_IT">
    <meta property="og:image" content="https://www.greenwateritalia.it/logo.webp">
    <meta name="theme-color" content="#2596be">
    <link rel="manifest" href="/manifest.json">
    <link rel="stylesheet" href="/dist/styles.css">
    <style>
        html { -webkit-font-smoothing: antialiased; scroll-behavior: smooth; }
        body { letter-spacing: -0.01em; }
        h1,h2,h3 { letter-spacing: -0.025em; }
        .apple-blur { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
    </style>
</head>
<body class="bg-white font-sans text-ink antialiased">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-brand focus:text-white focus:px-4 focus:py-2 focus:rounded-full focus:font-medium focus:text-sm">Salta al contenuto</a>

<!-- ── NAV ─────────────────────────────────────────────────────────── -->
<nav class="px-6 py-3 bg-white/70 apple-blur border-b border-black/5 flex justify-between items-center fixed w-full top-0 z-50">
    <div class="flex items-center gap-3">
        <a href="index.html">
            <img src="logo.webp" alt="Green Water Italia Logo" class="h-9" width="36" height="36" loading="eager" onerror="this.style.display='none'">
        </a>
        <a href="index.html" class="text-lg font-semibold text-ink tracking-tight hidden md:block">GREEN WATER ITALIA</a>
    </div>

    <!-- Desktop links -->
    <div class="hidden md:flex items-center gap-8 text-sm font-medium text-sub">
        <a href="index.html#vantaggi" class="hover:text-ink transition-colors">Vantaggi</a>

        <!-- Prodotti dropdown -->
        <div class="relative group">
            <button class="flex items-center gap-1 hover:text-ink transition-colors font-medium text-brand">
                Prodotti
                <svg class="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
                </svg>
            </button>
            <div class="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div class="bg-white rounded-2xl shadow-xl border border-line/60 py-2 min-w-[240px]">
                    <a href="prodotti.html#casa" class="flex items-start gap-2.5 px-4 py-3 text-sm text-sub hover:bg-surface hover:text-brand transition-colors rounded-xl mx-1">
                        <svg class="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
                        <span class="flex flex-col leading-tight">
                            <span class="font-medium">Casa</span>
                            <span class="text-xs opacity-70">Sistemi di filtrazione a osmosi inversa</span>
                        </span>
                    </a>
                    <a href="prodotti.html#uffici" class="flex items-start gap-2.5 px-4 py-3 text-sm text-sub hover:bg-surface hover:text-brand transition-colors rounded-xl mx-1">
                        <svg class="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/></svg>
                        <span class="flex flex-col leading-tight">
                            <span class="font-medium">Uffici / HoReCa</span>
                            <span class="text-xs opacity-70">Sistemi di filtrazione</span>
                        </span>
                    </a>
                    <a href="erogatore-boccioni.html" class="flex items-start gap-2.5 px-4 py-3 text-sm text-sub hover:bg-surface hover:text-brand transition-colors rounded-xl mx-1">
                        <svg class="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5m4.75-11.396c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>
                        <span class="flex flex-col leading-tight">
                            <span class="font-medium">Ufficio</span>
                            <span class="text-xs opacity-70">Erogatore a boccioni</span>
                        </span>
                    </a>
                    <a href="erogatore-rete-idrica.html" class="flex items-start gap-2.5 px-4 py-3 text-sm text-sub hover:bg-surface hover:text-brand transition-colors rounded-xl mx-1">
                        <svg class="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2.25c-4.5 6-7.5 10.5-7.5 13.5a7.5 7.5 0 0015 0c0-3-3-7.5-7.5-13.5z"/></svg>
                        <span class="flex flex-col leading-tight">
                            <span class="font-medium">Ufficio</span>
                            <span class="text-xs opacity-70">Erogatore a rete idrica</span>
                        </span>
                    </a>
                </div>
            </div>
        </div>

        <a href="index.html#recensioni" class="hover:text-ink transition-colors">Dicono di noi</a>
        <a href="index.html#faq" class="hover:text-ink transition-colors">FAQ</a>
        <a href="blog/index.html" class="hover:text-ink transition-colors">Blog</a>
        <a href="glossario.html" class="hover:text-ink transition-colors">Glossario</a>
        <a href="chi-siamo.html" class="hover:text-ink transition-colors">Chi siamo</a>
        <a href="index.html#guide-gratuite" class="flex items-center gap-1.5 font-medium text-brand hover:text-brand-dark transition-colors"><svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>Guide gratuite</a>
        <a href="index.html#form" class="bg-brand text-white px-5 py-2 rounded-full font-medium hover:bg-brand-dark transition-colors">Prenota una consulenza gratuita</a>
    </div>

    <!-- Mobile hamburger -->
    <div class="md:hidden flex items-center">
        <button id="mobile-menu-btn" class="text-ink hover:text-brand focus:outline-none">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
        </button>
    </div>
</nav>

<!-- Mobile menu -->
<div id="mobile-menu" class="hidden fixed top-[57px] left-0 w-full bg-white/95 apple-blur shadow-lg z-40 md:hidden border-t border-black/5 overflow-y-auto max-h-[calc(100vh-57px)]">
    <div class="flex flex-col items-center py-8 font-medium text-sub space-y-5">
        <a href="index.html#vantaggi" class="hover:text-ink transition-colors text-lg mobile-link">Vantaggi</a>

        <!-- Prodotti expandable -->
        <div class="w-full px-8">
            <button id="mobile-prodotti-btn" class="w-full flex items-center justify-center gap-2 text-lg text-brand font-medium">
                Prodotti
                <svg id="mobile-prodotti-arrow" class="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
                </svg>
            </button>
            <div id="mobile-prodotti-sub" class="hidden flex flex-col items-center gap-4 mt-4 pb-1">
                <a href="prodotti.html#casa" class="mobile-link flex items-start gap-2 text-base text-sub hover:text-brand transition-colors">
                    <svg class="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
                    <span class="flex flex-col text-center leading-tight">
                        <span class="font-medium">Casa</span>
                        <span class="text-xs opacity-70">Sistemi di filtrazione a osmosi inversa</span>
                    </span>
                </a>
                <a href="prodotti.html#uffici" class="mobile-link flex items-start gap-2 text-base text-sub hover:text-brand transition-colors">
                    <svg class="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/></svg>
                    <span class="flex flex-col text-center leading-tight">
                        <span class="font-medium">Uffici / HoReCa</span>
                        <span class="text-xs opacity-70">Sistemi di filtrazione</span>
                    </span>
                </a>
                <a href="erogatore-boccioni.html" class="mobile-link flex items-start gap-2 text-base text-sub hover:text-brand transition-colors">
                    <svg class="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5m4.75-11.396c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>
                    <span class="flex flex-col text-center leading-tight">
                        <span class="font-medium">Ufficio</span>
                        <span class="text-xs opacity-70">Erogatore a boccioni</span>
                    </span>
                </a>
                <a href="erogatore-rete-idrica.html" class="mobile-link flex items-start gap-2 text-base text-sub hover:text-brand transition-colors">
                    <svg class="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2.25c-4.5 6-7.5 10.5-7.5 13.5a7.5 7.5 0 0015 0c0-3-3-7.5-7.5-13.5z"/></svg>
                    <span class="flex flex-col text-center leading-tight">
                        <span class="font-medium">Ufficio</span>
                        <span class="text-xs opacity-70">Erogatore a rete idrica</span>
                    </span>
                </a>
            </div>
        </div>

        <a href="index.html#recensioni" class="hover:text-ink transition-colors text-lg mobile-link">Dicono di noi</a>
        <a href="index.html#faq" class="hover:text-ink transition-colors text-lg mobile-link">FAQ</a>
        <a href="blog/index.html" class="hover:text-ink transition-colors text-lg mobile-link">Blog</a>
        <a href="glossario.html" class="hover:text-ink transition-colors text-lg mobile-link">Glossario</a>
        <a href="chi-siamo.html" class="hover:text-ink transition-colors text-lg mobile-link">Chi siamo</a>
        <a href="index.html#guide-gratuite" class="flex items-center gap-2 text-lg font-semibold text-brand hover:text-brand-dark transition-colors mobile-link"><svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>Guide gratuite</a>
        <a href="index.html#form" class="bg-brand text-white px-8 py-3 rounded-full font-medium hover:bg-brand-dark transition-colors mobile-link">Prenota una consulenza gratuita</a>
    </div>
</div>

<!-- ── HERO ──────────────────────────────────────────────────────────── -->
<header class="pt-28 pb-12 md:pt-36 md:pb-16 px-6 text-center bg-gradient-to-b from-white via-brand-light/40 to-white">
    <nav class="text-xs text-sub mb-6 flex items-center gap-1.5 justify-center flex-wrap">
        <a href="index.html" class="hover:text-brand transition-colors">Home</a>
        <span>/</span>
        <a href="prodotti.html" class="hover:text-brand transition-colors">Prodotti</a>
        <span>/</span>
        <span class="text-ink">Erogatore a rete idrica</span>
    </nav>
    <h1 class="text-4xl md:text-5xl lg:text-6xl font-semibold text-ink mb-4 leading-tight">Erogatore a rete idrica per ufficio, a noleggio</h1>
    <p class="text-sub text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">Acqua naturale e fredda erogata direttamente dalla rete idrica, con installazione e manutenzione incluse nel canone di noleggio.</p>

    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
        <a href="index.html#form" class="inline-flex items-center justify-center gap-2 bg-brand text-white px-8 py-3.5 rounded-full font-medium hover:bg-brand-dark transition-colors">
            Richiedi preventivo
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
        </a>
        <a href="https://wa.me/393204478319?text=Ciao%2C%20vorrei%20informazioni%20sull%27erogatore%20a%20rete%20idrica" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-8 py-3.5 rounded-full font-medium hover:bg-[#128C7E] transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            Scrivici su WhatsApp
        </a>
    </div>
</header>

<main id="main-content" class="max-w-7xl mx-auto px-6 pb-24">
</main>

</body>
</html>
```

- [ ] **Step 2: Verify the file is well-formed**

Run: `node -e "require('fs').readFileSync('erogatore-rete-idrica.html','utf8')"` — confirms the file is readable. Then visually confirm there is exactly one `<main id="main-content"...>` opening tag and one `</main>` closing tag, with nothing between them yet, and that the desktop dropdown / mobile submenu each contain exactly 4 `<a>` items (Casa, Uffici/HoReCa, Ufficio→boccioni, Ufficio→rete idrica).

- [ ] **Step 3: Commit**

```bash
git add erogatore-rete-idrica.html
git commit -m "feat: scaffold pagina Erogatore a rete idrica (head, nav a 4 voci, hero)"
```

---

## Task 2: Product card (GREENQUALITY) + Le due versioni

**Files:**
- Modify: `erogatore-rete-idrica.html` (insert inside `<main id="main-content">...</main>`, right after the opening tag)

**Interfaces:**
- Consumes: the `<main>` element from Task 1.
- Produces: `<section id="prodotto">` (one product card) and `<section id="versioni">`, in that order.

- [ ] **Step 1: Insert the sections**

In `erogatore-rete-idrica.html`, replace:

```html
<main id="main-content" class="max-w-7xl mx-auto px-6 pb-24">
</main>
```

with:

```html
<main id="main-content" class="max-w-7xl mx-auto px-6 pb-24">

    <!-- ── PRODOTTO ──────────────────────────────────────────────────── -->
    <section id="prodotto" class="pt-12 pb-16">
        <div class="max-w-xl mx-auto">
            <div id="greenquality" class="bg-surface rounded-[28px] p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div class="h-56 flex items-center justify-center mb-5 bg-white rounded-2xl">
                    <img src="immagini/erogatoreareteidrica.PNG" class="max-h-full object-contain p-4" alt="Erogatore a rete idrica GREENQUALITY" width="220" height="220" loading="lazy" onerror="this.src='https://placehold.co/400x300/e2e8f0/475569?text=GREENQUALITY'">
                </div>
                <h3 class="text-xl font-semibold text-ink">GREENQUALITY AC</h3>
                <p class="text-brand text-xs font-semibold uppercase tracking-wide mb-4">Naturale e Fredda a Rete Idrica</p>
                <ul class="text-sm space-y-2 text-sub flex-grow leading-relaxed">
                    <li>• Eroga acqua naturale a temperatura ambiente e fredda</li>
                    <li>• Consigliato per uffici fino a 30–40 persone</li>
                    <li>• Filtrazione microfine 8", capacità filtrante 3.000 litri in condizioni standard</li>
                    <li>• Capacità refrigerante: 28 L/h — 5 litri di acqua fredda in continuo</li>
                    <li>• Punto di erogazione ad altezza 256 mm, compatibile con bicchiere e borraccia</li>
                    <li>• Vaschetta raccogli gocce, collegamento allo scarico possibile</li>
                    <li>• Refrigerazione a banco di ghiaccio</li>
                    <li>• Alimentazione 230V monofase — Dimensioni: 33,4 × 33 × 112 cm</li>
                    <li>• Costruito in Italia nel rispetto del DM 25/2012</li>
                    <li>• Disponibile anche in versione GREENQUALITY GAS, con acqua frizzante</li>
                </ul>
                <a href="index.html#form" class="mt-6 w-full text-center bg-brand text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-brand-dark transition-colors">Richiedi info</a>
            </div>
        </div>
    </section>

    <!-- ── LE DUE VERSIONI ──────────────────────────────────────────────── -->
    <section id="versioni" class="py-16 border-t border-line/60">
        <div class="text-center max-w-2xl mx-auto mb-12">
            <p class="text-brand font-semibold text-xs tracking-widest uppercase mb-3">Due configurazioni</p>
            <h2 class="text-3xl md:text-4xl font-semibold text-ink tracking-tight">Le due versioni</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div class="bg-surface rounded-[28px] p-7">
                <h3 class="text-lg font-semibold text-ink mb-2">GREENQUALITY AC</h3>
                <p class="text-sub text-sm leading-relaxed">Acqua naturale a temperatura ambiente e fredda.</p>
            </div>
            <div class="bg-surface rounded-[28px] p-7">
                <h3 class="text-lg font-semibold text-ink mb-2">GREENQUALITY GAS</h3>
                <p class="text-sub text-sm leading-relaxed">Le stesse caratteristiche della versione AC, con bombola CO2 e carbonatore integrati per l'acqua frizzante.</p>
            </div>
        </div>
    </section>

</main>
```

- [ ] **Step 2: Verify the image referenced actually exists**

Run: `ls immagini/erogatoreareteidrica.PNG` (from repo root) — must be listed, confirming the `src` path resolves.

- [ ] **Step 3: Commit**

The image is currently untracked in git — stage it along with the page:

```bash
git add erogatore-rete-idrica.html immagini/erogatoreareteidrica.PNG
git commit -m "feat: aggiungi card prodotto GREENQUALITY e sezione le due versioni"
```

---

## Task 3: Come funziona, Vantaggi, Cosa include, Confronto

**Files:**
- Modify: `erogatore-rete-idrica.html` (insert new sections right after the `</section>` that closes `id="versioni"` from Task 2, still inside `<main>`)

**Interfaces:**
- Consumes: the `id="versioni"` section's closing tag from Task 2 as insertion anchor.
- Produces: sections `id="come-funziona"`, `id="vantaggi-rete"`, `id="servizio"`, `id="confronto"`, in that order, ending right before `</main>`.

- [ ] **Step 1: Insert the four sections**

In `erogatore-rete-idrica.html`, find:

```html
            </div>
        </div>
    </section>

</main>
```

(the closing of the `id="versioni"` section from Task 2) and replace it with:

```html
            </div>
        </div>
    </section>

    <!-- ── COME FUNZIONA ─────────────────────────────────────────────── -->
    <section id="come-funziona" class="py-16 border-t border-line/60">
        <div class="text-center max-w-2xl mx-auto mb-12">
            <p class="text-brand font-semibold text-xs tracking-widest uppercase mb-3">Il noleggio passo per passo</p>
            <h2 class="text-3xl md:text-4xl font-semibold text-ink tracking-tight">Come funziona</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div class="bg-surface rounded-[28px] p-7">
                <p class="text-brand text-3xl font-semibold mb-3">1</p>
                <h3 class="text-lg font-semibold text-ink mb-2">Sopralluogo e allaccio alla rete idrica</h3>
                <p class="text-sub text-sm leading-relaxed">Verifichiamo il punto di installazione e colleghiamo l'erogatore alla rete idrica, a nostro carico.</p>
            </div>
            <div class="bg-surface rounded-[28px] p-7">
                <p class="text-brand text-3xl font-semibold mb-3">2</p>
                <h3 class="text-lg font-semibold text-ink mb-2">Erogazione continua</h3>
                <p class="text-sub text-sm leading-relaxed">Acqua filtrata, naturale e fredda sempre disponibile, senza boccioni da sostituire.</p>
            </div>
            <div class="bg-surface rounded-[28px] p-7">
                <p class="text-brand text-3xl font-semibold mb-3">3</p>
                <h3 class="text-lg font-semibold text-ink mb-2">Manutenzione annuale inclusa</h3>
                <p class="text-sub text-sm leading-relaxed">Una volta all'anno effettuiamo il cambio filtri e la sanificazione, inclusi nel canone di noleggio.</p>
            </div>
        </div>
    </section>

    <!-- ── VANTAGGI ──────────────────────────────────────────────────── -->
    <section id="vantaggi-rete" class="py-16 border-t border-line/60">
        <div class="text-center max-w-2xl mx-auto mb-12">
            <p class="text-brand font-semibold text-xs tracking-widest uppercase mb-3">Perché sceglierlo</p>
            <h2 class="text-3xl md:text-4xl font-semibold text-ink tracking-tight">Vantaggi</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div class="flex gap-4">
                <div class="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-brand" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-ink mb-1">Erogazione continua</h3>
                    <p class="text-sub text-sm leading-relaxed">Acqua sempre disponibile, senza ricariche né boccioni da gestire.</p>
                </div>
            </div>
            <div class="flex gap-4">
                <div class="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-brand" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-ink mb-1">Manutenzione inclusa</h3>
                    <p class="text-sub text-sm leading-relaxed">Cambio filtri e sanificazione una volta all'anno, per tutta la durata del noleggio.</p>
                </div>
            </div>
            <div class="flex gap-4">
                <div class="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-brand" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-ink mb-1">Installazione a nostro carico</h3>
                    <p class="text-sub text-sm leading-relaxed">Ci occupiamo noi dell'allaccio alla rete idrica, senza costi aggiuntivi.</p>
                </div>
            </div>
            <div class="flex gap-4">
                <div class="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-brand" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5m4.75-11.396c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-ink mb-1">Analisi batteriologica su richiesta</h3>
                    <p class="text-sub text-sm leading-relaxed">Disponibile una volta all'anno, su richiesta del cliente.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- ── COSA INCLUDE ──────────────────────────────────────────────── -->
    <section id="servizio" class="py-16 border-t border-line/60">
        <div class="bg-surface rounded-[28px] p-8 md:p-10 max-w-3xl mx-auto">
            <h2 class="text-2xl md:text-3xl font-semibold text-ink tracking-tight mb-6 text-center">Cosa include il canone</h2>
            <ul class="text-sm space-y-3 text-sub leading-relaxed max-w-lg mx-auto">
                <li>• Noleggio 48 mesi</li>
                <li>• Installazione a nostro carico</li>
                <li>• Manutenzione a nostro carico, senza limiti di interventi</li>
                <li>• Cambio filtri e sanificazione una volta all'anno</li>
                <li>• Analisi batteriologica disponibile su richiesta una volta all'anno</li>
            </ul>
        </div>
    </section>

    <!-- ── CONFRONTO ─────────────────────────────────────────────────── -->
    <section id="confronto" class="py-16 border-t border-line/60">
        <div class="text-center max-w-2xl mx-auto mb-12">
            <p class="text-brand font-semibold text-xs tracking-widest uppercase mb-3">Quale scegliere</p>
            <h2 class="text-3xl md:text-4xl font-semibold text-ink tracking-tight">Rete idrica o erogatore a boccioni?</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div class="bg-surface rounded-[28px] p-7">
                <h3 class="text-lg font-semibold text-ink mb-4">Erogatore a rete idrica</h3>
                <ul class="text-sm space-y-2 text-sub leading-relaxed">
                    <li>• Erogazione continua, senza ricariche</li>
                    <li>• Richiede allaccio alla rete idrica</li>
                    <li>• Manutenzione annuale inclusa nel canone</li>
                    <li>• Indicato per uffici fino a 30–40 persone</li>
                </ul>
            </div>
            <div class="bg-surface rounded-[28px] p-7">
                <h3 class="text-lg font-semibold text-ink mb-4">Erogatore a boccioni</h3>
                <ul class="text-sm space-y-2 text-sub leading-relaxed">
                    <li>• Nessun collegamento idraulico</li>
                    <li>• Richiede sostituzione periodica dei boccioni</li>
                    <li>• Indicato per uffici fino a circa 15 persone</li>
                </ul>
            </div>
        </div>
        <p class="text-center text-sub text-sm mt-8">Non sai quale scegliere? Confrontalo con il nostro <a href="erogatore-boccioni.html" class="text-brand font-medium hover:underline">erogatore a boccioni</a>, oppure scopri i <a href="prodotti.html#uffici" class="text-brand font-medium hover:underline">totem e le colonnine ad osmosi per Uffici/HoReCa</a> per portate ancora più alte.</p>
    </section>

</main>
```

- [ ] **Step 2: Verify section IDs are unique within the file**

Run: `grep -o 'id="[a-z-]*"' erogatore-rete-idrica.html | sort | uniq -d` — expected output: empty (no duplicate IDs).

- [ ] **Step 3: Commit**

```bash
git add erogatore-rete-idrica.html
git commit -m "feat: aggiungi sezioni come funziona, vantaggi, servizio e confronto"
```

---

## Task 4: FAQ section + JSON-LD (BreadcrumbList, Product, FAQPage)

**Files:**
- Modify: `erogatore-rete-idrica.html` (FAQ section inside `<main>`, right before the CTA section that Task 5 will add at the very end of `<main>`; JSON-LD scripts inside `<head>`, right after `<link rel="stylesheet" href="/dist/styles.css">`)

**Interfaces:**
- Consumes: the `</main>` closing tag from Task 3 as insertion anchor for the FAQ section; the `<link rel="stylesheet"...>` tag from Task 1 as insertion anchor for the JSON-LD scripts.
- Produces: `<section id="faq-rete">` and one `<script type="application/ld+json">` block containing all three graph items.

- [ ] **Step 1: Insert the FAQ section**

In `erogatore-rete-idrica.html`, find the `</main>` tag (currently right after the `id="confronto"` section from Task 3) and replace:

```html
</main>
```

with:

```html
    <!-- ── FAQ ───────────────────────────────────────────────────────── -->
    <section id="faq-rete" class="py-16 border-t border-line/60">
        <div class="max-w-2xl mx-auto">
            <p class="text-brand font-semibold text-xs tracking-widest uppercase text-center mb-3">Domande frequenti</p>
            <h2 class="text-3xl md:text-4xl font-semibold text-center text-ink mb-10 tracking-tight">Erogatore a rete idrica: le domande più comuni</h2>
            <div class="space-y-4">
                <details class="bg-surface rounded-2xl p-6">
                    <summary class="font-medium text-ink cursor-pointer">Serve un allaccio idraulico per installare l'erogatore?</summary>
                    <p class="text-sub text-sm leading-relaxed mt-3">Sì, il refrigeratore GREENQUALITY si collega direttamente alla rete idrica dell'ufficio. Il collegamento è a nostro carico ed è incluso nel canone di noleggio.</p>
                </details>
                <details class="bg-surface rounded-2xl p-6">
                    <summary class="font-medium text-ink cursor-pointer">Quante persone può servire un erogatore a rete idrica?</summary>
                    <p class="text-sub text-sm leading-relaxed mt-3">Il refrigeratore GREENQUALITY è indicato per uffici fino a 30-40 persone. Per volumi più alti, valuta i totem e le colonnine della sezione Uffici/HoReCa.</p>
                </details>
                <details class="bg-surface rounded-2xl p-6">
                    <summary class="font-medium text-ink cursor-pointer">Cosa include il canone di noleggio?</summary>
                    <p class="text-sub text-sm leading-relaxed mt-3">Il canone di 48 mesi include l'installazione, la manutenzione senza limiti di interventi, il cambio filtri e la sanificazione una volta all'anno, e l'analisi batteriologica su richiesta una volta all'anno.</p>
                </details>
                <details class="bg-surface rounded-2xl p-6">
                    <summary class="font-medium text-ink cursor-pointer">Che differenza c'è tra la versione AC e la versione GAS?</summary>
                    <p class="text-sub text-sm leading-relaxed mt-3">Le due versioni hanno le stesse caratteristiche tecniche. La versione GAS aggiunge una bombola di CO2 e un carbonatore per erogare anche acqua frizzante, oltre a naturale e fredda.</p>
                </details>
                <details class="bg-surface rounded-2xl p-6">
                    <summary class="font-medium text-ink cursor-pointer">Che differenza c'è tra erogatore a rete idrica ed erogatore a boccioni?</summary>
                    <p class="text-sub text-sm leading-relaxed mt-3">L'erogatore a rete idrica si collega alla rete idrica dell'ufficio ed eroga acqua in continuo, senza ricariche. L'erogatore a boccioni non richiede alcun collegamento idraulico ma va rifornito periodicamente con boccioni da 18 litri.</p>
                </details>
                <details class="bg-surface rounded-2xl p-6">
                    <summary class="font-medium text-ink cursor-pointer">Quanto dura il contratto di noleggio?</summary>
                    <p class="text-sub text-sm leading-relaxed mt-3">Il noleggio ha una durata di 48 mesi, con installazione, manutenzione e cambio filtri inclusi nel canone per tutta la durata del contratto.</p>
                </details>
            </div>
        </div>
    </section>

</main>
```

- [ ] **Step 2: Insert the JSON-LD scripts**

In `erogatore-rete-idrica.html`, find:

```html
    <link rel="stylesheet" href="/dist/styles.css">
```

and replace it with:

```html
    <link rel="stylesheet" href="/dist/styles.css">
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {"@type":"ListItem","position":1,"name":"Home","item":"https://www.greenwateritalia.it/"},
            {"@type":"ListItem","position":2,"name":"Prodotti","item":"https://www.greenwateritalia.it/prodotti.html"},
            {"@type":"ListItem","position":3,"name":"Erogatore a rete idrica","item":"https://www.greenwateritalia.it/erogatore-rete-idrica.html"}
          ]
        },
        {
          "@type": "Product",
          "@id": "https://www.greenwateritalia.it/erogatore-rete-idrica.html#greenquality",
          "name": "GREENQUALITY — Erogatore a rete idrica",
          "description": "Refrigeratore per ufficio a noleggio, collegato alla rete idrica. Eroga acqua naturale e fredda (28 L/h, 5 litri in continuo), con filtrazione microfine 8\" da 3.000 litri. Disponibile anche in versione GAS con acqua frizzante.",
          "image": "https://www.greenwateritalia.it/immagini/erogatoreareteidrica.PNG",
          "url": "https://www.greenwateritalia.it/erogatore-rete-idrica.html",
          "brand": { "@type": "Brand", "name": "Green Water Italia" },
          "category": "Erogatori a rete idrica"
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {"@type":"Question","name":"Serve un allaccio idraulico per installare l'erogatore?","acceptedAnswer":{"@type":"Answer","text":"Sì, il refrigeratore GREENQUALITY si collega direttamente alla rete idrica dell'ufficio. Il collegamento è a nostro carico ed è incluso nel canone di noleggio."}},
            {"@type":"Question","name":"Quante persone può servire un erogatore a rete idrica?","acceptedAnswer":{"@type":"Answer","text":"Il refrigeratore GREENQUALITY è indicato per uffici fino a 30-40 persone. Per volumi più alti, valuta i totem e le colonnine della sezione Uffici/HoReCa."}},
            {"@type":"Question","name":"Cosa include il canone di noleggio?","acceptedAnswer":{"@type":"Answer","text":"Il canone di 48 mesi include l'installazione, la manutenzione senza limiti di interventi, il cambio filtri e la sanificazione una volta all'anno, e l'analisi batteriologica su richiesta una volta all'anno."}},
            {"@type":"Question","name":"Che differenza c'è tra la versione AC e la versione GAS?","acceptedAnswer":{"@type":"Answer","text":"Le due versioni hanno le stesse caratteristiche tecniche. La versione GAS aggiunge una bombola di CO2 e un carbonatore per erogare anche acqua frizzante, oltre a naturale e fredda."}},
            {"@type":"Question","name":"Che differenza c'è tra erogatore a rete idrica ed erogatore a boccioni?","acceptedAnswer":{"@type":"Answer","text":"L'erogatore a rete idrica si collega alla rete idrica dell'ufficio ed eroga acqua in continuo, senza ricariche. L'erogatore a boccioni non richiede alcun collegamento idraulico ma va rifornito periodicamente con boccioni da 18 litri."}},
            {"@type":"Question","name":"Quanto dura il contratto di noleggio?","acceptedAnswer":{"@type":"Answer","text":"Il noleggio ha una durata di 48 mesi, con installazione, manutenzione e cambio filtri inclusi nel canone per tutta la durata del contratto."}}
          ]
        }
      ]
    }
    </script>
```

- [ ] **Step 3: Verify the JSON-LD is valid JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('erogatore-rete-idrica.html','utf8').match(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/)[1])"` — expected: no output, no error.

- [ ] **Step 4: Commit**

```bash
git add erogatore-rete-idrica.html
git commit -m "feat: aggiungi FAQ e dati strutturati (Breadcrumb, Product, FAQPage)"
```

---

## Task 5: CTA finale, footer, cookie banner, scripts

**Files:**
- Modify: `erogatore-rete-idrica.html` (append CTA section inside `<main>` after the FAQ section from Task 4; append footer/WhatsApp bubble/cookie banner/scripts before `</body>`)

**Interfaces:**
- Consumes: the `</main>` tag from Task 4.
- Produces: a complete, publishable page.

- [ ] **Step 1: Insert the CTA section and close `<main>`**

In `erogatore-rete-idrica.html`, find:

```html
    </section>

</main>
```

(the closing of `id="faq-rete"` from Task 4) and replace it with:

```html
    </section>

    <!-- ── CTA ───────────────────────────────────────────────────────── -->
    <section class="rounded-3xl p-10 md:p-14 text-center border border-brand/20 mt-4" style="background: linear-gradient(135deg, rgba(37,150,190,0.06) 0%, rgba(37,150,190,0.02) 100%);">
        <p class="text-brand font-semibold text-xs tracking-widest uppercase mb-3">Green Water Italia</p>
        <h2 class="text-3xl md:text-4xl font-semibold text-ink mb-4 tracking-tight">Vuoi l'erogatore a rete idrica nel tuo ufficio?</h2>
        <p class="text-sub text-base md:text-lg leading-relaxed mb-8 max-w-lg mx-auto">Ti proponiamo la soluzione più adatta alle dimensioni del tuo ufficio — senza impegno.</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="index.html#form" class="inline-flex items-center justify-center gap-2 bg-brand text-white px-8 py-3.5 rounded-full font-medium hover:bg-brand-dark transition-colors">
                Prenota una consulenza gratuita
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
            </a>
            <a href="https://wa.me/393204478319?text=Ciao%2C%20vorrei%20informazioni%20sull%27erogatore%20a%20rete%20idrica" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-8 py-3.5 rounded-full font-medium hover:bg-[#128C7E] transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Scrivici su WhatsApp
            </a>
        </div>
    </section>

</main>
```

- [ ] **Step 2: Append footer, WhatsApp bubble, cookie banner and scripts before `</body>`**

In `erogatore-rete-idrica.html`, find:

```html
</body>
</html>
```

and replace it with (same footer/cookie/script block already live on `erogatore-boccioni.html`, but with the footer's Prodotti list now showing all 4 items and the WhatsApp message text adapted to "rete idrica"):

```html
<!-- ── FOOTER ─────────────────────────────────────────────────────────── -->
<footer class="py-16 bg-ink text-white/60 text-sm">
    <div class="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 mb-8 text-center md:text-left">

        <div class="flex flex-col space-y-3">
            <h4 class="text-white text-base font-semibold mb-2">Navigazione</h4>
            <a href="index.html#vantaggi" class="hover:text-brand transition-colors">Vantaggi</a>
            <span class="font-medium text-white/80">Prodotti</span>
            <a href="prodotti.html#casa" class="hover:text-brand transition-colors pl-3 text-xs">↳ Casa</a>
            <a href="prodotti.html#uffici" class="hover:text-brand transition-colors pl-3 text-xs">↳ Uffici / HoReCa</a>
            <a href="erogatore-boccioni.html" class="hover:text-brand transition-colors pl-3 text-xs">↳ Ufficio – boccioni</a>
            <a href="erogatore-rete-idrica.html" class="hover:text-brand transition-colors pl-3 text-xs">↳ Ufficio – rete idrica</a>
            <a href="index.html#recensioni" class="hover:text-brand transition-colors">Dicono di noi</a>
            <a href="index.html#faq" class="hover:text-brand transition-colors">FAQ</a>
            <a href="index.html#lavora-con-noi" class="hover:text-brand transition-colors">Lavora con Noi</a>
            <a href="blog/index.html" class="hover:text-brand transition-colors">Blog</a>
            <a href="glossario.html" class="hover:text-brand transition-colors">Glossario</a>
            <a href="chi-siamo.html" class="hover:text-brand transition-colors">Chi siamo</a>
            <a href="index.html#guide-gratuite" class="flex items-center justify-center md:justify-start gap-1.5 text-brand font-medium hover:text-white transition-colors"><svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>Guide gratuite</a>
            <a href="privacy.html" class="hover:text-brand transition-colors">Privacy Policy</a>
            <a href="cookie.html" class="hover:text-brand transition-colors">Cookie Policy</a>
            <button onclick="mostraBannerCookie()" class="hover:text-brand transition-colors text-center md:text-left">Gestisci preferenze cookie</button>
        </div>

        <div class="flex flex-col space-y-3 items-center md:items-start">
            <h4 class="text-white text-base font-semibold mb-2">Contattaci</h4>
            <a href="mailto:commercialegreenwater@protonmail.com" class="hover:text-brand transition-colors flex items-center gap-2">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <span class="break-all">commercialegreenwater@protonmail.com</span>
            </a>
            <a href="tel:+393204478319" class="hover:text-brand transition-colors flex items-center gap-2">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                +39 3204478319
            </a>
            <div class="flex items-start gap-2">
                <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <span>Via Guglielmo Marconi, 7 – 20024 Garbagnate Milanese MI</span>
            </div>
        </div>

        <div class="flex flex-col space-y-3 items-center md:items-start">
            <h4 class="text-white text-base font-semibold mb-2">Social</h4>
            <a href="https://www.instagram.com/greenwater26/" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 hover:text-brand transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                Instagram
            </a>
            <a href="https://www.tiktok.com/@greenwateritalia" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 hover:text-brand transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.05 1.78 4.07 1.02.89 2.34 1.37 3.68 1.48v3.86c-1.24-.06-2.49-.46-3.51-1.15-.34-.23-.65-.49-.94-.78v5.17c.05 3.32-1.92 6.54-5.11 7.49-3.58 1.13-7.64-.67-9.04-4.14C2.01 13.01 3.5 8.79 7.21 7.6c.92-.3 1.9-.37 2.86-.21v3.91c-.84-.17-1.74-.03-2.47.41-.95.57-1.44 1.69-1.26 2.78.22 1.4 1.53 2.45 2.94 2.36 1.48-.02 2.67-1.24 2.67-2.72V.02z"/></svg>
                TikTok
            </a>
            <a href="https://www.facebook.com/profile.php?id=61590626797555" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 hover:text-brand transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
            </a>
            <a href="https://www.youtube.com/@GreenWaterItalia" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 hover:text-brand transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                YouTube
            </a>
            <a href="https://www.linkedin.com/company/greenwateritalia/" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 hover:text-brand transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.848 3.37-1.848 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>
                LinkedIn
            </a>
        </div>
    </div>
    <div class="border-t border-white/10 pt-8 mt-4">
        <div class="flex flex-row items-center justify-center gap-3 text-xs text-center px-6">
            <img src="logo-s.webp" alt="Green Water Italia" class="h-6 w-auto object-contain opacity-80" width="24" height="24" loading="lazy" onerror="this.style.display='none'">
            <p class="text-white/80">&copy; 2026 Green Water Italia. Tutti i diritti riservati. | <strong>P.Iva: 04456450966</strong></p>
        </div>
    </div>
</footer>

<!-- WhatsApp bubble -->
<a href="https://wa.me/393204478319?text=Ciao%2C%20vorrei%20informazioni%20sull%27erogatore%20a%20rete%20idrica" target="_blank" rel="noopener noreferrer" aria-label="Contattaci su WhatsApp" class="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25D366] text-white pl-4 pr-5 py-3 rounded-full shadow-xl hover:bg-[#128C7E] transition-all duration-300 hover:scale-105">
    <svg class="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
    <span class="font-medium text-sm">Scrivici</span>
</a>

<script>
    // Mobile menu toggle
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const links = document.querySelectorAll('.mobile-link');
    btn.addEventListener('click', () => menu.classList.toggle('hidden'));
    links.forEach(l => l.addEventListener('click', () => menu.classList.add('hidden')));

    // Mobile prodotti sub-menu
    document.getElementById('mobile-prodotti-btn').addEventListener('click', function() {
        const sub = document.getElementById('mobile-prodotti-sub');
        const arrow = document.getElementById('mobile-prodotti-arrow');
        sub.classList.toggle('hidden');
        arrow.classList.toggle('rotate-180');
    });
</script>
    <!-- Cookie Consent Banner -->
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
</html>
```

- [ ] **Step 3: Build CSS and verify**

Run: `node node_modules/tailwindcss/lib/cli.js -i ./src/input.css -o ./dist/styles.css --minify` — expected: completes without error, `dist/styles.css` may or may not change (most classes are already used elsewhere on the site); check with `git status`.

Do whatever visual/structural verification is possible in your environment (see Task 10 for the controller's final full-site check); if no browser/screenshot tool is available, do a careful structural read-back instead (tag balance, all links resolve, footer shows 4 Prodotti items) and say so honestly in your report.

- [ ] **Step 4: Commit**

```bash
git add erogatore-rete-idrica.html dist/styles.css
git commit -m "feat: completa pagina Erogatore a rete idrica (CTA, footer, script)"
```

(If `dist/styles.css` has no diff, omit it from the `git add`.)

---

## Task 6: Update `index.html`, `prodotti.html`, `erogatore-boccioni.html` — 4-item nav

**Files:**
- Modify: `index.html`
- Modify: `prodotti.html`
- Modify: `erogatore-boccioni.html`

**Interfaces:**
- Consumes: Reference blocks A, B, C from the top of this plan.
- Produces: all three files' desktop dropdown, mobile submenu, and footer link list show 4 items ("Casa", "Uffici / HoReCa", "Ufficio – boccioni", "Ufficio – rete idrica"), with subtitles in the dropdown/submenu (titles stay "Ufficio" for both boccioni/rete-idrica items, distinguished by subtitle) and renamed labels in the footer.

- [ ] **Step 1: `index.html` desktop dropdown — insert 4th item**

Find (12-space indent — this is the existing live block, ending right after the boccioni `</a>` and before the wrapping `</div>`):

```html
                        <a href="erogatore-boccioni.html" class="flex items-start gap-2.5 px-4 py-3 text-sm text-sub hover:bg-surface hover:text-brand transition-colors rounded-xl mx-1">
                            <svg class="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5m4.75-11.396c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>
                            <span class="flex flex-col leading-tight">
                                <span class="font-medium">Ufficio</span>
                                <span class="text-xs opacity-70">Erogatore a boccioni</span>
                            </span>
                        </a>
                    </div>
                </div>
            </div>
```

Replace with the same block plus Reference A (re-indented to 12 spaces — add 4 spaces to every line of Reference A) inserted right after the boccioni `</a>` and before `</div>`:

```html
                        <a href="erogatore-boccioni.html" class="flex items-start gap-2.5 px-4 py-3 text-sm text-sub hover:bg-surface hover:text-brand transition-colors rounded-xl mx-1">
                            <svg class="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5m4.75-11.396c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>
                            <span class="flex flex-col leading-tight">
                                <span class="font-medium">Ufficio</span>
                                <span class="text-xs opacity-70">Erogatore a boccioni</span>
                            </span>
                        </a>
                        <a href="erogatore-rete-idrica.html" class="flex items-start gap-2.5 px-4 py-3 text-sm text-sub hover:bg-surface hover:text-brand transition-colors rounded-xl mx-1">
                            <svg class="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2.25c-4.5 6-7.5 10.5-7.5 13.5a7.5 7.5 0 0015 0c0-3-3-7.5-7.5-13.5z"/></svg>
                            <span class="flex flex-col leading-tight">
                                <span class="font-medium">Ufficio</span>
                                <span class="text-xs opacity-70">Erogatore a rete idrica</span>
                            </span>
                        </a>
                    </div>
                </div>
            </div>
```

- [ ] **Step 2: `index.html` mobile submenu — insert 4th item**

Find (12-space indent, the existing live block ending right after the boccioni `</a>` and before the submenu's closing `</div>`):

```html
                    <a href="erogatore-boccioni.html" class="mobile-link flex items-start gap-2 text-base text-sub hover:text-brand transition-colors">
                        <svg class="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5m4.75-11.396c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>
                        <span class="flex flex-col text-center leading-tight">
                            <span class="font-medium">Ufficio</span>
                            <span class="text-xs opacity-70">Erogatore a boccioni</span>
                        </span>
                    </a>
                </div>
            </div>
```

Replace with the same block plus Reference B (re-indented to 12 spaces) inserted right after:

```html
                    <a href="erogatore-boccioni.html" class="mobile-link flex items-start gap-2 text-base text-sub hover:text-brand transition-colors">
                        <svg class="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5m4.75-11.396c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>
                        <span class="flex flex-col text-center leading-tight">
                            <span class="font-medium">Ufficio</span>
                            <span class="text-xs opacity-70">Erogatore a boccioni</span>
                        </span>
                    </a>
                    <a href="erogatore-rete-idrica.html" class="mobile-link flex items-start gap-2 text-base text-sub hover:text-brand transition-colors">
                        <svg class="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2.25c-4.5 6-7.5 10.5-7.5 13.5a7.5 7.5 0 0015 0c0-3-3-7.5-7.5-13.5z"/></svg>
                        <span class="flex flex-col text-center leading-tight">
                            <span class="font-medium">Ufficio</span>
                            <span class="text-xs opacity-70">Erogatore a rete idrica</span>
                        </span>
                    </a>
                </div>
            </div>
```

- [ ] **Step 3: `index.html` footer — rename + add**

Find:

```html
            <a href="erogatore-boccioni.html" class="hover:text-brand transition-colors pl-3 text-xs">↳ Ufficio</a>
```

Replace with Reference C's bare-relative variant:

```html
            <a href="erogatore-boccioni.html" class="hover:text-brand transition-colors pl-3 text-xs">↳ Ufficio – boccioni</a>
            <a href="erogatore-rete-idrica.html" class="hover:text-brand transition-colors pl-3 text-xs">↳ Ufficio – rete idrica</a>
```

- [ ] **Step 4: `prodotti.html` desktop dropdown — insert 4th item**

Find (8-space indent, the existing live block ending right after the boccioni `</a>` and before the wrapping `</div>`):

```html
                    <a href="erogatore-boccioni.html" class="flex items-start gap-2.5 px-4 py-3 text-sm text-sub hover:bg-surface hover:text-brand transition-colors rounded-xl mx-1">
                        <svg class="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5m4.75-11.396c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>
                        <span class="flex flex-col leading-tight">
                            <span class="font-medium">Ufficio</span>
                            <span class="text-xs opacity-70">Erogatore a boccioni</span>
                        </span>
                    </a>
                </div>
            </div>
        </div>
```

Replace with the same block plus Reference A (8-space base, as written verbatim at the top of this plan) inserted right after:

```html
                    <a href="erogatore-boccioni.html" class="flex items-start gap-2.5 px-4 py-3 text-sm text-sub hover:bg-surface hover:text-brand transition-colors rounded-xl mx-1">
                        <svg class="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5m4.75-11.396c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>
                        <span class="flex flex-col leading-tight">
                            <span class="font-medium">Ufficio</span>
                            <span class="text-xs opacity-70">Erogatore a boccioni</span>
                        </span>
                    </a>
                    <a href="erogatore-rete-idrica.html" class="flex items-start gap-2.5 px-4 py-3 text-sm text-sub hover:bg-surface hover:text-brand transition-colors rounded-xl mx-1">
                        <svg class="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2.25c-4.5 6-7.5 10.5-7.5 13.5a7.5 7.5 0 0015 0c0-3-3-7.5-7.5-13.5z"/></svg>
                        <span class="flex flex-col leading-tight">
                            <span class="font-medium">Ufficio</span>
                            <span class="text-xs opacity-70">Erogatore a rete idrica</span>
                        </span>
                    </a>
                </div>
            </div>
        </div>
```

- [ ] **Step 5: `prodotti.html` mobile submenu — insert 4th item**

Find (8-space indent, the existing live block ending right after the boccioni `</a>` and before the submenu's closing `</div>`):

```html
                <a href="erogatore-boccioni.html" class="mobile-link flex items-start gap-2 text-base text-sub hover:text-brand transition-colors">
                    <svg class="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5m4.75-11.396c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>
                    <span class="flex flex-col text-center leading-tight">
                        <span class="font-medium">Ufficio</span>
                        <span class="text-xs opacity-70">Erogatore a boccioni</span>
                    </span>
                </a>
            </div>
        </div>
```

Replace with the same block plus Reference B (8-space base, as written verbatim at the top of this plan) inserted right after:

```html
                <a href="erogatore-boccioni.html" class="mobile-link flex items-start gap-2 text-base text-sub hover:text-brand transition-colors">
                    <svg class="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5m4.75-11.396c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>
                    <span class="flex flex-col text-center leading-tight">
                        <span class="font-medium">Ufficio</span>
                        <span class="text-xs opacity-70">Erogatore a boccioni</span>
                    </span>
                </a>
                <a href="erogatore-rete-idrica.html" class="mobile-link flex items-start gap-2 text-base text-sub hover:text-brand transition-colors">
                    <svg class="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2.25c-4.5 6-7.5 10.5-7.5 13.5a7.5 7.5 0 0015 0c0-3-3-7.5-7.5-13.5z"/></svg>
                    <span class="flex flex-col text-center leading-tight">
                        <span class="font-medium">Ufficio</span>
                        <span class="text-xs opacity-70">Erogatore a rete idrica</span>
                    </span>
                </a>
            </div>
        </div>
```

- [ ] **Step 6: `prodotti.html` footer — rename + add**

Find:

```html
            <a href="erogatore-boccioni.html" class="hover:text-brand transition-colors pl-3 text-xs">↳ Ufficio</a>
```

Replace with Reference C's bare-relative variant (same two-line block as Step 3).

- [ ] **Step 7: `erogatore-boccioni.html` desktop dropdown — insert 4th item**

The live block in `erogatore-boccioni.html` is byte-identical to `prodotti.html`'s (8-space base, same classes — both were built from the same Reference A). Apply the exact same find/replace as Step 4 to `erogatore-boccioni.html`.

- [ ] **Step 8: `erogatore-boccioni.html` mobile submenu — insert 4th item**

The live block in `erogatore-boccioni.html` is byte-identical to `prodotti.html`'s. Apply the exact same find/replace as Step 5 to `erogatore-boccioni.html`.

- [ ] **Step 9: `erogatore-boccioni.html` footer — rename + add**

Apply the exact same find/replace as Step 6 to `erogatore-boccioni.html`.

- [ ] **Step 10: Verify with grep**

Run: `grep -c "Erogatore a rete idrica" index.html prodotti.html erogatore-boccioni.html` — expected: `2` for each file (dropdown subtitle + mobile submenu subtitle).

Run: `grep -c "erogatore-rete-idrica.html" index.html prodotti.html erogatore-boccioni.html` — expected: `3` for each file (dropdown href + mobile submenu href + footer href).

Run: `grep -c "Ufficio – boccioni" index.html prodotti.html erogatore-boccioni.html` — expected: `1` for each file (the renamed footer line).

- [ ] **Step 11: Visual check**

If a browser/screenshot tool is available, open all three files and confirm: desktop dropdown shows 4 items (Casa / Uffici-HoReCa / Ufficio–boccioni / Ufficio–rete idrica), none overflowing; mobile hamburger → Prodotti expands to 4 items; footer shows all 4 "Prodotti" sub-links with the renamed boccioni label. If no such tool is available, do a careful structural read-back instead and say so.

- [ ] **Step 12: Commit**

```bash
git add index.html prodotti.html erogatore-boccioni.html
git commit -m "feat: aggiungi voce Ufficio - rete idrica al menu Prodotti (4 voci)"
```

---

## Task 7: Add "Ufficio – rete idrica" footer link + rename boccioni line — 13 root pages + `blog/index.html`

**Files:**
- Modify: `acqua-bambini-famiglia.html`, `acqua-milano.html`, `acqua-padova.html`, `acqua-napoli.html`, `acqua-roma.html`, `acqua-torino.html`, `chi-siamo.html`, `contaminanti-acqua.html`, `cookie.html`, `faq.html`, `guida-osmosi-inversa.html`, `glossario.html`, `privacy.html` (13 files, leading-slash href style)
- Modify: `blog/index.html` (leading-slash href style, same as above)

**Interfaces:**
- Consumes: Reference C's leading-slash variant.
- Produces: each file's footer "Prodotti" list shows 4 sub-links, with the boccioni line renamed.

- [ ] **Step 1: Apply the same edit to all 14 files**

In each of the 14 files listed above, find this exact line:

```html
            <a href="/erogatore-boccioni.html" class="hover:text-brand transition-colors pl-3 text-xs">&#8627; Ufficio</a>
```

and replace it with:

```html
            <a href="/erogatore-boccioni.html" class="hover:text-brand transition-colors pl-3 text-xs">&#8627; Ufficio – boccioni</a>
            <a href="/erogatore-rete-idrica.html" class="hover:text-brand transition-colors pl-3 text-xs">&#8627; Ufficio – rete idrica</a>
```

Do this once per file (14 total edits).

- [ ] **Step 2: Verify with grep across all 14 at once**

Run:
```bash
grep -l "rete idrica" acqua-bambini-famiglia.html acqua-milano.html acqua-padova.html acqua-napoli.html acqua-roma.html acqua-torino.html chi-siamo.html contaminanti-acqua.html cookie.html faq.html guida-osmosi-inversa.html glossario.html privacy.html blog/index.html
```
Expected: all 14 file paths listed.

Run: `grep -c "/erogatore-rete-idrica.html" acqua-bambini-famiglia.html acqua-milano.html acqua-padova.html acqua-napoli.html acqua-roma.html acqua-torino.html chi-siamo.html contaminanti-acqua.html cookie.html faq.html guida-osmosi-inversa.html glossario.html privacy.html blog/index.html` — expected: `1` for each of the 14 files.

- [ ] **Step 3: Commit**

```bash
git add acqua-bambini-famiglia.html acqua-milano.html acqua-padova.html acqua-napoli.html acqua-roma.html acqua-torino.html chi-siamo.html contaminanti-acqua.html cookie.html faq.html guida-osmosi-inversa.html glossario.html privacy.html blog/index.html
git commit -m "feat: aggiungi link Ufficio - rete idrica nel footer Prodotti (13 pagine root + blog/index)"
```

---

## Task 8: Add "Ufficio – rete idrica" footer link + rename boccioni line — 4 blog articles

**Files:**
- Modify: `blog/acqua-dura-casa-rimedi-calcio.html`
- Modify: `blog/osmosi-inversa-fa-male-minerali-calcio.html`
- Modify: `blog/errori-da-evitare-prima-di-acquistare-impianto-depurazione-acqua.html`
- Modify: `blog/linea-thanta-erogatore-acqua-professionale-horeca.html`

**Interfaces:**
- Consumes: Reference C's `../`-relative peer-link variant.
- Produces: each file's footer peer-link list shows a renamed "Ufficio – boccioni" plus a new "Ufficio – rete idrica" peer link, both between "Uffici / HoReCa" and "Contatti".

- [ ] **Step 1: Apply the same edit to all 4 files**

In each of the 4 files listed above, find this exact line:

```html
                        <a href="../erogatore-boccioni.html" class="hover:text-white transition-colors">Ufficio</a>
```

and replace it with:

```html
                        <a href="../erogatore-boccioni.html" class="hover:text-white transition-colors">Ufficio – boccioni</a>
                        <a href="../erogatore-rete-idrica.html" class="hover:text-white transition-colors">Ufficio – rete idrica</a>
```

- [ ] **Step 2: Verify with grep**

Run:
```bash
grep -l "rete idrica" blog/acqua-dura-casa-rimedi-calcio.html blog/osmosi-inversa-fa-male-minerali-calcio.html blog/errori-da-evitare-prima-di-acquistare-impianto-depurazione-acqua.html blog/linea-thanta-erogatore-acqua-professionale-horeca.html
```
Expected: all 4 file paths listed.

- [ ] **Step 3: Commit**

```bash
git add blog/acqua-dura-casa-rimedi-calcio.html blog/osmosi-inversa-fa-male-minerali-calcio.html blog/errori-da-evitare-prima-di-acquistare-impianto-depurazione-acqua.html blog/linea-thanta-erogatore-acqua-professionale-horeca.html
git commit -m "feat: aggiungi link Ufficio - rete idrica nel footer dei 4 articoli blog collegati"
```

---

## Task 9: Final site-wide verification

**Files:** none modified — verification only.

- [ ] **Step 1: Confirm no file was left without the new page reference**

Run: `grep -rL "erogatore-rete-idrica" index.html prodotti.html erogatore-boccioni.html acqua-bambini-famiglia.html acqua-milano.html acqua-padova.html acqua-napoli.html acqua-roma.html acqua-torino.html chi-siamo.html contaminanti-acqua.html cookie.html faq.html guida-osmosi-inversa.html glossario.html privacy.html blog/index.html blog/acqua-dura-casa-rimedi-calcio.html blog/osmosi-inversa-fa-male-minerali-calcio.html blog/errori-da-evitare-prima-di-acquistare-impianto-depurazione-acqua.html blog/linea-thanta-erogatore-acqua-professionale-horeca.html`

Expected: empty output (every one of these 20 files must now mention "erogatore-rete-idrica").

- [ ] **Step 2: Confirm the filter-frequency and "no price" constraints hold across the new page**

Run: `grep -in "due volte\|2 volte\|€\|/mese\|canone mensile" erogatore-rete-idrica.html` — expected: no matches (filter change is "una volta all'anno" only, no price anywhere).

Run: `grep -c "una volta all'anno" erogatore-rete-idrica.html` — expected: at least 3 (come funziona step, cosa include, FAQ answer all mention the annual cadence).

- [ ] **Step 3: Confirm `dist/styles.css` is up to date**

Run: `node node_modules/tailwindcss/lib/cli.js -i ./src/input.css -o ./dist/styles.css --minify` — expected: completes without error. Run `git status` — if `dist/styles.css` shows a diff, `git add dist/styles.css` and commit it (`git commit -m "chore: rigenera dist/styles.css"`); if no diff, skip.

- [ ] **Step 4: Full site walkthrough**

If a browser/screenshot tool is available, check in order:
1. `index.html` — nav dropdown (desktop + mobile) shows 4 items; footer shows 4 links with renamed boccioni label.
2. `prodotti.html` — same nav check; existing Uffici/HoReCa banner (pointing to boccioni) and quiz section still work, unaffected by this plan.
3. `erogatore-boccioni.html` — nav now shows 4 items too; rest of the page (product cards, water analysis table, FAQ, etc.) unaffected.
4. `erogatore-rete-idrica.html` — full page scroll-through: hero, product card (image loads), le due versioni, come funziona, vantaggi, cosa include, confronto (links to `erogatore-boccioni.html` and `prodotti.html#uffici` work), FAQ (details expand), CTA, footer (4 items), WhatsApp bubble, cookie banner.
5. `chi-siamo.html` (Group B sample) and `blog/linea-thanta-erogatore-acqua-professionale-horeca.html` (Group E sample) — footer shows both renamed "Ufficio – boccioni" and new "Ufficio – rete idrica" links, both navigate correctly.

If no browser/screenshot tool is available, do the equivalent structural read-back on each file instead and say so honestly.

---

## Scope note

This plan does not touch `prodotti.html`'s Uffici/HoReCa section content or its existing banner (still pointing only to the boccioni page) — see the spec's "Fuori scope" section for the reasoning. The 9 blog articles with only a flat "Prodotti" mention and the 18 blog articles with no Prodotti footer reference at all (identified during the boccioni plan) remain out of scope here for the same reason: no existing Casa/Uffici entry to extend.
