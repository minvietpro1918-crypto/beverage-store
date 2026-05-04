'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation'; 
import { useCursor } from '@/lib/useCursor';
import { useScrollReveal } from '@/lib/useScrollReveal';
import Navbar from '@/components/layout/Navbar';
import CartDrawer from '@/components/ui/CartDrawer';
import { AnimatePresence, motion } from 'framer-motion';
import Preloader from '@/components/ui/Preloader';

export default function ClientShell({ children }) {
  const { cursorRef, ringRef, expandHandlers } = useCursor();
  const [cartOpen, setCartOpen] = useState(false);
  
  const pathname = usePathname(); 
  const isAdminRoute = pathname?.startsWith('/admin');

  useScrollReveal(); // attach IntersectionObserver globally

  return (
    <>
      {/* Preloader khởi tạo lần đầu */}
      <AnimatePresence mode="wait">
        <Preloader key="preloader" />
      </AnimatePresence>
      {/* Cinematic Noise Overlay - Tạo độ nhám nghệ thuật cho toàn bộ trang web */}
      <div 
        className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

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
  <AnimatePresence mode="wait">
    <motion.div key={pathname} className="relative z-10">
      {/* Curtain Transition Effect: Màn sập đóng mở mượt mà khi đổi Route */}
      <motion.div
        className="fixed inset-0 z-[9998] bg-[#09090b] pointer-events-none border-b border-[#C9A96E]/30"
        initial={{ height: "100vh", bottom: 0, top: "auto" }}
        animate={{ height: "0vh", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.1 } }}
        exit={{ height: "100vh", top: 0, bottom: "auto", transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } }}
      />
      
      {/* Page Content Animation */}
      <div id="app-content">
        {children}
      </div>
    </motion.div>
  </AnimatePresence>

      {/* Tương tự, CHỈ hiển thị Giỏ hàng ở trang khách */}
      {!isAdminRoute && (
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      )}
    </>
  );
}