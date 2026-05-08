'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axiosConfig';
import toast from 'react-hot-toast';

const fmt   = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const fmtDt = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const STATUS_CONFIG = {
  pending:   { label: 'Chờ Xác Nhận', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',   border: 'rgba(251,191,36,0.25)',  icon: '📋' },
  confirmed: { label: 'Đã Xác Nhận',  color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',   border: 'rgba(96,165,250,0.25)',  icon: '✅' },
  preparing: { label: 'Đang Pha Chế', color: '#c084fc', bg: 'rgba(192,132,252,0.08)',  border: 'rgba(192,132,252,0.25)', icon: '🧋' },
  shipping:  { label: 'Đang Giao',    color: '#34d399', bg: 'rgba(52,211,153,0.08)',   border: 'rgba(52,211,153,0.25)',  icon: '🛵' },
  delivered: { label: 'Đã Giao',      color: '#4ade80', bg: 'rgba(74,222,128,0.08)',   border: 'rgba(74,222,128,0.25)',  icon: '🎉' },
  cancelled: { label: 'Đã Hủy',       color: '#f87171', bg: 'rgba(248,113,113,0.08)',  border: 'rgba(248,113,113,0.25)', icon: '❌' },
};

const FILTERS = [
  { value: 'all',       label: 'Tất Cả' },
  { value: 'pending',   label: 'Chờ Xác Nhận' },
  { value: 'confirmed', label: 'Đã Xác Nhận' },
  { value: 'shipping',  label: 'Đang Giao' },
  { value: 'delivered', label: 'Đã Giao' },
  { value: 'cancelled', label: 'Đã Hủy' },
];

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const LIMIT = 8;

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!authLoading && !user) router.replace('/login?redirect=/my-orders');
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    fetchOrders();
  }, [user, filter, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { page, limit: LIMIT };
      if (filter !== 'all') params.status = filter;
      const { data } = await api.get('/orders/my', { params });
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch { toast.error('Không thể tải lịch sử đơn hàng'); }
    finally { setLoading(false); }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen" style={{ backgroundColor: '#09090b' }} />;
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen pt-20 pb-24 px-5 sm:px-8 md:px-[8%]" style={{ backgroundColor: '#09090b' }}>

      {/* Header */}
      <div className="max-w-4xl mx-auto pt-10 mb-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] tracking-[0.35em] uppercase text-[#C9A96E] mb-3">Tài Khoản</p>
            <h1 className="font-['Cormorant_Garamond'] font-light text-white" style={{ fontSize: 'clamp(28px,4vw,48px)' }}>
              Lịch Sử <em className="italic text-[#C9A96E]">Đơn Hàng</em>
            </h1>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-white/30">Xin chào,</p>
            <p className="text-[14px] text-white/70 font-['Cormorant_Garamond']">{user.username}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-hide">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => { setFilter(f.value); setPage(1); }}
              className="flex-shrink-0 px-4 py-2 text-[9px] tracking-[0.18em] uppercase transition-all duration-200 cursor-pointer border bg-transparent whitespace-nowrap"
              style={{
                borderColor: filter === f.value ? 'rgba(201,169,110,0.6)' : 'rgba(245,240,232,0.1)',
                color:       filter === f.value ? '#C9A96E' : 'rgba(245,240,232,0.3)',
                background:  filter === f.value ? 'rgba(201,169,110,0.06)' : 'transparent',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse" style={{ background: 'rgba(245,240,232,0.03)', border: '1px solid rgba(245,240,232,0.05)' }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-5 text-center">
            <span className="text-6xl opacity-20">📦</span>
            <p className="font-['Cormorant_Garamond'] text-2xl text-white/30">
              {filter === 'all' ? 'Bạn chưa có đơn hàng nào' : `Không có đơn hàng "${FILTERS.find(f=>f.value===filter)?.label}"`}
            </p>
            <Link href="/#products" className="px-6 py-3 border border-[rgba(201,169,110,0.3)] text-[10px] tracking-[0.2em] uppercase text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black transition-all duration-300 no-underline">
              Mua Sắm Ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              return (
                <Link key={order._id} href={`/my-orders/${order._id}`} className="no-underline block group">
                  <div
                    className="p-5 md:p-6 transition-all duration-300 fade-up visible"
                    style={{
                      border: '1px solid rgba(245,240,232,0.06)',
                      background: 'rgba(245,240,232,0.02)',
                      transitionDelay: `${i * 0.05}s`,
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,169,110,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(245,240,232,0.06)'}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: order info */}
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 text-xl"
                          style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                          {cfg.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <p className="font-mono text-[13px] text-[#C9A96E] tracking-[0.06em]">{order.orderCode}</p>
                            <span className="text-[9px] tracking-[0.15em] uppercase px-2 py-0.5"
                              style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                              {cfg.label}
                            </span>
                            {order.coupon?.discount > 0 && (
                              <span className="text-[9px] tracking-[0.12em] uppercase px-2 py-0.5 text-green-400"
                                style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
                                🏷 {order.coupon.code}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-white/30">
                            {fmtDt(order.createdAt)} · {order.items.length} sản phẩm
                          </p>
                          <p className="text-[11px] text-white/25 mt-0.5 line-clamp-1">
                            {order.items.map(i => i.name).join(', ')}
                          </p>
                        </div>
                      </div>

                      {/* Right: price + arrow */}
                      <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                        <div className="text-right">
                          {order.coupon?.discount > 0 && (
                            <p className="text-[11px] text-white/25 line-through">{fmt(order.subtotal + order.shippingFee)}</p>
                          )}
                          <p className="font-['Cormorant_Garamond'] text-[18px] text-white/80">{fmt(order.totalPrice)}</p>
                        </div>
                        <svg width="16" height="16" fill="none" stroke="rgba(201,169,110,0.4)" strokeWidth="1.5" viewBox="0 0 24 24"
                          className="flex-shrink-0 group-hover:translate-x-1 transition-transform duration-200">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-9 h-9 border border-[rgba(245,240,232,0.1)] text-white/40 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-all duration-200 cursor-pointer bg-transparent disabled:opacity-30 disabled:cursor-not-allowed text-sm">
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className="w-9 h-9 border text-[11px] transition-all duration-200 cursor-pointer"
                style={{
                  borderColor: page === p ? '#C9A96E' : 'rgba(245,240,232,0.1)',
                  color:       page === p ? '#C9A96E' : 'rgba(245,240,232,0.4)',
                  background:  page === p ? 'rgba(201,169,110,0.08)' : 'transparent',
                }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-9 h-9 border border-[rgba(245,240,232,0.1)] text-white/40 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-all duration-200 cursor-pointer bg-transparent disabled:opacity-30 disabled:cursor-not-allowed text-sm">
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
