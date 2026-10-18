const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET /api/analytics
router.get('/', async (req, res, next) => {
  try {
    const activeTasksRes = await pool.query(`SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND status NOT IN ('completed', 'cancelled')`, [req.user.userId]);
    const completedTasksRes = await pool.query(`SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND status = 'completed'`, [req.user.userId]);
    const urgentTasksRes = await pool.query(`SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND status NOT IN ('completed', 'cancelled') AND deadline <= NOW() + INTERVAL '48 hours'`, [req.user.userId]);
    
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
