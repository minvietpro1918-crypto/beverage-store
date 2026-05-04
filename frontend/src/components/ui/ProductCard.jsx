'use client';

import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

const CATEGORY_BG = {
  'trà sữa':      'linear-gradient(135deg,#0D2318 0%,#0A0A0A 100%)',
  'cà phê':       'linear-gradient(135deg,#1a1206 0%,#0A0A0A 100%)',
  'nước suối':    'linear-gradient(135deg,#06101a 0%,#0A0A0A 100%)',
  'nước ép':      'linear-gradient(135deg,#1a0d06 0%,#0A0A0A 100%)',
  'sinh tố':      'linear-gradient(135deg,#0a1a0d 0%,#0A0A0A 100%)',
  'trà trái cây': 'linear-gradient(135deg,#0a0d1a 0%,#0A0A0A 100%)',
  'khác':         'linear-gradient(135deg,#141414 0%,#0A0A0A 100%)',
};

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

export default function ProductCard({ product, index = 0, expandHandlers = {} }) {
  const { addToCart } = useCart();
  const bg = CATEGORY_BG[product.category] ?? CATEGORY_BG['khác'];

  return (
    <motion.div
      className="product-card relative group w-full"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: (index % 2) * 0.15, ease: [0.21, 1.11, 0.81, 0.99] }}
    >
      <div
        className="card-inner relative overflow-hidden border transition-all duration-500"
        style={{
          background: bg,
          borderColor: 'rgba(245,240,232,0.06)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(201,169,110,0.22)';
          expandHandlers.onMouseEnter?.();
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(245,240,232,0.06)';
          expandHandlers.onMouseLeave?.();
        }}
      >
        {/* Serial number */}
        <span className="absolute top-4 right-[18px] font-['Cormorant_Garamond'] text-[11px] text-white/10 tracking-[0.05em] z-10">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Image container */}
        <div className="relative h-[280px] flex items-center justify-center px-6 pt-8 pb-4 overflow-hidden">
          {/* Radial glow behind bottle */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-3/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(201,169,110,0.12) 0%, transparent 70%)' }}
          />

          {product.imageURL ? (
            <div className="relative w-full h-full transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-3 group-hover:scale-[1.05]"
              style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.65))' }}>
              <Image
                src={product.imageURL}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width:768px) 50vw, 280px"
              />
            </div>
          ) : (
            <span className="text-6xl transition-transform duration-700 group-hover:-translate-y-3">🥤</span>
          )}
        </div>

        {/* Card body */}
        <div className="px-6 pb-7 pt-1">
          {/* Badge row */}
          <div className="flex items-center gap-2 mb-3">
            {product.isNew && (
              <span className="inline-flex px-2.5 py-1 text-[9px] tracking-[0.15em] uppercase border border-[rgba(201,169,110,0.3)] text-[rgba(201,169,110,0.65)]">
                New
              </span>
            )}
            {product.isLimited && (
              <span className="inline-flex px-2.5 py-1 text-[9px] tracking-[0.15em] uppercase border border-[rgba(245,240,232,0.15)] text-white/35">
                Limited
              </span>
            )}
          </div>

          {/* Category */}
          <p className="text-[9px] tracking-[0.25em] uppercase text-[#C9A96E]/70 mb-2">
            {product.category}
          </p>

          {/* Name */}
          <h3
            className="font-['Cormorant_Garamond'] text-[20px] font-light leading-[1.2] mb-2 transition-colors duration-300 group-hover:text-[#C9A96E]"
          >
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-[11px] font-light leading-[1.65] text-white/30 mb-5 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="font-['Cormorant_Garamond'] text-[22px] font-[400] text-white">
              <sub className="text-[11px] font-['DM_Sans'] font-light text-white/35 mr-0.5 align-baseline">₫</sub>
              {(product.price / 1000).toFixed(0)},000
            </div>

            <button
              onClick={() => addToCart(product)}
              {...expandHandlers}
              aria-label="Thêm vào giỏ hàng"
              className="w-9 h-9 flex items-center justify-center border border-[rgba(201,169,110,0.3)] text-[#C9A96E] text-lg
                         cursor-none bg-transparent
                         transition-all duration-300
                         group-hover:bg-[#C9A96E] group-hover:text-black group-hover:border-[#C9A96E]"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
