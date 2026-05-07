const Order   = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmation, sendAdminNotification } = require('../services/emailService');

// ─── POST /api/orders — Tạo đơn hàng + TRỪ TỒN KHO ────────────────────────
const createOrder = async (req, res) => {
  try {
    const { customer, items, paymentMethod } = req.body;

    // ── Validate đầu vào ──────────────────────────────────────────────────
    if (!customer?.fullName || !customer?.phone || !customer?.email || !customer?.address) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin giao hàng.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(customer.email)) {
      return res.status(400).json({ message: 'Email không hợp lệ.' });
    }
    if (!/^0\d{9}$/.test(customer.phone)) {
      return res.status(400).json({ message: 'Số điện thoại không hợp lệ.' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống.' });
    }

    // ── Verify giá + kiểm tra tồn kho từ DB ──────────────────────────────
    const productIds = [...new Set(items.map(i => i.product))];
    const dbProducts = await Product.find({ _id: { $in: productIds } });
    const productMap = Object.fromEntries(dbProducts.map(p => [p._id.toString(), p]));

    // Kiểm tra tồn kho trước khi tạo đơn
    for (const item of items) {
      const dbProduct = productMap[item.product];
      if (!dbProduct) {
        return res.status(400).json({ message: `Sản phẩm không tồn tại: ${item.name}` });
      }
      if (!dbProduct.isActive) {
        return res.status(400).json({ message: `Sản phẩm "${dbProduct.name}" hiện không có hàng.` });
      }
      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({
          message: `"${dbProduct.name}" chỉ còn ${dbProduct.stock} sản phẩm, bạn đặt ${item.quantity}.`,
          field: 'stock',
          product: dbProduct.name,
          available: dbProduct.stock,
        });
      }
    }

    // ── Build verified items ──────────────────────────────────────────────
    const verifiedItems = items.map(item => {
      const dbProduct = productMap[item.product];
      return {
        product:  dbProduct._id,
        name:     dbProduct.name,
        price:    dbProduct.price,       // luôn dùng giá từ DB
        quantity: Math.max(1, Number(item.quantity)),
        imageURL: dbProduct.imageURL || '',
        category: dbProduct.category  || '',
      };
    });

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

    // ── TRỪ TỒN KHO (bulk write — atomic) ────────────────────────────────
    const stockOps = verifiedItems.map(item => ({
      updateOne: {
        filter: { _id: item.product, stock: { $gte: item.quantity } },
        update: { $inc: { stock: -item.quantity } },
      },
    }));
    const stockResult = await Product.bulkWrite(stockOps);

    // Nếu không trừ được hết (race condition) — rollback đơn hàng
    if (stockResult.modifiedCount < verifiedItems.length) {
      await Order.findByIdAndDelete(order._id);
      return res.status(409).json({
        message: 'Một số sản phẩm vừa hết hàng. Vui lòng kiểm tra lại giỏ hàng.',
      });
    }

    // ── Gửi email (không block response) ─────────────────────────────────
    Promise.all([
      sendOrderConfirmation(order).catch(e => console.error('Email lỗi:', e.message)),
      sendAdminNotification(order).catch(e => console.error('Admin email lỗi:', e.message)),
    ]);

    res.status(201).json({
      message:    'Đặt hàng thành công!',
      orderCode:  order.orderCode,
      orderId:    order._id,
      totalPrice: order.totalPrice,
    });
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ message: 'Lỗi server khi tạo đơn hàng.' });
  }
};

// ─── GET /api/orders/track/:code — Public tra cứu đơn ──────────────────────
const trackOrder = async (req, res) => {
  try {
    const code  = req.params.code?.trim().toUpperCase();
    const order = await Order.findOne({ orderCode: code });

    if (!order) {
      return res.status(404).json({ message: `Không tìm thấy đơn hàng "${code}". Vui lòng kiểm tra lại mã.` });
    }

    res.json({
      orderCode:     order.orderCode,
      status:        order.status,
      statusHistory: order.statusHistory,
      items:         order.items,
      subtotal:      order.subtotal,
      shippingFee:   order.shippingFee,
      totalPrice:    order.totalPrice,
      shippingFee:   order.shippingFee,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt:     order.createdAt,
      updatedAt:     order.updatedAt,
      customer: {
        fullName: order.customer.fullName,
        phone:    order.customer.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2'),
        province: order.customer.province,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tra cứu đơn hàng.' });
  }
};

// ─── GET /api/orders — Admin: danh sách ─────────────────────────────────────
const getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { orderCode:           { $regex: search, $options: 'i' } },
        { 'customer.fullName': { $regex: search, $options: 'i' } },
        { 'customer.phone':    { $regex: search, $options: 'i' } },
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

// ─── GET /api/orders/:id — Admin ────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy đơn hàng.' });
  }
};

// ─── PATCH /api/orders/:id/status — Admin cập nhật trạng thái ──────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const valid = ['pending','confirmed','preparing','shipping','delivered','cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });

    // Nếu hủy đơn → hoàn lại tồn kho
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const restoreOps = order.items.map(item => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: item.quantity } },
        },
      }));
      await Product.bulkWrite(restoreOps);
    }

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

// ─── DELETE /api/orders/:id — Admin ────────────────────────────────────────
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    res.json({ message: 'Đã xóa đơn hàng.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa đơn hàng.' });
  }
};

// ─── GET /api/orders/stats ──────────────────────────────────────────────────
const getOrderStats = async (req, res) => {
  try {
    const [total, pending, confirmed, delivered, revenue] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'confirmed' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    ]);
    res.json({ total, pending, confirmed, delivered, revenue: revenue[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy thống kê.' });
  }
};

module.exports = {
  createOrder, trackOrder, getOrders, getOrderById,
  updateOrderStatus, deleteOrder, getOrderStats,
};
