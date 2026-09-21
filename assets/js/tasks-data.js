
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


function loadSubjectsForTasks() {
  const html = '<option value="">Tanpa Mata Kuliah</option>' + `
<option value="SE [A] P1">SE [A] P1 – Senin, 07.30 - 10.00</option>
<option value="ASD [A] P1">ASD [A] P1 – Selasa, 07.30 - 10.00</option>
<option value="ADD [A]">ADD [A] – Selasa, 13.30 - 16.00</option>
<option value="ABD [A]">ABD [A] – Rabu, 10.15 - 12.45</option>
<option value="SE [A] P2">SE [A] P2 – Rabu, 13.30 - 16.00</option>
<option value="MPT [A]">MPT [A] – Kamis, 07.30 - 10.00</option>
<option value="ASD [A] P2">ASD [A] P2 – Kamis, 13.30 - 16.00</option>
<option value="RO [A]">RO [A] – Jumat, 07.30 - 10.00</option>
`;
  const select = document.getElementById('modal-subject');
  if (select) select.innerHTML = html;
}

const API_BASE = window.API_BASE;
async function taskRequest(path, options) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const errMsg = body.error || 'Permintaan API gagal'; if (window.showToast) window.showToast(errMsg, 'error'); throw new Error(errMsg);
  }
  if (options && options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase())) { let msg = 'Berhasil menyimpan data'; if (options.method.toUpperCase() === 'POST') msg = 'Berhasil menambahkan data'; if (options.method.toUpperCase() === 'DELETE') msg = 'Berhasil menghapus data'; if (window.showToast) window.showToast(msg, 'success'); if (window.syncChannel) window.syncChannel.postMessage('REFRESH'); } return response.status === 204 ? null : response.json();
}

const columns = [
  { status: 'pending', title: 'Belum Dimulai', color: 'bg-outline' },
  { status: 'in_progress', title: 'Sedang Dikerjakan', color: 'bg-tertiary' },
  { status: 'completed', title: 'Selesai', color: 'bg-secondary' },
  { status: 'cancelled', title: 'Dibatalkan', color: 'bg-error' }
];


function createCheckboxHtml(task) {
  const isChecked = task.status === 'completed' ? 'checked' : '';
  return `<input type="checkbox" class="w-5 h-5 rounded border-outline focus:ring-primary text-primary bg-surface-container cursor-pointer" data-toggle-task="${task.id}" ${isChecked}>`;
}

function renderTasks(tasks) {
  const board = document.getElementById('tasks-board');
  if (!board) return;
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
    cards.className = 'flex flex-col gap-space-md';
    if (!columnTasks.length) {
      const empty = document.createElement('p');
      empty.className = 'text-body-sm text-body-sm text-outline';
      empty.textContent = 'Belum ada data.';
      cards.appendChild(empty);
    }
    columnTasks.forEach((task) => {
      const card = document.createElement('article');
      card.className = 'bg-surface-container/90 p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm';
      const taskTitle = document.createElement('h3');
      taskTitle.className = 'font-title-md text-title-md text-on-surface leading-snug flex items-start justify-between gap-2';
      taskTitle.innerHTML = `<span>${window.escapeHtml ? window.escapeHtml(task.title) : task.title}</span>`;
      
      const statusSelect = document.createElement('select');
      statusSelect.className = 'text-[10px] bg-surface-container-lowest border border-outline-variant/30 rounded px-1 py-0.5 text-on-surface-variant cursor-pointer focus:outline-none';
      columns.forEach(col => {
        const option = document.createElement('option');
        option.value = col.status;
        option.textContent = col.title;
        if (task.status === col.status) option.selected = true;
        statusSelect.appendChild(option);
      });
      statusSelect.addEventListener('change', async (e) => {
        const newStatus = e.target.value;
        try {
          await taskRequest(`/tasks/${task.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus })
          });
          loadTasks();
        } catch(err) {}
      });
      taskTitle.appendChild(statusSelect);

      const description = document.createElement('p');
      description.className = 'font-body-sm text-body-sm text-on-surface-variant';
      description.textContent = task.description || 'Tidak ada deskripsi';

      if (task.subject_name) {
        const subjectTag = document.createElement('span');
        subjectTag.className = `font-label-sm text-label-sm text-${task.color_theme || 'primary'} bg-${task.color_theme || 'primary'}/10 px-2 py-0.5 rounded-md mt-1 self-start`;
        subjectTag.textContent = task.subject_name;
        card.appendChild(subjectTag);
      }
      const deadline = document.createElement('span');
      deadline.className = 'font-code-sm text-code-sm text-outline';
      deadline.textContent = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(task.deadline));
      card.append(taskTitle, description, deadline);
      cards.appendChild(card);
    });
    wrapper.append(header, cards);
    board.appendChild(wrapper);
  });
}

async function loadAnalytics() {
  try {
    const data = await taskRequest('/analytics', { method: 'GET' });
    const statUrgent = document.getElementById('stat-urgent');
    const statInprogress = document.getElementById('stat-inprogress');
    const statReview = document.getElementById('stat-review');
    const statCompleted = document.getElementById('stat-completed');
    
    if (statUrgent) statUrgent.textContent = data.urgent_tasks;
    if (statInprogress) statInprogress.textContent = data.active_tasks;
    if (statReview) statReview.textContent = '0'; // Placeholder
    if (statCompleted) statCompleted.textContent = data.completed_tasks;
    
    return data;
  } catch (error) {
    console.error('Analytics load error:', error);
    return null;
  }
}

async function loadTasks() {
  allTasks = await taskRequest('/tasks');
    renderTasks(allTasks);
  await loadAnalytics();
}

let hasShownUrgentToast = false;

document.addEventListener('DOMContentLoaded', async () => {
  renderHeaderDate();

  const btnKanban = document.getElementById('btn-view-kanban');
  const btnList = document.getElementById('btn-view-list');
  const btnHistory = document.getElementById('btn-view-history');
  if(btnKanban) btnKanban.addEventListener('click', () => switchTaskView('kanban'));
  if(btnList) btnList.addEventListener('click', () => switchTaskView('list'));
  if(btnHistory) btnHistory.addEventListener('click', () => switchTaskView('history'));

  try {
    await loadTasks();
    const analytics = await loadAnalytics();
    if (analytics && analytics.urgent_tasks > 0) {
      if (!hasShownUrgentToast && window.showToast) {
        window.showToast(`Peringatan: Ada ${analytics.urgent_tasks} tugas berstatus Urgent!`, 'warning');
        hasShownUrgentToast = true;
      }
    } else {
      hasShownUrgentToast = false;
    }
  } catch(e){}
  
  // New Task Modal Logic
  const btnNewTask = document.getElementById('btnNewTask');
  const newTaskModal = document.getElementById('newTaskModal');
  const closeTaskModalBtn = document.getElementById('closeTaskModalBtn');
  const closeTaskModalBg = document.getElementById('closeTaskModalBg');
  const cancelTaskBtn = document.getElementById('cancelTaskBtn');
  const saveTaskBtn = document.getElementById('saveTaskBtn');

  const openModal = () => {
    if (newTaskModal) newTaskModal.classList.remove('hidden');
    // Set default deadline to end of today
    const deadlineInput = document.getElementById('task-deadline');
    if (deadlineInput && !deadlineInput.value) {
      const today = new Date();
      today.setHours(23, 59, 0, 0);
      const tzOffset = today.getTimezoneOffset() * 60000;
      deadlineInput.value = new Date(today.getTime() - tzOffset).toISOString().slice(0, 16);
    }
  };

  const closeModal = () => {
    if (newTaskModal) newTaskModal.classList.add('hidden');
  };

  
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
          await taskRequest(`/tasks/${taskId}`, {
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
          await taskRequest(`/tasks/${taskId}`, { method: 'DELETE' });
          await loadTasks();
        } catch(err) {
          delBtn.disabled = false;
        }
      }
    });
  }

  btnNewTask?.addEventListener('click', openModal);
  closeTaskModalBtn?.addEventListener('click', closeModal);
  closeTaskModalBg?.addEventListener('click', closeModal);
  cancelTaskBtn?.addEventListener('click', closeModal);

  saveTaskBtn?.addEventListener('click', async () => {
    const titleInput = document.getElementById('task-title');
    const deadlineInput = document.getElementById('task-deadline');
    const prioritySelect = document.getElementById('task-priority');
    const hoursInput = document.getElementById('task-hours');
    const descInput = document.getElementById('task-desc');

    const title = titleInput?.value.trim();
    const deadline = deadlineInput?.value;
    const priority = prioritySelect?.value || 'medium';
    const estimated_hours = Number(hoursInput?.value || 1);
    const description = descInput?.value.trim() || '';

    if (!title || !deadline) {
      alert('Judul dan tenggat waktu wajib diisi!');
      return;
    }

    const originalText = saveTaskBtn.textContent;
    saveTaskBtn.disabled = true;
    saveTaskBtn.textContent = 'Menyimpan...';

    try {
      await taskRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          deadline: new Date(deadline).toISOString(),
          priority,
          estimated_hours,
          status: 'pending',
          subject_id: document.getElementById('modal-subject')?.value || null
        })
      });

      // Reset form
      if (titleInput) titleInput.value = '';
      if (deadlineInput) deadlineInput.value = '';
      if (hoursInput) hoursInput.value = '';
      if (descInput) descInput.value = '';
      if (prioritySelect) prioritySelect.value = 'medium';

      closeModal();
      await loadTasks();
    } catch (err) {
      alert(`Gagal menyimpan tugas: ${err.message}`);
    } finally {
      saveTaskBtn.disabled = false;
      saveTaskBtn.textContent = originalText;
    }
  });

  window.setInterval(() => { if (!document.hidden) loadTasks().catch(() => {}); }, 5000);
});





if (!window.syncChannel) {
  window.syncChannel = new BroadcastChannel('academiq_sync');
  window.syncChannel.onmessage = (event) => {
    if (event.data === 'REFRESH') {
      if (typeof loadDashboardData === 'function') loadDashboardData().catch(()=>{});
      if (typeof loadEvents === 'function') loadEvents().catch(()=>{});
      if (typeof loadSubjects === 'function') loadSubjects().catch(()=>{});
      if (typeof loadNotes === 'function') loadNotes().catch(()=>{});
      if (typeof loadTasks === 'function') loadTasks().catch(()=>{});
      if (typeof loadAllTasks === 'function') loadAllTasks().catch(()=>{});
    }
  };
}
