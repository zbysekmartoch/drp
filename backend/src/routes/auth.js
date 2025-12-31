/**
 * Authentication routes
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = require('../db/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'drp-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email a heslo jsou povinné' });
    }

    const [rows] = await pool.query(
      'SELECT id, first_name, last_name, email, password_hash, role FROM usr WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Neplatné přihlašovací údaje' });
    }

    const user = rows[0];
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Neplatné přihlašovací údaje' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Přihlášení selhalo' });
  }
});

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Všechna pole jsou povinná' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'Heslo musí mít alespoň 4 znaky' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
      'INSERT INTO usr (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)',
      [firstName, lastName, email, passwordHash]
    );

    res.status(201).json({ message: 'Uživatel byl úspěšně zaregistrován' });
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Uživatel s tímto e-mailem již existuje' });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registrace selhala' });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Chybí autorizační token' });
    }

    const token = authHeader.slice(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;

      const [rows] = await pool.query(
        'SELECT id, first_name, last_name, email, role FROM usr WHERE id = ?',
        [userId]
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: 'Neplatný token' });
      }

      const user = rows[0];
      res.json({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role
      });
    } catch (jwtError) {
      return res.status(401).json({ error: 'Neplatný nebo vypršelý token' });
    }
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({ error: 'Ověření selhalo' });
  }
});

module.exports = router;
