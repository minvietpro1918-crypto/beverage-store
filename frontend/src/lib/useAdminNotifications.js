'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axiosConfig';

const POLL_INTERVAL = 30_000; // 30 giây poll 1 lần
const STORAGE_KEY   = 'sip_last_order_check';

/**
 * useAdminNotifications
 * Polling-based real-time notifications cho Admin.
 * Dùng polling thay vì WebSocket để không cần setup thêm server.
 *
 * Returns: { newOrderCount, clearCount, isConnected }
 */
export function useAdminNotifications() {
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [isPolling,     setIsPolling]     = useState(false);
  const timerRef = useRef(null);
  const lastCheckRef = useRef(
    () => localStorage.getItem(STORAGE_KEY) || new Date(Date.now() - 60_000).toISOString()
  );

  const checkNewOrders = useCallback(async () => {
    try {
      const since = lastCheckRef.current();
      const { data } = await api.get('/orders', {
        params: { since, limit: 5, status: 'pending' },
      });

      const newOrders = (data.orders || []).filter(
        o => new Date(o.createdAt) > new Date(since)
      );

      if (newOrders.length > 0) {
        setNewOrderCount(prev => prev + newOrders.length);

        newOrders.forEach(order => {
          toast(
            (t) => (
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">🛒</span>
                <div className="flex-1">
                  <p className="font-semibold text-[13px]">Đơn hàng mới!</p>
                  <p className="text-[11px] opacity-70 mt-0.5">
                    {order.customer?.fullName} · {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}
                  </p>
                  <p className="font-mono text-[11px] text-[#C9A96E] mt-0.5">{order.orderCode}</p>
                </div>
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    window.location.href = '/admin/orders';
                  }}
                  className="text-[10px] text-[#C9A96E] hover:underline cursor-pointer bg-transparent border-none flex-shrink-0">
                  Xem →
                </button>
              </div>
            ),
            {
              duration:  8000,
              style: {
                background: '#141414',
                color: '#F5F0E8',
                border: '1px solid rgba(201,169,110,0.3)',
                borderRadius: 0,
                padding: '14px 16px',
                maxWidth: 360,
              },
            }
          );
        });

        // Phát âm thanh thông báo nếu trình duyệt hỗ trợ
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.4);
        } catch {}
      }

      // Cập nhật thời điểm check mới nhất
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, now);
      lastCheckRef.current = () => now;
    } catch (err) {
      // Silent fail — không muốn spam lỗi khi mất kết nối tạm thời
    }
  }, []);

  const start = useCallback(() => {
    if (timerRef.current) return;
    setIsPolling(true);
    checkNewOrders(); // Check ngay lập tức
    timerRef.current = setInterval(checkNewOrders, POLL_INTERVAL);
  }, [checkNewOrders]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const clearCount = useCallback(() => setNewOrderCount(0), []);

  useEffect(() => {
    return () => stop(); // Cleanup khi unmount
  }, [stop]);

  return { newOrderCount, clearCount, isPolling, start, stop };
}
