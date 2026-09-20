
window.API_BASE = window.API_BASE || 'http://localhost:3000/api';

window.escapeHtml = function(str) {
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
};

window.renderHeaderDate = function() {
  const dateElements = document.querySelectorAll('[data-header-date]');
  if (!dateElements.length) return;
  const formatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());
  dateElements.forEach((el) => { el.textContent = formatted; });
};

if (!window.syncChannel) {
  window.syncChannel = new BroadcastChannel('academiq_sync');
  window.syncChannel.onmessage = (event) => {
    if (event.data === 'REFRESH') {
      triggerGlobalRefresh();
    }
  };
}

// Helper to trigger fetch on all loaded modules
window.triggerGlobalRefresh = function() {
  if (typeof loadDashboardData === 'function') loadDashboardData().catch(()=>{});
  if (typeof loadEvents === 'function') loadEvents().catch(()=>{});
  if (typeof loadSubjects === 'function') loadSubjects().catch(()=>{});
  if (typeof loadNotes === 'function') loadNotes().catch(()=>{});
  if (typeof loadTasks === 'function') loadTasks().catch(()=>{});
  if (typeof loadAllTasks === 'function') loadAllTasks().catch(()=>{});
};

// Smart Focus Trigger (Auto Fetch saat kembali ke tab/buka aplikasi di HP)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    window.triggerGlobalRefresh();
  }
});

window.addEventListener('focus', () => {
  window.triggerGlobalRefresh();
});
