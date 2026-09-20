const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (!dirFile.includes('node_modules') && !dirFile.includes('.git')) {
        filelist = walkSync(dirFile, filelist);
      }
    } else {
      if (dirFile.endsWith('.html')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync(path.resolve(__dirname, '../../'));
let count = 0;
const regex = /<div class=\"flex items-center gap-space-sm pl-space-xs\"><div class=\"text-right hidden sm:flex flex-col\"><span class=\"font-label-md text-label-md text-on-surface leading-tight\">Akbar Ariffianto<\/span><span class=\"font-code-sm text-code-sm text-outline\" data-header-date><\/span><\/div><img alt=\"Profile\" class=\"w-8 h-8 rounded-full object-cover ring-1 ring-primary\/40\" src=\"[^\"]+\"><\/div>/g;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('Akbar Ariffianto')) {
        content = content.replace(/Akbar Ariffianto/g, '');
    fs.writeFileSync(f, content, 'utf8');
    count++;
    console.log('Updated', f);
  }
});
console.log('Total files updated:', count);
