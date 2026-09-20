const supabase = require('../db/supabase');
const fs = require('fs');
const path = require('path');

const BUCKET_NAME = 'uploads';

async function auditStorage() {
  console.log('--- Memulai Audit Supabase Storage ---');
  try {
    // 1. Siapkan file dummy buffer
    console.log('1. Menyiapkan file temporer...');
    const fileContent = 'Ini adalah file tes untuk mengaudit Supabase Storage.';
    const buffer = Buffer.from(fileContent, 'utf-8');
    const fileName = `audit_test_${Date.now()}.txt`;

    // 2. Test Upload
    console.log(`2. Mengupload file ${fileName} ke bucket "${BUCKET_NAME}"...`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, { contentType: 'text/plain' });

    if (uploadError) {
      throw new Error(`Upload gagal: ${uploadError.message}`);
    }
    console.log('   Upload berhasil.');

    // 3. Test getPublicUrl
    console.log('3. Mendapatkan Public URL...');
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);
    
    if (!urlData || !urlData.publicUrl) {
      throw new Error('Gagal mendapatkan Public URL');
    }
    console.log(`   Public URL: ${urlData.publicUrl}`);

    // 4. Test hapus file (bersih-bersih)
    console.log(`4. Menghapus file ${fileName} dari storage...`);
    const { error: removeError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (removeError) {
      throw new Error(`Gagal menghapus file: ${removeError.message}`);
    }
    console.log('   Penghapusan file temporer berhasil.');
    
    console.log('--- Audit Storage BERHASIL & NORMAL ---');
  } catch (error) {
    console.error('--- Audit Storage GAGAL ---', error.message);
  }
}

auditStorage();