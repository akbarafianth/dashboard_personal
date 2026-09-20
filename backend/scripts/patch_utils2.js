const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, '../../assets/js');
const dataFiles = ['calendar-data.js', 'dashboard-data.js', 'notes-data.js', 'subjects-data.js', 'tasks-data.js', 'todo-data.js'];

dataFiles.forEach(f => {
  const filePath = path.join(jsDir, f);
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('const API_BASE = window.API_BASE;')) {
    content = 'const API_BASE = window.API_BASE;\n' + content;
    fs.writeFileSync(filePath, content);
  }
});
