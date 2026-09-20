const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, '../../assets/css');
const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));

cssFiles.forEach(file => {
  const filePath = path.join(cssDir, file);
  let css = fs.readFileSync(filePath, 'utf8');

  // Ganti scrollbar hidden
  css = css.replace(/::-webkit-scrollbar\{display:none;\}/g, '/* Removed scrollbar hiding for accessibility */');

  fs.writeFileSync(filePath, css);
  console.log('Patched CSS', file);
});

// modal patching
const pagesDir = path.join(__dirname, '../../pages');
const pagesFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

pagesFiles.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // Cari modal yang sering ditandai id="...Modal" atau class="... z-[100]"
  html = html.replace(/<div id="([^"]+Modal[^"]*)" class="([^"]*fixed[^"]*hidden[^"]*)"/g, '<div id="$1" class="$2" role="dialog" aria-modal="true"');

  fs.writeFileSync(filePath, html);
  console.log('Patched Modal ARIA', file);
});

// Title tag injection
pagesFiles.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  if (!html.includes('<title>')) {
    html = html.replace(/<head>/, '<head><title>AcademIQ - Dashboard Akademik</title>');
    fs.writeFileSync(filePath, html);
    console.log('Patched Title', file);
  }
});
