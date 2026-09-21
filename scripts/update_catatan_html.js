const fs = require('fs');
let f = 'pages/catatan_pertemuan.html';
let content = fs.readFileSync(f, 'utf8');

// 1. Inject Fields into Tulis Catatan Baru Modal
const newFieldsHtml = `
  <div class="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
    <div class="flex flex-col gap-space-3xs">
      <label class="font-label-sm text-label-sm text-on-surface-variant">Mata Kuliah</label>
      <select id="note-subject" class="w-full h-10 px-space-sm bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary appearance-none">
        <option value="">Pilih Mata Kuliah</option>
      </select>
    </div>
    <div class="flex flex-col gap-space-3xs">
      <label class="font-label-sm text-label-sm text-on-surface-variant">Tanggal Mencatat</label>
      <input type="date" id="note-date" class="w-full h-10 px-space-sm bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
    </div>
    <div class="flex flex-col gap-space-3xs">
      <label class="font-label-sm text-label-sm text-on-surface-variant">Folder / Topik</label>
      <select id="note-folder" class="w-full h-10 px-space-sm bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary appearance-none">
        <option value="">Tanpa Folder</option>
      </select>
    </div>
  </div>
`;

content = content.replace('<div class="relative w-full flex flex-col gap-space-sm flex-1 overflow-hidden">', newFieldsHtml + '\n  <div class="relative w-full flex flex-col gap-space-sm flex-1 overflow-hidden">');

// 2. Add New Folder Modal
const newFolderModalHtml = `
<!-- New Folder Modal -->
<div class="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center p-space-md hidden" id="newFolderModal">
  <div class="bg-surface-container w-full max-w-md rounded-2xl shadow-2xl p-space-lg flex flex-col gap-space-md">
    <div class="flex items-center justify-between border-b border-surface-container-high pb-space-sm">
      <span class="font-headline-sm text-headline-sm text-on-surface flex items-center gap-space-2xs">
        <span class="material-symbols-outlined text-tertiary text-[20px]">create_new_folder</span>
        Buat Folder / Topik Baru
      </span>
      <button class="text-on-surface-variant hover:text-on-surface transition-colors" id="closeFolderModalBtn">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="flex flex-col gap-space-sm">
      <div class="flex flex-col gap-space-3xs">
        <label class="font-label-sm text-label-sm text-on-surface-variant">Nama Folder / Topik</label>
        <input type="text" id="folder-name" placeholder="Misal: Ujian Akhir Semester" class="w-full h-10 px-space-sm bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>
      <div class="flex flex-col gap-space-3xs">
        <label class="font-label-sm text-label-sm text-on-surface-variant">Berdasarkan Mata Kuliah</label>
        <select id="folder-subject" class="w-full h-10 px-space-sm bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary appearance-none">
          <option value="">Pilih Mata Kuliah</option>
        </select>
      </div>
    </div>
    <div class="pt-space-sm border-t border-surface-container-high flex justify-end gap-space-sm">
      <button class="px-space-md py-space-sm rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors" id="cancelFolderBtn">Batal</button>
      <button class="px-space-md py-space-sm rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:brightness-110 shadow-lg shadow-primary/20 transition-all" id="save-folder-btn" type="button">
        Buat Folder
      </button>
    </div>
  </div>
</div>
`;

content = content.replace('<!-- Add Note Modal -->', newFolderModalHtml + '\n  <!-- Add Note Modal -->');

// Link the trigger button to the modal
content = content.replace('<button class="w-full flex items-center justify-center gap-space-xs py-space-xs px-space-sm rounded-xl', '<button id="openFolderModalBtn" class="w-full flex items-center justify-center gap-space-xs py-space-xs px-space-sm rounded-xl');

fs.writeFileSync(f, content, 'utf8');
