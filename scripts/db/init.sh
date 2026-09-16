#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-$ROOT_DIR/database/migrations}"

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

if [[ ! -d "$MIGRATIONS_DIR" ]]; then
    echo "error: migrations directory not found: $MIGRATIONS_DIR" >&2
    exit 1
fi

if [[ -n "${DATABASE_URL:-}" ]]; then
    PSQL=(psql "$DATABASE_URL")
    TARGET_DESC="DATABASE_URL"
else
    PSQL=(psql)
    TARGET_DESC="${PGUSER}@${PGHOST}:${PGPORT}/${PGDATABASE}"
fi

if [[ "${1:-}" == "--force" ]]; then
    echo "Resetting database objects"
    "${PSQL[@]}" --quiet --no-psqlrc --set ON_ERROR_STOP=1 <<'SQL'
DROP SCHEMA IF EXISTS mealdb CASCADE;
DROP TABLE IF EXISTS schema_migrations CASCADE;
DROP TABLE IF EXISTS stock_in_documents CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
SQL
    shift
fi

"${PSQL[@]}" --quiet --no-psqlrc --set ON_ERROR_STOP=1 <<'SQL'
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
SQL

if [[ "${1:-}" == "--migrate-only" ]]; then
    shift
fi

migration_files=()
while IFS= read -r migration_file; do
    migration_files+=("$migration_file")
done < <(find "$MIGRATIONS_DIR" -maxdepth 1 -type f -name '*.sql' -print | sort)
if [[ ${#migration_files[@]} -eq 0 ]]; then
    echo "error: no migration files found in $MIGRATIONS_DIR" >&2
    exit 1
fi

echo "Applying database migrations to ${TARGET_DESC}"
for migration_file in "${migration_files[@]}"; do
    version="$(basename "$migration_file")"
    already_applied="$(${PSQL[@]} --tuples-only --no-align --no-psqlrc --set ON_ERROR_STOP=1 \
        -c "SELECT 1 FROM schema_migrations WHERE version = '$version'")"

    if [[ "$already_applied" == "1" ]]; then
        echo "Skipping $version"
        continue
    fi

    echo "Applying $version"
    "${PSQL[@]}" --quiet --no-psqlrc --single-transaction --set ON_ERROR_STOP=1 \
        --file "$migration_file"
    "${PSQL[@]}" --quiet --no-psqlrc --set ON_ERROR_STOP=1 \
        -c "INSERT INTO schema_migrations (version) VALUES ('$version')"
done

echo "Database migrations complete."