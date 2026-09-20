const pool = require('../db/pool');

async function auditDatabase() {
  const client = await pool.connect();
  try {
    console.log('--- Memulai Audit Database ---');
    
    // 1. Insert Subject (sebagai relasi)
    console.log('1. Menguji INSERT data (Subject)...');
    const insertSubject = await client.query(`
      INSERT INTO subjects (name, code, lecturer, credits)
      VALUES ('Audit Test Subject', 'AUD101', 'Test Bot', 3)
      RETURNING id, name;
    `);
    const subjectId = insertSubject.rows[0].id;
    console.log(`   Berhasil insert Subject dengan ID: ${subjectId}`);

    // 2. Insert Task (dengan relasi ke subject)
    console.log('2. Menguji INSERT data (Task dengan relasi)...');
    const insertTask = await client.query(`
      INSERT INTO tasks (title, deadline, subject_id, priority)
      VALUES ('Audit Task', NOW() + INTERVAL '1 day', $1, 'high')
      RETURNING id, title;
    `, [subjectId]);
    const taskId = insertTask.rows[0].id;
    console.log(`   Berhasil insert Task dengan ID: ${taskId}`);

    // 3. Select Data
    console.log('3. Menguji SELECT (Fetch) data...');
    const fetchTask = await client.query(`
      SELECT t.title, s.name as subject_name
      FROM tasks t
      JOIN subjects s ON t.subject_id = s.id
      WHERE t.id = $1
    `, [taskId]);
    console.log(`   Data fetched: Task "${fetchTask.rows[0].title}" berelasi dengan "${fetchTask.rows[0].subject_name}"`);

    // 4. Delete Data (CASCADE check)
    console.log('4. Menguji DELETE dan CASCADE (Membersihkan data temporer)...');
    await client.query(`DELETE FROM subjects WHERE id = $1`, [subjectId]);
    
    // Verifikasi task ikut terhapus
    const checkTask = await client.query(`SELECT id FROM tasks WHERE id = $1`, [taskId]);
    if (checkTask.rowCount === 0) {
      console.log('   Data temporer berhasil dihapus dengan sempurna (Cascade berjalan).');
    } else {
      throw new Error('Data task tidak terhapus setelah subject dihapus!');
    }

    console.log('--- Audit Database BERHASIL & NORMAL ---');
  } catch (error) {
    console.error('--- Audit Database GAGAL ---', error);
  } finally {
    client.release();
    await pool.end();
  }
}

auditDatabase();