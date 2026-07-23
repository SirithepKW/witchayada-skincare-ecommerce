const { findAll, findOne, create, update } = require('../../config/store');

const CARRIERS = ['Kerry Express', 'Flash Express', 'Thailand Post'];
const SHIPMENT_STATUSES = ['pending', 'in_transit', 'delivered'];

/**
 * บันทึกข้อมูลการจัดส่ง (Staff)
 */
const createShipment = ({ orderId, trackingNumber, carrier }) => {
  if (!orderId || !trackingNumber || !carrier) {
    const err = new Error('กรุณาระบุ orderId, trackingNumber และ carrier');
    err.statusCode = 400;
    throw err;
  }

  if (!CARRIERS.includes(carrier)) {
    const err = new Error(`carrier ไม่ถูกต้อง ต้องเป็นหนึ่งใน: ${CARRIERS.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  // ตรวจสอบว่ามี orderId นี้ใน orders แล้ว
  const existing = findOne('shipments', (s) => s.orderId === orderId);
  if (existing) {
    const err = new Error(`ออเดอร์ ${orderId} มีข้อมูลการจัดส่งอยู่แล้ว`);
    err.statusCode = 409;
    throw err;
  }

  return create('shipments', {
    orderId,
    trackingNumber,
    carrier,
    status: 'in_transit',
    shippedAt: new Date().toISOString(),
    deliveredAt: null,
  });
};

/**
 * ดูข้อมูลการจัดส่งทั้งหมด
 */
const getAllShipments = () => {
  return findAll('shipments');
};

/**
 * ดูข้อมูลการจัดส่งตาม orderId
 */
const getShipmentByOrderId = (orderId) => {
  const shipment = findOne('shipments', (s) => s.orderId === orderId);
  if (!shipment) {
    const err = new Error('ไม่พบข้อมูลการจัดส่ง');
    err.statusCode = 404;
    throw err;
  }
  return shipment;
};

module.exports = { createShipment, getAllShipments, getShipmentByOrderId, CARRIERS, SHIPMENT_STATUSES };
