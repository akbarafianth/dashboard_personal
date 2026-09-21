const fs = require('fs');
let f = 'assets/js/calendar-data.js';
let content = fs.readFileSync(f, 'utf8');

// I will specifically parse the quick form submit and modal submit.
// But wait, the `body: JSON.stringify` replacement was global. Let me check the file content.
