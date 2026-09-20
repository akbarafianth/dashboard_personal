const pool = require('../db/pool');

async function patch() {
  try {
    await pool.query('ALTER TABLE subjects ADD COLUMN grade TEXT;');
    console.log('Added grade to subjects');
  } catch(e) { console.error(e.message); }
  
  try {
    await pool.query('ALTER TABLE dashboard_settings ADD COLUMN pomodoro_cycles INTEGER NOT NULL DEFAULT 0;');
    console.log('Added pomodoro_cycles to dashboard_settings');
  } catch(e) { console.error(e.message); }
  
  await pool.end();
}

patch().catch(console.error).finally(() => process.exit(0));
