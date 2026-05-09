'use client';

import Link from 'next/link';
import MagneticButton from '@/components/ui/MagneticButton';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#C9A96E] rounded-full blur-[120px] opacity-10 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[200px] h-[200px] bg-[#0D2318] rounded-full blur-[100px] opacity-30 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center flex flex-col items-center">
        <h1 
          className="font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#F5F0E8] to-[#C9A96E]/50 mb-2"
          style={{ fontSize: 'clamp(80px, 20vw, 200px)', lineHeight: 1 }}
        >
          404
        </h1>
        
        <div className="flex items-center gap-4 mb-6 text-[10px] sm:text-[12px] tracking-[0.28em] uppercase text-[#C9A96E]">
          <span className="block w-8 sm:w-12 h-px bg-[#C9A96E] flex-shrink-0" />
          Trang Không Tồn Tại
          <span className="block w-8 sm:w-12 h-px bg-[#C9A96E] flex-shrink-0" />
        </div>

        <p className="text-[13px] sm:text-[15px] leading-[1.8] text-white/50 max-w-[400px] mb-10 font-light">
          Có vẻ như ly nước bạn đang tìm kiếm đã bị đổ hoặc không có trong menu của chúng tôi. Hãy thử tìm một hương vị khác nhé!
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <MagneticButton>
            <Link href="/"
              className="relative overflow-hidden px-8 py-3.5 text-[10px] tracking-[0.2em] uppercase text-black bg-[#C9A96E] hover:bg-white transition-colors duration-300 font-bold inline-block"
            >
              Về Trang Chủ
            </Link>
          </MagneticButton>

          <MagneticButton>
            <Link href="/products"
              className="relative overflow-hidden px-8 py-3.5 text-[10px] tracking-[0.2em] uppercase text-white border border-[rgba(201,169,110,0.45)] bg-transparent hover:bg-[rgba(201,169,110,0.1)] transition-colors duration-300 inline-block"
            >
              Xem Thực Đơn
            </Link>
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}
