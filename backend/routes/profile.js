const express = require('express');
const router  = express.Router();
const { getProfile, updateProfile, changePassword, getProfileStats } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

router.use(protect); // Tất cả route đều cần đăng nhập

router.get('/',                getProfile);
router.put('/update',          updateProfile);
router.put('/change-password', changePassword);
router.get('/stats',           getProfileStats);

module.exports = router;
