const fs = require('fs');
let f = 'pages/tugas_acara.html';
let content = fs.readFileSync(f, 'utf8');

// The original "Papan Kanban" button didn't have an ID
content = content.replace(/<button class="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg[^>]*>\s*<span class="material-symbols-outlined text-\[18px\] text-primary">view_kanban<\/span>\s*<span class="">Papan Kanban<\/span>\s*<\/button>/s, '<button id="btn-view-kanban" class="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg text-on-surface bg-surface-container font-label-md text-label-md transition-colors" type="button"><span class="material-symbols-outlined text-[18px] text-primary">view_kanban</span><span class="">Papan Kanban</span></button>');

fs.writeFileSync(f, content, 'utf8');
