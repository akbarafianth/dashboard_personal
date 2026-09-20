const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../../pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

files.forEach(f => {
  const filePath = path.join(pagesDir, f);
  let html = fs.readFileSync(filePath, 'utf8');

  // Menghapus link font yang kedua
  html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Material\+Symbols\+Outlined:wght,FILL@100\.\.700,0\.\.1&amp;display=swap" rel="stylesheet">/, '');
  // Kadang nulisnya beda
  html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Material\+Symbols\+Outlined:wght,FILL@100\.\.700,0\.\.1&display=swap" rel="stylesheet">/, '');

  fs.writeFileSync(filePath, html);
  console.log('Cleaned font', f);
});
