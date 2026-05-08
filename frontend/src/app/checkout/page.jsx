'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useOrderForm } from '@/lib/useOrderForm';
import CouponInput from '@/components/ui/CouponInput';
import api from '@/lib/axiosConfig';
import toast from 'react-hot-toast';

const fmt = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const PROVINCES = [
  'TP. Hồ Chí Minh','Hà Nội','Đà Nẵng','Hải Phòng','Cần Thơ',
  'An Giang','Bà Rịa - Vũng Tàu','Bình Dương','Đồng Nai','Khánh Hòa',
  'Lâm Đồng','Long An','Tiền Giang','Bình Phước','Bình Thuận',
  'Nghệ An','Thanh Hóa','Huế','Quảng Nam','Quảng Ngãi',
];

const PAYMENT_OPTIONS = [
  { value: 'cod',     label: 'Tiền mặt khi nhận hàng (COD)', icon: '💵', desc: 'Thanh toán khi nhận được hàng' },
  { value: 'banking', label: 'Chuyển khoản ngân hàng',       icon: '🏦', desc: 'MB Bank · 0123456789 · Sip Brew' },
  { value: 'momo',    label: 'Ví MoMo',                      icon: '💜', desc: 'Quét mã QR sau khi đặt hàng' },
];

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user }   = useAuth();
  const router     = useRouter();
  const [loading,  setLoading]  = useState(false);
  const [coupon,   setCoupon]   = useState(null);  // { code, discount, description }

  const shipping = totalPrice >= 150000 ? 0 : 20000;
  const discount = coupon?.discount || 0;
  const grand    = Math.max(0, totalPrice - discount + shipping);

  const { getInputProps, getValues, validateAll, errors, paymentMethod, province, setPayment, setProvince } = useOrderForm(user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) { toast.error('Giỏ hàng trống!'); return; }
    if (!validateAll()) { toast.error('Vui lòng kiểm tra lại thông tin.'); return; }

    const values = getValues();
    try {
      setLoading(true);
      const { data } = await api.post('/orders', {
        customer: { fullName: values.fullName, phone: values.phone, email: values.email, address: values.address, province: values.province, note: values.note },
        items: cart.map(i => ({ product: i._id, name: i.name, price: i.price, quantity: i.quantity, imageURL: i.imageURL || '', category: i.category || '' })),
        paymentMethod: values.paymentMethod,
        couponCode: coupon?.code || null,
      });
      clearCart();
      toast.success('Đặt hàng thành công! 🎉');
      router.push(`/order-success?code=${data.orderCode}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đặt hàng thất bại, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-5" style={{ backgroundColor: '#09090b' }}>
        <span className="text-6xl opacity-20">🛒</span>
        <p className="font-['Cormorant_Garamond'] text-2xl text-white/40">Giỏ hàng trống</p>
        <button onClick={() => router.push('/')} className="px-8 py-3 border border-[rgba(201,169,110,0.4)] text-[10px] tracking-[0.22em] uppercase text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black transition-all duration-300 cursor-pointer bg-transparent">
          Quay Lại Mua Sắm
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20 px-5 sm:px-8" style={{ backgroundColor: '#09090b' }}>
      <div className="max-w-6xl mx-auto mb-10 md:mb-14">
        <p className="text-[9px] tracking-[0.35em] uppercase text-[#C9A96E] mb-3">Đặt Hàng</p>
        <h1 className="font-['Cormorant_Garamond'] font-light text-white" style={{ fontSize: 'clamp(32px,4vw,56px)' }}>
          Thông Tin <em className="italic text-[#C9A96E]">Giao Hàng</em>
        </h1>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-16 items-start">

        {/* ── Form ──────────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate className="space-y-10">

          {/* Contact */}
          <fieldset className="space-y-6 pb-10" style={{ border: 'none', borderBottom: '1px solid rgba(245,240,232,0.06)' }}>
            <legend className="text-[10px] tracking-[0.25em] uppercase text-white/40 mb-6 block">Thông Tin Liên Hệ</legend>
            <div>
              <label className="block text-[9px] tracking-[0.2em] uppercase text-white/35 mb-2">Họ &amp; Tên *</label>
              <input {...getInputProps('fullName')} placeholder="Nguyễn Văn A" />
              {errors.fullName && <p className="text-red-400/80 text-[10px] mt-1.5">{errors.fullName}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[9px] tracking-[0.2em] uppercase text-white/35 mb-2">Số Điện Thoại *</label>
                <input {...getInputProps('phone')} placeholder="0901234567" type="tel" />
                {errors.phone && <p className="text-red-400/80 text-[10px] mt-1.5">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-[9px] tracking-[0.2em] uppercase text-white/35 mb-2">Email *</label>
                <input {...getInputProps('email')} placeholder="email@example.com" type="email" />
                {errors.email && <p className="text-red-400/80 text-[10px] mt-1.5">{errors.email}</p>}
              </div>
            </div>
          </fieldset>

          {/* Address */}
          <fieldset className="space-y-6 pb-10" style={{ border: 'none', borderBottom: '1px solid rgba(245,240,232,0.06)' }}>
            <legend className="text-[10px] tracking-[0.25em] uppercase text-white/40 mb-6 block">Địa Chỉ Giao Hàng</legend>
            <div>
              <label className="block text-[9px] tracking-[0.2em] uppercase text-white/35 mb-2">Tỉnh / Thành Phố *</label>
              <select value={province} onChange={e => setProvince(e.target.value)}
                className="w-full bg-[#09090b] border-b border-[rgba(245,240,232,0.12)] focus:border-[#C9A96E] pb-3 text-[13px] text-white/80 outline-none cursor-pointer transition-colors duration-300 appearance-none">
                {PROVINCES.map(p => <option key={p} value={p} style={{ background: '#09090b' }}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] tracking-[0.2em] uppercase text-white/35 mb-2">Địa Chỉ Cụ Thể *</label>
              <input {...getInputProps('address')} placeholder="Số nhà, tên đường, phường/xã, quận/huyện" />
              {errors.address && <p className="text-red-400/80 text-[10px] mt-1.5">{errors.address}</p>}
            </div>
            <div>
              <label className="block text-[9px] tracking-[0.2em] uppercase text-white/35 mb-2">Ghi Chú</label>
              <textarea {...getInputProps('note')} placeholder="Giao trước 6pm, gọi trước khi đến..." rows={3}
                style={{ resize: 'none', color: 'rgba(245,240,232,0.85)' }}
                className="w-full bg-transparent border-b border-[rgba(245,240,232,0.12)] focus:border-[#C9A96E] pb-3 text-[13px] outline-none placeholder:text-white/20 transition-colors duration-300" />
            </div>
          </fieldset>

          {/* Payment */}
          <fieldset className="pb-6" style={{ border: 'none' }}>
            <legend className="text-[10px] tracking-[0.25em] uppercase text-white/40 mb-6 block">Phương Thức Thanh Toán</legend>
            <div className="space-y-3">
              {PAYMENT_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-start gap-4 p-4 border cursor-pointer transition-all duration-300"
                  style={{ borderColor: paymentMethod === opt.value ? 'rgba(201,169,110,0.5)' : 'rgba(245,240,232,0.08)', background: paymentMethod === opt.value ? 'rgba(201,169,110,0.04)' : 'transparent' }}>
                  <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPayment(opt.value)} className="sr-only" />
                  <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === opt.value ? 'border-[#C9A96E]' : 'border-white/20'}`}>
                    {paymentMethod === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />}
                  </div>
                  <span className="text-xl flex-shrink-0">{opt.icon}</span>
                  <div>
                    <p className="text-[13px] text-white/70">{opt.label}</p>
                    <p className="text-[11px] text-white/30 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full py-4 text-[10px] tracking-[0.28em] uppercase border border-[#C9A96E] text-[#C9A96E] bg-transparent cursor-pointer relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed">
            <span className="absolute inset-0 bg-[#C9A96E] -translate-x-full group-hover:translate-x-0 transition-transform duration-400" />
            <span className="relative z-10 group-hover:text-black transition-colors duration-400 flex items-center justify-center gap-3">
              {loading ? (<><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Đang Xử Lý...</>) : 'Xác Nhận Đặt Hàng'}
            </span>
          </button>
        </form>

        {/* ── Order Summary ──────────────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-24 space-y-4">
          <p className="text-[10px] tracking-[0.25em] uppercase text-white/40 mb-5">Đơn Hàng Của Bạn</p>

          {/* Items */}
          <div className="space-y-3 pb-4" style={{ borderBottom: '1px solid rgba(245,240,232,0.06)' }}>
            {cart.map(item => (
              <div key={item._id} className="flex gap-3 items-center">
                <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden" style={{ background: 'rgba(245,240,232,0.04)', border: '1px solid rgba(201,169,110,0.1)' }}>
                  {item.imageURL ? <Image src={item.imageURL} alt={item.name} fill className="object-cover" sizes="48px" /> : <div className="w-full h-full flex items-center justify-center opacity-30 text-xl">🥤</div>}
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#C9A96E] text-black text-[8px] rounded-full flex items-center justify-center font-bold">{item.quantity}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-['Cormorant_Garamond'] text-[14px] font-light text-white truncate">{item.name}</p>
                  <p className="text-[9px] uppercase text-white/25 tracking-wider">{item.category}</p>
                </div>
                <span className="font-['Cormorant_Garamond'] text-[15px] text-white/60 flex-shrink-0">{fmt(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* ── Coupon Input ────────────────────────────────────────────────── */}
          <div className="py-4" style={{ borderBottom: '1px solid rgba(245,240,232,0.06)' }}>
            <CouponInput
              subtotal={totalPrice}
              userId={user?._id}
              onApply={(data) => setCoupon(data)}
              onRemove={() => setCoupon(null)}
            />
          </div>

          {/* Totals */}
          <div className="space-y-2.5 pb-4" style={{ borderBottom: '1px solid rgba(245,240,232,0.06)' }}>
            <div className="flex justify-between text-[12px] text-white/30">
              <span>Tạm tính</span><span>{fmt(totalPrice)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[12px] text-green-400">
                <span className="flex items-center gap-1.5">
                  <span>🏷</span> {coupon?.code}
                </span>
                <span>-{fmt(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[12px]" style={{ color: shipping === 0 ? '#C9A96E' : 'rgba(245,240,232,0.3)' }}>
              <span>Vận chuyển</span>
              <span>{shipping === 0 ? 'Miễn phí' : fmt(shipping)}</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline mb-4">
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/35">Tổng Cộng</span>
            <div className="text-right">
              {discount > 0 && (
                <p className="text-[12px] text-white/25 line-through">{fmt(totalPrice + shipping)}</p>
              )}
              <span className="font-['Cormorant_Garamond'] text-2xl text-[#C9A96E]">{fmt(grand)}</span>
            </div>
          </div>

          {/* Ship notice */}
          <div className="p-4 text-[11px] text-white/30 leading-[1.8]" style={{ border: '1px solid rgba(201,169,110,0.12)', background: 'rgba(201,169,110,0.03)' }}>
            🚚 Miễn phí ship cho đơn từ <span className="text-[#C9A96E]">150,000₫</span><br/>
            ⏱ Giao trong <span className="text-white/50">30–60 phút</span> nội thành<br/>
            📧 Email xác nhận gửi ngay sau khi đặt hàng
          </div>
        </div>
      </div>
    </div>
  );
}
