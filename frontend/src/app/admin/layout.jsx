'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace('/login');
    }
  }, [user, loading, isAdmin, router]);

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

  const navItems = [
    { href: '/admin', label: 'Tổng Quan', icon: '📊' },
    { href: '/admin/products', label: 'Sản Phẩm', icon: '🥤' },
    { href: '/admin/users', label: 'Người Dùng', icon: '👥' },
    { href: '/admin/orders', label: 'Đơn Hàng', icon: '📦' },
  ];

  return (
    <div className="flex h-screen bg-black overflow-hidden relative">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-emerald opacity-20 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Sidebar Glassmorphism */}
      <aside className="w-64 bg-black/40 backdrop-blur-2xl border-r border-white/10 flex flex-col flex-shrink-0 z-20 relative">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-3xl group-hover:animate-float transition-transform">🧋</span>
            <span className="font-display text-2xl font-bold text-gold tracking-wider">Sip & Brew</span>
          </Link>
          <p className="text-xs text-cream/40 mt-2 uppercase tracking-[0.2em] font-semibold pl-1">Bảng Điều Khiển</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-2">
          {navItems.map(({ href, label, icon }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300
                  ${isActive 
                    ? 'bg-gold text-black shadow-[0_0_20px_rgba(201,169,110,0.2)]' 
                    : 'text-cream/70 hover:bg-white/5 hover:text-gold hover:translate-x-1'}`}>
                <span className="text-xl">{icon}</span>
                {label}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md flex flex-col gap-2">
          
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-cream/80 hover:text-gold transition-colors text-sm font-semibold group">
            <div className="flex items-center gap-3">
              <span className="text-lg">🏪</span>
              Xem cửa hàng
            </div>
            <svg className="w-4 h-4 opacity-50 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          <div className="flex items-center justify-between px-3 py-2 mt-2">
            <div>
              <div className="text-[10px] text-cream/40 uppercase tracking-widest mb-1 font-bold">Quản trị viên</div>
              <div className="text-sm font-bold text-gold flex items-center gap-2">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
                {user?.username || 'Admin'}
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