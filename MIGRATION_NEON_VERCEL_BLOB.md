# Migrasi Supabase → Neon DB + Vercel Blob

**Status:** ✅ Kode sudah siap untuk migrasi  
**Tanggal:** 18 Oktober 2026

---

## 📋 Ringkasan Perubahan

### Dependencies
- ✅ Installed: `@vercel/blob` (Vercel Blob Storage)
- ✅ Removed: `@supabase/supabase-js` (tidak lagi diperlukan untuk database atau storage)

### File yang Diubah
| File | Perubahan |
|------|-----------|
| `package.json` | Tambah `@vercel/blob`, hapus `@supabase/supabase-js`, tambah npm script `db:verify` |
| `backend/db/pool.js` | Update komentar SSL untuk Neon (sudah siap auto-detect `neon.tech`) |
| `backend/routes/upload.js` | Rewrite: Supabase Storage → `@vercel/blob` API |
| `backend/scripts/setup_db.js` | Update komentar (dari Supabase-specific menjadi generic) |
| `config/.env.example` | Template env vars: Neon DB + Vercel Blob token |
| `.env` | Placeholder env vars untuk Neon + Vercel Blob |

### File yang Dihapus
| File | Alasan |
|------|--------|
| `backend/db/supabase.js` | Tidak diperlukan — database sudah ke Neon, storage sudah ke Vercel Blob |

### File yang TIDAK Berubah
- Semua route files (`subjects.js`, `tasks.js`, `events.js`, `notes.js`, dll.)
- `backend/schema.sql` dan semua migration files (100% PostgreSQL standar, kompatibel dengan Neon)
- `backend/server.js`, `vercel.json`
- Semua frontend files

---

## 🚀 Langkah-Langkah Deployment

### Fase 1: Setup Neon Database

#### 1.1 Buat Project di Neon
1. Buka https://console.neon.tech
2. Sign up / Login dengan GitHub atau email
3. Klik **"Create Project"**
4. Isi nama project: `dashboard-matkul` (atau nama sesuai preferensi)
5. Pilih region: **US East (us-east-1)** atau pilih terdekat dengan lokasi Anda
6. Klik **"Create Project"**

#### 1.2 Dapatkan Connection String (Pooled Mode)
1. Setelah project dibuat, buka tab **"Connection"**
2. Di dropdown **"Connection string"**, pilih **"Pooled connection"** (bukan "Direct connection")
3. Pastikan **"Database"** = `neondb` dan **"Role"** = `postgres`
4. Copy connection string yang muncul:
   ```
   postgresql://postgres:[password]@ep-xxx-pooler.us-east-1.neon.tech/neondb?sslmode=require
   ```
   **PENTING:** Gunakan `-pooler.` bukan `-` (direct connection). Pooled connection optimal untuk serverless Vercel.

#### 1.3 Update `.env` dengan Connection String
Edit file `.env` di root project:
```bash
DATABASE_URL=postgresql://postgres:[password]@ep-xxx-pooler.us-east-1.neon.tech/neondb?sslmode=require
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx
PORT=3000
NODE_ENV=development
```

#### 1.4 Verifikasi Koneksi Lokal
Jalankan health check script untuk memastikan koneksi ke Neon berhasil:
```bash
npm run db:verify
```

**Output yang diharapkan:**
```
=== Neon DB Verification ===

1. Testing basic connection...
   ✓ Connection successful

2. Checking tables exist...
   ✓ Found tables: ...

...

=== All Verifications Passed ===

Neon DB is ready for production use.
```

**Troubleshooting jika gagal:**
- Pastikan password di connection string sesuai (case-sensitive)
- Pastikan `-pooler.` ada di connection string (bukan direct connection)
- Periksa firewall — mungkin IP Anda tidak di-allowlist Neon (Neon otomatis allow semua IP di free tier)
- Copy kembali connection string dari Neon console

#### 1.5 Setup Schema & Data
Jalankan setup database (create tables + migrations):
```bash
npm run db:setup
```

Jika ingin tambah data contoh:
```bash
npm run db:seed
```

---

### Fase 2: Setup Vercel Blob Storage

#### 2.1 Link Project ke Vercel
1. Pastikan project sudah di-push ke GitHub
2. Di command line:
   ```bash
   npm install -g vercel
   vercel login
   vercel link
   ```
3. Vercel akan membimbing setup project (authorize GitHub, pilih team, dll.)

#### 2.2 Buat & Link Vercel Blob Storage
1. Di Vercel Dashboard, buka project Anda
2. Buka tab **"Storage"** → **"Create Database"** (atau **"Create"**)
3. Pilih **"Blob"**
4. Isi nama: `uploads` (atau nama sesuai preferensi)
5. Pilih region: US atau terdekat dengan lokasi Anda
6. Klik **"Create"**
7. Vercel otomatis membuat env var `BLOB_READ_WRITE_TOKEN` dan ditambahkan ke `.vercel/.env.local` dan production env vars

#### 2.3 Verifikasi Token Lokal (Optional)
Untuk test lokal dengan Vercel Blob (tidak perlu untuk dev lokal):
1. Copy `BLOB_READ_WRITE_TOKEN` dari Vercel Dashboard → Settings → Environment Variables
2. Paste ke `.env` di project (sudah ada placeholder)

---

### Fase 3: Deploy ke Vercel

#### 3.1 Update Environment Variables di Vercel Dashboard
1. Buka Vercel Dashboard → Project Settings → **"Environment Variables"**
2. **Update** (bukan add, jika sudah ada):
   - `DATABASE_URL` → Neon connection string (pooled mode)
   - `BLOB_READ_WRITE_TOKEN` → (auto-created saat setup Blob, verify sudah ada)
3. **Hapus** (jika masih ada dari Supabase era):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

#### 3.2 Push Kode ke GitHub
```bash
git add -A
git commit -m "Migrasi Supabase ke Neon DB + Vercel Blob"
git push origin main
```

#### 3.3 Deploy
Automatic deployment akan trigger saat push ke `main` branch (jika sudah setup). Atau manual deploy:
```bash
vercel --prod
```

#### 3.4 Verifikasi Production
1. Buka dashboard di production URL Vercel
2. Cek endpoint `/api/health` — harus return `{"status":"ok"}`
3. Test upload file di UI — harus berhasil dan URL harus dari Vercel Blob domain
4. Test CRUD operasi di dashboard — harus bekerja seperti biasa

---

## 🧪 Verification Checklist

### Lokal Development
- [ ] `npm install` berhasil (termasuk `@vercel/blob`)
- [ ] `.env` sudah di-update dengan Neon connection string
- [ ] `npm run db:verify` return "All Verifications Passed"
- [ ] `npm run dev` server berjalan tanpa error
- [ ] Test endpoint `/api/health` return `{"status":"ok"}`
- [ ] Test POST `/api/upload` dengan file kecil — harus return URL dari `blob.vercel-storage.com`

### Production (Vercel)
- [ ] Environment variables di Vercel sudah update (DATABASE_URL, BLOB_READ_WRITE_TOKEN)
- [ ] Deploy berhasil (log di Vercel Dashboard tidak ada error database)
- [ ] Production health check (`/api/health`) berjalan
- [ ] Test CRUD operasi di dashboard — subjects, tasks, notes, events semuanya bekerja
- [ ] Test file upload — file harus tersimpan di Vercel Blob (URL dari `blob.vercel-storage.com`)

---

## 📝 Connection String Format

**Neon Pooled Connection (untuk serverless, RECOMMENDED):**
```
postgresql://postgres:PASSWORD@ep-ABC-pooler.us-east-1.neon.tech/neondb?sslmode=require
```
- `-pooler.` indicates connection pooling
- `:6543` port adalah default, tidak perlu ditulis eksplisit
- `?sslmode=require` mandatory untuk cloud database

**Neon Direct Connection (untuk local dev atau long-running apps, NOT recommended untuk Vercel):**
```
postgresql://postgres:PASSWORD@ep-ABC.us-east-1.neon.tech/neondb?sslmode=require
```
- Tidak ada `-pooler.`
- Dapat timeout atau error "too many connections" di Vercel serverless

**❌ JANGAN GUNAKAN:** Supabase pooler connection lama dari `.env` lama
```
postgresql://postgres@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

---

## 🔧 Rollback Plan (Jika Diperlukan)

Jika ada masalah severe dan perlu kembali ke Supabase:

1. Revert kode:
   ```bash
   git revert HEAD~1  # Revert migration commit
   git push origin main
   ```

2. Di Vercel, revert env var:
   ```
   DATABASE_URL = postgresql://postgres:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   SUPABASE_URL = https://...supabase.co
   SUPABASE_ANON_KEY = ...
   ```

3. Re-deploy

---

## 📖 Referensi

- **Neon Documentation:** https://neon.tech/docs
- **Vercel Blob Docs:** https://vercel.com/docs/storage/vercel-blob
- **PostgreSQL Connection Pooling:** https://www.postgresql.org/docs/current/runtime-config-connection-default.html

---

## ❓ FAQ

**Q: Apakah schema SQL saya kompatibel dengan Neon?**  
A: Ya, 100%. Neon adalah PostgreSQL 15+, dan schema.sql Anda menggunakan standard PostgreSQL syntax saja (BIGSERIAL, TIMESTAMPTZ, CHECK, indexes, FK). Tidak ada Supabase-specific features.

**Q: Biaya Neon berapa?**  
A: Free tier: 3 GB storage, unlimited API calls. Paid: $0.135/GB/bulan. Detail: https://neon.tech/pricing

**Q: Biaya Vercel Blob berapa?**  
A: Free tier: 100 GB bandwidth, pay-as-you-go storage. Paid per GB. Detail: https://vercel.com/pricing

**Q: Apakah Vercel Blob bisa autocomplete/autocreate bucket?**  
A: Ya, `put()` dari `@vercel/blob` otomatis create bucket jika tidak ada (aman untuk storage yang random-named files).

**Q: Kenapa harus pooled connection, bukan direct?**  
A: Direct connection: setiap serverless function invocation membuka connection baru ke database. Bisa hit connection limit (20-30 connections di free tier). Pooled connection: reuse connections via pooler, jauh lebih efisien.

**Q: Bagaimana monitoring & logs?**  
A: 
- **Neon logs:** Neon Dashboard → Monitoring
- **Vercel logs:** Vercel Dashboard → Deployments → [latest] → Runtime Logs
- **Query logs:** Neon Console → Query Insights (untuk slow queries)

---

## ✅ Migrasi Selesai

Semua kode sudah diupdate. File-file siap untuk deployment ke Neon DB + Vercel Blob. Ikuti langkah-langkah di atas untuk setup infrastruktur dan deploy.

Pertanyaan? Check FAQ di atas atau referensi dokumentasi resmi.
