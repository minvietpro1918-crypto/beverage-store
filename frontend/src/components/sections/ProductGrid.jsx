'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import api from '@/lib/axiosConfig';
import toast from 'react-hot-toast';
import { motion, useScroll, useTransform } from 'framer-motion';

const CATEGORIES = ['tất cả', 'trà sữa', 'cà phê', 'nước suối', 'nước ép', 'sinh tố', 'trà trái cây'];

const CARD_BG = {
  'trà sữa':      'linear-gradient(135deg,#0D2318 0%,#0A0A0A 100%)',
  'cà phê':       'linear-gradient(135deg,#1a1206 0%,#0A0A0A 100%)',
  'nước suối':    'linear-gradient(135deg,#06101a 0%,#0A0A0A 100%)',
  'nước ép':      'linear-gradient(135deg,#1a0d06 0%,#0A0A0A 100%)',
  'sinh tố':      'linear-gradient(135deg,#0a1a0d 0%,#0A0A0A 100%)',
  'trà trái cây': 'linear-gradient(135deg,#0a0d1a 0%,#0A0A0A 100%)',
  'khác':         'linear-gradient(135deg,#141414 0%,#0A0A0A 100%)',
};

function ProductCard({ product, index }) {
  const { addToCart } = useCart();
  const bg = CARD_BG[product.category] ?? CARD_BG['khác'];

  return (
    <motion.div 
      className="group w-full h-full"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: (index % 2) * 0.15, ease: [0.21, 1.11, 0.81, 0.99] }}
    >
      <div
        className="relative overflow-hidden border transition-all duration-500 h-full flex flex-col"
        style={{ background: bg, borderColor: 'rgba(245,240,232,0.06)' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,169,110,0.22)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(245,240,232,0.06)'}
      >
        <span className="absolute top-4 right-4 font-['Cormorant_Garamond'] text-[11px] text-white/10 z-10">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Khung ảnh Responsive cao hơn để phù hợp với layout 2 cột */}
        <div className="relative w-full h-[260px] md:h-[340px] lg:h-[420px] flex items-center justify-center px-6 pt-8 pb-3 overflow-hidden">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-3/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(201,169,110,0.12) 0%, transparent 70%)' }} />
          {product.imageURL ? (
            <div className="relative w-full h-full transition-transform duration-700 group-hover:-translate-y-3 group-hover:scale-[1.05]"
              style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.65))' }}>
              <Image src={product.imageURL} alt={product.name} fill className="object-contain" sizes="(max-width:640px) 90vw, (max-width:1024px) 45vw, 30vw" />
            </div>
          ) : (
            <span className="text-5xl group-hover:-translate-y-2 transition-transform duration-500">🥤</span>
          )}
        </div>

        <div className="px-5 pb-6 pt-1 flex flex-col flex-1">
          <p className="text-[9px] tracking-[0.22em] uppercase text-[#C9A96E]/70 mb-1.5">{product.category}</p>
          <h3 className="font-['Cormorant_Garamond'] text-[18px] sm:text-[20px] lg:text-[22px] font-light leading-[1.2] mb-1.5 group-hover:text-[#C9A96E] transition-colors duration-300">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-[11px] text-white/28 leading-[1.6] mb-4 line-clamp-2 font-light flex-1">{product.description}</p>
          )}
          <div className="flex items-center justify-between mt-auto pt-2">
            <span className="font-['Cormorant_Garamond'] text-[20px] sm:text-[22px] text-white">
              <sub className="text-[10px] font-['DM_Sans'] text-white/30 mr-0.5 align-baseline">₫</sub>
              {(product.price / 1000).toFixed(0)},000
            </span>
            <button onClick={() => addToCart(product)} aria-label="Thêm vào giỏ"
              className="w-9 h-9 flex items-center justify-center border border-[rgba(201,169,110,0.3)] text-[#C9A96E] text-lg cursor-pointer bg-transparent transition-all duration-300 group-hover:bg-[#C9A96E] group-hover:text-black group-hover:border-[#C9A96E]">
              +
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProductGrid() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [category, setCategory]   = useState('tất cả');
  const [showAll, setShowAll]     = useState(false);
  const gridRef = useRef(null);

  // Theo dõi tiến trình cuộn qua Grid để làm Parallax
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start end", "end start"]
  });
  const yRightColumn = useTransform(scrollYProgress, [0, 1], [0, -150]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const params = { limit: 12 };
        if (category !== 'tất cả') params.category = category;
        const { data } = await api.get('/products', { params });
        setProducts(data.products || []);
      } catch { toast.error('Không thể tải sản phẩm'); }
      finally { setLoading(false); }
    })();
  }, [category]);

  const displayed = showAll ? products : products.slice(0, 6);
  const leftColProducts = displayed.filter((_, i) => i % 2 === 0);
  const rightColProducts = displayed.filter((_, i) => i % 2 !== 0);

  return (
    <section id="products" className="pb-20 md:pb-32 w-full">
      {/* Bọc nội dung trong một Container giới hạn chiều rộng */}
      <div className="max-w-[1440px] mx-auto w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between px-5 sm:px-8 xl:px-4 pt-20 md:pt-28 pb-10 md:pb-14 fade-up gap-4">
          <div>
            <p className="text-[9px] tracking-[0.35em] uppercase text-[#C9A96E] mb-3 md:mb-5">Nổi Bật</p>
            <h2 className="font-['Cormorant_Garamond'] font-light leading-[1] tracking-[-0.01em]"
              style={{ fontSize: 'clamp(36px,5vw,72px)' }}>
              Tuyển Chọn<br /><em className="italic">Đặc Biệt</em>
            </h2>
          </div>
          <button onClick={() => setShowAll(true)}
            className="self-start sm:self-auto flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-white/35 hover:text-white/80 transition-colors duration-300 cursor-pointer bg-transparent border-none after:content-['→'] after:transition-transform after:duration-300 hover:after:translate-x-1.5">
            Xem Tất Cả
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 px-5 sm:px-8 xl:px-4 mb-8 md:mb-12 overflow-x-auto pb-2 fade-up scrollbar-hide" style={{ transitionDelay: '.1s' }}>
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => { setCategory(cat); setShowAll(false); }}
              className="flex-shrink-0 px-4 py-2 text-[9px] tracking-[0.18em] uppercase transition-all duration-300 cursor-pointer border bg-transparent whitespace-nowrap"
              style={{
                borderColor: category === cat ? 'rgba(201,169,110,0.6)' : 'rgba(245,240,232,0.1)',
                color: category === cat ? '#C9A96E' : 'rgba(245,240,232,0.3)',
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Layout Lưới Bất Đối Xứng (Asymmetric Grid) */}
        <div ref={gridRef} className="px-5 sm:px-8 xl:px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-20 gap-y-16">
              <div className="flex flex-col gap-16 md:gap-32">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={`l-${i}`} className="h-[450px] lg:h-[550px] bg-white/[0.03] animate-pulse border border-white/5 rounded-sm" />
                ))}
              </div>
              <div className="flex flex-col gap-16 md:gap-32 md:mt-48">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={`r-${i}`} className="h-[450px] lg:h-[550px] bg-white/[0.03] animate-pulse border border-white/5 rounded-sm" />
                ))}
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-white/20 gap-4">
              <span className="text-5xl">🔍</span>
              <p className="text-sm tracking-widest uppercase">Không tìm thấy sản phẩm</p>
            </div>
          ) : (
            <>
              {/* Desktop: 2 Cột Asymmetric Parallax */}
              <div className="hidden md:grid grid-cols-2 gap-x-10 lg:gap-x-20 gap-y-16 items-start">
                <div className="flex flex-col gap-16 md:gap-32">
                  {leftColProducts.map((product, i) => (
                    <ProductCard key={product._id} product={product} index={i * 2} />
                  ))}
                </div>
                <motion.div className="flex flex-col gap-16 md:gap-32 md:mt-48" style={{ y: yRightColumn }}>
                  {rightColProducts.map((product, i) => (
                    <ProductCard key={product._id} product={product} index={i * 2 + 1} />
                  ))}
                </motion.div>
              </div>

              {/* Mobile: 1 Cột xếp dọc tiêu chuẩn */}
              <div className="md:hidden flex flex-col gap-12">
                {displayed.map((product, i) => (
                  <ProductCard key={product._id} product={product} index={i} />
                ))}
              </div>
            </>
          )}

          {/* Load more */}
          {!showAll && products.length > 6 && (
            <div className="flex justify-center mt-10 md:mt-14">
              <button onClick={() => setShowAll(true)}
                className="px-8 py-3.5 border border-[rgba(201,169,110,0.35)] text-[10px] tracking-[0.22em] uppercase text-[#C9A96E]/70 hover:text-[#C9A96E] hover:border-[#C9A96E] transition-all duration-300 cursor-pointer bg-transparent">
                Xem Thêm ({products.length - 6} sản phẩm)
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}