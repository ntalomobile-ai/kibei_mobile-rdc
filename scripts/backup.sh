#!/bin/bash

# KiBei Database Backup Script
# Usage: ./scripts/backup.sh

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/kibei_${TIMESTAMP}.sql.gz"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

echo "🔄 Starting database backup..."
echo "📁 Backup file: ${BACKUP_FILE}"

# Backup database
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set"
    exit 1
fi

# Extract credentials from DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_URL="${DATABASE_URL}"

# Perform backup
pg_dump "$DB_URL" | gzip > "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
    SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "✅ Backup successful!"
    echo "📊 Size: ${SIZE}"
    
    # Optional: Upload to cloud storage (Google Cloud Storage, AWS S3, etc)
    # gsutil cp "${BACKUP_FILE}" gs://kibei-backups/
    # aws s3 cp "${BACKUP_FILE}" s3://kibei-backups/
    
    # Cleanup old backups (keep last 7 days)
    find "${BACKUP_DIR}" -name "kibei_*.sql.gz" -mtime +7 -delete
    echo "🧹 Cleaned up old backups"
else
    echo "❌ Backup failed"
    exit 1
fi

echo ""
echo "⏰ Backup completed at $(date)"
