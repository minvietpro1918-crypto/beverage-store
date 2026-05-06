const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  price:    { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  imageURL: { type: String, default: '' },
  category: { type: String, default: '' },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderCode: {
    type:    String,
    unique:  true,
    // Auto-generate: SB-20250501-XXXX
  },
  customer: {
    fullName: { type: String, required: true, trim: true },
    phone:    { type: String, required: true, trim: true },
    email:    { type: String, required: true, lowercase: true, trim: true },
    address:  { type: String, required: true, trim: true },
    province: { type: String, required: true },
    note:     { type: String, default: '' },
  },
  items:         { type: [orderItemSchema], required: true, validate: v => v.length > 0 },
  subtotal:      { type: Number, required: true, min: 0 },
  shippingFee:   { type: Number, default: 0, min: 0 },
  totalPrice:    { type: Number, required: true, min: 0 },
  paymentMethod: {
    type:    String,
    enum:    ['cod', 'banking', 'momo'],
    default: 'cod',
  },
  paymentStatus: {
    type:    String,
    enum:    ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  status: {
    type:    String,
    enum:    ['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled'],
    default: 'pending',
  },
  statusHistory: [{
    status:    String,
    note:      String,
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String, default: 'system' },
  }],
}, { timestamps: true });

// ─── Auto-generate orderCode before saving ─────────────────────────────────
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const date  = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Order').countDocuments();
    this.orderCode = `SB-${date}-${String(count + 1).padStart(4, '0')}`;
    // Track initial status
    this.statusHistory.push({ status: 'pending', note: 'Đơn hàng mới được tạo' });
  }
  next();
});

// ─── Indexes ────────────────────────────────────────────────────────────────
orderSchema.index({ orderCode: 1 });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
