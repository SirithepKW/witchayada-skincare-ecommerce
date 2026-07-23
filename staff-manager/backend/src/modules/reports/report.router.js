const express = require('express');
const { verifyToken, requireRole } = require('../../middlewares/auth.middleware');
const reportController = require('./report.controller');

const router = express.Router();

/**
 * @openapi
 * /api/manager/reports/sales:
 *   get:
 *     tags: [Reports]
 *     summary: รายงานยอดขาย (Manager)
 *     description: |
 *       สรุปยอดขายจากออเดอร์ที่มีสถานะ confirmed, shipping, delivered
 *       รวมถึง Top 5 สินค้าขายดีตามรายได้
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายงานยอดขาย
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/SalesReport' }
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
router.get('/sales', verifyToken, requireRole('manager'), reportController.getSalesReport);

/**
 * @openapi
 * /api/manager/reports/stock:
 *   get:
 *     tags: [Reports]
 *     summary: รายงานสต็อกสินค้า (Manager)
 *     description: |
 *       แสดงจำนวนสต็อกสินค้าทั้งหมด จัดเรียงจากน้อยไปมาก
 *       - status **ok**: stockQty > 30
 *       - status **low**: stockQty 1–30 (ใกล้หมด)
 *       - status **out**: stockQty = 0 (หมดแล้ว)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายงานสต็อก
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/StockReport' }
 */
router.get('/stock', verifyToken, requireRole('manager'), reportController.getStockReport);

module.exports = router;
