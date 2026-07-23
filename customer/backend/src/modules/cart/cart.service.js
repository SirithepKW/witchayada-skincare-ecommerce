const { pool } = require('../../config/store');

/**
 * helper — ดึง cart พร้อม items ของ customer (สร้างใหม่ถ้ายังไม่มี)
 */
const getOrCreateCart = async (conn, customerId) => {
  let [[cart]] = await conn.query(
    'SELECT cart_id FROM carts WHERE customer_id = ?', [customerId]
  );
  if (!cart) {
    const [result] = await conn.query(
      'INSERT INTO carts (customer_id) VALUES (?)', [customerId]
    );
    cart = { cart_id: result.insertId };
  }
  return cart;
};

/**
 * helper — ประกอบ cart response shape ให้ frontend เหมือนเดิม
 */
const buildCartResponse = async (conn, cartId) => {
  const [items] = await conn.query(
    `SELECT
      ci.cart_item_id AS cartItemId,
      ci.product_id   AS productId,
      p.name          AS productName,
      p.price         AS unitPrice,
      ci.qty,
      (p.price * ci.qty) AS subtotal
     FROM cart_items ci
     JOIN products p ON p.product_id = ci.product_id
     WHERE ci.cart_id = ?`,
    [cartId]
  );

  const totalAmount = items.reduce((sum, i) => sum + Number(i.subtotal), 0);
  return { cartId, items, totalAmount: +totalAmount.toFixed(2) };
};

/**
 * ดึงตะกร้าของ customer
 */
const getCart = async (customerId) => {
  const conn = await pool.getConnection();
  try {
    const cart = await getOrCreateCart(conn, customerId);
    return buildCartResponse(conn, cart.cart_id);
  } finally {
    conn.release();
  }
};

/**
 * เพิ่มสินค้าลงตะกร้า (ถ้ามีแล้วให้ +qty)
 */
const addItem = async (customerId, { productId, qty }) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ตรวจสอบสินค้า + stock
    const [[product]] = await conn.query(
      'SELECT product_id, name, price, stock_qty FROM products WHERE product_id = ?',
      [Number(productId)]
    );
    if (!product) {
      const err = new Error('ไม่พบสินค้า'); err.statusCode = 404; throw err;
    }
    if (qty < 1) {
      const err = new Error('จำนวนสินค้าต้องมากกว่า 0'); err.statusCode = 400; throw err;
    }
    if (product.stock_qty < qty) {
      const err = new Error(`สินค้าคงเหลือไม่เพียงพอ (คงเหลือ: ${product.stock_qty})`);
      err.statusCode = 400; throw err;
    }

    const cart = await getOrCreateCart(conn, customerId);

    // ตรวจสอบว่ามีสินค้านี้ในตะกร้าอยู่แล้ว
    const [[existing]] = await conn.query(
      'SELECT cart_item_id, qty FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cart.cart_id, Number(productId)]
    );

    if (existing) {
      await conn.query(
        'UPDATE cart_items SET qty = qty + ? WHERE cart_item_id = ?',
        [qty, existing.cart_item_id]
      );
    } else {
      await conn.query(
        'INSERT INTO cart_items (cart_id, product_id, qty) VALUES (?, ?, ?)',
        [cart.cart_id, Number(productId), qty]
      );
    }

    await conn.commit();
    return buildCartResponse(conn, cart.cart_id);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * แก้ไขจำนวนสินค้าในตะกร้า
 */
const updateItem = async (customerId, cartItemId, { qty }) => {
  if (qty < 1) {
    const err = new Error('จำนวนสินค้าต้องมากกว่า 0 (ถ้าต้องการลบให้ใช้ DELETE)');
    err.statusCode = 400; throw err;
  }

  const conn = await pool.getConnection();
  try {
    const cart = await getOrCreateCart(conn, customerId);

    const [[item]] = await conn.query(
      'SELECT cart_item_id FROM cart_items WHERE cart_item_id = ? AND cart_id = ?',
      [Number(cartItemId), cart.cart_id]
    );
    if (!item) {
      const err = new Error('ไม่พบสินค้าในตะกร้า'); err.statusCode = 404; throw err;
    }

    await conn.query(
      'UPDATE cart_items SET qty = ? WHERE cart_item_id = ?',
      [qty, Number(cartItemId)]
    );

    return buildCartResponse(conn, cart.cart_id);
  } finally {
    conn.release();
  }
};

/**
 * ลบสินค้าออกจากตะกร้า
 */
const removeItem = async (customerId, cartItemId) => {
  const conn = await pool.getConnection();
  try {
    const cart = await getOrCreateCart(conn, customerId);

    const [result] = await conn.query(
      'DELETE FROM cart_items WHERE cart_item_id = ? AND cart_id = ?',
      [Number(cartItemId), cart.cart_id]
    );
    if (result.affectedRows === 0) {
      const err = new Error('ไม่พบสินค้าในตะกร้า'); err.statusCode = 404; throw err;
    }

    return buildCartResponse(conn, cart.cart_id);
  } finally {
    conn.release();
  }
};

module.exports = { getCart, addItem, updateItem, removeItem };
