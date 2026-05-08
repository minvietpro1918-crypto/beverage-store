const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type:     String,
    required: true,
    unique:   true,
    uppercase: true,
    trim:     true,
    match:    [/^[A-Z0-9_-]{3,20}$/, 'Mã coupon chỉ gồm chữ hoa, số, gạch ngang (3-20 ký tự)'],
  },
  description: { type: String, default: '' },

  type: {
    type:    String,
    enum:    ['percent', 'fixed'],   // percent = %, fixed = số tiền cố định
    default: 'percent',
  },
  value: {
    type: Number,
    required: true,
    min: [0, 'Giá trị không thể âm'],
  },
  // Giảm tối đa (chỉ áp dụng cho type=percent)
  maxDiscount: { type: Number, default: null },

  // Đơn tối thiểu để dùng coupon
  minOrderValue: { type: Number, default: 0 },

  // Số lần dùng
  usageLimit:   { type: Number, default: null },   // null = không giới hạn
  usedCount:    { type: Number, default: 0 },

  // Mỗi user chỉ dùng tối đa N lần
  perUserLimit: { type: Number, default: 1 },

  // Danh sách user đã dùng (lưu userId + số lần)
  usedBy: [{
    user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    count: { type: Number, default: 1 },
  }],

  isActive:  { type: Boolean, default: true },
  startDate: { type: Date,    default: Date.now },
  endDate:   { type: Date,    default: null },   // null = không hết hạn
}, { timestamps: true });

// ── Index ──────────────────────────────────────────────────────────────────
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, endDate: 1 });

// ── Virtual: còn hiệu lực không ───────────────────────────────────────────
couponSchema.virtual('isValid').get(function () {
  if (!this.isActive) return false;
  const now = new Date();
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate   && now > this.endDate)   return false;
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) return false;
  return true;
});

// ── Method: tính số tiền giảm ─────────────────────────────────────────────
couponSchema.methods.calcDiscount = function (orderTotal) {
  if (this.type === 'percent') {
    const discount = Math.round(orderTotal * this.value / 100);
    return this.maxDiscount ? Math.min(discount, this.maxDiscount) : discount;
  }
  return Math.min(this.value, orderTotal); // fixed không vượt quá tổng đơn
};

// ── Method: kiểm tra user đã dùng chưa ────────────────────────────────────
couponSchema.methods.usedByUser = function (userId) {
  const entry = this.usedBy.find(u => u.user?.toString() === userId?.toString());
  return entry?.count || 0;
};

module.exports = mongoose.model('Coupon', couponSchema);
