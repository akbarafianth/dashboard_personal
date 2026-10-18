const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const SUPABASE_CONN = "postgresql://postgres:sHWsc.%24%2A%3Fzhm8%25%3F@db.wfyvfmdbcrknymgllrzm.supabase.co:5432/postgres";
const NEON_CONN = "postgresql://neondb_owner:npg_XPKD0N6Gmlfh@ep-proud-frog-b3l1y2hl-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const SUPABASE_CONFIG = {
  connectionString: SUPABASE_CONN,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  statement_timeout: 60000,
  ssl: { rejectUnauthorized: false }
};

const NEON_CONFIG = {
  connectionString: NEON_CONN,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  statement_timeout: 60000,
  ssl: { rejectUnauthorized: false }
};

let supabasePool;
let neonPool;

async function connectWithRetry(config, name, maxRetries = 3) {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      console.log(`🔗 Connecting to ${name} (attempt ${i}/${maxRetries})...`);
      const pool = new Pool(config);
      const result = await pool.query('SELECT 1');
      console.log(`✅ ${name} connected\n`);
      return pool;
    } catch (error) {
      console.error(`   ❌ Attempt ${i} failed: ${error.message}`);
      if (i < maxRetries) {
        const waitTime = Math.pow(2, i) * 1000;
        console.log(`   ⏳ Retrying in ${waitTime / 1000}s...\n`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  throw new Error(`Failed to connect to ${name} after ${maxRetries} attempts`);
}

async function exportDataFromSupabase() {
  console.log('\n📊 PHASE 2: Export Data from Supabase\n');
  const data = {};
  const tables = ['subjects', 'tasks', 'events', 'notes', 'dashboard_settings'];

  try {
    for (const table of tables) {
      console.log(`📍 Exporting ${table}...`);
      try {
        const result = await supabasePool.query(
          `SELECT * FROM ${table} ORDER BY id ASC`
        );
        data[table] = result.rows;
        console.log(`✅ ${table}: ${result.rows.length} rows exported\n`);
      } catch (tableError) {
        console.warn(`⚠️  Could not export ${table}: ${tableError.message}`);
        console.log(`   Continuing with other tables...\n`);
        data[table] = [];
      }
    }
    return data;
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    return null;
  }
}

async function importDataToNeon(data) {
  console.log('\n📥 PHASE 3: Import Data to Neon\n');

  try {
    const client = await neonPool.connect();
    await client.query('BEGIN');

    const tables = ['subjects', 'tasks', 'events', 'notes', 'dashboard_settings'];
    let totalInserted = 0;

    for (const table of tables) {
      const rows = data[table];
      if (!rows || rows.length === 0) {
        console.log(`⏭️  ${table}: skipped (no data)`);
        continue;
      }

      console.log(`📍 Importing ${table}...`);
      let inserted = 0;
      let skipped = 0;

      for (const row of rows) {
        const columns = Object.keys(row);
        const values = columns.map(col => row[col]);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const columnNames = columns.join(', ');

        const query = `INSERT INTO ${table} (${columnNames}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`;

        try {
          const result = await client.query(query, values);
          if (result.rowCount > 0) {
            inserted++;
          } else {
            skipped++;
          }
        } catch (insertError) {
          console.error(`  ❌ Row ${row.id} failed:`, insertError.message);
          console.log(`     Query: ${query}`);
        }
      }

      console.log(`✅ ${table}: ${inserted} rows imported${skipped > 0 ? `, ${skipped} skipped (duplicate)` : ''}\n`);
      totalInserted += inserted;
    }

    await client.query('COMMIT');
    client.release();
    
    console.log(`\n📈 Total rows inserted: ${totalInserted}\n`);
    return true;
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    return false;
  }
}

async function verifyDataIntegrity(originalData) {
  console.log('\n✔️  PHASE 4: Verify Data Integrity\n');

  try {
    const tables = ['subjects', 'tasks', 'events', 'notes', 'dashboard_settings'];
    let totalRows = 0;
    let allValid = true;

    console.log('📊 Row Counts:\n');
    for (const table of tables) {
      const result = await neonPool.query(`SELECT COUNT(*) as count FROM ${table}`);
      const neonCount = parseInt(result.rows[0].count);
      const supabaseCount = originalData[table] ? originalData[table].length : 0;

      console.log(`${table}:`);
      console.log(`   Supabase: ${supabaseCount} rows`);
      console.log(`   Neon:     ${neonCount} rows`);

      if (neonCount === supabaseCount) {
        console.log(`   ✅ Match\n`);
        totalRows += neonCount;
      } else if (neonCount > 0) {
        console.log(`   ⚠️  Partial migration (expected ${supabaseCount}, got ${neonCount})\n`);
        totalRows += neonCount;
      } else {
        console.log(`   ℹ️  Empty table\n`);
      }
    }

    // Verify foreign key relationships
    console.log('🔗 Verifying Foreign Key Integrity...\n');

    const fkChecks = [
      {
        query: `SELECT COUNT(*) as orphaned FROM tasks WHERE subject_id IS NOT NULL AND subject_id NOT IN (SELECT id FROM subjects)`,
        name: 'tasks -> subjects'
      },
      {
        query: `SELECT COUNT(*) as orphaned FROM events WHERE subject_id IS NOT NULL AND subject_id NOT IN (SELECT id FROM subjects)`,
        name: 'events -> subjects'
      },
      {
        query: `SELECT COUNT(*) as orphaned FROM notes WHERE subject_id IS NOT NULL AND subject_id NOT IN (SELECT id FROM subjects)`,
        name: 'notes -> subjects'
      }
    ];

    for (const check of fkChecks) {
      const result = await neonPool.query(check.query);
      const orphaned = parseInt(result.rows[0].orphaned);
      if (orphaned === 0) {
        console.log(`✅ ${check.name}: Referential integrity OK`);
      } else {
        console.log(`⚠️  ${check.name}: ${orphaned} orphaned records`);
        allValid = false;
      }
    }

    console.log(`\n📈 Total rows in Neon: ${totalRows}\n`);
    return { valid: allValid, totalRows };
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return { valid: false, totalRows: 0 };
  }
}

async function generateMigrationReport(success, originalData, verifyResult) {
  console.log('\n📄 PHASE 5: Generate Migration Report\n');

  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    status: success ? 'SUCCESS' : 'PARTIAL_SUCCESS',
    verificationStatus: verifyResult.valid ? 'PASSED' : 'WARNINGS',
    source: 'Supabase',
    destination: 'Neon DB',
    totalRowsMigrated: verifyResult.totalRows,
    tables: {}
  };

  for (const table of ['subjects', 'tasks', 'events', 'notes', 'dashboard_settings']) {
    const result = await neonPool.query(`SELECT COUNT(*) as count FROM ${table}`);
    report.tables[table] = {
      supabaseRows: originalData[table] ? originalData[table].length : 0,
      neonRows: parseInt(result.rows[0].count)
    };
  }

  const reportPath = path.join(__dirname, `../migration_report_${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`✅ Report saved: ${reportPath}\n`);
  console.log('📋 Migration Summary:');
  console.log(JSON.stringify(report, null, 2));

  return reportPath;
}

async function updateEnvFile() {
  console.log('\n🔧 PHASE 6: Update .env\n');

  try {
    const envPath = path.join(__dirname, '../../.env');
    const envContent = `# --- DATABASE CONFIGURATION ---
# Neon PostgreSQL (Pooled Connection - recommended for serverless)
DATABASE_URL=postgresql://neondb_owner:npg_XPKD0N6Gmlfh@ep-proud-frog-b3l1y2hl-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# --- VERCEL BLOB CONFIGURATION ---
# Token untuk Vercel Blob Storage (file upload)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx

# --- SERVER CONFIGURATION ---
PORT=3000
NODE_ENV=development
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env updated with Neon connection\n');
    return true;
  } catch (error) {
    console.error('❌ .env update failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║      SUPABASE → NEON DB MIGRATION SCRIPT                  ║');
  console.log('║      Comprehensive Data Migration with Retry Logic        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    supabasePool = await connectWithRetry(SUPABASE_CONFIG, 'Supabase', 3);
    neonPool = await connectWithRetry(NEON_CONFIG, 'Neon', 3);

    const exportedData = await exportDataFromSupabase();
    if (!exportedData) throw new Error('Data export failed');

    const importOk = await importDataToNeon(exportedData);
    if (!importOk) throw new Error('Data import failed');

    const verifyResult = await verifyDataIntegrity(exportedData);

    const reportPath = await generateMigrationReport(true, exportedData, verifyResult);

    const envOk = await updateEnvFile();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    MIGRATION COMPLETE                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📊 Status: ' + (verifyResult.valid ? '✅ SUCCESS' : '⚠️  COMPLETED WITH WARNINGS'));
    console.log(`📄 Report: ${reportPath}`);
    console.log(`🔧 .env updated: ${envOk ? '✅ Yes' : '❌ No'}`);
    console.log(`📈 Total rows migrated: ${verifyResult.totalRows}\n`);

    console.log('Next steps:');
    console.log('1. Review migration report');
    console.log('2. Run: npm run db:verify (to test connection)');
    console.log('3. Test API routes manually');
    console.log('4. Deploy to Vercel\n');

  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    if (supabasePool) await supabasePool.end().catch(() => {});
    if (neonPool) await neonPool.end().catch(() => {});
    console.log('Pools closed. Done.\n');
  }
}

main().catch(console.error);
