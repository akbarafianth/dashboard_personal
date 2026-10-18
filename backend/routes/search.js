const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET /api/search
router.get('/', async (req, res, next) => {
  try {
    const q = req.query.q || '';
    if (!q) return res.json({ tasks: [], notes: [], subjects: [] });
    
    // Escape karakter wildcard SQL
    const escapedQ = q.replace(/[%_]/g, '\\$&');
    const searchStr = `%${escapedQ}%`;

    const [tasksRes, notesRes, subjectsRes] = await Promise.all([
       pool.query(`SELECT id, title, status as meta, 'task' as type FROM tasks WHERE user_id = $2 AND (title ILIKE $1 OR description ILIKE $1) LIMIT 5`, [searchStr, req.user.userId]),
       pool.query(`SELECT id, title, note_date::text as meta, 'note' as type FROM notes WHERE user_id = $2 AND (title ILIKE $1 OR content ILIKE $1) LIMIT 5`, [searchStr, req.user.userId]),
       pool.query(`SELECT id, name as title, code as meta, 'subject' as type FROM subjects WHERE user_id = $2 AND (name ILIKE $1 OR code ILIKE $1) LIMIT 5`, [searchStr, req.user.userId])
    ]);
    
    res.json({
      tasks: tasksRes.rows,
      notes: notesRes.rows,
      subjects: subjectsRes.rows
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
