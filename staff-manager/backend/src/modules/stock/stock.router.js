const express = require('express');
const { verifyToken, requireRole } = require('../../middlewares/auth.middleware');
const stockController = require('./stock.controller');

const router = express.Router();

/**
 * @openapi
 * /api/staff/stock:
 *   get:
 *     tags: [Stock]
 *     summary: ดูสต็อกสินค้าทั้งหมด (Staff)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการสต็อกสินค้าทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 total:   { type: integer, example: 6 }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:  { type: integer }
 *                       name:       { type: string }
 *                       brand:      { type: string }
 *                       category:   { type: string }
 *                       stockQty:   { type: integer }
 *                       expiryDate: { type: string }
 *                       status:
 *                         type: string
 *                         enum: [ok, low, out]
 *                         description: ok = ปกติ, low = ใกล้หมด (<=20), out = หมดแล้ว
 */
router.get('/', verifyToken, requireRole('staff'), stockController.getAllStock);

/**
 * @openapi
 * /api/staff/stock/{productId}:
 *   put:
 *     tags: [Stock]
 *     summary: จัดการสต็อกสินค้า — อัปเดตจำนวน (Staff)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *         description: Product ID
 *         example: 1001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/StockUpdate' }
 *     responses:
 *       200:
 *         description: อัปเดตสต็อกสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: stockQty ไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: ไม่พบสินค้า
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.put('/:productId', verifyToken, requireRole('staff'), stockController.updateStock);

module.exports = router;
