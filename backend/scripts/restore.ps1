$ErrorActionPreference = "Stop"

if (-not $env:MONGO_URI) {
  throw "MONGO_URI is required"
}

if (-not $env:BACKUP_PATH) {
  throw "BACKUP_PATH is required"
}

mongorestore --uri="$env:MONGO_URI" --drop "$env:BACKUP_PATH"

Write-Host "Restore completed from $env:BACKUP_PATH"
