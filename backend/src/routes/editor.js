/**
 * Editor routes - questionnaire management
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const pool = require('../db/connection');
const { authenticateToken } = require('../middleware/auth');
const { logAudit, getAuditLog } = require('../utils/audit');
const { 
  generateToken, 
  hashToken, 
  generateQuestionnaireCode,
  getDefaultDefinition,
  validateDefinition 
} = require('../utils/helpers');
const { generateCSV, generateXLSX, generateBundle, flattenQuestions } = require('../utils/export');

const SALT_ROUNDS = 10;

/**
 * Legacy middleware to verify editor session (for backward compatibility)
 * Now primarily uses JWT auth
 */
const verifyEditorSession = async (req, res, next) => {
  // Try JWT auth first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateToken(req, res, next);
  }
  
  // Fallback to old session-based auth (for transition period)
  const sessionId = req.headers['x-editor-session'];
  
  if (!sessionId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const [sessions] = await pool.query(
      `SELECT es.*, q.id as questionnaire_id, q.code 
       FROM editor_sessions es 
       JOIN questionnaires q ON es.questionnaire_id = q.id 
       WHERE es.session_id = ? AND es.expires_at > NOW()`,
      [sessionId]
    );
    
    if (sessions.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    
    req.editorSession = sessions[0];
    req.userId = null; // Mark as legacy session
    next();
  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({ error: 'Session verification failed' });
  }
};

/**
 * Helper to check if user has access (JWT users have full access)
 */
const hasAccess = (req, questionnaireId) => {
  // JWT authenticated users have access to all questionnaires
  if (req.userId) return true;
  // Legacy session users only have access to their questionnaire
  return req.editorSession && req.editorSession.questionnaire_id === parseInt(questionnaireId);
};

/**
 * POST /api/e/:code/login
 * Login to edit a questionnaire
 */
router.post('/:code/login', async (req, res) => {
  const { code } = req.params;
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  
  try {
    const [questionnaires] = await pool.query(
      'SELECT id, code, edit_password_hash FROM questionnaires WHERE code = ?',
      [code]
    );
    
    if (questionnaires.length === 0) {
      return res.status(404).json({ error: 'Questionnaire not found' });
    }
    
    const questionnaire = questionnaires[0];
    const passwordMatch = await bcrypt.compare(password, questionnaire.edit_password_hash);
    
    if (!passwordMatch) {
      await logAudit('questionnaire', questionnaire.id, 'login_failed', 'editor', null, null, req.ip);
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Create session
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_DURATION);
    
    await pool.query(
      'INSERT INTO editor_sessions (session_id, questionnaire_id, expires_at) VALUES (?, ?, ?)',
      [sessionId, questionnaire.id, expiresAt]
    );
    
    await logAudit('questionnaire', questionnaire.id, 'login_success', 'editor', null, null, req.ip);
    
    res.json({
      sessionId,
      questionnaireId: questionnaire.id,
      code: questionnaire.code,
      expiresAt
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/e/logout
 * Logout from editor session
 */
router.post('/logout', verifyEditorSession, async (req, res) => {
  try {
    await pool.query('DELETE FROM editor_sessions WHERE session_id = ?', [req.editorSession.session_id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * GET /api/e/questionnaire/:id
 * Get questionnaire details
 */
router.get('/questionnaire/:id', verifyEditorSession, async (req, res) => {
  const { id } = req.params;
  
  // Verify access to this questionnaire
  if (!hasAccess(req, id)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  try {
    const [questionnaires] = await pool.query(
      `SELECT q.*, t.name as template_name, t.css as template_css, t.layout_config as template_layout
       FROM questionnaires q
       LEFT JOIN templates t ON q.template_id = t.id
       WHERE q.id = ?`,
      [id]
    );
    
    if (questionnaires.length === 0) {
      return res.status(404).json({ error: 'Questionnaire not found' });
    }
    
    const questionnaire = questionnaires[0];
    
    // Get versions count
    const [versions] = await pool.query(
      'SELECT COUNT(*) as count FROM questionnaire_versions WHERE questionnaire_id = ?',
      [id]
    );
    
    // Get respondents count
    const [respondents] = await pool.query(
      `SELECT status, COUNT(*) as count FROM respondents WHERE questionnaire_id = ? GROUP BY status`,
      [id]
    );
    
    res.json({
      id: questionnaire.id,
      code: questionnaire.code,
      title: questionnaire.title,
      description: questionnaire.description,
      status: questionnaire.status,
      definition: questionnaire.definition,
      settings: questionnaire.settings,
      template: questionnaire.template_id ? {
        id: questionnaire.template_id,
        name: questionnaire.template_name,
        css: questionnaire.template_css,
        layout: questionnaire.template_layout
      } : null,
      versionsCount: versions[0].count,
      respondentStats: respondents.reduce((acc, r) => {
        acc[r.status] = r.count;
        return acc;
      }, {}),
      createdAt: questionnaire.created_at,
      updatedAt: questionnaire.updated_at
    });
  } catch (error) {
    console.error('Get questionnaire error:', error);
    res.status(500).json({ error: 'Failed to get questionnaire' });
  }
});

/**
 * PUT /api/e/questionnaire/:id
 * Update questionnaire metadata
 */
router.put('/questionnaire/:id', verifyEditorSession, async (req, res) => {
  const { id } = req.params;
  const { title, description, settings } = req.body;
  
  if (!hasAccess(req, id)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  try {
    await pool.query(
      `UPDATE questionnaires SET title = ?, description = ?, settings = ? WHERE id = ?`,
      [title, description, settings ? JSON.stringify(settings) : null, id]
    );
    
    await logAudit('questionnaire', id, 'metadata_updated', 'editor', null, { title }, req.ip);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update questionnaire error:', error);
    res.status(500).json({ error: 'Failed to update questionnaire' });
  }
});

/**
 * PUT /api/e/questionnaire/:id/definition
 * Update questionnaire definition (form structure)
 */
router.put('/questionnaire/:id/definition', verifyEditorSession, async (req, res) => {
  const { id } = req.params;
  const { definition } = req.body;
  
  if (!hasAccess(req, id)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Validate definition
  const validation = validateDefinition(definition);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }
  
  try {
    // Check if questionnaire is not archived
    const [questionnaires] = await pool.query('SELECT status FROM questionnaires WHERE id = ?', [id]);
    if (questionnaires.length === 0) {
      return res.status(404).json({ error: 'Questionnaire not found' });
    }
    if (questionnaires[0].status === 'archived') {
      return res.status(400).json({ error: 'Cannot edit archived questionnaire' });
    }
    
    await pool.query('UPDATE questionnaires SET definition = ? WHERE id = ?', [JSON.stringify(definition), id]);
    
    await logAudit('questionnaire', id, 'definition_updated', 'editor', null, null, req.ip);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update definition error:', error);
    res.status(500).json({ error: 'Failed to update definition' });
  }
});

/**
 * POST /api/e/questionnaire/:id/publish
 * Publish questionnaire (create immutable version)
 */
router.post('/questionnaire/:id/publish', verifyEditorSession, async (req, res) => {
  const { id } = req.params;
  
  if (!hasAccess(req, id)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get questionnaire with template
    const [questionnaires] = await connection.query(
      `SELECT q.*, t.css as template_css, t.layout_config as template_layout
       FROM questionnaires q
       LEFT JOIN templates t ON q.template_id = t.id
       WHERE q.id = ?`,
      [id]
    );
    
    if (questionnaires.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Questionnaire not found' });
    }
    
    const questionnaire = questionnaires[0];
    
    if (!questionnaire.definition) {
      await connection.rollback();
      return res.status(400).json({ error: 'Questionnaire has no definition' });
    }
    
    // Get next version number
    const [versions] = await connection.query(
      'SELECT MAX(version_number) as max_version FROM questionnaire_versions WHERE questionnaire_id = ?',
      [id]
    );
    const nextVersion = (versions[0].max_version || 0) + 1;
    
    // Create version snapshot
    await connection.query(
      `INSERT INTO questionnaire_versions (questionnaire_id, version_number, definition, template_css, template_layout)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id, 
        nextVersion, 
        JSON.stringify(questionnaire.definition),
        questionnaire.template_css,
        questionnaire.template_layout ? JSON.stringify(questionnaire.template_layout) : null
      ]
    );
    
    // Update questionnaire status
    await connection.query(
      'UPDATE questionnaires SET status = ? WHERE id = ?',
      ['published', id]
    );
    
    await connection.commit();
    
    await logAudit('questionnaire', id, 'published', 'editor', null, { version: nextVersion }, req.ip);
    
    res.json({ success: true, version: nextVersion });
  } catch (error) {
    await connection.rollback();
    console.error('Publish error:', error);
    res.status(500).json({ error: 'Failed to publish questionnaire' });
  } finally {
    connection.release();
  }
});

/**
 * POST /api/e/questionnaire/:id/clone
 * Clone questionnaire
 */
router.post('/questionnaire/:id/clone', verifyEditorSession, async (req, res) => {
  const { id } = req.params;
  const { newTitle, newPassword } = req.body;
  
  if (!hasAccess(req, id)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }
  
  try {
    const [questionnaires] = await pool.query('SELECT * FROM questionnaires WHERE id = ?', [id]);
    
    if (questionnaires.length === 0) {
      return res.status(404).json({ error: 'Questionnaire not found' });
    }
    
    const original = questionnaires[0];
    const newCode = generateQuestionnaireCode();
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    const [result] = await pool.query(
      `INSERT INTO questionnaires (code, title, description, edit_password_hash, status, template_id, definition, settings)
       VALUES (?, ?, ?, ?, 'draft', ?, ?, ?)`,
      [
        newCode,
        newTitle || `${original.title} (kopie)`,
        original.description,
        passwordHash,
        original.template_id,
        JSON.stringify(original.definition),
        JSON.stringify(original.settings)
      ]
    );
    
    await logAudit('questionnaire', result.insertId, 'cloned', 'editor', null, { originalId: id }, req.ip);
    
    res.json({
      id: result.insertId,
      code: newCode,
      title: newTitle || `${original.title} (kopie)`
    });
  } catch (error) {
    console.error('Clone error:', error);
    res.status(500).json({ error: 'Failed to clone questionnaire' });
  }
});

/**
 * GET /api/e/questionnaire/:id/respondents
 * Get all respondents for questionnaire (includes tokens for authorized users)
 */
router.get('/questionnaire/:id/respondents', verifyEditorSession, async (req, res) => {
  const { id } = req.params;
  
  if (!hasAccess(req, id)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  try {
    const [respondents] = await pool.query(
      `SELECT r.id, r.name, r.ico, r.email, r.internal_note, r.token, r.valid_from, r.valid_until, r.first_accessed_at, r.status, r.created_at,
              s.status as submission_status, s.submitted_at
       FROM respondents r
       LEFT JOIN submissions s ON r.id = s.respondent_id
       WHERE r.questionnaire_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );
    
    res.json(respondents);
  } catch (error) {
    console.error('Get respondents error:', error);
    res.status(500).json({ error: 'Failed to get respondents' });
  }
});

/**
 * POST /api/e/questionnaire/:id/respondents
 * Add a new respondent
 */
router.post('/questionnaire/:id/respondents', verifyEditorSession, async (req, res) => {
  const { id } = req.params;
  const { name, ico, email, internalNote, validFrom, validUntil } = req.body;
  
  if (!hasAccess(req, id)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  try {
    const token = generateToken();
    const tokenHash = hashToken(token);
    
    const [result] = await pool.query(
      `INSERT INTO respondents (questionnaire_id, name, ico, email, internal_note, token, token_hash, valid_from, valid_until)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, ico, email, internalNote, token, tokenHash, validFrom || null, validUntil || null]
    );
    
    await logAudit('respondent', result.insertId, 'created', 'editor', null, { name }, req.ip);
    
    res.json({
      id: result.insertId,
      name,
      token,
      status: 'invited'
    });
  } catch (error) {
    console.error('Add respondent error:', error);
    res.status(500).json({ error: 'Failed to add respondent' });
  }
});

/**
 * PUT /api/e/respondent/:id
 * Update a respondent
 */
router.put('/respondent/:respondentId', verifyEditorSession, async (req, res) => {
  const { respondentId } = req.params;
  const { name, ico, email, internalNote, validFrom, validUntil } = req.body;
  
  try {
    // Verify respondent belongs to this questionnaire
    const [respondents] = await pool.query(
      'SELECT questionnaire_id FROM respondents WHERE id = ?',
      [respondentId]
    );
    
    if (respondents.length === 0) {
      return res.status(404).json({ error: 'Respondent not found' });
    }
    
    if (!hasAccess(req, respondents[0].questionnaire_id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await pool.query(
      `UPDATE respondents SET name = ?, ico = ?, email = ?, internal_note = ?, valid_from = ?, valid_until = ? WHERE id = ?`,
      [name, ico || null, email || null, internalNote || null, validFrom || null, validUntil || null, respondentId]
    );
    
    await logAudit('respondent', respondentId, 'updated', 'editor', null, { name }, req.ip);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update respondent error:', error);
    res.status(500).json({ error: 'Failed to update respondent' });
  }
});

/**
 * PUT /api/e/questionnaire/:id/respondents/bulk-update
 * Bulk update respondents validity times
 */
router.put('/questionnaire/:id/respondents/bulk-update', verifyEditorSession, async (req, res) => {
  const { id } = req.params;
  const { respondentIds, validFrom, validUntil } = req.body;
  
  if (!hasAccess(req, id)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  if (!Array.isArray(respondentIds) || respondentIds.length === 0) {
    return res.status(400).json({ error: 'Respondent IDs are required' });
  }
  
  try {
    await pool.query(
      `UPDATE respondents SET valid_from = ?, valid_until = ? WHERE id IN (?) AND questionnaire_id = ?`,
      [validFrom || null, validUntil || null, respondentIds, id]
    );
    
    await logAudit('questionnaire', id, 'respondents_bulk_updated', 'editor', null, { count: respondentIds.length }, req.ip);
    
    res.json({ success: true, updated: respondentIds.length });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'Failed to bulk update respondents' });
  }
});

/**
 * POST /api/e/questionnaire/:id/respondents/import
 * Import respondents from CSV data
 */
router.post('/questionnaire/:id/respondents/import', verifyEditorSession, async (req, res) => {
  const { id } = req.params;
  const { respondents } = req.body;
  
  if (!hasAccess(req, id)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  if (!Array.isArray(respondents) || respondents.length === 0) {
    return res.status(400).json({ error: 'Respondents array is required' });
  }
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const imported = [];
    
    for (const r of respondents) {
      if (!r.name) continue;
      
      const token = generateToken();
      const tokenHash = hashToken(token);
      
      const [result] = await connection.query(
        `INSERT INTO respondents (questionnaire_id, name, ico, email, internal_note, token, token_hash, valid_from, valid_until)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, r.name, r.ico || null, r.email || null, r.internalNote || null, token, tokenHash, r.validFrom || null, r.validUntil || null]
      );
      
      imported.push({
        id: result.insertId,
        name: r.name,
        token
      });
    }
    
    await connection.commit();
    
    await logAudit('questionnaire', id, 'respondents_imported', 'editor', null, { count: imported.length }, req.ip);
    
    res.json({ imported });
  } catch (error) {
    await connection.rollback();
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import respondents' });
  } finally {
    connection.release();
  }
});

/**
 * DELETE /api/e/respondent/:id
 * Delete a respondent
 */
router.delete('/respondent/:respondentId', verifyEditorSession, async (req, res) => {
  const { respondentId } = req.params;
  
  try {
    // Verify respondent belongs to this questionnaire
    const [respondents] = await pool.query(
      'SELECT questionnaire_id FROM respondents WHERE id = ?',
      [respondentId]
    );
    
    if (respondents.length === 0) {
      return res.status(404).json({ error: 'Respondent not found' });
    }
    
    if (!hasAccess(req, respondents[0].questionnaire_id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await pool.query('DELETE FROM respondents WHERE id = ?', [respondentId]);
    
    await logAudit('respondent', respondentId, 'deleted', 'editor', null, null, req.ip);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete respondent error:', error);
    res.status(500).json({ error: 'Failed to delete respondent' });
  }
});

/**
 * POST /api/e/respondent/:id/token/rotate
 * Rotate respondent token
 */
router.post('/respondent/:respondentId/token/rotate', verifyEditorSession, async (req, res) => {
  const { respondentId } = req.params;
  
  try {
    // Verify respondent belongs to this questionnaire
    const [respondents] = await pool.query(
      'SELECT questionnaire_id FROM respondents WHERE id = ?',
      [respondentId]
    );
    
    if (respondents.length === 0) {
      return res.status(404).json({ error: 'Respondent not found' });
    }
    
    if (!hasAccess(req, respondents[0].questionnaire_id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const newToken = generateToken();
    const newTokenHash = hashToken(newToken);
    
    await pool.query('UPDATE respondents SET token = ?, token_hash = ? WHERE id = ?', [newToken, newTokenHash, respondentId]);
    
    await logAudit('respondent', respondentId, 'token_rotated', 'editor', null, null, req.ip);
    
    res.json({ token: newToken });
  } catch (error) {
    console.error('Rotate token error:', error);
    res.status(500).json({ error: 'Failed to rotate token' });
  }
});

/**
 * GET /api/e/questionnaire/:id/dashboard
 * Get dashboard statistics
 */
router.get('/questionnaire/:id/dashboard', verifyEditorSession, async (req, res) => {
  const { id } = req.params;
  
  if (!hasAccess(req, id)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  try {
    // Get respondent stats
    const [respondentStats] = await pool.query(
      `SELECT status, COUNT(*) as count FROM respondents WHERE questionnaire_id = ? GROUP BY status`,
      [id]
    );
    
    // Get submission stats
    const [submissionStats] = await pool.query(
      `SELECT s.status, COUNT(*) as count 
       FROM submissions s
       JOIN respondents r ON s.respondent_id = r.id
       WHERE r.questionnaire_id = ?
       GROUP BY s.status`,
      [id]
    );
    
    // Get recent activity
    const [recentActivity] = await pool.query(
      `SELECT * FROM audit_log 
       WHERE entity_type = 'questionnaire' AND entity_id = ?
       ORDER BY created_at DESC LIMIT 10`,
      [id]
    );
    
    // Get versions
    const [versions] = await pool.query(
      `SELECT id, version_number, published_at FROM questionnaire_versions 
       WHERE questionnaire_id = ? ORDER BY version_number DESC`,
      [id]
    );
    
    res.json({
      respondents: respondentStats.reduce((acc, r) => {
        acc[r.status] = r.count;
        acc.total = (acc.total || 0) + r.count;
        return acc;
      }, {}),
      submissions: submissionStats.reduce((acc, s) => {
        acc[s.status] = s.count;
        return acc;
      }, {}),
      recentActivity,
      versions
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

/**
 * POST /api/e/questionnaire/:id/export
 * Export questionnaire data
 */
router.post('/questionnaire/:id/export', verifyEditorSession, async (req, res) => {
  const { id } = req.params;
  const { format = 'xlsx' } = req.body;
  
  if (!hasAccess(req, id)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  try {
    // Get questionnaire definition
    const [questionnaires] = await pool.query(
      `SELECT q.*, t.css as template_css, t.layout_config as template_layout
       FROM questionnaires q
       LEFT JOIN templates t ON q.template_id = t.id
       WHERE q.id = ?`,
      [id]
    );
    
    if (questionnaires.length === 0) {
      return res.status(404).json({ error: 'Questionnaire not found' });
    }
    
    const questionnaire = questionnaires[0];
    const definition = questionnaire.definition || { blocks: [] };
    const questions = flattenQuestions(definition);
    
    // Get all submissions with answers
    const [respondents] = await pool.query(
      `SELECT r.*, s.id as submission_id, s.status as submission_status, s.data, s.submitted_at
       FROM respondents r
       LEFT JOIN submissions s ON r.id = s.respondent_id
       WHERE r.questionnaire_id = ?`,
      [id]
    );
    
    // Get files
    const [files] = await pool.query(
      `SELECT f.*, r.name as respondent_name
       FROM file_uploads f
       JOIN submissions s ON f.submission_id = s.id
       JOIN respondents r ON s.respondent_id = r.id
       WHERE r.questionnaire_id = ?`,
      [id]
    );
    
    // Build submissions data
    const submissions = respondents.map(r => ({
      respondentId: r.id,
      respondentName: r.name,
      ico: r.ico,
      status: r.submission_status || 'not_started',
      submittedAt: r.submitted_at,
      answers: r.data || {},
      files: files.filter(f => f.submission_id === r.submission_id)
    }));
    
    await logAudit('questionnaire', id, 'exported', 'editor', null, { format }, req.ip);
    
    if (format === 'csv') {
      const csv = generateCSV(submissions, questions);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${questionnaire.code}-export.csv"`);
      return res.send(csv);
    }
    
    if (format === 'xlsx') {
      const workbook = await generateXLSX(submissions, questions, definition);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${questionnaire.code}-export.xlsx"`);
      return workbook.xlsx.write(res);
    }
    
    if (format === 'bundle') {
      const bundlePath = path.join(__dirname, '../../uploads', `${questionnaire.code}-bundle-${Date.now()}.zip`);
      await generateBundle(submissions, questions, definition, 
        { css: questionnaire.template_css }, files, bundlePath);
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${questionnaire.code}-bundle.zip"`);
      
      const stream = fs.createReadStream(bundlePath);
      stream.pipe(res);
      stream.on('end', () => {
        fs.unlink(bundlePath, () => {}); // Cleanup
      });
      return;
    }
    
    res.status(400).json({ error: 'Invalid export format' });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

/**
 * GET /api/e/questionnaire/:id/submissions/:respondentId
 * Get submission details for a respondent
 */
router.get('/questionnaire/:id/submissions/:respondentId', verifyEditorSession, async (req, res) => {
  const { id, respondentId } = req.params;
  
  if (!hasAccess(req, id)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  try {
    const [respondents] = await pool.query(
      `SELECT r.*, s.id as submission_id, s.status as submission_status, s.data, s.submitted_at, s.created_at as submission_created
       FROM respondents r
       LEFT JOIN submissions s ON r.id = s.respondent_id
       WHERE r.id = ? AND r.questionnaire_id = ?`,
      [respondentId, id]
    );
    
    if (respondents.length === 0) {
      return res.status(404).json({ error: 'Respondent not found' });
    }
    
    const respondent = respondents[0];
    
    // Get files if submission exists
    let files = [];
    if (respondent.submission_id) {
      const [fileRows] = await pool.query(
        'SELECT id, question_id, original_name, mime_type, size_bytes, created_at FROM file_uploads WHERE submission_id = ?',
        [respondent.submission_id]
      );
      files = fileRows;
    }
    
    res.json({
      respondent: {
        id: respondent.id,
        name: respondent.name,
        ico: respondent.ico,
        email: respondent.email,
        internalNote: respondent.internal_note,
        validFrom: respondent.valid_from,
        validUntil: respondent.valid_until,
        status: respondent.status
      },
      submission: respondent.submission_id ? {
        id: respondent.submission_id,
        status: respondent.submission_status,
        data: respondent.data,
        submittedAt: respondent.submitted_at,
        createdAt: respondent.submission_created,
        files
      } : null
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ error: 'Failed to get submission' });
  }
});

module.exports = router;
