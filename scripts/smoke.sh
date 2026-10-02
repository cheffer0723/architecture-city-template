#!/usr/bin/env bash
# Smoke-test a running Architecture City host (local Caddy or Railway URL).
set -euo pipefail

BASE="${1:-http://127.0.0.1:8080}"
BASE="${BASE%/}"

pass() { printf 'ok  %s\n' "$1"; }
fail() { printf 'FAIL %s\n' "$1" >&2; exit 1; }

check_status() {
  local path="$1" want="$2" label="$3"
  local code
  code="$(curl -sS -o /tmp/ac-smoke.body -w '%{http_code}' "${BASE}${path}")"
  [[ "$code" == "$want" ]] || fail "$label (HTTP $code, wanted $want)"
  pass "$label"
}

check_status /health 200 "health"
grep -qx 'ok' /tmp/ac-smoke.body || fail "health body"
pass "health body"

check_status / 200 "index"
grep -q 'vendor/three/three.module.js' /tmp/ac-smoke.body || fail "index import map"
grep -q 'ARCHITECTURE CITY\|Architecture City' /tmp/ac-smoke.body || fail "index branding"
pass "index import map + branding"

check_status /architecture-city-summary.json 200 "summary graph"
python3 -c 'import json; d=json.load(open("/tmp/ac-smoke.body")); assert d.get("nodes"), "no nodes"'
pass "summary JSON parse"

check_status /architecture-map.json 200 "full graph"
python3 -c 'import json; d=json.load(open("/tmp/ac-smoke.body")); assert len(d.get("nodes",[]))>10 and d.get("edges") is not None'
pass "full JSON parse"

for asset in \
  /vendor/three/three.module.js \
  /vendor/three/three.core.js \
  /vendor/three/OrbitControls.js
do
  check_status "$asset" 200 "asset $asset"
  ctype="$(curl -sS -D- -o /dev/null "${BASE}${asset}" | tr -d '\r' | awk -F': ' 'tolower($1)=="content-type"{print $2; exit}')"
  [[ "$ctype" == text/javascript* || "$ctype" == application/javascript* ]] || fail "MIME $asset ($ctype)"
  pass "MIME $asset"
done

# Missing module paths must NOT return HTML (that blanks the WebGL city).
code="$(curl -sS -o /tmp/ac-smoke.missing -w '%{http_code}' "${BASE}/vendor/three/missing.js")"
[[ "$code" == "404" ]] || fail "missing.js should 404 (got $code)"
pass "missing vendor 404"

printf '\nAll smoke checks passed against %s\n' "$BASE"
