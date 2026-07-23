const stockService = require('./stock.service');
const { findAll } = require('../../config/store');

/**
 * PUT /api/staff/stock/:productId
 */
const updateStock = (req, res, next) => {
  try {
    const { productId } = req.params;
    const { stockQty } = req.body;

    if (stockQty === undefined) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ stockQty',
      });
    }

    const updated = stockService.updateStock(productId, stockQty);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/staff/stock
 */
const getAllStock = (_req, res, next) => {
  try {
    const products = findAll('products');
    const stockData = stockService.getAllStock(products);
    res.json({ success: true, data: stockData, total: stockData.length });
  } catch (err) {
    next(err);
  }
};

module.exports = { updateStock, getAllStock };
