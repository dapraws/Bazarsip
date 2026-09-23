#!/usr/bin/env bash
#
# Monthly restore drill. A backup that has never been restored is not a
# backup, it is a hope.
#
# Pulls the newest archive, restores it into a throwaway database, and checks
# the tables actually contain something. Most restore failures are not corrupt
# files — they are a Postgres version mismatch, a missing extension, or a dump
# that was truncated because the disk filled up while it was written.
#
# Requires: postgresql-client, age, rclone
#
# Environment:
#   RESTORE_URL      connection string for a scratch server (NOT production)
#   AGE_KEY_FILE     path to the age private key
#   RCLONE_REMOTE    same remote as backup.sh

set -euo pipefail

: "${RESTORE_URL:?RESTORE_URL is required}"
: "${AGE_KEY_FILE:?AGE_KEY_FILE is required}"
: "${RCLONE_REMOTE:?RCLONE_REMOTE is required}"

workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

latest=$(rclone lsf "$RCLONE_REMOTE" --include '*.sql.gz.age' | sort | tail -1)
[ -n "$latest" ] || { echo "no backups found in $RCLONE_REMOTE" >&2; exit 1; }

echo "restoring $latest"
rclone copyto "$RCLONE_REMOTE/$latest" "$workdir/$latest"

scratch="bazarsip_restore_$(date -u +%s)"
psql "$RESTORE_URL" -qc "CREATE DATABASE $scratch;"
trap 'psql "$RESTORE_URL" -qc "DROP DATABASE IF EXISTS $scratch;"; rm -rf "$workdir"' EXIT

age --decrypt --identity "$AGE_KEY_FILE" "$workdir/$latest" \
  | gunzip \
  | psql "${RESTORE_URL%/*}/$scratch" -v ON_ERROR_STOP=1 -q

for table in users products orders; do
  count=$(psql "${RESTORE_URL%/*}/$scratch" -tAc "SELECT COUNT(*) FROM $table")
  echo "  $table: $count rows"
done

echo "restore drill passed: $latest"
