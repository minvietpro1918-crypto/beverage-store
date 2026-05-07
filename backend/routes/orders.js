const express = require('express');
const router  = express.Router();
const {
  createOrder, trackOrder, getOrders, getOrderById,
  updateOrderStatus, deleteOrder, getOrderStats,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

// ⚠️  Route tĩnh TRƯỚC route dynamic
router.get('/stats',        protect, adminOnly, getOrderStats);
router.get('/track/:code',  trackOrder);           // Public — tra cứu đơn

router.post('/',            createOrder);           // Public — tạo đơn
router.get('/',             protect, adminOnly, getOrders);
router.get('/:id',          protect, adminOnly, getOrderById);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);
router.delete('/:id',       protect, adminOnly, deleteOrder);

module.exports = router;
