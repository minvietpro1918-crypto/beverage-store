'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import api from '@/lib/axiosConfig';
import toast from 'react-hot-toast';

const fmt    = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const fmtDt  = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
const fmtNum = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n));

const STATUS_COLORS = {
  pending:   '#fbbf24', confirmed: '#60a5fa',
  preparing: '#c084fc', shipping:  '#34d399',
  delivered: '#4ade80', cancelled: '#f87171',
};
const STATUS_LABELS = {
  pending: 'Chờ XN', confirmed: 'Đã XN', preparing: 'Chuẩn bị',
  shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy',
};
const CATEGORY_COLORS = [
  '#C9A96E','#60a5fa','#4ade80','#c084fc','#34d399','#fbbf24','#f87171',
];
const PERIODS = [
  { label: '7 ngày',  value: 7  },
  { label: '30 ngày', value: 30 },
  { label: '90 ngày', value: 90 },
];

export default function AnalyticsDashboard() {
  const [overview,    setOverview]    = useState(null);
  const [chart,       setChart]       = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [recentOrders,setRecentOrders]= useState([]);
  const [period,      setPeriod]      = useState(30);
  const [loading,     setLoading]     = useState(true);
  const [chartMetric, setChartMetric] = useState('revenue'); // 'revenue' | 'orders'

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [ov, ch, tp, cat, os, ro] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/revenue-chart', { params: { period } }),
        api.get('/analytics/top-products', { params: { limit: 8 } }),
        api.get('/analytics/category-breakdown'),
        api.get('/analytics/order-status'),
        api.get('/analytics/recent-orders', { params: { limit: 8 } }),
      ]);
      setOverview(ov.data);
      setChart(ch.data.chart || []);
      setTopProducts(tp.data.top || []);
      setCategories(cat.data.breakdown || []);
      setOrderStatus(os.data.data || []);
      setRecentOrders(ro.data.orders || []);
    } catch (err) {
      toast.error('Không thể tải dữ liệu analytics');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Chart helpers ────────────────────────────────────────────────────────
  const chartData    = chart;
  const maxValue     = Math.max(...chartData.map(d => chartMetric === 'revenue' ? d.revenue : d.orders), 1);
  const totalRevChrt = chartData.reduce((s, d) => s + d.revenue, 0);
  const totalOrdChrt = chartData.reduce((s, d) => s + d.orders, 0);

  // Show every Nth label to avoid crowding
  const labelStep = period <= 7 ? 1 : period <= 30 ? 5 : 15;

  if (loading && !overview) return <DashboardSkeleton />;

  return (
    <div className="p-5 md:p-8 space-y-6 min-h-screen" style={{ backgroundColor: '#09090b' }}>

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-2xl md:text-3xl font-light text-white">
            Analytics <em className="italic text-[#C9A96E]">Dashboard</em>
          </h1>
          <p className="text-[11px] text-white/30 mt-1">Dữ liệu cập nhật theo thời gian thực</p>
        </div>
        <button onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 text-[10px] tracking-[0.15em] uppercase border border-[rgba(245,240,232,0.1)] text-white/40 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-all duration-200 cursor-pointer bg-transparent self-start sm:self-auto">
          <svg className={loading ? 'animate-spin' : ''} width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115-6.7M20 15a9 9 0 01-15 6.7"/>
          </svg>
          Làm Mới
        </button>
      </div>

      {/* ── KPI cards ─────────────────────────────────────────────────────── */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Tổng Doanh Thu"
            value={fmt(overview.revenue.total)}
            sub={`${fmt(overview.revenue.last30d)} / 30 ngày`}
            growth={overview.revenue.growth}
            icon="💰"
            accent="#C9A96E"
          />
          <KpiCard
            label="Tổng Đơn Hàng"
            value={fmtNum(overview.orders.total)}
            sub={`${overview.orders.last30d} đơn / 30 ngày`}
            growth={overview.orders.growth}
            icon="📦"
            accent="#60a5fa"
          />
          <KpiCard
            label="Tổng Khách Hàng"
            value={fmtNum(overview.users.total)}
            sub={`+${overview.users.new30d} mới trong 30 ngày`}
            icon="👥"
            accent="#4ade80"
          />
          <KpiCard
            label="Giá Trị TB / Đơn"
            value={fmt(overview.orders.avgValue)}
            sub={`${overview.orders.pending} đơn đang chờ`}
            icon="📊"
            accent="#c084fc"
          />
        </div>
      )}

      {/* ── Revenue Chart ──────────────────────────────────────────────────── */}
      <div className="p-5 md:p-6" style={{ border: '1px solid rgba(245,240,232,0.06)', background: 'rgba(245,240,232,0.01)' }}>
        {/* Chart header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-[13px] font-medium text-white/80">
              {chartMetric === 'revenue' ? 'Doanh Thu' : 'Số Đơn Hàng'}
            </h2>
            <p className="text-[11px] text-white/30 mt-0.5">
              {chartMetric === 'revenue' ? fmt(totalRevChrt) : `${totalOrdChrt} đơn`} trong {period} ngày qua
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Metric toggle */}
            <div className="flex" style={{ border: '1px solid rgba(245,240,232,0.1)' }}>
              {[['revenue','Doanh Thu'],['orders','Đơn Hàng']].map(([v, l]) => (
                <button key={v} onClick={() => setChartMetric(v)}
                  className="px-3 py-1.5 text-[9px] tracking-[0.15em] uppercase transition-all cursor-pointer border-none"
                  style={{ background: chartMetric === v ? 'rgba(201,169,110,0.15)' : 'transparent', color: chartMetric === v ? '#C9A96E' : 'rgba(245,240,232,0.3)' }}>
                  {l}
                </button>
              ))}
            </div>
            {/* Period selector */}
            <div className="flex gap-1">
              {PERIODS.map(p => (
                <button key={p.value} onClick={() => setPeriod(p.value)}
                  className="px-3 py-1.5 text-[9px] tracking-[0.12em] uppercase transition-all cursor-pointer border"
                  style={{
                    borderColor: period === p.value ? 'rgba(201,169,110,0.5)' : 'rgba(245,240,232,0.08)',
                    color:       period === p.value ? '#C9A96E' : 'rgba(245,240,232,0.3)',
                    background:  period === p.value ? 'rgba(201,169,110,0.06)' : 'transparent',
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="relative" style={{ height: 200 }}>
          {/* Y-axis grid lines */}
          {[0,25,50,75,100].map(pct => (
            <div key={pct} className="absolute left-0 right-0" style={{ bottom: `${pct}%`, borderTop: '1px dashed rgba(245,240,232,0.05)' }}>
              {pct > 0 && (
                <span className="absolute right-0 -top-3 text-[9px] text-white/20" style={{ transform: 'translateX(-4px)' }}>
                  {chartMetric === 'revenue'
                    ? `${Math.round(maxValue * pct / 100 / 1000)}k`
                    : Math.round(maxValue * pct / 100)
                  }
                </span>
              )}
            </div>
          ))}

          {/* Bars */}
          <div className="absolute inset-0 flex items-end gap-px overflow-hidden pr-10">
            {chartData.map((d, i) => {
              const val  = chartMetric === 'revenue' ? d.revenue : d.orders;
              const pct  = maxValue > 0 ? (val / maxValue) * 100 : 0;
              const show = i % labelStep === 0;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1 group relative" style={{ minWidth: 0 }}>
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-[rgba(245,240,232,0.1)] px-2.5 py-1.5 text-[10px] text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <p className="text-white/50 mb-0.5">{d.date}</p>
                    <p className="text-[#C9A96E]">{chartMetric === 'revenue' ? fmt(d.revenue) : `${d.orders} đơn`}</p>
                  </div>
                  <div className="w-full transition-all duration-500 rounded-sm"
                    style={{
                      height: `${Math.max(pct, 1)}%`,
                      background: val > 0
                        ? `linear-gradient(to top, rgba(201,169,110,0.8), rgba(201,169,110,0.4))`
                        : 'rgba(245,240,232,0.05)',
                      minHeight: 2,
                    }} />
                  {show && (
                    <span className="text-[8px] text-white/20 absolute -bottom-5 whitespace-nowrap">{d.label}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* X-axis space */}
        <div style={{ height: 24 }} />
      </div>

      {/* ── Bottom grid: Top Products + Category + Order Status ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Top Products */}
        <div className="lg:col-span-2 p-5 md:p-6" style={{ border: '1px solid rgba(245,240,232,0.06)', background: 'rgba(245,240,232,0.01)' }}>
          <h2 className="text-[13px] font-medium text-white/80 mb-1">Top Sản Phẩm</h2>
          <p className="text-[10px] text-white/25 mb-5">Doanh thu cao nhất 30 ngày qua</p>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-white/20 text-sm text-center py-8">Chưa có dữ liệu</p>
            ) : topProducts.map((p, i) => {
              const maxRev = topProducts[0]?.revenue || 1;
              return (
                <div key={p._id} className="flex items-center gap-3">
                  <span className="text-[11px] text-white/25 w-5 flex-shrink-0 font-mono">{i + 1}</span>
                  {p.imageURL && (
                    <div className="w-8 h-8 relative flex-shrink-0 overflow-hidden" style={{ background: 'rgba(245,240,232,0.04)', border: '1px solid rgba(201,169,110,0.1)' }}>
                      <Image src={p.imageURL} alt={p.name} fill className="object-cover" sizes="32px" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[12px] text-white/70 truncate mr-2">{p.name}</p>
                      <span className="text-[11px] text-[#C9A96E] font-['Cormorant_Garamond'] flex-shrink-0">{fmt(p.revenue)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(245,240,232,0.06)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${(p.revenue / maxRev) * 100}%`, background: 'rgba(201,169,110,0.6)' }} />
                      </div>
                      <span className="text-[10px] text-white/25 flex-shrink-0">{p.sold} ly</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category + Order Status stacked */}
        <div className="flex flex-col gap-6">
          {/* Category breakdown */}
          <div className="flex-1 p-5" style={{ border: '1px solid rgba(245,240,232,0.06)', background: 'rgba(245,240,232,0.01)' }}>
            <h2 className="text-[13px] font-medium text-white/80 mb-1">Theo Danh Mục</h2>
            <p className="text-[10px] text-white/25 mb-5">30 ngày qua</p>
            {categories.length === 0 ? (
              <p className="text-white/20 text-sm text-center py-6">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-3">
                {categories.slice(0, 6).map((cat, i) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                        <span className="text-[11px] text-white/60 capitalize">{cat.category}</span>
                      </div>
                      <span className="text-[10px] text-white/35">{cat.percent}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(245,240,232,0.06)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${cat.percent}%`, background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order status */}
          <div className="p-5" style={{ border: '1px solid rgba(245,240,232,0.06)', background: 'rgba(245,240,232,0.01)' }}>
            <h2 className="text-[13px] font-medium text-white/80 mb-4">Trạng Thái Đơn</h2>
            <div className="space-y-2">
              {orderStatus.map(s => (
                <div key={s._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[s._id] || '#888' }} />
                    <span className="text-[11px] text-white/50">{STATUS_LABELS[s._id] || s._id}</span>
                  </div>
                  <span className="text-[12px] font-mono text-white/60">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Orders ──────────────────────────────────────────────────── */}
      <div className="p-5 md:p-6" style={{ border: '1px solid rgba(245,240,232,0.06)', background: 'rgba(245,240,232,0.01)' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[13px] font-medium text-white/80">Đơn Hàng Gần Nhất</h2>
            <p className="text-[10px] text-white/25 mt-0.5">8 đơn mới nhất</p>
          </div>
          <a href="/admin/orders" className="text-[9px] tracking-[0.15em] uppercase text-[#C9A96E]/60 hover:text-[#C9A96E] transition-colors no-underline">
            Xem tất cả →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(245,240,232,0.06)' }}>
                {['Mã Đơn','Khách Hàng','SP','Tổng Tiền','Trạng Thái'].map(h => (
                  <th key={h} className="text-left pb-3 text-[9px] tracking-[0.15em] uppercase text-white/25 font-normal whitespace-nowrap pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o._id} style={{ borderBottom: '1px solid rgba(245,240,232,0.04)' }}>
                  <td className="py-3 pr-4 font-mono text-[11px] text-[#C9A96E]">{o.orderCode}</td>
                  <td className="py-3 pr-4 text-[12px] text-white/60 truncate max-w-[120px]">{o.customer?.fullName}</td>
                  <td className="py-3 pr-4 text-[11px] text-white/40">{o.items?.length || 0}</td>
                  <td className="py-3 pr-4 font-['Cormorant_Garamond'] text-[14px] text-white/70">{fmt(o.totalPrice)}</td>
                  <td className="py-3">
                    <span className="text-[9px] tracking-[0.12em] uppercase px-2 py-0.5"
                      style={{ color: STATUS_COLORS[o.status] || '#888', background: `${STATUS_COLORS[o.status]}15` || 'rgba(136,136,136,0.1)', border: `1px solid ${STATUS_COLORS[o.status]}30` }}>
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Low stock warning ───────────────────────────────────────────────── */}
      {overview?.products?.lowStock > 0 && (
        <div className="flex items-center gap-4 p-4"
          style={{ border: '1px solid rgba(251,191,36,0.25)', background: 'rgba(251,191,36,0.05)' }}>
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="text-[13px] text-amber-400">Cảnh báo tồn kho thấp</p>
            <p className="text-[11px] text-white/40 mt-0.5">
              {overview.products.lowStock} sản phẩm còn ≤5 sản phẩm trong kho
            </p>
          </div>
          <a href="/admin/products"
            className="text-[9px] tracking-[0.15em] uppercase text-amber-400/70 hover:text-amber-400 transition-colors no-underline flex-shrink-0">
            Quản Lý →
          </a>
        </div>
      )}
    </div>
  );
}

// ── KPI Card component ────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, growth, icon, accent }) {
  const isPositive = growth >= 0;
  return (
    <div className="p-4 md:p-5 transition-all duration-300"
      style={{ border: '1px solid rgba(245,240,232,0.06)', background: 'rgba(245,240,232,0.02)' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = `${accent}30`}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(245,240,232,0.06)'}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {growth !== undefined && (
          <span className={`text-[10px] tracking-wider px-2 py-0.5 ${isPositive ? 'text-green-400' : 'text-red-400'}`}
            style={{ background: isPositive ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)' }}>
            {isPositive ? '↑' : '↓'} {Math.abs(growth)}%
          </span>
        )}
      </div>
      <p className="font-['Cormorant_Garamond'] text-2xl md:text-3xl font-light mb-1" style={{ color: accent }}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">{label}</p>
      <p className="text-[10px] text-white/20">{sub}</p>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="p-5 md:p-8 space-y-6 min-h-screen" style={{ backgroundColor: '#09090b' }}>
      <div className="h-8 w-64 animate-pulse rounded" style={{ background: 'rgba(245,240,232,0.06)' }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded" style={{ background: 'rgba(245,240,232,0.04)', border: '1px solid rgba(245,240,232,0.05)' }} />
        ))}
      </div>
      <div className="h-64 animate-pulse" style={{ background: 'rgba(245,240,232,0.03)', border: '1px solid rgba(245,240,232,0.05)' }} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-52 animate-pulse" style={{ background: 'rgba(245,240,232,0.03)', border: '1px solid rgba(245,240,232,0.05)' }} />
        ))}
      </div>
    </div>
  );
}
