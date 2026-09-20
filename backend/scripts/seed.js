const pool = require('../db/pool');

async function seedDatabase() {
  const client = await pool.connect();
  try {
    console.log('Starting Database Seeding...');
    await client.query('BEGIN');

    // Seed DashboardSettings
    await client.query(`
      INSERT INTO dashboard_settings (id, display_name, semester, gpa, study_phase, active_credits, focus_text, pomodoro_cycles)
      VALUES (1, 'Akbar Ariffianto', 'Semester Ganjil 2026/2027', 3.85, 'Semester 3', 21, 'Fokus persiapan UTS', 12)
      ON CONFLICT (id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        gpa = EXCLUDED.gpa,
        focus_text = EXCLUDED.focus_text;
    `);

    // Seed Subjects
    const subjectsRes = await client.query(`
      INSERT INTO subjects (name, code, lecturer, credits, schedule_day, schedule_time, color_theme)
      VALUES 
        ('Kecerdasan Buatan', 'CS301', 'Dr. AI', 3, 'Senin', '08:00 - 10:30', 'indigo'),
        ('Interaksi Manusia-Komputer', 'CS302', 'Prof. UI', 3, 'Selasa', '13:00 - 15:30', 'emerald')
      RETURNING id, name;
    `);

    const aiSubjectId = subjectsRes.rows[0].id;
    const hciSubjectId = subjectsRes.rows[1].id;

    // Seed Tasks
    await client.query(`
      INSERT INTO tasks (title, deadline, status, subject_id, description, priority, estimated_hours)
      VALUES 
        ('Tugas Neural Network', NOW() + INTERVAL '3 days', 'pending', $1, 'Buat model dari scratch', 'high', 4),
        ('Review Paper UI/UX', NOW() + INTERVAL '5 days', 'in_progress', $2, 'Baca paper Nielsen', 'medium', 2)
    `, [aiSubjectId, hciSubjectId]);

    // Seed Events
    await client.query(`
      INSERT INTO events (title, event_date, category, subject_id, start_time, end_time, location, priority)
      VALUES 
        ('Kuis AI Bab 1-3', NOW() + INTERVAL '1 day', 'exam', $1, '08:00', '10:00', 'Ruang 401', 'high'),
        ('Kerja Kelompok IMK', NOW() + INTERVAL '2 days', 'meeting', $2, '15:00', '17:00', 'Perpustakaan', 'medium')
    `, [aiSubjectId, hciSubjectId]);

    // Seed Notes
    await client.query(`
      INSERT INTO notes (title, content, subject_id, tags)
      VALUES 
        ('Pengantar Machine Learning', '<p>Supervised vs Unsupervised learning...</p>', $1, 'ml,intro'),
        ('Heuristics Evaluation', '<p>10 Usability Heuristics by Jakob Nielsen...</p>', $2, 'nielsen,ui')
    `, [aiSubjectId, hciSubjectId]);

    await client.query('COMMIT');
    console.log('Database seeding completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database seeding failed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end().catch(() => {});
  }
}

seedDatabase().catch(console.error);