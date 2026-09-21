const fs = require('fs');
let f = 'pages/dashboard_akademik_utama.html';
let content = fs.readFileSync(f, 'utf8');
content = content.replace('lg:col-span-8', 'lg:col-span-6');
content = content.replace('lg:col-span-4', 'lg:col-span-6');
fs.writeFileSync(f, content, 'utf8');
