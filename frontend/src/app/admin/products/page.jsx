'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axiosConfig';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', price: '', description: '', imageURL: '', category: 'trà sữa', stock: '' };
const CATEGORIES = ['trà sữa', 'cà phê', 'nước suối', 'nước ép', 'sinh tố', 'trà trái cây', 'khác'];

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products/admin/all');
      setProducts(data.products);
    } catch { toast.error('Không thể tải danh sách sản phẩm'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setModal('create'); };
  const openEdit = (p) => {
    setForm({ name: p.name, price: p.price, description: p.description || '', imageURL: p.imageURL || '', category: p.category, stock: p.stock });
    setEditId(p._id);
    setModal('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }
    try {
      setSubmitting(true);
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (modal === 'create') {
        await api.post('/products', payload);
        toast.success('Thêm sản phẩm thành công!');
      } else {
        await api.put(`/products/${editId}`, payload);
        toast.success('Cập nhật sản phẩm thành công!');
      }
      setModal(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại!');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Bạn có chắc muốn xóa "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Đã xóa sản phẩm!');
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch { toast.error('Xóa thất bại!'); }
  };

  return (
    <div className="p-8 min-h-screen bg-black text-cream">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-gold">Kho Sản Phẩm</h1>
          <p className="text-cream/60 text-sm mt-1">Quản lý danh sách đồ uống của cửa hàng</p>
        </div>
        <button onClick={openCreate}
          className="bg-gold hover:bg-cream text-black px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(201,169,110,0.3)] hover:shadow-[0_0_25px_rgba(245,240,232,0.4)] flex items-center justify-center gap-2">
          <span className="text-lg leading-none">+</span> Thêm Sản Phẩm
        </button>
      </div>

      {/* Table Glassmorphism */}
      <div className="bg-emerald/10 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 border-b border-white/10 uppercase tracking-wider text-xs font-semibold text-cream/70">
              <tr>
                {['Tên Sản Phẩm', 'Danh Mục', 'Giá', 'Tồn Kho', 'Trạng Thái', 'Thao Tác'].map((h) => (
                  <th key={h} className="px-6 py-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-5"><div className="h-4 bg-white/10 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-cream/40 text-base">Chưa có sản phẩm nào trong kho.</td></tr>
              ) : products.map((p) => (
                <tr key={p._id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5 font-medium text-cream max-w-xs truncate">{p.name}</td>
                  <td className="px-6 py-5">
                    <span className="bg-white/10 text-cream px-3 py-1.5 rounded-full text-xs font-medium border border-white/5">{p.category}</span>
                  </td>
                  <td className="px-6 py-5 font-semibold text-gold">{formatPrice(p.price)}</td>
                  <td className="px-6 py-5 text-cream/70">{p.stock}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${p.isActive ? 'bg-gold/10 text-gold border-gold/30' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {p.isActive ? 'Đang bán' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(p)}
                        className="bg-white/10 hover:bg-gold text-cream hover:text-black px-4 py-2 rounded-lg text-xs font-bold transition-all">
                        Sửa
                      </button>
                      <button onClick={() => handleDelete(p._id, p.name)}
                        className="bg-red-500/10 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-xs font-bold transition-all border border-red-500/20">
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

      {/* Modal Glassmorphism */}
      {modal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-emerald/20 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-white/10">
              <h2 className="font-display text-3xl font-bold text-gold">
                {modal === 'create' ? 'Tạo Mới Sản Phẩm' : 'Cập Nhật Sản Phẩm'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {[
                { key: 'name', label: 'Tên sản phẩm *', placeholder: 'Trà Sữa Trân Châu', type: 'text' },
                { key: 'price', label: 'Giá (VNĐ) *', placeholder: '45000', type: 'number' },
                { key: 'stock', label: 'Tồn kho', placeholder: '100', type: 'number' },
                { key: 'imageURL', label: 'URL hình ảnh', placeholder: 'https://...', type: 'url' },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-cream mb-2">{label}</label>
                  <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-cream placeholder-cream/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-cream mb-2">Danh mục *</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-cream focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all appearance-none">
                  {CATEGORIES.map((c) => <option key={c} value={c} className="bg-black text-cream">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-cream mb-2">Mô tả</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3} placeholder="Mô tả hương vị, nguyên liệu..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-cream placeholder-cream/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setModal(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-cream border border-white/10 py-3.5 rounded-xl font-bold text-sm transition-all">
                  Hủy Bỏ
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-gold hover:bg-cream disabled:opacity-50 text-black py-3.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(201,169,110,0.3)]">
                  {submitting ? 'Đang xử lý...' : modal === 'create' ? 'Thêm Vào Kho' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}