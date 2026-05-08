const Order  = require('../models/Order');
const Product = require('../models/Product');
const Coupon  = require('../models/Coupon');
const { sendOrderConfirmation, sendAdminNotification } = require('../services/emailService');

// ── POST /api/orders ─────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { customer, items, paymentMethod, couponCode } = req.body;
    const userId = req.user?._id || null; // nếu đã đăng nhập

    // Validate
    if (!customer?.fullName || !customer?.phone || !customer?.email || !customer?.address)
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin giao hàng.' });
    if (!/^\S+@\S+\.\S+$/.test(customer.email))
      return res.status(400).json({ message: 'Email không hợp lệ.' });
    if (!/^0\d{9}$/.test(customer.phone))
      return res.status(400).json({ message: 'Số điện thoại không hợp lệ.' });
    if (!items || items.length === 0)
      return res.status(400).json({ message: 'Giỏ hàng trống.' });

    // Verify sản phẩm + tồn kho
    const productIds = [...new Set(items.map(i => i.product))];
    const dbProducts = await Product.find({ _id: { $in: productIds } });
    const productMap = Object.fromEntries(dbProducts.map(p => [p._id.toString(), p]));

    for (const item of items) {
      const p = productMap[item.product];
      if (!p)          return res.status(400).json({ message: `Sản phẩm không tồn tại: ${item.name}` });
      if (!p.isActive) return res.status(400).json({ message: `"${p.name}" hiện không có hàng.` });
      if (p.stock < item.quantity)
        return res.status(400).json({ message: `"${p.name}" chỉ còn ${p.stock} sản phẩm.`, available: p.stock });
    }

    const verifiedItems = items.map(item => {
      const p = productMap[item.product];
      return { product: p._id, name: p.name, price: p.price, quantity: Number(item.quantity), imageURL: p.imageURL || '', category: p.category || '' };
    });

    const subtotal    = verifiedItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingFee = subtotal >= 150000 ? 0 : 20000;

    // ── Xử lý coupon ────────────────────────────────────────────────────────
    let couponData = { code: null, type: null, value: 0, discount: 0 };
    if (couponCode?.trim()) {
      const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() });
      if (!coupon || !coupon.isValid)
        return res.status(400).json({ message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.' });
      if (subtotal < coupon.minOrderValue)
        return res.status(400).json({ message: `Đơn tối thiểu ${coupon.minOrderValue.toLocaleString()}₫ để dùng mã này.` });
      if (userId) {
        const used = coupon.usedByUser(userId);
        if (used >= coupon.perUserLimit)
          return res.status(400).json({ message: 'Bạn đã dùng hết lượt cho mã này.' });
      }

      const discount = coupon.calcDiscount(subtotal);
      couponData = { code: coupon.code, type: coupon.type, value: coupon.value, discount };

      // Cập nhật usage
      const userEntry = coupon.usedBy.find(u => u.user?.toString() === userId?.toString());
      if (userId && userEntry) userEntry.count += 1;
      else if (userId)         coupon.usedBy.push({ user: userId, count: 1 });
      coupon.usedCount += 1;
      await coupon.save();
    }

    const totalPrice = Math.max(0, subtotal - couponData.discount + shippingFee);

    // Tạo đơn
    const order = await Order.create({
      user: userId,
      customer: { fullName: customer.fullName.trim(), phone: customer.phone.trim(), email: customer.email.trim().toLowerCase(), address: customer.address.trim(), province: customer.province || '', note: customer.note?.trim() || '' },
      items: verifiedItems,
      subtotal,
      coupon: couponData,
      shippingFee,
      totalPrice,
      paymentMethod: paymentMethod || 'cod',
    });

    // Trừ tồn kho (atomic)
    const stockOps = verifiedItems.map(item => ({
      updateOne: { filter: { _id: item.product, stock: { $gte: item.quantity } }, update: { $inc: { stock: -item.quantity } } },
    }));
    const stockResult = await Product.bulkWrite(stockOps);
    if (stockResult.modifiedCount < verifiedItems.length) {
      await Order.findByIdAndDelete(order._id);
      return res.status(409).json({ message: 'Một số sản phẩm vừa hết hàng. Vui lòng kiểm tra lại giỏ hàng.' });
    }

    Promise.all([
      sendOrderConfirmation(order).catch(e => console.error('Email lỗi:', e.message)),
      sendAdminNotification(order).catch(e => console.error('Admin email lỗi:', e.message)),
    ]);

    res.status(201).json({ message: 'Đặt hàng thành công!', orderCode: order.orderCode, orderId: order._id, totalPrice: order.totalPrice });
  } catch (err) {
    console.error('createOrder:', err);
    res.status(500).json({ message: 'Lỗi server khi tạo đơn hàng.' });
  }
};

// ── GET /api/orders/my — User xem lịch sử đơn của mình ─────────────────────
const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { user: req.user._id };
    if (status && status !== 'all') filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy lịch sử đơn hàng.' });
  }
};

// ── GET /api/orders/my/:id — User xem chi tiết đơn của mình ─────────────────
const getMyOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy đơn hàng.' });
  }
};

// ── GET /api/orders/track/:code — Public ─────────────────────────────────────
const trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderCode: req.params.code.trim().toUpperCase() });
    if (!order) return res.status(404).json({ message: `Không tìm thấy đơn hàng "${req.params.code}".` });
    res.json({
      orderCode: order.orderCode, status: order.status,
      statusHistory: order.statusHistory, items: order.items,
      subtotal: order.subtotal, coupon: order.coupon,
      shippingFee: order.shippingFee, totalPrice: order.totalPrice,
      paymentMethod: order.paymentMethod, paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      customer: { fullName: order.customer.fullName, phone: order.customer.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2'), province: order.customer.province },
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tra cứu.' });
  }
};

// ── Admin endpoints ───────────────────────────────────────────────────────────
const getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) filter.$or = [{ orderCode: { $regex: search, $options: 'i' } }, { 'customer.fullName': { $regex: search, $options: 'i' } }, { 'customer.phone': { $regex: search, $options: 'i' } }];
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) { res.status(500).json({ message: 'Lỗi khi lấy đơn hàng.' }); }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy.' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: 'Lỗi.' }); }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const valid = ['pending','confirmed','preparing','shipping','delivered','cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy.' });
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const ops = order.items.map(i => ({ updateOne: { filter: { _id: i.product }, update: { $inc: { stock: i.quantity } } } }));
      await Product.bulkWrite(ops);
    }
    order.status = status;
    order.statusHistory.push({ status, note: note || '', updatedBy: req.user?.username || 'admin' });
    await order.save();
    res.json({ message: 'Cập nhật thành công.', order });
  } catch (err) { res.status(500).json({ message: 'Lỗi.' }); }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy.' });
    res.json({ message: 'Đã xóa.' });
  } catch (err) { res.status(500).json({ message: 'Lỗi.' }); }
};

const getOrderStats = async (req, res) => {
  try {
    const [total, pending, confirmed, delivered, revenue] = await Promise.all([
      Order.countDocuments(), Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'confirmed' }), Order.countDocuments({ status: 'delivered' }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    ]);
    res.json({ total, pending, confirmed, delivered, revenue: revenue[0]?.total || 0 });
  } catch (err) { res.status(500).json({ message: 'Lỗi.' }); }
};

module.exports = { createOrder, getMyOrders, getMyOrderById, trackOrder, getOrders, getOrderById, updateOrderStatus, deleteOrder, getOrderStats };
