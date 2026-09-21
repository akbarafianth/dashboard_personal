const fs = require('fs');
let f = 'assets/js/tasks-data.js';
let content = fs.readFileSync(f, 'utf8');

const switchLogic = `
let currentTaskView = 'kanban';

function switchTaskView(view) {
  currentTaskView = view;
  const board = document.getElementById('tasks-board');
  const listContainer = document.getElementById('tasks-list-container');
  
  const btnKanban = document.getElementById('btn-view-kanban');
  const btnList = document.getElementById('btn-view-list');
  const btnHistory = document.getElementById('btn-view-history');
  
  if(btnKanban) { btnKanban.className = view === 'kanban' ? 'flex items-center gap-space-xs px-space-md py-space-xs rounded-lg text-on-surface bg-surface-container font-label-md text-label-md transition-colors' : 'flex items-center gap-space-xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors'; }
  if(btnList) { btnList.className = view === 'list' ? 'flex items-center gap-space-xs px-space-md py-space-xs rounded-lg text-on-surface bg-surface-container font-label-md text-label-md transition-colors' : 'flex items-center gap-space-xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors'; }
  if(btnHistory) { btnHistory.className = view === 'history' ? 'flex items-center gap-space-xs px-space-md py-space-xs rounded-lg text-on-surface bg-surface-container font-label-md text-label-md transition-colors' : 'flex items-center gap-space-xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors'; }

  if(board && listContainer) {
    if(view === 'kanban') {
      board.classList.remove('hidden');
      board.classList.add('grid');
      listContainer.classList.add('hidden');
      listContainer.classList.remove('flex');
    } else {
      board.classList.add('hidden');
      board.classList.remove('grid');
      listContainer.classList.remove('hidden');
      listContainer.classList.add('flex');
    }
  }
  
  renderTasks(allTasks);
}

// Ensure allTasks is available globally
let allTasks = [];
`;

// Inject switch logic
content = switchLogic + "\n" + content;

// Intercept task load to save to allTasks
content = content.replace("renderTasks(await taskRequest('/tasks'));", "allTasks = await taskRequest('/tasks');\n    renderTasks(allTasks);");

// Ensure renderTasks supports list view and history
const renderListView = `
  const listContainer = document.getElementById('tasks-list-container');
  
  if (currentTaskView !== 'kanban') {
    if (!listContainer) return;
    listContainer.replaceChildren();
    
    let filteredTasks = tasks;
    if (currentTaskView === 'history') {
      filteredTasks = tasks.filter(t => t.status === 'completed' || t.status === 'cancelled');
    } else {
      filteredTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
    }

    if (filteredTasks.length === 0) {
      listContainer.innerHTML = '<div class="p-space-md text-center text-outline text-body-sm bg-surface-container rounded-xl">Tidak ada tugas.</div>';
      return;
    }

    filteredTasks.forEach(task => {
      const item = document.createElement('div');
      item.className = 'p-space-sm bg-surface-container-low hover:bg-surface-container transition-colors rounded-xl shadow border border-transparent hover:border-outline-variant/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-sm';
      
      const isChecked = task.status === 'completed' ? 'checked' : '';
      const checkboxHtml = \`<input type="checkbox" class="w-5 h-5 rounded border-outline focus:ring-primary text-primary bg-surface-container cursor-pointer" data-toggle-task="\${task.id}" \${isChecked}>\`;
      
      const d = new Date(task.deadline);
      const dateStr = d.toLocaleDateString('id-ID', {day: 'numeric', month:'short'});

      item.innerHTML = \`
        <div class="flex items-center gap-space-sm flex-1">
          \${checkboxHtml}
          <div class="flex flex-col">
            <span class="font-title-md text-title-md text-on-surface \${task.status === 'completed' ? 'line-through text-outline' : ''}">\${task.title}</span>
            <div class="flex items-center gap-space-xs text-outline font-body-sm text-body-sm mt-1">
              \${task.subject_id ? \`<span class="px-space-xs py-space-3xs rounded bg-surface-container-high text-on-surface-variant text-[10px] uppercase font-bold">\${task.subject_id}</span>\` : ''}
              <span class="material-symbols-outlined text-[14px]">calendar_today</span> \${dateStr}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-space-xs">
          <button class="w-8 h-8 rounded hover:bg-surface-container-high flex items-center justify-center text-outline hover:text-error transition-colors" data-delete-task="\${task.id}" title="Hapus Tugas">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      \`;
      listContainer.appendChild(item);
    });
    return; // skip kanban logic
  }
`;

content = content.replace("const board = document.getElementById('tasks-board');\n  if (!board) return;", "const board = document.getElementById('tasks-board');\n  " + renderListView + "\n  if (!board) return;");

fs.writeFileSync(f, content, 'utf8');
