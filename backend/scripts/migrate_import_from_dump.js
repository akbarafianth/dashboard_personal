const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const NEON_CONN = "postgresql://neondb_owner:npg_XPKD0N6Gmlfh@ep-proud-frog-b3l1y2hl-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function importSQLDump(dumpFilePath) {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       Import SQL Dump to Neon DB                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const neonPool = new Pool({ connectionString: NEON_CONN });

  try {
    console.log('🔗 Connecting to Neon...');
    await neonPool.query('SELECT 1');
    console.log('✅ Neon connected\n');

    if (!fs.existsSync(dumpFilePath)) {
      throw new Error(`SQL dump file not found: ${dumpFilePath}`);
    }

    console.log(`📖 Reading SQL dump: ${dumpFilePath}`);
    const sqlContent = fs.readFileSync(dumpFilePath, 'utf8');
    const fileSize = (fs.statSync(dumpFilePath).size / 1024).toFixed(2);
    console.log(`✅ File loaded (${fileSize} KB)\n`);

    console.log('📍 Parsing SQL statements...');
    const statements = parseSQLStatements(sqlContent);
    console.log(`✅ Found ${statements.length} SQL statements\n`);

    console.log('📥 Importing data to Neon...\n');
    const client = await neonPool.connect();

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();

      if (!statement || statement.startsWith('--')) {
        skippedCount++;
        continue;
      }

      try {
        await client.query(statement);
        successCount++;

        if ((i + 1) % 50 === 0) {
          console.log(`   📊 Processed ${i + 1}/${statements.length} statements...`);
        }
      } catch (error) {
        errorCount++;
        if (errorCount <= 10) {
          console.error(`   ❌ Statement ${i + 1} failed:`, error.message);
          console.error(`      SQL: ${statement.substring(0, 100)}...`);
        }
      }
    }

    client.release();

    console.log('\n✔️  PHASE 2: Data Import Complete\n');
    console.log('📊 Import Statistics:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}\n`);

    // Verify
    console.log('✔️  PHASE 3: Verify Data\n');
    const tables = ['subjects', 'tasks', 'events', 'notes', 'dashboard_settings'];
    let totalRows = 0;

    for (const table of tables) {
      try {
        const result = await neonPool.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = parseInt(result.rows[0].count);
        totalRows += count;
        console.log(`   ${table}: ${count} rows`);
      } catch (error) {
        console.log(`   ${table}: ERROR - ${error.message}`);
      }
    }

    console.log(`\n📈 Total rows: ${totalRows}\n`);

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                   IMPORT COMPLETE                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('✅ Data successfully imported to Neon\n');

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exitCode = 1;
  } finally {
    await neonPool.end();
  }
}

function parseSQLStatements(sqlContent) {
  const statements = [];
  let currentStatement = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < sqlContent.length; i++) {
    const char = sqlContent[i];
    const nextChar = sqlContent[i + 1];

    // Handle string literals
    if ((char === '"' || char === "'") && (i === 0 || sqlContent[i - 1] !== '\\')) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }

    currentStatement += char;

    // End of statement
    if (char === ';' && !inString) {
      statements.push(currentStatement);
      currentStatement = '';
    }
  }

  if (currentStatement.trim()) {
    statements.push(currentStatement);
  }

  return statements.filter(s => s.trim() && !s.trim().startsWith('--'));
}

async function main() {
  const dumpFile = process.argv[2];

  if (!dumpFile) {
    console.log('Usage: node migrate_import_from_dump.js <path-to-sql-dump>\n');
    console.log('Example:');
    console.log('  node migrate_import_from_dump.js ./supabase_backup.sql\n');
    process.exit(1);
  }

  await importSQLDump(dumpFile);
}

main().catch(console.error);
