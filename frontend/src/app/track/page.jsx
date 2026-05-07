'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/axiosConfig';
import toast from 'react-hot-toast';

const fmt    = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const fmtDt  = (d) => new Date(d).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

const STATUS_STEPS = [
  { key: 'pending',   label: 'Chờ Xác Nhận', icon: '📋', desc: 'Đơn hàng đã được tiếp nhận' },
  { key: 'confirmed', label: 'Đã Xác Nhận',  icon: '✅', desc: 'Sip & Brew đã xác nhận đơn hàng' },
  { key: 'preparing', label: 'Đang Chuẩn Bị',icon: '🧋', desc: 'Đang pha chế và đóng gói' },
  { key: 'shipping',  label: 'Đang Giao',    icon: '🛵', desc: 'Shipper đang trên đường giao' },
  { key: 'delivered', label: 'Đã Giao',      icon: '🎉', desc: 'Đơn hàng đã được giao thành công' },
];

const PAYMENT_LABEL = {
  cod:     'Tiền mặt khi nhận (COD)',
  banking: 'Chuyển khoản ngân hàng',
  momo:    'Ví MoMo',
};

function TrackContent() {
  const params   = useSearchParams();
  const router   = useRouter();
  const initCode = params.get('code') || '';

  const [code,    setCode]    = useState(initCode);
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched,setSearched]= useState(false);

  // Auto-search nếu có code từ URL
  useState(() => {
    if (initCode) handleTrack(initCode);
  });

  async function handleTrack(trackCode) {
    const c = (trackCode || code).trim().toUpperCase();
    if (!c) { toast.error('Vui lòng nhập mã đơn hàng'); return; }
    try {
      setLoading(true);
      setSearched(true);
      const { data } = await api.get(`/orders/track/${c}`);
      setOrder(data);
      router.replace(`/track?code=${c}`, { scroll: false });
    } catch (err) {
      setOrder(null);
      toast.error(err.response?.data?.message || 'Không tìm thấy đơn hàng');
    } finally {
      setLoading(false);
    }
  }

  const currentStep = STATUS_STEPS.findIndex(s => s.key === order?.status);
  const isCancelled = order?.status === 'cancelled';

  return (
    <div className="min-h-screen pt-20 pb-24 px-5 sm:px-8 md:px-[8%]" style={{ backgroundColor: '#09090b' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto pt-12 mb-12 text-center">
        <p className="text-[9px] tracking-[0.35em] uppercase text-[#C9A96E] mb-4">Tra Cứu Đơn Hàng</p>
        <h1 className="font-['Cormorant_Garamond'] font-light text-white mb-3"
          style={{ fontSize: 'clamp(32px,4vw,56px)' }}>
          Kiểm Tra <em className="italic text-[#C9A96E]">Trạng Thái</em>
        </h1>
        <p className="text-[13px] text-white/35 font-light">
          Nhập mã đơn hàng nhận được qua email để theo dõi
        </p>
      </div>

      {/* ── Search box ─────────────────────────────────────────────────────── */}
      <div className="max-w-xl mx-auto mb-14">
        <div className="flex gap-3">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleTrack()}
            placeholder="VD: SB-20250507-0001"
            className="flex-1 bg-transparent outline-none text-white/80 text-[14px] placeholder:text-white/20 transition-colors duration-300"
            style={{
              borderBottom: '1px solid rgba(201,169,110,0.35)',
              paddingBottom: '12px',
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
            }}
            onFocus={e => e.target.style.borderBottomColor = '#C9A96E'}
            onBlur={e => e.target.style.borderBottomColor = 'rgba(201,169,110,0.35)'}
          />
          <button
            onClick={() => handleTrack()}
            disabled={loading}
            className="px-6 py-2 text-[10px] tracking-[0.22em] uppercase border border-[#C9A96E] text-[#C9A96E] bg-transparent cursor-pointer transition-all duration-300 relative overflow-hidden group disabled:opacity-50 flex-shrink-0"
          >
            <span className="absolute inset-0 bg-[#C9A96E] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            <span className="relative z-10 group-hover:text-black transition-colors duration-300">
              {loading ? '...' : 'Tra Cứu'}
            </span>
          </button>
        </div>
      </div>

      {/* ── Result ─────────────────────────────────────────────────────────── */}
      {searched && !loading && !order && (
        <div className="max-w-xl mx-auto text-center py-12">
          <span className="text-5xl block mb-4 opacity-20">📦</span>
          <p className="font-['Cormorant_Garamond'] text-xl text-white/30">Không tìm thấy đơn hàng</p>
          <p className="text-[12px] text-white/20 mt-2">Kiểm tra lại mã đơn trong email xác nhận</p>
        </div>
      )}

      {order && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">

          {/* Order header */}
          <div className="p-6 md:p-8" style={{ border: '1px solid rgba(245,240,232,0.06)', background: 'rgba(245,240,232,0.02)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase text-white/30 mb-1">Mã Đơn Hàng</p>
                <p className="font-mono text-[#C9A96E] text-xl tracking-[0.08em]">{order.orderCode}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] tracking-[0.2em] uppercase text-white/30 mb-1">Ngày Đặt</p>
                <p className="text-[12px] text-white/50">{fmtDt(order.createdAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[12px]">
              <div>
                <p className="text-white/30 mb-0.5">Người nhận</p>
                <p className="text-white/70">{order.customer.fullName}</p>
                <p className="text-white/40">{order.customer.phone}</p>
              </div>
              <div>
                <p className="text-white/30 mb-0.5">Thanh toán</p>
                <p className="text-white/70">{PAYMENT_LABEL[order.paymentMethod]}</p>
                <p className="font-['Cormorant_Garamond'] text-[16px] text-[#C9A96E] mt-1">{fmt(order.totalPrice)}</p>
              </div>
            </div>
          </div>

          {/* Status timeline */}
          {isCancelled ? (
            <div className="p-6 text-center" style={{ border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.04)' }}>
              <span className="text-4xl block mb-3">❌</span>
              <p className="font-['Cormorant_Garamond'] text-xl text-red-400">Đơn Hàng Đã Bị Hủy</p>
              <p className="text-[12px] text-white/30 mt-1">Liên hệ chúng tôi nếu có thắc mắc</p>
            </div>
          ) : (
            <div className="p-6 md:p-8" style={{ border: '1px solid rgba(245,240,232,0.06)' }}>
              <p className="text-[9px] tracking-[0.25em] uppercase text-white/30 mb-8">Trạng Thái Đơn Hàng</p>
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-5 top-5 bottom-5 w-px" style={{ background: 'rgba(245,240,232,0.06)' }} />

                <div className="space-y-0">
                  {STATUS_STEPS.map((step, i) => {
                    const isDone    = i <= currentStep;
                    const isCurrent = i === currentStep;
                    return (
                      <div key={step.key} className="flex gap-5 pb-8 last:pb-0 relative">
                        {/* Icon circle */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg z-10 transition-all duration-500"
                          style={{
                            background: isDone ? (isCurrent ? '#C9A96E' : 'rgba(201,169,110,0.2)') : 'rgba(245,240,232,0.04)',
                            border:     `1px solid ${isDone ? '#C9A96E' : 'rgba(245,240,232,0.1)'}`,
                            boxShadow:  isCurrent ? '0 0 20px rgba(201,169,110,0.3)' : 'none',
                          }}
                        >
                          {isDone ? step.icon : <span className="w-2 h-2 rounded-full" style={{ background: 'rgba(245,240,232,0.15)' }} />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1.5">
                          <p className={`text-[13px] font-medium mb-0.5 transition-colors ${isDone ? 'text-white/80' : 'text-white/25'} ${isCurrent ? '!text-[#C9A96E]' : ''}`}>
                            {step.label}
                            {isCurrent && <span className="ml-2 text-[9px] tracking-[0.15em] uppercase text-[#C9A96E]/60">— Hiện tại</span>}
                          </p>
                          <p className={`text-[11px] ${isDone ? 'text-white/35' : 'text-white/15'}`}>{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="p-6 md:p-8" style={{ border: '1px solid rgba(245,240,232,0.06)' }}>
            <p className="text-[9px] tracking-[0.25em] uppercase text-white/30 mb-5">Sản Phẩm Đã Đặt</p>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-[12px] pb-3 last:pb-0 last:border-0"
                  style={{ borderBottom: '1px solid rgba(245,240,232,0.04)' }}>
                  <div>
                    <p className="text-white/70">{item.name}</p>
                    <p className="text-white/30">× {item.quantity} · {fmt(item.price)} / ly</p>
                  </div>
                  <span className="text-white/50 flex-shrink-0 ml-4">{fmt(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 flex justify-between font-['Cormorant_Garamond'] text-lg" style={{ borderTop: '1px solid rgba(245,240,232,0.06)' }}>
              <span className="text-white/40">Tổng cộng</span>
              <span className="text-[#C9A96E]">{fmt(order.totalPrice)}</span>
            </div>
          </div>

          {/* Help */}
          <div className="text-center py-4">
            <p className="text-[11px] text-white/20">
              Cần hỗ trợ? Liên hệ{' '}
              <a href="tel:+84xxx" className="text-[#C9A96E]/60 hover:text-[#C9A96E] transition-colors">
                hotline
              </a>{' '}
              hoặc{' '}
              <a href="mailto:hello@sipandbrew.vn" className="text-[#C9A96E]/60 hover:text-[#C9A96E] transition-colors">
                email
              </a>
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        .animate-fade-up { animation: fade-up 0.5s cubic-bezier(.16,1,.3,1) forwards; }
      `}</style>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: '#09090b' }} />}>
      <TrackContent />
    </Suspense>
  );
}
