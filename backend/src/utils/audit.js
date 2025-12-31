/**
 * Audit logging utility
 */

const pool = require('../db/connection');

/**
 * Log an audit event
 * @param {string} entityType - 'questionnaire', 'respondent', 'submission', 'file'
 * @param {number} entityId - ID of the entity
 * @param {string} action - Action performed
 * @param {string} actorType - 'editor', 'respondent', 'system'
 * @param {number|null} actorId - ID of the actor (if applicable)
 * @param {object|null} details - Additional details
 * @param {string|null} ipAddress - IP address of the request
 */
const logAudit = async (entityType, entityId, action, actorType, actorId = null, details = null, ipAddress = null) => {
  try {
    await pool.query(
      `INSERT INTO audit_log (entity_type, entity_id, action, actor_type, actor_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [entityType, entityId, action, actorType, actorId, details ? JSON.stringify(details) : null, ipAddress]
    );
  } catch (error) {
    console.error('Audit logging error:', error);
    // Don't throw - audit logging should not break the main operation
  }
};

/**
 * Get audit log for an entity
 */
const getAuditLog = async (entityType, entityId, limit = 100) => {
  const [rows] = await pool.query(
    `SELECT * FROM audit_log 
     WHERE entity_type = ? AND entity_id = ? 
     ORDER BY created_at DESC 
     LIMIT ?`,
    [entityType, entityId, limit]
  );
  return rows;
};

module.exports = {
  logAudit,
  getAuditLog
};
