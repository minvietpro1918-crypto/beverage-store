const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Product',
    required: true,
    index:    true,
  },
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  // Denormalize để hiển thị nhanh, không cần populate
  username:  { type: String, required: true },
  userEmail: { type: String, required: true },

  rating: {
    type:     Number,
    required: true,
    min:      [1, 'Rating tối thiểu 1 sao'],
    max:      [5, 'Rating tối đa 5 sao'],
  },
  title:   { type: String, trim: true, maxlength: 100, default: '' },
  comment: {
    type:      String,
    required:  [true, 'Nội dung đánh giá không được để trống'],
    trim:      true,
    minlength: [10, 'Đánh giá tối thiểu 10 ký tự'],
    maxlength: [1000, 'Đánh giá tối đa 1000 ký tự'],
  },

  // Đã mua sản phẩm này chưa (verified purchase)
  isVerified: { type: Boolean, default: false },

  // Like / helpful
  helpfulCount: { type: Number, default: 0 },
  helpfulBy:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  isVisible: { type: Boolean, default: true },  // Admin có thể ẩn
}, { timestamps: true });

// ── Mỗi user chỉ review 1 lần / 1 sản phẩm ────────────────────────────────
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ product: 1, rating: 1 });

// ── Static: tính lại avgRating sau khi save/delete ──────────────────────────
reviewSchema.statics.calcProductRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId, isVisible: true } },
    { $group: {
        _id:         '$product',
        avgRating:   { $avg: '$rating' },
        totalReviews:{ $sum: 1 },
        dist: {
          $push: '$rating'   // dùng để tính distribution
        },
    }},
  ]);

  const Product = mongoose.model('Product');
  if (result.length > 0) {
    const { avgRating, totalReviews } = result[0];
    await Product.findByIdAndUpdate(productId, {
      avgRating:    Math.round(avgRating * 10) / 10,
      totalReviews,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { avgRating: 0, totalReviews: 0 });
  }
};

reviewSchema.post('save',             function () { this.constructor.calcProductRating(this.product); });
reviewSchema.post('findOneAndDelete', function (doc) { if (doc) doc.constructor.calcProductRating(doc.product); });

module.exports = mongoose.model('Review', reviewSchema);
