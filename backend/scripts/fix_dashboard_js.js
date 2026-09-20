const fs = require('fs');
const path = require('path');

const dashJsPath = path.join(__dirname, '../../assets/js/dashboard-data.js');
let js = fs.readFileSync(dashJsPath, 'utf8');

// Modifikasi loadDashboardData Promise.all untuk fetch '/notes'
js = js.replace(
  /const \[settings, tasks, subjects, events, analytics\] = await Promise\.all\(\[\s*requestJson\('\/dashboard-settings'\)\.catch\(\(\) => null\),\s*requestJson\('\/tasks\?status=active'\)\.catch\(\(\) => \[\]\),\s*requestJson\('\/subjects'\)\.catch\(\(\) => \[\]\),\s*requestJson\('\/events'\)\.catch\(\(\) => \[\]\),\s*requestJson\('\/analytics'\)\.catch\(\(\) => null\)\s*\]\);/g,
  `const [settings, tasks, subjects, events, analytics, notes] = await Promise.all([
      requestJson('/dashboard-settings').catch(() => null),
      requestJson('/tasks?status=active').catch(() => []),
      requestJson('/subjects').catch(() => []),
      requestJson('/events').catch(() => []),
      requestJson('/analytics').catch(() => null),
      requestJson('/notes').catch(() => [])
    ]);`
);

// Inject logic ke dalam async function loadDashboardData()
const injection = `
    if (analytics) {
      const urgentCountEl = document.getElementById('dashboard-urgent-task-count');
      const urgentProgressEl = document.getElementById('dashboard-urgent-task-progress');
      if (urgentCountEl) urgentCountEl.textContent = \`\${analytics.urgent_tasks} Sangat Mendesak\`;
      if (urgentProgressEl) {
        const activeTasks = analytics.active_tasks || 0;
        const pct = activeTasks > 0 ? (analytics.urgent_tasks / activeTasks * 100) : 0;
        urgentProgressEl.style.width = \`\${pct}%\`;
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
                 if (sub.key_takeaways) takeawaysCount += sub.key_takeaways.split('\\n').filter(t => t.trim() !== '').length;
              });
          }
          keyTakeawaysEl.textContent = \`\${takeawaysCount} Key Takeaways\`;
      }

      if (notesIndexedEl && notesProgressEl) {
          const indexedPct = notes.length > 0 ? 100 : 0;
          notesIndexedEl.textContent = \`\${indexedPct}% Terindeks\`;
          notesProgressEl.style.width = \`\${indexedPct}%\`;
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
                  ktList.innerHTML += \`
                      <a href="catatan_pertemuan.html?id=\${note.id}" class="block p-space-sm bg-surface-container-low hover:bg-surface-container rounded-xl transition-colors border border-surface-container">
                          <div class="flex justify-between items-start mb-1">
                              <h3 class="font-label-md text-label-md text-on-surface font-semibold truncate pr-2">\${window.escapeHtml(note.title)}</h3>
                              <span class="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant flex-shrink-0">\${window.escapeHtml(subjectName)}</span>
                          </div>
                          <p class="text-body-sm text-outline text-xs line-clamp-2">\${window.escapeHtml(note.content.replace(/<[^>]+>/g, ''))}</p>
                      </a>
                  \`;
              });
          } else {
              ktList.innerHTML = '<p class="text-body-sm text-outline p-space-md bg-surface-container rounded-xl text-center w-full block">Belum ada key takeaways terbaru.</p>';
          }
      }
    }
`;

js = js.replace(
  /if \(tasks && events\) renderDashboardCalendar\(tasks, events\);/g,
  `if (tasks && events) renderDashboardCalendar(tasks, events);\n${injection}`
);

fs.writeFileSync(dashJsPath, js, 'utf8');
console.log("Dashboard JS Updated!");
