const API_BASE = window.API_BASE;
async function subjectRequest(path, options = {}) {
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


function renderSubjects(subjects) {
  const container = document.getElementById('subjects-cards-container') || document.getElementById('subjects-list');
  const totalSubjectsEl = document.querySelector('[data-total-subjects]');
  const subjectCountEl = document.querySelector('[data-subject-count]');
  const totalCreditsEl = document.querySelector('[data-total-credits]');

  const count = subjects ? subjects.length : 0;
  const totalCredits = (subjects || []).reduce((sum, s) => sum + (Number(s.credits) || 0), 0);

  if (totalSubjectsEl) totalSubjectsEl.textContent = `${count} Mata Kuliah Terdaftar`;
  if (subjectCountEl) subjectCountEl.textContent = `${count} Mata Kuliah`;
  if (totalCreditsEl) totalCreditsEl.textContent = `${totalCredits} SKS Aktif`;

  if (!container) return;
  container.replaceChildren();

  if (!subjects || subjects.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'p-space-md rounded-xl bg-surface-container text-body-sm text-outline text-center';
    empty.textContent = 'Belum ada mata kuliah tersimpan. Klik "+ Tambah Mata Kuliah" untuk menambahkan.';
    container.appendChild(empty);
    return;
  }

  subjects.forEach((subject) => {
    const card = document.createElement('div');
    card.className = 'p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-all shadow-md flex flex-col gap-space-xs cursor-pointer border border-transparent hover:border-outline-variant/30 group';
    
    const codeText = subject.code || 'MK';
    const creditsText = `${subject.credits || 0} SKS`;

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-space-xs">
          <span class="px-space-xs py-space-3xs rounded bg-primary-container/40 text-primary font-code-sm text-code-sm font-bold">${escapeHtml(codeText)}</span>
          <span class="px-space-xs py-space-3xs rounded bg-surface-container-high text-outline font-label-sm text-label-sm">${escapeHtml(creditsText)}</span>
          ${subject.grade ? `<span class="px-space-xs py-space-3xs rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold ml-2">Nilai: ${subject.grade}</span>` : ''}
        </div>
        <div class="flex items-center gap-space-3xs">
          <button class="opacity-0 group-hover:opacity-100 text-outline hover:text-primary transition-all p-1" title="Edit mata kuliah" data-edit-subject='${JSON.stringify(subject).replace(/'/g, "&#39;")}'>
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button class="opacity-0 group-hover:opacity-100 text-outline hover:text-error transition-all p-1" title="Hapus mata kuliah" data-delete-subject="${subject.id}">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
      <h4 class="font-title-md text-title-md text-on-surface font-semibold line-clamp-1">${escapeHtml(subject.name)}</h4>
      <div class="flex flex-col gap-space-3xs text-outline font-body-sm text-body-sm">
        <span class="flex items-center gap-space-3xs line-clamp-1">
          <span class="material-symbols-outlined text-[15px] text-tertiary">badge</span>
          ${escapeHtml(subject.lecturer || 'Dosen belum ditentukan')}
        </span>
        ${subject.schedule_day || subject.schedule_time ? `
        <span class="flex items-center gap-space-3xs">
          <span class="material-symbols-outlined text-[15px] text-primary">schedule</span>
          ${escapeHtml(subject.schedule_day || '')} ${escapeHtml(subject.schedule_time || '')}
        </span>` : ''}
        ${subject.room_or_link ? `
        <span class="flex items-center gap-space-3xs line-clamp-1">
          <span class="material-symbols-outlined text-[15px] text-secondary">domain</span>
          ${escapeHtml(subject.room_or_link)}
        </span>` : ''}
      </div>
    `;

    container.appendChild(card);
  });
}

let allSubjects = [];

async function loadSubjects() {
  try {
    allSubjects = await subjectRequest('/subjects');
    applyFiltersAndSort();
    calculateAndSyncGPA(allSubjects);
  } catch (error) {
    console.error('Gagal memuat mata kuliah:', error);
  }
}

function applyFiltersAndSort() {
  const dayFilterVal = document.getElementById('filter-day-select')?.value || 'Semua Hari';
  const sortVal = document.getElementById('sort-day-select')?.value || 'asc';
  const searchVal = document.getElementById('search-subject-input')?.value.toLowerCase() || '';

  let filtered = allSubjects.filter(sub => {
    if (searchVal) {
       const term = `${sub.name} ${sub.code} ${sub.lecturer}`.toLowerCase();
       if (!term.includes(searchVal)) return false;
    }
    if (dayFilterVal !== 'Semua Hari' && dayFilterVal !== 'Semua Hari (Senin - Sabtu)') {
      if (sub.schedule_day !== dayFilterVal) return false;
    }
    return true;
  });

  const dayMap = { 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6, 'Minggu': 7 };

  filtered.sort((a, b) => {
    const dayA = dayMap[a.schedule_day] || 99;
    const dayB = dayMap[b.schedule_day] || 99;
    if (dayA !== dayB) {
      return sortVal === 'asc' ? dayA - dayB : dayB - dayA;
    }
    const timeA = a.schedule_time || '23:59';
    const timeB = b.schedule_time || '23:59';
    return sortVal === 'asc' ? timeA.localeCompare(timeB) : timeB.localeCompare(timeA);
  });

  renderSubjects(filtered);
}

async function calculateAndSyncGPA(subjects) {
  let totalCredits = 0;
  let totalGradePoints = 0;
  
  const gradeWeights = { 
    'A': 4.0, 
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0, 
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0, 
    'C-': 1.7,
    'D+': 1.3,
    'D': 1.0, 
    'E': 0.0 
  };
  
  subjects.forEach(sub => {
    if (sub.grade && gradeWeights[sub.grade] !== undefined) {
      const cr = parseInt(sub.credits) || 0;
      totalCredits += cr;
      totalGradePoints += cr * gradeWeights[sub.grade];
    }
  });
  
  if (totalCredits > 0) {
    const gpa = (totalGradePoints / totalCredits).toFixed(2);
    try {
      await fetch(`${API_BASE}/dashboard-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gpa: parseFloat(gpa), active_credits: totalCredits })
      });
      // The dashboard polling will pick this up automatically
    } catch(err) {
      console.error('Gagal update GPA', err);
    }
  }
}


function updateLivePreview(fields) {
  const previewBadge = document.getElementById('coursePreviewBadge');
  const previewTitle = document.getElementById('coursePreviewTitle');
  const previewLecturer = document.getElementById('coursePreviewLecturer');

  const codeVal = fields.code?.value?.trim() || 'CS';
  const nameVal = fields.name?.value?.trim() || 'Mata Kuliah Baru';
  const creditsVal = fields.credits?.value || '3';
  const lecturerVal = fields.lecturer?.value?.trim() || 'Dosen belum dipilih';
  const dayVal = fields.day?.value || 'Senin';
  const timeVal = fields.scheduleTime?.value?.trim() || 'Jadwal tentatif';

  if (previewBadge) previewBadge.textContent = codeVal.slice(0, 4).toUpperCase();
  if (previewTitle) previewTitle.textContent = `${nameVal} • ${creditsVal} SKS`;
  if (previewLecturer) previewLecturer.textContent = `${lecturerVal} • ${dayVal} ${timeVal}`;
}

function initSubjects() {
  const modal = document.getElementById('newCourseModal');
  const openButton = document.getElementById('openNewCourseModal');
  const closeButton = document.getElementById('closeCourseModal');
  const cancelButton = document.getElementById('cancelCourseBtn');
  const saveButton = document.getElementById('saveCourseBtn');

  const formFields = {
    name: document.getElementById('subject-name'),
    code: document.getElementById('subject-code'),
    credits: document.getElementById('subject-credits'),
    lecturer: document.getElementById('subject-lecturer'),
    day: document.getElementById('subject-schedule-day'),
    scheduleTime: document.getElementById('subject-schedule-time'),
    room: document.getElementById('subject-room'),
    grade: document.getElementById('subject-grade')
  };

  // Wire live preview listeners
  Object.values(formFields).forEach((field) => {
    if (field) {
      field.addEventListener('input', () => updateLivePreview(formFields));
      field.addEventListener('change', () => updateLivePreview(formFields));
    }
  });

  openButton?.addEventListener('click', () => {
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = 'Tambah Mata Kuliah Baru';
    delete saveButton.dataset.editId;
    
    // Reset form
    if (formFields.name) formFields.name.value = '';
    if (formFields.code) formFields.code.value = '';
    if (formFields.lecturer) formFields.lecturer.value = '';
    if (formFields.scheduleTime) formFields.scheduleTime.value = '';
    if (formFields.room) formFields.room.value = '';
    if (formFields.grade) formFields.grade.value = '';

    modal?.classList.remove('hidden');
    updateLivePreview(formFields);
  });
  closeButton?.addEventListener('click', () => modal?.classList.add('hidden'));
  cancelButton?.addEventListener('click', () => modal?.classList.add('hidden'));
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  saveButton?.addEventListener('click', async (event) => {
    event.preventDefault();
    const name = formFields.name?.value?.trim();
    if (!name) {
      alert('Nama mata kuliah wajib diisi!');
      formFields.name?.focus();
      return;
    }

    saveButton.disabled = true;
    saveButton.textContent = 'Menyimpan...';

    try {
      const payload = {
        name: name,
        code: formFields.code?.value?.trim() || '',
        credits: parseInt(formFields.credits?.value, 10) || 3,
        lecturer: formFields.lecturer?.value?.trim() || '',
        schedule_day: formFields.day?.value || 'Senin',
        schedule_time: formFields.scheduleTime?.value?.trim() || '',
        room_or_link: formFields.room?.value?.trim() || '',
        grade: formFields.grade?.value || ''
      };

      if (saveButton.dataset.editId) {
        await subjectRequest(`/subjects/${saveButton.dataset.editId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      } else {
        await subjectRequest('/subjects', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      // Reset form
      if (formFields.name) formFields.name.value = '';
      if (formFields.code) formFields.code.value = '';
      if (formFields.lecturer) formFields.lecturer.value = '';
      if (formFields.scheduleTime) formFields.scheduleTime.value = '';
      if (formFields.room) formFields.room.value = '';
      if (formFields.grade) formFields.grade.value = '';

      modal?.classList.add('hidden');
      await loadSubjects();
    } catch (err) {
      alert(`Gagal menyimpan mata kuliah: ${err.message}`);
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = 'Simpan Mata Kuliah';
    }
  });

  // Event delegation for delete buttons
  const container = document.getElementById('subjects-cards-container') || document.getElementById('subjects-list');
  container?.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('[data-edit-subject]');
    if (editBtn) {
      e.stopPropagation();
      const subjectData = JSON.parse(editBtn.getAttribute('data-edit-subject'));
      if (formFields.name) formFields.name.value = subjectData.name || '';
      if (formFields.code) formFields.code.value = subjectData.code || '';
      if (formFields.credits) formFields.credits.value = subjectData.credits || '3';
      if (formFields.lecturer) formFields.lecturer.value = subjectData.lecturer || '';
      if (formFields.day) formFields.day.value = subjectData.schedule_day || 'Senin';
      if (formFields.scheduleTime) formFields.scheduleTime.value = subjectData.schedule_time || '';
      if (formFields.room) formFields.room.value = subjectData.room_or_link || '';
      if (formFields.grade) formFields.grade.value = subjectData.grade || '';

      const modalTitle = document.getElementById('modalTitle');
      if (modalTitle) modalTitle.textContent = 'Edit Mata Kuliah';

      saveButton.dataset.editId = subjectData.id;
      modal?.classList.remove('hidden');
      updateLivePreview(formFields);
      return;
    }

    const deleteBtn = e.target.closest('[data-delete-subject]');
    if (!deleteBtn) return;
    e.stopPropagation();
    const subjectId = deleteBtn.getAttribute('data-delete-subject');
    if (!subjectId) return;

    if (confirm('Apakah Anda yakin ingin menghapus mata kuliah ini?')) {
      try {
        await subjectRequest(`/subjects/${subjectId}`, { method: 'DELETE' });
        await loadSubjects();
      } catch (err) {
        alert(`Gagal menghapus mata kuliah: ${err.message}`);
      }
    }
  });

  const searchInput = document.getElementById('search-subject-input');
  const dayFilter = document.getElementById('filter-day-select');
  const sortFilter = document.getElementById('sort-day-select');

  if (searchInput) searchInput.addEventListener('input', applyFiltersAndSort);
  if (dayFilter) dayFilter.addEventListener('change', applyFiltersAndSort);
  if (sortFilter) sortFilter.addEventListener('change', applyFiltersAndSort);

  renderHeaderDate();
  loadSubjects();
  window.setInterval(() => { if (!document.hidden) loadSubjects(); }, 5000);
} document.addEventListener('DOMContentLoaded', initSubjects); window.addEventListener('pageChanged', initSubjects); if (!window.syncChannel) {
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

