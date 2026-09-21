const fs = require('fs');
let f = 'pages/kalender_jadwal_tugas_acara.html';
let content = fs.readFileSync(f, 'utf8');

// Hide "Pilih Tanggal" from Quick Agenda
const dateRowRegex = /<div>\s*<label class="block font-label-sm text-label-sm text-on-surface-variant mb-1">Pilih Tanggal<\/label>\s*<input class="w-full h-10 px-space-sm bg-surface-container-lowest rounded-xl font-code-sm text-code-sm text-on-surface focus:outline-none transition-all" id="event-date" name="event_date" type="date" required>\s*<\/div>/s;
content = content.replace(dateRowRegex, '<input id="event-date" name="event_date" type="hidden">');

// Clear Terkait Matkul static options in kalender
const subjectRegex = /<select class="[^"]*" id="event-subject" name="subject_id">\s*<option value="">Umum \/ Non-Matkul<\/option>.*?<\/select>/s;
content = content.replace(subjectRegex, '<select class="w-full h-10 px-space-sm bg-surface-container-lowest rounded-xl font-body-sm text-body-sm text-on-surface focus:outline-none transition-all" id="event-subject" name="subject_id"><option value="">Umum / Non-Matkul</option></select>');

fs.writeFileSync(f, content, 'utf8');
