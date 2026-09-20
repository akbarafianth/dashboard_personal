const fs = require('fs');
const path = require('path');

const scriptsDir = path.join(__dirname, '../../backend/scripts');
const poolFile = path.join(__dirname, '../../backend/db/pool.js');

// 1. Remove self-reference pool.pool = pool
let poolContent = fs.readFileSync(poolFile, 'utf8');
poolContent = poolContent.replace(/pool\.pool = pool;\n/g, '');
fs.writeFileSync(poolFile, poolContent);

// 2. Fix remove_profile.js
let rmProfFile = path.join(scriptsDir, 'remove_profile.js');
if (fs.existsSync(rmProfFile)) {
  let content = fs.readFileSync(rmProfFile, 'utf8');
  content = content.replace(/const regex = \/Akbar Ariffianto\/g;/g, "const regex = /Akbar Ariffianto/g;");
  content = content.replace(/walkSync\('\.'\);/g, "walkSync(path.resolve(__dirname, '../../'));");
  
  // hapus bug .test()
  content = content.replace(/if \(regex\.test\(content\)\) \{[\s\S]*?content = content\.replace\(regex, ''\);/g, 
    "if (content.includes('Akbar Ariffianto')) {\n        content = content.replace(/Akbar Ariffianto/g, '');");
  
  fs.writeFileSync(rmProfFile, content);
}

// 3. Fix clean.js (paths)
let cleanFile = path.join(scriptsDir, 'clean.js');
if (fs.existsSync(cleanFile)) {
  let content = fs.readFileSync(cleanFile, 'utf8');
  content = content.replace(/'pages\/([^']+)'/g, "path.resolve(__dirname, '../../pages/$1')");
  if (!content.includes("const path = require('path');")) {
    content = "const path = require('path');\n" + content;
  }
  fs.writeFileSync(cleanFile, content);
}

// 4. Fix sync.js
let syncFile = path.join(scriptsDir, 'sync.js');
if (fs.existsSync(syncFile)) {
  let content = fs.readFileSync(syncFile, 'utf8');
  content = content.replace(/'assets\/([^']+)'/g, "path.resolve(__dirname, '../../assets/$1')");
  if (!content.includes("const path = require('path');")) {
    content = "const path = require('path');\n" + content;
  }
  fs.writeFileSync(syncFile, content);
}

// 5. patch.js handle error rejection
let patchFile = path.join(scriptsDir, 'patch.js');
if (fs.existsSync(patchFile)) {
  let content = fs.readFileSync(patchFile, 'utf8');
  content = content.replace(/patch\(\);/g, "patch().catch(console.error).finally(() => process.exit(0));");
  fs.writeFileSync(patchFile, content);
}

console.log('Backend scripts patched.');
