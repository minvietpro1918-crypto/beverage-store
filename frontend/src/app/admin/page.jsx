'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axiosConfig';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [p, u] = await Promise.all([
          api.get('/products/admin/all'),
          api.get('/users'),
        ]);
        // Tùy vào API backend trả về trường "total" hay đếm độ dài mảng
        setStats({ 
          products: p.data.total || p.data.products?.length || 0, 
          users: u.data.total || u.data.users?.length || 0 
        });
      } catch {}
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Tổng Sản Phẩm', value: stats.products, icon: '🥤', accent: 'group-hover:text-gold' },
    { label: 'Tổng Người Dùng', value: stats.users,  icon: '👥', accent: 'group-hover:text-emerald-400' },
  ];

  return (
    <div className="p-8 min-h-screen bg-black/0 text-cream">
      <h1 className="font-display text-4xl font-bold text-gold mb-8">Tổng Quan Hệ Thống</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {cards.map((c) => (
          <div key={c.label} 
            className="group bg-emerald/10 backdrop-blur-xl border border-white/10 p-8 rounded-3xl transition-all duration-500 hover:bg-emerald/20 hover:border-gold/40 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(201,169,110,0.15)] relative overflow-hidden cursor-default">
            
            {/* Background Icon (Mờ) */}
            <div className="absolute -right-4 -top-4 text-9xl opacity-5 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12 pointer-events-none">
              {c.icon}
            </div>
            
            {/* Content */}
            <span className="text-4xl block mb-6 drop-shadow-lg">{c.icon}</span>
            <div className="relative z-10">
              {loading ? (
                <div className="h-12 w-20 bg-white/10 rounded-lg animate-pulse mb-2"></div>
              ) : (
                <div className={`text-6xl font-bold text-cream mb-2 transition-colors duration-500 ${c.accent}`}>
                  {c.value}
                </div>
              )}
              <div className="text-sm font-bold text-cream/50 uppercase tracking-[0.2em]">{c.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}