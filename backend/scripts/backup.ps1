$ErrorActionPreference = "Stop"

if (-not $env:MONGO_URI) {
  throw "MONGO_URI is required"
}

$backupDir = $env:BACKUP_DIR
if (-not $backupDir) {
  $backupDir = ".\\backups"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$targetDir = Join-Path $backupDir $timestamp

New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

mongodump --uri="$env:MONGO_URI" --out="$targetDir"

Write-Host "Backup written to $targetDir"
