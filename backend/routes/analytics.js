// ── routes/analytics.js ──────────────────────────────────────────────────────
const express = require('express');
const router  = express.Router();
const {
  getOverview, getRevenueChart, getTopProducts,
  getCategoryBreakdown, getOrderStatusBreakdown, getRecentOrders,
} = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/auth');

// Tất cả analytics route đều cần Admin
router.use(protect, adminOnly);

router.get('/overview',          getOverview);
router.get('/revenue-chart',     getRevenueChart);
router.get('/top-products',      getTopProducts);
router.get('/category-breakdown',getCategoryBreakdown);
router.get('/order-status',      getOrderStatusBreakdown);
router.get('/recent-orders',     getRecentOrders);

module.exports = router;
