const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, '../../assets/js');

// Create shared utils
const utilsContent = `
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
      if (typeof loadDashboardData === 'function') loadDashboardData().catch(()=>{});
      if (typeof loadEvents === 'function') loadEvents().catch(()=>{});
      if (typeof loadSubjects === 'function') loadSubjects().catch(()=>{});
      if (typeof loadNotes === 'function') loadNotes().catch(()=>{});
      if (typeof loadTasks === 'function') loadTasks().catch(()=>{});
      if (typeof loadAllTasks === 'function') loadAllTasks().catch(()=>{});
    }
  };
}
`;
fs.writeFileSync(path.join(jsDir, 'shared-utils.js'), utilsContent);

// Strip from individual data files
const dataFiles = ['calendar-data.js', 'dashboard-data.js', 'notes-data.js', 'subjects-data.js', 'tasks-data.js', 'todo-data.js'];
dataFiles.forEach(f => {
  const filePath = path.join(jsDir, f);
  let content = fs.readFileSync(filePath, 'utf8');

  // Strip API_BASE decl
  content = content.replace(/const API_BASE = window\.API_BASE \|\| 'http:\/\/localhost:3000\/api';\n*/g, '');

  // Strip escapeHtml
  content = content.replace(/function escapeHtml[\s\S]*?\}\n/g, '');

  // Strip renderHeaderDate
  content = content.replace(/function renderHeaderDate[\s\S]*?\}\n/g, '');

  // Strip syncChannel
  content = content.replace(/if \(!window\.syncChannel\) \{[\s\S]*?\}\n\}\n/g, '');

  fs.writeFileSync(filePath, content);
  console.log('Stripped utils from', f);
});

// Update HTML to include shared-utils.js
const pagesDir = path.join(__dirname, '../../pages');
const htmlFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

htmlFiles.forEach(f => {
  const filePath = path.join(pagesDir, f);
  let html = fs.readFileSync(filePath, 'utf8');

  if (!html.includes('shared-utils.js')) {
    html = html.replace(/<script src="\.\.\/assets\/js\/toast\.js"><\/script>/, '<script src="../assets/js/shared-utils.js"></script>\n<script src="../assets/js/toast.js"></script>');
    fs.writeFileSync(filePath, html);
    console.log('Injected shared-utils to', f);
  }
});
