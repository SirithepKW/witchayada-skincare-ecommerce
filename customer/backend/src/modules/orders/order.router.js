const express = require('express');
const { verifyToken, requireRole } = require('../../middlewares/auth.middleware');
const orderController = require('./order.controller');

const router = express.Router();

router.use(verifyToken, requireRole('customer'));

/**
 * @openapi
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: สร้างคำสั่งซื้อ (จากสินค้าในตะกร้า)
 *     description: สร้างออเดอร์จากตะกร้าปัจจุบัน ระบบจะล้างตะกร้าให้อัตโนมัติหลังสั่งซื้อ
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shippingAddress]
 *             properties:
 *               shippingAddress: { $ref: '#/components/schemas/ShippingAddress' }
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, qr_code, bank_transfer]
 *                 example: credit_card
 *     responses:
 *       201:
 *         description: สร้างคำสั่งซื้อสำเร็จ (status = pending_payment)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Order' }
 *       400:
 *         description: ตะกร้าว่าง หรือไม่ได้ระบุที่อยู่
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *   get:
 *     tags: [Orders]
 *     summary: ดูประวัติคำสั่งซื้อทั้งหมดของตัวเอง
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการคำสั่งซื้อ (เรียงจากใหม่ไปเก่า)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count:   { type: integer, example: 1 }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Order' }
 */
router.post('/', orderController.createOrder);
router.get('/',  orderController.getMyOrders);

/**
 * @openapi
 * /api/orders/{orderId}:
 *   get:
 *     tags: [Orders]
 *     summary: ติดตามสถานะคำสั่งซื้อ
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *         description: Order ID (เช่น ORD-20260722-0001)
 *         example: ORD-20260701-0001
 *     responses:
 *       200:
 *         description: รายละเอียดคำสั่งซื้อ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Order' }
 *       404:
 *         description: ไม่พบคำสั่งซื้อ
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/:orderId', orderController.getOrderById);

/**
 * @openapi
 * /api/orders/{orderId}/receive:
 *   put:
 *     tags: [Orders]
 *     summary: ยืนยันรับสินค้า (เปลี่ยนสถานะเป็น delivered)
 *     description: ลูกค้ากดยืนยันว่าได้รับสินค้าแล้ว — อนุญาตเมื่อสถานะเป็น confirmed หรือ shipping
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *         example: ORD-20260722-0001
 *     responses:
 *       200:
 *         description: ยืนยันรับสินค้าสำเร็จ (status = delivered)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: ยืนยันรับสินค้าเรียบร้อย }
 *                 data: { $ref: '#/components/schemas/Order' }
 *       400:
 *         description: สถานะไม่ถูกต้อง (ยังไม่ชำระเงิน หรือรับสินค้าไปแล้ว)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: ไม่พบคำสั่งซื้อ
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.put('/:orderId/receive', orderController.confirmReceive);

module.exports = router;

