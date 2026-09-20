
## 🧭 Prinsip Operasi Universal untuk AI (Berlaku untuk SEMUA Permintaan Perubahan)
*Section ini menggantikan kebutuhan menjelaskan aturan yang sama berulang-ulang di setiap prompt. AI WAJIB menerapkan semua poin ini secara otomatis, TANPA perlu diminta ulang, untuk setiap task baru yang diberikan.*

### 1. Alur Kerja Standar (SOP) untuk Setiap Permintaan
1. Baca contract.md ini SECARA PENUH sebelum mulai kerja apapun.
2. AUDIT dulu: cek file-file terkait yang akan disentuh, cek apakah ada konflik dengan struktur/keputusan yang sudah tercatat di sini.
3. Kalau ditemukan AMBIGUITAS atau KONFLIK dengan struktur/keputusan yang sudah ada di contract.md → WAJIB tanya ke user dulu. JANGAN PERNAH berasumsi atau memilih sendiri tanpa konfirmasi, sekecil apapun keputusannya.
4. Kerjakan BERTAHAP: selesaikan satu unit perubahan (satu halaman/satu fitur), tunjukkan hasil, baru lanjut ke unit berikutnya — kecuali user secara eksplisit minta dikerjakan sekaligus.
5. Setelah selesai, WAJIB update [CHANGELOG] dengan format: `- [Tanggal] | [File] | [Deskripsi] | [Status]`

### 2. Identitas & Data Universal (Berlaku di Semua Halaman)
- Nama user yang SAH hanya "Akbar Ariffianto" — kalau menemukan nama lain (termasuk nama dummy baru yang mungkin muncul), tanya dulu apakah itu harus diganti.
- TIDAK BOLEH ada indikator status "online/terhubung/sync" dalam bentuk apapun (teks maupun ikon) di UI manapun — kalau menemukan yang baru, hapus otomatis tanpa perlu diminta.
- TIDAK BOLEH menambahkan data dummy/placeholder baru di kode manapun. Semua tampilan data harus dinamis dari database via API, dengan empty state yang jelas ("Belum ada data...") saat kosong — bukan dibiarkan hardcode contoh.

### 3. Konsistensi Desain & Struktur
- `dashboard_akademik_utama.html` adalah SOURCE OF TRUTH untuk style sidebar, header, dan komponen kartu. Setiap penambahan UI baru di halaman manapun WAJIB mengikuti pola visual yang sama (spacing, warna, border-radius, style icon) dengan referensi ini — jangan buat style baru yang beda sendiri.
- Setiap kali menghapus/mengubah tampilan data, struktur HTML/CSS/class WAJIB dipertahankan — hanya konten dummy-nya yang diganti jadi render dinamis, supaya tampilan tetap konsisten begitu data asli masuk.
- Sebelum menambah halaman/komponen baru, cek dulu apakah sudah ada pola serupa di halaman lain yang harus disamakan (jangan duplikat logic/style yang beda-beda).

### 4. Batasan Struktur File (Ikuti Struktur Folder yang Sudah Ditetapkan)
- File HTML → `pages/`, CSS → `assets/css/`, JS → `assets/js/`, backend → `backend/`, config → `config/`.
- JANGAN ubah struktur folder ini ke bentuk lain (misal folder-per-modul) kecuali user eksplisit minta ubah dan mengonfirmasi ulang.
- `contract/agents/` dan `nocturne_scholar/` TIDAK BOLEH disentuh kecuali diminta eksplisit.
- `backend/db/` → tempat satu-satunya koneksi database (pool.js). Seluruh file lain (server.js, routes/, scripts/) WAJIB memakai koneksi dari sini, tidak boleh membuat koneksi database sendiri-sendiri.
- `backend/routes/` → satu file per resource (subjects, tasks, events, notes, settings). server.js hanya bertugas setup Express dan mount routes ini, tidak boleh berisi logic endpoint langsung.
- `backend/scripts/` → kumpulan script utilitas satu-kali-pakai atau berkala (migration runner, cleanup, sync, patch). Script baru yang sifatnya utilitas/maintenance WAJIB diletakkan di sini, bukan di root project atau di backend/ langsung.
- `backend/migrations/` → file SQL bernomor urut untuk setiap perubahan schema, sesuai aturan di database_contract.md.
- Root project HANYA boleh berisi file konfigurasi utama (package.json, package-lock.json, index.html) — script utilitas atau file kerja lainnya tidak boleh diletakkan di root.

### 5. Sebelum Menyatakan Task "Selesai" — Checklist Wajib
- [ ] Semua link/path relatif (href, src) sudah benar, tidak ada broken link
- [ ] Fitur CRUD yang disentuh benar-benar tersambung ke database (bukan hardcode)
- [ ] Tidak ada dummy data/status online yang baru muncul akibat perubahan ini
- [ ] Style/komponen baru konsisten dengan referensi dashboard_akademik_utama.html
- [ ] [CHANGELOG] sudah diupdate

### 6. Referensi Silang dengan database_contract.md
- Untuk task yang menyentuh schema database, migration, atau koneksi database, AI WAJIB membaca database_contract.md sebagai pelengkap aturan di file ini — kedua file berlaku bersamaan, bukan saling menggantikan.

[CHANGELOG]
- [2026-09-08] | contract.md | Menambahkan section "Prinsip Operasi Universal" agar aturan kerja (SOP, konsistensi desain, larangan dummy/status online, struktur folder) berlaku otomatis di setiap task tanpa perlu dijelaskan ulang | Selesaind

[CHANGELOG]
- [2026-09-08] | landing_page.html, dashboard_akademik_utama.html | Mengganti nama tyo menjadi Akbar Ariffianto di seluruh tampilan yang memuatnya | Selesai
- [2026-09-08] | landing_page.html, dashboard_akademik_utama.html, tugas_acara.html, mata_kuliah_key_takeaways_pertemuan.html | Mengganti keterangan semester menjadi Semester Ganjil 2026/2027 | Selesai
- [2026-09-08] | landing_page.html | Mengganti kalimat sambutan landing page menjadi Selamat datang Akbar, jangan lupa untuk cek catatan dan jangan males. | Selesai
- [2026-09-08] | landing_page.html, kalender_jadwal_tugas_acara.html | Menghapus indikator status online dan teks koneksi database/kalender dari UI | Selesai
- [2026-09-08] | package.json, .env.example, schema.sql, server.js, dashboard_akademik_utama.html, js/dashboard-data.js | Menambahkan backend Express dengan REST API CRUD Tasks, Subjects, Events, tabel DashboardSettings satu profil default, dan UI kustomisasi dashboard yang tersimpan melalui API | Selesai
- [2026-09-08] | dashboard_akademik_utama.html, js/dashboard-data.js, server.js | Mengganti widget tenggat terdekat menjadi data dinamis dari Tasks berstatus aktif, terurut berdasarkan deadline, dengan polling 5 detik | Selesai
- [2026-09-08] | tugas_acara.html, catatan_pertemuan.html | Memperbaiki ikon sidebar yang hilang dengan menyamakan markup ikon Material Symbols pada menu Dashboard, Kalender & Agenda, Mata Kuliah, dan Tugas & Acara; penyebabnya adalah markup ikon yang tidak konsisten | Selesai
- [2026-09-08] | schema.sql, server.js, kalender_jadwal_tugas_acara.html, js/calendar-data.js, mata_kuliah_key_takeaways_pertemuan.html, js/subjects-data.js, catatan_pertemuan.html, js/notes-data.js | Menghubungkan form tambah agenda, mata kuliah, dan catatan ke REST API PostgreSQL dengan polling 5 detik; menambahkan tabel Notes untuk menyimpan catatan pertemuan | Selesai
- [2026-09-08] | dashboard_akademik_utama.html, tugas_acara.html, mata_kuliah_key_takeaways_pertemuan.html, catatan_pertemuan.html | Menghapus isi dummy pada daftar tenggat, agenda, mata kuliah, dan catatan saat data API dimuat; placeholder form tetap dipertahankan | Selesai
- [2026-09-08] | contract.md | Mendokumentasikan tabel tambahan Notes dan DashboardSettings yang digunakan untuk integrasi catatan dan kustomisasi profil satu pengguna | Selesai
- [2026-09-08] | tugas_acara.html, js/tasks-data.js | Menghapus tampilan dummy Kanban Tugas & Acara dan menggantinya dengan data Tasks dari REST API melalui polling 5 detik | Selesai
- [2026-09-08] | dashboard_akademik_utama.html, kalender_jadwal_tugas_acara.html, catatan_pertemuan.html, tugas_acara.html, to_do_list_akademik.html, mata_kuliah_key_takeaways_pertemuan.html | Menstandarkan markup sidebar, class visual, state aktif, serta ikon menu Dashboard, Kalender & Agenda, Mata Kuliah, Catatan Pertemuan, Tugas & Acara, dan Statistik Belajar | Selesai
- [2026-09-08] | pages/*.html, assets/css/*, assets/js/*, index.html | Memindahkan tujuh halaman HTML ke pages/, memindahkan CSS/JS ke assets/, memperbarui seluruh path relatif, dan mengarahkan entry point ke pages/dashboard_akademik_utama.html | Selesai
- [2026-09-08] | pages/*.html, assets/js/tasks-data.js | Menghapus seluruh indikator dot/animasi status dari UI dan renderer Tasks, tanpa menghapus label status konten | Selesai
- [2026-09-08] | pages/tugas_acara.html | Mengganti residual alt nama Arya menjadi Akbar Ariffianto; audit seluruh file tidak menemukan kemunculan aktif Arya Bramantyo | Selesai
- [2026-09-08] | pages/*.html, assets/js/* | Mengaudit fitur halaman setelah reorganisasi; polling/API dan handler utama tetap terhubung, tanpa broken local link | Selesai
- [2026-09-08] | assets/js/tasks-data.js | Menghapus dot dekoratif dari renderer Tasks agar tidak memunculkan indikator visual setelah pembersihan status dot | Selesai
- [2026-09-08] | pages/dashboard_akademik_utama.html, assets/js/dashboard-data.js | Menghapus konten dummy Dashboard dan mempertahankan markup/class visual melalui renderer API untuk Events hari ini, Subjects aktif, kalender bulan berjalan, serta hitungan Tasks aktif; menambahkan empty state yang jelas | Selesai
- [2026-09-08] | pages/kalender_jadwal_tugas_acara.html, assets/js/calendar-data.js | Menghapus dummy kalender dan agenda, mempertahankan struktur visual, lalu merender grid/detail/agenda dari Events API dengan empty state dan polling | Selesai
- [2026-09-09] | pages/*.html, assets/js/* | Menghapus seluruh widget/indikator Status Sync - Online pada sidebar footer dan header, serta menstandarkan penanggalan dinamis bahasa Indonesia ([data-header-date]) dan label semester Semester Ganjil 2026/2027 | Selesai
- [2026-09-09] | pages/to_do_list_akademik.html, assets/js/todo-data.js | Menghapus duplikasi template markup di to_do_list_akademik.html, mengintegrasikan CRUD tugas harian ke REST API (/tasks), filter hari ini, toggle status selesai, hapus tugas, dan fungsionalitas interaktif Pomodoro timer | Selesai
- [2026-09-09] | pages/mata_kuliah_key_takeaways_pertemuan.html, assets/js/subjects-data.js | Menghapus card dummy mata kuliah, mengintegrasikan rendering dinamis dari REST API (/subjects) ke #subjects-cards-container dengan empty state, perhitungan total SKS aktif, modal tambah mata kuliah dengan live preview, serta fungsionalitas hapus mata kuliah | Selesai
- [2026-09-09] | backend/server.js, backend/schema.sql, config/.env.example, package.json | Mereorganisasi struktur backend ke backend/ dan konfigurasi ke config/, memperbarui skrip start/dev di package.json, serta mengonfigurasi dotenv untuk memuat config/.env atau root .env secara fleksibel | Selesai
- [2026-09-09] | pages/kalender_jadwal_tugas_acara.html, assets/js/calendar-data.js | Mengimplementasikan pergantian tampilan kalender dinamis (Bulan, Minggu, Hari, dan Agenda List) yang tersinkronisasi dengan navigasi waktu, filter kategori, dan REST API Events | Selesai

- [2026-09-09] | assets/js/*.js, pages/*.html, assets/js/toast.js | Menyelesaikan implementasi Fase 3 (Kustomisasi Dashboard, Sistem Toast Notifikasi, Integrasi Quill.js, dan Optimasi Polling dengan document.hidden) | Selesai

- [2026-09-09] | pages/*.html, assets/js/*.js | Menghapus seluruh data dummy statis HTML dari UI dan menambahkan integrasi BroadcastChannel API agar perubahan data saling sinkron (real-time cross-tab sync) di seluruh halaman tanpa perlu memuat ulang | Selesai
- [2026-09-09] | backend/server.js, assets/js/*.js, pages/*.html | Mengimplementasikan Fase 4 (File Upload & Lampiran Lokal, Export PDF/Markdown, Logika Analytics, dan Deadline Reminders lewat Toast) serta menghapus komponen Profile UI pojok kanan atas | Selesai
- [2026-09-10] | pages/*.html | Merestorasi fitur profil teks di semua bagian header dan menghapus foto profil di landing page serta halaman statistik belajar | Selesai
- [2026-09-14] | backend/server.js, backend/schema.sql, backend/migrations/* | Melakukan audit database: menambahkan `attachment_url` di config API subjects, membuat folder migrations untuk penambahan index (`created_at`) dan perubahan relasi FK menjadi `ON DELETE CASCADE`, serta menyediakan script `run_migrations.js` | Selesai
- [2026-09-14] | backend/schema.sql, backend/server.js, backend/migrations/003_comprehensive_features.sql | Mengimplementasikan struktur database tingkat lanjut (kolom `is_recurring`, `reminder_time`, `location`, `is_all_day`, `tags`, `is_pinned`, `color_theme`) agar komprehensif melayani kebutuhan seluruh halaman secara dinamis dan *future-proof* | Selesai
- [2026-09-14] | pages/kalender_jadwal_tugas_acara.html, assets/js/calendar-data.js, backend/server.js, backend/schema.sql | Memperbaiki fitur *setting prioritas* pada form kalender agar UI lebih compact (menggunakan elemen select) dan data prioritas benar-benar terkirim & tersimpan ke API (menambahkan kolom `priority` ke tabel events dan migration 004) | Selesai
- [2026-09-14] | pages/mata_kuliah_key_takeaways_pertemuan.html, assets/js/subjects-data.js | Memperbaiki bug pada form Tambah Mata Kuliah (menghapus duplikasi kode wrapper HTML yang menyebabkan form tersembunyi) dan merapikan JS event listener modal | Selesai
- [2026-09-15] | clean.js, remove_profile.js, sync.js, backend/patch.js, backend/run_migrations.js | Memindahkan file script ke dalam folder backend/scripts dan menyesuaikan path import | Selesai
- [2026-09-15] | contract.md | Menambahkan detail struktur backend/db/, backend/routes/, backend/scripts/ di section 4, serta section referensi silang ke database_contract.md, tanpa mengubah isi yang sudah ada sebelumnya | Selesai
- [2026-09-15] | backend/db/pool.js, backend/server.js, backend/scripts/run_migrations.js, backend/scripts/patch.js | Sentralisasi koneksi database ke backend/db/pool.js dan merefaktor server serta scripts migrasi agar menggunakan single instance pool tersebut | Selesai
- [2026-09-15] | backend/routes/*, backend/server.js | Memisahkan seluruh route per resource (subjects, tasks, events, notes, settings, search, upload, analytics) ke backend/routes/ dan merampingkan backend/server.js menjadi pure entry point di bawah 50 baris | Selesai
- [2026-09-16] | assets/js/*.js, pages/*.html | Menyelesaikan Phase 1 Implementation Plan: Fix syntax errors backticks di 4 file JS, fix missing brace notes-data.js, fix duplicate HTML tugas_acara.html, fix broken nav links & hardcoded data. | Selesai
- [2026-09-16] | backend/routes/*.js, assets/js/*.js | Menyelesaikan Phase 2 Implementation Plan: Pengamanan File Upload (multer config limits & UUID), XSS Prevention di rendering title/note/toast/search, Sanitasi input di eksport PDF, dan Input Validation Layer untuk tipe dan batasan parameter API. | Selesai
- [2026-09-16] | assets/js/*.js, backend/routes/*.js | Menyelesaikan Phase 3 Implementation Plan: Functional Bugs (Calendar navigation, Dashboard calendar marks, Toast Spam, visibility checking on polling, GPA Weights array fix, Pomodoro memory leak fix, Concurrent DB Query opt di analytics & search, First-Monday day logic fix, dan menghilangkan stateful checkbox yang tak berguna di kalender). | Selesai
- [2026-09-16] | pages/*.html, assets/js/sidebar.js, assets/css/*.css | Menyelesaikan Phase 4 Implementation Plan: Responsive Sidebar Mobile, accessibility ARIA tag modals, menghapus display none scrollbar webkit, penambahan title tag ke semua html pages. | Selesai
- [2026-09-16] | assets/js/*.js, backend/routes/*.js | Menyelesaikan Phase 5 Implementation Plan: Extract `shared-utils.js` (API_BASE, syncChannel, dll), merge tailwind-config JS files, merge base CSS file, extract backend routes utils `_helpers.js`. | Selesai
- [2026-09-16] | backend/scripts/*.js, backend/migrations/*.sql | Menyelesaikan Phase 6 Implementation Plan: Membuat sistem tracking migration (tabel `schema_migrations`), wrap migration dengan transaction, memperbaiki bugs path di scripts utilitas, fix regex di remove_profile.js, serta menambahkan migration 005 untuk FK dan status indexes. | Selesai
- [2026-09-16] | backend/routes/*.js, assets/js/tasks-data.js, backend/server.js | Menyelesaikan Phase 7 Implementation Plan: Menambahkan klausa LIMIT di endpoint list API, menambahkan dropdown status pada kanban UI, clean up import material icons ganda, serta memasang morgan logging, express-rate-limit, dan mekanisme graceful shutdown pool db. | Selesai
- [2026-09-16] | backend/*, assets/js/*, pages/* | Revert implementasi Authentication — dashboard bersifat personal, tidak memerlukan login/multi-user. Semua file auth (middleware, routes, migration, login.html, auth-guard.js) dihapus, fetch dikembalikan ke plain fetch, dependencies jsonwebtoken & bcryptjs diuninstall. | Selesai
- [2026-09-16] | pages/*.html, assets/js/notes-data.js | Menghapus logo AcademIQ Workspace di sidebar dan tombol '+ Tambah' di sebelah notifikasi pada semua halaman; Memperbaiki posisi modal 'Tambah Tugas/Acara Baru' agar rata tengah dengan menambahkan class 'flex' di tugas_acara.html; Menghapus fitur 'Impor Notability' dari halaman catatan; Memperbaiki bug syntax hilangnya fungsi renderNotes dan mengubah form Tulis Catatan Baru menjadi modal popup agar konsisten. | Selesai
- [2026-09-16] | backend/scripts/*, backend/routes/*, assets/js/* | Merombak arsitektur Database Setup: Membuat `setup_db.js` (wipe DB + run schema) dan `seed.js` (dummy data); Mengoptimasi `pool.js` dengan SSL dan max connections; Memperbaiki N+1 queries dengan menambahkan `LEFT JOIN subjects` pada route API `/tasks`, `/events`, dan `/notes`; Memperbarui frontend JS (tasks, calendar, notes) untuk merender `subject_name` dan warna langsung dari API; Menambahkan perintah `npm run db:setup` dan `npm run db:seed`. | Selesai
- [2026-09-16] | config/.env.example, backend/db/pool.js | Mengimplementasikan Phase 10 (Tahap 1) integrasi Supabase: Memperbarui `.env.example` dengan format URL Session Mode (port 5432) dan memodifikasi `pool.js` agar SSL (`rejectUnauthorized: false`) otomatis menyala setiap kali string koneksi mendeteksi host cloud (seperti `supabase.com`), meskipun lingkungan eksekusi masih development. | Selesai
- [2026-09-16] | implementationplan.md, backend/scripts/setup_db.js | Update dokumen Implementation Plan dengan panduan langkah-demi-langkah (Step-by-step) menghubungkan Supabase ke dalam codebase lokal dan memperbarui skrip `setup_db.js` dengan penanda bahwa metode DROP secara eksplisit aman untuk Supabase tanpa merusak schema sistem. | Selesai
- [2026-09-17] | backend/db/supabase.js, backend/routes/upload.js, backend/server.js, assets/js/notes-data.js, config/.env.example, implementationplan.md, package.json | Mengimplementasikan Phase 10 Task 10.4 & 10.5: Install `@supabase/supabase-js`, membuat Supabase client singleton (`backend/db/supabase.js`), menambah `SUPABASE_URL` dan `SUPABASE_ANON_KEY` ke `.env.example`, memigrasi file upload dari `multer.diskStorage` (lokal) ke `multer.memoryStorage` + Supabase Storage API (bucket `uploads`), menghapus static serving `/uploads` di `server.js`, dan memperbarui rendering URL lampiran di `notes-data.js` agar kompatibel dengan URL absolut Supabase. | Selesai


