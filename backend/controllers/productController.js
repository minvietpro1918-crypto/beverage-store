const Product = require('../models/Product');

// ─── GET /api/products — Public danh sách ──────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search)   filter.$text    = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);
    res.json({
      products,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm.' });
  }
};

// ─── GET /api/products/:id — Public chi tiết sản phẩm ──────────────────────
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true });
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });

    // Lấy sản phẩm liên quan cùng danh mục (tối đa 4)
    const related = await Product.find({
      _id:      { $ne: product._id },
      category: product.category,
      isActive: true,
    }).limit(4).select('name price imageURL category stock');

    res.json({ product, related });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy sản phẩm.' });
  }
};

// ─── GET /api/products/admin/all — Admin ────────────────────────────────────
const getAllProductsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search)   filter.$text    = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);
    res.json({ products, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm.' });
  }
};

// ─── POST /api/products — Admin thêm ───────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const { name, price, description, imageURL, category, stock } = req.body;
    if (!name || price === undefined || !category) {
      return res.status(400).json({ message: 'Tên, giá và danh mục là bắt buộc.' });
    }
    if (price < 0) return res.status(400).json({ message: 'Giá không thể âm.' });
    const product = await Product.create({ name, price, description, imageURL, category, stock: stock || 0 });
    res.status(201).json({ message: 'Thêm sản phẩm thành công.', product });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: 'Lỗi khi thêm sản phẩm.' });
  }
};

// ─── PUT /api/products/:id — Admin sửa ─────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
    res.json({ message: 'Cập nhật thành công.', product });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm.' });
  }
};

// ─── DELETE /api/products/:id — Admin xóa ──────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
    res.json({ message: 'Đã xóa sản phẩm.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm.' });
  }
};

module.exports = { getProducts, getProductById, getAllProductsAdmin, createProduct, updateProduct, deleteProduct };
