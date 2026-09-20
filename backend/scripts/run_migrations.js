const fs = require('fs');
const path = require('path');
const pool = require('../db/pool');

async function runMigrations() {
  const client = await pool.connect();
  try {
    // Create tracking table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const migrationDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationDir).sort();

    for (const file of files) {
      if (file.endsWith('.sql')) {
        // Check if already applied
        const { rowCount } = await client.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [file]);
        if (rowCount > 0) {
          console.log(`Skipping already applied migration: ${file}`);
          continue;
        }

        console.log(`Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationDir, file), 'utf8');
        
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`Successfully applied: ${file}`);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`Migration failed on ${file}:`, err);
          throw err; // Stop on first error
        }
      }
    }
    console.log('All migrations applied successfully.');
  } catch (error) {
    console.error('Migration process aborted.', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end().catch(() => {});
  }
}

runMigrations().catch(console.error);
