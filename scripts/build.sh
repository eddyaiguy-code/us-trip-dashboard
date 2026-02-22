#!/usr/bin/env bash
set -euo pipefail

# Always generate client (doesn't require DB connection)
prisma generate

# If we're on Vercel/Supabase integration, these env vars usually exist.
# Only attempt to sync schema when a DB URL is available.
DB_URL="${DATABASE_URL:-${POSTGRES_PRISMA_URL:-${POSTGRES_URL:-}}}"

if [[ -n "${DB_URL}" ]]; then
  export DATABASE_URL="$DB_URL"
  prisma db push --accept-data-loss --skip-generate
else
  echo "Skipping prisma db push (no DATABASE_URL/POSTGRES_* env vars set)"
fi

next build
