const { pool } = require('../../config/store');

const ORDER_STATUSES = ['pending_payment', 'confirmed', 'shipping', 'delivered'];

/**
 * ดึง order พร้อม items (response shape เหมือนเดิม)
 */
const buildOrderResponse = async (conn, orderId) => {
  const [[order]] = await conn.query(
    `SELECT
      o.order_id    AS orderId,
      o.customer_id AS customerId,
      o.status,
      o.total_amount AS totalAmount,
      o.order_date  AS createdAt,
      o.shipping_recipient AS recipient,
      o.shipping_address   AS address,
      o.shipping_province  AS province,
      o.shipping_postal    AS postalCode,
      o.payment_method     AS paymentMethod
     FROM orders o WHERE o.order_id = ?`, [orderId]
  );

  const [items] = await conn.query(
    `SELECT
      oi.order_item_id AS orderItemId,
      oi.product_id    AS productId,
      p.name           AS productName,
      oi.qty,
      oi.unit_price    AS unitPrice,
      (oi.unit_price * oi.qty) AS subtotal
     FROM order_items oi
     JOIN products p ON p.product_id = oi.product_id
     WHERE oi.order_id = ?`, [orderId]
  );

  return {
    ...order,
    shippingAddress: {
      recipient: order.recipient,
      address:   order.address,
      province:  order.province,
      postalCode: order.postalCode,
    },
    items,
  };
};

/**
 * สร้างคำสั่งซื้อจากตะกร้าปัจจุบัน
 */
const createOrder = async (customerId, { shippingAddress, paymentMethod }) => {
  if (!shippingAddress?.recipient || !shippingAddress?.address) {
    const err = new Error('กรุณาระบุที่อยู่จัดส่ง (recipient, address)');
    err.statusCode = 400;
    throw err;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ดึงตะกร้า
    const [[cart]] = await conn.query(
      'SELECT cart_id FROM carts WHERE customer_id = ?', [customerId]
    );
    if (!cart) {
      const err = new Error('ตะกร้าสินค้าว่างเปล่า'); err.statusCode = 400; throw err;
    }

    const [cartItems] = await conn.query(
      `SELECT ci.product_id, ci.qty, p.price AS unit_price, p.name AS product_name
       FROM cart_items ci JOIN products p ON p.product_id = ci.product_id
       WHERE ci.cart_id = ?`, [cart.cart_id]
    );
    if (cartItems.length === 0) {
      const err = new Error('ตะกร้าสินค้าว่างเปล่า'); err.statusCode = 400; throw err;
    }

    const totalAmount = cartItems.reduce((s, i) => s + Number(i.unit_price) * i.qty, 0);

    // สร้าง order — schema จริงมีคอลัมน์ shipping เพิ่ม (เพิ่ม ALTER ถ้ายังไม่มี)
    const [orderResult] = await conn.query(
      `INSERT INTO orders
         (customer_id, order_date, status, total_amount,
          shipping_recipient, shipping_address, shipping_province, shipping_postal, payment_method)
       VALUES (?, NOW(), 'pending_payment', ?, ?, ?, ?, ?, ?)`,
      [
        customerId,
        totalAmount.toFixed(2),
        shippingAddress.recipient,
        shippingAddress.address,
        shippingAddress.province || null,
        shippingAddress.postalCode || null,
        paymentMethod || null,
      ]
    );
    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of cartItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.qty, item.unit_price]
      );
    }

    // เคลียร์ตะกร้า
    await conn.query('DELETE FROM cart_items WHERE cart_id = ?', [cart.cart_id]);

    await conn.commit();

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const displayOrderId = `ORD-${dateStr}-${String(orderId).padStart(4, '0')}`;

    return {
      orderId:   displayOrderId,
      _dbId:     orderId,
      customerId,
      status:    'pending_payment',
      totalAmount: +totalAmount.toFixed(2),
      shippingAddress,
      paymentMethod: paymentMethod || null,
      createdAt: new Date().toISOString(),
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * ดึงประวัติคำสั่งซื้อของ customer
 */
const getMyOrders = async (customerId) => {
  const [orders] = await pool.query(
    `SELECT
      o.order_id    AS orderId,
      o.status,
      o.total_amount AS totalAmount,
      o.order_date  AS createdAt
     FROM orders o WHERE o.customer_id = ?
     ORDER BY o.order_date DESC`,
    [customerId]
  );
  return orders;
};

/**
 * ดึงคำสั่งซื้อตาม orderId (ตรวจสอบว่าเป็นของ customer นี้)
 */
const getOrderById = async (customerId, orderId) => {
  // orderId อาจเป็น display string "ORD-20250101-0001" หรือ numeric
  const numericId = Number(orderId);
  const [[order]] = await pool.query(
    'SELECT order_id FROM orders WHERE order_id = ? AND customer_id = ?',
    [numericId, customerId]
  );
  if (!order) {
    const err = new Error('ไม่พบคำสั่งซื้อ'); err.statusCode = 404; throw err;
  }
  const conn = await pool.getConnection();
  try {
    return buildOrderResponse(conn, numericId);
  } finally {
    conn.release();
  }
};

/**
 * ลูกค้ากดยืนยันรับสินค้า → เปลี่ยนสถานะเป็น delivered
 * (อนุญาตเมื่อสถานะเป็น confirmed หรือ shipping เท่านั้น)
 */
const confirmReceive = (customerId, orderId) => {
  const order = findOne('orders', (o) => o.orderId === orderId && o.customerId === customerId);
  if (!order) {
    const err = new Error('ไม่พบคำสั่งซื้อ');
    err.statusCode = 404;
    throw err;
  }
  if (order.status === 'delivered') {
    const err = new Error('คำสั่งซื้อนี้ได้รับสินค้าแล้ว');
    err.statusCode = 400;
    throw err;
  }
  if (order.status === 'pending_payment') {
    const err = new Error('กรุณาชำระเงินก่อนยืนยันรับสินค้า');
    err.statusCode = 400;
    throw err;
  }
  return update('orders', order.id, {
    status: 'delivered',
    deliveredAt: new Date().toISOString(),
  });
};

module.exports = { createOrder, getMyOrders, getOrderById, confirmReceive, ORDER_STATUSES };
