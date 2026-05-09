const Review  = require('../models/Review');
const Order   = require('../models/Order');
const Product = require('../models/Product');

// ── GET /api/reviews/product/:productId ──────────────────────────────────────
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'newest', rating } = req.query;

    const filter = { product: productId, isVisible: true };
    if (rating) filter.rating = Number(rating);

    const sortMap = {
      newest:   { createdAt: -1 },
      oldest:   { createdAt:  1 },
      highest:  { rating: -1, createdAt: -1 },
      lowest:   { rating:  1, createdAt: -1 },
      helpful:  { helpfulCount: -1, createdAt: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find(filter).sort(sortMap[sort] || sortMap.newest).skip(skip).limit(Number(limit)),
      Review.countDocuments(filter),
    ]);

    // Phân phối sao (star distribution)
    const distribution = await Review.aggregate([
      { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(productId), isVisible: true } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);
    const dist = [5,4,3,2,1].map(star => ({
      star,
      count: distribution.find(d => d._id === star)?.count || 0,
    }));

    res.json({
      reviews,
      total,
      page:        Number(page),
      pages:       Math.ceil(total / Number(limit)),
      distribution: dist,
    });
  } catch (err) {
    console.error('getProductReviews:', err);
    res.status(500).json({ message: 'Lỗi khi lấy đánh giá.' });
  }
};

// ── POST /api/reviews — Tạo review (cần đăng nhập) ──────────────────────────
const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const userId = req.user._id;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating từ 1–5 sao.' });
    }
    if (comment.trim().length < 10) {
      return res.status(400).json({ message: 'Đánh giá tối thiểu 10 ký tự.' });
    }

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });

    // Kiểm tra đã review chưa
    const existing = await Review.findOne({ product: productId, user: userId });
    if (existing) return res.status(409).json({ message: 'Bạn đã đánh giá sản phẩm này rồi.' });

    // Kiểm tra đã mua chưa (verified purchase)
    const purchased = await Order.findOne({
      user:    userId,
      status:  { $in: ['delivered', 'shipping', 'confirmed', 'preparing'] },
      'items.product': productId,
    });

    if (!purchased) {
      return res.status(403).json({ message: 'Bạn cần mua sản phẩm này trước khi có thể đánh giá.' });
    }

    const review = await Review.create({
      product:    productId,
      user:       userId,
      username:   req.user.username,
      userEmail:  req.user.email,
      rating,
      title:      title?.trim() || '',
      comment:    comment.trim(),
      isVerified: !!purchased,
    });

    res.status(201).json({ message: 'Cảm ơn bạn đã đánh giá!', review });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Bạn đã đánh giá sản phẩm này rồi.' });
    console.error('createReview:', err);
    res.status(500).json({ message: 'Lỗi khi tạo đánh giá.' });
  }
};

// ── PUT /api/reviews/:id — Sửa review của chính mình ────────────────────────
const updateReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá.' });

    if (rating)  { review.rating  = rating;        }
    if (title)   { review.title   = title.trim();  }
    if (comment) { review.comment = comment.trim(); }
    await review.save();

    res.json({ message: 'Cập nhật đánh giá thành công.', review });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật đánh giá.' });
  }
};

// ── DELETE /api/reviews/:id — Xóa (chính mình hoặc admin) ───────────────────
const deleteReview = async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user._id };

    const review = await Review.findOneAndDelete(filter);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá.' });

    res.json({ message: 'Đã xóa đánh giá.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa đánh giá.' });
  }
};

// ── POST /api/reviews/:id/helpful — Mark helpful ────────────────────────────
const markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy.' });

    const userId  = req.user._id;
    const alreadyMarked = review.helpfulBy.includes(userId);

    if (alreadyMarked) {
      review.helpfulBy    = review.helpfulBy.filter(id => id.toString() !== userId.toString());
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      review.helpfulBy.push(userId);
      review.helpfulCount += 1;
    }

    await review.save();
    res.json({ helpful: !alreadyMarked, helpfulCount: review.helpfulCount });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi.' });
  }
};

// ── PATCH /api/reviews/:id/visibility — Admin ẩn/hiện ───────────────────────
const toggleVisibility = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy.' });
    review.isVisible = !review.isVisible;
    await review.save();
    res.json({ message: `Đánh giá đã ${review.isVisible ? 'hiện' : 'ẩn'}.`, isVisible: review.isVisible });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi.' });
  }
};

// ── GET /api/reviews/admin/all — Admin xem tất cả ───────────────────────────
const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, rating, productId } = req.query;
    const filter = {};
    if (rating)    filter.rating  = Number(rating);
    if (productId) filter.product = productId;

    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find(filter).populate('product', 'name imageURL').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Review.countDocuments(filter),
    ]);
    res.json({ reviews, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi.' });
  }
};

module.exports = {
  getProductReviews, createReview, updateReview,
  deleteReview, markHelpful, toggleVisibility, getAllReviews,
};
