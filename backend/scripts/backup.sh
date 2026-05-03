#!/usr/bin/env bash
set -euo pipefail

: "${MONGO_URI:?MONGO_URI is required}"

BACKUP_DIR=${BACKUP_DIR:-./backups}
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TARGET_DIR="${BACKUP_DIR}/${TIMESTAMP}"

mkdir -p "${TARGET_DIR}"

mongodump --uri="${MONGO_URI}" --out="${TARGET_DIR}"

echo "Backup written to ${TARGET_DIR}"
