const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbUrl = process.env.DATABASE_URL || 'postgres://placeholder:placeholder@localhost:5432/placeholder';
const isCloudDB = dbUrl.includes('supabase.com') || dbUrl.includes('render.com') || dbUrl.includes('neon.tech');

if (!process.env.DATABASE_URL) {
  console.warn('⚠️ DATABASE_URL belum diset di environment variables. Menggunakan placeholder (koneksi akan gagal jika query dijalankan).');
}

if (!global.__dbPool) {
  global.__dbPool = new Pool({
    connectionString: dbUrl,
    max: process.env.VERCEL ? 1 : 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    // Auto-enable SSL for cloud databases (like Supabase) even in local development
    ssl: (process.env.NODE_ENV === 'production' || isCloudDB) ? { rejectUnauthorized: false } : false
  });
}

module.exports = global.__dbPool;
