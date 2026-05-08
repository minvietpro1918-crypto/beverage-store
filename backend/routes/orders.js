const express = require('express');
const router  = express.Router();
const {
  createOrder, getMyOrders, getMyOrderById, trackOrder,
  getOrders, getOrderById, updateOrderStatus, deleteOrder, getOrderStats,
} = require('../controllers/orderController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

// ⚠️ Tĩnh trước dynamic
router.get('/stats',         protect, adminOnly, getOrderStats);
router.get('/track/:code',   trackOrder);                        // Public

router.get('/my',            protect, getMyOrders);              // User lịch sử
router.get('/my/:id',        protect, getMyOrderById);           // User chi tiết

router.post('/',             optionalAuth, createOrder);         // Public (có thể có token)
router.get('/',              protect, adminOnly, getOrders);
router.get('/:id',           protect, adminOnly, getOrderById);
router.patch('/:id/status',  protect, adminOnly, updateOrderStatus);
router.delete('/:id',        protect, adminOnly, deleteOrder);

module.exports = router;
