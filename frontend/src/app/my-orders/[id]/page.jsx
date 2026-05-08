'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axiosConfig';
import toast from 'react-hot-toast';

const fmt   = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const fmtDt = (d) => new Date(d).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

const STATUS_STEPS = [
  { key: 'pending',   label: 'Chờ Xác Nhận', icon: '📋' },
  { key: 'confirmed', label: 'Đã Xác Nhận',  icon: '✅' },
  { key: 'preparing', label: 'Đang Pha Chế', icon: '🧋' },
  { key: 'shipping',  label: 'Đang Giao',    icon: '🛵' },
  { key: 'delivered', label: 'Đã Giao',      icon: '🎉' },
];

const PAYMENT_LABEL = { cod: 'Tiền mặt (COD)', banking: 'Chuyển khoản', momo: 'Ví MoMo' };

export default function MyOrderDetailPage() {
  const { id }              = useParams();
  const { user, loading: authLoading } = useAuth();
  const router              = useRouter();
  const [order,   setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login?redirect=/my-orders');
  }, [user, authLoading]);

  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      try {
        const { data } = await api.get(`/orders/my/${id}`);
        setOrder(data);
      } catch (err) {
        if (err.response?.status === 404) { toast.error('Không tìm thấy đơn hàng'); router.replace('/my-orders'); }
        else toast.error('Không thể tải đơn hàng');
      } finally { setLoading(false); }
    })();
  }, [user, id]);

  if (authLoading || loading || !order) {
    return (
      <div className="min-h-screen pt-24 px-5 sm:px-8 md:px-[8%]" style={{ backgroundColor: '#09090b' }}>
        <div className="max-w-2xl mx-auto space-y-4 pt-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse" style={{ background: 'rgba(245,240,232,0.03)', border: '1px solid rgba(245,240,232,0.05)' }} />
          ))}
        </div>
      </div>
    );
  }

  const currentStep  = STATUS_STEPS.findIndex(s => s.key === order.status);
  const isCancelled  = order.status === 'cancelled';
  const hasDiscount  = order.coupon?.discount > 0;

  return (
    <div className="min-h-screen pt-20 pb-24 px-5 sm:px-8 md:px-[8%]" style={{ backgroundColor: '#09090b' }}>
      <div className="max-w-2xl mx-auto pt-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-white/25 mb-8">
          <Link href="/my-orders" className="hover:text-[#C9A96E] transition-colors no-underline">Lịch Sử Đơn</Link>
          <span>/</span>
          <span className="text-white/45 font-mono">{order.orderCode}</span>
        </div>

        <div className="space-y-5">
          {/* ── Order header ───────────────────────────────────────────────── */}
          <div className="p-6" style={{ border: '1px solid rgba(245,240,232,0.06)', background: 'rgba(245,240,232,0.02)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase text-white/25 mb-1">Mã Đơn Hàng</p>
                <p className="font-mono text-[#C9A96E] text-xl tracking-[0.08em]">{order.orderCode}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] tracking-[0.18em] uppercase text-white/25 mb-1">Ngày Đặt</p>
                <p className="text-[12px] text-white/50">{fmtDt(order.createdAt)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-[12px]">
              <div>
                <p className="text-white/25 mb-0.5">Địa chỉ giao hàng</p>
                <p className="text-white/60">{order.customer.address}</p>
                <p className="text-white/40">{order.customer.province}</p>
              </div>
              <div>
                <p className="text-white/25 mb-0.5">Thanh toán</p>
                <p className="text-white/60">{PAYMENT_LABEL[order.paymentMethod]}</p>
                <span className="inline-block mt-1 text-[9px] uppercase tracking-wider px-2 py-0.5"
                  style={{ color: order.paymentStatus === 'paid' ? '#4ade80' : '#fbbf24', background: order.paymentStatus === 'paid' ? 'rgba(74,222,128,0.08)' : 'rgba(251,191,36,0.08)', border: `1px solid ${order.paymentStatus === 'paid' ? 'rgba(74,222,128,0.25)' : 'rgba(251,191,36,0.25)'}` }}>
                  {order.paymentStatus === 'paid' ? 'Đã Thanh Toán' : 'Chờ Thanh Toán'}
                </span>
              </div>
            </div>
          </div>

          {/* ── Status timeline ─────────────────────────────────────────────── */}
          <div className="p-6" style={{ border: '1px solid rgba(245,240,232,0.06)' }}>
            <p className="text-[9px] tracking-[0.25em] uppercase text-white/25 mb-7">Trạng Thái Đơn Hàng</p>

            {isCancelled ? (
              <div className="text-center py-4">
                <span className="text-3xl block mb-2">❌</span>
                <p className="font-['Cormorant_Garamond'] text-lg text-red-400">Đơn Hàng Đã Bị Hủy</p>
                {order.statusHistory.find(h => h.status === 'cancelled')?.note && (
                  <p className="text-[11px] text-white/30 mt-1">{order.statusHistory.find(h => h.status === 'cancelled').note}</p>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-5 top-5 bottom-5 w-px" style={{ background: 'rgba(245,240,232,0.06)' }} />
                <div className="space-y-0">
                  {STATUS_STEPS.map((step, i) => {
                    const isDone    = i <= currentStep;
                    const isCurrent = i === currentStep;
                    const histEntry = order.statusHistory.find(h => h.status === step.key);
                    return (
                      <div key={step.key} className="flex gap-5 pb-7 last:pb-0 relative">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-base z-10 transition-all duration-500"
                          style={{
                            background: isDone ? (isCurrent ? '#C9A96E' : 'rgba(201,169,110,0.18)') : 'rgba(245,240,232,0.04)',
                            border:     `1px solid ${isDone ? '#C9A96E' : 'rgba(245,240,232,0.1)'}`,
                            boxShadow:  isCurrent ? '0 0 18px rgba(201,169,110,0.28)' : 'none',
                          }}>
                          {isDone ? step.icon : <span className="w-2 h-2 rounded-full bg-white/10 block" />}
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-[13px] font-medium ${isDone ? 'text-white/80' : 'text-white/20'} ${isCurrent ? '!text-[#C9A96E]' : ''}`}>
                              {step.label}
                            </p>
                            {isCurrent && <span className="text-[9px] tracking-[0.15em] uppercase text-[#C9A96E]/50">— Hiện tại</span>}
                          </div>
                          {histEntry && (
                            <p className="text-[10px] text-white/25 mt-0.5">{fmtDt(histEntry.updatedAt)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Items ───────────────────────────────────────────────────────── */}
          <div className="p-6" style={{ border: '1px solid rgba(245,240,232,0.06)' }}>
            <p className="text-[9px] tracking-[0.25em] uppercase text-white/25 mb-5">Sản Phẩm</p>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="w-12 h-12 relative flex-shrink-0 overflow-hidden"
                    style={{ background: 'rgba(245,240,232,0.04)', border: '1px solid rgba(201,169,110,0.1)' }}>
                    {item.imageURL
                      ? <Image src={item.imageURL} alt={item.name} fill className="object-cover" sizes="48px" />
                      : <div className="w-full h-full flex items-center justify-center text-lg opacity-30">🥤</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-['Cormorant_Garamond'] text-[14px] text-white/75 truncate">{item.name}</p>
                    <p className="text-[10px] text-white/30">× {item.quantity} · {fmt(item.price)}</p>
                  </div>
                  <span className="text-[14px] text-white/55 font-['Cormorant_Garamond']">{fmt(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Pricing breakdown */}
            <div className="mt-5 pt-4 space-y-2" style={{ borderTop: '1px solid rgba(245,240,232,0.06)' }}>
              <div className="flex justify-between text-[12px] text-white/30">
                <span>Tạm tính</span><span>{fmt(order.subtotal)}</span>
              </div>
              {hasDiscount && (
                <div className="flex justify-between text-[12px] text-green-400">
                  <span className="flex items-center gap-1.5"><span>🏷</span>{order.coupon.code}</span>
                  <span>-{fmt(order.coupon.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[12px]" style={{ color: order.shippingFee === 0 ? '#C9A96E' : 'rgba(245,240,232,0.3)' }}>
                <span>Vận chuyển</span>
                <span>{order.shippingFee === 0 ? 'Miễn phí' : fmt(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-['Cormorant_Garamond'] text-xl pt-2" style={{ borderTop: '1px solid rgba(245,240,232,0.06)' }}>
                <span className="text-white/45">Tổng cộng</span>
                <span className="text-[#C9A96E]">{fmt(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* ── Actions ──────────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/my-orders" className="flex-1 py-3 border border-[rgba(245,240,232,0.12)] text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white/70 hover:border-white/30 transition-all duration-300 no-underline text-center">
              ← Quay Lại
            </Link>
            <Link href={`/track?code=${order.orderCode}`}
              className="flex-1 py-3 border border-[rgba(201,169,110,0.4)] text-[10px] tracking-[0.2em] uppercase text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black transition-all duration-300 no-underline text-center">
              Theo Dõi Giao Hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
