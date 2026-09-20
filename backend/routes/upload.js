const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const supabase = require('../db/supabase');

const BUCKET_NAME = 'uploads';

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/markdown'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipe file tidak diizinkan. Hanya menerima gambar, PDF, dokumen office, dan teks.'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

const uploadMiddleware = (req, res, next) => {
  const uploadSingle = upload.single('file');
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Ukuran file melebihi batas maksimal 5MB.' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

router.post('/', uploadMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diunggah' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileName = `${crypto.randomUUID()}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase Storage Error:', uploadError);
      return res.status(500).json({ error: 'Gagal mengunggah file ke storage.' });
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    res.json({ url: publicUrlData.publicUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Gagal mengunggah file' });
  }
});

module.exports = router;
