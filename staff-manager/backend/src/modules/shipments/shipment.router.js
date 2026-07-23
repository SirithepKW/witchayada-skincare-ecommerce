const express = require('express');
const { verifyToken, requireRole } = require('../../middlewares/auth.middleware');
const shipmentController = require('./shipment.controller');

const router = express.Router();

/**
 * @openapi
 * /api/staff/shipments:
 *   get:
 *     tags: [Shipments]
 *     summary: ดูข้อมูลการจัดส่งทั้งหมด (Staff)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการการจัดส่งทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 total:   { type: integer, example: 2 }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Shipment' }
 */
router.get('/', verifyToken, requireRole('staff'), shipmentController.getAllShipments);

/**
 * @openapi
 * /api/staff/shipments:
 *   post:
 *     tags: [Shipments]
 *     summary: บันทึกข้อมูลการจัดส่ง (Staff)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, trackingNumber, carrier]
 *             properties:
 *               orderId:        { type: string, example: ORD-20260702-0001 }
 *               trackingNumber: { type: string, example: TH555666777EX }
 *               carrier:
 *                 type: string
 *                 enum: [Kerry Express, Flash Express, Thailand Post]
 *                 example: Kerry Express
 *     responses:
 *       201:
 *         description: บันทึกการจัดส่งสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Shipment' }
 *       400:
 *         description: ข้อมูลไม่ครบหรือ carrier ไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       409:
 *         description: ออเดอร์นี้มีข้อมูลการจัดส่งแล้ว
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/', verifyToken, requireRole('staff'), shipmentController.createShipment);

/**
 * @openapi
 * /api/staff/shipments/{orderId}:
 *   get:
 *     tags: [Shipments]
 *     summary: ดูข้อมูลการจัดส่งตาม orderId
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *         example: ORD-20260701-0001
 *     responses:
 *       200:
 *         description: ข้อมูลการจัดส่ง
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Shipment' }
 *       404:
 *         description: ไม่พบข้อมูลการจัดส่ง
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/:orderId', verifyToken, requireRole('staff'), shipmentController.getShipmentByOrderId);

module.exports = router;
