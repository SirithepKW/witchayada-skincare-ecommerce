const express = require('express');
const { verifyToken, requireRole } = require('../../middlewares/auth.middleware');
const authController = require('./auth.controller');

const router = express.Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: เข้าสู่ระบบ (Staff / Manager)
 *     description: |
 *       **Mock accounts (password: `password123`)**
 *       - `staff@glowtime.com` — role: staff
 *       - `manager@glowtime.com` — role: manager
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email, example: staff@glowtime.com }
 *               password: { type: string, example: password123 }
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ ได้รับ JWT token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponse' }
 *       400:
 *         description: ข้อมูลไม่ครบ
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       401:
 *         description: อีเมลหรือรหัสผ่านไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/login', authController.login);

/**
 * @openapi
 * /api/auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: ดูข้อมูล Profile ของตัวเอง (staff / manager)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ข้อมูล Profile สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/AdminUser' }
 *       401:
 *         description: ไม่มี Token หรือ Token หมดอายุ
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/profile', verifyToken, requireRole('staff', 'manager'), authController.getProfile);

module.exports = router;
