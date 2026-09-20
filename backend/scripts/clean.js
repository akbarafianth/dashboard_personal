const path = require('path');
const fs = require('fs');

const replaceInFile = (file, replaces) => {
  let content = fs.readFileSync(file, 'utf8');
  replaces.forEach(r => {
    content = content.replace(r.from, r.to);
  });
  fs.writeFileSync(file, content, 'utf8');
};

replaceInFile(path.resolve(__dirname, '../../pages/catatan_pertemuan.html'), [
  {
    from: /<!-- Editor Canvas Card Container -->[\s\S]*?<!-- Bottom Panel: Catatan Cepat & Refleksi Mandiri -->/,
    to: '<!-- Editor Canvas Card Container -->\n<div class="bg-surface-container-low/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex flex-col items-center justify-center p-space-xl gap-space-sm" id="note-detail-container">\n  <span class="material-symbols-outlined text-[48px] text-tertiary opacity-50">auto_stories</span>\n  <p class="text-outline text-body-md font-body-md text-center">Pilih catatan dari daftar untuk melihat detail.</p>\n</div>\n<!-- Bottom Panel: Catatan Cepat & Refleksi Mandiri -->'
  }
]);

replaceInFile(path.resolve(__dirname, '../../pages/mata_kuliah_key_takeaways_pertemuan.html'), [
  {
    from: /<!-- Active Course Banner Header -->[\s\S]*?<!-- Modal: Tambah Mata Kuliah Baru/,
    to: '<div class="bg-surface-container-low/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex flex-col items-center justify-center p-space-xl gap-space-sm" id="subject-detail-container">\n  <span class="material-symbols-outlined text-[48px] text-tertiary opacity-50">school</span>\n  <p class="text-outline text-body-md font-body-md text-center">Pilih mata kuliah dari daftar untuk melihat detail dan catatan pertemuan.</p>\n</div>\n</div>\n<!-- Modal: Tambah Mata Kuliah Baru'
  }
]);

replaceInFile(path.resolve(__dirname, '../../pages/tugas_acara.html'), [
  {
    from: /<span class="font-display-lg text-display-lg text-on-surface">04<\/span>/,
    to: '<span class="font-display-lg text-display-lg text-on-surface">0</span>'
  },
  {
    from: /<p class="font-code-sm text-code-sm text-outline">Deadline terdekat: Besok, 23:59<\/p>/,
    to: '<p class="font-code-sm text-code-sm text-outline">Belum ada deadline terdekat</p>'
  },
  {
    from: /<span class="font-display-lg text-display-lg text-on-surface">07<\/span>/,
    to: '<span class="font-display-lg text-display-lg text-on-surface">0</span>'
  },
  {
    from: /<p class="font-code-sm text-code-sm text-outline">3 Proyek tim, 4 mandiri<\/p>/,
    to: '<p class="font-code-sm text-code-sm text-outline">Belum ada tugas aktif</p>'
  },
  {
    from: /<span class="font-display-lg text-display-lg text-on-surface">02<\/span>/,
    to: '<span class="font-display-lg text-display-lg text-on-surface">0</span>'
  },
  {
    from: /<p class="font-code-sm text-code-sm text-outline">Termasuk draft skripsi bab 1<\/p>/,
    to: '<p class="font-code-sm text-code-sm text-outline">Belum ada tugas direview</p>'
  },
  {
    from: /<span class="font-display-lg text-display-lg text-on-surface">18<\/span>/,
    to: '<span class="font-display-lg text-display-lg text-on-surface">0</span>'
  },
  {
    from: /<span class="font-code-sm text-code-sm text-tertiary">91% On-time<\/span>/,
    to: '<span class="font-code-sm text-code-sm text-tertiary">0% On-time</span>'
  },
  {
    from: /<span class="font-code-sm text-code-sm text-outline">Rata-rata 92\.4<\/span>/,
    to: '<span class="font-code-sm text-code-sm text-outline">Rata-rata 0</span>'
  }
]);

console.log("Done");
