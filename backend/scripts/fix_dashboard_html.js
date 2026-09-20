const fs = require('fs');
const path = require('path');

const dashHtmlPath = path.join(__dirname, '../../pages/dashboard_akademik_utama.html');
let html = fs.readFileSync(dashHtmlPath, 'utf8');

// 1. Tugas Minggu Ini (Urgent Task)
html = html.replace(
  /<span class="text-error font-semibold flex items-center gap-1">\s*1 Sangat Mendesak\s*<\/span>/g,
  '<span class="text-error font-semibold flex items-center gap-1" id="dashboard-urgent-task-count">0 Sangat Mendesak</span>'
);
html = html.replace(
  /<div class="h-full bg-error rounded-full" style="width: 25%;">/g,
  '<div id="dashboard-urgent-task-progress" class="h-full bg-error rounded-full transition-all duration-500" style="width: 0%;">'
);

// 2. Dokumentasi Catatan (Notes Stats)
html = html.replace(
  /<span class="font-display-lg-mobile text-display-lg-mobile text-on-surface font-headline-lg">28<\/span>/g,
  '<span class="font-display-lg-mobile text-display-lg-mobile text-on-surface font-headline-lg" id="dashboard-notes-count">0</span>'
);
html = html.replace(
  /<span class="text-on-surface-variant">100% Terindeks<\/span>/g,
  '<span class="text-on-surface-variant" id="dashboard-notes-indexed">0% Terindeks</span>'
);
html = html.replace(
  /<span class="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container-high text-primary-fixed">54 Key Takeaways<\/span>/g,
  '<span class="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container-high text-primary-fixed" id="dashboard-key-takeaways">0 Key Takeaways</span>'
);
html = html.replace(
  /<div class="h-full bg-primary rounded-full" style="width: 100%;">/g,
  '<div id="dashboard-notes-progress" class="h-full bg-primary rounded-full transition-all duration-500" style="width: 0%;">'
);

// 3. Section "Key Takeaways Pertemuan Terbaru"
// Menghapus badge AI Synthesized
html = html.replace(
  /<span class="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-code-sm text-code-sm">AI Synthesized<\/span>/g,
  ''
);
// Menambahkan flex-shrink-0 pada link
html = html.replace(
  /<a class="font-label-sm text-label-sm text-tertiary hover:text-tertiary-fixed flex items-center gap-1 transition-colors" href="catatan_pertemuan.html">/g,
  '<a class="font-label-sm text-label-sm text-tertiary hover:text-tertiary-fixed flex items-center gap-1 transition-colors flex-shrink-0" href="catatan_pertemuan.html">'
);
// Mengubah w-full pada state kosong agar tidak sempit
html = html.replace(
  /<p class="text-body-sm text-outline p-space-md bg-surface-container rounded-xl text-center">Belum ada key takeaways terbaru.<\/p>/g,
  '<p class="text-body-sm text-outline p-space-md bg-surface-container rounded-xl text-center w-full block">Belum ada key takeaways terbaru.</p>'
);

fs.writeFileSync(dashHtmlPath, html, 'utf8');
console.log("Dashboard HTML Updated!");
