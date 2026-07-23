const productService = require('./product.service');

/**
 * GET /api/manager/products
 */
const getAllProducts = (req, res, next) => {
  try {
    const { category, brand } = req.query;
    const products = productService.getAllProducts({ category, brand });
    res.json({ success: true, data: products, total: products.length });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/manager/products/:id
 */
const getProductById = (req, res, next) => {
  try {
    const product = productService.getProductById(req.params.id);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/manager/products
 */
const createProduct = (req, res, next) => {
  try {
    const product = productService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/manager/products/:id
 */
const updateProduct = (req, res, next) => {
  try {
    const updated = productService.updateProduct(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/manager/products/:id
 */
const deleteProduct = (req, res, next) => {
  try {
    const result = productService.deleteProduct(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
