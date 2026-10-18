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
    
    // SANITIZE HTML content before saving
    if (req.body.content) {
      req.body.content = purify.sanitize(req.body.content);
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
    // SANITIZE HTML content if provided
    if (req.body.content) {
      req.body.content = purify.sanitize(req.body.content);
    }
    
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
        const PdfPrinter = require('pdfmake/src/printer');
        const pdfMakeFonts = require('pdfmake/build/vfs_fonts');
        
        const fonts = {
          Roboto: {
            normal: pdfMakeFonts.pdfMake.vfs['Roboto-Regular.ttf'],
            bold: pdfMakeFonts.pdfMake.vfs['Roboto-Bold.ttf'],
            italics: pdfMakeFonts.pdfMake.vfs['Roboto-Italic.ttf'],
            bolditalics: pdfMakeFonts.pdfMake.vfs['Roboto-BoldItalic.ttf']
          }
        };
        
        const printer = new PdfPrinter(fonts);
        const cleanContent = note.content.replace(/<[^>]+>/g, '');
        
        const docDefinition = {
          content: [
            { text: note.title, style: 'header' },
            { text: `Mata Kuliah: ${note.subject_name || '-'}`, style: 'subheader' },
            { text: `Tanggal: ${dateStr}`, style: 'subheader' },
            { text: '\n' },
            { text: cleanContent, style: 'body' }
          ],
          styles: {
            header: { fontSize: 24, bold: true, margin: [0, 0, 0, 10] },
            subheader: { fontSize: 12, color: '#666', margin: [0, 5, 0, 5] },
            body: { fontSize: 11, lineHeight: 1.5 }
          },
          defaultStyle: { font: 'Roboto' }
        };
        
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Catatan-${noteId}.pdf"`);
        
        pdfDoc.pipe(res);
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
