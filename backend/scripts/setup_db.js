const fs = require('fs');
const path = require('path');
const pool = require('../db/pool');

async function setupDatabase() {
  const client = await pool.connect();
  try {
    console.log('Starting Database Setup...');
    
    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, '../schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query('BEGIN');
    console.log('Dropping app-specific existing tables (safe for Supabase system schemas)...');
    await client.query(`
      DROP TABLE IF EXISTS schema_migrations CASCADE;
      DROP TABLE IF EXISTS dashboard_settings CASCADE;
      DROP TABLE IF EXISTS notes CASCADE;
      DROP TABLE IF EXISTS events CASCADE;
      DROP TABLE IF EXISTS tasks CASCADE;
      DROP TABLE IF EXISTS subjects CASCADE;
    `);

    console.log('Executing schema.sql...');
    await client.query(schemaSql);
    
    // Initialize schema_migrations to prevent existing migrations from re-running
    // Since schema.sql already contains all features from 001 to 005
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    
    const migrationDir = path.join(__dirname, '../migrations');
    if (fs.existsSync(migrationDir)) {
      const files = fs.readdirSync(migrationDir).sort();
      for (const file of files) {
        if (file.endsWith('.sql')) {
          await client.query(
            'INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING',
            [file]
          );
        }
      }
      console.log('Marked all existing migrations as applied.');
    }
    
    await client.query('COMMIT');
    console.log('Database setup completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database setup failed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end().catch(() => {});
  }
}

setupDatabase().catch(console.error);