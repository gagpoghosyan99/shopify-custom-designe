#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

export PATH="${HOME}/.local/bin:${PATH}"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [[ -z "${SHOPIFY_CLI_THEME_TOKEN:-}" ]]; then
  echo "⚠️  SHOPIFY_CLI_THEME_TOKEN is empty in .env — save your Theme Access password, then retry."
  exit 1
fi

export SHOPIFY_FLAG_FORCE="${SHOPIFY_FLAG_FORCE:-1}"
export SHOPIFY_CLI_TTY=0

echo "→ Pushing NovaMeds theme to novameds.myshopify.com"
exec shopify theme push --store novameds.myshopify.com --password "$SHOPIFY_CLI_THEME_TOKEN" "$@"
