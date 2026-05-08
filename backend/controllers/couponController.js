const Coupon = require('../models/Coupon');

// ── POST /api/coupons/validate — Public: kiểm tra coupon ────────────────────
const validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal, userId } = req.body;

    if (!code?.trim()) return res.status(400).json({ message: 'Vui lòng nhập mã giảm giá.' });
    if (!orderTotal || orderTotal <= 0) return res.status(400).json({ message: 'Tổng đơn không hợp lệ.' });

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

    // ── Các trường hợp lỗi ────────────────────────────────────────────────
    if (!coupon)            return res.status(404).json({ message: `Mã "${code.toUpperCase()}" không tồn tại.` });
    if (!coupon.isActive)   return res.status(400).json({ message: 'Mã giảm giá đã bị vô hiệu hóa.' });

    const now = new Date();
    if (coupon.startDate && now < coupon.startDate)
      return res.status(400).json({ message: 'Mã giảm giá chưa đến thời gian sử dụng.' });
    if (coupon.endDate && now > coupon.endDate)
      return res.status(400).json({ message: 'Mã giảm giá đã hết hạn.' });
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit)
      return res.status(400).json({ message: 'Mã giảm giá đã đạt giới hạn sử dụng.' });
    if (orderTotal < coupon.minOrderValue)
      return res.status(400).json({
        message: `Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coupon.minOrderValue)} để dùng mã này.`,
      });

    // Kiểm tra per-user limit
    if (userId && coupon.perUserLimit) {
      const used = coupon.usedByUser(userId);
      if (used >= coupon.perUserLimit)
        return res.status(400).json({ message: `Bạn đã dùng mã này ${used} lần (tối đa ${coupon.perUserLimit} lần).` });
    }

    const discount = coupon.calcDiscount(orderTotal);

    res.json({
      valid:    true,
      code:     coupon.code,
      type:     coupon.type,
      value:    coupon.value,
      discount,
      finalTotal: orderTotal - discount,
      description: coupon.description ||
        (coupon.type === 'percent'
          ? `Giảm ${coupon.value}%${coupon.maxDiscount ? ` (tối đa ${new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(coupon.maxDiscount)})` : ''}`
          : `Giảm ${new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(coupon.value)}`
        ),
    });
  } catch (err) {
    console.error('validateCoupon:', err);
    res.status(500).json({ message: 'Lỗi khi kiểm tra mã giảm giá.' });
  }
};

// ── GET /api/coupons — Admin: danh sách ─────────────────────────────────────
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ coupons, total: coupons.length });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách coupon.' });
  }
};

// ── POST /api/coupons — Admin: tạo coupon ───────────────────────────────────
const createCoupon = async (req, res) => {
  try {
    const {
      code, description, type, value, maxDiscount,
      minOrderValue, usageLimit, perUserLimit,
      startDate, endDate, isActive,
    } = req.body;

    if (!code || !type || value === undefined)
      return res.status(400).json({ message: 'Mã, loại và giá trị là bắt buộc.' });
    if (type === 'percent' && (value <= 0 || value > 100))
      return res.status(400).json({ message: 'Phần trăm giảm phải từ 1–100.' });

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      description: description?.trim() || '',
      type, value,
      maxDiscount:   maxDiscount   || null,
      minOrderValue: minOrderValue || 0,
      usageLimit:    usageLimit    || null,
      perUserLimit:  perUserLimit  || 1,
      startDate:     startDate     || new Date(),
      endDate:       endDate       || null,
      isActive:      isActive !== false,
    });

    res.status(201).json({ message: 'Tạo coupon thành công.', coupon });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Mã coupon đã tồn tại.' });
    if (err.name === 'ValidationError')
      return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(', ') });
    res.status(500).json({ message: 'Lỗi khi tạo coupon.' });
  }
};

// ── PUT /api/coupons/:id — Admin: sửa ──────────────────────────────────────
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ message: 'Không tìm thấy coupon.' });
    res.json({ message: 'Cập nhật coupon thành công.', coupon });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật coupon.' });
  }
};

// ── DELETE /api/coupons/:id — Admin: xóa ───────────────────────────────────
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Không tìm thấy coupon.' });
    res.json({ message: 'Đã xóa coupon.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa coupon.' });
  }
};

module.exports = { validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon };
