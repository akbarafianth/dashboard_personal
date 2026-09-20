const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET /api/dashboard-settings
router.get('/dashboard-settings', async (_request, response, next) => {
  try {
    const result = await pool.query('SELECT * FROM dashboard_settings WHERE id = 1');
    if (result.rowCount === 0) {
      // Default fallback
      return response.json({
        display_name: 'Mahasiswa',
        semester: 'Semester 1',
        gpa: 0,
        study_phase: 'Tahap Awal',
        active_credits: 0,
        focus_text: '',
        pomodoro_cycles: 0
      });
    }
    response.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT /api/dashboard-settings
router.put('/dashboard-settings', async (request, response, next) => {
  try {
    // Validasi range & tipe
    if (request.body.gpa !== undefined) {
      const gpa = parseFloat(request.body.gpa);
      if (isNaN(gpa) || gpa < 0 || gpa > 4) return response.status(400).json({ error: 'GPA harus angka 0-4' });
      request.body.gpa = gpa;
    }
    if (request.body.active_credits !== undefined) {
      const cr = parseInt(request.body.active_credits, 10);
      if (isNaN(cr) || cr < 0) return response.status(400).json({ error: 'active_credits harus angka positif' });
      request.body.active_credits = cr;
    }
    if (request.body.pomodoro_cycles !== undefined) {
      const pm = parseInt(request.body.pomodoro_cycles, 10);
      if (isNaN(pm) || pm < 0) return response.status(400).json({ error: 'pomodoro_cycles harus angka positif' });
      request.body.pomodoro_cycles = pm;
    }

    const fields = ['display_name', 'semester', 'gpa', 'study_phase', 'active_credits', 'focus_text', 'pomodoro_cycles'];
    const suppliedFields = fields.filter((field) => request.body[field] !== undefined);
    if (suppliedFields.length === 0) {
      return response.status(400).json({ error: 'Tidak ada field untuk diperbarui' });
    }
    const values = suppliedFields.map((field) => request.body[field]);
    const assignments = suppliedFields.map((field, index) => `${field} = $${index + 1}`);
    values.push(1);
    const result = await pool.query(
      `UPDATE dashboard_settings SET ${assignments.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rowCount === 0) {
      // Create if not exists (upsert fallback)
      const insertFields = suppliedFields.join(', ');
      const insertValues = values.slice(0, -1);
      const insertPlaceholders = insertValues.map((_, i) => `$${i + 1}`).join(', ');
      
      const insertRes = await pool.query(
        `INSERT INTO dashboard_settings (id, ${insertFields}) VALUES (1, ${insertPlaceholders}) RETURNING *`,
        insertValues
      );
      return response.json(insertRes.rows[0]);
    }
    
    response.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/pomodoro/increment
router.post('/pomodoro/increment', async (req, res, next) => {
  try {
    const result = await pool.query('UPDATE dashboard_settings SET pomodoro_cycles = pomodoro_cycles + 1, updated_at = NOW() WHERE id = 1 RETURNING pomodoro_cycles');
    res.json({ pomodoro_cycles: result.rows[0].pomodoro_cycles });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
