const express = require('express');
const router  = express.Router();
const {
  createOrder, getMyOrders, getMyOrderById, trackOrder,
  getOrders, getOrderById, updateOrderStatus, deleteOrder, getOrderStats,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

// ── Static routes TRƯỚC dynamic ─────────────────────────────────────────────
router.get('/stats',         protect, adminOnly, getOrderStats);
router.get('/track/:code',   trackOrder);             // Public

router.get('/my',            protect, getMyOrders);   // User lịch sử
router.get('/my/:id',        protect, getMyOrderById);// User chi tiết

// Admin: danh sách — hỗ trợ ?since=ISO_DATE để poll orders mới
router.get('/', protect, adminOnly, async (req, res, next) => {
  // Nếu có ?since → lọc theo createdAt
  if (req.query.since) {
    try {
      const Order = require('../models/Order');
      const { since, status, limit = 5 } = req.query;
      const filter = { createdAt: { $gt: new Date(since) } };
      if (status) filter.status = status;
      const orders = await Order.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .select('orderCode customer.fullName totalPrice status createdAt');
      return res.json({ orders, total: orders.length });
    } catch (err) {
      return res.status(500).json({ message: 'Lỗi khi poll orders.' });
    }
  }
  return getOrders(req, res, next);
});

router.post('/',             createOrder);
router.get('/:id',           protect, adminOnly, getOrderById);
router.patch('/:id/status',  protect, adminOnly, updateOrderStatus);
router.delete('/:id',        protect, adminOnly, deleteOrder);

module.exports = router;
