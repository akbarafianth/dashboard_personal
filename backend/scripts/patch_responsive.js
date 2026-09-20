const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../../pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // Fix aside class
  html = html.replace(/<aside class="fixed left-0 top-0 h-full w-64/g, '<aside class="-translate-x-full lg:translate-x-0 fixed left-0 top-0 h-full w-64 transition-transform duration-300 z-50');

  // Fix main class
  html = html.replace(/<main class="flex-1 min-w-0 ml-64/g, '<main class="flex-1 min-w-0 lg:ml-64');
  html = html.replace(/<main class="flex-1 min-w-0 flex flex-col relative ml-64/g, '<main class="flex-1 min-w-0 flex flex-col relative lg:ml-64');
  // ada juga yang mungkin format lain
  html = html.replace(/<main([^>]*)ml-64/g, '<main$1lg:ml-64');

  fs.writeFileSync(filePath, html);
  console.log('Patched', file);
});
