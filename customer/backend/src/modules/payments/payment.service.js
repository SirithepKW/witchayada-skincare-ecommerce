const { pool } = require('../../config/store');

const PAYMENT_METHODS = ['credit_card', 'qr_code', 'bank_transfer', 'cash_on_delivery'];

/**
 * แปลง orderId ที่อาจเป็น display string "ORD-20250101-0001" หรือ numeric string
 * คืนค่า integer หรือ throw 400 ถ้า parse ไม่ได้
 */
const parseOrderId = (orderId) => {
  if (!orderId) {
    const err = new Error('กรุณาระบุ orderId'); err.statusCode = 400; throw err;
  }
  const str = String(orderId).trim();
  // รูปแบบ "ORD-YYYYMMDD-XXXX" → เอา segment สุดท้ายแล้ว parseInt
  const numericId = str.includes('-') ? parseInt(str.split('-').pop(), 10) : parseInt(str, 10);
  if (isNaN(numericId) || numericId <= 0) {
    const err = new Error(`orderId ไม่ถูกต้อง: ${orderId}`); err.statusCode = 400; throw err;
  }
  return numericId;
};

/**
 * จำลองการชำระเงิน (Simulation)
 * — ตรวจสอบ order → สร้าง payment → อัปเดต status order เป็น confirmed
 */
const checkout = async (customerId, { orderId, method }) => {
  if (!PAYMENT_METHODS.includes(method)) {
    const err = new Error(`วิธีชำระเงินไม่ถูกต้อง: ${PAYMENT_METHODS.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  // orderId จาก frontend อาจเป็น "ORD-20250101-0001" หรือ numeric
  const numericId = parseOrderId(orderId);

  const [[order]] = await pool.query(
    `SELECT order_id, customer_id, status, total_amount
     FROM orders WHERE order_id = ? AND customer_id = ?`,
    [numericId, customerId]
  );
  if (!order) {
    const err = new Error('ไม่พบคำสั่งซื้อ'); err.statusCode = 404; throw err;
  }
  if (order.status !== 'pending_payment') {
    const err = new Error(`ชำระเงินไม่ได้ (สถานะปัจจุบัน: ${order.status})`);
    err.statusCode = 400; throw err;
  }

  // เก็บเงินปลายทาง: ไม่ต้องมี payment record ใน DB, แค่ยืนยัน order
  if (method === 'cash_on_delivery') {
    await pool.query(
      'UPDATE orders SET status = "confirmed", payment_method = "cash_on_delivery" WHERE order_id = ?',
      [numericId]
    );
    return {
      paymentId: null,
      orderId,
      method: 'cash_on_delivery',
      status: 'pending_cod',
      amount: Number(order.total_amount),
      note: 'ชำระเงินเมื่อได้รับสินค้า',
    };
  }

  // สร้าง payment record
  const [payResult] = await pool.query(
    'INSERT INTO payments (order_id, method, status, amount) VALUES (?, ?, "Paid", ?)',
    [numericId, method, order.total_amount]
  );
  const paymentId = payResult.insertId;

  // อัปเดตสถานะ order → confirmed
  await pool.query(
    'UPDATE orders SET status = "confirmed" WHERE order_id = ?',
    [numericId]
  );

  return {
    paymentId,
    orderId,
    method,
    status: 'success',
    amount: Number(order.total_amount),
    paidAt: new Date().toISOString(),
  };
};

module.exports = { checkout, PAYMENT_METHODS };
