'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axiosConfig';
import toast from 'react-hot-toast';

const STATUS_LABELS = {
  pending:   { label: 'Chờ xác nhận', color: 'bg-amber-900/40 text-amber-400 border-amber-800/50' },
  confirmed: { label: 'Đã xác nhận',  color: 'bg-blue-900/40 text-blue-400 border-blue-800/50' },
  preparing: { label: 'Đang chuẩn bị',color: 'bg-purple-900/40 text-purple-400 border-purple-800/50' },
  shipping:  { label: 'Đang giao',    color: 'bg-cyan-900/40 text-cyan-400 border-cyan-800/50' },
  delivered: { label: 'Đã giao',      color: 'bg-green-900/40 text-green-400 border-green-800/50' },
  cancelled: { label: 'Đã hủy',       color: 'bg-red-900/40 text-red-400 border-red-800/50' },
};

const STATUS_FLOW = ['pending','confirmed','preparing','shipping','delivered'];

const fmt = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

export default function AdminOrdersPage() {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null); // order detail modal
  const [filterStat, setFilterStat] = useState('all');
  const [search,     setSearch]     = useState('');
  const [stats,      setStats]      = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStat !== 'all') params.status = filterStat;
      if (search.trim()) params.search = search.trim();
      const [ordersRes, statsRes] = await Promise.all([
        api.get('/orders', { params }),
        api.get('/orders/stats'),
      ]);
      setOrders(ordersRes.data.orders || []);
      setStats(statsRes.data);
    } catch { toast.error('Không thể tải đơn hàng'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [filterStat]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success('Cập nhật trạng thái thành công!');
      fetchOrders();
      if (selected?._id === orderId) setSelected(prev => ({ ...prev, status }));
    } catch { toast.error('Cập nhật thất bại!'); }
  };

  const deleteOrder = async (orderId) => {
    if (!confirm('Bạn có chắc muốn xóa đơn hàng này?')) return;
    try {
      await api.delete(`/orders/${orderId}`);
      toast.success('Đã xóa đơn hàng!');
      setOrders(prev => prev.filter(o => o._id !== orderId));
      setSelected(null);
    } catch { toast.error('Xóa thất bại!'); }
  };

  const fmtDate = (d) => new Date(d).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="p-5 md:p-8">
      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Tổng đơn', value: stats.total, color: 'text-white' },
            { label: 'Chờ xác nhận', value: stats.pending, color: 'text-amber-400' },
            { label: 'Đã xác nhận', value: stats.confirmed, color: 'text-blue-400' },
            { label: 'Đã giao', value: stats.delivered, color: 'text-green-400' },
            { label: 'Doanh thu', value: fmt(stats.revenue), color: 'text-[#C9A96E]' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl" style={{ background: 'rgba(245,240,232,0.03)', border: '1px solid rgba(245,240,232,0.06)' }}>
              <div className={`font-['Cormorant_Garamond'] text-2xl font-light ${s.color}`}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-white/30 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-['Cormorant_Garamond'] text-2xl font-light text-white">Quản Lý Đơn Hàng</h1>
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm mã đơn, tên, SĐT..."
            className="flex-1 sm:w-56 bg-transparent border border-[rgba(245,240,232,0.1)] rounded-lg px-3 py-2 text-[12px] text-white/70 placeholder:text-white/20 outline-none focus:border-[#C9A96E] transition-colors" />
          <button type="submit" className="px-4 py-2 bg-[#C9A96E] text-black text-[11px] tracking-[0.15em] uppercase rounded-lg font-medium cursor-pointer border-none">
            Tìm
          </button>
        </form>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {[['all','Tất cả'], ...Object.entries(STATUS_LABELS).map(([v, l]) => [v, l.label])].map(([v, l]) => (
          <button key={v} onClick={() => setFilterStat(v)}
            className="flex-shrink-0 px-4 py-1.5 text-[10px] tracking-[0.15em] uppercase transition-all duration-200 cursor-pointer border rounded-full"
            style={{
              borderColor: filterStat === v ? 'rgba(201,169,110,0.6)' : 'rgba(245,240,232,0.1)',
              color:       filterStat === v ? '#C9A96E' : 'rgba(245,240,232,0.35)',
              background:  filterStat === v ? 'rgba(201,169,110,0.08)' : 'transparent',
            }}>
            {l}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(245,240,232,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr style={{ background: 'rgba(245,240,232,0.03)', borderBottom: '1px solid rgba(245,240,232,0.06)' }}>
                {['Mã Đơn','Khách Hàng','Sản Phẩm','Tổng Tiền','Trạng Thái','Ngày Đặt',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] tracking-[0.15em] uppercase text-white/30 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(245,240,232,0.04)' }}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-3 bg-white/5 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-white/25 text-sm">Không có đơn hàng nào</td></tr>
              ) : orders.map(order => (
                <tr key={order._id}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid rgba(245,240,232,0.04)' }}
                  onClick={() => setSelected(order)}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,240,232,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-4 py-3 font-mono text-[12px] text-[#C9A96E]">{order.orderCode}</td>
                  <td className="px-4 py-3">
                    <p className="text-[13px] text-white/80">{order.customer.fullName}</p>
                    <p className="text-[11px] text-white/30">{order.customer.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-white/50">{order.items.length} sản phẩm</td>
                  <td className="px-4 py-3 font-['Cormorant_Garamond'] text-[15px] text-white/80">{fmt(order.totalPrice)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 text-[10px] tracking-wider uppercase rounded-full border ${STATUS_LABELS[order.status]?.color}`}>
                      {STATUS_LABELS[order.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-white/30">{fmtDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button onClick={e => { e.stopPropagation(); deleteOrder(order._id); }}
                      className="text-red-400/40 hover:text-red-400 text-xs transition-colors cursor-pointer bg-transparent border-none px-2 py-1">
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-end"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg h-full overflow-y-auto flex flex-col"
            style={{ background: '#0E0E0E', borderLeft: '1px solid rgba(201,169,110,0.12)' }}
            onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(245,240,232,0.06)' }}>
              <div>
                <p className="font-mono text-[#C9A96E] text-lg">{selected.orderCode}</p>
                <p className="text-[10px] text-white/25 mt-0.5">{fmtDate(selected.createdAt)}</p>
              </div>
              <button onClick={() => setSelected(null)}
                className="w-8 h-8 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors cursor-pointer bg-transparent text-sm">✕</button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* Customer info */}
              <div>
                <p className="text-[9px] tracking-[0.25em] uppercase text-white/30 mb-3">Thông Tin Khách Hàng</p>
                <div className="space-y-1.5 text-[12px] text-white/60">
                  <p><span className="text-white/30">Tên:</span> {selected.customer.fullName}</p>
                  <p><span className="text-white/30">SĐT:</span> {selected.customer.phone}</p>
                  <p><span className="text-white/30">Email:</span> {selected.customer.email}</p>
                  <p><span className="text-white/30">Địa chỉ:</span> {selected.customer.address}</p>
                  {selected.customer.note && <p><span className="text-white/30">Ghi chú:</span> {selected.customer.note}</p>}
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-[9px] tracking-[0.25em] uppercase text-white/30 mb-3">Sản Phẩm</p>
                <div className="space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-[12px]">
                      <span className="text-white/60">{item.name} <span className="text-white/30">×{item.quantity}</span></span>
                      <span className="text-white/50">{fmt(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 flex justify-between font-['Cormorant_Garamond'] text-lg" style={{ borderTop: '1px solid rgba(245,240,232,0.08)' }}>
                  <span className="text-white/40">Tổng cộng</span>
                  <span className="text-[#C9A96E]">{fmt(selected.totalPrice)}</span>
                </div>
              </div>

              {/* Status update */}
              <div>
                <p className="text-[9px] tracking-[0.25em] uppercase text-white/30 mb-3">Cập Nhật Trạng Thái</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STATUS_FLOW.map(s => (
                    <button key={s} onClick={() => updateStatus(selected._id, s)}
                      disabled={selected.status === s}
                      className={`px-3 py-2.5 text-[10px] tracking-[0.12em] uppercase border transition-all duration-200 cursor-pointer ${
                        selected.status === s
                          ? 'border-[#C9A96E] text-[#C9A96E] bg-[rgba(201,169,110,0.08)] cursor-default'
                          : 'border-white/10 text-white/35 hover:border-white/30 hover:text-white/60 bg-transparent'
                      }`}>
                      {STATUS_LABELS[s]?.label}
                    </button>
                  ))}
                  <button onClick={() => updateStatus(selected._id, 'cancelled')}
                    className="px-3 py-2.5 text-[10px] tracking-[0.12em] uppercase border border-red-900/50 text-red-400/60 hover:border-red-400/50 hover:text-red-400 transition-all duration-200 cursor-pointer bg-transparent sm:col-span-2">
                    Hủy Đơn Hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
