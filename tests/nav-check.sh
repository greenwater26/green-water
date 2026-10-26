#!/usr/bin/env bash
# Controlla la barra di navigazione desktop di tutte le pagine a più larghezze:
# voci a capo, fuori schermo, sovrapposte o attaccate al logo.
# Uso: tests/nav-check.sh [larghezze]   (default 768,1024,1280,1440,1536,1700,1920)
set -euo pipefail
cd "$(dirname "$0")/.."
LARGHEZZE=${1:-768,1024,1280,1440,1536,1700,1920}
PAGINE=$(ls *.html blog/*.html | grep -v '^carosello\|^status\|^cookie\|^privacy' | paste -sd,)
PORT=8813
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
sleep 1
RIS=$(chromium --headless --disable-gpu --no-sandbox --window-size=2000,400 --virtual-time-budget=300000 \
  --dump-dom "http://localhost:$PORT/tests/nav-check.html?pagine=$PAGINE&larghezze=$LARGHEZZE" 2>/dev/null \
  | sed -n '/<pre id="risultati">/,/<\/pre>/p' | sed 's/<[^>]*>//g;s/&gt;/>/g;s/&amp;/\&/g;s/&quot;/"/g')
printf '%s\n' "$RIS" | grep -v '^OK' || true
printf '%s\n' "$RIS" | grep -c '^OK' | sed 's/$/ combinazioni OK/'
printf '%s' "$RIS" | grep -q '^FINE' || { echo "ERRORE: controllo non completato"; exit 1; }
! printf '%s' "$RIS" | grep -q '^FAIL'
