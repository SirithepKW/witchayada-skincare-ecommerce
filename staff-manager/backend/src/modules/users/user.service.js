const { findAll, findById, update, remove } = require('../../config/store');

/**
 * ดูบัญชีผู้ใช้ทั้งหมด (Manager)
 * รองรับ filter: role
 */
const getAllUsers = ({ role } = {}) => {
  return findAll('users', (u) => {
    if (role && u.role !== role) return false;
    return true;
  }).map(sanitizeUser);
};

/**
 * ดูผู้ใช้ตาม id (Manager)
 */
const getUserById = (id) => {
  const user = findById('users', parseInt(id));
  if (!user) {
    const err = new Error('ไม่พบผู้ใช้');
    err.statusCode = 404;
    throw err;
  }
  return sanitizeUser(user);
};

/**
 * อัปเดตข้อมูลผู้ใช้ (Manager) — เช่น เปลี่ยน role
 */
const updateUser = (id, data) => {
  const user = findById('users', parseInt(id));
  if (!user) {
    const err = new Error('ไม่พบผู้ใช้');
    err.statusCode = 404;
    throw err;
  }

  const allowedFields = ['username', 'role', 'position'];
  const patch = {};
  allowedFields.forEach((f) => {
    if (data[f] !== undefined) patch[f] = data[f];
  });
  patch.updatedAt = new Date().toISOString();

  const updated = update('users', parseInt(id), patch);
  return sanitizeUser(updated);
};

/**
 * ลบบัญชีผู้ใช้ (Manager)
 */
const deleteUser = (id) => {
  const user = findById('users', parseInt(id));
  if (!user) {
    const err = new Error('ไม่พบผู้ใช้');
    err.statusCode = 404;
    throw err;
  }
  remove('users', parseInt(id));
  return { message: `ลบบัญชีผู้ใช้ "${user.username}" สำเร็จ` };
};

// ── Helpers ──────────────────────────────────────────────
const sanitizeUser = ({ passwordHash: _pw, ...rest }) => rest;

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
