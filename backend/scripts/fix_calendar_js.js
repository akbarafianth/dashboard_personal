const fs = require('fs');
const path = require('path');

const calJsPath = path.join(__dirname, '../../assets/js/calendar-data.js');
let js = fs.readFileSync(calJsPath, 'utf8');

// 1. Fixing DOMContentLoaded initial render
js = js.replace(
  /renderHeaderDate\(\);\s*loadEvents\(\);/g,
  `renderHeaderDate();\n  renderCalendar(); // Memaksa render kosong pada awal muat agar tidak blank\n  loadEvents();`
);

// 2. Modifikasi loadEvents() untuk memuat analytics dan update KPI
js = js.replace(
  /dashboardEvents = await apiRequest\('\/events'\);\s*renderCalendar\(\);/g,
  `const [eventsData, tasksData, analyticsData] = await Promise.all([
        apiRequest('/events').catch(() => []),
        apiRequest('/tasks?status=active').catch(() => []),
        apiRequest('/analytics').catch(() => null)
      ]);
      dashboardEvents = eventsData;

      // Update KPI
      const kpiTenggat = document.getElementById('calendar-kpi-tenggat');
      const filterUrgent = document.getElementById('calendar-filter-urgent');
      const filterTerjadwal = document.getElementById('calendar-filter-terjadwal');

      if (kpiTenggat && tasksData) {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        // Count events from /tasks array that happen this week
        const tasksThisWeek = tasksData.filter(t => {
            const d = new Date(t.deadline);
            return d >= startOfWeek && d <= endOfWeek;
        }).length;
        
        kpiTenggat.textContent = \`\${tasksThisWeek} Tenggat Minggu Ini\`;
      }

      if (filterUrgent && analyticsData) {
        filterUrgent.textContent = \`\${analyticsData.urgent_tasks} Urgent\`;
      }

      if (filterTerjadwal && eventsData) {
        // 'Terjadwal' bisa dihitung berdasarkan acara masa depan
        const futureEventsCount = eventsData.filter(e => new Date(e.event_date) >= new Date()).length;
        filterTerjadwal.innerHTML = \`<span class="w-2 h-2 rounded-full bg-tertiary"></span> \${futureEventsCount} Terjadwal\`;
      }

      renderCalendar();`
);

fs.writeFileSync(calJsPath, js, 'utf8');
console.log("Calendar JS Updated!");
