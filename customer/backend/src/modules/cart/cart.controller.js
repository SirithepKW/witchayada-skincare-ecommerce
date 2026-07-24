const cartService = require('./cart.service');

/**
 * GET /api/cart
 */
const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.customerId);
    res.json({ success: true, data: cart });
  } catch (err) { next(err); }
};

/**
 * POST /api/cart/items
 * body: { productId, qty }
 */
const addItem = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const qty = Number(req.body.qty);
    // Bug #4 fix: ตรวจสอบหลัง Number() เพื่อกัน edge case qty="0" หรือ qty=NaN
    if (!productId || isNaN(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุ productId และ qty ที่ถูกต้อง (>= 1)' });
    }
    const cart = await cartService.addItem(req.user.customerId, { productId, qty });
    res.status(201).json({ success: true, data: cart });
  } catch (err) { next(err); }
};

/**
 * PUT /api/cart/items/:cartItemId
 * body: { qty }
 */
const updateItem = async (req, res, next) => {
  try {
    const qty = Number(req.body.qty);
    // Bug #4 fix: ตรวจสอบหลัง Number() เพื่อกัน edge case qty="0" หรือ qty=NaN
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุ qty ที่ถูกต้อง (>= 1)' });
    }
    const cart = await cartService.updateItem(req.user.customerId, req.params.cartItemId, { qty });
    res.json({ success: true, data: cart });
  } catch (err) { next(err); }
};

/**
 * DELETE /api/cart/items/:cartItemId
 */
const removeItem = async (req, res, next) => {
  try {
    const cart = await cartService.removeItem(req.user.customerId, req.params.cartItemId);
    res.json({ success: true, message: 'ลบสินค้าออกจากตะกร้าแล้ว', data: cart });
  } catch (err) { next(err); }
};

module.exports = { getCart, addItem, updateItem, removeItem };
