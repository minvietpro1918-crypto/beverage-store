const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type:      String,
    required:  [true, 'Tên sản phẩm là bắt buộc'],
    trim:      true,
    maxlength: [100, 'Tên không vượt quá 100 ký tự'],
  },
  price: {
    type:    Number,
    required:[true, 'Giá là bắt buộc'],
    min:     [0,    'Giá không thể âm'],
  },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  imageURL:    { type: String, default: '' },
  category: {
    type:    String,
    required:[true, 'Danh mục là bắt buộc'],
    enum: {
      values:  ['trà sữa','cà phê','nước suối','nước ép','sinh tố','trà trái cây','khác'],
      message: '{VALUE} không hợp lệ',
    },
  },
  stock:    { type: Number, default: 0, min: [0, 'Tồn kho không thể âm'] },
  isActive: { type: Boolean, default: true },

  // ── Rating fields (được tính tự động bởi Review model) ──────────────────
  avgRating:    { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ avgRating: -1 });

module.exports = mongoose.model('Product', productSchema);
