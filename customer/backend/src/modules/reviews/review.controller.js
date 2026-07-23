const reviewService = require('./review.service');

/**
 * GET /api/reviews/:productId
 */
const getReviews = async (req, res, next) => {
  try {
    const reviews = await reviewService.getReviewsByProduct(req.params.productId);
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) { next(err); }
};

/**
 * POST /api/reviews
 * body: { productId, orderId (optional), rating, comment }
 */
const createReview = async (req, res, next) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ productId, rating และ comment',
      });
    }
    const review = await reviewService.createReview(req.user.customerId, { productId, orderId, rating, comment });
    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
};

module.exports = { getReviews, createReview };
