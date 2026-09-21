const fs = require('fs');
let f = 'assets/js/tasks-data.js';
let content = fs.readFileSync(f, 'utf8');

const listEventDelegation = `
  // Event delegation for list view checkboxes and delete buttons
  const listContainer = document.getElementById('tasks-list-container');
  if(listContainer) {
    listContainer.addEventListener('click', async (e) => {
      const toggle = e.target.closest('[data-toggle-task]');
      if (toggle) {
        const taskId = toggle.getAttribute('data-toggle-task');
        const newStatus = toggle.checked ? 'completed' : 'pending';
        toggle.disabled = true;
        try {
          await taskRequest(\`/tasks/\${taskId}\`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus })
          });
          await loadTasks();
        } catch(err) {
          toggle.disabled = false;
          toggle.checked = !toggle.checked;
        }
      }

      const delBtn = e.target.closest('[data-delete-task]');
      if (delBtn) {
        const taskId = delBtn.getAttribute('data-delete-task');
        if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return;
        delBtn.disabled = true;
        try {
          await taskRequest(\`/tasks/\${taskId}\`, { method: 'DELETE' });
          await loadTasks();
        } catch(err) {
          delBtn.disabled = false;
        }
      }
    });
  }
`;

content = content.replace("btnNewTask?.addEventListener('click', openModal);", listEventDelegation + "\n  btnNewTask?.addEventListener('click', openModal);");

fs.writeFileSync(f, content, 'utf8');
