## 🗄️ Prinsip Operasi Database untuk AI (Berlaku untuk SEMUA Permintaan Terkait Database)

_Section ini menggantikan kebutuhan menjelaskan aturan yang sama berulang-ulang setiap
kali meminta perubahan database. AI WAJIB menerapkan semua poin ini secara otomatis,
TANPA perlu diminta ulang, untuk setiap task yang menyentuh schema, migration, atau
koneksi database._

### 1. Alur Kerja Standar (SOP) untuk Setiap Perubahan Database

1. Baca `contract.md` DAN `database_contract.md` ini secara penuh sebelum menyentuh
   `backend/schema.sql`, migration manapun, atau kode yang berinteraksi dengan database.
2. AUDIT dulu: baca `backend/schema.sql` yang ada sekarang secara penuh untuk memahami
   tabel, kolom, tipe data, relasi (FK), dan index yang SUDAH ada sebelum menambah/mengubah
   apapun. JANGAN berasumsi struktur tabel dari nama fitur saja.
3. Cek juga `backend/server.js` (atau file route terkait) untuk memahami endpoint yang
   sudah bergantung pada struktur tabel yang ada — perubahan schema tidak boleh diam-diam
   mematahkan endpoint yang sudah jalan.
4. Kalau ditemukan AMBIGUITAS atau KONFLIK — misalnya nama kolom yang mirip tapi beda
   makna, kebutuhan mengubah tipe data kolom yang sudah dipakai fitur lain, atau
   penghapusan/rename tabel yang masih direferensikan di frontend — WAJIB tanya ke user
   dulu. JANGAN PERNAH memutuskan sendiri, sekecil apapun.
5. Untuk penambahan tabel/kolom BARU (tidak mengubah yang sudah ada), boleh langsung
   dikerjakan tanpa konfirmasi, SELAMA tidak bentrok dengan konvensi penamaan yang sudah
   berjalan (lihat poin 3 di bawah).
6. Kerjakan BERTAHAP: satu perubahan schema → jalankan migration → cek endpoint terkait
   masih berfungsi → baru lanjut ke perubahan berikutnya. Jangan menumpuk banyak perubahan
   schema dalam satu langkah kecuali diminta eksplisit.
7. Setelah selesai, WAJIB update `[CHANGELOG]` di `contract.md` dengan format yang sama
   seperti sebelumnya: `- [Tanggal] | [File] | [Deskripsi] | [Status]`

### 2. Identitas & Integritas Data (Khusus Database)

- Semua data yang tersimpan harus terhubung ke satu profil user yang sah:
  "Akbar Ariffianto" — jangan buat baris data dummy/contoh baru di tabel manapun,
  termasuk saat testing atau seeding.
- TIDAK BOLEH menambahkan seed data / dummy rows permanen ke database untuk keperluan
  "supaya tampilan tidak kosong". Kalau tabel kosong, itu tanggung jawab frontend untuk
  menampilkan empty state ("Belum ada data..."), bukan tanggung jawab database untuk
  diisi data palsu.
- Setiap tabel WAJIB punya `created_at` dan `updated_at` (default `now()`), kecuali ada
  alasan eksplisit untuk tidak — dan itu harus dikonfirmasi ke user dulu.
- Primary key konsisten pakai `id` dengan tipe yang SAMA di seluruh tabel (cek dulu tipe
  yang sudah dipakai di `schema.sql` — jangan campur `SERIAL`/`INTEGER` dengan `UUID`
  tanpa alasan dan konfirmasi).

### 3. Konsistensi Struktur & Penamaan

- `backend/schema.sql` adalah SOURCE OF TRUTH tunggal untuk struktur database. Semua
  perubahan schema WAJIB tercermin di file ini — jangan pernah mengubah struktur tabel
  langsung di database tanpa mengupdate file ini juga (dan sebaliknya).
- Penamaan tabel dan kolom WAJIB konsisten dengan yang sudah ada (cek dulu: snake_case
  atau PascalCase yang dipakai sekarang — samakan, jangan campur gaya penamaan baru).
- Tabel yang sudah ada dan tercatat di `[CHANGELOG]` (Tasks, Subjects, Events, Notes,
  DashboardSettings) TIDAK BOLEH di-rename atau diubah strukturnya secara fundamental
  tanpa konfirmasi eksplisit dari user — walaupun terlihat "lebih rapi" jika diubah.
- Relasi FOREIGN KEY baru harus mengikuti pola relasi yang sudah ada (misalnya kalau
  fitur lain sudah pakai pola `subject_id` merujuk ke `Subjects.id`, fitur baru yang
  serupa harus mengikuti pola penamaan FK yang sama).
- Sebelum membuat tabel baru, cek dulu apakah kebutuhan itu sebenarnya bisa jadi kolom
  tambahan di tabel yang sudah ada — jangan buat tabel baru untuk data yang sifatnya
  1-ke-1 dengan tabel lain kalau tidak perlu.

### 4. Batasan Struktur File & Migration

- Schema database → `backend/schema.sql`. Konfigurasi koneksi → `config/.env`
  (berdasarkan `config/.env.example`). Logic API/route → `backend/server.js` (atau file
  route turunannya kalau sudah dipecah).
- JANGAN ubah struktur folder `backend/` atau `config/` ke bentuk lain kecuali user
  eksplisit minta dan mengonfirmasi ulang.
- Setiap perubahan schema WAJIB reversible — sertakan juga bagaimana cara mengembalikan
  perubahan itu (baik lewat catatan manual atau migration down) di deskripsi
  `[CHANGELOG]`, supaya bisa di-rollback kalau ada masalah.
- JANGAN pernah menjalankan perintah yang sifatnya destruktif (`DROP TABLE`,
  `TRUNCATE`, `DELETE FROM` tanpa `WHERE`) tanpa konfirmasi eksplisit dan penjelasan
  dampaknya ke user terlebih dahulu.

### 5. Sebelum Menyatakan Task Database "Selesai" — Checklist Wajib

- [ ] `backend/schema.sql` sudah diaudit dan diperbarui agar mencerminkan struktur
      database yang sebenarnya berjalan sekarang
- [ ] Semua endpoint di `backend/server.js` yang bergantung pada tabel yang diubah
      sudah dicek dan masih berfungsi normal
- [ ] Tidak ada foreign key yang menunjuk ke tabel/kolom yang tidak ada
- [ ] Tidak ada dummy/seed data baru yang tertinggal di database
- [ ] Index sudah ditambahkan untuk kolom yang sering difilter/dicari (deadline, status,
      relasi semester, dsb — sesuai kebutuhan fitur yang disentuh)
- [ ] Perubahan schema bersifat reversible dan caranya dicatat
- [ ] `[CHANGELOG]` di `contract.md` sudah diupdate dengan detail perubahan database

[CHANGELOG]

- [2026-09-14] | database_contract.md | Menambahkan section "Prinsip Operasi Database"
  agar aturan kerja terkait schema, migration, dan integritas data berlaku otomatis di
  setiap task database tanpa perlu dijelaskan ulang | Selesai
