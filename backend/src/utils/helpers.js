/**
 * Utility functions for DRP
 */

const crypto = require('crypto');

/**
 * Generate a short alphanumeric token (8 characters)
 * Uses only uppercase letters and numbers for easy reading/typing
 */
const generateToken = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: I, O, 0, 1
  let token = '';
  const randomBytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    token += chars[randomBytes[i] % chars.length];
  }
  return token;
};

/**
 * Hash a token using SHA-256
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token.toUpperCase()).digest('hex');
};

/**
 * Generate a unique questionnaire code
 */
const generateQuestionnaireCode = () => {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `QNR-${year}-${random}`;
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  if (!email) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate IČO format (Czech company ID - 8 digits)
 */
const isValidICO = (ico) => {
  if (!ico) return true; // IČO is optional
  return /^\d{8}$/.test(ico);
};

/**
 * Sanitize filename for storage
 */
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 200);
};

/**
 * Generate unique stored filename
 */
const generateStoredFilename = (originalName) => {
  const ext = originalName.split('.').pop();
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${random}.${ext}`;
};

/**
 * Default questionnaire definition
 */
const getDefaultDefinition = () => ({
  blocks: [
    {
      id: 'block-1',
      title: 'Základní informace',
      description: '',
      questions: []
    }
  ],
  logic: [],
  settings: {
    autosaveSeconds: 10,
    allowResubmit: false
  }
});

/**
 * Validate questionnaire definition structure
 */
const validateDefinition = (definition) => {
  if (!definition || typeof definition !== 'object') {
    return { valid: false, error: 'Definition must be an object' };
  }
  
  if (!Array.isArray(definition.blocks)) {
    return { valid: false, error: 'Definition must have blocks array' };
  }
  
  for (const block of definition.blocks) {
    if (!block.id || !block.title) {
      return { valid: false, error: 'Each block must have id and title' };
    }
    
    if (!Array.isArray(block.questions)) {
      return { valid: false, error: 'Each block must have questions array' };
    }
    
    for (const question of block.questions) {
      if (!question.id || !question.type) {
        return { valid: false, error: 'Each question must have id and type' };
      }
      
      const validTypes = ['checkbox', 'radio', 'short_text', 'long_text', 'scale', 'file'];
      if (!validTypes.includes(question.type)) {
        return { valid: false, error: `Invalid question type: ${question.type}` };
      }
    }
  }
  
  return { valid: true };
};

module.exports = {
  generateToken,
  hashToken,
  generateQuestionnaireCode,
  isValidEmail,
  isValidICO,
  sanitizeFilename,
  generateStoredFilename,
  getDefaultDefinition,
  validateDefinition
};
