// ── routes/reviews.js ────────────────────────────────────────────────────────
const express = require('express');
const router  = express.Router();
const {
  getProductReviews, createReview, updateReview,
  deleteReview, markHelpful, toggleVisibility, getAllReviews,
} = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/auth');

// Public
router.get('/product/:productId',  getProductReviews);

// Auth required
router.post('/',                   protect, createReview);
router.put('/:id',                 protect, updateReview);
router.delete('/:id',              protect, deleteReview);
router.post('/:id/helpful',        protect, markHelpful);

// Admin only
router.get('/admin/all',           protect, adminOnly, getAllReviews);
router.patch('/:id/visibility',    protect, adminOnly, toggleVisibility);

module.exports = router;
