const { findAll, findById, update } = require('../../config/store');

const ORDER_STATUSES = ['pending_payment', 'confirmed', 'shipping', 'delivered'];

/**
 * ดูออเดอร์ทั้งหมด (Staff)
 * รองรับ filter: status, customerId
 */
const getAllOrders = ({ status, customerId } = {}) => {
  return findAll('orders', (o) => {
    if (status && o.status !== status) return false;
    if (customerId && o.customerId !== parseInt(customerId)) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * อัปเดตสถานะออเดอร์ (Staff)
 */
const updateOrderStatus = (id, newStatus) => {
  if (!ORDER_STATUSES.includes(newStatus)) {
    const err = new Error(`สถานะไม่ถูกต้อง ต้องเป็นหนึ่งใน: ${ORDER_STATUSES.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  const order = findById('orders', parseInt(id));
  if (!order) {
    const err = new Error('ไม่พบคำสั่งซื้อ');
    err.statusCode = 404;
    throw err;
  }

  // ตรวจสอบลำดับ status
  const currentIdx = ORDER_STATUSES.indexOf(order.status);
  const newIdx     = ORDER_STATUSES.indexOf(newStatus);
  if (newIdx < currentIdx) {
    const err = new Error(`ไม่สามารถเปลี่ยนสถานะย้อนกลับได้ (ปัจจุบัน: ${order.status})`);
    err.statusCode = 400;
    throw err;
  }

  return update('orders', parseInt(id), {
    status: newStatus,
    updatedAt: new Date().toISOString(),
  });
};

module.exports = { getAllOrders, updateOrderStatus, ORDER_STATUSES };
