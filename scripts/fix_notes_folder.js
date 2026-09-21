const fs = require('fs');
let f = 'assets/js/notes-data.js';
let content = fs.readFileSync(f, 'utf8');

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
      document.getElementById('folder-name').value = '';
    });
  }
`;

content = content.replace("const saveButton = document.getElementById('save-note-button');", folderLogic + "\n  const saveButton = document.getElementById('save-note-button');");

fs.writeFileSync(f, content, 'utf8');
