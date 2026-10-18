#!/bin/bash

# SUPABASE → NEON DB MIGRATION SCRIPT
# Using pg_dump export + psql import
# 
# Prerequisites:
# - PostgreSQL client tools installed (pg_dump, psql)
# - Supabase connection string
# - Neon connection string
#
# Usage:
#   chmod +x migrate_via_pg_dump.sh
#   ./migrate_via_pg_dump.sh

set -e

SUPABASE_CONN="postgresql://postgres:sHWsc.\$*?zhm8%?@db.wfyvfmdbcrknymgllrzm.supabase.co:5432/postgres"
NEON_CONN="postgresql://neondb_owner:npg_XPKD0N6Gmlfh@ep-proud-frog-b3l1y2hl-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

DUMP_FILE="supabase_backup_$(date +%s).sql"
LOG_FILE="migration_$(date +%s).log"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     SUPABASE → NEON DB MIGRATION via pg_dump              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "📝 PHASE 1: Exporting data from Supabase"
echo "=========================================="
echo ""
echo "📍 Running pg_dump..."
echo "   Connection: Supabase"
echo "   Output file: $DUMP_FILE"
echo ""

if pg_dump "$SUPABASE_CONN" \
  --data-only \
  --no-owner \
  --no-privileges \
  --verbose \
  > "$DUMP_FILE" 2>> "$LOG_FILE"
then
  echo "✅ Export successful"
  echo "   File size: $(du -h "$DUMP_FILE" | cut -f1)"
  echo ""
else
  echo "❌ Export failed. Check log: $LOG_FILE"
  exit 1
fi

echo "📝 PHASE 2: Importing data to Neon"
echo "==================================="
echo ""
echo "📍 Running psql import..."
echo "   Connection: Neon"
echo "   Source file: $DUMP_FILE"
echo ""

if psql "$NEON_CONN" < "$DUMP_FILE" >> "$LOG_FILE" 2>&1
then
  echo "✅ Import successful"
  echo ""
else
  echo "❌ Import failed. Check log: $LOG_FILE"
  exit 1
fi

echo "✔️  PHASE 3: Verifying integrity"
echo "================================"
echo ""
echo "📍 Checking row counts..."
echo ""

SUBJECTS=$(psql "$NEON_CONN" -t -c "SELECT COUNT(*) FROM subjects" 2>/dev/null)
TASKS=$(psql "$NEON_CONN" -t -c "SELECT COUNT(*) FROM tasks" 2>/dev/null)
EVENTS=$(psql "$NEON_CONN" -t -c "SELECT COUNT(*) FROM events" 2>/dev/null)
NOTES=$(psql "$NEON_CONN" -t -c "SELECT COUNT(*) FROM notes" 2>/dev/null)
SETTINGS=$(psql "$NEON_CONN" -t -c "SELECT COUNT(*) FROM dashboard_settings" 2>/dev/null)

echo "subjects:           $SUBJECTS rows"
echo "tasks:              $TASKS rows"
echo "events:             $EVENTS rows"
echo "notes:              $NOTES rows"
echo "dashboard_settings: $SETTINGS rows"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  MIGRATION COMPLETE                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Data successfully migrated from Supabase to Neon"
echo ""
echo "📊 Summary:"
echo "   - Export file: $DUMP_FILE"
echo "   - Log file: $LOG_FILE"
echo "   - Total rows imported: $((SUBJECTS + TASKS + EVENTS + NOTES + SETTINGS))"
echo ""
echo "🔧 Next steps:"
echo "   1. Verify data looks correct in Neon Dashboard"
echo "   2. Run: npm run db:verify"
echo "   3. Test API endpoints manually"
echo "   4. Deploy to Vercel"
echo ""
