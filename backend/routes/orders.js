const express = require('express');
const router  = express.Router();
const {
  createOrder, getOrders, getOrderById,
  trackOrder, updateOrderStatus, deleteOrder, getOrderStats,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

// Public
router.post('/',                  createOrder);               // Đặt hàng
router.get('/track/:code',        trackOrder);                // Tra cứu đơn

// Admin only
router.get('/stats',              protect, adminOnly, getOrderStats);
router.get('/',                   protect, adminOnly, getOrders);
router.get('/:id',                protect, adminOnly, getOrderById);
router.patch('/:id/status',       protect, adminOnly, updateOrderStatus);
router.delete('/:id',             protect, adminOnly, deleteOrder);

module.exports = router;
