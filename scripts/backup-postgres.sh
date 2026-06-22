#!/bin/sh
set -eu

timestamp="$(date +%Y%m%d_%H%M%S)"
backup_dir="${BACKUP_DIR:-/backups}"
retention_days="${BACKUP_RETENTION_DAYS:-14}"

mkdir -p "$backup_dir"

pg_dump \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --file="$backup_dir/poncho_${timestamp}.sql"

find "$backup_dir" -type f -name "poncho_*.sql" -mtime +"$retention_days" -delete
