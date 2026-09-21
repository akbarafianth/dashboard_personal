const API_BASE = window.API_BASE;
async function requestJson(path, options) {
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

function setSettingValue(name, value) {
  document.querySelectorAll(`[data-setting="${name}"]`).forEach((element) => {
    element.textContent = value ?? '';
  });
}

function renderSettings(settings) {
  setSettingValue('display_name', settings.display_name);
  setSettingValue('semester', settings.semester);
  setSettingValue('gpa', Number(settings.gpa).toFixed(2));
  setSettingValue('study_phase', settings.study_phase);
  setSettingValue('active_credits', settings.active_credits);
  setSettingValue('focus_text', settings.focus_text || 'Belum ada fokus hari ini');

  const form = document.getElementById('dashboard-settings-form');
  if (!form) return;
  form.elements.display_name.value = settings.display_name || '';
  form.elements.semester.value = settings.semester || '';
  form.elements.gpa.value = settings.gpa ?? '';
  form.elements.study_phase.value = settings.study_phase || '';
  form.elements.active_credits.value = settings.active_credits ?? 0;
  form.elements.focus_text.value = settings.focus_text || '';
}

function formatDeadline(deadline) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(deadline));
}

function renderTasks(tasks) {
  const list = document.getElementById('upcoming-deadlines-list');
  const count = document.getElementById('upcoming-deadlines-count');
  if (!list || !count) return;

  count.textContent = `${tasks.length} Tugas`;
  list.replaceChildren();

  if (tasks.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'text-body-sm text-body-sm text-outline';
    empty.textContent = 'Belum ada tugas aktif dengan tenggat.';
    list.appendChild(empty);
    return;
  }

  tasks.slice(0, 4).forEach((task) => {
    const item = document.createElement('div');
    item.className = 'rounded-lg bg-surface-container p-space-sm space-y-space-2xs hover:bg-surface-container-high transition-colors';
    const date = document.createElement('span');
    date.className = 'px-2 py-0.5 rounded bg-error/20 text-error font-label-sm text-label-sm font-semibold';
    date.textContent = formatDeadline(task.deadline);
    const title = document.createElement('h4');
    title.className = 'font-title-md text-title-md text-on-surface line-clamp-1';
    title.textContent = task.title;
    const description = document.createElement('p');
    description.className = 'font-body-sm text-body-sm text-outline';
    description.textContent = task.description || 'Tugas aktif';
    item.append(date, title, description);
    list.appendChild(item);
  });
}

function renderSubjectCount(subjects) {
  const count = document.querySelector('[data-setting="active_subject_count"]');
  if (count) count.textContent = subjects.length;
}

function renderActiveTaskCount(tasks) {
  document.querySelectorAll('[data-active-task-count]').forEach((element) => {
    element.textContent = tasks.length;
  });
}

function createEmptyState(message) {
  const empty = document.createElement('p');
  empty.className = 'text-body-sm text-body-sm text-outline';
  empty.textContent = message;
  return empty;
}

function renderTodayEvents(events) {
  const container = document.getElementById('today-events-list');
  if (!container) return;
  container.replaceChildren();
  if (!events.length) {
    container.appendChild(createEmptyState('Belum ada agenda hari ini.'));
    return;
  }
  events.forEach((event) => {
    const card = document.createElement('div');
    card.className = 'group relative overflow-hidden rounded-xl bg-surface-container p-space-md shadow-lg transition-all hover:bg-surface-container-high';
    const content = document.createElement('div');
    content.className = 'flex flex-col md:flex-row md:items-center justify-between gap-space-md pl-space-xs';
    const details = document.createElement('div');
    details.className = 'space-y-space-2xs min-w-0';
    const title = document.createElement('h3');
    title.className = 'font-title-md text-title-md text-on-surface group-hover:text-primary-fixed transition-colors truncate';
    title.textContent = event.title;
    const meta = document.createElement('div');
    meta.className = 'flex flex-wrap items-center gap-x-space-md gap-y-space-2xs text-body-sm font-body-sm text-on-surface-variant';
    const date = document.createElement('span');
    date.className = 'flex items-center gap-1 text-tertiary';
    date.textContent = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.event_date));
    const category = document.createElement('span');
    category.className = 'flex items-center gap-1 text-outline';
    category.textContent = event.category || 'Agenda';
    meta.append(date, category);
    details.append(title, meta);
    content.appendChild(details);
    card.appendChild(content);
    container.appendChild(card);
  });
}

function renderSubjects(subjects) {
  const container = document.getElementById('active-subjects-list');
  if (!container) return;
  container.replaceChildren();
  if (!subjects.length) {
    container.appendChild(createEmptyState('Belum ada mata kuliah aktif.'));
    return;
  }
  subjects.forEach((subject) => {
    const card = document.createElement('div');
    card.className = 'rounded-xl bg-surface-container-low p-space-md shadow-md hover:shadow-xl transition-all group flex flex-col justify-between space-y-space-md';
    const details = document.createElement('div');
    details.className = 'space-y-space-xs';
    const badges = document.createElement('div');
    badges.className = 'flex items-start justify-between gap-space-xs';
    const code = document.createElement('span');
    code.className = 'px-2.5 py-0.5 rounded-full bg-primary/15 text-primary font-code-sm text-code-sm';
    code.textContent = `${subject.code || 'Tanpa kode'} • ${subject.credits || 0} SKS`;
    badges.appendChild(code);
    const title = document.createElement('h3');
    title.className = 'font-title-md text-title-md text-on-surface group-hover:text-primary transition-colors';
    title.textContent = subject.name;
    const lecturer = document.createElement('p');
    lecturer.className = 'font-body-sm text-body-sm text-outline flex items-center gap-1';
    lecturer.textContent = subject.lecturer || 'Dosen belum ditambahkan';
    details.append(badges, title, lecturer);
    const footer = document.createElement('div');
    footer.className = 'space-y-space-xs pt-space-xs';
    const schedule = document.createElement('span');
    schedule.className = 'text-body-sm font-body-sm text-outline';
    schedule.textContent = subject.schedule_day && subject.schedule_time ? `${subject.schedule_day}, ${subject.schedule_time}` : 'Jadwal belum ditambahkan';
    footer.appendChild(schedule);
    card.append(details, footer);
    container.appendChild(card);
  });
}

function renderDashboardCalendar(tasks, events) {
  const grid = document.getElementById('dashboard-calendar-grid');
  const title = document.getElementById('dashboard-calendar-title');
  if (!grid || !title) return;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  title.textContent = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(now);
  grid.replaceChildren();
  const firstDayObj = new Date(year, month, 1);
  const firstDay = (firstDayObj.getDay() + 6) % 7; // Monday-first layout
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let index = 0; index < firstDay; index += 1) {
    const previous = document.createElement('span');
    previous.className = 'p-2 text-outline-variant';
    previous.textContent = String(new Date(year, month, -firstDay + index + 1).getDate());
    grid.appendChild(previous);
  }
  
  const markedDays = new Set();
  const markDate = (dateStr) => {
    const d = new Date(dateStr);
    if (d.getFullYear() === year && d.getMonth() === month) {
      markedDays.add(d.getDate());
    }
  };
  tasks.forEach(task => markDate(task.deadline));
  events.forEach(event => markDate(event.event_date));

  for (let day = 1; day <= daysInMonth; day += 1) {
    const cell = document.createElement('span');
    cell.className = day === now.getDate() ? 'relative p-2 rounded-lg bg-primary-container text-on-primary-container font-bold shadow-[0_0_16px_rgba(128,131,255,0.4)]' : 'relative p-2 text-on-surface-variant hover:bg-surface-container rounded-lg';
    cell.textContent = String(day);
    if (markedDays.has(day)) {
      const marker = document.createElement('span');
      marker.className = 'absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-secondary';
      cell.appendChild(marker);
    }
    grid.appendChild(cell);
  }
}

function openSettingsModal() {
  const modal = document.getElementById('dashboard-settings-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeSettingsModal() {
  const modal = document.getElementById('dashboard-settings-modal');
  if (modal) modal.classList.add('hidden');
}

let hasShownUrgentToast = false;

async function loadDashboardData() {
  const [settings, tasks, subjects, events, analytics, notes] = await Promise.all([
      requestJson('/dashboard-settings').catch(() => null),
      requestJson('/tasks?status=active').catch(() => []),
      requestJson('/subjects').catch(() => []),
      requestJson('/events').catch(() => []),
      requestJson('/analytics').catch(() => null),
      requestJson('/notes').catch(() => [])
    ]);
  if (settings) renderSettings(settings);
  if (tasks) {
    renderTasks(tasks);
    renderActiveTaskCount(tasks);
  }
  if (subjects) {
    renderSubjectCount(subjects);
    renderSubjects(subjects);
  }
  if (events) {
    renderTodayEvents(events.filter((event) => new Date(event.event_date).toDateString() === new Date().toDateString()));
  }
  if (tasks && events) renderDashboardCalendar(tasks, events);

    if (analytics) {
      const urgentCountEl = document.getElementById('dashboard-urgent-task-count');
      const urgentProgressEl = document.getElementById('dashboard-urgent-task-progress');
      if (urgentCountEl) urgentCountEl.textContent = `${analytics.urgent_tasks} Sangat Mendesak`;
      if (urgentProgressEl) {
        const activeTasks = analytics.active_tasks || 0;
        const pct = activeTasks > 0 ? (analytics.urgent_tasks / activeTasks * 100) : 0;
        urgentProgressEl.style.width = `${pct}%`;
      }
    }

    if (notes) {
      const notesCountEl = document.getElementById('dashboard-notes-count');
      const keyTakeawaysEl = document.getElementById('dashboard-key-takeaways');
      const notesIndexedEl = document.getElementById('dashboard-notes-indexed');
      const notesProgressEl = document.getElementById('dashboard-notes-progress');
      
      if (notesCountEl) notesCountEl.textContent = notes.length;
      
      if (keyTakeawaysEl) {
          let takeawaysCount = 0;
          notes.forEach(note => {
              if (note.tags) takeawaysCount += note.tags.split(',').filter(t => t.trim() !== '').length;
          });
          if (subjects) {
              subjects.forEach(sub => {
                 if (sub.key_takeaways) takeawaysCount += sub.key_takeaways.split('\n').filter(t => t.trim() !== '').length;
              });
          }
          keyTakeawaysEl.textContent = `${takeawaysCount} Key Takeaways`;
      }

      if (notesIndexedEl && notesProgressEl) {
          const indexedPct = notes.length > 0 ? 100 : 0;
          notesIndexedEl.textContent = `${indexedPct}% Terindeks`;
          notesProgressEl.style.width = `${indexedPct}%`;
      }

      // Render Key Takeaways List (3 Terbaru)
      const ktList = document.getElementById('key-takeaways-list');
      if (ktList) {
          if (notes.length > 0) {
              ktList.innerHTML = '';
              const latestNotes = notes.slice(0, 3);
              latestNotes.forEach(note => {
                  const subject = subjects ? subjects.find(s => s.id === note.subject_id) : null;
                  const subjectName = subject ? subject.name : 'Umum';
                  ktList.innerHTML += `
                      <a href="catatan_pertemuan.html?id=${note.id}" class="block p-space-sm bg-surface-container-low hover:bg-surface-container rounded-xl transition-colors border border-surface-container">
                          <div class="flex justify-between items-start mb-1">
                              <h3 class="font-label-md text-label-md text-on-surface font-semibold truncate pr-2">${window.escapeHtml(note.title)}</h3>
                              <span class="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant flex-shrink-0">${window.escapeHtml(subjectName)}</span>
                          </div>
                          <p class="text-body-sm text-outline text-xs line-clamp-2">${window.escapeHtml(note.content.replace(/<[^>]+>/g, ''))}</p>
                      </a>
                  `;
              });
          } else {
              ktList.innerHTML = '<p class="text-body-sm text-outline p-space-md bg-surface-container rounded-xl text-center w-full block">Belum ada key takeaways terbaru.</p>';
          }
      }
    }

  
  if (analytics && analytics.urgent_tasks > 0) {
    if (!hasShownUrgentToast && window.showToast) {
      window.showToast(`Peringatan: Ada ${analytics.urgent_tasks} tugas berstatus Urgent!`, 'warning');
      hasShownUrgentToast = true;
    }
  } else {
    hasShownUrgentToast = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-open-dashboard-settings]').forEach((button) => {
    button.addEventListener('click', openSettingsModal);
  });
  document.querySelectorAll('[data-close-dashboard-settings]').forEach((button) => {
    button.addEventListener('click', closeSettingsModal);
  });

  const quickTaskForm = document.getElementById('quick-task-form');
  if (quickTaskForm) {
    quickTaskForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const title = quickTaskForm.elements['task-title'].value.trim();
      const deadline = quickTaskForm.elements['task-date'].value;
      if (!title || !deadline) return;
      const submitButton = quickTaskForm.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Menyimpan...';
      try {
        await requestJson('/tasks', {
          method: 'POST',
          body: JSON.stringify({ title, deadline, status: 'pending', priority: 'medium' })
        });
        quickTaskForm.reset();
        await loadDashboardData();
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    });
  }

  const form = document.getElementById('dashboard-settings-form');
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Menyimpan...';
      try {
        const settings = await requestJson('/dashboard-settings', {
          method: 'PUT',
          body: JSON.stringify({
            display_name: form.elements.display_name.value.trim(),
            semester: form.elements.semester.value.trim(),
            gpa: Number(form.elements.gpa.value),
            study_phase: form.elements.study_phase.value.trim(),
            active_credits: Number(form.elements.active_credits.value),
            focus_text: form.elements.focus_text.value.trim()
          })
        });
        renderSettings(settings);
        closeSettingsModal();
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    });
  }

  renderHeaderDate();
  loadDashboardData().catch(() => {});
  window.setInterval(() => { if (!document.hidden) loadDashboardData().catch(() => {}); }, 5000);
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
