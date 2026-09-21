const fs = require('fs');
const glob = require('glob');

const files = glob.sync('pages/*.html');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  // Task 2: Remove Global Search Bar
  const globalSearchRegex = /<div class="relative w-full"><span class="material-symbols-outlined absolute left-space-sm top-1\/2 -translate-y-1\/2 text-outline text-\[18px\]">search<\/span><input[^>]+type="text"><\/div><div class="relative flex-shrink-0">/g;
  content = content.replace(globalSearchRegex, '<div class="relative flex-shrink-0 ml-auto">');

  if (f.includes('mata_kuliah_key_takeaways_pertemuan.html')) {
    // Task 1: Remove Filter by Dosen
    const dosenFilterRegex = /<div class="relative">\s*<select[^>]*>\s*<option>Semua Dosen<\/option>.*?<\/select>\s*<span[^>]*>person<\/span>\s*<\/div>/s;
    content = content.replace(dosenFilterRegex, '');

    // Task 2 specific: Remove Search Bar next to semester
    const subjectSearchRegex = /<div class="relative w-full sm:w-80">\s*<span[^>]*>search<\/span>\s*<input[^>]*placeholder="Cari dosen[^>]*>\s*<\/div>/s;
    content = content.replace(subjectSearchRegex, '');
    
    // Also remove the "sort" dropdown that I added in d50248e if it's there
    // The user didn't ask to remove it, but they said "hapus fitur search nya juga di samping tulisan semester ganjil dan kamu optimalisasikan layout di dalam barnya"
    // To optimize layout, removing the w-full on the left side means the items will shift left.
  }

  // Task 3: In Dashboard (dashboard_akademik_utama.html), remove shortcuts and optimize schedule/active courses.
  if (f.includes('dashboard_akademik_utama.html')) {
    const shortcutsRegex = /<!-- Section 3: Shortcut Eksekutif -->.*?<!-- Section 4: Progress \& Review Matkul -->/s;
    content = content.replace(shortcutsRegex, '<!-- Section 4: Progress & Review Matkul -->');
    
    // Change Jadwal Kuliah container from xl:col-span-4 to xl:col-span-6
    content = content.replace('xl:col-span-4', 'xl:col-span-6');
    
    // Change Active courses container from xl:col-span-8 to xl:col-span-6
    content = content.replace('xl:col-span-8', 'xl:col-span-6');
  }

  fs.writeFileSync(f, content, 'utf8');
});
