'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axiosConfig';
import toast from 'react-hot-toast';

const fmt    = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const fmtDt  = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

const EMPTY = {
  code: '', description: '', type: 'percent', value: '',
  maxDiscount: '', minOrderValue: '', usageLimit: '',
  perUserLimit: '1', startDate: '', endDate: '', isActive: true,
};

export default function AdminCouponsPage() {
  const [coupons,    setCoupons]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [form,       setForm]       = useState(EMPTY);
  const [editId,     setEditId]     = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetch = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/coupons');
      setCoupons(data.coupons || []);
    } catch { toast.error('Không thể tải danh sách coupon'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit   = (c) => {
    setForm({
      code: c.code, description: c.description || '', type: c.type,
      value: c.value, maxDiscount: c.maxDiscount || '',
      minOrderValue: c.minOrderValue || '', usageLimit: c.usageLimit || '',
      perUserLimit: c.perUserLimit || 1,
      startDate: c.startDate ? c.startDate.slice(0, 10) : '',
      endDate:   c.endDate   ? c.endDate.slice(0, 10)   : '',
      isActive: c.isActive,
    });
    setEditId(c._id);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.value) { toast.error('Mã và giá trị là bắt buộc'); return; }
    try {
      setSubmitting(true);
      const payload = {
        ...form,
        value:         Number(form.value),
        maxDiscount:   form.maxDiscount   ? Number(form.maxDiscount)   : null,
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
        usageLimit:    form.usageLimit    ? Number(form.usageLimit)    : null,
        perUserLimit:  Number(form.perUserLimit) || 1,
        startDate:     form.startDate || undefined,
        endDate:       form.endDate   || null,
      };
      if (editId) await api.put(`/coupons/${editId}`, payload);
      else        await api.post('/coupons', payload);
      toast.success(editId ? 'Cập nhật thành công!' : 'Tạo coupon thành công!');
      setModal(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại!');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id, code) => {
    if (!confirm(`Xóa coupon "${code}"?`)) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Đã xóa coupon!');
      setCoupons(prev => prev.filter(c => c._id !== id));
    } catch { toast.error('Xóa thất bại!'); }
  };

  const toggleActive = async (coupon) => {
    try {
      await api.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      setCoupons(prev => prev.map(c => c._id === coupon._id ? { ...c, isActive: !c.isActive } : c));
      toast.success(coupon.isActive ? 'Đã tắt coupon' : 'Đã bật coupon');
    } catch { toast.error('Cập nhật thất bại'); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Check validity
  const isValid = (c) => {
    if (!c.isActive) return false;
    const now = new Date();
    if (c.endDate && new Date(c.endDate) < now) return false;
    if (c.usageLimit && c.usedCount >= c.usageLimit) return false;
    return true;
  };

  return (
    <div className="p-5 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-2xl md:text-3xl font-light text-white">
            Mã Giảm Giá
          </h1>
          <p className="text-[11px] text-white/30 mt-1">{coupons.length} coupon</p>
        </div>
        <button onClick={openCreate}
          className="px-5 py-2.5 bg-[#C9A96E] text-black text-[10px] tracking-[0.2em] uppercase font-medium cursor-pointer border-none transition-opacity hover:opacity-80">
          + Tạo Coupon
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(245,240,232,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr style={{ background: 'rgba(245,240,232,0.03)', borderBottom: '1px solid rgba(245,240,232,0.06)' }}>
                {['Mã Code','Loại & Giá Trị','Đơn Tối Thiểu','Đã Dùng','Hạn Dùng','Trạng Thái',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[9px] tracking-[0.18em] uppercase text-white/30 font-normal whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(245,240,232,0.04)' }}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-3 bg-white/5 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : coupons.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-white/20 text-sm">Chưa có coupon nào</td></tr>
              ) : coupons.map(c => (
                <tr key={c._id} style={{ borderBottom: '1px solid rgba(245,240,232,0.04)' }}
                  className="transition-colors"
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,240,232,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-4 py-3">
                    <p className="font-mono text-[13px] text-[#C9A96E] tracking-[0.06em]">{c.code}</p>
                    {c.description && <p className="text-[10px] text-white/30 mt-0.5 max-w-[140px] truncate">{c.description}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-['Cormorant_Garamond'] text-[16px] text-white/80">
                      {c.type === 'percent' ? `${c.value}%` : fmt(c.value)}
                    </span>
                    {c.type === 'percent' && c.maxDiscount && (
                      <p className="text-[10px] text-white/30">tối đa {fmt(c.maxDiscount)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-white/45">
                    {c.minOrderValue > 0 ? fmt(c.minOrderValue) : '—'}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-white/45">
                    {c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}
                    <p className="text-[10px] text-white/25">{c.perUserLimit} lần/user</p>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-white/35">
                    {c.endDate ? fmtDt(c.endDate) : 'Không hạn'}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(c)}
                      className="flex items-center gap-2 cursor-pointer bg-transparent border-none">
                      <div className={`w-8 h-4 rounded-full transition-all duration-300 relative ${c.isActive ? 'bg-[#C9A96E]' : 'bg-white/10'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-300 ${c.isActive ? 'left-4' : 'left-0.5'}`} />
                      </div>
                      <span className={`text-[10px] tracking-wider uppercase ${isValid(c) ? 'text-green-400' : 'text-white/25'}`}>
                        {isValid(c) ? 'Hiệu lực' : c.isActive ? 'Hết hạn' : 'Tắt'}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)}
                        className="px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase cursor-pointer transition-all duration-200 bg-transparent"
                        style={{ border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(96,165,250,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        Sửa
                      </button>
                      <button onClick={() => handleDelete(c._id, c.code)}
                        className="px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase cursor-pointer transition-all duration-200 bg-transparent"
                        style={{ border: '1px solid rgba(248,113,113,0.2)', color: 'rgba(248,113,113,0.6)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal ────────────────────────────────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setModal(false)}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{ background: '#0E0E0E', border: '1px solid rgba(201,169,110,0.15)' }}
            onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(245,240,232,0.06)' }}>
              <h2 className="font-['Cormorant_Garamond'] text-xl font-light text-white">
                {editId ? 'Chỉnh Sửa Coupon' : 'Tạo Coupon Mới'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Code */}
              <div>
                <label className="block text-[9px] tracking-[0.2em] uppercase text-white/30 mb-2">Mã Code *</label>
                <input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())}
                  placeholder="VD: WELCOME20" disabled={!!editId}
                  className="w-full bg-transparent border-b border-[rgba(245,240,232,0.12)] focus:border-[#C9A96E] outline-none text-white/80 font-mono text-[14px] pb-2 transition-colors placeholder:text-white/20 disabled:opacity-50" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[9px] tracking-[0.2em] uppercase text-white/30 mb-2">Mô Tả</label>
                <input value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Giảm 20% cho đơn đầu tiên"
                  className="w-full bg-transparent border-b border-[rgba(245,240,232,0.12)] focus:border-[#C9A96E] outline-none text-white/80 text-[13px] pb-2 transition-colors placeholder:text-white/20" />
              </div>

              {/* Type + Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] tracking-[0.2em] uppercase text-white/30 mb-2">Loại *</label>
                  <select value={form.type} onChange={e => set('type', e.target.value)}
                    className="w-full bg-[#0E0E0E] border-b border-[rgba(245,240,232,0.12)] focus:border-[#C9A96E] outline-none text-white/80 text-[13px] pb-2 appearance-none cursor-pointer">
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (₫)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.2em] uppercase text-white/30 mb-2">
                    Giá Trị * {form.type === 'percent' ? '(1–100)' : '(₫)'}
                  </label>
                  <input type="number" value={form.value} onChange={e => set('value', e.target.value)}
                    min="1" max={form.type === 'percent' ? 100 : undefined} placeholder={form.type === 'percent' ? '20' : '50000'}
                    className="w-full bg-transparent border-b border-[rgba(245,240,232,0.12)] focus:border-[#C9A96E] outline-none text-white/80 text-[13px] pb-2 transition-colors placeholder:text-white/20" />
                </div>
              </div>

              {/* Max discount (only percent) */}
              {form.type === 'percent' && (
                <div>
                  <label className="block text-[9px] tracking-[0.2em] uppercase text-white/30 mb-2">Giảm Tối Đa (₫, để trống = không giới hạn)</label>
                  <input type="number" value={form.maxDiscount} onChange={e => set('maxDiscount', e.target.value)}
                    placeholder="100000"
                    className="w-full bg-transparent border-b border-[rgba(245,240,232,0.12)] focus:border-[#C9A96E] outline-none text-white/80 text-[13px] pb-2 transition-colors placeholder:text-white/20" />
                </div>
              )}

              {/* Min order + Usage limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] tracking-[0.2em] uppercase text-white/30 mb-2">Đơn Tối Thiểu (₫)</label>
                  <input type="number" value={form.minOrderValue} onChange={e => set('minOrderValue', e.target.value)}
                    placeholder="0"
                    className="w-full bg-transparent border-b border-[rgba(245,240,232,0.12)] focus:border-[#C9A96E] outline-none text-white/80 text-[13px] pb-2 transition-colors placeholder:text-white/20" />
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.2em] uppercase text-white/30 mb-2">Giới Hạn Dùng (để trống = ∞)</label>
                  <input type="number" value={form.usageLimit} onChange={e => set('usageLimit', e.target.value)}
                    placeholder="100"
                    className="w-full bg-transparent border-b border-[rgba(245,240,232,0.12)] focus:border-[#C9A96E] outline-none text-white/80 text-[13px] pb-2 transition-colors placeholder:text-white/20" />
                </div>
              </div>

              {/* Per user + dates */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[9px] tracking-[0.2em] uppercase text-white/30 mb-2">Lần/User</label>
                  <input type="number" value={form.perUserLimit} onChange={e => set('perUserLimit', e.target.value)}
                    min="1" placeholder="1"
                    className="w-full bg-transparent border-b border-[rgba(245,240,232,0.12)] focus:border-[#C9A96E] outline-none text-white/80 text-[13px] pb-2 transition-colors" />
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.2em] uppercase text-white/30 mb-2">Từ Ngày</label>
                  <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                    className="w-full bg-[#0E0E0E] border-b border-[rgba(245,240,232,0.12)] focus:border-[#C9A96E] outline-none text-white/70 text-[12px] pb-2 transition-colors" />
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.2em] uppercase text-white/30 mb-2">Đến Ngày</label>
                  <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)}
                    className="w-full bg-[#0E0E0E] border-b border-[rgba(245,240,232,0.12)] focus:border-[#C9A96E] outline-none text-white/70 text-[12px] pb-2 transition-colors" />
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => set('isActive', !form.isActive)}
                  className={`w-10 h-5 rounded-full transition-all duration-300 relative cursor-pointer border-none ${form.isActive ? 'bg-[#C9A96E]' : 'bg-white/10'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${form.isActive ? 'left-5' : 'left-0.5'}`} />
                </button>
                <span className="text-[12px] text-white/50">{form.isActive ? 'Kích hoạt ngay' : 'Tắt (lưu nháp)'}</span>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 py-3 border border-[rgba(245,240,232,0.12)] text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white/70 transition-colors cursor-pointer bg-transparent">
                  Hủy
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 bg-[#C9A96E] text-black text-[10px] tracking-[0.2em] uppercase font-medium cursor-pointer border-none disabled:opacity-50 transition-opacity hover:opacity-80">
                  {submitting ? 'Đang lưu...' : editId ? 'Lưu Thay Đổi' : 'Tạo Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
