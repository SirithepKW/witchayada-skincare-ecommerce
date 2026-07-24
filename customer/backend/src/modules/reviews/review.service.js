const { pool } = require('../../config/store');

/**
 * ดึงรีวิวของสินค้า
 */
const getReviewsByProduct = async (productId) => {
  const [reviews] = await pool.query(
    `SELECT
      r.review_id  AS id,
      r.rating,
      r.comment,
      u.username
     FROM reviews r
     JOIN customers c ON c.customer_id = r.customer_id
     JOIN users u     ON u.user_id     = c.user_id
     WHERE r.product_id = ?
     ORDER BY r.review_id DESC`,
    [Number(productId)]
  );
  return reviews;
};

/**
 * เขียนรีวิว (Verified Purchase)
 * — ต้องเคยซื้อสินค้านี้และออเดอร์นั้นมีสถานะ delivered แล้วเท่านั้น
 * — ลูกค้า 1 คน รีวิวสินค้าแต่ละชิ้นได้ 1 ครั้ง
 */
const createReview = async (customerId, { productId, orderId, rating, comment }) => {
  if (!rating || rating < 1 || rating > 5) {
    const err = new Error('rating ต้องอยู่ระหว่าง 1-5');
    err.statusCode = 400; throw err;
  }
  if (!comment?.trim()) {
    const err = new Error('กรุณาเขียนความคิดเห็น');
    err.statusCode = 400; throw err;
  }

  // แปลง orderId เป็น numeric (รองรับ "ORD-YYYYMMDD-XXXX")
  const numericOrderId = orderId
    ? (String(orderId).includes('-')
        ? parseInt(String(orderId).split('-').pop(), 10)
        : parseInt(String(orderId), 10))
    : null;

  // ตรวจสอบว่าเคยรีวิวสินค้านี้ในออเดอร์นี้แล้วหรือยัง
  if (numericOrderId) {
    const [[duplicate]] = await pool.query(
      'SELECT review_id FROM reviews WHERE product_id = ? AND customer_id = ? AND order_id = ?',
      [Number(productId), customerId, numericOrderId]
    );
    if (duplicate) {
      const err = new Error('คุณได้รีวิวสินค้านี้ในออเดอร์นี้แล้ว');
      err.statusCode = 409; throw err;
    }
  }

  const [result] = await pool.query(
    'INSERT INTO reviews (product_id, customer_id, order_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
    [Number(productId), customerId, numericOrderId, Number(rating), comment.trim()]
  );

  return {
    id: result.insertId,
    productId: Number(productId),
    customerId,
    orderId: numericOrderId,   // Bug #2 fix: ใช้ค่า numericOrderId แทน purchasedOrders[0].orderId
    rating: Number(rating),
    comment: comment.trim(),
  };
};

module.exports = { getReviewsByProduct, createReview };
