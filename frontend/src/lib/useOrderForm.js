'use client';

import { useRef, useState, useCallback } from 'react';

/**
 * useOrderForm
 * ─────────────────────────────────────────────────────────────────
 * Dùng useRef để lưu giá trị form thay vì useState → không re-render
 * khi gõ phím → không bị lag khi nhập liên tục.
 *
 * Validation chỉ chạy khi submit hoặc khi field bị blur.
 */
export function useOrderForm(initialUser) {
  // ── Lưu giá trị form trong ref (không trigger re-render khi gõ) ──
  const valuesRef = useRef({
    fullName:      initialUser?.username || '',
    phone:         '',
    email:         initialUser?.email   || '',
    address:       '',
    province:      'TP. Hồ Chí Minh',
    note:          '',
    paymentMethod: 'cod',
  });

  // ── Chỉ state cho errors và paymentMethod (cần re-render UI) ────
  const [errors,        setErrors]        = useState({});
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [province,      setProvince]      = useState('TP. Hồ Chí Minh');

  // ── Sync ref khi thay đổi select (cần re-render) ────────────────
  const setPayment = useCallback((v) => {
    valuesRef.current.paymentMethod = v;
    setPaymentMethod(v);
  }, []);

  const setProvinceFn = useCallback((v) => {
    valuesRef.current.province = v;
    setProvince(v);
  }, []);

  // ── onChange handler cho input/textarea (KHÔNG gây re-render) ───
  const getInputProps = useCallback((name) => ({
    name,
    defaultValue: valuesRef.current[name],
    onChange: (e) => {
      valuesRef.current[name] = e.target.value;
      // Xóa lỗi của field này nếu đang có
      if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    },
    onBlur: (e) => {
      // Validate ngay khi rời field
      const err = validateField(name, e.target.value);
      if (err) setErrors(prev => ({ ...prev, [name]: err }));
    },
    className: `w-full bg-transparent border-b pb-3 text-[13px] transition-colors duration-300 outline-none placeholder:text-white/20 ${
      errors[name]
        ? 'border-red-400/60 focus:border-red-400'
        : 'border-[rgba(245,240,232,0.12)] focus:border-[#C9A96E]'
    }`,
    style: { color: 'rgba(245,240,232,0.85)' },
  }), [errors]);

  // ── Validate từng field ──────────────────────────────────────────
  const validateField = (name, value) => {
    switch (name) {
      case 'fullName': return !value.trim() ? 'Vui lòng nhập họ tên' : value.trim().length < 2 ? 'Tên quá ngắn' : '';
      case 'phone':    return !/^0\d{9}$/.test(value.trim()) ? 'Số điện thoại 10 số, bắt đầu bằng 0' : '';
      case 'email':    return !/^\S+@\S+\.\S+$/.test(value.trim()) ? 'Email không hợp lệ' : '';
      case 'address':  return !value.trim() ? 'Vui lòng nhập địa chỉ' : '';
      default:         return '';
    }
  };

  // ── Validate toàn bộ form trước khi submit ───────────────────────
  const validateAll = useCallback(() => {
    const v      = valuesRef.current;
    const fields = ['fullName', 'phone', 'email', 'address'];
    const newErr = {};
    fields.forEach(f => {
      const err = validateField(f, v[f]);
      if (err) newErr[f] = err;
    });
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  }, []);

  // ── Lấy values để submit ─────────────────────────────────────────
  const getValues = useCallback(() => ({ ...valuesRef.current }), []);

  return {
    getInputProps, getValues, validateAll,
    errors, paymentMethod, province,
    setPayment, setProvince: setProvinceFn,
  };
}
