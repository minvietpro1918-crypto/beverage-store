'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import StarRating from '@/components/ui/StarRating';
import ReviewSection from '@/components/sections/ReviewSection';
import api from '@/lib/axiosConfig';
import toast from 'react-hot-toast';

const fmt = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const CATEGORY_BG = {
  'trà sữa':      '#0D2318',
  'cà phê':       '#1a1206',
  'nước suối':    '#06101a',
  'nước ép':      '#1a0d06',
  'sinh tố':      '#0a1a0d',
  'trà trái cây': '#0a0d1a',
  'khác':         '#111',
};

const STATUS_MAP = {
  available:   { label: 'Còn hàng',  color: '#4ade80' },
  low:         { label: 'Sắp hết',   color: '#fbbf24' },
  unavailable: { label: 'Hết hàng',  color: '#f87171' },
};

export default function ProductDetailPage() {
  const { id }            = useParams();
  const router            = useRouter();
  const { addToCart }     = useCart();
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty]     = useState(1);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        setData(res.data);
      } catch (err) {
        if (err.response?.status === 404) router.replace('/');
        else toast.error('Không thể tải sản phẩm');
      } finally { setLoading(false); }
    })();
  }, [id]);

  const handleAddToCart = () => {
    if (!data?.product) return;
    if (data.product.stock === 0) { toast.error('Sản phẩm đã hết hàng!'); return; }
    for (let i = 0; i < qty; i++) addToCart(data.product);
    toast.success(`Đã thêm ${qty} × ${data.product.name} vào giỏ!`);
  };

  if (loading) return <ProductSkeleton />;
  if (!data?.product) return null;

  const { product, related } = data;
  const bg          = CATEGORY_BG[product.category] ?? '#111';
  const stockStatus = product.stock === 0 ? 'unavailable' : product.stock <= 5 ? 'low' : 'available';
  const statusInfo  = STATUS_MAP[stockStatus];

  return (
    <div className="min-h-screen pt-20" style={{ backgroundColor: '#09090b' }}>

      {/* Breadcrumb */}
      <div className="px-5 sm:px-8 md:px-[8%] py-5 flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-white/25">
        <Link href="/" className="hover:text-[#C9A96E] transition-colors no-underline">Trang Chủ</Link>
        <span>/</span>
        <Link href="/#products" className="hover:text-[#C9A96E] transition-colors no-underline">Sản Phẩm</Link>
        <span>/</span>
        <span className="text-white/50 truncate max-w-[180px]">{product.name}</span>
      </div>

      <div className="px-5 sm:px-8 md:px-[8%] pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* LEFT — Image */}
          <div className="lg:sticky lg:top-28">
            <div className="relative overflow-hidden flex items-center justify-center"
              style={{
                background: `radial-gradient(ellipse 80% 70% at 50% 60%, ${bg} 0%, #09090b 100%)`,
                height: 'min(560px, 70vw)',
                border: '1px solid rgba(245,240,232,0.05)',
              }}>
              {product.imageURL ? (
                <div className="relative w-full h-full transition-all duration-700"
                  style={{ opacity: imgLoaded ? 1 : 0, transform: imgLoaded ? 'none' : 'scale(0.95)', filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.8))' }}>
                  <Image src={product.imageURL} alt={product.name} fill
                    className="object-contain p-8 animate-float"
                    sizes="(max-width:1024px) 90vw, 45vw" priority
                    onLoad={() => setImgLoaded(true)} />
                </div>
              ) : (
                <span className="text-8xl animate-float">🥤</span>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase font-medium"
                style={{ background: 'rgba(9,9,11,0.85)', border: `1px solid ${statusInfo.color}30`, color: statusInfo.color }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusInfo.color }} />
                {statusInfo.label}
                {product.stock > 0 && product.stock <= 10 && (
                  <span className="ml-1 opacity-60">({product.stock} còn lại)</span>
                )}
              </div>
              <div className="absolute top-4 right-4 px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase"
                style={{ background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.25)', color: '#C9A96E' }}>
                {product.category}
              </div>
            </div>
          </div>

          {/* RIGHT — Info */}
          <div className="pt-2 lg:pt-8">
            <div className="flex items-center gap-3 mb-5 text-[9px] tracking-[0.28em] uppercase text-[#C9A96E]">
              <span className="w-6 h-px bg-[#C9A96E] flex-shrink-0" />
              {product.category}
            </div>

            <h1 className="font-['Cormorant_Garamond'] font-light text-white leading-[1.05] mb-4"
              style={{ fontSize: 'clamp(36px,5vw,64px)' }}>
              {product.name}
            </h1>

            {/* Rating summary */}
            {product.totalReviews > 0 && (
              <div className="flex items-center gap-3 mb-5">
                <StarRating value={product.avgRating} size="sm" />
                <span className="text-[11px] text-white/40">
                  {product.avgRating.toFixed(1)} · {product.totalReviews} đánh giá
                </span>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-8">
              <span className="font-['Cormorant_Garamond'] text-[42px] text-[#C9A96E] font-light">
                {fmt(product.price)}
              </span>
            </div>

            <div className="w-full h-px mb-8" style={{ background: 'rgba(245,240,232,0.06)' }} />

            {product.description && (
              <div className="mb-10">
                <p className="text-[9px] tracking-[0.25em] uppercase text-white/30 mb-3">Mô Tả</p>
                <p className="text-[14px] text-white/55 leading-[1.9] font-light">{product.description}</p>
              </div>
            )}

            {/* Highlights */}
            <div className="grid grid-cols-3 gap-3 mb-10">
              {[['🌿','Tự Nhiên 100%'],['❄️','Phục Vụ Lạnh'],['⚡','Giao 30 Phút']].map(([icon, label]) => (
                <div key={label} className="flex flex-col items-center gap-2 py-4 text-center"
                  style={{ border: '1px solid rgba(245,240,232,0.06)', background: 'rgba(245,240,232,0.02)' }}>
                  <span className="text-xl">{icon}</span>
                  <span className="text-[9px] tracking-[0.15em] uppercase text-white/30">{label}</span>
                </div>
              ))}
            </div>

            {/* Qty + Add to cart */}
            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center" style={{ border: '1px solid rgba(245,240,232,0.12)' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}
                  className="w-11 h-11 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer bg-transparent border-none text-lg disabled:opacity-30">−</button>
                <span className="w-10 text-center text-[15px] text-white/80">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={qty >= product.stock}
                  className="w-11 h-11 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer bg-transparent border-none text-lg disabled:opacity-30">+</button>
              </div>
              <button onClick={handleAddToCart} disabled={product.stock === 0}
                className="flex-1 h-11 text-[10px] tracking-[0.25em] uppercase relative overflow-hidden border cursor-pointer transition-all duration-300 group disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ borderColor: '#C9A96E', color: '#C9A96E', background: 'transparent' }}>
                <span className="absolute inset-0 bg-[#C9A96E] -translate-x-full group-hover:translate-x-0 group-disabled:-translate-x-full transition-transform duration-400" />
                <span className="relative z-10 group-hover:text-black group-disabled:text-[#C9A96E] transition-colors duration-400">
                  {product.stock === 0 ? 'Hết Hàng' : 'Thêm Vào Giỏ'}
                </span>
              </button>
            </div>

            {qty > 1 && (
              <p className="text-[11px] text-white/25 mb-5">
                Tổng: <span className="text-[#C9A96E]">{fmt(product.price * qty)}</span>
              </p>
            )}

            <div className="px-4 py-3 text-[11px] text-white/30 leading-[1.8]"
              style={{ border: '1px solid rgba(201,169,110,0.1)', background: 'rgba(201,169,110,0.03)' }}>
              🚚 Miễn phí ship từ <span className="text-[#C9A96E]">150,000₫</span> ·
              ⏱ Giao trong <span className="text-white/50">30–60 phút</span>
            </div>
          </div>
        </div>

        {/* ── Reviews Section ─────────────────────────────────────────────── */}
        <div className="mt-4 pt-2" style={{ borderTop: '1px solid rgba(245,240,232,0.05)' }}>
          <ReviewSection
            productId={id}
            avgRating={product.avgRating}
            totalReviews={product.totalReviews}
          />
        </div>

        {/* ── Related products ─────────────────────────────────────────────── */}
        {related?.length > 0 && (
          <div className="mt-20 md:mt-28">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[9px] tracking-[0.35em] uppercase text-[#C9A96E] mb-3">Cùng Danh Mục</p>
                <h2 className="font-['Cormorant_Garamond'] font-light text-white" style={{ fontSize: 'clamp(28px,3.5vw,48px)' }}>
                  Có Thể Bạn <em className="italic text-[#C9A96E]">Sẽ Thích</em>
                </h2>
              </div>
              <Link href="/#products" className="hidden sm:flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-white/70 transition-colors no-underline after:content-['→']">
                Xem Tất Cả
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((item, i) => (
                <RelatedCard key={item._id} product={item} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RelatedCard({ product }) {
  const { addToCart } = useCart();
  const bg = CATEGORY_BG[product.category] ?? '#111';
  return (
    <Link href={`/products/${product._id}`} className="group block no-underline">
      <div className="relative overflow-hidden transition-all duration-400"
        style={{ border: '1px solid rgba(245,240,232,0.06)', background: `linear-gradient(135deg, ${bg} 0%, #09090b 100%)` }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,169,110,0.25)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(245,240,232,0.06)'}>
        <div className="relative h-[150px] sm:h-[180px] flex items-center justify-center p-4 overflow-hidden">
          {product.imageURL ? (
            <div className="relative w-full h-full transition-transform duration-600 group-hover:-translate-y-2 group-hover:scale-[1.05]"
              style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.6))' }}>
              <Image src={product.imageURL} alt={product.name} fill className="object-contain" sizes="200px" />
            </div>
          ) : <span className="text-4xl">🥤</span>}
        </div>
        <div className="px-4 pb-4">
          <p className="text-[8px] tracking-[0.2em] uppercase text-[#C9A96E]/60 mb-1">{product.category}</p>
          <h3 className="font-['Cormorant_Garamond'] text-[16px] font-light text-white group-hover:text-[#C9A96E] transition-colors duration-300 leading-tight mb-2 line-clamp-2">
            {product.name}
          </h3>
          {product.avgRating > 0 && (
            <div className="mb-2">
              <StarRating value={product.avgRating} size="sm" showCount count={product.totalReviews} />
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="font-['Cormorant_Garamond'] text-[15px] text-white/70">{fmt(product.price)}</span>
            <button onClick={e => { e.preventDefault(); addToCart(product); }}
              className="w-7 h-7 border border-[rgba(201,169,110,0.3)] text-[#C9A96E] flex items-center justify-center cursor-pointer bg-transparent text-base transition-all duration-200 group-hover:bg-[#C9A96E] group-hover:text-black">+</button>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ProductSkeleton() {
  return (
    <div className="min-h-screen pt-24 px-5 sm:px-8 md:px-[8%] pb-24" style={{ backgroundColor: '#09090b' }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <div className="h-[460px] animate-pulse" style={{ background: 'rgba(245,240,232,0.04)', border: '1px solid rgba(245,240,232,0.05)' }} />
        <div className="pt-8 space-y-5">
          {[24, 48, 32, 1, 200, 40].map((h, i) => (
            <div key={i} className="animate-pulse rounded" style={{ height: h, background: 'rgba(245,240,232,0.05)', width: i === 2 ? '40%' : '100%' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
