const fs = require('fs');

const staticSubjectsHTML = `
<option value="SE [A] P1">SE [A] P1 – Senin, 07.30 - 10.00</option>
<option value="ASD [A] P1">ASD [A] P1 – Selasa, 07.30 - 10.00</option>
<option value="ADD [A]">ADD [A] – Selasa, 13.30 - 16.00</option>
<option value="ABD [A]">ABD [A] – Rabu, 10.15 - 12.45</option>
<option value="SE [A] P2">SE [A] P2 – Rabu, 13.30 - 16.00</option>
<option value="MPT [A]">MPT [A] – Kamis, 07.30 - 10.00</option>
<option value="ASD [A] P2">ASD [A] P2 – Kamis, 13.30 - 16.00</option>
<option value="RO [A]">RO [A] – Jumat, 07.30 - 10.00</option>
`;

function replaceSubjectLogic(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  if (filePath.includes('calendar-data.js')) {
    content = content.replace(/async function loadSubjectsForCalendar\(\) \{[\s\S]*?\}\s*\}/s, '');
    
    const staticLogic = `
function loadSubjectsForCalendar() {
  const html = '<option value="">Umum / Non-Matkul</option>' + \`${staticSubjectsHTML}\`;
  const selects = [document.getElementById('event-subject'), document.getElementById('modal-subject')];
  selects.forEach(sel => { if(sel) sel.innerHTML = html; });
}
`;
    content = content.replace('async function loadEvents() {', staticLogic + '\nasync function loadEvents() {');
    
    // Auto fill hidden date
    content = content.replace(/dayCell\.addEventListener\('click', \(\) => \{\s*selectedDate = new Date\(year, month, i\);\s*renderCalendar\(currentDate\);\s*\}\);/g, 
      `dayCell.addEventListener('click', () => {
        selectedDate = new Date(year, month, i);
        renderCalendar(currentDate);
        const hiddenDateInput = document.getElementById('event-date');
        if (hiddenDateInput) {
          const y = selectedDate.getFullYear();
          const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const d = String(selectedDate.getDate()).padStart(2, '0');
          hiddenDateInput.value = \`\${y}-\${m}-\${d}\`;
        }
      });`);
  }

  if (filePath.includes('notes-data.js')) {
    content = content.replace(/async function loadSubjectsForNotes\(\) \{[\s\S]*?\}\s*\}/s, '');
    const staticLogic = `
function loadSubjectsForNotes() {
  const html = '<option value="">Pilih Mata Kuliah</option>' + \`${staticSubjectsHTML}\`;
  const noteSubjectSelect = document.getElementById('note-subject');
  if (noteSubjectSelect) noteSubjectSelect.innerHTML = html;

  const folderSubjectSelect = document.getElementById('folder-subject');
  if (folderSubjectSelect) folderSubjectSelect.innerHTML = html;
}
`;
    content = content.replace('async function loadNotes() {', staticLogic + '\nasync function loadNotes() {');
  }

  if (filePath.includes('tasks-data.js')) {
    content = content.replace(/async function loadSubjectsForTasks\(\) \{[\s\S]*?\}\s*\}/s, '');
    const staticLogic = `
function loadSubjectsForTasks() {
  const html = '<option value="">Tanpa Mata Kuliah</option>' + \`${staticSubjectsHTML}\`;
  const select = document.getElementById('modal-subject');
  if (select) select.innerHTML = html;
}
`;
    if (!content.includes('loadSubjectsForTasks')) {
       content = staticLogic + '\n' + content;
    } else {
       content = content.replace(/function loadSubjectsForTasks\(\) \{[\s\S]*?\}\s*\}/s, staticLogic);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

replaceSubjectLogic('assets/js/calendar-data.js');
replaceSubjectLogic('assets/js/notes-data.js');
replaceSubjectLogic('assets/js/tasks-data.js');
