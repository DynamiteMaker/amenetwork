#!/bin/bash
# Generate Supabase types from remote database schema
# Usage: npm run db:gen-types
# Or: ./scripts/generate-types.sh

set -e

TYPES_FILE="lib/supabase/types.ts"

echo "Generating TypeScript types from Supabase..."

if [ -n "$1" ] && [ "$1" = "--local" ]; then
  supabase gen types typescript --local > "$TYPES_FILE"
  echo "✓ Generated types from LOCAL database → $TYPES_FILE"
else
  supabase gen types typescript --linked > "$TYPES_FILE"
  echo "✓ Generated types from REMOTE database → $TYPES_FILE"
fi

echo "Done."
