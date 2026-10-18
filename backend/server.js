const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const pool = require('./db/pool');
const { requireAuth } = require('./middleware/auth');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = Number(process.env.PORT || 3000);

// Pool Error Handler
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Hindari process.exit(-1) pada lingkungan serverless
  if (!process.env.VERCEL) {
    process.exit(-1);
  }
});

// Rate Limiter Setup
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // REDUCED: from 1000 to 150 requests per 15 min (~10 req/sec per IP)
  message: { error: 'Terlalu banyak request, coba lagi nanti.' }
});

// Middleware
app.use(morgan('tiny'));
app.use(limiter);
app.use(cors()); // Allow all origins untuk mempermudah Vercel Serverless
app.use(express.json());

// Health Check
app.get('/api/health', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

// Auth Routes (Public - no auth required)
app.use('/api/auth', require('./routes/auth'));

// Protected Routes (Require authentication)
app.use('/api/subjects', requireAuth, require('./routes/subjects'));
app.use('/api/tasks', requireAuth, require('./routes/tasks'));
app.use('/api/events', requireAuth, require('./routes/events'));
app.use('/api/notes', requireAuth, require('./routes/notes'));
app.use('/api/search', requireAuth, require('./routes/search'));
app.use('/api/upload', requireAuth, require('./routes/upload'));
app.use('/api/analytics', requireAuth, require('./routes/analytics'));
app.use('/api/notifications', requireAuth, require('./routes/notifications'));
app.use('/api', requireAuth, require('./routes/settings'));

// Error Handler
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ error: error.message || 'Terjadi kesalahan pada server' });
});

// Server Listen (Hanya jalan di lokal, Vercel menggunakan export module)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const server = app.listen(port, () => {
    console.log(`API berjalan di http://localhost:${port}`);
  });

  // Graceful Shutdown
  const shutdown = () => {
    console.log('Shutting down server...');
    server.close(() => {
      pool.end(() => {
        console.log('Database pool closed. Server terminated.');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

module.exports = app;
