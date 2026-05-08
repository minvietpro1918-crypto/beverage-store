'use client';

import { useState, useRef } from 'react';
import api from '@/lib/axiosConfig';

const fmt = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

/**
 * CouponInput
 * Props:
 *   subtotal      — tổng tiền chưa giảm
 *   onApply(data) — callback khi áp dụng thành công: { code, discount, finalTotal, description }
 *   onRemove()    — callback khi gỡ coupon
 *   userId        — optional, ID user đã đăng nhập
 */
export default function CouponInput({ subtotal, onApply, onRemove, userId }) {
  const inputRef        = useRef(null);
  const [loading,   setLoading]   = useState(false);
  const [applied,   setApplied]   = useState(null);   // coupon đang áp dụng
  const [error,     setError]     = useState('');
  const [shake,     setShake]     = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleApply = async () => {
    const code = inputRef.current?.value?.trim();
    if (!code) { setError('Vui lòng nhập mã giảm giá.'); return; }
    setError('');

    try {
      setLoading(true);
      const { data } = await api.post('/coupons/validate', { code, orderTotal: subtotal, userId });
      setApplied(data);
      onApply?.(data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Mã không hợp lệ.';
      setError(msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setApplied(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
    onRemove?.();
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <p className="text-[9px] tracking-[0.25em] uppercase text-white/30">Mã Giảm Giá</p>

      {/* Applied state */}
      {applied ? (
        <div
          className="flex items-center justify-between px-4 py-3 transition-all duration-300"
          style={{ border: '1px solid rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.05)' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-green-400 text-sm">✓</span>
            <div>
              <p className="font-mono text-[13px] text-green-400 tracking-[0.08em]">{applied.code}</p>
              <p className="text-[10px] text-white/35 mt-0.5">{applied.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-['Cormorant_Garamond'] text-[16px] text-green-400">
              -{fmt(applied.discount)}
            </span>
            <button
              onClick={handleRemove}
              className="text-white/25 hover:text-red-400 transition-colors text-xs cursor-pointer bg-transparent border-none"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        /* Input state */
        <div
          className={`flex gap-0 transition-all duration-150 ${shake ? 'translate-x-0' : ''}`}
          style={shake ? { animation: 'shake 0.5s ease' } : {}}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Nhập mã (VD: WELCOME20)"
            defaultValue=""
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            onChange={() => error && setError('')}
            className="flex-1 bg-transparent outline-none text-white/80 text-[12px] tracking-[0.08em] uppercase placeholder:text-white/20 placeholder:normal-case placeholder:tracking-normal transition-colors duration-300"
            style={{
              borderBottom: error
                ? '1px solid rgba(248,113,113,0.5)'
                : '1px solid rgba(245,240,232,0.12)',
              paddingBottom: '10px',
              fontFamily: 'monospace',
            }}
            onFocus={e  => !error && (e.target.style.borderBottomColor = 'rgba(201,169,110,0.5)')}
            onBlur={e   => !error && (e.target.style.borderBottomColor = 'rgba(245,240,232,0.12)')}
          />
          <button
            onClick={handleApply}
            disabled={loading}
            className="ml-3 px-4 py-1.5 text-[9px] tracking-[0.2em] uppercase border border-[rgba(201,169,110,0.4)] text-[#C9A96E] bg-transparent cursor-pointer transition-all duration-300 hover:bg-[#C9A96E] hover:text-black disabled:opacity-40 flex-shrink-0"
          >
            {loading ? (
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : 'Áp Dụng'}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-[10px] text-red-400/80 flex items-center gap-1.5">
          <span>⚠</span>{error}
        </p>
      )}

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
