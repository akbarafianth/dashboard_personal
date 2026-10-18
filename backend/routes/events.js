const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { buildInsert, buildUpdate } = require('./_helpers');

const config = {
  table: 'events',
  columns: ['title', 'event_date', 'description', 'category', 'subject_id', 'start_time', 'end_time', 'location', 'is_all_day', 'priority'],
  required: ['title', 'event_date']
};

function validatePayload(payload, config) {
  for (const field of config.required) {
    if (payload[field] === undefined || payload[field] === null || String(payload[field]).trim() === '') {
      return `Field ${field} wajib diisi`;
    }
  }
  
  if (payload.priority !== undefined) {
    if (!['low', 'medium', 'high'].includes(payload.priority)) {
      return 'Prioritas harus berupa low, medium, atau high';
    }
  }

  if (payload.is_all_day !== undefined) {
    if (typeof payload.is_all_day !== 'boolean') {
      // Coerce to boolean if it's a string 'true'/'false'
      if (payload.is_all_day === 'true') payload.is_all_day = true;
      else if (payload.is_all_day === 'false') payload.is_all_day = false;
      else return 'is_all_day harus berupa nilai boolean';
    }
  }

  if (payload.subject_id !== undefined && payload.subject_id !== null) {
    if (isNaN(parseInt(payload.subject_id, 10))) {
      return 'subject_id harus berupa angka';
    }
    payload.subject_id = parseInt(payload.subject_id, 10);
  }

  return null;
}



// GET /api/events
router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 200;
    const result = await pool.query(`SELECT e.*, s.name AS subject_name, s.color_theme FROM ${config.table} e LEFT JOIN subjects s ON e.subject_id = s.id ORDER BY e.event_date ASC LIMIT $1`, [limit]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT e.*, s.name AS subject_name, s.color_theme FROM ${config.table} e LEFT JOIN subjects s ON e.subject_id = s.id WHERE e.id = $1`, [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/events
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

// PATCH /api/events/:id
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

// DELETE /api/events/:id
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
