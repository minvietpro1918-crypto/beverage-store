const User    = require('../models/User');
const bcrypt  = require('bcryptjs');

// ── GET /api/profile/me ──────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin.' });
  }
};

// ── PUT /api/profile/update ──────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username?.trim()) {
      return res.status(400).json({ message: 'Tên người dùng không được để trống.' });
    }
    if (username.trim().length < 2) {
      return res.status(400).json({ message: 'Tên tối thiểu 2 ký tự.' });
    }
    if (username.trim().length > 30) {
      return res.status(400).json({ message: 'Tên tối đa 30 ký tự.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username: username.trim() },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Cập nhật thông tin thành công.', user });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật thông tin.' });
  }
};

// ── PUT /api/profile/change-password ────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ message: 'Mật khẩu phải từ 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp.' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'Mật khẩu mới phải khác mật khẩu cũ.' });
    }

    // Lấy user với password (select: false trong schema)
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng.' });
    }

    user.password = newPassword; // pre-save hook sẽ tự hash
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi đổi mật khẩu.' });
  }
};

// ── GET /api/profile/stats ───────────────────────────────────────────────────
const getProfileStats = async (req, res) => {
  try {
    const Order  = require('../models/Order');
    const Review = require('../models/Review');

    const [totalOrders, delivered, totalSpent, totalReviews] = await Promise.all([
      Order.countDocuments({ user: req.user._id }),
      Order.countDocuments({ user: req.user._id, status: 'delivered' }),
      Order.aggregate([
        { $match: { user: req.user._id, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Review.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      totalOrders,
      delivered,
      totalSpent: totalSpent[0]?.total || 0,
      totalReviews,
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy thống kê.' });
  }
};

module.exports = { getProfile, updateProfile, changePassword, getProfileStats };
