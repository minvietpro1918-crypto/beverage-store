const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmation, sendAdminNotification } = require('../services/emailService');

// ─── POST /api/orders — Tạo đơn hàng ───────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { customer, items, paymentMethod, note } = req.body;

    // ── Validate đầu vào ──────────────────────────────────────────────────
    if (!customer?.fullName || !customer?.phone || !customer?.email || !customer?.address) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin giao hàng.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(customer.email)) {
      return res.status(400).json({ message: 'Email không hợp lệ.' });
    }
    if (!/^0\d{9}$/.test(customer.phone)) {
      return res.status(400).json({ message: 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0).' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống.' });
    }

    // ── Verify giá từ DB (không tin client) ──────────────────────────────
    const productIds  = items.map(i => i.product);
    const dbProducts  = await Product.find({ _id: { $in: productIds } });
    const productMap  = Object.fromEntries(dbProducts.map(p => [p._id.toString(), p]));

    const verifiedItems = [];
    for (const item of items) {
      const dbProduct = productMap[item.product];
      if (!dbProduct) return res.status(400).json({ message: `Sản phẩm không tồn tại: ${item.name}` });
      verifiedItems.push({
        product:  dbProduct._id,
        name:     dbProduct.name,
        price:    dbProduct.price,           // luôn dùng giá từ DB
        quantity: Math.max(1, Number(item.quantity)),
        imageURL: dbProduct.imageURL || '',
        category: dbProduct.category || '',
      });
    }

    // ── Tính giá ──────────────────────────────────────────────────────────
    const subtotal    = verifiedItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingFee = subtotal >= 150000 ? 0 : 20000;
    const totalPrice  = subtotal + shippingFee;

    // ── Tạo order ─────────────────────────────────────────────────────────
    const order = await Order.create({
      customer: {
        fullName: customer.fullName.trim(),
        phone:    customer.phone.trim(),
        email:    customer.email.trim().toLowerCase(),
        address:  customer.address.trim(),
        province: customer.province || '',
        note:     customer.note?.trim() || '',
      },
      items: verifiedItems,
      subtotal,
      shippingFee,
      totalPrice,
      paymentMethod: paymentMethod || 'cod',
    });

    // ── Gửi email (không block response) ─────────────────────────────────
    Promise.all([
      sendOrderConfirmation(order).catch(err => console.error('Email lỗi:', err.message)),
      sendAdminNotification(order).catch(err => console.error('Admin email lỗi:', err.message)),
    ]);

    res.status(201).json({
      message:   'Đặt hàng thành công!',
      orderCode: order.orderCode,
      orderId:   order._id,
      totalPrice: order.totalPrice,
    });
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ message: 'Lỗi server khi tạo đơn hàng.' });
  }
};

// ─── GET /api/orders — Admin: danh sách đơn hàng ───────────────────────────
const getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { orderCode:              { $regex: search, $options: 'i' } },
        { 'customer.fullName':    { $regex: search, $options: 'i' } },
        { 'customer.phone':       { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn hàng.' });
  }
};

// ─── GET /api/orders/:id ────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy đơn hàng.' });
  }
};

// ─── GET /api/orders/track/:code — Khách tra cứu đơn ──────────────────────
const trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderCode: req.params.code.toUpperCase() });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    // Chỉ trả về thông tin cần thiết (ẩn thông tin nhạy cảm)
    res.json({
      orderCode:     order.orderCode,
      status:        order.status,
      statusHistory: order.statusHistory,
      items:         order.items,
      totalPrice:    order.totalPrice,
      shippingFee:   order.shippingFee,
      paymentMethod: order.paymentMethod,
      createdAt:     order.createdAt,
      customer: {
        fullName: order.customer.fullName,
        phone:    order.customer.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2'), // mask phone
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tra cứu đơn hàng.' });
  }
};

// ─── PATCH /api/orders/:id/status — Admin cập nhật trạng thái ──────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['pending','confirmed','preparing','shipping','delivered','cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });

    order.status = status;
    order.statusHistory.push({
      status,
      note:      note || '',
      updatedBy: req.user?.username || 'admin',
    });
    await order.save();

    res.json({ message: 'Cập nhật trạng thái thành công.', order });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái.' });
  }
};

// ─── DELETE /api/orders/:id — Admin xóa đơn ────────────────────────────────
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    res.json({ message: 'Đã xóa đơn hàng.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa đơn hàng.' });
  }
};

// ─── GET /api/orders/stats — Admin dashboard stats ─────────────────────────
const getOrderStats = async (req, res) => {
  try {
    const [total, pending, confirmed, delivered, revenue] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'confirmed' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    ]);
    res.json({
      total, pending, confirmed, delivered,
      revenue: revenue[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy thống kê.' });
  }
};

module.exports = { createOrder, getOrders, getOrderById, trackOrder, updateOrderStatus, deleteOrder, getOrderStats };
