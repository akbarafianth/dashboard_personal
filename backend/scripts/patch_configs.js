const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, '../../assets/js');
const sourceFile = path.join(jsDir, 'dashboard.js');
const targetFile = path.join(jsDir, 'tailwind-config.js');

if (fs.existsSync(sourceFile)) {
  fs.copyFileSync(sourceFile, targetFile);
}

// Hapus yang lama
['catatan.js', 'dashboard.js', 'kalender.js', 'mata_kuliah.js', 'todo.js', 'tugas.js'].forEach(f => {
  const p = path.join(jsDir, f);
  if (fs.existsSync(p)) fs.unlinkSync(p);
});

// Update HTML
const pagesDir = path.join(__dirname, '../../pages');
const htmlFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

htmlFiles.forEach(f => {
  const filePath = path.join(pagesDir, f);
  let html = fs.readFileSync(filePath, 'utf8');

  html = html.replace(/<script src="\.\.\/assets\/js\/(catatan|dashboard|kalender|mata_kuliah|todo|tugas)\.js"><\/script>/g, '<script src="../assets/js/tailwind-config.js"></script>');
  
  fs.writeFileSync(filePath, html);
});

// Sama untuk CSS
const cssDir = path.join(__dirname, '../../assets/css');
const cssSource = path.join(cssDir, 'dashboard.css');
const cssTarget = path.join(cssDir, 'base.css');

if (fs.existsSync(cssSource)) {
  fs.copyFileSync(cssSource, cssTarget);
}

['catatan.css', 'dashboard.css', 'kalender.css', 'mata_kuliah.css', 'todo.css', 'tugas.css'].forEach(f => {
  const p = path.join(cssDir, f);
  if (fs.existsSync(p)) fs.unlinkSync(p);
});

htmlFiles.forEach(f => {
  const filePath = path.join(pagesDir, f);
  let html = fs.readFileSync(filePath, 'utf8');

  html = html.replace(/<link rel="stylesheet" href="\.\.\/assets\/css\/(catatan|dashboard|kalender|mata_kuliah|todo|tugas)\.css">/g, '<link rel="stylesheet" href="../assets/css/base.css">');
  
  fs.writeFileSync(filePath, html);
});

console.log('Merged configs & CSS');
