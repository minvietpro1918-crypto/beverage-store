const Product = require('../models/Product');

// ─── GET /api/products ────────────────────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error('getProducts error:', err);
    res.status(500).json({ message: 'Failed to fetch products.' });
  }
};

// ─── GET /api/products/:id ────────────────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product.' });
  }
};

// ─── POST /api/products (Admin) ───────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const { name, price, description, imageURL, category, stock } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required.' });
    }
    if (price < 0) return res.status(400).json({ message: 'Price cannot be negative.' });

    const product = await Product.create({ name, price, description, imageURL, category, stock });
    res.status(201).json({ message: 'Product created.', product });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: 'Failed to create product.' });
  }
};

// ─── PUT /api/products/:id (Admin) ───────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product updated.', product });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: 'Failed to update product.' });
  }
};

// ─── DELETE /api/products/:id (Admin) ────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product.' });
  }
};

// ─── GET /api/products/admin/all (Admin - includes inactive) ─────────────────
const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ products, total: products.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products.' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getAllProductsAdmin };
