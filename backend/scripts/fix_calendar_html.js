const fs = require('fs');
const path = require('path');

const calHtmlPath = path.join(__dirname, '../../pages/kalender_jadwal_tugas_acara.html');
let html = fs.readFileSync(calHtmlPath, 'utf8');

// 1. KPI Tenggat Minggu Ini
html = html.replace(
  /<span class="">4 Tenggat Minggu Ini<\/span>/g,
  '<span class="" id="calendar-kpi-tenggat">0 Tenggat Minggu Ini</span>'
);

// 2. Filter Urgent
html = html.replace(
  /<span class="flex items-center gap-1">1 Urgent<\/span>/g,
  '<span class="flex items-center gap-1" id="calendar-filter-urgent">0 Urgent</span>'
);

// 3. Filter Terjadwal
html = html.replace(
  /<span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-tertiary"><\/span> 3 Terjadwal<\/span>/g,
  '<span class="flex items-center gap-1" id="calendar-filter-terjadwal"><span class="w-2 h-2 rounded-full bg-tertiary"></span> 0 Terjadwal</span>'
);

fs.writeFileSync(calHtmlPath, html, 'utf8');
console.log("Calendar HTML Updated!");
