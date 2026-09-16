#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
SEEDS_DIR="${SEEDS_DIR:-$ROOT_DIR/database/seeds}"

PGHOST="${PGHOST:-${POSTGRES_HOST:-localhost}}"
PGPORT="${PGPORT:-${POSTGRES_PORT:-5433}}"
PGUSER="${PGUSER:-${POSTGRES_USER:-postgres}}"
PGDATABASE="${PGDATABASE:-${POSTGRES_DB:-mydb}}"
export PGHOST PGPORT PGUSER PGDATABASE
export PGPASSWORD="${PGPASSWORD:-${POSTGRES_PASSWORD:-postgres}}"

if ! command -v psql >/dev/null 2>&1; then
    echo "error: psql not found on PATH" >&2
    exit 1
fi

if [[ ! -d "$SEEDS_DIR" ]]; then
    echo "error: seeds directory not found: $SEEDS_DIR" >&2
    exit 1
fi

if [[ -n "${DATABASE_URL:-}" ]]; then
    PSQL=(psql "$DATABASE_URL")
else
    PSQL=(psql)
fi

seed_files=()
while IFS= read -r seed_file; do
    seed_files+=("$seed_file")
done < <(find "$SEEDS_DIR" -maxdepth 1 -type f -name '*.sql' -print | sort)
if [[ ${#seed_files[@]} -eq 0 ]]; then
    echo "error: no seed files found in $SEEDS_DIR" >&2
    exit 1
fi

echo "Seeding database"
seed_arguments=(--quiet --no-psqlrc --single-transaction --set ON_ERROR_STOP=1)
for seed_file in "${seed_files[@]}"; do
    echo "Applying $(basename "$seed_file")"
    seed_arguments+=(--file "$seed_file")
done
"${PSQL[@]}" "${seed_arguments[@]}"
echo "Database seed complete."