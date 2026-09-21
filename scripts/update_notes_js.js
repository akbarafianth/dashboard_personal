const fs = require('fs');
let f = 'assets/js/notes-data.js';
let content = fs.readFileSync(f, 'utf8');

const populateLogic = `
async function loadSubjectsForNotes() {
  try {
    const response = await fetch(\`\${API_BASE}/subjects\`);
    if (!response.ok) return;
    const subjects = await response.json();
    
    // Deduplicate by code
    const seenCodes = new Set();
    const deduped = [];
    subjects.forEach(sub => {
      const code = sub.code || 'MK';
      if (!seenCodes.has(code)) {
        seenCodes.add(code);
        deduped.push(sub);
      }
    });

    // Populate note-subject
    const noteSubjectSelect = document.getElementById('note-subject');
    if (noteSubjectSelect) {
      noteSubjectSelect.innerHTML = '<option value="">Pilih Mata Kuliah</option>';
      deduped.forEach(sub => {
        const option = document.createElement('option');
        option.value = sub.id;
        option.textContent = \`\${sub.code || ''} - \${sub.schedule_day || ''} - \${sub.schedule_time || ''}\`;
        noteSubjectSelect.appendChild(option);
      });
    }

    // Populate folder-subject
    const folderSubjectSelect = document.getElementById('folder-subject');
    if (folderSubjectSelect) {
      folderSubjectSelect.innerHTML = '<option value="">Pilih Mata Kuliah</option>';
      deduped.forEach(sub => {
        const option = document.createElement('option');
        option.value = sub.id;
        option.textContent = \`\${sub.code || ''} - \${sub.name || ''}\`;
        folderSubjectSelect.appendChild(option);
      });
    }
  } catch (err) {
    console.error('Failed to load subjects', err);
  }
}

// Global state to store folders
let allFolders = [];

function loadFolders() {
  const noteFolderSelect = document.getElementById('note-folder');
  if (!noteFolderSelect) return;
  // Use localStorage or just a dummy array for folders since backend doesn't have a folder table,
  // OR we can derive folders from notes.tags if needed.
  // For now we just implement the UI logic with localStorage.
  const stored = localStorage.getItem('notes_folders');
  allFolders = stored ? JSON.parse(stored) : [];
  
  noteFolderSelect.innerHTML = '<option value="">Tanpa Folder</option>';
  allFolders.forEach(f => {
    const option = document.createElement('option');
    option.value = f.id;
    option.textContent = f.name;
    noteFolderSelect.appendChild(option);
  });
}
`;

if (!content.includes('loadSubjectsForNotes')) {
  content = content.replace('async function loadNotes() {', populateLogic + '\nasync function loadNotes() {');
}

// Inject call inside initNotes
content = content.replace('loadNotes();', 'loadNotes();\n    loadSubjectsForNotes();\n    loadFolders();');

// Add New Folder Modal logic
const folderLogic = `
  const folderModal = document.getElementById('newFolderModal');
  const openFolderBtn = document.getElementById('openFolderModalBtn');
  const closeFolderBtn = document.getElementById('closeFolderModalBtn');
  const cancelFolderBtn = document.getElementById('cancelFolderBtn');
  const saveFolderBtn = document.getElementById('save-folder-btn');

  if(openFolderBtn) openFolderBtn.addEventListener('click', () => folderModal?.classList.remove('hidden'));
  if(closeFolderBtn) closeFolderBtn.addEventListener('click', () => folderModal?.classList.add('hidden'));
  if(cancelFolderBtn) cancelFolderBtn.addEventListener('click', () => folderModal?.classList.add('hidden'));

  if(saveFolderBtn) {
    saveFolderBtn.addEventListener('click', () => {
      const name = document.getElementById('folder-name').value;
      const subId = document.getElementById('folder-subject').value;
      if (!name) return alert('Nama folder harus diisi!');
      
      const newFolder = { id: Date.now().toString(), name, subject_id: subId };
      allFolders.push(newFolder);
      localStorage.setItem('notes_folders', JSON.stringify(allFolders));
      
      loadFolders();
      folderModal.classList.add('hidden');
      if (window.showToast) window.showToast('Folder berhasil dibuat', 'success');
    });
  }
`;

content = content.replace("saveButton.addEventListener('click', async (event) => {", folderLogic + "\n  saveButton.addEventListener('click', async (event) => {");

// Now update the save Note logic to capture the new fields (note-subject, note-date, note-folder)
// and pass subject_id to backend. note-folder and note-date could be stored in tags or a dedicated column if exists.
// The backend `notes` table has `subject_id` and `tags`.
// We can store folder name and date in tags for now.
const saveNoteBodyRegex = /body:\s*JSON\.stringify\(\{\s*title:\s*title,\s*content:\s*contentBody\s*\}\)/s;
content = content.replace(saveNoteBodyRegex, `body: JSON.stringify({
          title: title,
          content: contentBody,
          subject_id: document.getElementById('note-subject')?.value || null,
          note_date: document.getElementById('note-date')?.value || new Date().toISOString(),
          tags: document.getElementById('note-folder')?.value ? document.getElementById('note-folder').options[document.getElementById('note-folder').selectedIndex].text : ''
        })`);

fs.writeFileSync(f, content, 'utf8');
