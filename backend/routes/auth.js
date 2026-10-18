const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { generateToken } = require('../middleware/auth');

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, dan nama wajib diisi' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    );

    const user = result.rows[0];
    await pool.query('UPDATE subjects SET user_id = $1 WHERE user_id IS NULL', [user.id]);
    await pool.query('UPDATE tasks SET user_id = $1 WHERE user_id IS NULL', [user.id]);
    await pool.query('UPDATE events SET user_id = $1 WHERE user_id IS NULL', [user.id]);
    await pool.query('UPDATE notes SET user_id = $1 WHERE user_id IS NULL', [user.id]);
    await pool.query('UPDATE dashboard_settings SET user_id = $1 WHERE user_id IS NULL', [user.id]);

    const token = generateToken(user.id);
    res.status(201).json({ user, token });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email sudah terdaftar' });
    }
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    await pool.query('UPDATE subjects SET user_id = $1 WHERE user_id IS NULL', [user.id]);
    await pool.query('UPDATE tasks SET user_id = $1 WHERE user_id IS NULL', [user.id]);
    await pool.query('UPDATE events SET user_id = $1 WHERE user_id IS NULL', [user.id]);
    await pool.query('UPDATE notes SET user_id = $1 WHERE user_id IS NULL', [user.id]);
    await pool.query('UPDATE dashboard_settings SET user_id = $1 WHERE user_id IS NULL', [user.id]);

    const token = generateToken(user.id);
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
