# 🚀 READY TO DEPLOY — FINAL CHECKLIST

**Generated:** 2026-10-18 07:11:56 UTC  
**Status:** ✅ Code Committed & Ready for Deployment  
**Next:** 6 simple steps to go live

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Code Changes
- [x] Neon DB schema created (verified)
- [x] Supabase SDK removed from codebase
- [x] Vercel Blob integrated
- [x] All route files tested and working
- [x] Environment variables configured
- [x] All changes committed to git

### ⏳ User Action Required (Your Machine)

#### Step 1: Export Data from Supabase (Choose A or B)

**Option A: Via pg_dump (Recommended)**

```bash
# Install PostgreSQL client tools if not already:
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: apt install postgresql-client

# Export from Supabase:
pg_dump "postgresql://postgres:sHWsc.\$*?zhm8%?@db.wfyvfmdbcrknymgllrzm.supabase.co:5432/postgres" \
  --data-only \
  --no-owner \
  --no-privileges \
  > supabase_backup.sql

# This creates supabase_backup.sql in your current directory
```

**Option B: Manual CSV Export**

1. Open Supabase Dashboard → SQL Editor
2. For each table, run:
   ```sql
   -- Save output to CSV for each
   SELECT * FROM subjects;
   SELECT * FROM tasks;
   SELECT * FROM events;
   SELECT * FROM notes;
   SELECT * FROM dashboard_settings;
   ```

**Option C: Start Empty (Skip data for now)**

```bash
# No export needed - deploy with empty schema
# Data can be populated via API later
```

#### Step 2: Import Data to Neon (If you have backup.sql)

```bash
# From project root:
npm run migrate:import-dump ./supabase_backup.sql
```

#### Step 3: Test Locally

```bash
npm install
npm run dev

# In another terminal, test:
curl http://localhost:3000/api/health
# Should return: {"status":"ok"}
```

#### Step 4: Setup Vercel Blob Storage

1. Go to **Vercel Dashboard**
2. Select your **project**
3. Go to **Settings** → **Storage**
4. Click **"Create Database"**
5. Choose **"Blob"**
6. Name: `uploads` (or your preference)
7. Region: **US** (or nearest to you)
8. Click **"Create"**
9. ✅ `BLOB_READ_WRITE_TOKEN` auto-created

#### Step 5: Update Vercel Environment Variables

1. **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Add/Update these variables for all environments (Production, Preview, Development):

```
DATABASE_URL
Value: postgresql://neondb_owner:npg_XPKD0N6Gmlfh@ep-proud-frog-b3l1y2hl-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

BLOB_READ_WRITE_TOKEN
Value: (should already exist from Blob storage setup)

NODE_ENV
Value: production
```

3. **Delete** these if they exist:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

#### Step 6: Deploy to Vercel

```bash
# Push code to GitHub (Vercel monitors this)
git push origin main

# Or deploy directly:
vercel --prod
```

---

## 🔍 POST-DEPLOYMENT VERIFICATION

### Check Vercel Deployment
```
1. Go to Vercel Dashboard
2. Watch deployment logs (should finish in 2-3 minutes)
3. Check "Deployments" tab for status
4. Look for any error messages
```

### Test Production Endpoints

```bash
# Get your Vercel deployment URL (e.g., https://dashboard-matkul.vercel.app)

# 1. Health check
curl https://YOUR-VERCEL-URL/api/health
# Expected: {"status":"ok"}

# 2. Get subjects
curl https://YOUR-VERCEL-URL/api/subjects
# Expected: JSON array of subjects (empty if no data migrated)

# 3. Create subject
curl -X POST https://YOUR-VERCEL-URL/api/subjects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Subject","code":"TEST101","lecturer":"Test","credits":3}'
# Expected: 201 with subject data

# 4. Test file upload
curl -X POST https://YOUR-VERCEL-URL/api/upload \
  -F "file=@/path/to/test.txt"
# Expected: {"url":"https://...blob.vercel-storage.com/..."}
```

### Monitor Databases

**Neon Dashboard:**
- https://console.neon.tech
- Check "Monitoring" tab
- Look for query performance, connection count

**Vercel Dashboard:**
- Check "Deployments" → Runtime Logs
- Look for any database errors

---

## 📚 REFERENCE GUIDES

| Document | Purpose |
|----------|---------|
| `MIGRATION_NEON_VERCEL_BLOB.md` | Full deployment walkthrough (45 pages) |
| `MIGRATION_DATA_GUIDE.md` | Data migration options + troubleshooting |
| `MIGRATION_COMPLETION_REPORT.md` | Technical summary + statistics |
| `AUDIT_FINAL.md` | Code audit results |

---

## 🎯 QUICK REFERENCE COMMANDS

```bash
# Local development
npm install                  # Install dependencies
npm run dev                  # Start dev server
npm run db:verify            # Test Neon connection
npm run migrate:import-dump ./backup.sql  # Import data

# View logs
npm run dev                  # See server logs
# Vercel: Dashboard → Deployments → [latest] → Runtime Logs

# View database
# Neon: https://console.neon.tech → your project → SQL Editor
# Verify data exists after migration
```

---

## ⚠️ TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| **"Cannot connect to database"** | Check DATABASE_URL in Vercel env vars |
| **"File upload returns 500"** | Check BLOB_READ_WRITE_TOKEN is set in Vercel |
| **"Connection pool exhausted"** | Normal for serverless; pool.js handles it |
| **"Data didn't migrate"** | Check migration script output, retry import |
| **"pg_dump command not found"** | Install PostgreSQL client tools |
| **"Blob file returns 404"** | File might not be uploaded; check upload endpoint |

---

## 📊 WHAT YOU NOW HAVE

### Production Stack
- ✅ **Database**: Neon PostgreSQL (managed, auto-scaling)
- ✅ **Storage**: Vercel Blob (CDN-backed, fast)
- ✅ **Hosting**: Vercel (serverless, auto-scaling)
- ✅ **Pooling**: Connection pooled (optimized for serverless)
- ✅ **SSL**: Auto-enabled for all databases
- ✅ **Backups**: Automatic (Neon)
- ✅ **Monitoring**: Built-in dashboards

### Cost Breakdown
| Service | Free Tier | Pricing |
|---------|-----------|---------|
| Neon DB | 3 GB storage | $0.135/GB/month |
| Vercel Blob | 100 GB bandwidth | Pay-as-you-go |
| Vercel Hosting | 100 GB bandwidth | Free for hobby, $20/mo Pro |

---

## ✨ DEPLOYMENT SUMMARY

**What's Ready:**
- ✅ Code fully migrated & tested
- ✅ Neon DB schema created
- ✅ Vercel Blob integration complete
- ✅ All configuration files updated
- ✅ Migration scripts provided

**What You Need to Do:**
1. Export data from Supabase (pg_dump or CSV)
2. Import to Neon (npm run migrate:import-dump)
3. Setup Vercel Blob storage
4. Update Vercel environment variables
5. Push code to GitHub
6. Verify production endpoints

**Estimated Time:** 15-30 minutes

---

## 🎊 YOU'RE READY!

All infrastructure migration complete. Just follow the 6 steps above and your app will be **live on Neon DB + Vercel Blob** in production.

**Questions?** Check the markdown guides or Neon/Vercel docs.

**Good luck! 🚀**
