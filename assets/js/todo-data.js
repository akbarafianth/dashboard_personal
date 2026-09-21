const API_BASE = window.API_BASE;
async function todoRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const errMsg = err.error || 'Permintaan Tasks gagal'; if (window.showToast) window.showToast(errMsg, 'error'); throw new Error(errMsg);
  }
  if (options && options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase())) { let msg = 'Berhasil menyimpan data'; if (options.method.toUpperCase() === 'POST') msg = 'Berhasil menambahkan data'; if (options.method.toUpperCase() === 'DELETE') msg = 'Berhasil menghapus data'; if (window.showToast) window.showToast(msg, 'success'); if (window.syncChannel) window.syncChannel.postMessage('REFRESH'); } return response.status === 204 ? null : response.json();
}

function isToday(value) {
  if (!value) return false;
  return new Date(value).toDateString() === new Date().toDateString();
}


function renderTodoStatistics(tasks) {
  const todayTasks = tasks.filter((task) => isToday(task.deadline));
  const completedToday = todayTasks.filter((task) => task.status === 'completed');
  const pendingToday = todayTasks.filter((task) => task.status !== 'completed');
  const highPriority = pendingToday.filter((task) => task.priority === 'high');
  const estimatedHours = pendingToday.reduce((total, task) => total + Number(task.estimated_hours || 0), 0);
  const totalCount = todayTasks.length;
  const completedCount = completedToday.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const setEl = (sel, val) => {
    document.querySelectorAll(sel).forEach((el) => { el.textContent = val; });
  };

  setEl('[data-stat="today-total"]', totalCount);
  setEl('[data-stat="today-total-badge"]', totalCount);
  setEl('[data-stat="today-completed"]', `${completedCount}/${totalCount}`);
  setEl('[data-stat="completed-pct"]', `${pct}% Selesai`);
  setEl('[data-stat="remaining-count"]', pendingToday.length);
  setEl('[data-stat="high-priority"]', highPriority.length);
  setEl('[data-stat="estimated-hours"]', estimatedHours.toFixed(1));
  setEl('[data-stat="completed-badge"]', `${completedCount} Selesai`);
  setEl('[data-focus-count]', `${pendingToday.length} Tugas Tersisa`);
  setEl('[data-focus-date]', new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date()));
}

function renderTodoFocus(tasks) {
  const container = document.getElementById('today-focus-list');
  if (!container) return;
  const todayTasks = tasks.filter((task) => isToday(task.deadline) && task.status !== 'completed');
  container.replaceChildren();

  if (!todayTasks.length) {
    const empty = document.createElement('div');
    empty.className = 'p-space-md rounded-xl bg-surface-container text-body-sm text-outline text-center';
    empty.textContent = 'Belum ada tugas fokus untuk hari ini. Tambahkan tugas baru melalui form di samping.';
    container.appendChild(empty);
    return;
  }

  todayTasks.forEach((task) => {
    const item = document.createElement('div');
    const borderCol = task.priority === 'high' ? 'border-error' : task.priority === 'medium' ? 'border-secondary' : 'border-outline-variant';
    item.className = `p-space-md rounded-xl bg-surface-container hover:bg-surface-container-high/80 transition-all border-l-4 ${borderCol} flex items-start justify-between gap-space-md group`;

    const left = document.createElement('div');
    left.className = 'flex items-start gap-space-sm min-w-0 flex-1';

    const checkBtn = document.createElement('button');
    checkBtn.className = 'w-5 h-5 mt-0.5 rounded border border-outline hover:border-primary flex items-center justify-center flex-shrink-0 transition-colors text-transparent hover:text-primary';
    checkBtn.type = 'button';
    checkBtn.title = 'Tandai Selesai';
    checkBtn.innerHTML = '<span class="material-symbols-outlined text-[14px]">check</span>';
    checkBtn.addEventListener('click', async () => {
      checkBtn.disabled = true;
      try {
        await todoRequest(`/tasks/${task.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'completed' })
        });
        await loadAllTasks();
      } catch (err) {
        console.error(err);
      } finally {
        checkBtn.disabled = false;
      }
    });

    const info = document.createElement('div');
    info.className = 'flex flex-col min-w-0 flex-1';

    const topRow = document.createElement('div');
    topRow.className = 'flex flex-wrap items-center gap-space-xs';

    const title = document.createElement('span');
    title.className = 'font-label-md text-label-md text-on-surface font-semibold';
    title.textContent = task.title;

    const priorityBadge = document.createElement('span');
    const pBg = task.priority === 'high' ? 'bg-error-container/50 text-error' : task.priority === 'medium' ? 'bg-secondary-container/60 text-secondary' : 'bg-surface-container-highest text-outline';
    const pText = task.priority === 'high' ? 'Tinggi' : task.priority === 'medium' ? 'Sedang' : 'Rendah';
    priorityBadge.className = `px-2 py-0.5 rounded text-[11px] font-code-sm font-medium ${pBg}`;
    priorityBadge.textContent = pText;

    topRow.append(title, priorityBadge);

    const timeRow = document.createElement('div');
    timeRow.className = 'flex items-center gap-space-md mt-space-xs text-body-sm text-outline';

    const timeIcon = document.createElement('span');
    timeIcon.className = 'flex items-center gap-1';
    const timeFormatted = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(task.deadline));
    timeIcon.innerHTML = `<span class="material-symbols-outlined text-[16px]">alarm</span> Hari ini, ${timeFormatted} WIB`;

    timeRow.appendChild(timeIcon);

    if (task.estimated_hours) {
      const durIcon = document.createElement('span');
      durIcon.className = 'flex items-center gap-1 text-on-surface-variant';
      durIcon.innerHTML = `<span class="material-symbols-outlined text-[16px]">timer</span> ${task.estimated_hours} Jam`;
      timeRow.appendChild(durIcon);
    }

    info.append(topRow, timeRow);
    left.append(checkBtn, info);

    const right = document.createElement('div');
    right.className = 'flex items-center gap-1 flex-shrink-0 opacity-80 group-hover:opacity-100';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'p-1.5 rounded-lg text-outline hover:text-error hover:bg-surface-container-highest transition-colors';
    deleteBtn.type = 'button';
    deleteBtn.title = 'Hapus Tugas';
    deleteBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">delete</span>';
    deleteBtn.addEventListener('click', async () => {
      if (!confirm(`Hapus tugas "${task.title}"?`)) return;
      deleteBtn.disabled = true;
      try {
        await todoRequest(`/tasks/${task.id}`, { method: 'DELETE' });
        await loadAllTasks();
      } catch (err) {
        console.error(err);
      } finally {
        deleteBtn.disabled = false;
      }
    });

    right.appendChild(deleteBtn);
    item.append(left, right);
    container.appendChild(item);
  });
}

function renderCompletedTasks(tasks) {
  const container = document.getElementById('today-completed-list');
  if (!container) return;
  const completed = tasks.filter((task) => task.status === 'completed');
  container.replaceChildren();

  if (!completed.length) {
    const empty = document.createElement('p');
    empty.className = 'text-body-sm text-outline p-space-sm';
    empty.textContent = 'Belum ada tugas yang diselesaikan.';
    container.appendChild(empty);
    return;
  }

  completed.slice(0, 5).forEach((task) => {
    const item = document.createElement('div');
    item.className = 'p-space-sm rounded-xl bg-surface-container-lowest/70 flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity';

    const left = document.createElement('div');
    left.className = 'flex items-center gap-space-sm';
    left.innerHTML = '<span class="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>';

    const textWrap = document.createElement('div');
    textWrap.className = 'flex flex-col';

    const title = document.createElement('span');
    title.className = 'font-label-md text-label-md text-on-surface-variant line-through';
    title.textContent = task.title;

    const sub = document.createElement('span');
    sub.className = 'text-body-sm text-outline';
    sub.textContent = 'Selesai';

    textWrap.append(title, sub);
    left.appendChild(textWrap);

    item.appendChild(left);
    container.appendChild(item);
  });
}

function initPomodoro() {
  let seconds = 25 * 60;
  let intervalId;
  let isRunning = false;
  let cycles = 0;
  const timeElement = document.querySelector('[data-pomodoro-time]');
  const cyclesElement = document.querySelector('[data-pomodoro-cycles]');
  const startBtn = document.querySelector('[data-pomodoro-start]');
  const resetBtn = document.querySelector('[data-pomodoro-reset]');
  if (!timeElement || !startBtn) return;
  
  // Load initial cycles
  fetch(`${API_BASE}/dashboard-settings`).then(res => res.json()).then(data => {
    cycles = data.pomodoro_cycles || 0;
    if (cyclesElement) cyclesElement.textContent = `${cycles} siklus`;
  }).catch(console.error);

  const render = () => {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
    const remaining = String(seconds % 60).padStart(2, '0');
    timeElement.textContent = `${minutes}:${remaining}`;
  };

  startBtn.addEventListener('click', () => {
    if (isRunning) {
      window.clearInterval(intervalId);
      isRunning = false;
      startBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">play_arrow</span><span>Lanjut</span>';
    } else {
      isRunning = true;
      startBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">pause</span><span>Jeda</span>';
      intervalId = window.setInterval(() => {
        seconds -= 1;
        if (seconds <= 0) {
          window.clearInterval(intervalId);
          isRunning = false;
          
          // Increment in DB
          fetch(`${API_BASE}/pomodoro/increment`, { method: 'POST' })
            .then(res => res.json())
            .then(data => {
              cycles = data.pomodoro_cycles;
              if (cyclesElement) cyclesElement.textContent = `${cycles} siklus`;
            }).catch(console.error);
            
          seconds = 25 * 60;
          startBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">play_arrow</span><span>Mulai</span>';
        }
        render();
      }, 1000);
    }
  });

  resetBtn?.addEventListener('click', () => {
    window.clearInterval(intervalId);
    isRunning = false;
    seconds = 25 * 60;
    startBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">play_arrow</span><span>Mulai</span>';
    render();
  });

  // Cleanup on unload to prevent memory leak if component is destroyed
  window.addEventListener('beforeunload', () => {
    if (intervalId) window.clearInterval(intervalId);
  });

  render();
}

function initQuickTodoForm() {
  const form = document.getElementById('quick-todo-form');
  const deadlineInput = document.getElementById('quick-todo-deadline');
  if (!form) return;

  if (deadlineInput && !deadlineInput.value) {
    const today = new Date();
    today.setHours(23, 59, 0, 0);
    const tzOffset = today.getTimezoneOffset() * 60000;
    deadlineInput.value = new Date(today.getTime() - tzOffset).toISOString().slice(0, 16);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titleInput = document.getElementById('quick-todo-title');
    const prioritySelect = document.getElementById('quick-todo-priority');
    const hoursInput = document.getElementById('quick-todo-hours');
    const submitBtn = form.querySelector('button[type="submit"]');

    const title = titleInput?.value.trim();
    const deadline = deadlineInput?.value;
    const priority = prioritySelect?.value || 'medium';
    const estimated_hours = Number(hoursInput?.value || 1);

    if (!title || !deadline) return;

    let originalText = '';
    if (submitBtn) {
      originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Menyimpan...';
    }
    try {
      await todoRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title,
          deadline: new Date(deadline).toISOString(),
          priority,
          estimated_hours,
          status: 'pending'
        })
      });
      form.reset();
      if (deadlineInput) {
        const today = new Date();
        today.setHours(23, 59, 0, 0);
        const tzOffset = today.getTimezoneOffset() * 60000;
        deadlineInput.value = new Date(today.getTime() - tzOffset).toISOString().slice(0, 16);
      }
      await loadAllTasks();
    } catch (err) {
      alert(err.message);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  });
}

async function loadAllTasks() {
  try {
    const tasks = await todoRequest('/tasks');
    renderTodoStatistics(tasks);
    renderTodoFocus(tasks);
    renderCompletedTasks(tasks);
  } catch (err) {
    console.error(err);
  }
}

function initTodo() {
  renderHeaderDate();
  initPomodoro();
  initQuickTodoForm();
  loadAllTasks();
  window.setInterval(() => { if (!document.hidden) loadAllTasks(); }, 5000);
} document.addEventListener('DOMContentLoaded', initTodo); window.addEventListener('pageChanged', initTodo); if (!window.syncChannel) {
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

