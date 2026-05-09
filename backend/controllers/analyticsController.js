const Order   = require('../models/Order');
const Product = require('../models/Product');
const User    = require('../models/User');
const Review  = require('../models/Review');

// ── GET /api/analytics/overview ─────────────────────────────────────────────
const getOverview = async (req, res) => {
  try {
    const now      = new Date();
    const start30d = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const start7d  = new Date(now -  7 * 24 * 60 * 60 * 1000);
    const startPrev30d = new Date(now - 60 * 24 * 60 * 60 * 1000);

    const [
      totalRevenue, revenue30d, revenuePrev30d,
      totalOrders, orders30d, ordersPrev30d,
      totalUsers, newUsers30d,
      totalProducts, lowStockProducts,
      pendingOrders, deliveredOrders,
      avgOrderValue,
    ] = await Promise.all([
      // Revenue
      Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Order.aggregate([{ $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: start30d } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Order.aggregate([{ $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: startPrev30d, $lt: start30d } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      // Orders
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: start30d } }),
      Order.countDocuments({ createdAt: { $gte: startPrev30d, $lt: start30d } }),
      // Users
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: start30d } }),
      // Products
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ stock: { $lte: 5 }, isActive: true }),
      // Status counts
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'delivered' }),
      // Avg order
      Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, avg: { $avg: '$totalPrice' } } }]),
    ]);

    const rev30  = revenue30d[0]?.total  || 0;
    const revP30 = revenuePrev30d[0]?.total || 0;
    const revenueGrowth = revP30 > 0 ? ((rev30 - revP30) / revP30 * 100).toFixed(1) : 100;
    const orderGrowth   = ordersPrev30d > 0 ? (((orders30d - ordersPrev30d) / ordersPrev30d) * 100).toFixed(1) : 100;

    res.json({
      revenue: {
        total:    totalRevenue[0]?.total || 0,
        last30d:  rev30,
        growth:   Number(revenueGrowth),
      },
      orders: {
        total:     totalOrders,
        last30d:   orders30d,
        growth:    Number(orderGrowth),
        pending:   pendingOrders,
        delivered: deliveredOrders,
        avgValue:  Math.round(avgOrderValue[0]?.avg || 0),
      },
      users: {
        total:    totalUsers,
        new30d:   newUsers30d,
      },
      products: {
        total:    totalProducts,
        lowStock: lowStockProducts,
      },
    });
  } catch (err) {
    console.error('getOverview:', err);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê.' });
  }
};

// ── GET /api/analytics/revenue-chart?period=30 ───────────────────────────────
const getRevenueChart = async (req, res) => {
  try {
    const days  = Math.min(Number(req.query.period) || 30, 365);
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const data = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: start } } },
      {
        $group: {
          _id: {
            year:  { $year:  '$createdAt' },
            month: { $month: '$createdAt' },
            day:   { $dayOfMonth: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Fill missing days với 0
    const chart = [];
    for (let i = days - 1; i >= 0; i--) {
      const d   = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
      const found = data.find(r => r._id.year === key.year && r._id.month === key.month && r._id.day === key.day);
      chart.push({
        date:    d.toISOString().slice(0, 10),
        label:   `${key.day}/${key.month}`,
        revenue: found?.revenue || 0,
        orders:  found?.orders  || 0,
      });
    }

    res.json({ chart, period: days });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy biểu đồ doanh thu.' });
  }
};

// ── GET /api/analytics/top-products?limit=10 ─────────────────────────────────
const getTopProducts = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 20);
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const top = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: start } } },
      { $unwind: '$items' },
      {
        $group: {
          _id:      '$items.product',
          name:     { $first: '$items.name' },
          imageURL: { $first: '$items.imageURL' },
          category: { $first: '$items.category' },
          sold:     { $sum: '$items.quantity' },
          revenue:  { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: limit },
    ]);

    res.json({ top, period: '30 ngày gần nhất' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy top sản phẩm.' });
  }
};

// ── GET /api/analytics/category-breakdown ────────────────────────────────────
const getCategoryBreakdown = async (req, res) => {
  try {
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const data  = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: start } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.category', revenue: { $sum: { $multiply: ['$items.price','$items.quantity'] } }, sold: { $sum: '$items.quantity' } } },
      { $sort: { revenue: -1 } },
    ]);
    const total = data.reduce((s, d) => s + d.revenue, 0);
    const breakdown = data.map(d => ({
      category: d._id || 'Khác',
      revenue:  d.revenue,
      sold:     d.sold,
      percent:  total > 0 ? Math.round(d.revenue / total * 100) : 0,
    }));
    res.json({ breakdown, total });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy phân tích danh mục.' });
  }
};

// ── GET /api/analytics/order-status ──────────────────────────────────────────
const getOrderStatusBreakdown = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi.' });
  }
};

// ── GET /api/analytics/recent-orders?limit=8 ─────────────────────────────────
const getRecentOrders = async (req, res) => {
  try {
    const limit  = Math.min(Number(req.query.limit) || 8, 20);
    const orders = await Order.find().sort({ createdAt: -1 }).limit(limit)
      .select('orderCode customer.fullName totalPrice status createdAt items');
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi.' });
  }
};

module.exports = {
  getOverview, getRevenueChart, getTopProducts,
  getCategoryBreakdown, getOrderStatusBreakdown, getRecentOrders,
};
