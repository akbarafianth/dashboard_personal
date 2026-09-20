const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../config/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const dbUrl = process.env.DATABASE_URL || '';
const isCloudDB = dbUrl.includes('supabase.com') || dbUrl.includes('render.com') || dbUrl.includes('neon.tech');

const pool = new Pool({
  connectionString: dbUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Auto-enable SSL for cloud databases (like Supabase) even in local development
  ssl: (process.env.NODE_ENV === 'production' || isCloudDB) ? { rejectUnauthorized: false } : false
});


module.exports = pool;
