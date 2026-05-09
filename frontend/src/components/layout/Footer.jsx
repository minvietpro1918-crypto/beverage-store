'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#09090b] border-t border-[#C9A96E]/20 pt-16 pb-8 text-[#F5F0E8]/80 mt-auto">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <span className="font-['Cormorant_Garamond'] text-2xl tracking-widest text-[#C9A96E] uppercase font-light">
                Beverage
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-[#F5F0E8]/60 font-light mb-6">
              Nghệ thuật thưởng thức nguyên bản. Chúng tôi mang đến những dòng thức uống tinh tế, chắt lọc từ những nguyên liệu hảo hạng nhất, đánh thức mọi giác quan của bạn.
            </p>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div>
            <h4 className="font-['Cormorant_Garamond'] text-lg text-[#C9A96E] mb-6 tracking-wider uppercase font-light">
              Khám Phá
            </h4>
            <ul className="space-y-4 text-sm font-light">
              <li>
                <Link href="/products" className="hover:text-[#C9A96E] transition-colors duration-300">
                  Thực Đơn
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#C9A96E] transition-colors duration-300">
                  Câu Chuyện
                </Link>
              </li>
              <li>
                <Link href="/journal" className="hover:text-[#C9A96E] transition-colors duration-300">
                  Tạp Chí
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#C9A96E] transition-colors duration-300">
                  Liên Hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ khách hàng */}
          <div>
            <h4 className="font-['Cormorant_Garamond'] text-lg text-[#C9A96E] mb-6 tracking-wider uppercase font-light">
              Hỗ Trợ
            </h4>
            <ul className="space-y-4 text-sm font-light">
              <li>
                <Link href="/faq" className="hover:text-[#C9A96E] transition-colors duration-300">
                  Câu Hỏi Thường Gặp
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-[#C9A96E] transition-colors duration-300">
                  Chính Sách Giao Hàng
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-[#C9A96E] transition-colors duration-300">
                  Đổi Trả & Hoàn Tiền
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#C9A96E] transition-colors duration-300">
                  Bảo Mật Thông Tin
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Thông tin liên hệ & Mạng xã hội */}
          <div>
            <h4 className="font-['Cormorant_Garamond'] text-lg text-[#C9A96E] mb-6 tracking-wider uppercase font-light">
              Kết Nối
            </h4>
            <ul className="space-y-4 text-sm font-light mb-8">
              <li className="flex items-start">
                <span className="text-[#C9A96E] mr-3 mt-0.5">⚲</span>
                <span className="text-[#F5F0E8]/60">123 Đường Nghệ Thuật, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center">
                <span className="text-[#C9A96E] mr-3">☏</span>
                <a href="tel:18001234" className="hover:text-[#C9A96E] transition-colors duration-300 text-[#F5F0E8]/60">
                  1800 1234
                </a>
              </li>
              <li className="flex items-center">
                <span className="text-[#C9A96E] mr-3">✉</span>
                <a href="mailto:hello@beverage.vn" className="hover:text-[#C9A96E] transition-colors duration-300 text-[#F5F0E8]/60">
                  hello@beverage.vn
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[#C9A96E]/30 flex items-center justify-center text-[#F5F0E8]/60 hover:text-[#C9A96E] hover:border-[#C9A96E] transition-all duration-300">
                <span className="text-sm">Fb</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[#C9A96E]/30 flex items-center justify-center text-[#F5F0E8]/60 hover:text-[#C9A96E] hover:border-[#C9A96E] transition-all duration-300">
                <span className="text-sm">Ig</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[#C9A96E]/30 flex items-center justify-center text-[#F5F0E8]/60 hover:text-[#C9A96E] hover:border-[#C9A96E] transition-all duration-300">
                <span className="text-sm">Tw</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="pt-8 border-t border-[#C9A96E]/10 flex flex-col md:flex-row justify-between items-center text-xs text-[#F5F0E8]/40 font-light">
          <p>© {currentYear} Beverage Store. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-[#C9A96E] transition-colors duration-300">
              Điều Khoản Dịch Vụ
            </Link>
            <Link href="/privacy" className="hover:text-[#C9A96E] transition-colors duration-300">
              Chính Sách Bảo Mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}