'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
// 1. THÊM IMPORT: Hook thông báo từ Layout 2
import { useAdminNotifications } from '@/lib/useAdminNotifications';

export default function AdminLayout({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 2. THÊM LOGIC: Khởi tạo hook thông báo
  const { newOrderCount, clearCount, start, stop } = useAdminNotifications();

  // 3. THÊM LOGIC: Bắt đầu polling khi admin đăng nhập
  useEffect(() => {
    if (user && isAdmin) {
      start();
    } else {
      stop();
    }
    return () => stop();
  }, [user, isAdmin]);

  // 4. THÊM LOGIC: Xóa badge khi vào trang orders
  useEffect(() => {
    if (pathname === '/admin/orders' && newOrderCount > 0) {
      clearCount();
    }
  }, [pathname, newOrderCount, clearCount]);

  // LOGIC CŨ GIỮ NGUYÊN
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace('/login');
    }
  }, [user, loading, isAdmin, router]);

  // UI LOADING CŨ GIỮ NGUYÊN
  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-gold text-lg animate-pulse flex items-center gap-3">
          <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Đang xác thực quyền truy cập...
        </div>
      </div>
    );
  }

  // 5. CẬP NHẬT: Thêm thuộc tính showBadge cho Đơn Hàng
  const navItems = [
    { href: '/admin/analytics', label: 'Analytics',    icon: '📈' },
    { href: '/admin', label: 'Tổng Quan', icon: '📊' },
    { href: '/admin/products', label: 'Sản Phẩm', icon: '🥤' },
    { href: '/admin/users', label: 'Người Dùng', icon: '👥' },
    { href: '/admin/coupons',  label: 'Mã Giảm Giá', icon: '🏷' },
    { href: '/admin/orders', label: 'Đơn Hàng', icon: '📦', showBadge: true }, // <-- Thêm showBadge
    { href: '/admin/reviews', label: 'Đánh Giá', icon: '⭐' },
  ];

  // 6. THÊM LOGIC: Hàm check active xịn hơn từ Layout 2
  const isActive = (href) => pathname === href || (href !== '/admin' && pathname.startsWith(href));

  return (
    <div className="flex h-screen bg-black overflow-hidden relative">
      {/* Background Ambient Glow (GIỮ NGUYÊN) */}
      <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-emerald opacity-20 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Sidebar Glassmorphism (GIỮ NGUYÊN CẤU TRÚC) */}
      <aside className="w-16 md:w-64 bg-black/40 backdrop-blur-2xl border-r border-white/10 flex flex-col flex-shrink-0 z-20 relative transition-all duration-300">
        <div className="p-4 md:p-6 border-b border-white/10">
          <Link href="/" className="flex items-center justify-center md:justify-start gap-3 group">
            <span className="text-2xl md:text-3xl group-hover:animate-float transition-transform">🧋</span>
            <span className="hidden md:inline font-display text-2xl font-bold text-gold tracking-wider">Sip & Brew</span>
          </Link>
          <p className="hidden md:block text-xs text-cream/40 mt-2 uppercase tracking-[0.2em] font-semibold pl-1">Bảng Điều Khiển</p>
        </div>
        
        <nav className="flex-1 p-2 md:p-4 space-y-2 mt-2">
          {navItems.map(({ href, label, icon, showBadge }) => {
            const active = isActive(href); // Sử dụng hàm check active mới
            const badgeCnt = showBadge ? newOrderCount : 0; // Lấy số lượng đơn mới

            return (
              <Link key={href} href={href}
                className={`flex items-center justify-center md:justify-start gap-4 p-3 md:px-4 md:py-3.5 rounded-xl text-sm font-bold transition-all duration-300 relative group/nav
                  ${active 
                    ? 'bg-gold text-black shadow-[0_0_20px_rgba(201,169,110,0.2)]' 
                    : 'text-cream/70 hover:bg-white/5 hover:text-gold hover:translate-x-1'}`}>
                <span className="text-xl">{icon}</span>
                <span className="hidden md:inline">{label}</span>

                {/* Tooltip for mobile */}
                <div className="md:hidden absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover/nav:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {label}
                </div>

                {/* 7. THÊM UI: Hiển thị Badge báo số đơn hàng mới */}
                {badgeCnt > 0 && (
                  <span className={`absolute md:static top-1 right-1 md:ml-auto min-w-[16px] md:min-w-[20px] h-[16px] md:h-[20px] rounded-full text-[8px] md:text-[10px] font-bold flex items-center justify-center px-1 md:px-1.5 animate-pulse
                    ${active ? 'bg-black text-gold' : 'bg-gold text-black shadow-[0_0_10px_rgba(201,169,110,0.5)]'}`}>
                    {badgeCnt > 99 ? '99+' : badgeCnt}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
        
        {/* 8. THÊM UI: Trạng thái Polling Live 30s từ Layout 2 (Đã chỉnh style cho hợp với Layout 1) */}
        <div className="px-2 md:px-6 py-3 border-t border-white/10 bg-white/5 flex justify-center md:justify-start">
          <div className="flex items-center gap-2" title="Live System · 30s">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)] flex-shrink-0" />
            <span className="hidden md:inline text-[10px] text-cream/50 uppercase tracking-widest font-semibold">Live System · 30s</span>
          </div>
        </div>

        {/* Khối User Info & Nút Xem cửa hàng (GIỮ NGUYÊN) */}
        <div className="p-2 md:p-4 border-t border-white/10 bg-white/5 backdrop-blur-md flex flex-col gap-2">
          
          <a href="/" target="_blank" rel="noopener noreferrer"
            title="Xem cửa hàng"
            className="flex items-center justify-center md:justify-between p-2 md:px-3 md:py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-cream/80 hover:text-gold transition-colors text-sm font-semibold group/store">
            <div className="flex items-center gap-3">
              <span className="text-lg">🏪</span>
              <span className="hidden md:inline">Xem cửa hàng</span>
            </div>
            <svg className="hidden md:block w-4 h-4 opacity-50 group-hover/store:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          <div className="flex flex-col md:flex-row items-center md:justify-between px-1 md:px-3 py-2 mt-2 gap-2 md:gap-0">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="hidden md:block text-[10px] text-cream/40 uppercase tracking-widest mb-1 font-bold">Quản trị viên</div>
              <div className="text-xs md:text-sm font-bold text-gold flex items-center justify-center md:justify-start gap-1 md:gap-2">
                <div className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
                <span className="hidden md:inline">{user?.username || 'Admin'}</span>
              </div>
            </div>
            
            <button 
              onClick={() => {
                alert('Chức năng đăng xuất!');
              }}
              title="Đăng xuất"
              className="p-2 rounded-lg hover:bg-red-500/20 text-cream/50 hover:text-red-400 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto z-10 relative">
        {children}
      </main>
    </div>
  );
}