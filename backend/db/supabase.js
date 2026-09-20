const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../config/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('SUPABASE_URL atau SUPABASE_ANON_KEY belum diset di .env — Supabase Storage tidak akan berfungsi.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;
