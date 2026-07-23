const { findById, update } = require('../../config/store');

/**
 * จัดการสต็อกสินค้า — อัปเดต stockQty (Staff)
 * @param {number|string} productId
 * @param {number} stockQty
 */
const updateStock = (productId, stockQty) => {
  const id = parseInt(productId);

  if (isNaN(id)) {
    const err = new Error('productId ไม่ถูกต้อง');
    err.statusCode = 400;
    throw err;
  }

  if (stockQty === undefined || stockQty === null || isNaN(Number(stockQty)) || Number(stockQty) < 0) {
    const err = new Error('stockQty ต้องเป็นตัวเลขที่ >= 0');
    err.statusCode = 400;
    throw err;
  }

  const product = findById('products', id);
  if (!product) {
    const err = new Error('ไม่พบสินค้า');
    err.statusCode = 404;
    throw err;
  }

  return update('products', id, {
    stockQty: Number(stockQty),
    updatedAt: new Date().toISOString(),
  });
};

/**
 * ดูสต็อกสินค้าทั้งหมด (สำหรับ Staff ตรวจสอบ)
 */
const getAllStock = (products) => {
  return products.map((p) => ({
    productId: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    stockQty: p.stockQty,
    expiryDate: p.expiryDate,
    status: p.stockQty === 0 ? 'out' : p.stockQty <= 20 ? 'low' : 'ok',
  }));
};

module.exports = { updateStock, getAllStock };
