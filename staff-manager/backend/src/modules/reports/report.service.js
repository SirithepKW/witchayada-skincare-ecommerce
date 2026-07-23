const { findAll } = require('../../config/store');

/**
 * รายงานยอดขาย (Manager)
 * สรุปข้อมูลจาก orders ที่มีสถานะ confirmed/shipping/delivered
 */
const getSalesReport = () => {
  const orders = findAll('orders');
  const paidOrders = orders.filter((o) =>
    ['confirmed', 'shipping', 'delivered'].includes(o.status)
  );

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // นับสถานะ
  const confirmedCount = paidOrders.filter((o) => o.status === 'confirmed').length;
  const shippingCount  = paidOrders.filter((o) => o.status === 'shipping').length;
  const deliveredCount = paidOrders.filter((o) => o.status === 'delivered').length;

  // Top Products (สินค้าขายดี)
  const productMap = {};
  paidOrders.forEach((o) => {
    (o.items || []).forEach((item) => {
      const key = item.productId;
      if (!productMap[key]) {
        productMap[key] = {
          productId:    item.productId,
          productName:  item.productName,
          totalQty:     0,
          totalRevenue: 0,
        };
      }
      productMap[key].totalQty     += item.qty;
      productMap[key].totalRevenue += item.subtotal;
    });
  });

  const topProducts = Object.values(productMap)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  return {
    totalOrders:    paidOrders.length,
    totalRevenue:   Math.round(totalRevenue * 100) / 100,
    confirmedCount,
    shippingCount,
    deliveredCount,
    topProducts,
    generatedAt: new Date().toISOString(),
  };
};

/**
 * รายงานสต็อก (Manager)
 */
const getStockReport = () => {
  const products = findAll('products');
  const LOW_STOCK_THRESHOLD = 30;

  const productList = products.map((p) => ({
    productId:  p.id,
    name:       p.name,
    brand:      p.brand,
    category:   p.category,
    stockQty:   p.stockQty,
    expiryDate: p.expiryDate,
    status: p.stockQty === 0
      ? 'out'
      : p.stockQty <= LOW_STOCK_THRESHOLD
        ? 'low'
        : 'ok',
  }));

  const totalProducts    = productList.length;
  const outOfStock       = productList.filter((p) => p.status === 'out').length;
  const lowStockProducts = productList.filter((p) => p.status === 'low').length;

  return {
    totalProducts,
    lowStockProducts,
    outOfStock,
    products: productList.sort((a, b) => a.stockQty - b.stockQty),
    generatedAt: new Date().toISOString(),
  };
};

module.exports = { getSalesReport, getStockReport };
