# 🧋 Sip & Brew — Beverage Store

Full-stack e-commerce website bán nước uống với Next.js 14, Express.js và MongoDB.

---

## 📁 Cấu Trúc Dự Án

```
beverage-store/
├── backend/                    # Express.js API Server
│   ├── controllers/
│   │   ├── authController.js   # Xử lý đăng ký/đăng nhập
│   │   ├── productController.js# CRUD sản phẩm
│   │   └── userController.js   # Quản lý người dùng (Admin)
│   ├── middleware/
│   │   └── auth.js             # JWT middleware + adminOnly
│   ├── models/
│   │   ├── User.js             # Schema User (bcrypt tự động hash)
│   │   └── Product.js          # Schema Product
│   ├── routes/
│   │   ├── auth.js             # POST /register, /login, GET /me
│   │   ├── products.js         # CRUD /products
│   │   └── users.js            # CRUD /users (Admin only)
│   ├── seed.js                 # Seed dữ liệu mẫu
│   ├── server.js               # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/                   # Next.js 14 App Router
    └── src/
        ├── app/
        │   ├── layout.jsx          # Root layout + Providers
        │   ├── page.jsx            # Trang chủ (danh sách sản phẩm)
        │   ├── login/page.jsx      # Trang đăng nhập
        │   ├── register/page.jsx   # Trang đăng ký
        │   └── admin/
        │       ├── layout.jsx      # Admin layout + role guard
        │       ├── page.jsx        # Dashboard tổng quan
        │       ├── products/page.jsx # Quản lý sản phẩm
        │       └── users/page.jsx    # Quản lý người dùng
        ├── components/
        │   ├── layout/Navbar.jsx   # Thanh điều hướng
        │   └── ui/
        │       ├── ProductCard.jsx # Card hiển thị sản phẩm
        │       └── CartDrawer.jsx  # Giỏ hàng slide-out
        ├── context/
        │   ├── AuthContext.jsx     # Quản lý user state toàn app
        │   └── CartContext.jsx     # Quản lý giỏ hàng toàn app
        ├── lib/
        │   └── axiosConfig.js      # Axios instance + JWT interceptor
        └── middleware.js           # Next.js route protection
```

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

# Tạo file .env từ mẫu
cp .env.example .env
# Chỉnh sửa .env với MongoDB URI và JWT Secret của bạn

# Seed dữ liệu mẫu (tùy chọn)
npm run seed

# Chạy server (development)
npm run dev

# Chạy server (production)
npm start
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

## 📡 API Endpoints

### Authentication
| Method | Endpoint           | Description          | Auth |
|--------|--------------------|----------------------|------|
| POST   | /api/auth/register | Đăng ký tài khoản    | ❌   |
| POST   | /api/auth/login    | Đăng nhập            | ❌   |
| GET    | /api/auth/me       | Lấy thông tin user   | ✅   |

### Products
| Method | Endpoint                  | Description              | Auth  |
|--------|---------------------------|--------------------------|-------|
| GET    | /api/products             | Danh sách sản phẩm       | ❌    |
| GET    | /api/products/:id         | Chi tiết sản phẩm        | ❌    |
| GET    | /api/products/admin/all   | Tất cả SP (Admin)        | Admin |
| POST   | /api/products             | Thêm sản phẩm            | Admin |
| PUT    | /api/products/:id         | Cập nhật sản phẩm        | Admin |
| DELETE | /api/products/:id         | Xóa sản phẩm             | Admin |

### Users (Admin Only)
| Method | Endpoint       | Description         | Auth  |
|--------|----------------|---------------------|-------|
| GET    | /api/users     | Danh sách users     | Admin |
| GET    | /api/users/:id | Chi tiết user       | Admin |
| PUT    | /api/users/:id | Cập nhật user       | Admin |
| DELETE | /api/users/:id | Xóa user            | Admin |

---

## 🛡️ Kiến Trúc Bảo Mật

- **Password Hashing**: bcryptjs với salt factor 12 (pre-save hook)
- **JWT**: Token 7 ngày, lưu trong Cookie + localStorage
- **Axios Interceptor**: Tự động đính kèm `Authorization: Bearer <token>`
- **Next.js Middleware**: Bảo vệ route `/admin/*` ở edge layer
- **Client-side Guard**: `AdminLayout` kiểm tra role sau khi hydrate
- **Password never returned**: `select: false` trong schema + `toJSON()` override

---

## ✨ Tính Năng

- 🛍️ Duyệt và lọc sản phẩm theo danh mục
- 🔍 Tìm kiếm sản phẩm
- 🛒 Giỏ hàng với slide drawer, cập nhật số lượng
- 🔐 Đăng ký/đăng nhập với validation đầy đủ
- 👑 Dashboard Admin: CRUD sản phẩm & người dùng
- 🍞 Toast notifications (react-hot-toast)
- 📱 Responsive design (Tailwind CSS)
- 🎨 Theme cam ấm áp, font display + body
