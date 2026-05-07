'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

const CARD_BG = {
  'trà sữa':      'linear-gradient(135deg,#0D2318 0%,#0A0A0A 100%)',
  'cà phê':       'linear-gradient(135deg,#1a1206 0%,#0A0A0A 100%)',
  'nước suối':    'linear-gradient(135deg,#06101a 0%,#0A0A0A 100%)',
  'nước ép':      'linear-gradient(135deg,#1a0d06 0%,#0A0A0A 100%)',
  'sinh tố':      'linear-gradient(135deg,#0a1a0d 0%,#0A0A0A 100%)',
  'trà trái cây': 'linear-gradient(135deg,#0a0d1a 0%,#0A0A0A 100%)',
  'khác':         'linear-gradient(135deg,#141414 0%,#0A0A0A 100%)',
};

const fmt = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart();
  const bg            = CARD_BG[product.category] ?? CARD_BG['khác'];
  const isOutOfStock  = product.stock === 0;
  const isLowStock    = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group fade-up h-full" style={{ transitionDelay: `${index * 0.07}s` }}>
      <div
        className="relative overflow-hidden border transition-all duration-500 h-full flex flex-col"
        style={{ background: bg, borderColor: 'rgba(245,240,232,0.06)' }}
        onMouseEnter={e => !isOutOfStock && (e.currentTarget.style.borderColor = 'rgba(201,169,110,0.22)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(245,240,232,0.06)')}
      >
        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center"
            style={{ background: 'rgba(9,9,11,0.65)', backdropFilter: 'blur(2px)' }}>
            <span className="text-[10px] tracking-[0.25em] uppercase text-white/40 border border-white/15 px-4 py-2">
              Hết Hàng
            </span>
          </div>
        )}

        {/* Serial + Low stock badge */}
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
          <span className="font-['Cormorant_Garamond'] text-[11px] text-white/10">{String(index + 1).padStart(2, '0')}</span>
          {isLowStock && (
            <span className="text-[8px] tracking-[0.15em] uppercase px-2 py-0.5"
              style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
              Sắp hết
            </span>
          )}
        </div>

        {/* Image — clickable to detail */}
        <Link href={`/products/${product._id}`} className="block no-underline">
          <div className="relative h-[200px] sm:h-[240px] flex items-center justify-center px-6 pt-6 pb-3 overflow-hidden">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-3/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(201,169,110,0.12) 0%, transparent 70%)' }} />
            {product.imageURL ? (
              <div className="relative w-full h-full transition-transform duration-700 group-hover:-translate-y-3 group-hover:scale-[1.05]"
                style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.65))' }}>
                <Image src={product.imageURL} alt={product.name} fill className="object-contain"
                  sizes="(max-width:640px) 90vw,(max-width:1024px) 45vw,280px" />
              </div>
            ) : (
              <span className="text-5xl group-hover:-translate-y-2 transition-transform duration-500">🥤</span>
            )}
          </div>
        </Link>

        {/* Body */}
        <div className="px-5 pb-5 pt-1 flex flex-col flex-1">
          <p className="text-[9px] tracking-[0.22em] uppercase text-[#C9A96E]/70 mb-1.5">{product.category}</p>

          <Link href={`/products/${product._id}`} className="no-underline flex-1">
            <h3 className="font-['Cormorant_Garamond'] text-[18px] sm:text-[20px] font-light leading-[1.2] mb-1.5 group-hover:text-[#C9A96E] transition-colors duration-300"
              style={{ color: '#F5F0E8' }}>
              {product.name}
            </h3>
          </Link>

          {product.description && (
            <p className="text-[11px] text-white/28 leading-[1.6] mb-4 line-clamp-2 font-light">{product.description}</p>
          )}

          <div className="flex items-center justify-between mt-auto">
            <span className="font-['Cormorant_Garamond'] text-[20px] text-white">
              <sub className="text-[10px] font-['DM_Sans'] text-white/30 mr-0.5 align-baseline">₫</sub>
              {(product.price / 1000).toFixed(0)},000
            </span>
            <button
              onClick={() => !isOutOfStock && addToCart(product)}
              disabled={isOutOfStock}
              aria-label="Thêm vào giỏ"
              className="w-9 h-9 flex items-center justify-center border border-[rgba(201,169,110,0.3)] text-[#C9A96E] text-lg cursor-pointer bg-transparent transition-all duration-300 group-hover:bg-[#C9A96E] group-hover:text-black group-hover:border-[#C9A96E] disabled:opacity-30 disabled:cursor-not-allowed disabled:group-hover:bg-transparent disabled:group-hover:text-[#C9A96E]"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
