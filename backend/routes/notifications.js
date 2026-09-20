const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET /api/notifications
router.get('/', async (_req, res, next) => {
  try {
    // Cari tugas yang deadlinenya <= 48 jam (2 hari) dan belum selesai
    const tasksQuery = `
      SELECT id, title, deadline as target_date, 'task' as type,
             EXTRACT(EPOCH FROM (deadline - NOW()))/3600 as hours_left
      FROM tasks
      WHERE status NOT IN ('completed', 'cancelled')
        AND deadline <= NOW() + INTERVAL '48 hours'
        AND deadline > NOW()
    `;

    // Cari acara yang event_date <= 48 jam dari sekarang
    const eventsQuery = `
      SELECT id, title, event_date as target_date, 'event' as type,
             EXTRACT(EPOCH FROM (event_date - NOW()))/3600 as hours_left
      FROM events
      WHERE event_date <= NOW() + INTERVAL '48 hours'
        AND event_date > NOW()
    `;

    const [tasksRes, eventsRes] = await Promise.all([
      pool.query(tasksQuery),
      pool.query(eventsQuery)
    ]);

    // Format & Gabung hasil
    let notifications = [];

    tasksRes.rows.forEach(t => {
      notifications.push({
        id: `t_${t.id}`,
        original_id: t.id,
        title: t.title,
        type: t.type,
        target_date: t.target_date,
        hours_left: parseFloat(t.hours_left)
      });
    });

    eventsRes.rows.forEach(e => {
      notifications.push({
        id: `e_${e.id}`,
        original_id: e.id,
        title: e.title,
        type: e.type,
        target_date: e.target_date,
        hours_left: parseFloat(e.hours_left)
      });
    });

    // Urutkan berdasarkan waktu terdekat (hours_left terkecil)
    notifications.sort((a, b) => a.hours_left - b.hours_left);

    // Filter status "Mendesak (<= 24 jam)" atau "Segera (<= 48 jam)"
    notifications = notifications.map(n => ({
      ...n,
      urgency_level: n.hours_left <= 24 ? 1 : 2, // 1: < 1 Hari, 2: < 2 Hari
      urgency_text: n.hours_left <= 24 ? '< 1 Hari' : '< 2 Hari'
    }));

    res.json({ count: notifications.length, data: notifications });
  } catch (error) {
    next(error);
  }
});

module.exports = router;