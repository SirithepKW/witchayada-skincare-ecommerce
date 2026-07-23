const express = require('express');
const { verifyToken, requireRole } = require('../../middlewares/auth.middleware');
const orderController = require('./order.controller');

const router = express.Router();

/**
 * @openapi
 * /api/staff/orders:
 *   get:
 *     tags: [Orders]
 *     summary: ดูออเดอร์ทั้งหมด (Staff)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending_payment, confirmed, shipping, delivered]
 *         description: กรองตามสถานะ
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: integer
 *         description: กรองตาม customerId
 *     responses:
 *       200:
 *         description: รายการออเดอร์ทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 total:   { type: integer, example: 4 }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Order' }
 *       401:
 *         description: ไม่มี Token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: ไม่มีสิทธิ์ (ต้องเป็น staff)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/', verifyToken, requireRole('staff'), orderController.getAllOrders);

/**
 * @openapi
 * /api/staff/orders/{id}/status:
 *   put:
 *     tags: [Orders]
 *     summary: อัปเดตสถานะออเดอร์ (Staff)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Order ID (int)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending_payment, confirmed, shipping, delivered]
 *                 example: shipping
 *     responses:
 *       200:
 *         description: อัปเดตสถานะสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Order' }
 *       400:
 *         description: สถานะไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: ไม่พบออเดอร์
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.put('/:id/status', verifyToken, requireRole('staff'), orderController.updateOrderStatus);

module.exports = router;
