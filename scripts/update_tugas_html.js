const fs = require('fs');
let f = 'pages/tugas_acara.html';
let content = fs.readFileSync(f, 'utf8');

const ganttRegex = /<button class="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors"[^>]*>\s*<span class="material-symbols-outlined text-\[18px\]">timeline<\/span>\s*<span class="">Timeline \/ Gantt<\/span>\s*<\/button>/s;
content = content.replace(ganttRegex, '');

const syncRegex = /<button class="px-space-md py-space-xs rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-colors flex items-center gap-space-3xs"[^>]*>\s*<span class="material-symbols-outlined text-\[18px\]">sync<\/span>\s*<span class="">Sinkronisasi Google Calendar<\/span>\s*<\/button>/s;
content = content.replace(syncRegex, '');

const exportRegex = /<button class="px-space-md py-space-xs rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-colors flex items-center gap-space-3xs"[^>]*>\s*<span class="material-symbols-outlined text-\[18px\]">download<\/span>\s*<span class="">Ekspor Jadwal \(\.ics\)<\/span>\s*<\/button>/s;
content = content.replace(exportRegex, '');

// Empty the related subjects in Tugas & Acara modal so it can be populated by JS
const subjectModalRegex = /<select id="modal-subject" class="w-full h-10 px-space-sm bg-surface-container-lowest rounded-xl font-code-sm text-code-sm text-on-surface focus:outline-none"[^>]*>.*?<\/select>/s;
content = content.replace(subjectModalRegex, '<select id="modal-subject" class="w-full h-10 px-space-sm bg-surface-container-lowest rounded-xl font-code-sm text-code-sm text-on-surface focus:outline-none"><option value="">Tanpa Mata Kuliah</option></select>');

fs.writeFileSync(f, content, 'utf8');
