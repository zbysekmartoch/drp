/**
 * Questionnaire management routes (create, list, templates)
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const pool = require('../db/connection');
const { optionalAuth } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');
const { generateQuestionnaireCode, getDefaultDefinition } = require('../utils/helpers');
const { generateCSV, generateXLSX, generateBundle, flattenQuestions } = require('../utils/export');

const SALT_ROUNDS = 10;

/**
 * GET /api/questionnaires
 * Get all questionnaires with stats
 */
router.get('/', async (req, res) => {
  try {
    const [questionnaires] = await pool.query(`
      SELECT 
        q.id, q.code, q.title, q.description, q.created_at, q.updated_at,
        (SELECT COUNT(*) FROM respondents WHERE questionnaire_id = q.id) as respondent_count,
        (SELECT COUNT(*) FROM respondents WHERE questionnaire_id = q.id AND first_accessed_at IS NOT NULL) as accessed_count,
        (SELECT COUNT(*) FROM respondents WHERE questionnaire_id = q.id AND status = 'submitted') as submitted_count,
        (SELECT MAX(version_number) FROM questionnaire_versions WHERE questionnaire_id = q.id) as latest_version
      FROM questionnaires q
      ORDER BY q.updated_at DESC
    `);
    
    res.json(questionnaires);
  } catch (error) {
    console.error('Get questionnaires error:', error);
    res.status(500).json({ error: 'Failed to get questionnaires' });
  }
});

/**
 * GET /api/questionnaires/code/:code
 * Get questionnaire by code (public)
 */
router.get('/code/:code', async (req, res) => {
  const { code } = req.params;
  
  try {
    const [questionnaires] = await pool.query(
      `SELECT q.*, t.name as template_name, t.css as template_css, t.layout_config as template_layout
       FROM questionnaires q
       LEFT JOIN templates t ON q.template_id = t.id
       WHERE q.code = ?`,
      [code]
    );
    
    if (questionnaires.length === 0) {
      return res.status(404).json({ error: 'Questionnaire not found' });
    }
    
    const questionnaire = questionnaires[0];
    
    // Get versions
    const [versions] = await pool.query(
      'SELECT id, version_number, published_at FROM questionnaire_versions WHERE questionnaire_id = ? ORDER BY version_number DESC',
      [questionnaire.id]
    );
    
    // Get respondent stats
    const [respondentStats] = await pool.query(
      `SELECT status, COUNT(*) as count FROM respondents WHERE questionnaire_id = ? GROUP BY status`,
      [questionnaire.id]
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
      versions,
      respondentStats: respondentStats.reduce((acc, r) => {
        acc[r.status] = r.count;
        acc.total = (acc.total || 0) + r.count;
        return acc;
      }, {}),
      createdAt: questionnaire.created_at,
      updatedAt: questionnaire.updated_at
    });
  } catch (error) {
    console.error('Get questionnaire by code error:', error);
    res.status(500).json({ error: 'Failed to get questionnaire' });
  }
});

/**
 * GET /api/questionnaires/code/:code/respondents
 * Get respondents by questionnaire code (public)
 */
router.get('/code/:code/respondents', async (req, res) => {
  const { code } = req.params;
  
  try {
    const [questionnaires] = await pool.query('SELECT id FROM questionnaires WHERE code = ?', [code]);
    if (questionnaires.length === 0) {
      return res.status(404).json({ error: 'Questionnaire not found' });
    }
    
    const questionnaireId = questionnaires[0].id;
    
    const [respondents] = await pool.query(
      `SELECT r.id, r.name, r.ico, r.email, r.internal_note, r.valid_from, r.valid_until, r.status, r.created_at,
              s.status as submission_status, s.submitted_at
       FROM respondents r
       LEFT JOIN submissions s ON r.id = s.respondent_id
       WHERE r.questionnaire_id = ?
       ORDER BY r.created_at DESC`,
      [questionnaireId]
    );
    
    res.json(respondents);
  } catch (error) {
    console.error('Get respondents by code error:', error);
    res.status(500).json({ error: 'Failed to get respondents' });
  }
});

/**
 * GET /api/questionnaires/code/:code/dashboard
 * Get dashboard by questionnaire code (public)
 */
router.get('/code/:code/dashboard', async (req, res) => {
  const { code } = req.params;
  
  try {
    const [questionnaires] = await pool.query('SELECT id FROM questionnaires WHERE code = ?', [code]);
    if (questionnaires.length === 0) {
      return res.status(404).json({ error: 'Questionnaire not found' });
    }
    
    const id = questionnaires[0].id;
    
    // Get respondent stats
    const [respondentStats] = await pool.query(
      `SELECT status, COUNT(*) as count FROM respondents WHERE questionnaire_id = ? GROUP BY status`,
      [id]
    );
    
    // Get accessed count
    const [accessedStats] = await pool.query(
      `SELECT COUNT(*) as count FROM respondents WHERE questionnaire_id = ? AND first_accessed_at IS NOT NULL`,
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
    
    // Get versions
    const [versions] = await pool.query(
      `SELECT id, version_number, published_at 
       FROM questionnaire_versions 
       WHERE questionnaire_id = ? 
       ORDER BY version_number DESC`,
      [id]
    );
    
    // Get recent submissions
    const [recentSubmissions] = await pool.query(
      `SELECT r.name, r.ico, s.submitted_at
       FROM submissions s
       JOIN respondents r ON s.respondent_id = r.id
       WHERE r.questionnaire_id = ? AND s.status = 'submitted'
       ORDER BY s.submitted_at DESC
       LIMIT 5`,
      [id]
    );
    
    const stats = respondentStats.reduce((acc, r) => {
      acc[r.status] = r.count;
      acc.total = (acc.total || 0) + r.count;
      return acc;
    }, {});
    
    res.json({
      respondents: {
        total: stats.total || 0,
        invited: stats.invited || 0,
        in_progress: stats.in_progress || 0,
        submitted: stats.submitted || 0,
        locked: stats.locked || 0,
        accessed: accessedStats[0]?.count || 0
      },
      submissions: submissionStats.reduce((acc, s) => {
        acc[s.status] = s.count;
        return acc;
      }, {}),
      versions,
      recentSubmissions
    });
  } catch (error) {
    console.error('Get dashboard by code error:', error);
    res.status(500).json({ error: 'Failed to get dashboard' });
  }
});

/**
 * GET /api/questionnaires/:id
 * Get questionnaire details (public - no auth required)
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
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
    
    // Get versions
    const [versions] = await pool.query(
      'SELECT id, version_number, published_at FROM questionnaire_versions WHERE questionnaire_id = ? ORDER BY version_number DESC',
      [id]
    );
    
    // Get respondent stats
    const [respondentStats] = await pool.query(
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
      versions,
      respondentStats: respondentStats.reduce((acc, r) => {
        acc[r.status] = r.count;
        acc.total = (acc.total || 0) + r.count;
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
 * GET /api/questionnaires/:id/respondents
 * Get all respondents for questionnaire (public)
 */
router.get('/:id/respondents', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [respondents] = await pool.query(
      `SELECT r.id, r.name, r.ico, r.email, r.internal_note, r.valid_from, r.valid_until, r.status, r.created_at,
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
 * GET /api/questionnaires/:id/submissions/:respondentId
 * Get submission details for a respondent (public)
 */
router.get('/:id/submissions/:respondentId', async (req, res) => {
  const { id, respondentId } = req.params;
  
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

/**
 * GET /api/questionnaires/:id/dashboard
 * Get dashboard statistics (public)
 */
router.get('/:id/dashboard', async (req, res) => {
  const { id } = req.params;
  
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
 * POST /api/questionnaires/:id/export
 * Export questionnaire data (uses optional auth for logging)
 */
router.post('/:id/export', optionalAuth, async (req, res) => {
  const { id } = req.params;
  const { format = 'csv' } = req.body;
  
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
    
    // Log with editor if authenticated, otherwise system
    const actorType = req.userId ? 'editor' : 'system';
    await logAudit('questionnaire', id, 'exported', actorType, req.userId || null, { format }, req.ip);
    
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
    
    if (format === 'bundle' || format === 'zip') {
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
 * POST /api/questionnaires/:id/clone
 * Clone questionnaire (public - creates new questionnaire with new password)
 */
router.post('/:id/clone', async (req, res) => {
  const { id } = req.params;
  const { newTitle, newPassword } = req.body;
  
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
    
    await logAudit('questionnaire', result.insertId, 'cloned', 'system', null, { originalId: id }, req.ip);
    
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
 * DELETE /api/questionnaires/:id
 * Delete a questionnaire (requires authentication)
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [questionnaires] = await pool.query(
      'SELECT id FROM questionnaires WHERE id = ?',
      [id]
    );
    
    if (questionnaires.length === 0) {
      return res.status(404).json({ error: 'Questionnaire not found' });
    }
    
    await pool.query('DELETE FROM questionnaires WHERE id = ?', [id]);
    
    await logAudit('questionnaire', id, 'deleted', 'editor', req.userId || null, null, req.ip);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete questionnaire error:', error);
    res.status(500).json({ error: 'Failed to delete questionnaire' });
  }
});

/**
 * POST /api/questionnaires
 * Create a new questionnaire
 */
router.post('/', async (req, res) => {
  const { title, description } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  try {
    const code = generateQuestionnaireCode();
    const defaultDefinition = getDefaultDefinition();
    
    const [result] = await pool.query(
      `INSERT INTO questionnaires (code, title, description, definition, settings)
       VALUES (?, ?, ?, ?, ?)`,
      [
        code,
        title,
        description || '',
        JSON.stringify(defaultDefinition),
        JSON.stringify({ autosaveSeconds: 10, allowResubmit: false })
      ]
    );
    
    await logAudit('questionnaire', result.insertId, 'created', 'editor', null, { title }, req.ip);
    
    res.status(201).json({
      id: result.insertId,
      code,
      title,
      status: 'draft'
    });
  } catch (error) {
    console.error('Create questionnaire error:', error);
    res.status(500).json({ error: 'Failed to create questionnaire' });
  }
});

/**
 * GET /api/questionnaires/check/:code
 * Check if questionnaire exists (for login page)
 */
router.get('/check/:code', async (req, res) => {
  const { code } = req.params;
  
  try {
    const [questionnaires] = await pool.query(
      'SELECT id, code, title FROM questionnaires WHERE code = ?',
      [code]
    );
    
    if (questionnaires.length === 0) {
      return res.status(404).json({ exists: false });
    }
    
    res.json({
      exists: true,
      code: questionnaires[0].code,
      title: questionnaires[0].title
    });
  } catch (error) {
    console.error('Check questionnaire error:', error);
    res.status(500).json({ error: 'Failed to check questionnaire' });
  }
});

/**
 * GET /api/questionnaires/templates
 * Get available templates
 */
router.get('/templates', async (req, res) => {
  try {
    const [templates] = await pool.query(
      'SELECT id, name, created_at FROM templates ORDER BY name'
    );
    
    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

/**
 * POST /api/questionnaires/templates
 * Create a new template
 */
router.post('/templates', async (req, res) => {
  const { name, css, layoutConfig } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  try {
    const [result] = await pool.query(
      'INSERT INTO templates (name, css, layout_config) VALUES (?, ?, ?)',
      [name, css || '', layoutConfig ? JSON.stringify(layoutConfig) : null]
    );
    
    res.status(201).json({
      id: result.insertId,
      name
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

/**
 * GET /api/questionnaires/templates/:id
 * Get template details
 */
router.get('/templates/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [templates] = await pool.query(
      'SELECT * FROM templates WHERE id = ?',
      [id]
    );
    
    if (templates.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(templates[0]);
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Failed to get template' });
  }
});

/**
 * PUT /api/questionnaires/templates/:id
 * Update template
 */
router.put('/templates/:id', async (req, res) => {
  const { id } = req.params;
  const { name, css, layoutConfig } = req.body;
  
  try {
    await pool.query(
      'UPDATE templates SET name = ?, css = ?, layout_config = ? WHERE id = ?',
      [name, css, layoutConfig ? JSON.stringify(layoutConfig) : null, id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

module.exports = router;
