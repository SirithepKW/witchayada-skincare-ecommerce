const jwt = require('jsonwebtoken');

/**
 * verifyToken — ตรวจสอบ JWT token จาก Authorization header
 * ใส่ req.user = { userId, email, role } เมื่อ token ถูกต้อง
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'กรุณาเข้าสู่ระบบก่อน (ไม่พบ Token)',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email, role }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token ไม่ถูกต้องหรือหมดอายุแล้ว',
    });
  }
};

/**
 * requireRole(...roles) — ตรวจสอบว่า user มี role ที่อนุญาต
 * ต้องใช้ร่วมกับ verifyToken เสมอ
 * @example router.get('/orders', verifyToken, requireRole('staff'), controller)
 * @example router.get('/products', verifyToken, requireRole('manager'), controller)
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: 'ไม่มีสิทธิ์เข้าถึง (Forbidden)',
    });
  }
  next();
};

module.exports = { verifyToken, requireRole };
