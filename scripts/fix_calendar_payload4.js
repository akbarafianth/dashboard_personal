const fs = require('fs');
let f = 'assets/js/calendar-data.js';
let content = fs.readFileSync(f, 'utf8');

content = content.replace(`subject_id: document.getElementById('event-subject') ? document.getElementById('event-subject').value : 
(document.getElementById('modal-subject') ? document.getElementById('modal-subject').value : null)`, `subject_id: document.getElementById('modal-subject')?.value || null`);

fs.writeFileSync(f, content, 'utf8');
