const pool = require('../db/pool');

async function verifyNeonConnection() {
  const client = await pool.connect();
  let testSubjectId = null;
  let testTaskId = null;

  try {
    console.log('\n=== Neon DB Verification ===\n');

    console.log('1. Testing basic connection...');
    await client.query('SELECT 1');
    console.log('   ✓ Connection successful\n');

    console.log('2. Checking tables exist...');
    const tablesResult = await client.query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' 
       ORDER BY table_name`
    );
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log(`   ✓ Found tables: ${tables.join(', ')}\n`);

    console.log('3. Testing INSERT on subjects table...');
    await client.query('BEGIN');
    
    const insertResult = await client.query(
      `INSERT INTO subjects (name, code, lecturer, credits) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      ['TEST_SUBJECT', 'TEST101', 'Test Lecturer', 3]
    );
    testSubjectId = insertResult.rows[0].id;
    console.log(`   ✓ Inserted test subject (id: ${testSubjectId})\n`);

    console.log('4. Testing INSERT on tasks table with foreign key...');
    const taskResult = await client.query(
      `INSERT INTO tasks (title, deadline, subject_id, status) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      ['TEST_TASK', new Date().toISOString(), testSubjectId, 'pending']
    );
    testTaskId = taskResult.rows[0].id;
    console.log(`   ✓ Inserted test task (id: ${testTaskId})\n`);

    console.log('5. Testing JOIN query...');
    const joinResult = await client.query(
      `SELECT t.id, t.title, s.name as subject_name 
       FROM tasks t 
       LEFT JOIN subjects s ON t.subject_id = s.id 
       WHERE t.id = $1`,
      [testTaskId]
    );
    if (joinResult.rows.length > 0) {
      const row = joinResult.rows[0];
      console.log(`   ✓ JOIN successful: Task "${row.title}" belongs to "${row.subject_name}"\n`);
    }

    console.log('6. Testing SELECT with filters...');
    const selectResult = await client.query(
      `SELECT COUNT(*) as count FROM subjects WHERE code = $1`,
      ['TEST101']
    );
    console.log(`   ✓ SELECT query successful: ${selectResult.rows[0].count} test subject(s) found\n`);

    console.log('7. Rolling back test data...');
    await client.query('ROLLBACK');
    console.log('   ✓ All test data rolled back\n');

    console.log('=== All Verifications Passed ===\n');
    console.log('Neon DB is ready for production use.');
    console.log('\nNext steps:');
    console.log('1. Update DATABASE_URL in .env with your Neon connection string');
    console.log('2. Run: npm run db:setup');
    console.log('3. Run: npm run db:seed (optional, for test data)');
    console.log('4. Update Vercel environment variables with:');
    console.log('   - DATABASE_URL (Neon pooled connection string)');
    console.log('   - BLOB_READ_WRITE_TOKEN (Vercel Blob token)\n');

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('- Ensure DATABASE_URL is set correctly in .env');
    console.error('- Check that Neon database is running and accessible');
    console.error('- Verify network/firewall allows connection to Neon');
    console.error('- Ensure pooled connection string is used (suffix: -pooler.region.neon.tech)\n');
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end().catch(() => {});
  }
}

verifyNeonConnection().catch(console.error);
