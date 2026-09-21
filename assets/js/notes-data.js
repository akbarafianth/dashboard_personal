const API_BASE = window.API_BASE;
async function noteRequest(path, options) {
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

function renderNotes(notes) {
  const container = document.getElementById('notes-list');
  if (!container) return;
  container.innerHTML = '';
  if (notes.length === 0) {
    container.innerHTML = '<p class="text-on-surface-variant p-4">Belum ada catatan pertemuan.</p>';
    return;
  }
  notes.forEach((note) => {
    const card = document.createElement('article');
    card.className = 'flex flex-col p-space-sm rounded-xl bg-surface-container/50 hover:bg-surface-container cursor-pointer transition-all';
    card.onclick = () => renderNoteDetail(note);
    const date = document.createElement('span');
    date.className = 'font-code-sm text-code-sm text-outline flex justify-between items-center';
    date.innerHTML = `<span>${new Date(note.note_date).toLocaleDateString('id-ID')}</span>`;
    
    if (note.subject_name) {
      const subj = document.createElement('span');
      subj.className = `font-label-sm text-[10px] text-${note.color_theme || 'primary'} bg-${note.color_theme || 'primary'}/10 px-1.5 py-0.5 rounded`;
      subj.textContent = note.subject_name;
      date.appendChild(subj);
    }

    const title = document.createElement('h3');
    title.className = 'font-title-md text-title-md text-on-surface mt-space-3xs leading-snug';
    title.textContent = note.title;
    const content = document.createElement('p');
    content.className = 'font-body-sm text-body-sm text-on-surface-variant line-clamp-3 mt-space-3xs';
    content.textContent = String(note.content || '').replace(/<[^>]+>/g, '').trim() || 'Tidak ada deskripsi.';
    card.append(date, title, content);
    
    if (note.tags) {
      const tagContainer = document.createElement('div');
      tagContainer.className = 'flex flex-wrap gap-1 mt-2';
      note.tags.split(',').forEach(tag => {
        const t = document.createElement('span');
        t.className = 'text-[9px] text-outline px-1.5 py-0.5 border border-outline-variant/30 rounded';
        t.textContent = '#' + tag.trim();
        tagContainer.appendChild(t);
      });
      card.appendChild(tagContainer);
    }

    container.appendChild(card);
  });
}

function renderNoteDetail(note) {
  const container = document.getElementById('note-detail-container');
  if (!container) return;
  container.className = 'bg-surface-container-low/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden flex flex-col';
  
  let attachmentHtml = '';
  if (note.attachment_url) {
    attachmentHtml = `
      <div class="mt-space-md p-space-sm bg-surface-container rounded-xl flex items-center justify-between">
        <div class="flex items-center gap-space-xs text-on-surface">
          <span class="material-symbols-outlined text-primary text-[20px]">attachment</span>
          <span class="font-label-md text-label-md">Lampiran Tersimpan</span>
        </div>
        <a href="${note.attachment_url.startsWith('http') ? note.attachment_url : API_BASE.replace('/api', '') + note.attachment_url}" target="_blank" class="px-space-sm h-8 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 flex items-center text-label-sm font-semibold transition-colors">Buka Lampiran</a>
      </div>
    `;
  } else {
    attachmentHtml = `
      <div class="mt-space-md p-space-sm border border-dashed border-outline-variant rounded-xl flex items-center justify-between">
        <span class="text-body-sm text-outline">Belum ada lampiran.</span>
        <label class="px-space-sm h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center text-label-sm cursor-pointer transition-colors">
          <span class="material-symbols-outlined text-[16px] mr-1">upload</span> Upload
          <input type="file" class="hidden" onchange="uploadAttachment(${note.id}, this.files[0])">
        </label>
      </div>
    `;
  }

  container.innerHTML = `
    <!-- Top Metadata Strip -->
    <div class="p-space-lg bg-surface-container-lowest/70 flex flex-col gap-space-md border-b border-surface-container">
      <div class="flex flex-wrap items-center justify-between gap-space-sm">
        <div class="flex items-center gap-space-xs flex-wrap">
          <span class="px-space-xs py-space-3xs rounded-md bg-surface-container text-tertiary font-code-sm text-code-sm">
            ${new Date(note.note_date).toLocaleDateString('id-ID')}
          </span>
        </div>
        <!-- Quick Document Actions -->
        <div class="flex items-center gap-space-xs">
          <button onclick="exportNote(${note.id}, 'pdf')" class="flex items-center gap-space-3xs px-space-sm h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-colors" type="button">
            <span class="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            <span>Export PDF</span>
          </button>
          <button onclick="exportNote(${note.id}, 'markdown')" class="flex items-center gap-space-3xs px-space-sm h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-colors" type="button">
            <span class="material-symbols-outlined text-[16px]">markdown</span>
            <span>Export MD</span>
          </button>
          <button onclick="deleteNote(${note.id})" class="flex items-center gap-space-3xs px-space-sm h-8 rounded-lg bg-error-container text-on-error-container hover:brightness-110 font-label-sm text-label-sm transition-colors" type="button">
            <span class="material-symbols-outlined text-[16px]">delete</span>
            <span>Hapus</span>
          </button>
        </div>
      </div>
      <!-- Title -->
      <div>
        <h2 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">${escapeHtml(note.title)}</h2>
      </div>
    </div>
    <!-- Rich Content Area -->
    <div class="p-space-lg overflow-y-auto">
      <div class="prose prose-invert max-w-none text-on-surface-variant">
        ${note.content}
      </div>
      ${attachmentHtml}
    </div>
  `;
}

async function exportNote(id, format) {
  try {
    if (window.showToast) window.showToast('Mempersiapkan dokumen...', 'info');
    const response = await fetch(`${API_BASE}/notes/${id}/export/${format}`, { method: 'POST' });
    if (!response.ok) throw new Error('Gagal export');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Catatan-${id}.${format === 'markdown' ? 'md' : 'pdf'}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    if (window.showToast) window.showToast('Berhasil mendownload ' + format.toUpperCase(), 'success');
  } catch (err) {
    console.error(err);
    if (window.showToast) window.showToast('Gagal mengunduh berkas', 'error');
  }
}

async function uploadAttachment(noteId, file) {
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    if (window.showToast) window.showToast('Mengunggah file...', 'info');
    const uploadRes = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    if (!uploadRes.ok) throw new Error('Upload gagal');
    const { url } = await uploadRes.json();
    
    // Update Note with attachment_url
    await noteRequest(`/notes/${noteId}`, {
      method: 'PATCH',
      body: JSON.stringify({ attachment_url: url })
    });
    
    // Refresh detail and list
    await loadNotes();
    // Fetch updated note to re-render detail
    const updatedNote = await noteRequest(`/notes/${noteId}`, { method: 'GET' });
    renderNoteDetail(updatedNote);
    
  } catch (error) {
    console.error(error);
    if (window.showToast) window.showToast('Gagal mengunggah lampiran', 'error');
  }
}

async function deleteNote(id) {
  if (confirm('Yakin ingin menghapus catatan ini?')) {
    await noteRequest(`/notes/${id}`, { method: 'DELETE' });
    const container = document.getElementById('note-detail-container');
    if (container) {
      container.className = 'bg-surface-container-low/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex flex-col items-center justify-center p-space-xl gap-space-sm';
      container.innerHTML = '<span class="material-symbols-outlined text-[48px] text-tertiary opacity-50">auto_stories</span><p class="text-outline text-body-md font-body-md text-center">Pilih catatan dari daftar untuk melihat detail.</p>';
    }
    await loadNotes();
  }
}

async function loadNotes() {
  renderNotes(await noteRequest('/notes'));
}

document.addEventListener('DOMContentLoaded', () => {
  let quill;
  if (document.getElementById('note-content')) {
    quill = new window.Quill('#note-content', {
      theme: 'snow',
      placeholder: 'Tuliskan hal yang masih membingungkan dari materi ini...',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['link', 'clean']
        ]
      }
    });
  }

  const saveButton = document.getElementById('save-note-button');
  
  saveButton?.addEventListener('click', async () => {
    if (!quill) return;
    const content = quill.root.innerHTML.trim();
    if (quill.getText().trim().length === 0) return;
    
    const titleInput = document.getElementById('note-title');
    const title = titleInput?.value?.trim() || 'Catatan Baru';

    const originalText = saveButton.textContent;
    saveButton.disabled = true;
    saveButton.textContent = 'Menyimpan...';

    try {
      await noteRequest('/notes', {
        method: 'POST',
        body: JSON.stringify({ title, content })
      });
      quill.setContents([]);
      if (titleInput) titleInput.value = '';
      const modal = document.getElementById('newNoteModal');
      if (modal) modal.classList.add('hidden');
      await loadNotes();
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = originalText;
    }
  });

  // Modal logic
  const openButton = document.querySelector('[data-open-note-form]');
  const modal = document.getElementById('newNoteModal');
  const closeBtn = document.getElementById('closeNoteModalBtn');
  const cancelBtn = document.getElementById('cancelNoteBtn');

  const closeModal = () => {
    if (modal) modal.classList.add('hidden');
  };

  openButton?.addEventListener('click', () => {
    if (modal) {
      modal.classList.remove('hidden');
      setTimeout(() => document.getElementById('note-title')?.focus(), 50);
    }
  });

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  renderHeaderDate();
  loadNotes().catch(() => {});
  window.setInterval(() => { if (!document.hidden) loadNotes().catch(() => {}); }, 5000);
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
