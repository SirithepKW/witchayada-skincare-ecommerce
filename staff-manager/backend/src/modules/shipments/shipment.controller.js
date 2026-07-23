const shipmentService = require('./shipment.service');

/**
 * POST /api/staff/shipments
 */
const createShipment = (req, res, next) => {
  try {
    const { orderId, trackingNumber, carrier } = req.body;
    const shipment = shipmentService.createShipment({ orderId, trackingNumber, carrier });
    res.status(201).json({ success: true, data: shipment });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/staff/shipments
 */
const getAllShipments = (_req, res, next) => {
  try {
    const shipments = shipmentService.getAllShipments();
    res.json({ success: true, data: shipments, total: shipments.length });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/staff/shipments/:orderId
 */
const getShipmentByOrderId = (req, res, next) => {
  try {
    const shipment = shipmentService.getShipmentByOrderId(req.params.orderId);
    res.json({ success: true, data: shipment });
  } catch (err) {
    next(err);
  }
};

module.exports = { createShipment, getAllShipments, getShipmentByOrderId };
