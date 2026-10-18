const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { buildInsert, buildUpdate } = require('./_helpers');

const config = {
  table: 'subjects',
  columns: ['name', 'code', 'lecturer', 'credits', 'key_takeaways', 'schedule_day', 'schedule_time', 'room_or_link', 'attachment_url', 'grade', 'color_theme'],
  required: ['name']
};

function validatePayload(payload, config) {
  for (const field of config.required) {
    if (payload[field] === undefined || payload[field] === null || String(payload[field]).trim() === '') {
      return `Field ${field} wajib diisi`;
    }
  }

  if (payload.credits !== undefined && payload.credits !== null) {
    if (isNaN(parseInt(payload.credits, 10)) || parseInt(payload.credits, 10) < 0) {
      return 'credits harus berupa angka positif';
    }
    payload.credits = parseInt(payload.credits, 10);
  }

  if (payload.grade !== undefined && payload.grade !== null && payload.grade !== '') {
    const validGrades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'E'];
    if (!validGrades.includes(payload.grade.toUpperCase())) {
      return `grade tidak valid. Nilai yang diizinkan: ${validGrades.join(', ')}`;
    }
    payload.grade = payload.grade.toUpperCase();
  }

  return null;
}



// GET /api/subjects
router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 200;
    const result = await pool.query(`SELECT * FROM ${config.table} ORDER BY created_at DESC LIMIT $1`, [limit]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/subjects/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT * FROM ${config.table} WHERE id = $1`, [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/subjects
router.post('/', async (req, res, next) => {
  try {
    const validationError = validatePayload(req.body, config);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    const { fields, values, placeholders } = buildInsert(req.body, config);
    const result = await pool.query(
      `INSERT INTO ${config.table} (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/subjects/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const { values, assignments } = buildUpdate(req.body, config);
    if (assignments.length === 0) {
      return res.status(400).json({ error: 'Tidak ada field untuk diperbarui' });
    }
    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE ${config.table} SET ${assignments.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/subjects/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(`DELETE FROM ${config.table} WHERE id = $1 RETURNING id`, [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan' });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
