const authService = require('./auth.service');

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอก email และ password',
      });
    }

    const result = await authService.login({ email, password });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/profile  (ต้อง login ก่อน)
 */
const getProfile = async (req, res, next) => {
  try {
    const profile = authService.getProfile(req.user.userId);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getProfile };
