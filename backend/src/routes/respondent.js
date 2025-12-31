/**
 * Respondent routes - form filling and submission
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const pool = require('../db/connection');
const { logAudit } = require('../utils/audit');
const { hashToken, generateStoredFilename } = require('../utils/helpers');
const { validateAnswers } = require('../utils/logicEngine');

// Configure file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/files');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, generateStoredFilename(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/zip',
      'application/x-rar-compressed'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Nepodporovaný typ souboru'));
    }
  }
});

/**
 * Middleware to verify respondent token and load context
 */
const verifyRespondentToken = async (req, res, next) => {
  const { token } = req.params;
  
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  
  const tokenHash = hashToken(token);
  
  try {
    const [respondents] = await pool.query(
      `SELECT r.*, q.id as questionnaire_id, q.code as questionnaire_code, q.title as questionnaire_title,
              q.status as questionnaire_status, q.definition, q.settings,
              qv.id as version_id, qv.definition as version_definition, qv.template_css, qv.template_layout,
              s.id as submission_id, s.status as submission_status, s.data as submission_data
       FROM respondents r
       JOIN questionnaires q ON r.questionnaire_id = q.id
       LEFT JOIN questionnaire_versions qv ON q.id = qv.questionnaire_id
       LEFT JOIN submissions s ON r.id = s.respondent_id
       WHERE r.token_hash = ?
       ORDER BY qv.version_number DESC
       LIMIT 1`,
      [tokenHash]
    );
    
    if (respondents.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired link' });
    }
    
    const respondent = respondents[0];
    
    // Determine validity status based on valid_from and valid_until
    const now = new Date();
    let validityStatus = 'valid';
    
    if (respondent.valid_from && new Date(respondent.valid_from) > now) {
      validityStatus = 'not_yet_valid';
    } else if (respondent.valid_until && new Date(respondent.valid_until) < now) {
      validityStatus = 'expired';
    }
    
    respondent.validityStatus = validityStatus;
    respondent.canEdit = validityStatus === 'valid' && respondent.status !== 'locked';
    
    req.respondent = respondent;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
};

/**
 * Log access with browser information
 */
const logAccess = async (respondentId, req) => {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const acceptLanguage = req.headers['accept-language'] || '';
    const referer = req.headers['referer'] || '';
    
    // Browser info will be sent from frontend
    const browserInfo = req.body?.browserInfo || {};
    
    await pool.query(
      `INSERT INTO access_log (respondent_id, ip_address, user_agent, accept_language, referer, 
        screen_width, screen_height, timezone, platform, is_mobile)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        respondentId,
        req.ip,
        userAgent.substring(0, 1000),
        acceptLanguage.substring(0, 255),
        referer.substring(0, 1000),
        browserInfo.screenWidth || null,
        browserInfo.screenHeight || null,
        browserInfo.timezone || null,
        browserInfo.platform || null,
        browserInfo.isMobile || false
      ]
    );
  } catch (error) {
    console.error('Log access error:', error);
    // Non-fatal, continue
  }
};

/**
 * GET /api/r/:token/form
 * Get form definition for respondent
 */
router.get('/:token/form', verifyRespondentToken, async (req, res) => {
  const respondent = req.respondent;
  
  // Use published version definition if available, otherwise current draft
  const definition = respondent.version_definition || respondent.definition;
  
  res.json({
    questionnaire: {
      id: respondent.questionnaire_id,
      code: respondent.questionnaire_code,
      title: respondent.questionnaire_title
    },
    respondent: {
      id: respondent.id,
      name: respondent.name,
      validFrom: respondent.valid_from,
      validUntil: respondent.valid_until,
      validityStatus: respondent.validityStatus,
      canEdit: respondent.canEdit,
      status: respondent.status
    },
    definition,
    settings: respondent.settings,
    template: {
      css: respondent.template_css,
      layout: respondent.template_layout
    },
    submission: respondent.submission_id ? {
      id: respondent.submission_id,
      status: respondent.submission_status,
      data: respondent.submission_data
    } : null
  });
});

/**
 * POST /api/r/:token/log-access
 * Log form access with browser info and set first_accessed_at
 */
router.post('/:token/log-access', verifyRespondentToken, async (req, res) => {
  // Set first_accessed_at if not already set
  if (!req.respondent.first_accessed_at) {
    await pool.query(
      'UPDATE respondents SET first_accessed_at = NOW() WHERE id = ? AND first_accessed_at IS NULL',
      [req.respondent.id]
    );
  }
  await logAccess(req.respondent.id, req);
  res.json({ success: true });
});

/**
 * GET /api/r/:token/submission
 * Get current submission data
 */
router.get('/:token/submission', verifyRespondentToken, async (req, res) => {
  const respondent = req.respondent;
  
  if (!respondent.submission_id) {
    return res.json({ data: {}, files: [] });
  }
  
  // Get files
  const [files] = await pool.query(
    'SELECT id, question_id, original_name, mime_type, size_bytes, created_at FROM file_uploads WHERE submission_id = ?',
    [respondent.submission_id]
  );
  
  res.json({
    id: respondent.submission_id,
    status: respondent.submission_status,
    data: respondent.submission_data || {},
    files
  });
});

/**
 * PUT /api/r/:token/submission
 * Save/autosave submission data
 */
router.put('/:token/submission', verifyRespondentToken, async (req, res) => {
  const respondent = req.respondent;
  const { data } = req.body;
  
  // Check validity period
  if (!respondent.canEdit) {
    return res.status(400).json({ error: 'Editing is not allowed at this time' });
  }
  
  // Check if already submitted and not allowing resubmit
  if (respondent.submission_status === 'submitted') {
    const settings = respondent.settings || {};
    if (!settings.allowResubmit) {
      return res.status(400).json({ error: 'Submission already completed' });
    }
  }
  
  // Check if respondent is locked
  if (respondent.status === 'locked') {
    return res.status(400).json({ error: 'Submission is locked' });
  }
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    let submissionId = respondent.submission_id;
    
    if (submissionId) {
      // Update existing submission
      await connection.query(
        'UPDATE submissions SET data = ?, updated_at = NOW() WHERE id = ?',
        [JSON.stringify(data), submissionId]
      );
    } else {
      // Create new submission
      const [result] = await connection.query(
        `INSERT INTO submissions (respondent_id, questionnaire_version_id, status, data)
         VALUES (?, ?, 'draft', ?)`,
        [respondent.id, respondent.version_id, JSON.stringify(data)]
      );
      submissionId = result.insertId;
      
      // Update respondent status
      await connection.query(
        'UPDATE respondents SET status = ? WHERE id = ?',
        ['in_progress', respondent.id]
      );
    }
    
    // Also save to data_eav table
    await saveToDataEav(connection, respondent.id, data, respondent.version_definition || respondent.definition);
    
    await connection.commit();
    
    res.json({ 
      submissionId, 
      status: respondent.submission_status || 'draft',
      saved: true 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Save submission error:', error);
    res.status(500).json({ error: 'Failed to save submission' });
  } finally {
    connection.release();
  }
});

/**
 * Save answers to data_eav table using variable names
 */
async function saveToDataEav(connection, respondentId, data, definition) {
  if (!definition || !definition.blocks) return;
  
  // Build question map (id -> variable)
  const questionMap = {};
  for (const block of definition.blocks) {
    if (block.questions) {
      for (const question of block.questions) {
        questionMap[question.id] = question;
      }
    }
  }
  
  // Process each answer
  for (const [questionId, answer] of Object.entries(data)) {
    const question = questionMap[questionId];
    if (!question) continue;
    
    const variable = question.variable || questionId;
    let value;
    
    if (question.type === 'checkbox' && Array.isArray(answer)) {
      // For checkbox, store values separated by semicolon
      const values = answer.map(a => {
        const opt = question.options?.find(o => o.label === a || o.id === a);
        return opt?.value || a;
      });
      value = values.join(';');
    } else if (question.type === 'radio') {
      // For radio, get the option value
      const opt = question.options?.find(o => o.label === answer || o.id === answer);
      value = opt?.value || answer;
    } else if (question.type === 'file') {
      // For file, value will be handled separately (filename stored later)
      continue;
    } else {
      value = String(answer ?? '');
    }
    
    // Upsert into data_eav
    await connection.query(
      `INSERT INTO data_eav (respondent_id, variable, value) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE value = ?, updated_at = NOW()`,
      [respondentId, variable, value, value]
    );
  }
}

/**
 * POST /api/r/:token/submit
 * Submit the form
 */
router.post('/:token/submit', verifyRespondentToken, async (req, res) => {
  const respondent = req.respondent;
  const { data } = req.body;
  
  // Check validity period
  if (!respondent.canEdit) {
    return res.status(400).json({ error: 'Submission is not allowed at this time' });
  }
  
  // Check if already submitted
  if (respondent.submission_status === 'submitted') {
    const settings = respondent.settings || {};
    if (!settings.allowResubmit) {
      return res.status(400).json({ error: 'Already submitted' });
    }
  }
  
  // Check if locked
  if (respondent.status === 'locked') {
    return res.status(400).json({ error: 'Submission is locked' });
  }
  
  // Validate answers
  const definition = respondent.version_definition || respondent.definition;
  const validation = validateAnswers(definition, data);
  
  if (!validation.valid) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      validationErrors: validation.errors 
    });
  }
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    let submissionId = respondent.submission_id;
    
    if (submissionId) {
      // Update and submit
      await connection.query(
        `UPDATE submissions SET data = ?, status = 'submitted', submitted_at = NOW() WHERE id = ?`,
        [JSON.stringify(data), submissionId]
      );
    } else {
      // Create and submit
      const [result] = await connection.query(
        `INSERT INTO submissions (respondent_id, questionnaire_version_id, status, data, submitted_at)
         VALUES (?, ?, 'submitted', ?, NOW())`,
        [respondent.id, respondent.version_id, JSON.stringify(data)]
      );
      submissionId = result.insertId;
    }
    
    // Update respondent status
    await connection.query(
      'UPDATE respondents SET status = ? WHERE id = ?',
      ['submitted', respondent.id]
    );
    
    // Save to data_eav
    await saveToDataEav(connection, respondent.id, data, definition);
    
    await connection.commit();
    
    await logAudit('submission', submissionId, 'submitted', 'respondent', respondent.id, null, req.ip);
    
    res.json({ success: true, status: 'submitted' });
  } catch (error) {
    await connection.rollback();
    console.error('Submit error:', error);
    res.status(500).json({ error: 'Failed to submit' });
  } finally {
    connection.release();
  }
});

/**
 * POST /api/r/:token/upload
 * Upload a file
 */
router.post('/:token/upload', verifyRespondentToken, upload.single('file'), async (req, res) => {
  const respondent = req.respondent;
  const { questionId } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }
  
  if (!questionId) {
    return res.status(400).json({ error: 'Question ID is required' });
  }
  
  // Check validity
  if (!respondent.canEdit) {
    fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: 'Uploading is not allowed at this time' });
  }
  
  // Check if locked
  if (respondent.status === 'locked' || respondent.submission_status === 'submitted') {
    // Remove uploaded file
    fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: 'Cannot upload files to completed submission' });
  }
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    let submissionId = respondent.submission_id;
    
    // Create submission if not exists
    if (!submissionId) {
      const [result] = await connection.query(
        `INSERT INTO submissions (respondent_id, questionnaire_version_id, status, data)
         VALUES (?, ?, 'draft', '{}')`,
        [respondent.id, respondent.version_id]
      );
      submissionId = result.insertId;
      
      await connection.query(
        'UPDATE respondents SET status = ? WHERE id = ?',
        ['in_progress', respondent.id]
      );
    }
    
    // Save file metadata
    const [fileResult] = await connection.query(
      `INSERT INTO file_uploads (submission_id, question_id, original_name, stored_name, mime_type, size_bytes, storage_path)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        submissionId,
        questionId,
        req.file.originalname,
        req.file.filename,
        req.file.mimetype,
        req.file.size,
        req.file.path
      ]
    );
    
    // Save filename to data_eav
    const definition = respondent.version_definition || respondent.definition;
    let variable = questionId;
    
    if (definition && definition.blocks) {
      for (const block of definition.blocks) {
        const question = block.questions?.find(q => q.id === questionId);
        if (question) {
          variable = question.variable || questionId;
          break;
        }
      }
    }
    
    // Get all files for this question to build comma-separated list
    const [files] = await connection.query(
      'SELECT original_name FROM file_uploads WHERE submission_id = ? AND question_id = ?',
      [submissionId, questionId]
    );
    const fileNames = files.map(f => f.original_name).join(';');
    
    await connection.query(
      `INSERT INTO data_eav (respondent_id, variable, value) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE value = ?, updated_at = NOW()`,
      [respondent.id, variable, fileNames, fileNames]
    );
    
    await connection.commit();
    
    await logAudit('file', fileResult.insertId, 'uploaded', 'respondent', respondent.id, 
      { filename: req.file.originalname, questionId }, req.ip);
    
    res.json({
      id: fileResult.insertId,
      questionId,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    });
  } catch (error) {
    await connection.rollback();
    // Cleanup uploaded file on error
    fs.unlink(req.file.path, () => {});
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  } finally {
    connection.release();
  }
});

/**
 * GET /api/r/:token/file/:fileId
 * Download a file
 */
router.get('/:token/file/:fileId', verifyRespondentToken, async (req, res) => {
  const { fileId } = req.params;
  const respondent = req.respondent;
  
  try {
    const [files] = await pool.query(
      `SELECT f.* FROM file_uploads f
       JOIN submissions s ON f.submission_id = s.id
       WHERE f.id = ? AND s.respondent_id = ?`,
      [fileId, respondent.id]
    );
    
    if (files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const file = files[0];
    
    if (!fs.existsSync(file.storage_path)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }
    
    res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.original_name)}"`);
    
    fs.createReadStream(file.storage_path).pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

/**
 * DELETE /api/r/:token/file/:fileId
 * Delete a file
 */
router.delete('/:token/file/:fileId', verifyRespondentToken, async (req, res) => {
  const { fileId } = req.params;
  const respondent = req.respondent;
  
  // Check if locked
  if (respondent.status === 'locked' || respondent.submission_status === 'submitted') {
    return res.status(400).json({ error: 'Cannot delete files from completed submission' });
  }
  
  try {
    const [files] = await pool.query(
      `SELECT f.* FROM file_uploads f
       JOIN submissions s ON f.submission_id = s.id
       WHERE f.id = ? AND s.respondent_id = ?`,
      [fileId, respondent.id]
    );
    
    if (files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const file = files[0];
    
    // Delete from database
    await pool.query('DELETE FROM file_uploads WHERE id = ?', [fileId]);
    
    // Delete from disk
    if (fs.existsSync(file.storage_path)) {
      fs.unlink(file.storage_path, () => {});
    }
    
    await logAudit('file', fileId, 'deleted', 'respondent', respondent.id, null, req.ip);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;
