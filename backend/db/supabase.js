const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../config/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn('SUPABASE_URL atau SUPABASE_ANON_KEY belum diset di .env — Menggunakan placeholder untuk menghindari crash.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;
