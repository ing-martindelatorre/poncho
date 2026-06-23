#!/bin/sh
set -eu

timestamp="$(date +%Y%m%d_%H%M%S)"
backup_dir="${BACKUP_DIR:-/backups}"
retention_days="${BACKUP_RETENTION_DAYS:-14}"
uploads_dir="${UPLOADS_DIR:-/uploads}"

mkdir -p "$backup_dir"

pg_dump \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --file="$backup_dir/poncho_${timestamp}.sql"

if [ -d "$uploads_dir" ]; then
  tar -czf "$backup_dir/poncho_uploads_${timestamp}.tar.gz" -C "$uploads_dir" .
fi

find "$backup_dir" -type f -name "poncho_*.sql" -mtime +"$retention_days" -delete
find "$backup_dir" -type f -name "poncho_uploads_*.tar.gz" -mtime +"$retention_days" -delete
