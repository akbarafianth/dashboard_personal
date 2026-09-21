const fs = require('fs');
let f = 'assets/js/tasks-data.js';
let content = fs.readFileSync(f, 'utf8');

const populateLogic = `
async function loadSubjectsForTasks() {
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

    const select = document.getElementById('modal-subject');
    if (select) {
      select.innerHTML = '<option value="">Tanpa Mata Kuliah</option>';
      deduped.forEach(sub => {
        const option = document.createElement('option');
        option.value = sub.id;
        option.textContent = \`\${sub.code || ''} - \${sub.name || ''}\`;
        select.appendChild(option);
      });
    }
  } catch (err) {
    console.error('Failed to load subjects', err);
  }
}
`;

if (!content.includes('loadSubjectsForTasks')) {
  content = content.replace('async function loadAllTasks() {', populateLogic + '\nasync function loadAllTasks() {');
  // Inject call inside initTasks
  content = content.replace('loadAllTasks();', 'loadAllTasks();\n    loadSubjectsForTasks();');
}

fs.writeFileSync(f, content, 'utf8');
