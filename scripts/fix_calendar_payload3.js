const fs = require('fs');
let f = 'assets/js/calendar-data.js';
let content = fs.readFileSync(f, 'utf8');

const regex1 = /quickForm\.addEventListener\('submit', async \(e\) => \{[\s\S]*?body: JSON\.stringify\(\{[\s\S]*?\}\)\s*\}\);/g;

content = content.replace(regex1, `quickForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = quickForm.querySelector('button[type="submit"]');
      let originalText = '';
      if (submitBtn) {
        originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Menyimpan...';
      }

      try {
        const title = quickForm.elements.title?.value?.trim();
        const date = quickForm.elements.event_date?.value;
        const time = quickForm.elements.start_time?.value || '08:00';
        const category = quickForm.elements.category?.value || 'tugas';
        const priority = quickForm.elements.priority?.value || 'medium';
        const description = quickForm.elements.description?.value?.trim() || '';

        if (!title || !date) {
          alert('Judul dan tanggal wajib diisi');
          return;
        }

        await apiRequest('/events', {
          method: 'POST',
          body: JSON.stringify({
            title,
            event_date: \`\${date}T\${time}:00\`,
            category,
            priority,
            description,
            subject_id: document.getElementById('event-subject')?.value || null
          })
        });`);

const regex2 = /saveEventBtn\.addEventListener\('click', async \(e\) => \{[\s\S]*?body: JSON\.stringify\(\{[\s\S]*?\}\)\s*\}\);/g;
content = content.replace(regex2, `saveEventBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const titleInput = document.getElementById('modal-title');
    const dateInput = document.getElementById('modal-date');
    const timeInput = document.getElementById('modal-time');
    const categorySelect = document.getElementById('modal-category');
    const descInput = document.getElementById('modal-desc');
    const prioritySelect = document.getElementById('modal-priority');

    const title = titleInput?.value.trim();
    const date = dateInput?.value;
    const time = timeInput?.value || '10:00';
    const category = categorySelect?.value || 'acara';
    const priority = prioritySelect?.value || 'medium';
    const description = descInput?.value.trim() || '';

    if (!title || !date) {
      alert('Judul dan tanggal wajib diisi');
      return;
    }

    const originalText = saveEventBtn.textContent;
    saveEventBtn.disabled = true;
    saveEventBtn.textContent = 'Menyimpan...';

    try {
      await apiRequest('/events', {
        method: 'POST',
        body: JSON.stringify({
          title,
          event_date: \`\${date}T\${time}:00\`,
          category,
          priority,
          description,
          subject_id: document.getElementById('modal-subject')?.value || null
        })
      });`);


// Also populate modal-subject
const subjectPopulate = /const select = document\.getElementById\('event-subject'\);\s*if \(!select\) return;\s* \/\/ Clear existing\s*select\.innerHTML = '<option value="">Umum \/ Non-Matkul<\/option>';/s;

content = content.replace(subjectPopulate, `const selects = [document.getElementById('event-subject'), document.getElementById('modal-subject')];
    selects.forEach(select => {
      if (select) {
        select.innerHTML = '<option value="">Umum / Non-Matkul</option>';
      }
    });`);

const appendSubject = /select\.appendChild\(option\);/g;
content = content.replace(appendSubject, `selects.forEach(select => { if(select) select.appendChild(option.cloneNode(true)); });`);


fs.writeFileSync(f, content, 'utf8');
