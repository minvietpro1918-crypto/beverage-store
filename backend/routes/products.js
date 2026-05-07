const express = require('express');
const router  = express.Router();
const {
  getProducts, getProductById, getAllProductsAdmin,
  createProduct, updateProduct, deleteProduct,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

// ⚠️  Quan trọng: route tĩnh phải đứng TRƯỚC route dynamic /:id
router.get('/admin/all',  protect, adminOnly, getAllProductsAdmin); // TRƯỚC /:id
router.get('/',           getProducts);
router.get('/:id',        getProductById);   // SAU /admin/all

router.post('/',          protect, adminOnly, createProduct);
router.put('/:id',        protect, adminOnly, updateProduct);
router.delete('/:id',     protect, adminOnly, deleteProduct);

module.exports = router;
