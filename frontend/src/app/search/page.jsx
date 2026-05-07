'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import api from '@/lib/axiosConfig';
import toast from 'react-hot-toast';

const fmt = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

function SearchContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const q            = searchParams.get('q') || '';
  const { addToCart } = useCart();

  const [query,    setQuery]    = useState(q);
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (term) => {
    if (!term.trim()) { setResults([]); setSearched(false); return; }
    try {
      setLoading(true);
      setSearched(true);
      const { data } = await api.get('/products', { params: { search: term.trim(), limit: 20 } });
      setResults(data.products || []);
    } catch { toast.error('Tìm kiếm thất bại'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { doSearch(q); }, [q, doSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-5 sm:px-8 md:px-[8%]">
      {/* Search input */}
      <div className="max-w-2xl mx-auto mb-16 md:mb-20">
        <p className="text-[9px] tracking-[0.35em] uppercase text-[#C9A96E] mb-6 text-center">Tìm Kiếm</p>
        <form onSubmit={handleSubmit} className="relative">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập tên thức uống..."
            className="w-full bg-transparent border-b border-[rgba(201,169,110,0.3)] focus:border-[#C9A96E] outline-none text-white font-['Cormorant_Garamond'] font-light py-4 placeholder:text-white/20 transition-colors duration-300"
            style={{ fontSize: 'clamp(24px,4vw,40px)' }}
          />
          <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-[#C9A96E] cursor-pointer bg-transparent border-none">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </form>
      </div>

      {/* Results label */}
      {searched && !loading && (
        <p className="text-[10px] tracking-[0.25em] uppercase text-white/30 mb-8 md:mb-10">
          {results.length > 0
            ? `${results.length} kết quả cho "${q}"`
            : `Không tìm thấy kết quả cho "${q}"`}
        </p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[320px] bg-white/[0.03] animate-pulse border border-white/5" />
          ))}
        </div>
      )}

      {/* No results */}
      {searched && !loading && results.length === 0 && (
        <div className="flex flex-col items-center py-20 gap-5">
          <span className="text-6xl opacity-20">🔍</span>
          <p className="font-['Cormorant_Garamond'] text-2xl text-white/30">Không tìm thấy thức uống nào</p>
          <p className="text-[12px] text-white/20">Thử tìm kiếm với từ khóa khác</p>
          <button onClick={() => router.push('/#products')}
            className="mt-4 px-6 py-3 border border-[rgba(201,169,110,0.3)] text-[10px] tracking-[0.2em] uppercase text-[#C9A96E]/70 hover:text-[#C9A96E] hover:border-[#C9A96E] transition-all duration-300 cursor-pointer bg-transparent">
            Xem Tất Cả Sản Phẩm
          </button>
        </div>
      )}

      {/* Results grid */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((product, i) => (
            <div key={product._id} className="group fade-up visible border transition-all duration-500 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg,#111 0%,#0A0A0A 100%)',
                borderColor: 'rgba(245,240,232,0.06)',
                transitionDelay: `${i * 0.05}s`,
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,169,110,0.22)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(245,240,232,0.06)'}
            >
              <div className="relative h-[180px] flex items-center justify-center px-5 pt-5 overflow-hidden">
                {product.imageURL
                  ? <div className="relative w-full h-full transition-transform duration-600 group-hover:-translate-y-2 group-hover:scale-[1.04]"
                      style={{ filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.6))' }}>
                      <Image src={product.imageURL} alt={product.name} fill className="object-contain" sizes="(max-width:640px) 90vw, 250px" />
                    </div>
                  : <span className="text-4xl">🥤</span>
                }
              </div>
              <div className="px-5 pb-5 pt-1">
                <p className="text-[9px] tracking-widest uppercase text-[#C9A96E]/60 mb-1">{product.category}</p>
                <h3 className="font-['Cormorant_Garamond'] text-[17px] font-light group-hover:text-[#C9A96E] transition-colors duration-300 mb-3">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="font-['Cormorant_Garamond'] text-[18px]">{fmt(product.price)}</span>
                  <button onClick={() => addToCart(product)}
                    className="w-8 h-8 border border-[rgba(201,169,110,0.3)] text-[#C9A96E] cursor-pointer bg-transparent transition-all duration-300 group-hover:bg-[#C9A96E] group-hover:text-black group-hover:border-[#C9A96E] text-lg flex items-center justify-center">
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Đang tải...</div>}>
      <SearchContent />
    </Suspense>
   );
  }