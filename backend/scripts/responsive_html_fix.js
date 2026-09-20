const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../../pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html') && f !== 'landing_page.html');

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Fix wrapper pl-64
  content = content.replace(
    /<div class="pl-64/g,
    '<div class="lg:pl-64 pl-0 transition-all duration-300'
  );

  // 2. Fix header left-64
  content = content.replace(
    /<header class="fixed top-0 left-64/g,
    '<header class="fixed top-0 lg:left-64 left-0 transition-all duration-300'
  );

  // 3. Tambahkan Hamburger button di awal header content (jika belum ada)
  if (!content.includes('id="mobile-menu-toggle"')) {
    content = content.replace(
      /<div class="flex items-center gap-space-md flex-1 max-w-xl">/g,
      `<div class="flex items-center gap-space-md flex-1 max-w-xl">
        <button id="mobile-menu-toggle" class="lg:hidden p-2 -ml-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors flex items-center justify-center">
          <span class="material-symbols-outlined text-[24px]">menu</span>
        </button>`
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated HTML layout in ${file}`);
}
