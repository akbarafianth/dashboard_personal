const fs = require('fs');
let f = 'assets/js/calendar-data.js';
let content = fs.readFileSync(f, 'utf8');

const populateLogic = `
async function loadSubjectsForCalendar() {
  try {
    const response = await fetch(\`\${API_BASE}/subjects\`);
    if (!response.ok) return;
    const subjects = await response.json();
    const select = document.getElementById('event-subject');
    if (!select) return;
    
    // Clear existing
    select.innerHTML = '<option value="">Umum / Non-Matkul</option>';
    
    subjects.forEach(sub => {
      const code = sub.code || 'MK';
      const day = sub.schedule_day || '-';
      const time = sub.schedule_time || '-';
      // If time format is "08:00 - 10:00", we just use it directly
      const option = document.createElement('option');
      option.value = sub.id;
      option.textContent = \`\${code} - \${day} - \${time}\`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('Failed to load subjects', err);
  }
}
`;

// Inject before loadEvents
if (!content.includes('loadSubjectsForCalendar')) {
  content = content.replace('async function loadEvents() {', populateLogic + '\nasync function loadEvents() {');
}

// Inject call inside initCalendar
content = content.replace('loadEvents();', 'loadEvents();\n    loadSubjectsForCalendar();');

// Auto fill date when day cell is clicked
const clickLogic = `
      dayCell.addEventListener('click', () => {
        selectedDate = new Date(year, month, i);
        renderCalendar(currentDate);
        // Task 4: Auto-fill hidden date input
        const hiddenDateInput = document.getElementById('event-date');
        if (hiddenDateInput) {
          // format yyyy-mm-dd
          const y = selectedDate.getFullYear();
          const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const d = String(selectedDate.getDate()).padStart(2, '0');
          hiddenDateInput.value = \`\${y}-\${m}-\${d}\`;
        }
      });
`;
content = content.replace(/dayCell\.addEventListener\('click', \(\) => \{\s*selectedDate = new Date\(year, month, i\);\s*renderCalendar\(currentDate\);\s*\}\);/s, clickLogic);

fs.writeFileSync(f, content, 'utf8');
