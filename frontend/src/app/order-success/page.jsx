'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); router.push('/'); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
      {/* Animated checkmark */}
      <div className="relative w-24 h-24 mb-10">
        <div className="absolute inset-0 rounded-full border border-[rgba(201,169,110,0.2)] animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute inset-0 rounded-full border border-[rgba(201,169,110,0.4)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="36" height="36" fill="none" stroke="#C9A96E" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <p className="text-[9px] tracking-[0.35em] uppercase text-[#C9A96E] mb-5">Đặt Hàng Thành Công</p>
      <h1 className="font-['Cormorant_Garamond'] font-light mb-5" style={{ fontSize: 'clamp(36px,5vw,64px)' }}>
        Cảm Ơn<br /><em className="italic text-[#C9A96E]">Bạn Đã Tin Tưởng</em>
      </h1>
      <p className="text-[13px] text-white/40 max-w-sm leading-[1.85] mb-10">
        Đơn hàng của bạn đã được xác nhận. Chúng tôi sẽ liên hệ trong thời gian sớm nhất để xác nhận giao hàng.
      </p>

      {/* Info boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg w-full mb-12">
        {[['⏱', '30-60 Phút', 'Thời gian giao hàng'],['🔔', 'SMS + Email', 'Thông báo trạng thái'],['💝', 'Đóng Gói Cẩn Thận', 'Bảo đảm chất lượng']].map(([icon, title, sub]) => (
          <div key={title} className="p-5" style={{ border: '1px solid rgba(245,240,232,0.06)', background: 'rgba(201,169,110,0.03)' }}>
            <span className="text-2xl block mb-2">{icon}</span>
            <p className="font-['Cormorant_Garamond'] text-[16px] text-white/80 mb-0.5">{title}</p>
            <p className="text-[10px] text-white/25 tracking-wider">{sub}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Link href="/"
          className="px-8 py-3.5 border border-[#C9A96E] text-[10px] tracking-[0.22em] uppercase text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black transition-all duration-300 no-underline">
          Tiếp Tục Mua Sắm
        </Link>
        <p className="text-[10px] text-white/20 tracking-wider">
          Tự động chuyển trang sau {countdown}s
        </p>
      </div>
    </div>
  );
}
