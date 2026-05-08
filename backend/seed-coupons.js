/**
 * seed-coupons.js
 * Chạy: node seed-coupons.js
 * Tạo sẵn các coupon mẫu để test
 */
const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const Coupon = require('./models/Coupon');

const SAMPLE_COUPONS = [
  {
    code:          'WELCOME20',
    description:   'Giảm 20% cho khách hàng mới',
    type:          'percent',
    value:         20,
    maxDiscount:   50000,
    minOrderValue: 100000,
    usageLimit:    null,
    perUserLimit:  1,
    isActive:      true,
  },
  {
    code:          'FREESHIP',
    description:   'Miễn phí vận chuyển (giảm 20.000₫)',
    type:          'fixed',
    value:         20000,
    minOrderValue: 0,
    usageLimit:    200,
    perUserLimit:  2,
    isActive:      true,
  },
  {
    code:          'SIP50K',
    description:   'Giảm thẳng 50.000₫ cho đơn từ 200k',
    type:          'fixed',
    value:         50000,
    minOrderValue: 200000,
    usageLimit:    100,
    perUserLimit:  1,
    isActive:      true,
  },
  {
    code:          'SUMMER30',
    description:   'Khuyến mãi hè - Giảm 30% tối đa 80k',
    type:          'percent',
    value:         30,
    maxDiscount:   80000,
    minOrderValue: 150000,
    usageLimit:    500,
    perUserLimit:  1,
    endDate:       new Date('2025-09-01'),
    isActive:      true,
  },
  {
    code:          'VIP15',
    description:   'Dành cho khách VIP - Giảm 15% không giới hạn',
    type:          'percent',
    value:         15,
    minOrderValue: 0,
    usageLimit:    null,
    perUserLimit:  99,
    isActive:      true,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/beverage-store');
    console.log('✅ MongoDB connected');

    for (const data of SAMPLE_COUPONS) {
      await Coupon.findOneAndUpdate(
        { code: data.code },
        data,
        { upsert: true, new: true }
      );
      console.log(`🏷  Coupon "${data.code}" ready`);
    }

    console.log('\n✅ Seed coupons hoàn thành!');
    console.log('Dùng các mã sau để test:');
    SAMPLE_COUPONS.forEach(c => console.log(`  ${c.code.padEnd(12)} — ${c.description}`));
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
