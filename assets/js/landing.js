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
  const API_BASE = window.API_BASE || 'http://localhost:3000/api';

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
});