'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation'; 
import { useCursor } from '@/lib/useCursor';
import { useScrollReveal } from '@/lib/useScrollReveal';
import Navbar from '@/components/layout/Navbar';
import CartDrawer from '@/components/ui/CartDrawer';

export default function ClientShell({ children }) {
  const { cursorRef, ringRef, expandHandlers } = useCursor();
  const [cartOpen, setCartOpen] = useState(false);
  
  const pathname = usePathname(); 
  const isAdminRoute = pathname?.startsWith('/admin');

  useScrollReveal(); // attach IntersectionObserver globally

  return (
    <>
      {/* Custom cursor: Vẫn giữ lại hiệu ứng chuột xịn sò cho cả Admin */}
      <div ref={cursorRef} className="cursor" />
      <div ref={ringRef}   className="cursor-ring" />

      {/* Bước 4: CHỈ hiển thị Navbar nếu KHÔNG phải là trang Admin */}
      {!isAdminRoute && (
        <Navbar
          onCartOpen={() => setCartOpen(true)}
          expandHandlers={expandHandlers}
        />
      )}

      {/* Phần ruột chứa nội dung chính của các trang */}
      <div id="app-content">
        {children}
      </div>

      {/* Tương tự, CHỈ hiển thị Giỏ hàng ở trang khách */}
      {!isAdminRoute && (
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      )}
    </>
  );
}