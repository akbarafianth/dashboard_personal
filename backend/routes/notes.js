const express = require('express');
const router = express.Router();
const htmlPdf = require('html-pdf-node');
const pool = require('../db/pool');
const { buildInsert, buildUpdate } = require('./_helpers');

const config = {
  table: 'notes',
  columns: ['title', 'content', 'note_date', 'subject_id', 'attachment_url', 'tags', 'is_pinned'],
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
    const result = await pool.query(`SELECT n.id, n.title, n.note_date, n.subject_id, n.is_pinned, n.created_at, n.updated_at, n.tags, n.attachment_url, s.name AS subject_name, s.color_theme FROM ${config.table} n LEFT JOIN subjects s ON n.subject_id = s.id ORDER BY n.created_at DESC LIMIT $1`, [limit]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/notes/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT n.*, s.name AS subject_name, s.color_theme FROM ${config.table} n LEFT JOIN subjects s ON n.subject_id = s.id WHERE n.id = $1`, [req.params.id]);
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
    const { values, assignments } = buildUpdate(req.body, config);
    if (assignments.length === 0) {
      return res.status(400).json({ error: 'Tidak ada field untuk diperbarui' });
    }
    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE ${config.table} SET ${assignments.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/notes/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(`DELETE FROM ${config.table} WHERE id = $1 RETURNING id`, [req.params.id]);
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
    const result = await pool.query(`SELECT n.*, s.name as subject_name FROM notes n LEFT JOIN subjects s ON n.subject_id = s.id WHERE n.id = $1`, [noteId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Catatan tidak ditemukan' });
    }
    const note = result.rows[0];
    
    // Helper escape untuk keamanan
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
    const escapedTitle = escapeHtml(note.title);
    
    if (format === 'markdown') {
      const markdownContent = `# ${note.title}\n\n**Mata Kuliah:** ${note.subject_name || '-'}\n**Tanggal:** ${dateStr}\n\n${note.content.replace(/<[^>]+>/g, '')}`;
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="Catatan-${noteId}.md"`);
      return res.send(markdownContent);
    } 
    
    if (format === 'pdf') {
      // note.content adalah HTML dari Quill, jadi kita tidak bisa sepenuhnya escapeHtml.
      // Namun, jika ada library DOMPurify di environment node, lebih baik menggunakannya.
      // Jika tidak, setidaknya escapedTitle mencegah injection via Title.
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="utf-8">
          <title>${escapedTitle}</title>
          <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 40px; }
            h1 { color: #111; }
            .meta { color: #666; font-size: 0.9em; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          </style>
        </head>
        <body>
          <h1>${escapedTitle}</h1>
          <div class="meta">
            Mata Kuliah: ${escapeHtml(note.subject_name || '-')}<br>
            Tanggal: ${dateStr}
          </div>
          <div class="content">
            ${note.content}
          </div>
        </body>
        </html>
      `;
      const file = { content: htmlContent };
      const options = { format: 'A4', margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' } };
      
      try {
        const pdfBuffer = await htmlPdf.generatePdf(file, options);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Catatan-${noteId}.pdf"`);
        return res.send(pdfBuffer);
      } catch (err) {
        console.error('PDF Generation Error:', err);
        return res.status(500).json({ error: 'Gagal men-generate PDF' });
      }
    } else {
      res.status(400).json({ error: 'Format tidak didukung' });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
