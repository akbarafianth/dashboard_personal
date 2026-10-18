tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Plus Jakarta Sans', 'sans-serif'],
            cinzel: ['Cinzel', 'serif']
          },
          colors: {
            surface: '#0a0d14',
            'surface-card': '#111622',
            'surface-border': '#1e2638',
            primary: {
              DEFAULT: '#6366f1',
              hover: '#4f46e5',
              glow: '#818cf8'
            }
          }
        }
      }
    }

document.addEventListener('DOMContentLoaded', async () => {
  const API_BASE = window.API_BASE || '/api';
  const authPanel = document.getElementById('auth-panel');
  const workspaceActions = document.getElementById('workspace-actions');
  const authForm = document.getElementById('auth-form');
  const authName = document.getElementById('auth-name');
  const authEmail = document.getElementById('auth-email');
  const authPassword = document.getElementById('auth-password');
  const authSubmit = document.getElementById('auth-submit');
  const authMessage = document.getElementById('auth-message');
  const loginTab = document.getElementById('auth-login-tab');
  const registerTab = document.getElementById('auth-register-tab');
  let authMode = 'login';

  const showAuthenticatedWorkspace = () => {
    authPanel?.classList.add('hidden');
    workspaceActions?.classList.remove('hidden');
    workspaceActions?.classList.add('flex');
  };

  const setAuthMode = (mode) => {
    authMode = mode;
    const registering = mode === 'register';
    authName?.classList.toggle('hidden', !registering);
    authName?.toggleAttribute('required', registering);
    authSubmit.textContent = registering ? 'Daftar' : 'Masuk';
    loginTab?.classList.toggle('bg-indigo-600', !registering);
    registerTab?.classList.toggle('bg-indigo-600', registering);
  };

  loginTab?.addEventListener('click', () => setAuthMode('login'));
  registerTab?.addEventListener('click', () => setAuthMode('register'));

  if (window.localStorage.getItem('academiq_token')) {
    showAuthenticatedWorkspace();
  }

  authForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    authSubmit.disabled = true;
    authMessage.textContent = 'Memproses...';
    try {
      const response = await fetch(`${API_BASE}/auth/${authMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authName.value,
          email: authEmail.value,
          password: authPassword.value
        })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'Autentikasi gagal');
      window.localStorage.setItem('academiq_token', body.token);
      window.localStorage.setItem('academiq_user', JSON.stringify(body.user));
      showAuthenticatedWorkspace();
      authMessage.textContent = '';
      await loadLandingData();
    } catch (error) {
      authMessage.textContent = error.message;
    } finally {
      authSubmit.disabled = false;
    }
  });

  async function loadLandingData() {
    try {
      const [analyticsRes, settingsRes] = await Promise.all([
        fetch(`${API_BASE}/analytics`),
        fetch(`${API_BASE}/dashboard-settings`)
      ]);

    if (analyticsRes.ok) {
      const analytics = await analyticsRes.json();
      
      const activeTasksEl = document.getElementById('landing-active-tasks');
      if (activeTasksEl) {
        activeTasksEl.textContent = `${analytics.active_tasks} Tugas`;
      }

      const urgentTasksEl = document.getElementById('landing-urgent-tasks');
      if (urgentTasksEl) {
        if (analytics.urgent_tasks > 0) {
          urgentTasksEl.textContent = `${analytics.urgent_tasks} Deadline Mendesak (< 48 Jam)`;
          urgentTasksEl.parentElement.classList.remove('hidden');
        } else {
          urgentTasksEl.textContent = 'Tidak ada deadline mendesak';
          urgentTasksEl.parentElement.classList.remove('text-rose-400');
          urgentTasksEl.parentElement.classList.add('text-emerald-400');
        }
      }
    }

    if (settingsRes.ok) {
      const settings = await settingsRes.json();
      
      const studyDaysEl = document.getElementById('landing-study-days');
      const studyHoursAvgEl = document.getElementById('landing-study-hours-avg');
      
      if (studyDaysEl && studyHoursAvgEl) {
        const createdAt = new Date(settings.created_at);
        const now = new Date();
        const diffTime = Math.abs(now - createdAt);
        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        
        studyDaysEl.textContent = `${diffDays} Hari`;
        
        // 1 pomodoro cycle = 25 minutes
        const totalMinutes = (settings.pomodoro_cycles || 0) * 25;
        const totalHours = totalMinutes / 60;
        const avgHoursPerDay = (totalHours / diffDays).toFixed(1);
        
        studyHoursAvgEl.textContent = `Rata-rata ${avgHoursPerDay} jam / hari`;
      }
    }
    } catch (error) {
      console.error('Failed to load landing page data:', error);
    }
  }

  if (window.localStorage.getItem('academiq_token')) {
    await loadLandingData();
  }
});