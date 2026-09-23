#!/usr/bin/env bash
#
# Nightly database backup: dump -> compress -> encrypt -> offsite -> ping.
#
# Every step must succeed for the healthcheck to be pinged. A silent failure
# is the way backups actually die: the cron keeps running, writes nothing, and
# nobody notices until the day it is needed. The ping is a dead man's switch —
# healthchecks.io alerts when it *stops* arriving, not when it errors.
#
# Requires: postgresql-client, age, rclone
#
# Environment:
#   DATABASE_URL        postgres connection string
#   AGE_RECIPIENT       age public key (age1...). The private key lives
#                       somewhere other than this server — if the box is
#                       compromised along with the key, the encryption bought
#                       nothing.
#   RCLONE_REMOTE       configured remote and bucket, e.g. r2:bazarsip-backup
#   HEALTHCHECK_URL     ping on success
#
# Cron (daily at 02:15):
#   15 2 * * * /srv/bazarsip/scripts/backup.sh >> /var/log/bazarsip-backup.log 2>&1

set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${AGE_RECIPIENT:?AGE_RECIPIENT is required}"
: "${RCLONE_REMOTE:?RCLONE_REMOTE is required}"

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

archive="$workdir/bazarsip-$stamp.sql.gz.age"

echo "[$(date -uIs)] dumping"
pg_dump --no-owner --no-privileges "$DATABASE_URL" \
  | gzip -9 \
  | age --recipient "$AGE_RECIPIENT" --output "$archive"

# A dump that produced almost nothing means the pipe failed somewhere that
# did not set an exit code. Better to fail here than to upload an empty file
# over a good one.
size=$(wc -c < "$archive")
if [ "$size" -lt 1024 ]; then
  echo "backup is only ${size} bytes — refusing to upload" >&2
  exit 1
fi

echo "[$(date -uIs)] uploading ${size} bytes"
rclone copyto "$archive" "$RCLONE_REMOTE/$(basename "$archive")"

if [ -n "${HEALTHCHECK_URL:-}" ]; then
  curl -fsS --retry 3 --max-time 15 "$HEALTHCHECK_URL" > /dev/null
fi

echo "[$(date -uIs)] done: $(basename "$archive")"
