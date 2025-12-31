/**
 * DRP - Data Request Portal
 * Database Schema - Auto-creates tables on startup
 */

const initDatabase = async (pool) => {
  const connection = await pool.getConnection();
  
  try {
    // Users table for application authentication
    await connection.query(`
      CREATE TABLE IF NOT EXISTS usr (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Templates table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        css TEXT,
        layout_config JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Questionnaires table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS questionnaires (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        edit_password_hash VARCHAR(255) DEFAULT NULL,
        status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
        template_id INT,
        definition JSON,
        settings JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL,
        INDEX idx_code (code),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Questionnaire versions (immutable snapshots)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS questionnaire_versions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        questionnaire_id INT NOT NULL,
        version_number INT NOT NULL,
        definition JSON NOT NULL,
        template_css TEXT,
        template_layout JSON,
        published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE,
        UNIQUE KEY unique_version (questionnaire_id, version_number),
        INDEX idx_questionnaire (questionnaire_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Respondents table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS respondents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        questionnaire_id INT NOT NULL,
        name VARCHAR(500) NOT NULL,
        ico VARCHAR(20),
        email VARCHAR(255),
        internal_note TEXT,
        token VARCHAR(16) NOT NULL,
        token_hash VARCHAR(64) NOT NULL,
        valid_from DATETIME DEFAULT '2025-01-01 00:00:00',
        valid_until DATETIME DEFAULT '2025-01-01 00:00:00',
        first_accessed_at DATETIME DEFAULT NULL,
        status ENUM('invited', 'in_progress', 'submitted', 'locked') DEFAULT 'invited',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE,
        INDEX idx_token (token_hash),
        INDEX idx_questionnaire (questionnaire_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Migration: Add first_accessed_at column if doesn't exist
    const [accessedCol] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'respondents' AND COLUMN_NAME = 'first_accessed_at'
    `);
    
    if (accessedCol.length === 0) {
      await connection.query(`
        ALTER TABLE respondents ADD COLUMN first_accessed_at DATETIME DEFAULT NULL AFTER valid_until
      `).catch((e) => console.log('Migration note:', e.message));
    }

    // Migration: Add token column if doesn't exist
    const [tokenCol] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'respondents' AND COLUMN_NAME = 'token'
    `);
    
    if (tokenCol.length === 0) {
      await connection.query(`
        ALTER TABLE respondents ADD COLUMN token VARCHAR(16) NOT NULL DEFAULT '' AFTER internal_note
      `).catch((e) => console.log('Migration note:', e.message));
    }

    // Migration: Make edit_password_hash nullable
    await connection.query(`
      ALTER TABLE questionnaires MODIFY COLUMN edit_password_hash VARCHAR(255) DEFAULT NULL
    `).catch((e) => console.log('Migration note:', e.message));

    // Migration: Add valid_from and valid_until columns if they don't exist
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'respondents' AND COLUMN_NAME = 'valid_from'
    `);
    
    if (columns.length === 0) {
      await connection.query(`
        ALTER TABLE respondents 
        ADD COLUMN valid_from DATETIME DEFAULT '2025-01-01 00:00:00' AFTER token_hash,
        ADD COLUMN valid_until DATETIME DEFAULT '2025-01-01 00:00:00' AFTER valid_from
      `).catch((e) => console.log('Migration note:', e.message));
      
      // Drop old deadline column if exists
      await connection.query(`ALTER TABLE respondents DROP COLUMN deadline`).catch(() => {});
    }

    // Submissions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        respondent_id INT NOT NULL UNIQUE,
        questionnaire_version_id INT,
        status ENUM('draft', 'submitted') DEFAULT 'draft',
        data JSON,
        submitted_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (respondent_id) REFERENCES respondents(id) ON DELETE CASCADE,
        FOREIGN KEY (questionnaire_version_id) REFERENCES questionnaire_versions(id) ON DELETE SET NULL,
        INDEX idx_respondent (respondent_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Answers table (EAV model for granular answer storage)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS answers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submission_id INT NOT NULL,
        question_id VARCHAR(100) NOT NULL,
        value JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
        UNIQUE KEY unique_answer (submission_id, question_id),
        INDEX idx_submission (submission_id),
        INDEX idx_question (question_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // File uploads table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS file_uploads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submission_id INT NOT NULL,
        question_id VARCHAR(100) NOT NULL,
        original_name VARCHAR(500) NOT NULL,
        stored_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100),
        size_bytes BIGINT,
        storage_path VARCHAR(1000) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
        INDEX idx_submission (submission_id),
        INDEX idx_question (question_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Audit log table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        entity_type ENUM('questionnaire', 'respondent', 'submission', 'file') NOT NULL,
        entity_id INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        actor_type ENUM('editor', 'respondent', 'system') NOT NULL,
        actor_id INT,
        details JSON,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_entity (entity_type, entity_id),
        INDEX idx_action (action),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Editor sessions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS editor_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(64) NOT NULL UNIQUE,
        questionnaire_id INT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE,
        INDEX idx_session (session_id),
        INDEX idx_expires (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Access log table - logs every respondent form access
    await connection.query(`
      CREATE TABLE IF NOT EXISTS access_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        respondent_id INT NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        accept_language VARCHAR(255),
        referer TEXT,
        screen_width INT,
        screen_height INT,
        timezone VARCHAR(100),
        platform VARCHAR(100),
        is_mobile BOOLEAN,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (respondent_id) REFERENCES respondents(id) ON DELETE CASCADE,
        INDEX idx_respondent (respondent_id),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Data EAV table - stores answers in normalized form (respondent_id, variable, value)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS data_eav (
        id INT AUTO_INCREMENT PRIMARY KEY,
        respondent_id INT NOT NULL,
        variable VARCHAR(100) NOT NULL,
        value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (respondent_id) REFERENCES respondents(id) ON DELETE CASCADE,
        UNIQUE KEY unique_respondent_variable (respondent_id, variable),
        INDEX idx_respondent (respondent_id),
        INDEX idx_variable (variable)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✓ Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = { initDatabase };
