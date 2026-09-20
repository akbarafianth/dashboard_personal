// toast.js
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag])
  );
}

function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgColor = type === 'error' ? 'bg-error' : 'bg-surface-container-high';
  const textColor = type === 'error' ? 'text-on-error' : 'text-on-surface';
  const icon = type === 'error' ? 'error' : 'check_circle';
  const iconColor = type === 'error' ? 'text-on-error' : 'text-primary';

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 transform translate-y-4 opacity-0 ${bgColor} ${textColor} pointer-events-auto`;
  
  toast.innerHTML = `
    <span class="material-symbols-outlined text-[20px] ${iconColor}">${icon}</span>
    <span class="font-label-md text-label-md">${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });
  });

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => {
      toast.remove();
      if (container.children.length === 0) {
        container.remove();
      }
    }, 300); // Wait for transition
  }, 3000);
}

window.showToast = showToast;

// Global Search Implementation
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('header input[type="text"]');
  if (!searchInput) return;

  // Search Results Container
  const searchContainer = document.createElement('div');
  searchContainer.className = 'absolute top-full left-0 right-0 mt-2 bg-surface-container-high rounded-xl shadow-xl overflow-hidden hidden z-[100] max-h-96 overflow-y-auto border border-outline-variant/30 flex flex-col';
  searchInput.parentElement.appendChild(searchContainer);

  let debounceTimer;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const q = e.target.value.trim();
    if (!q) {
      searchContainer.classList.add('hidden');
      return;
    }
    
    debounceTimer = setTimeout(async () => {
      try {
        const response = await fetch(`${window.API_BASE || 'http://localhost:3000/api'}/search?q=${encodeURIComponent(q)}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        
        searchContainer.replaceChildren();
        
        const allResults = [...data.tasks, ...data.notes, ...data.subjects];
        if (allResults.length === 0) {
          const empty = document.createElement('div');
          empty.className = 'p-space-md text-center text-body-sm text-outline';
          empty.textContent = 'Tidak ada hasil ditemukan.';
          searchContainer.appendChild(empty);
        } else {
          allResults.forEach(item => {
            const row = document.createElement('a');
            let href = '#';
            let icon = 'search';
            let typeLabel = '';
            
            if (item.type === 'task') {
              href = 'tugas_acara.html';
              icon = 'assignment';
              typeLabel = 'Tugas';
            } else if (item.type === 'note') {
              href = 'catatan_pertemuan.html';
              icon = 'auto_stories';
              typeLabel = 'Catatan';
            } else if (item.type === 'subject') {
              href = 'mata_kuliah_key_takeaways_pertemuan.html';
              icon = 'school';
              typeLabel = 'Mata Kuliah';
            }
            
            row.href = href;
            row.className = 'p-space-sm hover:bg-surface-container-highest transition-colors flex items-center gap-space-sm border-b border-outline-variant/20 last:border-0';
            row.innerHTML = `
              <span class="material-symbols-outlined text-tertiary text-[20px]">${icon}</span>
              <div class="flex flex-col flex-1 min-w-0">
                <span class="font-label-md text-label-md text-on-surface truncate">${escapeHtml(item.title)}</span>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] uppercase tracking-wider font-bold text-primary">${escapeHtml(typeLabel)}</span>
                  <span class="text-[11px] text-outline truncate">${escapeHtml(item.meta || '')}</span>
                </div>
              </div>
            `;
            searchContainer.appendChild(row);
          });
        }
        
        searchContainer.classList.remove('hidden');
      } catch(err) {
        console.error(err);
      }
    }, 300);
  });

  // Shortcut Cmd+K / Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchContainer.contains(e.target)) {
      searchContainer.classList.add('hidden');
    }
  });
});
