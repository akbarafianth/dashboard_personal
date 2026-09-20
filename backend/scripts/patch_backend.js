const fs = require('fs');
const path = require('path');

const routes = ['events.js', 'notes.js', 'subjects.js', 'tasks.js'];
const routesDir = path.join(__dirname, '../routes');

routes.forEach(route => {
  const filePath = path.join(routesDir, route);
  let content = fs.readFileSync(filePath, 'utf8');

  // Inject require
  if (!content.includes("_helpers")) {
    content = content.replace(/const pool = require\('\.\.\/db\/pool'\);/, "const pool = require('../db/pool');\nconst { buildInsert, buildUpdate } = require('./_helpers');");
  }

  // Remove local buildInsert
  content = content.replace(/function buildInsert[\s\S]*?\}\n/, '');
  // Remove local buildUpdate
  content = content.replace(/function buildUpdate[\s\S]*?\}\n/, '');

  // modify validatePayload call to pass config
  // Kita biarkan local validatePayload karena beberapa route punya custom logic validatePayload
  content = content.replace(/const validationError = validatePayload\(req\.body\);/g, 'const validationError = validatePayload(req.body, config);');
  content = content.replace(/const \{ fields, values, placeholders \} = buildInsert\(req\.body\);/g, 'const { fields, values, placeholders } = buildInsert(req.body, config);');
  content = content.replace(/const \{ values, assignments \} = buildUpdate\(req\.body\);/g, 'const { values, assignments } = buildUpdate(req.body, config);');

  fs.writeFileSync(filePath, content);
  console.log('Patched backend util', route);
});
