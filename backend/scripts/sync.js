const path = require('path');
const fs = require('fs');

const files = [
  path.resolve(__dirname, '../../assets/js/dashboard-data.js'),
  path.resolve(__dirname, '../../assets/js/calendar-data.js'),
  path.resolve(__dirname, '../../assets/js/subjects-data.js'),
  path.resolve(__dirname, '../../assets/js/notes-data.js'),
  path.resolve(__dirname, '../../assets/js/tasks-data.js'),
  path.resolve(__dirname, '../../assets/js/todo-data.js')
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Inject broadcast into the success block
  content = content.replace(
    /if \(window\.showToast\) window\.showToast\(msg, 'success'\); }/g,
    "if (window.showToast) window.showToast(msg, 'success'); if (window.syncChannel) window.syncChannel.postMessage('REFRESH'); }"
  );

  const receiver = `\n
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
  if (!content.includes("BroadcastChannel('academiq_sync')")) {
    content += receiver;
  }

  fs.writeFileSync(file, content, 'utf8');
});
console.log("Sync script injected.");
