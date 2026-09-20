const pool = require('../db/pool');

async function fixStoragePolicy() {
  const client = await pool.connect();
  try {
    console.log('--- Fixing Supabase Storage Policies ---');
    // Memaksa akses anon key untuk bucket "uploads"
    // (Dalam Supabase, konfigurasi object storage disimpan di schema storage)
    
    await client.query(`
      -- Drop existing policies if any
      DROP POLICY IF EXISTS "Public Access to Uploads" ON storage.objects;
      DROP POLICY IF EXISTS "Public Upload to Uploads" ON storage.objects;
      DROP POLICY IF EXISTS "Public Delete from Uploads" ON storage.objects;
      DROP POLICY IF EXISTS "Public Update to Uploads" ON storage.objects;

      -- Create Read policy
      CREATE POLICY "Public Access to Uploads"
      ON storage.objects FOR SELECT
      USING ( bucket_id = 'uploads' );

      -- Create Insert policy (Upload)
      CREATE POLICY "Public Upload to Uploads"
      ON storage.objects FOR INSERT
      WITH CHECK ( bucket_id = 'uploads' );

      -- Create Delete policy (Remove)
      CREATE POLICY "Public Delete from Uploads"
      ON storage.objects FOR DELETE
      USING ( bucket_id = 'uploads' );
      
      -- Create Update policy
      CREATE POLICY "Public Update to Uploads"
      ON storage.objects FOR UPDATE
      USING ( bucket_id = 'uploads' );
    `);

    console.log('✅ Storage policies for "uploads" bucket updated successfully.');
  } catch (error) {
    console.error('❌ Failed to update storage policies:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixStoragePolicy();