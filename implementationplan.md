# Implementation Plan — AcademIQ Dashboard Bug Fix & Improvement

> **ATURAN WAJIB:** Sebelum mengerjakan task apapun dari plan ini, AI WAJIB membaca
> `contract/agents/contract.md` dan `contract/agents/database_contract.md` secara penuh.
> Kedua file tersebut berlaku sebagai aturan operasi yang TIDAK BOLEH dilanggar.

---

## Cara Menggunakan File Ini

### Tracking Progress
- Setiap task memiliki checkbox `[ ]` (pending) atau `[x]` (selesai)
- Setelah menyelesaikan setiap task/batch, AI WAJIB:
  1. Update checkbox menjadi `[x]` di file ini
  2. Tambahkan tanggal penyelesaian di kolom "Selesai"
  3. Tambahkan catatan singkat jika ada perubahan dari rencana awal
  4. Update `[CHANGELOG]` di `contract/agents/contract.md` sesuai SOP
- Jika task dibatalkan atau ditunda, tandai dengan `[~]` dan berikan alasan

### Strategi Eksekusi
- **Fix kecil** (estimasi <15 menit): boleh di-batch dalam satu sesi
- **Fix besar** (estimasi >15 menit): kerjakan satu-per-satu, konfirmasi ke user sebelum lanjut
- Ikuti urutan Phase & Task Number — jangan loncat kecuali user minta

### Sebelum Setiap Task
1. Baca `contract/agents/contract.md` + `contract/agents/database_contract.md`
2. Audit file-file yang akan disentuh
3. Cek apakah ada konflik dengan keputusan yang sudah tercatat
4. Jika ada ambiguitas → tanya user dulu

### Setelah Setiap Task
1. Jalankan checklist dari contract.md Section 5
2. Untuk task database: jalankan checklist dari database_contract.md Section 5
3. Update file ini (checkbox + tanggal)
4. Update CHANGELOG di contract.md

---

## Phase 1: Critical Syntax & Rendering Fixes

> Prioritas tertinggi — website tidak berfungsi tanpa fix ini

### Batch 1A: Fix Escaped Backticks (4 file JS)

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 1.1 | Ganti semua `\`` dengan backtick biasa di template literals | `assets/js/notes-data.js` | 115, 122, 141, 149, 157, 168 | 15m | [x] | 2026-09-16 |
| 1.2 | Ganti semua `\`` dengan backtick biasa di template literals | `assets/js/subjects-data.js` | 58, 114 | 10m | [x] | 2026-09-16 |
| 1.3 | Ganti semua `\`` dengan backtick biasa di template literals | `assets/js/todo-data.js` | 218, 220 | 10m | [x] | 2026-09-16 |
| 1.4 | Ganti semua `\`` dengan backtick biasa di template literals | `assets/js/toast.js` | 71, 106-115 | 10m | [x] | 2026-09-16 |

### Task 1B: Fix Missing Closing Brace

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 1.5 | Tambah `}` penutup untuk fungsi `deleteNote()` sebelum `async function loadNotes()` | `assets/js/notes-data.js` | 176 | 5m | [x] | 2026-09-16 |

### Task 1C: Fix Duplicate HTML

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 1.6 | Hapus duplikat section "Tips Manajemen Waktu" dan fix unclosed `<button>` | `pages/tugas_acara.html` | 179-225 | 15m | [x] | 2026-09-16 |

### Batch 1D: Fix Broken Navigation & Hardcoded Data

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 1.7 | Ganti `href="#"` ke `kalender_jadwal_tugas_acara.html` | `pages/dashboard_akademik_utama.html` | 143 | 2m | [x] | 2026-09-16 |
| 1.8 | Ganti `href="#"` ke `mata_kuliah_key_takeaways_pertemuan.html` | `pages/dashboard_akademik_utama.html` | 159 | 2m | [x] | 2026-09-16 |
| 1.9 | Ganti `href="#"` ke URL yang sesuai atau hapus jika RPS belum ada | `pages/dashboard_akademik_utama.html` | 333 | 2m | [x] | 2026-09-16 |
| 1.10 | Tambahkan `data-header-date` di elemen tanggal hardcoded "Rabu, 14 Mei 2025" | `pages/dashboard_akademik_utama.html` | 16, 141 | 5m | [x] | 2026-09-16 |
| 1.11 | Tambahkan `data-header-date` di elemen tanggal hardcoded | `pages/landing_page.html` | 85 | 5m | [x] | 2026-09-16 |
| 1.12 | Fix hardcoded semester conflict "GENAP" vs "Ganjil" | `pages/tugas_acara.html` | 23, 25, 39 | 5m | [x] | 2026-09-16 |
| 1.13 | Fix layout grid — pindah "Mata Kuliah Aktif" dan "Key Takeaways" ke dalam `lg:col-span-8` | `pages/dashboard_akademik_utama.html` | 150+ | 15m | [x] | 2026-09-16 |

**Catatan Batch 1D:** Semua fix di atas adalah perubahan HTML kecil yang bisa dikerjakan sekaligus.

---

## Phase 2: Security Fixes

> Menutup celah keamanan kritis sebelum menambah fitur

### Task 2A: Secure File Upload

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 2.1 | Tambah `fileFilter` untuk whitelist tipe file (image + pdf only) | `backend/routes/upload.js` | 7-19 | 20m | [x] | 2026-09-16 |
| 2.2 | Tambah `limits: { fileSize: 5 * 1024 * 1024 }` ke multer config | `backend/routes/upload.js` | 7-19 | 5m | [x] | 2026-09-16 |
| 2.3 | Ganti `Math.random()` dengan `crypto.randomUUID()` | `backend/routes/upload.js` | 16 | 5m | [x] | 2026-09-16 |
| 2.4 | Sanitize `file.originalname` (strip path chars, limit length) | `backend/routes/upload.js` | 17 | 10m | [x] | 2026-09-16 |
| 2.5 | Set `X-Content-Type-Options: nosniff` header pada static serving uploads | `backend/server.js` | 17 | 5m | [x] | 2026-09-16 |

### Task 2B: XSS Prevention (Frontend)

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 2.6 | Sanitize `note.content` sebelum `innerHTML` (gunakan DOMPurify atau `escapeHtml`) | `assets/js/notes-data.js` | 38, 99, 105 | 30m | [x] | 2026-09-16 |
| 2.7 | Escape `message` parameter di toast `innerHTML` | `assets/js/toast.js` | 21 | 10m | [x] | 2026-09-16 |
| 2.8 | Escape search results (`item.title`, `item.meta`) sebelum render | `assets/js/toast.js` | 109, 112 | 10m | [x] | 2026-09-16 |
| 2.9 | Escape `subject.grade` di `innerHTML` | `assets/js/subjects-data.js` | 58 | 5m | [x] | 2026-09-16 |

### Task 2C: PDF Export Sanitization

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 2.10 | Escape HTML entities di `note.title` dan sanitize `note.content` sebelum inject ke PDF HTML template | `backend/routes/notes.js` | 135, 143, 149 | 30m | [x] | 2026-09-16 |

### Task 2D: CORS & Security Headers

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 2.11 | Configure CORS origin whitelist (bukan wildcard) | `backend/server.js` | 15 | 15m | [x] | 2026-09-16 |
| 2.12 | Escape `%` dan `_` di search query sebelum ILIKE | `backend/routes/search.js` | 11 | 10m | [x] | 2026-09-16 |

### Task 2E: Input Validation Layer (Backend)

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 2.13 | Tambah validasi tipe/range untuk `is_all_day`, `priority`, `subject_id` | `backend/routes/events.js` | 7 | 20m | [x] | 2026-09-16 |
| 2.14 | Tambah validasi `status`, `estimated_hours`, `priority` | `backend/routes/tasks.js` | 7 | 20m | [x] | 2026-09-16 |
| 2.15 | Tambah validasi `gpa` range (0-4), `pomodoro_cycles` (>=0) | `backend/routes/settings.js` | 18 | 15m | [x] | 2026-09-16 |
| 2.16 | Tambah validasi `credits` (>=0), response rowCount check | `backend/routes/subjects.js` | 6, 37 | 15m | [x] | 2026-09-16 |
| 2.17 | Tambah response rowCount check di PUT settings | `backend/routes/settings.js` | 30 | 10m | [x] | 2026-09-16 |

---

## Phase 3: Functional Bug Fixes

> Memperbaiki logic error yang menyebabkan perilaku salah

### Task 3A: Calendar Date Navigation Bug

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 3.1 | Buat `new Date()` baru instead of mutating `selectedDate.setMonth()` | `assets/js/calendar-data.js` | 624-635 | 15m | [x] | 2026-09-16 |

### Task 3B: Dashboard Calendar False Positive

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 3.2 | Compare full date (year + month + day) bukan hanya `.getDate()` di `markedDays` | `assets/js/dashboard-data.js` | 188 | 15m | [x] | 2026-09-16 |

### Batch 3C: Toast & Polling Fixes

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 3.3 | Prevent repeated urgent task toast — track apakah sudah ditampilkan | `assets/js/dashboard-data.js` | 228-230 | 10m | [x] | 2026-09-16 |
| 3.4 | Prevent repeated urgent task toast | `assets/js/tasks-data.js` | 100-102 | 10m | [x] | 2026-09-16 |
| 3.5 | Tambah `if (!document.hidden)` check di polling | `assets/js/subjects-data.js` | 256 | 5m | [x] | 2026-09-16 |
| 3.6 | Tambah `if (!document.hidden)` check di polling | `assets/js/calendar-data.js` | 830 | 5m | [x] | 2026-09-16 |
| 3.7 | Tambah `if (!document.hidden)` check di polling | `assets/js/todo-data.js` | 348 | 5m | [x] | 2026-09-16 |

### Task 3D: GPA Grade Scale

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 3.8 | Tambah intermediate grades (A-, B+, B-, C+, C-, D+) ke `gradeWeights` | `assets/js/subjects-data.js` | 101 | 10m | [x] | 2026-09-16 |

### Task 3E: Pomodoro Timer Cleanup

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 3.9 | Store interval ID, clear on `beforeunload` | `assets/js/todo-data.js` | 237-255 | 15m | [x] | 2026-09-16 |

### Task 3F: Calendar Checkbox Persistence

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 3.10 | Panggil API untuk update task/event status saat checkbox toggled | `assets/js/calendar-data.js` | 599-614 | 30m | [x] | 2026-09-16 (Dibatalkan/Dihapus checkbox karena events tidak punya field status) |

### Task 3G: Backend Query Optimization

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 3.11 | Ganti 3 sequential `await` dengan `Promise.all()` di analytics | `backend/routes/analytics.js` | 8-10 | 10m | [x] | 2026-09-16 |
| 3.12 | Ganti 3 sequential `await` dengan `Promise.all()` di search | `backend/routes/search.js` | 12-14 | 10m | [x] | 2026-09-16 |
| 3.13 | Fix double `loadAnalytics()` call on init | `assets/js/tasks-data.js` | 98-99 | 5m | [x] | 2026-09-16 |

### Task 3H: Dashboard Calendar Sunday vs Monday Inconsistency

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 3.14 | Samakan dashboard mini-calendar ke Monday-first layout (konsisten dengan calendar-data.js) | `assets/js/dashboard-data.js` | 180-186 | 15m | [x] | 2026-09-16 |

---

## Phase 4: Responsive & UX Improvements

> Membuat website bisa digunakan di semua ukuran layar

### Task 4A: Responsive Sidebar (BESAR — konfirmasi dulu)

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 4.1 | Tambah hamburger toggle button (visible di `<lg` breakpoint) | Semua HTML pages (sidebar section) | - | 1h | [x] | 2026-09-16 |
| 4.2 | Sidebar default hidden di mobile (`-translate-x-full lg:translate-x-0`) | Semua HTML pages | - | 30m | [x] | 2026-09-16 |
| 4.3 | Overlay backdrop saat sidebar terbuka di mobile | Semua HTML pages + JS | - | 30m | [x] | 2026-09-16 |
| 4.4 | Toggle logic di JS (shared file `sidebar.js` di `assets/js/`) | `assets/js/sidebar.js` (baru) | - | 30m | [x] | 2026-09-16 |

### Batch 4B: Accessibility Quick Fixes

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 4.5 | Ganti `::-webkit-scrollbar{display:none}` dengan styled thin scrollbar atau hapus | Semua CSS files | 1 | 15m | [x] | 2026-09-16 |
| 4.6 | Tambah `<title>` tag di semua HTML pages | Semua HTML pages | head | 10m | [x] | 2026-09-16 |
| 4.7 | Tambah `role="dialog"` dan `aria-modal="true"` di semua modal | HTML pages with modals | - | 15m | [x] | 2026-09-16 |

---

## Phase 5: Code Quality & Maintainability

> Mengurangi technical debt dan code duplication

### Task 5A: Extract Shared Frontend Utils

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 5.1 | Buat `assets/js/shared-utils.js` berisi `API_BASE`, `escapeHtml()`, `renderHeaderDate()`, `syncChannel` setup | `assets/js/shared-utils.js` (baru) | - | 45m | [x] | 2026-09-16 |
| 5.2 | Hapus duplikasi dari 6 data files, gunakan dari shared-utils via `window.*` | Semua `*-data.js` files | - | 30m | [x] | 2026-09-16 |

### Task 5B: Merge Identical Config Files

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 5.3 | Merge 6 identical Tailwind config JS files ke 1 `assets/js/tailwind-config.js` | 6 config JS files | - | 20m | [x] | 2026-09-16 |
| 5.4 | Merge 6 identical CSS files ke 1 `assets/css/base.css` | 6 CSS files | - | 15m | [x] | 2026-09-16 |
| 5.5 | Update semua HTML `<script>`/`<link>` references ke file baru | Semua HTML pages | head | 15m | [x] | 2026-09-16 |

### Task 5C: Backend Shared Utilities

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 5.6 | Extract `validatePayload`, `buildInsert`, `buildUpdate` ke shared module di `backend/routes/` | `backend/routes/_helpers.js` (baru) | - | 30m | [x] | 2026-09-16 |

---

## Phase 6: Database & Migration Fixes

> Memperbaiki infrastruktur database — ikuti database_contract.md

### Task 6A: Migration Tracking System

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 6.1 | Buat tabel `schema_migrations(filename TEXT PK, applied_at TIMESTAMPTZ)` di migration runner | `backend/scripts/run_migrations.js` | 10-16 | 30m | [x] | 2026-09-16 |
| 6.2 | Skip migration yang sudah tercatat, wrap setiap migration dalam transaction | `backend/scripts/run_migrations.js` | 13-14 | 30m | [x] | 2026-09-16 |

### Task 6B: Fix Script Bugs

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 6.3 | Fix regex `/g` + `.test()` bug (lastIndex stale) — hapus `/g` flag atau reset `lastIndex` | `backend/scripts/remove_profile.js` | 22, 26-27 | 10m | [x] | 2026-09-16 |
| 6.4 | Ganti relative paths dengan `path.resolve(__dirname, ...)` di semua scripts | `backend/scripts/clean.js`, `remove_profile.js`, `sync.js` | - | 15m | [x] | 2026-09-16 |
| 6.5 | Hapus circular reference `pool.pool = pool` | `backend/db/pool.js` | 13 | 2m | [x] | 2026-09-16 |

### Task 6C: Schema Improvements

| # | Task | File | Line(s) | Est. | Status | Selesai |
|---|------|------|---------|------|--------|---------|
| 6.6 | Tambah index pada `tasks.subject_id`, `events.subject_id`, `notes.subject_id`, `tasks.status` | `backend/migrations/005_add_fk_indexes.sql` (baru) | - | 15m | [x] | 2026-09-16 |

---

## Phase 7: Nice-to-Have Enhancements (Opsional)

> Hanya dikerjakan jika semua Phase 1-6 selesai dan user minta secara eksplisit

| # | Task | Est. | Status | Selesai |
|---|------|------|--------|---------|
| 7.1 | Tambah pagination ke semua list API endpoints (`?limit=`) | 2h | [x] | 2026-09-16 |
| 7.2 | Tambah task status change UI di kanban board (drop-down select) | 3h | [x] | 2026-09-16 |
| 7.3 | Tambah authentication middleware (JWT/session) | 8-16h | [~] | Reverted — dashboard bersifat personal, tidak perlu auth/multi-user |
| 7.4 | Duplikat font load cleanup (Material Symbols) di semua pages | 15m | [x] | 2026-09-16 |
| 7.5 | Tambah pool error handler dan graceful shutdown (`SIGTERM`/`SIGINT`) | 30m | [x] | 2026-09-16 |
| 7.6 | Tambah request logging (morgan) dan rate limiting | 1h | [x] | 2026-09-16 |

---

## Phase 8: UI Consistency & Extra Fixes
> Tambahan penyempurnaan UI sesuai feedback

| # | Task | Est. | Status | Selesai |
|---|------|------|--------|---------|
| 8.1 | Hapus logo AcademIQ Workspace di sidebar (6 halaman) | 10m | [x] | 2026-09-16 |
| 8.2 | Hapus tombol "+ Tambah" di sebelah notifikasi header (6 halaman) | 10m | [x] | 2026-09-16 |
| 8.3 | Perbaiki posisi modal Tambah Tugas/Acara agar rata tengah (`flex`) | 5m | [x] | 2026-09-16 |
| 8.4 | Hapus tombol Impor Notability/GoodNotes | 5m | [x] | 2026-09-16 |
| 8.5 | Jadikan form Tulis Catatan Baru sebagai modal popup & fix JS error | 20m | [x] | 2026-09-16 |

---

## Phase 9: Database Setup & Refactoring
> Standarisasi setup dan relasi database

| # | Task | Est. | Status | Selesai |
|---|------|------|--------|---------|
| 9.1 | Update `schema.sql` (tambah index dari migration 005) | 10m | [x] | 2026-09-16 |
| 9.2 | Buat `setup_db.js` (wipe DB, load schema, initialize migrations) | 15m | [x] | 2026-09-16 |
| 9.3 | Buat `seed.js` (mock data dashboard, mata kuliah, dll) | 15m | [x] | 2026-09-16 |
| 9.4 | Optimasi `pool.js` (SSL, max connections 20, timeouts) | 10m | [x] | 2026-09-16 |
| 9.5 | Update query `GET` API (JOIN `subjects` di tasks, events, notes) | 20m | [x] | 2026-09-16 |
| 9.6 | Update Frontend Renderers (gunakan `subject_name` langsung dari API) | 15m | [x] | 2026-09-16 |
| 9.7 | Tambahkan skrip `db:setup` dan `db:seed` di package.json | 5m | [x] | 2026-09-16 |

---

## Phase 10: Supabase Migration & Configuration
> Penyesuaian infrastruktur agar sepenuhnya kompatibel dengan Supabase PostgreSQL

### 🚀 Panduan Konfigurasi Supabase (Step-by-Step)
**A. Konfigurasi di Dashboard Supabase:**
1. Login ke [Supabase](https://supabase.com) dan buat Project baru.
2. Tunggu proses _provisioning_ database (sekitar 1-2 menit).
3. Buka menu **Project Settings -> Database**.
4. Scroll ke bagian **Connection String** dan pilih opsi **Nodejs**.
5. Pastikan menggunakan port **5432** (Session Mode, bukan Transaction Mode/6543).
6. Copy _Connection String_ tersebut.

**B. Konfigurasi di Lokal (Codebase):**
1. Buka file `.env` di folder `config/` (jika belum ada, copy dari `.env.example`).
2. Hapus/comment _DATABASE_URL_ lama yang mengarah ke localhost.
3. Paste _Connection String_ dari Supabase. Jangan lupa ubah tulisan `[YOUR-PASSWORD]` dengan password database yang kamu buat di langkah A.
4. Buka terminal, jalankan `npm run db:setup` untuk membuat semua tabel aplikasi di Supabase.
5. Jalankan `npm run db:seed` untuk mengisi data dummy (opsional, jika ingin tabel tidak kosong).
6. Jalankan `npm run dev` — backend siap melayani via Supabase!

### Tasks
| # | Task | Est. | Status | Selesai |
|---|------|------|--------|---------|
| 10.1 | Update `.env.example` dengan instruksi Session Mode (5432) | 5m | [x] | 2026-09-16 |
| 10.2 | Update `pool.js` untuk auto-enable SSL pada host cloud | 5m | [x] | 2026-09-16 |
| 10.3 | Sesuaikan script `setup_db.js` agar aman (DROP spesifik app, abaikan system schema Supabase) | 15m | [x] | 2026-09-16 |
| 10.4 | Instal dependencies `@supabase/supabase-js` dan buat Supabase client singleton | 10m | [x] | 2026-09-17 |
| 10.5 | Ganti storage upload dari lokal (multer) ke Supabase Storage API | 45m | [x] | 2026-09-17 |
| 10.6 | **(Opsional)** Rombak polling 5 detik frontend menggunakan Supabase Realtime WebSockets | 2h | [~] | Ditunda — cukup polling untuk skala personal dashboard |

### Detail Implementasi Task 10.4 — Supabase JS Client Setup

**Tujuan:** Menyediakan Supabase client untuk fitur non-SQL seperti Storage API.

**Langkah-langkah:**
1. `npm install @supabase/supabase-js`
2. Buat file `backend/db/supabase.js` — singleton client:
   - Import `createClient` dari `@supabase/supabase-js`
   - Baca `SUPABASE_URL` dan `SUPABASE_ANON_KEY` dari `.env`
   - Export instance `supabase` yang siap pakai
3. Update `config/.env.example` — tambah variabel:
   - `SUPABASE_URL=https://[project-ref].supabase.co`
   - `SUPABASE_ANON_KEY=[anon-key-dari-dashboard-supabase]`

**Catatan Penting:**
- `pool.js` (koneksi PostgreSQL via `pg`) tetap dipakai untuk semua SQL query
- `supabase.js` hanya dipakai untuk Supabase-specific API (Storage, Realtime, dll)
- Kedua client bisa hidup berdampingan tanpa konflik

**Panduan Mendapatkan Kredensial (Dashboard Supabase):**
1. Buka **Project Settings → API** di Supabase Dashboard
2. Copy **Project URL** → isi ke `SUPABASE_URL`
3. Copy **anon public key** → isi ke `SUPABASE_ANON_KEY`

### Detail Implementasi Task 10.5 — Migrasi Upload ke Supabase Storage

**Tujuan:** Mengganti penyimpanan file dari disk lokal (`backend/uploads/`) ke Supabase Storage bucket, agar file bisa diakses dari mana saja (cloud-hosted).

**Prasyarat (Manual di Dashboard Supabase):**
1. Buka **Storage** di sidebar Supabase Dashboard
2. Klik **New bucket** → nama: `uploads`
3. Centang **Public bucket** (agar file bisa diakses via public URL tanpa auth token)
4. Klik **Create bucket**

**Perubahan Kode:**

**A. `backend/routes/upload.js` — Refaktor total:**
- Ganti `multer.diskStorage` → `multer.memoryStorage()` (file disimpan di RAM sebagai buffer)
- Setelah multer parsing, upload `req.file.buffer` ke Supabase Storage:
  ```
  supabase.storage.from('uploads').upload(filePath, buffer, { contentType })
  ```
- Ambil public URL:
  ```
  supabase.storage.from('uploads').getPublicUrl(filePath)
  ```
- Return URL absolut Supabase (bukan relative `/uploads/...`)
- Pertahankan validasi file (mime types whitelist, 5MB limit)

**B. `backend/server.js` — Hapus static serving:**
- Hapus `app.use('/uploads', express.static(...))` karena file sekarang di-serve oleh Supabase CDN
- Endpoint `POST /api/upload` tetap di-mount seperti biasa

**C. `assets/js/notes-data.js` — Update URL rendering:**
- Saat ini: `href="http://localhost:3000${note.attachment_url}"`
- Setelah migrasi: `attachment_url` sudah berisi URL absolut Supabase, jadi cukup `href="${note.attachment_url}"`
- Perubahan backward-compatible: cek apakah URL sudah absolut (starts with `http`) atau masih relative

**Alur Data Setelah Migrasi:**
```
[Frontend] upload file via FormData
    → POST /api/upload (multer memoryStorage)
    → [Backend] upload buffer ke Supabase Storage bucket 'uploads'
    → [Backend] return { url: "https://xxx.supabase.co/storage/v1/object/public/uploads/..." }
    → [Frontend] PATCH /notes/:id { attachment_url: url }
    → [Database] simpan URL absolut di kolom attachment_url
    → [Frontend] render <a href="${note.attachment_url}"> (langsung URL Supabase)
```

---

## Progress Summary

| Phase | Total Tasks | Selesai | Progress |
|-------|-------------|---------|----------|
| Phase 1: Critical Fixes | 13 | 13 | 100% |
| Phase 2: Security Fixes | 17 | 17 | 100% |
| Phase 3: Functional Bugs | 14 | 14 | 100% |
| Phase 4: Responsive & UX | 7 | 7 | 100% |
| Phase 5: Code Quality | 6 | 6 | 100% |
| Phase 6: Database & Migration | 6 | 6 | 100% |
| Phase 7: Nice-to-Have | 6 | 5 | 83% |
| Phase 8: UI Extra Fixes | 5 | 5 | 100% |
| Phase 9: Database Refactor | 7 | 7 | 100% |
| Phase 10: Supabase Config | 6 | 5 | 83% |
| **TOTAL** | **87** | **85** | **98%** |

---

_Last updated: 2026-09-17_
