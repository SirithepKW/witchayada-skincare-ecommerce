const express = require('express');
const { verifyToken, requireRole } = require('../../middlewares/auth.middleware');
const productController = require('./product.controller');

const router = express.Router();

/**
 * @openapi
 * /api/manager/products:
 *   get:
 *     tags: [Products]
 *     summary: ดูสินค้าทั้งหมด (Manager)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: กรองตามหมวดหมู่ (เช่น Serum, Toner, Cream)
 *       - in: query
 *         name: brand
 *         schema: { type: string }
 *         description: กรองตามแบรนด์ (เช่น GlowLab, SkinFirst)
 *     responses:
 *       200:
 *         description: รายการสินค้าทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 total:   { type: integer, example: 6 }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Product' }
 */
router.get('/', verifyToken, requireRole('manager'), productController.getAllProducts);

/**
 * @openapi
 * /api/manager/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: ดูสินค้าตาม ID (Manager)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1001
 *     responses:
 *       200:
 *         description: ข้อมูลสินค้า
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Product' }
 *       404:
 *         description: ไม่พบสินค้า
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/:id', verifyToken, requireRole('manager'), productController.getProductById);

/**
 * @openapi
 * /api/manager/products:
 *   post:
 *     tags: [Products]
 *     summary: เพิ่มสินค้าใหม่ (Manager)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, brand, category, price, stockQty]
 *             properties:
 *               name:           { type: string,  example: "Niacinamide Serum 10% 30ml" }
 *               brand:          { type: string,  example: "GlowLab" }
 *               category:       { type: string,  example: "Serum" }
 *               skinTypeTarget: { type: array, items: { type: string }, example: ["oily", "combination"] }
 *               ingredients:    { type: array, items: { type: string }, example: ["Niacinamide 10%", "Zinc PCA"] }
 *               description:    { type: string,  example: "เซรั่มลดรูขุมขนกว้างและควบคุมความมัน" }
 *               price:          { type: number,  example: 490 }
 *               stockQty:       { type: integer, example: 100 }
 *               expiryDate:     { type: string,  example: "2027-10-01" }
 *               images:         { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: เพิ่มสินค้าสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: ข้อมูลไม่ครบ
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/', verifyToken, requireRole('manager'), productController.createProduct);

/**
 * @openapi
 * /api/manager/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: แก้ไขสินค้า (Manager)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:           { type: string }
 *               brand:          { type: string }
 *               category:       { type: string }
 *               price:          { type: number, example: 620 }
 *               stockQty:       { type: integer }
 *               expiryDate:     { type: string }
 *               description:    { type: string }
 *               skinTypeTarget: { type: array, items: { type: string } }
 *               ingredients:    { type: array, items: { type: string } }
 *               images:         { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: แก้ไขสินค้าสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Product' }
 *       404:
 *         description: ไม่พบสินค้า
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.put('/:id', verifyToken, requireRole('manager'), productController.updateProduct);

/**
 * @openapi
 * /api/manager/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: ลบสินค้า (Manager)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1001
 *     responses:
 *       200:
 *         description: ลบสินค้าสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     message: { type: string, example: "ลบสินค้า Hyaluronic Acid Serum 30ml สำเร็จ" }
 *       404:
 *         description: ไม่พบสินค้า
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.delete('/:id', verifyToken, requireRole('manager'), productController.deleteProduct);

module.exports = router;
