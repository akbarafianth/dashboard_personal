const fs = require('fs');
let f = 'assets/js/tasks-data.js';
let content = fs.readFileSync(f, 'utf8');

const checkboxHelper = `
function createCheckboxHtml(task) {
  const isChecked = task.status === 'completed' ? 'checked' : '';
  return \`<input type="checkbox" class="w-5 h-5 rounded border-outline focus:ring-primary text-primary bg-surface-container cursor-pointer" data-toggle-task="\${task.id}" \${isChecked}>\`;
}
`;

if(!content.includes('createCheckboxHtml')) {
  content = content.replace('function renderTasks', checkboxHelper + '\nfunction renderTasks');
}

fs.writeFileSync(f, content, 'utf8');
