# 🧋 Sip & Brew — Beverage Store

Full-stack e-commerce website bán nước uống với Next.js 14, Express.js và MongoDB. Dự án kết hợp các công nghệ hiện đại mang lại trải nghiệm tương tác mượt mà và tối ưu hóa tốt cho SEO.

---

## 📁 Cấu Trúc Dự Án

```
beverage-store/
├── backend/                    # Express.js API Server
│   ├── controllers/            # Controller logic (auth, products, users, orders)
│   ├── middleware/             # Middleware (JWT auth, adminOnly)
│   ├── models/                 # Mongoose schemas (User, Product, Order)
│   ├── routes/                 # API Routes (auth, products, users, orders)
│   ├── services/               # Services (Email service gửi thông báo, v.v.)
│   ├── seed.js                 # Seed dữ liệu mẫu
│   ├── server.js               # Entry point
│   └── package.json
│
└── frontend/                   # Next.js 14 App Router
    └── src/
        ├── app/
        │   ├── layout.jsx      # Root layout + Providers + SEO config
        │   ├── page.jsx        # Trang chủ với các section animations
        │   ├── admin/          # Khu vực Admin Dashboard
        │   └── ...
        ├── components/
        │   ├── layout/         # Navbar, Footer
        │   ├── sections/       # HeroCarousel, ScrollSequenceHero, ProductGrid, IngredientsSection, StorySection, StatsStrip
        │   └── ui/             # Preloader, MagneticButton, InfiniteMarquee, ProductCard, CartDrawer
        ├── context/            # Global states (AuthContext, CartContext)
        ├── lib/                # Config/Utils (axios, seo meta tags)
        └── styles/             # Global CSS
```

---

## 🚀 Công Nghệ Sử Dụng

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **3D & Canvas**: Three.js, React Three Fiber, React Three Drei
- **Khác**: Axios, react-hot-toast, js-cookie

### Backend
- **Framework**: Express.js (Node.js)
- **Database**: MongoDB (với Mongoose)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Services**: Nodemailer (hoặc email service tương tự)

---

## 🚀 Hướng Dẫn Chạy Dự Án

### 1. Yêu Cầu Hệ Thống
- Node.js 18+
- MongoDB (local hoặc MongoDB Atlas)

### 2. Backend

```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ mẫu (cấu hình MongoDB, JWT_SECRET, Email SMTP)
cp .env.example .env

# Seed dữ liệu mẫu (tùy chọn)
npm run seed

# Chạy server
npm run dev
```
Backend chạy tại: `http://localhost:5000`

### 3. Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env.local
cp .env.local.example .env.local

# Chạy development server
npm run dev
```
Frontend chạy tại: `http://localhost:3000`

---

## 🔑 Tài Khoản Mặc Định (sau khi seed)

| Role  | Email                      | Password  |
|-------|----------------------------|-----------|
| Admin | admin@beveragestore.com    | admin123  |
| User  | user@example.com           | user1234  |

---

## 📡 API Endpoints (Tổng Quan)

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin tài khoản hiện tại (Auth required)

### Products
- `GET /api/products` - Lấy danh sách sản phẩm (Public)
- `GET /api/products/:id` - Lấy chi tiết sản phẩm (Public)
- `POST /api/products`, `PUT`, `DELETE` - Quản lý sản phẩm (Admin Only)

### Orders (Đơn Hàng)
- `POST /api/orders` - Tạo đơn hàng mới (Public/User)
- `GET /api/orders/track/:code` - Tra cứu đơn hàng bằng mã code (Public)
- `GET /api/orders` - Danh sách toàn bộ đơn hàng (Admin)
- `GET /api/orders/stats` - Thống kê đơn hàng/doanh thu (Admin)
- `PATCH /api/orders/:id/status` - Cập nhật trạng thái đơn (Admin)

### Users
- `GET /api/users`, `PUT`, `DELETE` - Quản lý người dùng (Admin Only)

---

## ✨ Các Tính Năng Nổi Bật

**Giao Diện Khách Hàng (Customer UI)**
- 🎨 **Hiệu Ứng Nâng Cao:** Sử dụng Three.js & Framer Motion cho các trải nghiệm ấn tượng như Scroll Sequence Hero (chạy hình theo scroll), Infinite Marquee (dải chữ vô tận), và nút bấm tương tác từ tính (Magnetic Button).
- 🛒 **Trải Nghiệm Mua Sắm:** Cửa sổ giỏ hàng thông minh (Cart Drawer), hiệu ứng preloader.
- ⚡ **SEO Optimized:** Tích hợp đầy đủ cấu hình Meta Tags, Open Graph và thiết lập metadata tự động bằng utils SEO, giúp dự án sẵn sàng cho việc lập chỉ mục trên Google và chia sẻ lên MXH.

**Quản Lý (Admin Dashboard)**
- 🔐 Phân quyền chặt chẽ với JWT & Next.js Middleware.
- 📦 Quản lý thông tin, giá, danh mục sản phẩm.
- 🚚 Quản lý đơn hàng (theo dõi trạng thái, thống kê doanh thu).
- 📧 Tự động xử lý và gửi email xác nhận.

---

## 🛡️ Kiến Trúc Bảo Mật
- Hash password bằng `bcryptjs`
- Quản lý session bằng JSON Web Token (JWT) kết hợp HttpOnly Cookie & Local Storage (tuỳ chiến lược)
- Phân quyền (Role-based access) ở cả backend (middleware `adminOnly`) và frontend (Next.js middleware & layout guards)
