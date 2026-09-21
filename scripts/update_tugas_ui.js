const fs = require('fs');
let f = 'pages/tugas_acara.html';
let content = fs.readFileSync(f, 'utf8');

// Add IDs to view buttons
content = content.replace('<span class="">Papan Kanban</span>', '<span class="">Papan Kanban</span>');
content = content.replace('<button class="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" type="button">\n<span class="material-symbols-outlined text-[18px]">view_kanban</span>\n<span class="">Papan Kanban</span>', '<button id="btn-view-kanban" class="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg text-on-surface font-label-md text-label-md transition-colors" type="button">\n<span class="material-symbols-outlined text-[18px]">view_kanban</span>\n<span class="">Papan Kanban</span>');
// Wait, the original class might be different, let's use regex
content = content.replace(/<button class="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg[^>]*>\s*<span class="material-symbols-outlined text-\[18px\]">view_kanban<\/span>\s*<span class="">Papan Kanban<\/span>\s*<\/button>/s, '<button id="btn-view-kanban" class="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg text-on-surface font-label-md text-label-md transition-colors" type="button"><span class="material-symbols-outlined text-[18px]">view_kanban</span><span class="">Papan Kanban</span></button>');

content = content.replace(/<button class="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg[^>]*>\s*<span class="material-symbols-outlined text-\[18px\]">format_list_bulleted<\/span>\s*<span class="">Daftar Tabel \(List\)<\/span>\s*<\/button>/s, '<button id="btn-view-list" class="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" type="button"><span class="material-symbols-outlined text-[18px]">format_list_bulleted</span><span class="">Daftar Tabel (List)</span></button>');

content = content.replace(/<button class="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg[^>]*>\s*<span class="material-symbols-outlined text-\[18px\]">history<\/span>\s*<span class="">Riwayat Selesai<\/span>\s*<\/button>/s, '<button id="btn-view-history" class="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" type="button"><span class="material-symbols-outlined text-[18px]">history</span><span class="">Riwayat Selesai</span></button>');

// Add a container for List/History if not exist. 
// Currently there's only id="tasks-board".
if(!content.includes('id="tasks-list-container"')) {
    const kanbanStr = '<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-lg items-start" id="tasks-board">';
    content = content.replace(kanbanStr, kanbanStr + '</div><div class="hidden flex-col gap-space-sm" id="tasks-list-container">');
}

fs.writeFileSync(f, content, 'utf8');
