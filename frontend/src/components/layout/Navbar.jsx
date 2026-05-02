'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

const NAV_LINKS = [
  { label: 'Bộ Sưu Tập', href: '/#products' },
  { label: 'Thành Phần',  href: '/#ingredients' },
  { label: 'Câu Chuyện',  href: '/#story' },
];

export default function Navbar({ onCartOpen, expandHandlers = {} }) {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center justify-between px-12 transition-all duration-500"
      style={scrolled ? {
        background: 'rgba(10,10,10,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(201,169,110,0.12)',
      } : {}}
    >
      {/* LEFT — nav links */}
      <ul className="flex gap-10 list-none">
        {NAV_LINKS.map(({ label, href }) => (
          <li key={href}>
            <Link
              href={href}
              {...expandHandlers}
              className="relative text-[10px] tracking-[0.25em] uppercase text-white/50 hover:text-white/90 transition-colors duration-300
                         after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-0 after:bg-[#C9A96E]
                         after:transition-all after:duration-300 hover:after:w-full"
            >
              {label}
            </Link>
          </li>
        ))}
        {isAdmin && (
          <li>
            <Link
              href="/admin"
              {...expandHandlers}
              className="text-[10px] tracking-[0.25em] uppercase text-[#C9A96E]/70 hover:text-[#C9A96E] transition-colors duration-300"
            >
              Admin
            </Link>
          </li>
        )}
      </ul>

      {/* CENTER — logo */}
      <Link
        href="/"
        {...expandHandlers}
        className="absolute left-1/2 -translate-x-1/2 font-['Cormorant_Garamond'] text-[22px] font-light tracking-[0.15em] text-white no-underline"
      >
        SIP<span className="text-[#C9A96E]">&</span>BREW
      </Link>

      {/* RIGHT — icons */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <button
          {...expandHandlers}
          className="bg-transparent border-none text-white/60 hover:text-[#C9A96E] transition-colors duration-300 cursor-none p-1"
          aria-label="Tìm kiếm"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>

        {/* Cart */}
        <button
          onClick={onCartOpen}
          {...expandHandlers}
          className="relative bg-transparent border-none text-white/60 hover:text-[#C9A96E] transition-colors duration-300 cursor-none p-1"
          aria-label="Giỏ hàng"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#C9A96E] text-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
              {totalItems}
            </span>
          )}
        </button>

        {/* Auth */}
        {user ? (
          <button
            onClick={logout}
            {...expandHandlers}
            className="text-[9px] tracking-[0.2em] uppercase text-white/40 hover:text-[#C9A96E] transition-colors cursor-none bg-transparent border-none"
          >
            Đăng Xuất
          </button>
        ) : (
          <Link
            href="/login"
            {...expandHandlers}
            className="text-[9px] tracking-[0.2em] uppercase text-white/40 hover:text-[#C9A96E] transition-colors no-underline"
          >
            Đăng Nhập
          </Link>
        )}
      </div>
    </nav>
  );
}
