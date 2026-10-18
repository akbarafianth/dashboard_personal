const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET /api/analytics
router.get('/', async (_req, res, next) => {
  try {
    const activeTasksRes = await pool.query(`SELECT COUNT(*) FROM tasks WHERE status NOT IN ('completed', 'cancelled')`);
    const completedTasksRes = await pool.query(`SELECT COUNT(*) FROM tasks WHERE status = 'completed'`);
    const urgentTasksRes = await pool.query(`SELECT COUNT(*) FROM tasks WHERE status NOT IN ('completed', 'cancelled') AND deadline <= NOW() + INTERVAL '48 hours'`);
    
    res.json({
      active_tasks: parseInt(activeTasksRes.rows[0].count),
      completed_tasks: parseInt(completedTasksRes.rows[0].count),
      urgent_tasks: parseInt(urgentTasksRes.rows[0].count)
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
