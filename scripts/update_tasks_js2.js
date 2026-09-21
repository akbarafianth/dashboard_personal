const fs = require('fs');
let f = 'assets/js/tasks-data.js';
let content = fs.readFileSync(f, 'utf8');

const renderListLogic = `
let currentTaskView = 'kanban'; // kanban, list, history

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
  
  // re-render tasks
  renderTasks(allTasks);
}

// Global variable
let allTasks = [];

async function loadAllTasks() {
  try {
    const tasks = await taskRequest('/tasks');
    allTasks = tasks || [];
    renderTasks(allTasks);
    loadSubjectsForTasks();
  } catch (error) {
    console.error('Gagal memuat tugas:', error);
  }
}
`;

// Replace `loadAllTasks` to save tasks in global state, so we can re-render easily.
content = content.replace(/async function loadAllTasks\(\) \{.*?\}/s, renderListLogic);

// Modify `renderTasks` to handle list and history
const renderTasksLogic = `
function renderTasks(tasks) {
  const board = document.getElementById('tasks-board');
  const listContainer = document.getElementById('tasks-list-container');
  if (!board || !listContainer) return;

  if (currentTaskView === 'kanban') {
    board.replaceChildren();
    columns.forEach((column) => {
      const columnTasks = tasks.filter((task) => task.status === column.status);
      const wrapper = document.createElement('div');
      wrapper.className = 'flex flex-col bg-surface-container-low rounded-2xl p-space-md gap-space-md shadow-md';
      
      const header = document.createElement('div');
      header.className = 'flex items-center justify-between';
      const heading = document.createElement('div');
      heading.className = 'flex items-center gap-space-xs';
      const title = document.createElement('h2');
      title.className = 'font-headline-sm text-headline-sm text-on-surface tracking-tight';
      title.textContent = column.title;
      const count = document.createElement('span');
      count.className = 'px-space-xs py-space-3xs rounded-full bg-surface-container-highest text-on-surface-variant font-code-sm text-code-sm font-semibold';
      count.textContent = columnTasks.length;
      heading.append(title, count);
      header.appendChild(heading);
      
      const cards = document.createElement('div');
      cards.className = 'flex flex-col gap-space-sm min-h-[50px]';
      columnTasks.forEach((task) => cards.appendChild(createTaskCard(task)));
      
      wrapper.append(header, cards);
      board.appendChild(wrapper);
    });
  } else {
    // List / History
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
      item.innerHTML = \`
        <div class="flex items-center gap-space-sm flex-1">
          \${createCheckboxHtml(task)}
          <div class="flex flex-col">
            <span class="font-title-md text-title-md text-on-surface \${task.status === 'completed' ? 'line-through text-outline' : ''}">\${escapeHtml(task.title)}</span>
            <div class="flex items-center gap-space-xs text-outline font-body-sm text-body-sm mt-1">
              \${task.subject_name ? \`<span class="px-space-xs py-space-3xs rounded bg-surface-container-high text-on-surface-variant text-[10px] uppercase font-bold">\${escapeHtml(task.subject_name)}</span>\` : ''}
              <span class="material-symbols-outlined text-[14px]">calendar_today</span> \${formatDate(task.deadline)}
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
  }
}
`;

content = content.replace(/function renderTasks\(tasks\) \{.*?(?=function createTaskCard)/s, renderTasksLogic);

// Add event listeners for view buttons inside initTasks
const viewListeners = `
  const btnKanban = document.getElementById('btn-view-kanban');
  const btnList = document.getElementById('btn-view-list');
  const btnHistory = document.getElementById('btn-view-history');
  if(btnKanban) btnKanban.addEventListener('click', () => switchTaskView('kanban'));
  if(btnList) btnList.addEventListener('click', () => switchTaskView('list'));
  if(btnHistory) btnHistory.addEventListener('click', () => switchTaskView('history'));
`;

content = content.replace("renderHeaderDate();", "renderHeaderDate();\n" + viewListeners);

fs.writeFileSync(f, content, 'utf8');
