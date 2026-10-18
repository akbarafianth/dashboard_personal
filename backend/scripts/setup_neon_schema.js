const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const NEON_CONN = "postgresql://neondb_owner:npg_XPKD0N6Gmlfh@ep-proud-frog-b3l1y2hl-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function setupNeonSchema() {
  console.log('📋 PHASE 1: Setup Neon Schema\n');
  let neonPool;
  try {
    console.log('🔗 Connecting to Neon...');
    neonPool = new Pool({ connectionString: NEON_CONN });
    const neonTest = await neonPool.query('SELECT 1');
    console.log('✅ Neon connected\n');

    const schemaPath = path.join(__dirname, '../schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('📍 Dropping existing tables (if any)...');
    await neonPool.query(`
      DROP TABLE IF EXISTS schema_migrations CASCADE;
      DROP TABLE IF EXISTS dashboard_settings CASCADE;
      DROP TABLE IF EXISTS notes CASCADE;
      DROP TABLE IF EXISTS events CASCADE;
      DROP TABLE IF EXISTS tasks CASCADE;
      DROP TABLE IF EXISTS subjects CASCADE;
    `);
    console.log('✅ Tables dropped\n');

    console.log('📍 Creating schema...');
    await neonPool.query(schemaSql);
    console.log('✅ Schema created with all tables and indexes\n');

    console.log('📍 Verifying tables...');
    const tables = await neonPool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('✅ Tables created:');
    tables.rows.forEach(row => console.log(`   - ${row.table_name}`));

    await neonPool.end();
    return true;
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    if (neonPool) await neonPool.end();
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         NEON DB SCHEMA SETUP (Alternative Mode)           ║');
  console.log('║      Direct Neon Connection - No Supabase Required        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    const success = await setupNeonSchema();

    if (success) {
      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║                    SETUP COMPLETE                         ║');
      console.log('╚════════════════════════════════════════════════════════════╝\n');

      console.log('✅ Neon DB schema ready\n');

      console.log('📌 MIGRATION OPTIONS:\n');
      console.log('Option 1: MANUAL DATA EXPORT FROM SUPABASE');
      console.log('  - Export each table as CSV from Supabase Dashboard');
      console.log('  - Use import script: npm run migrate:import-csv\n');

      console.log('Option 2: DIRECT SQL DUMP');
      console.log('  - From your local machine with Supabase access:');
      console.log('  - pg_dump (Supabase connection) | psql (Neon connection)\n');

      console.log('Option 3: USE SUPABASE MIGRATION ASSISTANT');
      console.log('  - https://supabase.com/docs/guides/migrations\n');

      console.log('Next: Choose migration method and run appropriate import script\n');
    } else {
      console.error('❌ Setup failed. Check Neon connection string.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
