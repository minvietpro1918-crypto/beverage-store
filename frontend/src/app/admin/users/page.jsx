'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axiosConfig';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ username: '', role: 'user' });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users');
      setUsers(data.users);
    } catch { toast.error('Không thể tải danh sách người dùng'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ username: u.username, role: u.role });
    setModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.put(`/users/${editUser._id}`, form);
      toast.success('Cập nhật người dùng thành công!');
      setModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại!');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id, name) => {
    if (id === currentUser?._id) { toast.error('Không thể tự xóa tài khoản của mình!'); return; }
    if (!confirm(`Bạn có chắc muốn xóa người dùng "${name}"?`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Đã xóa người dùng!');
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa thất bại!');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN');

  return (
    <div className="p-8 min-h-screen bg-black text-cream">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-gold">Hội Viên</h1>
          <p className="text-cream/60 text-sm mt-1">Danh sách người dùng và quản trị viên</p>
        </div>
        <span className="bg-white/10 border border-white/10 text-cream px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg">
          Tổng cộng: <span className="text-gold">{users.length}</span> người dùng
        </span>
      </div>

      {/* Table Glassmorphism */}
      <div className="bg-emerald/10 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 border-b border-white/10 uppercase tracking-wider text-xs font-semibold text-cream/70">
              <tr>
                {['Tên', 'Email', 'Vai Trò', 'Ngày Tham Gia', 'Thao Tác'].map((h) => (
                  <th key={h} className="px-6 py-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-5"><div className="h-4 bg-white/10 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-cream/40 text-base">Chưa có người dùng nào</td></tr>
              ) : users.map((u) => (
                <tr key={u._id} className={`transition-colors group ${u._id === currentUser?._id ? 'bg-gold/5 hover:bg-gold/10' : 'hover:bg-white/5'}`}>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-bronze flex items-center justify-center text-black font-bold shadow-lg flex-shrink-0">
                        {u.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-cream text-base">{u.username}</span>
                        {u._id === currentUser?._id && <span className="text-[10px] uppercase font-bold text-gold tracking-wider mt-0.5">Tài khoản của bạn</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-cream/70">{u.email}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${u.role === 'admin' ? 'bg-gold/20 text-gold border-gold/40 shadow-[0_0_10px_rgba(201,169,110,0.2)]' : 'bg-white/5 text-cream/70 border-white/10'}`}>
                      {u.role === 'admin' ? '👑 Quản Trị' : '👤 Khách Hàng'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-cream/50">{formatDate(u.createdAt)}</td>
                  <td className="px-6 py-5">
                    <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(u)}
                        className="bg-white/10 hover:bg-gold text-cream hover:text-black px-4 py-2 rounded-lg text-xs font-bold transition-all">
                        Phân quyền
                      </button>
                      <button onClick={() => handleDelete(u._id, u.username)}
                        disabled={u._id === currentUser?._id}
                        className="bg-red-500/10 hover:bg-red-500/30 disabled:hover:bg-red-500/10 text-red-400 px-4 py-2 rounded-lg text-xs font-bold transition-all border border-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed">
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

      {/* Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-emerald/20 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl w-full max-w-sm">
            <div className="p-8 border-b border-white/10">
              <h2 className="font-display text-2xl font-bold text-gold">Chỉnh Sửa Hồ Sơ</h2>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-cream mb-2">Tên người dùng</label>
                <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-cream focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-cream mb-2">Cấp quyền</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-cream focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all appearance-none">
                  <option value="user" className="bg-black text-cream">Khách Hàng (User)</option>
                  <option value="admin" className="bg-black text-gold">Quản Trị Viên (Admin)</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-cream border border-white/10 py-3.5 rounded-xl font-bold text-sm transition-all">
                  Hủy Bỏ
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-gold hover:bg-cream disabled:opacity-50 text-black py-3.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(201,169,110,0.3)]">
                  {submitting ? 'Đang lưu...' : 'Lưu Quyền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}