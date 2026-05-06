'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const router      = useRouter();
  const params      = useSearchParams();
  const orderCode   = params.get('code') || '';
  const [count, setCount] = useState(10);

  useEffect(() => {
    const t = setInterval(() => setCount(c => {
      if (c <= 1) { clearInterval(t); router.push('/'); return 0; }
      return c - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center" style={{ backgroundColor: '#09090b' }}>
      {/* Animated ring */}
      <div className="relative w-24 h-24 mb-10">
        <div className="absolute inset-0 rounded-full border border-[rgba(201,169,110,0.2)]"
          style={{ animation: 'ping 2s cubic-bezier(0,0,.2,1) infinite' }} />
        <div className="absolute inset-0 rounded-full border border-[rgba(201,169,110,0.4)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="36" height="36" fill="none" stroke="#C9A96E" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
      </div>

      <p className="text-[9px] tracking-[0.35em] uppercase text-[#C9A96E] mb-5">Đặt Hàng Thành Công</p>
      <h1 className="font-['Cormorant_Garamond'] font-light text-white mb-4"
        style={{ fontSize: 'clamp(32px,5vw,60px)' }}>
        Cảm Ơn<br /><em className="italic text-[#C9A96E]">Bạn Đã Tin Tưởng</em>
      </h1>

      {/* Order code */}
      {orderCode && (
        <div className="mb-6 px-6 py-3" style={{ border: '1px solid rgba(201,169,110,0.2)', background: 'rgba(201,169,110,0.04)' }}>
          <p className="text-[9px] tracking-[0.25em] uppercase text-white/30 mb-1">Mã đơn hàng của bạn</p>
          <p className="font-['Cormorant_Garamond'] text-2xl text-[#C9A96E] tracking-[0.1em]">{orderCode}</p>
          <p className="text-[10px] text-white/25 mt-1">Lưu lại mã này để tra cứu đơn hàng</p>
        </div>
      )}

      <p className="text-[13px] text-white/40 max-w-sm leading-[1.85] mb-10">
        Email xác nhận đã được gửi đến hộp thư của bạn. Chúng tôi sẽ liên hệ để xác nhận giao hàng.
      </p>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg w-full mb-10">
        {[
          ['⏱', '30–60 phút', 'Thời gian giao hàng'],
          ['📧', 'Email xác nhận', 'Đã gửi đến hộp thư'],
          ['💝', 'Đóng gói cẩn thận', 'Bảo đảm chất lượng'],
        ].map(([icon, title, sub]) => (
          <div key={title} className="p-4 text-center"
            style={{ border: '1px solid rgba(245,240,232,0.06)', background: 'rgba(201,169,110,0.03)' }}>
            <span className="block text-2xl mb-2">{icon}</span>
            <p className="font-['Cormorant_Garamond'] text-[15px] text-white/80 mb-0.5">{title}</p>
            <p className="text-[10px] text-white/25 tracking-wider">{sub}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link href="/"
          className="px-8 py-3 border border-[#C9A96E] text-[10px] tracking-[0.22em] uppercase text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black transition-all duration-300 no-underline">
          Tiếp Tục Mua Sắm
        </Link>
        {orderCode && (
          <Link href={`/track?code=${orderCode}`}
            className="px-8 py-3 border border-[rgba(245,240,232,0.15)] text-[10px] tracking-[0.22em] uppercase text-white/40 hover:text-white hover:border-white/40 transition-all duration-300 no-underline">
            Theo Dõi Đơn Hàng
          </Link>
        )}
      </div>

      <p className="mt-6 text-[10px] text-white/20 tracking-wider">
        Tự động về trang chủ sau {count}s
      </p>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{backgroundColor:'#09090b'}}/>}>
      <SuccessContent />
    </Suspense>
  );
}
