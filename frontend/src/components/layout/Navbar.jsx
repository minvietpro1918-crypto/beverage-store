'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

const NAV_LINKS = [
  { label: 'Bộ Sưu Tập', href: '/#products' },
  { label: 'Thành Phần',  href: '/#ingredients' },
  { label: 'Câu Chuyện',  href: '/#story' },
];

export default function Navbar({ onCartOpen, expandHandlers = {} }) {
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const { user, logout, isAdmin }       = useAuth();
  const { totalItems }                  = useCart();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    setMobileOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
  };

  const handleNavClick = (href) => {
    setMobileOpen(false);
    if (href.startsWith('/#')) {
      const id = href.replace('/#', '');
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const glassStyle = scrolled || mobileOpen
    ? { background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(201,169,110,0.12)' }
    : {};

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-[68px] md:h-[72px] flex items-center justify-between px-5 md:px-12 transition-all duration-500" style={glassStyle}>

        {/* LEFT — desktop nav links */}
        <ul className="hidden md:flex gap-8 lg:gap-10 list-none">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <button
                onClick={() => handleNavClick(href)}
                className="text-[10px] tracking-[0.22em] uppercase text-white/50 hover:text-white/90 transition-colors duration-300 bg-transparent border-none cursor-pointer relative
                           after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-0 after:bg-[#C9A96E] after:transition-all after:duration-300 hover:after:w-full"
              >
                {label}
              </button>
            </li>
          ))}
          {isAdmin && (
            <li>
              <Link href="/admin" className="text-[10px] tracking-[0.22em] uppercase text-[#C9A96E]/70 hover:text-[#C9A96E] transition-colors duration-300">
                Admin
              </Link>
            </li>
          )}
        </ul>

        {/* CENTER — logo */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 font-['Cormorant_Garamond'] text-[20px] md:text-[22px] font-light tracking-[0.15em] text-white no-underline whitespace-nowrap"
        >
          SIP<span className="text-[#C9A96E]">&</span>BREW
        </Link>

        {/* RIGHT — icons */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="p-1.5 text-white/60 hover:text-[#C9A96E] transition-colors duration-300 cursor-pointer bg-transparent border-none"
            aria-label="Tìm kiếm"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>

          {/* Cart */}
          <button
            onClick={onCartOpen}
            className="relative p-1.5 text-white/60 hover:text-[#C9A96E] transition-colors duration-300 cursor-pointer bg-transparent border-none"
            aria-label="Giỏ hàng"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C9A96E] text-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>

          {/* Auth — desktop only */}
          <div className="hidden md:block">
            {user ? (
              <button onClick={logout} className="text-[9px] tracking-[0.2em] uppercase text-white/35 hover:text-[#C9A96E] transition-colors cursor-pointer bg-transparent border-none">
                Đăng Xuất
              </button>
            ) : (
              <Link href="/login" className="text-[9px] tracking-[0.2em] uppercase text-white/35 hover:text-[#C9A96E] transition-colors no-underline">
                Đăng Nhập
              </Link>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 text-white/60 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
            aria-label="Menu"
          >
            <div className="w-5 flex flex-col gap-1.5">
              <span className={`block h-px bg-current transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-px bg-current transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-px bg-current transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* ── MOBILE MENU ───────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-500 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex flex-col items-center justify-center h-full gap-2 pt-16">
          {NAV_LINKS.map(({ label, href }, i) => (
            <button
              key={href}
              onClick={() => handleNavClick(href)}
              className="font-['Cormorant_Garamond'] text-[36px] font-light text-white/80 hover:text-[#C9A96E] transition-colors duration-300 bg-transparent border-none cursor-pointer py-2"
              style={{ transitionDelay: `${i * 60}ms`, opacity: mobileOpen ? 1 : 0, transform: mobileOpen ? 'none' : 'translateY(20px)', transition: 'opacity .4s, transform .4s, color .3s' }}
            >
              {label}
            </button>
          ))}
          {isAdmin && (
            <Link href="/admin" onClick={() => setMobileOpen(false)}
              className="font-['Cormorant_Garamond'] text-[36px] font-light text-[#C9A96E]/70 hover:text-[#C9A96E] transition-colors duration-300 no-underline py-2">
              Admin
            </Link>
          )}

          <div className="mt-8 flex flex-col items-center gap-4">
            {user ? (
              <>
                <span className="text-[11px] tracking-widest uppercase text-white/30">Xin chào, {user.username}</span>
                <button onClick={() => { logout(); setMobileOpen(false); }}
                  className="text-[10px] tracking-[0.25em] uppercase text-red-400/70 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none">
                  Đăng Xuất
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)}
                className="text-[10px] tracking-[0.25em] uppercase text-[#C9A96E]/60 hover:text-[#C9A96E] transition-colors no-underline">
                Đăng Nhập / Đăng Ký
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── SEARCH OVERLAY ───────────────────────────── */}
      <div
        className={`fixed inset-0 z-[60] flex items-start justify-center pt-[20vh] px-5 transition-all duration-400 ${searchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)' }}
      >
        <div className="w-full max-w-2xl">
          <p className="text-[9px] tracking-[0.35em] uppercase text-[#C9A96E] mb-6 text-center">Tìm Kiếm</p>
          <form onSubmit={handleSearch} className="relative">
            <input
              autoFocus={searchOpen}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập tên thức uống..."
              className="w-full bg-transparent border-b border-[rgba(201,169,110,0.3)] focus:border-[#C9A96E] outline-none text-white text-[28px] md:text-[40px] font-['Cormorant_Garamond'] font-light py-4 placeholder:text-white/20 transition-colors duration-300"
            />
            <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-[#C9A96E] cursor-pointer bg-transparent border-none">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </form>
          <p className="text-[11px] text-white/25 mt-4 text-center">Nhấn Enter để tìm kiếm</p>
        </div>
        <button
          onClick={() => setSearchOpen(false)}
          className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors cursor-pointer bg-transparent border-none text-2xl"
        >
          ✕
        </button>
      </div>
    </>
  );
}
