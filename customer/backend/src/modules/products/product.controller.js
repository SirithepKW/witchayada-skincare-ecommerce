const productService = require('./product.service');

/**
 * GET /api/products
 * Query params: skinType, brand, category, minPrice, maxPrice, search
 */
const getProducts = async (req, res, next) => {
  try {
    const { skinType, brand, category, minPrice, maxPrice, search } = req.query;
    const products = await productService.getProducts({ skinType, brand, category, minPrice, maxPrice, search });
    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProductById };
