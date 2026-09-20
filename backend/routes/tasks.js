const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { buildInsert, buildUpdate } = require('./_helpers');

const config = {
  table: 'tasks',
  columns: ['title', 'deadline', 'status', 'subject_id', 'description', 'priority', 'estimated_hours', 'is_recurring', 'reminder_time'],
  required: ['title', 'deadline']
};

function validatePayload(payload, config) {
  for (const field of config.required) {
    if (payload[field] === undefined || payload[field] === null || String(payload[field]).trim() === '') {
      return `Field ${field} wajib diisi`;
    }
  }

  if (payload.status !== undefined) {
    if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(payload.status)) {
      return 'Status harus berupa pending, in_progress, completed, atau cancelled';
    }
  }

  if (payload.priority !== undefined) {
    if (!['low', 'medium', 'high'].includes(payload.priority)) {
      return 'Prioritas harus berupa low, medium, atau high';
    }
  }

  if (payload.estimated_hours !== undefined && payload.estimated_hours !== null) {
    if (isNaN(parseFloat(payload.estimated_hours)) || parseFloat(payload.estimated_hours) < 0) {
      return 'estimated_hours harus berupa angka positif';
    }
    payload.estimated_hours = parseFloat(payload.estimated_hours);
  }

  if (payload.subject_id !== undefined && payload.subject_id !== null) {
    if (isNaN(parseInt(payload.subject_id, 10))) {
      return 'subject_id harus berupa angka';
    }
    payload.subject_id = parseInt(payload.subject_id, 10);
  }

  return null;
}



// GET /api/tasks
router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 200;
    const query = req.query.status === 'active'
      ? `SELECT t.*, s.name AS subject_name, s.color_theme FROM ${config.table} t LEFT JOIN subjects s ON t.subject_id = s.id WHERE t.status NOT IN ('completed', 'cancelled') ORDER BY t.deadline ASC LIMIT $1`
      : `SELECT t.*, s.name AS subject_name, s.color_theme FROM ${config.table} t LEFT JOIN subjects s ON t.subject_id = s.id ORDER BY t.deadline ASC LIMIT $1`;
    const result = await pool.query(query, [limit]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT t.*, s.name AS subject_name, s.color_theme FROM ${config.table} t LEFT JOIN subjects s ON t.subject_id = s.id WHERE t.id = $1`, [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks
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

// PATCH /api/tasks/:id
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

// DELETE /api/tasks/:id
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
