const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://truong19122003_db_user:BhoB5bgv7LoXxOAo@cluster0.lo9sa9i.mongodb.net/beverage-store?appName=Cluster0';

const seedUsers = [
  {
    username: 'Admin',
    email: 'admin@beveragestore.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    username: 'Nguyen Van A',
    email: 'user@example.com',
    password: 'user1234',
    role: 'user',
  },
];

const seedProducts = [
  { name: 'Trà Sữa Trân Châu Đường Đen', price: 45000, description: 'Trà sữa thơm ngon với trân châu đường đen dai ngon.', imageURL: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', category: 'trà sữa', stock: 50 },
  { name: 'Trà Sữa Matcha Latte', price: 55000, description: 'Trà xanh Nhật Bản kết hợp sữa tươi béo ngậy.', imageURL: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400', category: 'trà sữa', stock: 40 },
  { name: 'Cà Phê Sữa Đá', price: 35000, description: 'Cà phê Việt Nam phin truyền thống với sữa đặc.', imageURL: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', category: 'cà phê', stock: 100 },
  { name: 'Cappuccino', price: 65000, description: 'Espresso đậm đà kết hợp foam sữa mịn mượt.', imageURL: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', category: 'cà phê', stock: 60 },
  { name: 'Nước Suối Lavie 500ml', price: 10000, description: 'Nước khoáng thiên nhiên tinh khiết.', imageURL: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400', category: 'nước suối', stock: 200 },
  { name: 'Nước Ép Cam Tươi', price: 40000, description: 'Cam vắt tươi 100%, không đường không chất bảo quản.', imageURL: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', category: 'nước ép', stock: 30 },
  { name: 'Sinh Tố Bơ', price: 50000, description: 'Sinh tố bơ sánh mịn với sữa đặc và đá xay.', imageURL: 'https://images.unsplash.com/photo-1638176067200-4bf6c36f41f0?w=400', category: 'sinh tố', stock: 25 },
  { name: 'Trà Đào Cam Sả', price: 42000, description: 'Trà trái cây thanh mát với đào, cam và sả tươi.', imageURL: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', category: 'trà trái cây', stock: 45 },
  { name: 'Hồng Trà Sữa Tươi', price: 48000, description: 'Hồng trà Assam thơm nồng kết hợp sữa tươi.', imageURL: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', category: 'trà sữa', stock: 55 },
  { name: 'Bạc Xỉu', price: 30000, description: 'Cà phê sữa truyền thống kiểu Sài Gòn, nhiều sữa ít cà phê.', imageURL: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', category: 'cà phê', stock: 80 },
  { name: 'Nước Ép Dưa Hấu', price: 35000, description: 'Dưa hấu ép tươi mát giải nhiệt ngày hè.', imageURL: 'https://images.unsplash.com/photo-1582263671151-24e5f7f5b2f4?w=400', category: 'nước ép', stock: 35 },
  { name: 'Sinh Tố Xoài Dứa', price: 45000, description: 'Kết hợp xoài và dứa tươi, vị ngọt chua hài hòa.', imageURL: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', category: 'sinh tố', stock: 20 },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users (password hashing handled by pre-save hook)
    const users = await User.create(seedUsers);
    console.log(`👥 Created ${users.length} users`);

    const products = await Product.create(seedProducts);
    console.log(`🥤 Created ${products.length} products`);

    console.log('\n✅ Seed completed!');
    console.log('📧 Admin: admin@beveragestore.com / admin123');
    console.log('📧 User:  user@example.com / user1234');
  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
