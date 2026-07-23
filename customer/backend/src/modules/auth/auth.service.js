const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { pool } = require('../../config/store');

const SALT_ROUNDS = 10;

/**
 * สมัครสมาชิก — สร้าง record ใน users + customers
 */
const register = async ({ username, email, password, skinType, phone }) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ตรวจสอบ email ซ้ำ
    const [[existing]] = await conn.query(
      'SELECT user_id FROM users WHERE email = ?', [email]
    );
    if (existing) {
      const err = new Error('อีเมลนี้ถูกใช้งานแล้ว');
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // สร้าง user
    const [userResult] = await conn.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, 'customer']
    );
    const userId = userResult.insertId;

    // สร้าง customer profile
    await conn.query(
      'INSERT INTO customers (user_id, skin_type, phone) VALUES (?, ?, ?)',
      [userId, skinType || null, phone || null]
    );

    // ดึง customer_id ที่เพิ่งสร้าง
    const [[customer]] = await conn.query(
      'SELECT customer_id FROM customers WHERE user_id = ?', [userId]
    );

    await conn.commit();

    const user = { user_id: userId, username, email, role: 'customer',
                   customer_id: customer.customer_id };
    const token = generateToken(user);
    return { token, user: sanitizeUser(user) };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * เข้าสู่ระบบ
 */
const login = async ({ email, password }) => {
  const [[user]] = await pool.query(
    `SELECT u.user_id, u.username, u.email, u.password_hash, u.role,
            c.customer_id
     FROM users u
     LEFT JOIN customers c ON c.user_id = u.user_id
     WHERE u.email = ? AND u.role = 'customer'`,
    [email]
  );

  if (!user) {
    const err = new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const err = new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    err.statusCode = 401;
    throw err;
  }

  // รองรับ password ธรรมดา (seed data ยังไม่ hash) — ถ้า bcrypt ไม่ match แต่ตรงกันเป๊ะ
  const token = generateToken(user);
  return { token, user: sanitizeUser(user) };
};

/**
 * ดึงข้อมูล profile ของตัวเอง
 */
const getProfile = async (userId) => {
  const [[user]] = await pool.query(
    `SELECT u.user_id, u.username, u.email, u.role,
            c.customer_id, c.skin_type, c.phone
     FROM users u
     LEFT JOIN customers c ON c.user_id = u.user_id
     WHERE u.user_id = ?`,
    [userId]
  );
  if (!user) {
    const err = new Error('ไม่พบข้อมูลผู้ใช้');
    err.statusCode = 404;
    throw err;
  }
  return sanitizeUser(user);
};

// ── Helpers ────────────────────────────────────────────────────

const generateToken = (user) =>
  jwt.sign(
    { userId: user.user_id, email: user.email, role: user.role,
      customerId: user.customer_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

/** ซ่อน password_hash ก่อนส่งออก */
const sanitizeUser = ({ password_hash: _pw, ...rest }) => rest;

module.exports = { register, login, getProfile };
