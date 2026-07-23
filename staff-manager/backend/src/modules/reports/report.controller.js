const reportService = require('./report.service');

/**
 * GET /api/manager/reports/sales
 */
const getSalesReport = (_req, res, next) => {
  try {
    const report = reportService.getSalesReport();
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/manager/reports/stock
 */
const getStockReport = (_req, res, next) => {
  try {
    const report = reportService.getStockReport();
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSalesReport, getStockReport };
