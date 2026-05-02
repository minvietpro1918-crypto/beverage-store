'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import api from '@/lib/axiosConfig';
import toast from 'react-hot-toast';

const CATEGORIES = ['tất cả', 'trà sữa', 'cà phê', 'nước suối', 'nước ép', 'sinh tố', 'trà trái cây'];

export default function ProductGrid({ expandHandlers = {} }) {
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeCategory, setCategory] = useState('tất cả');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const params = { limit: 6 };
        if (activeCategory !== 'tất cả') params.category = activeCategory;
        const { data } = await api.get('/products', { params });
        setProducts(data.products);
      } catch {
        toast.error('Không thể tải sản phẩm');
      } finally {
        setLoading(false);
      }
    })();
  }, [activeCategory]);

  return (
    <section id="products" className="pb-36">
      {/* Section header */}
      <div className="flex items-end justify-between px-[8%] pt-28 pb-16 fade-up">
        <div>
          <p className="text-[9px] tracking-[0.35em] uppercase text-[#C9A96E] mb-5">Nổi Bật</p>
          <h2
            className="font-['Cormorant_Garamond'] font-light leading-[1] tracking-[-0.01em]"
            style={{ fontSize: 'clamp(42px,5vw,72px)' }}
          >
            Tuyển Chọn<br />
            <em className="italic">Đặc Biệt</em>
          </h2>
        </div>
        <button
          {...expandHandlers}
          className="flex items-center gap-3 text-[10px] tracking-[0.2em] uppercase text-white/35 hover:text-white/80 transition-colors duration-300 cursor-none bg-transparent border-none
                     after:content-['→'] after:transition-transform after:duration-300 hover:after:translate-x-1.5"
        >
          Xem Tất Cả
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-3 px-[8%] mb-12 flex-wrap fade-up" style={{ transitionDelay: '0.1s' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            {...expandHandlers}
            className="px-5 py-2 text-[9px] tracking-[0.2em] uppercase transition-all duration-300 cursor-none border bg-transparent"
            style={{
              borderColor: activeCategory === cat ? 'rgba(201,169,110,0.6)' : 'rgba(245,240,232,0.1)',
              color: activeCategory === cat ? '#C9A96E' : 'rgba(245,240,232,0.3)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Asymmetric grid */}
      <div className="px-[8%]">
        {loading ? (
          /* Skeleton */
          <div className="grid grid-cols-12 gap-5">
            {[
              'col-span-4','col-span-4 mt-14','col-span-4',
              'col-span-4 col-start-2 -mt-5','col-span-4 mt-10','col-span-3',
            ].map((cls, i) => (
              <div key={i} className={`${cls} h-[440px] bg-white/[0.03] animate-pulse border border-white/5`} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-white/20">
            <span className="text-5xl mb-4">🔍</span>
            <p className="text-sm tracking-widest uppercase">Không tìm thấy sản phẩm</p>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-5">
            {products.map((product, i) => {
              // Intentional asymmetric offsets
              const layouts = [
                'col-span-4',
                'col-span-4 mt-14',
                'col-span-4',
                'col-span-4 col-start-2 -mt-5',
                'col-span-4 mt-10',
                'col-span-3',
              ];
              return (
                <div key={product._id} className={layouts[i] ?? 'col-span-4'}>
                  <ProductCard
                    product={product}
                    index={i}
                    expandHandlers={expandHandlers}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
