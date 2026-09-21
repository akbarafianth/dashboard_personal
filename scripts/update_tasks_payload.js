const fs = require('fs');
let f = 'assets/js/tasks-data.js';
let content = fs.readFileSync(f, 'utf8');

const regex = /body: JSON\.stringify\(\{\s*title,\s*description,\s*deadline: new Date\(deadline\)\.toISOString\(\),\s*priority,\s*estimated_hours,\s*status: 'pending'\s*\}\)/;

content = content.replace(regex, `body: JSON.stringify({
          title,
          description,
          deadline: new Date(deadline).toISOString(),
          priority,
          estimated_hours,
          status: 'pending',
          subject_id: document.getElementById('modal-subject')?.value || null
        })`);

fs.writeFileSync(f, content, 'utf8');
