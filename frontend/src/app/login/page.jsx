'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email không được để trống';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Email không hợp lệ';
    if (!form.password) errs.password = 'Mật khẩu không được để trống';
    else if (form.password.length < 6) errs.password = 'Mật khẩu tối thiểu 6 ký tự';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      setLoading(true);
      setErrors({});
      await login(form.email, form.password);
      toast.success('Đăng nhập thành công! 🎉');
      router.push(redirect);
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại!';
      toast.error(msg);
      setErrors({ server: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-4">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gold opacity-10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

      <div className="w-full max-w-md relative z-10 fade-up visible">
        {/* Glassmorphism Card */}
        <div className="bg-emerald/20 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          
          {/* Header */}
          <div className="p-10 pb-6 text-center border-b border-white/5">
            <span className="text-5xl block mb-4 animate-float">🧋</span>
            <h1 className="font-display text-3xl font-bold text-cream tracking-wide">Đăng Nhập</h1>
            <p className="text-cream/60 text-sm mt-2">Mừng bạn trở lại với Sip & Brew</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-10 pt-8 space-y-6" noValidate>
            {errors.server && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-200 text-sm px-4 py-3 rounded-xl backdrop-blur-sm">
                {errors.server}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-cream mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                className={`w-full bg-black/40 border rounded-xl px-4 py-3.5 text-cream placeholder-cream/30 focus:outline-none focus:ring-1 transition-all
                  ${errors.email ? 'border-red-500/50 focus:ring-red-500 focus:border-red-500' : 'border-white/10 focus:border-gold focus:ring-gold'}`}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-cream mb-2">Mật khẩu</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className={`w-full bg-black/40 border rounded-xl px-4 py-3.5 text-cream placeholder-cream/30 focus:outline-none focus:ring-1 transition-all
                  ${errors.password ? 'border-red-500/50 focus:ring-red-500 focus:border-red-500' : 'border-white/10 focus:border-gold focus:ring-gold'}`}
              />
              {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-cream text-black disabled:opacity-50 disabled:cursor-not-allowed py-3.5 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 mt-4 shadow-[0_0_20px_rgba(201,169,110,0.3)] hover:shadow-[0_0_25px_rgba(245,240,232,0.4)]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Đang xử lý...
                </>
              ) : 'Khám Phá Ngay'}
            </button>

            <p className="text-center text-sm text-cream/60 pt-2">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="text-gold font-semibold hover:text-cream transition-colors">
                Tạo tài khoản mới
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}