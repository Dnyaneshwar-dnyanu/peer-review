#!/usr/bin/env bash
set -euo pipefail

: "${MONGO_URI:?MONGO_URI is required}"
: "${BACKUP_PATH:?BACKUP_PATH is required}"

mongorestore --uri="${MONGO_URI}" --drop "${BACKUP_PATH}"

echo "Restore completed from ${BACKUP_PATH}"
