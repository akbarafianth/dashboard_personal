const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../../pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html') && f !== 'landing_page.html');

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Cari akhir block head </head> lalu selipkan script
  if (!content.includes('notifications.js')) {
    content = content.replace(
      '</head>',
      '<script src="../assets/js/notifications.js" defer></script>\n</head>'
    );
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Injected notifications.js into ${file}`);
  }
}
