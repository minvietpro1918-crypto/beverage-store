'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axiosConfig';
import toast from 'react-hot-toast';

const fmt = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const TABS = [
  { id: 'info',     label: 'Thông Tin',     icon: '👤' },
  { id: 'password', label: 'Đổi Mật Khẩu', icon: '🔒' },
  { id: 'orders',   label: 'Đơn Hàng',      icon: '📦' },
];

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [tab,        setTab]        = useState('info');
  const [stats,      setStats]      = useState(null);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPw,   setSavingPw]   = useState(false);

  // Uncontrolled inputs for info tab
  const usernameRef = useRef(null);

  // Password form state (cần re-render để show errors)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState({});

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login?redirect=/profile');
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    api.get('/profile/stats').then(({ data }) => setStats(data)).catch(() => {});
  }, [user]);

  // ── Update thông tin ────────────────────────────────────────────────────
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    const username = usernameRef.current?.value?.trim();
    if (!username) { toast.error('Tên không được để trống'); return; }

    try {
      setSavingInfo(true);
      const { data } = await api.put('/profile/update', { username });
      // Cập nhật localStorage để Navbar hiển thị đúng
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, username: data.user.username }));
      toast.success('Cập nhật thông tin thành công!');
      // Force reload nhẹ để AuthContext sync
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setSavingInfo(false);
    }
  };

  // ── Đổi mật khẩu ───────────────────────────────────────────────────────
  const validatePw = () => {
    const errs = {};
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!pwForm.currentPassword) errs.currentPassword = 'Nhập mật khẩu hiện tại';
    if (!pwForm.newPassword)     errs.newPassword     = 'Nhập mật khẩu mới';
    else if (!passwordRegex.test(pwForm.newPassword)) errs.newPassword = 'Phải từ 8 ký tự, gồm chữ hoa, thường, số, đặc biệt';
    if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = 'Mật khẩu không khớp';
    return errs;
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    const errs = validatePw();
    if (Object.keys(errs).length) { setPwErrors(errs); return; }

    try {
      setSavingPw(true);
      await api.put('/profile/change-password', pwForm);
      toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwErrors({});
      setTimeout(() => { logout(); router.push('/login'); }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setSavingPw(false);
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen" style={{ backgroundColor: '#09090b' }} />;
  }

  return (
    <div className="min-h-screen pt-20 pb-24 px-5 sm:px-8 md:px-[8%]" style={{ backgroundColor: '#09090b' }}>
      <div className="max-w-3xl mx-auto pt-10">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[9px] tracking-[0.35em] uppercase text-[#C9A96E] mb-3">Tài Khoản</p>
          <h1 className="font-['Cormorant_Garamond'] font-light text-white" style={{ fontSize: 'clamp(28px,4vw,48px)' }}>
            Hồ Sơ <em className="italic text-[#C9A96E]">Của Tôi</em>
          </h1>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {[
              { label: 'Tổng Đơn',     value: stats.totalOrders,                 icon: '📦' },
              { label: 'Đã Giao',      value: stats.delivered,                    icon: '✅' },
              { label: 'Đã Chi',       value: fmt(stats.totalSpent),              icon: '💰' },
              { label: 'Đánh Giá',     value: stats.totalReviews,                 icon: '⭐' },
            ].map(s => (
              <div key={s.label} className="p-4 text-center"
                style={{ border: '1px solid rgba(245,240,232,0.06)', background: 'rgba(245,240,232,0.02)' }}>
                <span className="block text-xl mb-1">{s.icon}</span>
                <p className="font-['Cormorant_Garamond'] text-xl text-[#C9A96E]">{s.value}</p>
                <p className="text-[9px] uppercase tracking-wider text-white/25 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Avatar + name display */}
        <div className="flex items-center gap-4 mb-8 p-5"
          style={{ border: '1px solid rgba(245,240,232,0.06)', background: 'rgba(245,240,232,0.02)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-semibold flex-shrink-0"
            style={{ background: 'rgba(201,169,110,0.15)', color: '#C9A96E', border: '2px solid rgba(201,169,110,0.3)' }}>
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-['Cormorant_Garamond'] text-xl text-white">{user.username}</p>
            <p className="text-[12px] text-white/40">{user.email}</p>
            <span className="inline-block mt-1 text-[9px] uppercase tracking-wider px-2 py-0.5"
              style={{ background: user.role === 'admin' ? 'rgba(201,169,110,0.1)' : 'rgba(96,165,250,0.08)', color: user.role === 'admin' ? '#C9A96E' : '#60a5fa', border: `1px solid ${user.role === 'admin' ? 'rgba(201,169,110,0.25)' : 'rgba(96,165,250,0.2)'}` }}>
              {user.role === 'admin' ? '👑 Admin' : '👤 Member'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-8" style={{ borderBottom: '1px solid rgba(245,240,232,0.06)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-5 py-3 text-[10px] tracking-[0.15em] uppercase transition-all duration-200 cursor-pointer bg-transparent border-none border-b-2"
              style={{
                color:        tab === t.id ? '#C9A96E' : 'rgba(245,240,232,0.3)',
                borderBottom: tab === t.id ? '2px solid #C9A96E' : '2px solid transparent',
                marginBottom: '-1px',
              }}>
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab: Thông Tin ──────────────────────────────────────────────── */}
        {tab === 'info' && (
          <form onSubmit={handleUpdateInfo} className="space-y-6 max-w-md">
            <div>
              <label className="block text-[9px] tracking-[0.2em] uppercase text-white/35 mb-2">Tên Người Dùng</label>
              <input
                ref={usernameRef}
                defaultValue={user.username}
                placeholder="Nhập tên hiển thị"
                className="w-full bg-transparent border-b border-[rgba(245,240,232,0.12)] focus:border-[#C9A96E] pb-3 text-[14px] text-white/80 outline-none placeholder:text-white/20 transition-colors duration-300"
              />
            </div>

            <div>
              <label className="block text-[9px] tracking-[0.2em] uppercase text-white/35 mb-2">Email</label>
              <input
                value={user.email}
                disabled
                className="w-full bg-transparent border-b border-[rgba(245,240,232,0.06)] pb-3 text-[14px] text-white/30 outline-none cursor-not-allowed"
              />
              <p className="text-[10px] text-white/20 mt-1">Email không thể thay đổi</p>
            </div>

            <div>
              <label className="block text-[9px] tracking-[0.2em] uppercase text-white/35 mb-2">Vai Trò</label>
              <input
                value={user.role === 'admin' ? 'Admin' : 'Member'}
                disabled
                className="w-full bg-transparent border-b border-[rgba(245,240,232,0.06)] pb-3 text-[14px] text-white/30 outline-none cursor-not-allowed"
              />
            </div>

            <button type="submit" disabled={savingInfo}
              className="px-8 py-3 border border-[#C9A96E] text-[10px] tracking-[0.22em] uppercase text-[#C9A96E] bg-transparent cursor-pointer transition-all duration-300 relative overflow-hidden group disabled:opacity-50">
              <span className="absolute inset-0 bg-[#C9A96E] -translate-x-full group-hover:translate-x-0 transition-transform duration-400" />
              <span className="relative z-10 group-hover:text-black transition-colors duration-400">
                {savingInfo ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
              </span>
            </button>
          </form>
        )}

        {/* ── Tab: Đổi Mật Khẩu ──────────────────────────────────────────── */}
        {tab === 'password' && (
          <form onSubmit={handleChangePw} className="space-y-6 max-w-md">
            {[
              { key: 'currentPassword', label: 'Mật Khẩu Hiện Tại', placeholder: '••••••••' },
              { key: 'newPassword',     label: 'Mật Khẩu Mới',       placeholder: 'Tối thiểu 6 ký tự' },
              { key: 'confirmPassword', label: 'Xác Nhận Mật Khẩu',  placeholder: 'Nhập lại mật khẩu mới' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-[9px] tracking-[0.2em] uppercase text-white/35 mb-2">{label}</label>
                <input
                  type="password"
                  value={pwForm[key]}
                  onChange={e => {
                    setPwForm(f => ({ ...f, [key]: e.target.value }));
                    if (pwErrors[key]) setPwErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
                  }}
                  placeholder={placeholder}
                  className="w-full bg-transparent pb-3 text-[14px] text-white/80 outline-none placeholder:text-white/20 transition-colors duration-300"
                  style={{ borderBottom: `1px solid ${pwErrors[key] ? 'rgba(248,113,113,0.5)' : 'rgba(245,240,232,0.12)'}` }}
                />
                {pwErrors[key] && <p className="text-red-400/80 text-[10px] mt-1.5">{pwErrors[key]}</p>}
              </div>
            ))}

            <div className="p-4 text-[11px] text-white/30 leading-[1.8]"
              style={{ border: '1px solid rgba(245,240,232,0.06)', background: 'rgba(245,240,232,0.02)' }}>
              ⚠️ Sau khi đổi mật khẩu, bạn sẽ được đăng xuất và cần đăng nhập lại.
            </div>

            <button type="submit" disabled={savingPw}
              className="px-8 py-3 border border-[#C9A96E] text-[10px] tracking-[0.22em] uppercase text-[#C9A96E] bg-transparent cursor-pointer transition-all duration-300 relative overflow-hidden group disabled:opacity-50">
              <span className="absolute inset-0 bg-[#C9A96E] -translate-x-full group-hover:translate-x-0 transition-transform duration-400" />
              <span className="relative z-10 group-hover:text-black transition-colors duration-400">
                {savingPw ? 'Đang Xử Lý...' : 'Đổi Mật Khẩu'}
              </span>
            </button>
          </form>
        )}

        {/* ── Tab: Đơn Hàng (link sang /my-orders) ─────────────────────── */}
        {tab === 'orders' && (
          <div className="text-center py-12">
            <span className="text-5xl block mb-5">📦</span>
            <p className="font-['Cormorant_Garamond'] text-xl text-white/60 mb-2">
              {stats?.totalOrders || 0} đơn hàng đã đặt
            </p>
            <p className="text-[12px] text-white/30 mb-8">
              Xem chi tiết lịch sử và theo dõi trạng thái giao hàng
            </p>
            <Link href="/my-orders"
              className="inline-block px-8 py-3 border border-[#C9A96E] text-[10px] tracking-[0.22em] uppercase text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black transition-all duration-300 no-underline">
              Xem Lịch Sử Đơn Hàng →
            </Link>
          </div>
        )}

        {/* Logout button */}
        <div className="mt-14 pt-6" style={{ borderTop: '1px solid rgba(245,240,232,0.06)' }}>
          <button onClick={logout}
            className="text-[10px] tracking-[0.2em] uppercase text-red-400/40 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none">
            Đăng Xuất Khỏi Tài Khoản
          </button>
        </div>
      </div>
    </div>
  );
}
