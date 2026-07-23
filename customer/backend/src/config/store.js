/**
 * MySQL Data Layer — GLOWTIME Customer Backend
 * ─────────────────────────────────────────────────────────────────
 * เชื่อมต่อ Railway MySQL ผ่าน mysql2/promise connection pool
 * แทนที่ Mock JSON in-memory store เดิม
 * ─────────────────────────────────────────────────────────────────
 */

const mysql = require('mysql2/promise');

// ── Connection Pool ──────────────────────────────────────────────
const pool = mysql.createPool({
  host:               process.env.DB_HOST,
  port:               Number(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER,
  password:           process.env.DB_PASS,
  database:           process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  // SSL required for Railway external connections
  ssl: { rejectUnauthorized: false },
});

/**
 * ทดสอบการเชื่อมต่อ — เรียกใช้ตอน server start
 */
const testConnection = async () => {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
};

module.exports = { pool, testConnection };
