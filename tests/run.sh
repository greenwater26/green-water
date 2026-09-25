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
