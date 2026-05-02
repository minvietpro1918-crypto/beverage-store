'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Tên người dùng không được để trống';
    else if (form.username.length < 3) errs.username = 'Tên tối thiểu 3 ký tự';
    if (!form.email.trim()) errs.email = 'Email không được để trống';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Email không hợp lệ';
    if (!form.password) errs.password = 'Mật khẩu không được để trống';
    else if (form.password.length < 6) errs.password = 'Mật khẩu tối thiểu 6 ký tự';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Mật khẩu xác nhận không khớp';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      setLoading(true);
      setErrors({});
      await register(form.username, form.email, form.password);
      toast.success('Đăng ký thành công! Chào mừng bạn 🎉');
      router.push('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại!';
      toast.error(msg);
      setErrors({ server: msg });
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ name, label, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-semibold text-cream mb-2">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        placeholder={placeholder}
        className={`w-full bg-black/40 border rounded-xl px-4 py-3.5 text-cream placeholder-cream/30 focus:outline-none focus:ring-1 transition-all
          ${errors[name] ? 'border-red-500/50 focus:ring-red-500 focus:border-red-500' : 'border-white/10 focus:border-gold focus:ring-gold'}`}
      />
      {errors[name] && <p className="text-red-400 text-xs mt-1.5">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-4 py-12">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-emerald opacity-20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 fade-up visible">
        <div className="bg-emerald/20 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          
          <div className="p-8 pb-6 text-center border-b border-white/5">
            <span className="text-5xl block mb-4 animate-float">🥤</span>
            <h1 className="font-display text-3xl font-bold text-cream tracking-wide">Tạo Tài Khoản</h1>
            <p className="text-cream/60 text-sm mt-2">Trở thành hội viên Sip & Brew</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5" noValidate>
            {errors.server && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-200 text-sm px-4 py-3 rounded-xl backdrop-blur-sm">
                {errors.server}
              </div>
            )}

            <Field name="username" label="Tên người dùng" placeholder="Nguyễn Văn A" />
            <Field name="email" label="Email" type="email" placeholder="email@example.com" />
            <Field name="password" label="Mật khẩu" type="password" placeholder="Tối thiểu 6 ký tự" />
            <Field name="confirmPassword" label="Xác nhận mật khẩu" type="password" placeholder="Nhập lại mật khẩu" />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-cream text-black disabled:opacity-50 disabled:cursor-not-allowed py-3.5 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 mt-6 shadow-[0_0_20px_rgba(201,169,110,0.3)] hover:shadow-[0_0_25px_rgba(245,240,232,0.4)]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Đang khởi tạo...
                </>
              ) : 'Đăng Ký Thành Viên'}
            </button>

            <p className="text-center text-sm text-cream/60 pt-2">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-gold font-semibold hover:text-cream transition-colors">
                Đăng nhập tại đây
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}