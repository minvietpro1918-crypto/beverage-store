// app/checkout/metadata.js
// Import vào checkout/page.jsx bằng: export { metadata } from './metadata'
// hoặc copy trực tiếp vào page.jsx

import { buildMetadata } from '@/lib/seo';

// ── Checkout ──────────────────────────────────────────────────────────────
export const checkoutMetadata = buildMetadata({
  title:    'Thanh Toán Đơn Hàng',
  url:      '/checkout',
  noindex:  true, // không index trang checkout
});

// ── Search ────────────────────────────────────────────────────────────────
export const searchMetadata = buildMetadata({
  title:       'Tìm Kiếm Thức Uống',
  description: 'Tìm kiếm trà sữa, cà phê, nước ép và các loại thức uống tươi ngon tại Sip & Brew.',
  url:         '/search',
  keywords:    ['tìm kiếm thức uống', 'menu trà sữa', 'menu cà phê'],
});

// ── Login ─────────────────────────────────────────────────────────────────
export const loginMetadata = buildMetadata({
  title:   'Đăng Nhập',
  url:     '/login',
  noindex: true,
});

// ── Register ──────────────────────────────────────────────────────────────
export const registerMetadata = buildMetadata({
  title:   'Đăng Ký Tài Khoản',
  url:     '/register',
  noindex: true,
});

// ── Order Success ─────────────────────────────────────────────────────────
export const orderSuccessMetadata = buildMetadata({
  title:   'Đặt Hàng Thành Công',
  url:     '/order-success',
  noindex: true,
});
