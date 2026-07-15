#!/bin/sh
set -eu
echo "HOSTNAME=$(hostname 2>/dev/null || true)"
echo "PWD=$(pwd)"
echo "NODE=$(node -v 2>/dev/null || echo missing)"
echo "PORT=${PORT:-unset}"
echo "APP_SERVICE=${APP_SERVICE:-unset}"
echo "NIXPACKS_NODE_VERSION=${NIXPACKS_NODE_VERSION:-unset}"
echo "NEXT_PUBLIC_DEMO_MODE_IS_TRUE=$( [ "${NEXT_PUBLIC_DEMO_MODE:-}" = "true" ] && echo yes || echo no )"
echo "SUPABASE_URL=$( [ -n "${SUPABASE_URL:-}" ] && echo SET || echo MISSING )"
echo "SUPABASE_SECRET_KEY=$( [ -n "${SUPABASE_SECRET_KEY:-}" ] && echo SET || echo MISSING )"
echo "DATABASE_URL=$( [ -n "${DATABASE_URL:-}" ] && echo SET || echo MISSING )"
echo "--- processes ---"
ps aux 2>/dev/null | head -25 || true
echo "--- package ---"
if [ -f package.json ]; then
  node -e 'const p=require("./package.json"); console.log(JSON.stringify({name:p.name, hasStart:!!(p.scripts&&p.scripts.start), hasBuild:!!(p.scripts&&p.scripts.build)}))'
fi
PORT_USE=${PORT:-3000}
echo "--- health ---"
curl -sS -o /tmp/h.json -w "health_http=%{http_code}\n" "http://127.0.0.1:${PORT_USE}/api/health" || true
head -c 300 /tmp/h.json 2>/dev/null; echo
echo "--- login ---"
curl -sS -o /dev/null -w "login_http=%{http_code}\n" "http://127.0.0.1:${PORT_USE}/login" || true
