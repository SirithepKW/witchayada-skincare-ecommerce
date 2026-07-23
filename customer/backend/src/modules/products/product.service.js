const { pool } = require('../../config/store');

/**
 * ดึงสินค้าทั้งหมด พร้อม filter
 * @param {Object} filters - { skinType, brand, category, minPrice, maxPrice, search }
 */
const getProducts = async ({ skinType, brand, category, minPrice, maxPrice, search } = {}) => {
  let sql = `
    SELECT
      p.product_id   AS id,
      p.name,
      p.ingredients,
      p.price,
      p.stock_qty    AS stockQty,
      p.expiry_date  AS expiryDate,
      b.name         AS brand,
      b.country      AS brandCountry,
      c.name         AS category,
      c.skin_type_target AS skinTypeTarget,
      (SELECT image_url FROM product_images WHERE product_id = p.product_id LIMIT 1) AS imageUrl
    FROM products p
    JOIN brands b    ON b.brand_id    = p.brand_id
    JOIN categories c ON c.category_id = p.category_id
    WHERE 1=1
  `;
  const params = [];

  if (skinType) {
    sql += ' AND (c.skin_type_target = ? OR c.skin_type_target = "All")';
    params.push(skinType);
  }
  if (brand) {
    sql += ' AND b.name = ?';
    params.push(brand);
  }
  if (category) {
    sql += ' AND c.name = ?';
    params.push(category);
  }
  if (minPrice !== undefined) {
    sql += ' AND p.price >= ?';
    params.push(Number(minPrice));
  }
  if (maxPrice !== undefined) {
    sql += ' AND p.price <= ?';
    params.push(Number(maxPrice));
  }
  if (search) {
    sql += ' AND p.name LIKE ?';
    params.push(`%${search}%`);
  }

  const [rows] = await pool.query(sql, params);
  return rows;
};

/**
 * ดึงสินค้าตาม id
 */
const getProductById = async (id) => {
  const [[product]] = await pool.query(
    `SELECT
      p.product_id   AS id,
      p.name,
      p.ingredients,
      p.price,
      p.stock_qty    AS stockQty,
      p.expiry_date  AS expiryDate,
      b.name         AS brand,
      b.country      AS brandCountry,
      c.name         AS category,
      c.skin_type_target AS skinTypeTarget,
      (SELECT image_url FROM product_images WHERE product_id = p.product_id LIMIT 1) AS imageUrl
    FROM products p
    JOIN brands b    ON b.brand_id    = p.brand_id
    JOIN categories c ON c.category_id = p.category_id
    WHERE p.product_id = ?`,
    [Number(id)]
  );
  if (!product) {
    const err = new Error('ไม่พบสินค้า');
    err.statusCode = 404;
    throw err;
  }
  return product;
};

module.exports = { getProducts, getProductById };
