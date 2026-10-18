
// Menggunakan relative path agar dinamis (bisa untuk localhost dan domain Vercel)
window.API_BASE = window.API_BASE || '/api';

const academyFetch = window.fetch.bind(window);
window.fetch = function(input, options = {}) {
  const requestUrl = typeof input === 'string' ? input : input.url;
  const isApiRequest = requestUrl.includes('/api/');
  const isAuthRequest = requestUrl.includes('/api/auth/');
  const headers = new Headers(options.headers || (input instanceof Request ? input.headers : undefined));
  const token = window.localStorage.getItem('academiq_token');

  if (isApiRequest && !isAuthRequest && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return academyFetch(input, { ...options, headers }).then((response) => {
    if (response.status === 401 && !isAuthRequest && !window.location.pathname.endsWith('landing_page.html')) {
      window.localStorage.removeItem('academiq_token');
      window.localStorage.removeItem('academiq_user');
      window.location.href = '/pages/landing_page.html';
    }
    return response;
  });
};

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
  if (typeof loadNotifications === 'function') loadNotifications().catch(()=>{});
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
