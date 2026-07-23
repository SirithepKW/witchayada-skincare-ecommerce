const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { findOne } = require('../../config/store');

/**
 * เข้าสู่ระบบ (staff / manager)
 */
const login = async ({ email, password }) => {
  const user = findOne('users', (u) => u.email === email);
  if (!user) {
    const err = new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    err.statusCode = 401;
    throw err;
  }

  // ตรวจสอบว่าเป็น staff หรือ manager เท่านั้น
  if (!['staff', 'manager'].includes(user.role)) {
    const err = new Error('ไม่มีสิทธิ์เข้าสู่ระบบนี้');
    err.statusCode = 403;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const err = new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken(user);
  return { token, user: sanitizeUser(user) };
};

/**
 * ดึงข้อมูล profile ของตัวเอง
 */
const getProfile = (userId) => {
  const user = findOne('users', (u) => u.id === userId);
  if (!user) {
    const err = new Error('ไม่พบข้อมูลผู้ใช้');
    err.statusCode = 404;
    throw err;
  }
  return sanitizeUser(user);
};

// ── Helpers ────────────────────────────────────────────────

const generateToken = (user) =>
  jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

/** ซ่อน passwordHash ก่อนส่งออก */
const sanitizeUser = ({ passwordHash: _pw, ...rest }) => rest;

module.exports = { login, getProfile };
