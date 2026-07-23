const express = require('express');
const { verifyToken, requireRole } = require('../../middlewares/auth.middleware');
const userController = require('./user.controller');

const router = express.Router();

/**
 * @openapi
 * /api/manager/users:
 *   get:
 *     tags: [Users]
 *     summary: จัดการบัญชีผู้ใช้ — ดูทั้งหมด (Manager)
 *     description: |
 *       ดูบัญชีผู้ใช้ทั้งหมดในระบบ ทั้ง customer, staff และ manager
 *       สามารถกรองตาม role ได้
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [customer, staff, manager]
 *         description: กรองตาม role (ไม่ระบุ = แสดงทุก role)
 *     responses:
 *       200:
 *         description: รายการผู้ใช้ทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 total:   { type: integer, example: 4 }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/AnyUser' }
 *       401:
 *         description: ไม่มี Token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: ไม่มีสิทธิ์ (ต้องเป็น manager)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/', verifyToken, requireRole('manager'), userController.getAllUsers);

/**
 * @openapi
 * /api/manager/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: ดูบัญชีผู้ใช้ตาม ID (Manager)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 10
 *     responses:
 *       200:
 *         description: ข้อมูลผู้ใช้
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/AdminUser' }
 *       404:
 *         description: ไม่พบผู้ใช้
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/:id', verifyToken, requireRole('manager'), userController.getUserById);

/**
 * @openapi
 * /api/manager/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: อัปเดตบัญชีผู้ใช้ (Manager)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string, example: kant_staff_updated }
 *               role:
 *                 type: string
 *                 enum: [customer, staff, manager]
 *                 example: staff
 *               position: { type: string, example: warehouse }
 *     responses:
 *       200:
 *         description: อัปเดตผู้ใช้สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/AdminUser' }
 *       404:
 *         description: ไม่พบผู้ใช้
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.put('/:id', verifyToken, requireRole('manager'), userController.updateUser);

/**
 * @openapi
 * /api/manager/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: ลบบัญชีผู้ใช้ (Manager)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 10
 *     responses:
 *       200:
 *         description: ลบผู้ใช้สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     message: { type: string, example: "ลบบัญชีผู้ใช้ kant_staff สำเร็จ" }
 *       404:
 *         description: ไม่พบผู้ใช้
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.delete('/:id', verifyToken, requireRole('manager'), userController.deleteUser);

module.exports = router;
