#!/usr/bin/env bash
# Ruft einen geschützten Cron-Endpunkt der Website auf – robust gegen Server-Wackler.
#
# Aufruf:  call-cron.sh "<Label>" "<URL>"
# Erwartet: Umgebungsvariable API_KEY (= MENU_API_KEY, von GitHub maskiert)
#
# Verhalten:
#   - Wiederholt bei HTTP 000 (nicht erreichbar) und bei 4xx/5xx mit Backoff.
#     (4xx wird mitwiederholt, weil der Webserver bei einem Zombie-Stau vor der
#      eigentlichen App fälschlich 400/403/404 liefert – genau der Fall vom 26.06.)
#   - Akzeptiert NUR 2xx als Erfolg.
#   - Schlägt nach allen Versuchen mit Exit-Code != 0 fehl → GitHub-Run wird rot.

set -uo pipefail

LABEL="${1:?Label fehlt}"
URL="${2:?URL fehlt}"
: "${API_KEY:?API_KEY (MENU_API_KEY) ist nicht gesetzt}"

ATTEMPTS=4          # Gesamtversuche
SLEEP_BASE=20       # Sekunden, wird je Versuch verdoppelt (20, 40, 80 …)
MAX_TIME=90         # Timeout pro Versuch (Sekunden)

body_file="$(mktemp)"
trap 'rm -f "$body_file"' EXIT

attempt=1
while [ "$attempt" -le "$ATTEMPTS" ]; do
  echo "[$LABEL] Versuch $attempt/$ATTEMPTS → $URL"
  code="$(curl -sS -X POST \
    -H "x-api-key: ${API_KEY}" \
    --max-time "$MAX_TIME" \
    -o "$body_file" \
    -w "%{http_code}" \
    "$URL" || echo "000")"

  echo "[$LABEL] HTTP $code"
  # Antwort-Body zeigen (gekürzt) – hilft bei der Fehlersuche
  head -c 800 "$body_file"; echo

  case "$code" in
    2*)
      echo "[$LABEL] ✅ Erfolg."
      exit 0
      ;;
    401)
      # Auth falsch → Wiederholen bringt nichts, sofort hart fehlschlagen.
      echo "[$LABEL] ❌ 401 Nicht autorisiert – MENU_API_KEY prüfen. Abbruch."
      exit 1
      ;;
  esac

  if [ "$attempt" -lt "$ATTEMPTS" ]; then
    wait_s=$(( SLEEP_BASE * (1 << (attempt - 1)) ))
    echo "[$LABEL] ⚠️  HTTP $code – warte ${wait_s}s und versuche erneut …"
    sleep "$wait_s"
  fi
  attempt=$(( attempt + 1 ))
done

echo "[$LABEL] ❌ Nach $ATTEMPTS Versuchen gescheitert (letzter HTTP $code)."
exit 1
