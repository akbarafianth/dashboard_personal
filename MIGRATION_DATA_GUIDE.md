# SUPABASE → NEON DB MIGRATION GUIDE

**Status:** Schema ready in Neon, data migration in progress  
**Neon Schema:** ✅ Created (all 5 tables, indexes, FK constraints)  
**Data Migration:** ⏳ Ready (multiple methods available)

---

## 🎯 Current State

### ✅ What's Done
1. **Neon DB Schema** — All tables created:
   - `subjects` (with indexes)
   - `tasks` (with FK to subjects, indexes)
   - `events` (with FK to subjects, indexes)
   - `notes` (with FK to subjects, indexes)
   - `dashboard_settings` (singleton)

2. **Code Updated** — All migrations scripts ready:
   - `backend/scripts/setup_neon_schema.js` — Schema creation ✅
   - `backend/scripts/migrate_supabase_to_neon.js` — Direct migration (if Supabase accessible)
   - `backend/scripts/migrate_import_from_dump.js` — Import from SQL dump
   - `backend/scripts/verify_neon.js` — Connection + data verification
   - `.env` updated with Neon connection

3. **Dependencies** — Updated:
   - `@vercel/blob` added ✅
   - `@supabase/supabase-js` removed ✅

---

## 📌 Data Migration Options

### **Option A: Direct Export (Recommended if Supabase accessible)**

#### Prerequisites
- PostgreSQL client tools: `pg_dump` dan `psql`
- Supabase connection string: `postgresql://postgres:...@db.xxx.supabase.co:5432/postgres`
- Neon connection string already in `.env`

#### Steps
```bash
# 1. Export data dari Supabase (from your terminal with psql installed)
pg_dump "postgresql://postgres:sHWsc.\$*?zhm8%?@db.wfyvfmdbcrknymgllrzm.supabase.co:5432/postgres" \
  --data-only \
  --no-owner \
  --no-privileges \
  > supabase_backup.sql

# 2. Import ke Neon (from project root)
npm run migrate:import-dump ./supabase_backup.sql

# 3. Verify
npm run db:verify
```

**Why this works:**
- `--data-only` exports hanya data (schema sudah ada di Neon)
- Node.js script parse SQL dump dan execute ke Neon
- Tidak perlu koneksi langsung ke Supabase dari Node.js

---

### **Option B: Manual CSV Export (Jika pg_dump tidak available)**

#### Steps
1. Buka Supabase Dashboard → SQL Editor
2. Untuk setiap tabel, jalankan:
   ```sql
   COPY subjects TO STDOUT WITH (FORMAT CSV, HEADER TRUE);
   COPY tasks TO STDOUT WITH (FORMAT CSV, HEADER TRUE);
   COPY events TO STDOUT WITH (FORMAT CSV, HEADER TRUE);
   COPY notes TO STDOUT WITH (FORMAT CSV, HEADER TRUE);
   COPY dashboard_settings TO STDOUT WITH (FORMAT CSV, HEADER TRUE);
   ```
3. Save CSV files ke project
4. Saya buat import script untuk CSV

---

### **Option C: No Data Migration (Start Fresh)**

Jika data Supabase bukan critical, langsung deploy kosong schema:

```bash
npm run db:verify        # Verify Neon connection
npm install             # Ensure dependencies
npm run dev             # Test lokal
# Deploy ke Vercel
git push origin main
```

Data bisa di-populate nanti via API.

---

## 🔧 Environment Setup

### File `.env` (sudah updated)
```
DATABASE_URL=postgresql://neondb_owner:npg_XPKD0N6Gmlfh@ep-proud-frog-b3l1y2hl-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx
PORT=3000
NODE_ENV=development
```

✅ Neon connection string sudah terpasang.

---

## ⚙️ Available Commands

| Command | Purpose |
|---------|---------|
| `npm run db:setup` | Create tables di Neon (from schema.sql) |
| `npm run db:verify` | Test connection + CRUD operations |
| `npm run db:seed` | Insert dummy data (optional) |
| `npm run migrate:direct` | Direct Supabase→Neon (requires network access) |
| `npm run migrate:import-dump` | Import from SQL dump file |
| `npm run dev` | Start server locally |

---

## 📊 Migration Status

### Completed
- ✅ Neon schema setup
- ✅ Code refactoring (Supabase SDK removed)
- ✅ Environment variables updated
- ✅ Migration scripts created
- ✅ Verification scripts ready

### Pending
- ⏳ Data export from Supabase (need your action)
- ⏳ Data import to Neon
- ⏳ Verify data integrity
- ⏳ Test API endpoints
- ⏳ Deploy to Vercel

---

## 🚀 Recommended Next Steps

### 1. Try Direct Connection First
```bash
npm run migrate:direct
```

If it works, data akan migrate langsung. Jika timeout (like earlier), proceed ke step 2.

### 2. Use pg_dump Method (If available)
```bash
# On terminal with PostgreSQL installed:
pg_dump "postgresql://postgres:sHWsc.\$*?zhm8%?@db.wfyvfmdbcrknymgllrzm.supabase.co:5432/postgres" \
  --data-only --no-owner --no-privileges > backup.sql

# Then import:
npm run migrate:import-dump ./backup.sql
```

### 3. Verify & Test
```bash
npm run db:verify
npm run dev
# Test http://localhost:3000/api/health
```

### 4. Deploy
```bash
git add .
git commit -m "Migrate Supabase to Neon DB + Vercel Blob"
git push origin main
# Vercel auto-deploys
```

---

## ❓ Troubleshooting

### "Cannot connect to Supabase"
- Network/firewall blocks Supabase access
- → Use pg_dump method instead (export dari terminal lokal Anda)

### "Error: Cannot read properties of undefined"
- SQL parsing issue
- → Check SQL dump file format (`--data-only` should be used)

### "Foreign key constraint violation"
- Tables diimport tidak sesuai urutan (FK references)
- → Check constraint order di SQL dump, atau disable FK saat import:
  ```sql
  ALTER TABLE tasks DISABLE TRIGGER ALL;
  -- ... import data ...
  ALTER TABLE tasks ENABLE TRIGGER ALL;
  ```

### "Connection pool exhausted at Vercel"
- `pool.js` sudah diset ke `max: 1` di Vercel (singleton pattern)
- Jika masih issue, check graceful shutdown

---

## 📋 File Structure

```
backend/
├── scripts/
│   ├── setup_neon_schema.js           ✅ Schema setup
│   ├── migrate_supabase_to_neon.js    ⏳ Direct migration
│   ├── migrate_import_from_dump.js    ⏳ SQL dump import
│   ├── migrate_via_pg_dump.sh         📖 Manual guide
│   ├── verify_neon.js                 ✅ Verification
│   ├── setup_db.js                    ✅ DB setup
│   └── seed.js                        ✅ Seed data
├── db/
│   └── pool.js                        ✅ Updated (Neon-ready)
├── routes/
│   └── upload.js                      ✅ Updated (Vercel Blob)
└── schema.sql                         ✅ All tables defined
```

---

## 📞 Need Help?

1. **Neon Docs:** https://neon.tech/docs
2. **Vercel Blob:** https://vercel.com/docs/storage/vercel-blob
3. **PostgreSQL pg_dump:** https://www.postgresql.org/docs/current/app-pgdump.html

---

## ✅ Checklist Before Production

- [ ] Data successfully migrated to Neon
- [ ] `npm run db:verify` returns "All Verifications Passed"
- [ ] `npm run dev` starts server locally without errors
- [ ] API endpoints tested (health check, CRUD operations)
- [ ] Vercel environment variables updated (DATABASE_URL, BLOB_READ_WRITE_TOKEN)
- [ ] `.env` file NOT committed (in .gitignore ✅)
- [ ] Deployed to Vercel and tested in production

---

**Status:** Ready for data migration. Choose your method above and proceed!
