const fs = require('fs');
let f = 'assets/js/calendar-data.js';
let content = fs.readFileSync(f, 'utf8');

// There are two places where /events POST is made: one for Quick Form, one for Modal.
// Quick Form:
content = content.replace(/body: JSON\.stringify\(\{\s*title,\s*event_date: `\$\{date\}T\$\{time\}:00`,\s*category,\s*priority,\s*description\s*\}\)/g, `body: JSON.stringify({
            title,
            event_date: \`\${date}T\${time}:00\`,
            category,
            priority,
            description,
            subject_id: document.getElementById('event-subject') ? document.getElementById('event-subject').value : (document.getElementById('modal-subject') ? document.getElementById('modal-subject').value : null)
          })`);

fs.writeFileSync(f, content, 'utf8');
