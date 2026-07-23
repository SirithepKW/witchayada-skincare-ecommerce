const { findAll, findById, create, update, remove } = require('../../config/store');

/**
 * ดูสินค้าทั้งหมด (Manager)
 * รองรับ filter: category, brand
 */
const getAllProducts = ({ category, brand } = {}) => {
  return findAll('products', (p) => {
    if (category && p.category.toLowerCase() !== category.toLowerCase()) return false;
    if (brand    && p.brand.toLowerCase()    !== brand.toLowerCase())    return false;
    return true;
  });
};

/**
 * ดูสินค้าตาม id
 */
const getProductById = (id) => {
  const product = findById('products', parseInt(id));
  if (!product) {
    const err = new Error('ไม่พบสินค้า');
    err.statusCode = 404;
    throw err;
  }
  return product;
};

/**
 * เพิ่มสินค้าใหม่ (Manager)
 */
const createProduct = (data) => {
  const { name, brand, category, price, stockQty } = data;
  if (!name || !brand || !category || price === undefined || stockQty === undefined) {
    const err = new Error('กรุณาระบุ name, brand, category, price และ stockQty');
    err.statusCode = 400;
    throw err;
  }
  if (Number(price) < 0 || Number(stockQty) < 0) {
    const err = new Error('price และ stockQty ต้องไม่ติดลบ');
    err.statusCode = 400;
    throw err;
  }

  return create('products', {
    name,
    brand,
    category: category || null,
    skinTypeTarget: data.skinTypeTarget || [],
    ingredients: data.ingredients || [],
    description: data.description || '',
    price: Number(price),
    stockQty: Number(stockQty),
    expiryDate: data.expiryDate || null,
    images: data.images || [],
    averageRating: 0,
    reviewCount: 0,
    createdAt: new Date().toISOString(),
  });
};

/**
 * แก้ไขสินค้า (Manager)
 */
const updateProduct = (id, data) => {
  const product = findById('products', parseInt(id));
  if (!product) {
    const err = new Error('ไม่พบสินค้า');
    err.statusCode = 404;
    throw err;
  }

  const allowedFields = [
    'name', 'brand', 'category', 'skinTypeTarget', 'ingredients',
    'description', 'price', 'stockQty', 'expiryDate', 'images',
  ];

  const patch = {};
  allowedFields.forEach((f) => {
    if (data[f] !== undefined) patch[f] = data[f];
  });
  patch.updatedAt = new Date().toISOString();

  return update('products', parseInt(id), patch);
};

/**
 * ลบสินค้า (Manager)
 */
const deleteProduct = (id) => {
  const product = findById('products', parseInt(id));
  if (!product) {
    const err = new Error('ไม่พบสินค้า');
    err.statusCode = 404;
    throw err;
  }
  remove('products', parseInt(id));
  return { message: `ลบสินค้า "${product.name}" สำเร็จ` };
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
