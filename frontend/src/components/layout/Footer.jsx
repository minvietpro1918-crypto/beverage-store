'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#09090b] relative overflow-hidden mt-auto pt-20">
      {/* Ánh sáng hắt (Glow) nền */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at bottom, rgba(201,169,110,0.2) 0%, transparent 70%)' }}
      />

      <div className="container mx-auto px-6 max-w-[1200px] relative z-10">
        
        {/* ── Phần 1: Newsletter (Mới) ────────────────────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row items-center justify-between gap-8 pb-16 mb-16 border-b border-[rgba(245,240,232,0.06)]"
        >
          <div className="max-w-md text-center md:text-left">
            <h3 className="font-['Cormorant_Garamond'] text-3xl md:text-4xl text-white font-light mb-3">
              Tham gia cùng <em className="italic text-[#C9A96E]">Sip & Brew</em>
            </h3>
            <p className="text-[13px] text-white/50 leading-relaxed font-light">
              Nhận những ưu đãi đặc quyền và thông tin về các bộ sưu tập đồ uống mới nhất từ chúng tôi.
            </p>
          </div>
          <div className="w-full md:w-[400px] flex">
            <input 
              type="email" 
              placeholder="Địa chỉ Email của bạn" 
              className="w-full bg-transparent border-b border-[rgba(245,240,232,0.15)] focus:border-[#C9A96E] px-2 py-3 text-[13px] text-white outline-none placeholder:text-white/20 transition-colors"
            />
            <button className="flex-shrink-0 text-[10px] tracking-[0.2em] uppercase text-[#C9A96E] hover:text-white transition-colors px-4 border-b border-[rgba(245,240,232,0.15)] cursor-pointer">
              Đăng Ký
            </button>
          </div>
        </motion.div>

        {/* ── Phần 2: Links & Thông tin ────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Cột 1: Thông tin thương hiệu (Chiếm 4 cột) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="md:col-span-4 pr-0 md:pr-10"
          >
            <Link href="/" className="inline-block mb-6 no-underline">
              <span className="font-['Cormorant_Garamond'] text-3xl tracking-widest text-[#C9A96E] uppercase font-light">
                Sip<span className="text-white">&</span>Brew
              </span>
            </Link>
            <p className="text-[13px] leading-[1.9] text-white/45 font-light mb-6">
              Nghệ thuật thưởng thức nguyên bản. Chúng tôi mang đến những dòng thức uống tinh tế, chắt lọc từ những nguyên liệu hảo hạng nhất, đánh thức mọi giác quan của bạn.
            </p>
          </motion.div>

          {/* Cột 2: Khám Phá (Chiếm 2 cột) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:col-span-2"
          >
            <h4 className="text-[10px] text-[#C9A96E] mb-6 tracking-[0.25em] uppercase font-semibold">Khám Phá</h4>
            <ul className="space-y-4 text-[13px] font-light text-white/50">
              {/* Sửa link trỏ về ID #products ở trang chủ */}
              <li><Link href="/#products" className="hover:text-white transition-colors relative group">Thực Đơn <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#C9A96E] transition-all duration-300 group-hover:w-full"></span></Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors relative group">Câu Chuyện <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#C9A96E] transition-all duration-300 group-hover:w-full"></span></Link></li>
              <li><Link href="/journal" className="hover:text-white transition-colors relative group">Tạp Chí <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#C9A96E] transition-all duration-300 group-hover:w-full"></span></Link></li>
            </ul>
          </motion.div>

          {/* Cột 3: Hỗ Trợ (Chiếm 3 cột) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="md:col-span-3"
          >
            <h4 className="text-[10px] text-[#C9A96E] mb-6 tracking-[0.25em] uppercase font-semibold">Hỗ Trợ</h4>
            <ul className="space-y-4 text-[13px] font-light text-white/50">
              <li><Link href="/faq" className="hover:text-white transition-colors relative group">Câu Hỏi Thường Gặp <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#C9A96E] transition-all duration-300 group-hover:w-full"></span></Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors relative group">Chính Sách Giao Hàng <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#C9A96E] transition-all duration-300 group-hover:w-full"></span></Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors relative group">Đổi Trả & Hoàn Tiền <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#C9A96E] transition-all duration-300 group-hover:w-full"></span></Link></li>
            </ul>
          </motion.div>

          {/* Cột 4: Kết Nối (Chiếm 3 cột) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="md:col-span-3"
          >
            <h4 className="text-[10px] text-[#C9A96E] mb-6 tracking-[0.25em] uppercase font-semibold">Kết Nối</h4>
            <ul className="space-y-4 text-[13px] font-light text-white/50 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-[#C9A96E] mt-0.5">⚲</span>
                <span>123 Đường Nghệ Thuật, Quận 1, TP.HCM</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#C9A96E]">☏</span>
                <a href="tel:18001234" className="hover:text-white transition-colors">1800 1234</a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#C9A96E]">✉</span>
                <a href="mailto:hello@sipandbrew.vn" className="hover:text-white transition-colors">hello@sipandbrew.vn</a>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex gap-3">
              {['Fb', 'Ig', 'Tw'].map((social) => (
                <a key={social} href="#" target="_blank" rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full border border-[rgba(245,240,232,0.1)] flex items-center justify-center text-white/50 hover:text-[#C9A96E] hover:border-[#C9A96E] transition-all duration-300 hover:-translate-y-1">
                  <span className="text-[11px] tracking-wider">{social}</span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Phần 3: Bản quyền ────────────────────────────────────────────── */}
        <div className="pt-8 pb-8 border-t border-[rgba(245,240,232,0.06)] flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] tracking-wider text-white/30 font-light">
          <p>© {currentYear} Sip & Brew. Coded with passion.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-[#C9A96E] transition-colors">Điều Khoản</Link>
            <Link href="/privacy" className="hover:text-[#C9A96E] transition-colors">Bảo Mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}