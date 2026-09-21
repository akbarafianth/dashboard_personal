// notifications.js
document.addEventListener('DOMContentLoaded', () => {
  // Cari ikon bel notifikasi di header
  const bellContainers = document.querySelectorAll('header button');
  let notificationBtn = null;
  
  for (const btn of bellContainers) {
    if (btn.innerHTML.includes('notifications')) {
      notificationBtn = btn;
      break;
    }
  }

  if (!notificationBtn) return; // Jika tidak ada bel, skip

  // Hapus badge merah bawaan HTML (karena static)
  const existingBadge = notificationBtn.querySelector('.bg-error');
  if (existingBadge) existingBadge.remove();

  // Tambahkan Container untuk Dropdown relative to the header button
  notificationBtn.classList.add('relative');

  // Buat element Dropdown Menu
  const dropdown = document.createElement('div');
  dropdown.className = 'absolute top-full mt-2 right-0 w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container-high hidden flex-col z-50 overflow-hidden';
  dropdown.innerHTML = `
    <div class="px-space-md py-space-sm border-b border-surface-container-high flex items-center justify-between bg-surface-container-low">
      <span class="font-label-md text-label-md font-semibold text-on-surface">Notifikasi</span>
      <span id="notif-count-text" class="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-2 py-1 rounded-full">0</span>
    </div>
    <div id="notif-list" class="flex flex-col max-h-96 overflow-y-auto p-space-xs gap-space-xs">
      <div class="p-space-md text-center text-on-surface-variant font-body-sm text-body-sm">Belum ada notifikasi</div>
    </div>
  `;
  
  // Buat element dynamic red badge
  const badge = document.createElement('span');
  badge.className = 'absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-error ring-2 ring-surface-container-low hidden';
  
  notificationBtn.appendChild(badge);
  notificationBtn.appendChild(dropdown);

  // Toggle Dropdown onclick
  notificationBtn.addEventListener('click', (e) => {
    // Jangan close dropdown jika klik di dalam dropdown itu sendiri
    if (e.target.closest('.absolute.top-full')) return;
    dropdown.classList.toggle('hidden');
    dropdown.classList.toggle('flex');
  });

  // Close jika klik di luar
  document.addEventListener('click', (e) => {
    if (!notificationBtn.contains(e.target)) {
      dropdown.classList.add('hidden');
      dropdown.classList.remove('flex');
    }
  });

  // Fetch logic
  window.loadNotifications = async function() {
    try {
      const response = await fetch(`${window.API_BASE}/notifications`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const result = await response.json();
      
      // Update badge
      if (result.count > 0) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }

      // Update text count
      const countText = document.getElementById('notif-count-text');
      if (countText) countText.textContent = result.count;

      // Update list
      const listContainer = document.getElementById('notif-list');
      if (!listContainer) return;

      listContainer.innerHTML = ''; // bersihkan

      if (result.count === 0) {
        listContainer.innerHTML = '<div class="p-space-md text-center text-on-surface-variant font-body-sm text-body-sm">Belum ada deadline mendesak</div>';
        return;
      }

      // Render items
      result.data.forEach(item => {
        // urgensi 1 (< 1 hari) -> Red, urgensi 2 (< 2 hari) -> Amber/Orange
        const colorClass = item.urgency_level === 1 
          ? 'bg-error/10 text-error ring-1 ring-error/20' 
          : 'bg-tertiary/10 text-tertiary ring-1 ring-tertiary/20';

        const iconType = item.type === 'task' ? 'task_alt' : 'event';
        
        const itemEl = document.createElement('div');
        itemEl.className = 'flex items-start gap-space-sm p-space-sm rounded-lg hover:bg-surface-container-low transition-colors cursor-default';
        itemEl.innerHTML = `
          <div class="mt-0.5 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-surface-container text-on-surface-variant">
            <span class="material-symbols-outlined text-[18px]">${iconType}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-label-sm text-label-sm font-semibold text-on-surface truncate" title="${window.escapeHtml(item.title)}">${window.escapeHtml(item.title)}</div>
            <div class="mt-1 flex items-center gap-space-xs">
              <span class="inline-block px-1.5 py-0.5 rounded-md font-code-sm text-[10px] uppercase font-bold tracking-wider ${colorClass}">
                ${item.urgency_text}
              </span>
              <span class="font-body-sm text-[11px] text-outline truncate">
                ${item.type === 'task' ? 'Tugas' : 'Acara'}
              </span>
            </div>
          </div>
        `;
        listContainer.appendChild(itemEl);
      });

    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  // Initial load
  loadNotifications();
  
  // Polling per 5 detik
  window.setInterval(() => {
    if (!document.hidden) loadNotifications();
  }, 5000);
});
