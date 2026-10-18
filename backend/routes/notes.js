const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { buildInsert, buildUpdate } = require('./_helpers');
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const purify = DOMPurify(window);

const config = {
  table: 'notes',
  columns: ['title', 'content', 'note_date', 'subject_id', 'attachment_url', 'tags', 'is_pinned', 'user_id'],
  required: ['title', 'content']
};

function validatePayload(payload, config) {
  for (const field of config.required) {
    if (payload[field] === undefined || payload[field] === null || String(payload[field]).trim() === '') {
      return `Field ${field} wajib diisi`;
    }
  }
  return null;
}



// GET /api/notes
router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 200;
    const result = await pool.query(`SELECT n.id, n.title, n.note_date, n.subject_id, n.is_pinned, n.created_at, n.updated_at, n.tags, n.attachment_url, s.name AS subject_name, s.color_theme FROM ${config.table} n LEFT JOIN subjects s ON n.subject_id = s.id WHERE n.user_id = $1 ORDER BY n.created_at DESC LIMIT $2`, [req.user.userId, limit]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/notes/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT n.*, s.name AS subject_name, s.color_theme FROM ${config.table} n LEFT JOIN subjects s ON n.subject_id = s.id WHERE n.id = $1 AND n.user_id = $2`, [req.params.id, req.user.userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/notes
router.post('/', async (req, res, next) => {
  try {
    const validationError = validatePayload(req.body, config);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    
    // SANITIZE HTML content before saving
    if (req.body.content) {
      req.body.content = purify.sanitize(req.body.content);
    }
    
    if (req.body.subject_id !== undefined && req.body.subject_id !== null) {
      const subject = await pool.query('SELECT id FROM subjects WHERE id = $1 AND user_id = $2', [req.body.subject_id, req.user.userId]);
      if (subject.rowCount === 0) {
        return res.status(400).json({ error: 'subject_id tidak valid' });
      }
    }

    // Add user_id to payload
    req.body.user_id = req.user.userId;

    const { fields, values, placeholders } = buildInsert(req.body, config);
    const result = await pool.query(
      `INSERT INTO ${config.table} (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notes/:id
router.patch('/:id', async (req, res, next) => {
  try {
    // Verify ownership first
    delete req.body.user_id;
    const checkOwnership = await pool.query(`SELECT id FROM ${config.table} WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.userId]);
    if (checkOwnership.rowCount === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan atau Anda tidak memiliki akses' });
    }

    // SANITIZE HTML content if provided
    if (req.body.content) {
      req.body.content = purify.sanitize(req.body.content);
    }

    const { values, assignments } = buildUpdate(req.body, config);
    if (assignments.length === 0) {
      return res.status(400).json({ error: 'Tidak ada field untuk diperbarui' });
    }
    values.push(req.params.id, req.user.userId);
    const result = await pool.query(
      `UPDATE ${config.table} SET ${assignments.join(', ')} WHERE id = $${values.length - 1} AND user_id = $${values.length} RETURNING *`,
      values
    );
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/notes/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(`DELETE FROM ${config.table} WHERE id = $1 AND user_id = $2 RETURNING id`, [req.params.id, req.user.userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan' });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// POST /api/notes/:id/export/:format
router.post('/:id/export/:format', async (req, res, next) => {
  try {
    const format = req.params.format; // 'pdf' or 'markdown'
    const noteId = req.params.id;
    const result = await pool.query(`SELECT n.*, s.name as subject_name FROM notes n LEFT JOIN subjects s ON n.subject_id = s.id WHERE n.id = $1 AND n.user_id = $2`, [noteId, req.user.userId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Catatan tidak ditemukan' });
    }
    const note = result.rows[0];
    
    const escapeHtml = (unsafe) => {
      if (!unsafe) return '';
      return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const dateStr = note.note_date ? new Date(note.note_date).toLocaleDateString('id-ID') : 'Tidak ada tanggal';
    
    // MARKDOWN export (always works, lightweight)
    if (format === 'markdown') {
      const markdownContent = `# ${note.title}\n\n**Mata Kuliah:** ${note.subject_name || '-'}\n**Tanggal:** ${dateStr}\n\n${note.content.replace(/<[^>]+>/g, '')}`;
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="Catatan-${noteId}.md"`);
      return res.send(markdownContent);
    } 
    
    // PDF export using pdfmake (lightweight alternative)
    if (format === 'pdf') {
      try {
        const PDFDocument = require('@foliojs-fork/pdfkit');
        const cleanContent = note.content.replace(/<[^>]+>/g, '');
        const pdfDoc = new PDFDocument({ size: 'A4', margin: 48 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Catatan-${noteId}.pdf"`);

        pdfDoc.pipe(res);
        pdfDoc.fontSize(22).font('Helvetica-Bold').text(note.title, { paragraphGap: 8 });
        pdfDoc.fontSize(11).font('Helvetica').fillColor('#666666').text(`Mata Kuliah: ${note.subject_name || '-'}`);
        pdfDoc.text(`Tanggal: ${dateStr}`, { paragraphGap: 16 });
        pdfDoc.fillColor('#000000').fontSize(11).text(cleanContent, { lineGap: 4 });
        pdfDoc.end();
      } catch (pdfErr) {
        console.warn('PDF Generation Error:', pdfErr.message);
        return res.status(503).json({ 
          error: 'PDF export tidak tersedia saat ini. Silakan gunakan export Markdown.',
          suggestion: `/api/notes/${noteId}/export/markdown`
        });
      }
    } else {
      res.status(400).json({ error: 'Format tidak didukung. Gunakan: pdf, markdown' });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
