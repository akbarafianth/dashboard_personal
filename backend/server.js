const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const pool = require('./db/pool');

dotenv.config({ path: path.resolve(__dirname, '../config/.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

// Pool Error Handler
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Rate Limiter Setup
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: { error: 'Terlalu banyak request, coba lagi nanti.' }
});

// Middleware
app.use(morgan('tiny'));
app.use(limiter);
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
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

// Routes
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/events', require('./routes/events'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/search', require('./routes/search'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api', require('./routes/settings'));

// Error Handler
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ error: error.message || 'Terjadi kesalahan pada server' });
});

// Server Listen
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
