# 🧋 Sip & Brew — Beverage Store

Sip & Brew is a full-stack e-commerce application for a beverage store. Built with Next.js 14 (App Router), Express.js, and MongoDB, this project focuses on delivering a smooth, highly interactive user experience with advanced animations and SEO optimization.

---

## ✨ Features

### Customer Experience
- **Interactive UI**: Engaging user interfaces using Framer Motion, magnetic buttons, infinite marquees, and a scroll-based image sequence animation.
- **Product Discovery**: Browse products, search functionality, and detailed product pages with reviews and star ratings.
- **Shopping Cart**: Smart cart drawer for easy management of selected items.
- **Checkout & Orders**: Seamless checkout process, support for discount coupons, and real-time order tracking using an order code.
- **User Accounts**: Registration, login, profile management, and order history (My Orders).
- **Profile Management**: Update user details, change password, and view personalized order statistics.
- **Email Notifications**: Automated email confirmations for customers and new order notifications for admins (via Nodemailer).
- **SEO Optimized**: Fully integrated SEO metadata, robots.txt, and dynamic sitemap generation.
- **Loading & Error Handling**: Custom loading screens and 404 (Not Found) pages for better user experience.

### Admin Capabilities
- **Admin Dashboard**: Comprehensive analytics and sales statistics.
- **Product Management**: Create, update, and delete products.
- **Order Management**: Track orders, update order statuses, and view order details.
- **User & Coupon Management**: Manage customer accounts and promotional discount coupons.
- **Security**: Protected admin routes using JWT and Next.js middleware.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State/Data**: React Context API, Axios, react-hot-toast, js-cookie

### Backend
- **Framework**: Express.js (Node.js)
- **Database**: MongoDB (with Mongoose)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Services**: Nodemailer (for email notifications)

---

## 📁 Project Structure

```
beverage-store/
├── backend/                    # Express.js REST API
│   ├── controllers/            # Logic for analytics, auth, coupons, orders, products, profile, reviews, users
│   ├── middleware/             # Auth and admin-only protection
│   ├── models/                 # Mongoose schemas (Coupon, Order, Product, Review, User)
│   ├── routes/                 # API endpoints
│   ├── services/               # External services (Email)
│   ├── seed.js                 # Database seeder
│   └── server.js               # Entry point
│
└── frontend/                   # Next.js 14 Application
    ├── src/
    │   ├── app/                # Pages (admin, checkout, login, my-orders, products, profile, search, track, etc.)
    │   ├── components/         
    │   │   ├── layout/         # Navigation and Footer
    │   │   ├── sections/       # HeroCarousel, ProductGrid, ReviewSection, ScrollSequenceHero, etc.
    │   │   └── ui/             # CartDrawer, CouponInput, MagneticButton, ProductCard, StarRating, etc.
    │   ├── context/            # Global context providers
    │   └── lib/                # Utilities and API configurations
    └── public/                 # Static assets and animation frames
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- MongoDB (local instance or MongoDB Atlas URI)

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file from example
cp .env.example .env
# Make sure to update the .env with your MongoDB URI, JWT Secret, and Email SMTP credentials

# (Optional) Seed the database with sample data
npm run seed

# Start the development server
npm run dev
```
The backend API will run at: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file from example
cp .env.local.example .env.local
# Make sure NEXT_PUBLIC_API_URL points to your backend (e.g., http://localhost:5000/api)

# Start the development server
npm run dev
```
The frontend will run at: `http://localhost:3000`

---

## 🔑 Default Accounts (After Seeding)

| Role  | Email                      | Password  |
|-------|----------------------------|-----------|
| Admin | admin@beveragestore.com    | admin123  |
| User  | user@example.com           | user1234  |

---

## 📡 Key API Endpoints

### Authentication & Users
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user & get token
- `GET /api/auth/me` - Get current user profile
- `GET /api/users` - Manage users (Admin)

### Profile (New)
- `GET /api/profile` - Get logged-in user profile
- `PUT /api/profile/update` - Update user details
- `PUT /api/profile/change-password` - Change account password
- `GET /api/profile/stats` - View personal order statistics

### Products & Reviews
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Add new product (Admin)
- `POST /api/reviews` - Add a review to a product
- `GET /api/reviews/product/:productId` - Get reviews for a product

### Orders & Checkout
- `POST /api/orders` - Create a new order
- `GET /api/orders/track/:code` - Track order by tracking code
- `GET /api/orders/my-orders` - Get logged-in user's orders
- `GET /api/orders` - List all orders (Admin)
- `PATCH /api/orders/:id/status` - Update order status (Admin)

### Coupons & Analytics
- `GET /api/coupons/:code` - Validate a discount coupon
- `POST /api/coupons` - Create a new coupon (Admin)
- `GET /api/analytics/dashboard` - Get dashboard stats and charts (Admin)

