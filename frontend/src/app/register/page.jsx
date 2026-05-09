'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

// 1. Nâng cấp component Field để hỗ trợ nút Ẩn/Hiện mật khẩu
const Field = ({ label, type = 'text', placeholder, value, onChange, error }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  return (
    <div>
      <label className="block text-sm font-semibold text-cream mb-2">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          // Thêm pr-12 (padding-right) để text không bị lẹm vào icon con mắt
          className={`w-full bg-black/40 border rounded-xl px-4 py-3.5 pr-12 text-cream placeholder-cream/30 focus:outline-none focus:ring-1 transition-all
            ${error ? 'border-red-500/50 focus:ring-red-500 focus:border-red-500' : 'border-white/10 focus:border-gold focus:ring-gold'}`}
        />
        
        {/* Nếu là field nhập mật khẩu thì mới render nút con mắt */}
        {isPasswordField && (
          <button
            type="button" // Rất quan trọng: Ngăn nút này submit form
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/50 hover:text-gold transition-colors focus:outline-none"
          >
            {showPassword ? (
              // Icon nhắm mắt (Mật khẩu đang hiện)
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              // Icon mở mắt (Mật khẩu đang ẩn)
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
};

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
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!form.password) errs.password = 'Mật khẩu không được để trống';
    else if (!passwordRegex.test(form.password)) errs.password = 'Mật khẩu phải từ 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
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

            {/* Form Fields */}
            <Field 
              label="Tên người dùng" 
              placeholder="Nguyễn Văn A" 
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              error={errors.username}
            />
            <Field 
              label="Email" 
              type="email" 
              placeholder="email@example.com" 
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />
            <Field 
              label="Mật khẩu" 
              type="password" 
              placeholder="Tối thiểu 8 ký tự, có số, chữ hoa & ký tự đặc biệt" 
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />
            <Field 
              label="Xác nhận mật khẩu" 
              type="password" 
              placeholder="Nhập lại mật khẩu" 
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
            />

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