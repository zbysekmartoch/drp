/**
 * Database connection pool
 */

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'drpusr',
  password: process.env.DB_PASSWORD || 'drpheslo',
  database: process.env.DB_NAME || 'drpdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

module.exports = pool;
