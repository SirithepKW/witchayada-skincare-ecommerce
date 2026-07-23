const paymentService = require('./payment.service');

/**
 * POST /api/payments/checkout
 * body: { orderId, method }
 */
const checkout = async (req, res, next) => {
  try {
    const { orderId, method } = req.body;
    if (!orderId || !method) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุ orderId และ method' });
    }
    const payment = await paymentService.checkout(req.user.customerId, { orderId, method });
    res.status(201).json({
      success: true,
      message: 'ชำระเงินสำเร็จ',
      data: payment,
    });
  } catch (err) { next(err); }
};

module.exports = { checkout };
