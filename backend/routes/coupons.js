// ── routes/coupons.js ────────────────────────────────────────────────────────
const express  = require('express');
const router   = express.Router();
const { validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/couponController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/validate',  validateCoupon);              // Public
router.get('/',           protect, adminOnly, getCoupons);
router.post('/',          protect, adminOnly, createCoupon);
router.put('/:id',        protect, adminOnly, updateCoupon);
router.delete('/:id',     protect, adminOnly, deleteCoupon);

module.exports = router;
