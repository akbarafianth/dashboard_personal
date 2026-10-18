# Audit Plan Berkelanjutan Dashboard Matkul

## Setelah Setiap Perubahan atau Deploy
- Buka landing page dan pastikan login/register berhasil.
- Pastikan dashboard, kalender, tasks, notes, subjects, dan to-do tidak menampilkan error console.
- Cek `/api/health` menghasilkan status `ok`.
- Cek endpoint protected tanpa token menghasilkan `401`.
- Setelah login, cek data hanya milik user aktif.
- Buat satu record nyata melalui UI, baca ulang, ubah, lalu hapus.
- Cek kalender menampilkan bulan, minggu, hari, dan agenda.
- Uji upload file yang valid dan penolakan file terlalu besar/tipe terlarang.
- Uji export Markdown dan PDF.

## Mingguan
- Periksa error runtime Vercel dan Neon.
- Periksa jumlah koneksi Neon dan query lambat.
- Periksa rate-limit response `429` dengan traffic berlebih.
- Periksa file upload yang tidak valid atau tidak dapat diakses.

## Bulanan
- Jalankan `npm run db:verify`.
- Jalankan pemeriksaan syntax JavaScript.
- Uji CRUD untuk subjects, tasks, events, dan notes.
- Uji foreign key dan cascade delete pada database staging.
- Verifikasi backup Neon dan prosedur restore.
- Tinjau `npm audit --omit=dev` dan upgrade dependency secara terencana.

## Security Regression
- Pastikan `JWT_SECRET` ada dan random di production.
- Uji endpoint protected tanpa token, token invalid, dan token kedaluwarsa.
- Uji isolasi dua user terhadap subjects/tasks/events/notes/settings.
- Uji `subject_id` lintas user ditolak.
- Uji payload HTML berbahaya disanitasi.
- Pastikan `user_id` tidak dapat diubah dari request PATCH.
- Pastikan credential tidak masuk git.

## Known Product Limits
- User registration/login kini tersedia, tetapi reset password dan email verification belum tersedia.
- PDF menggunakan PDFKit tanpa layout penuh HTML/Quill; Markdown tetap fallback resmi.
- Browser compatibility BroadcastChannel perlu diuji pada Safari lama.
- Audit trail, monitoring eksternal, dan offline mode belum diimplementasikan.
