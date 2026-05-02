'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

const SLIDES = [
  {
    id: 0,
    eyebrow: 'Bộ Sưu Tập Mới 2025',
    titleTop: 'Pure',
    titleItalic: 'Essence',
    titleOutline: 'Refined',
    desc: 'Từng giọt nước được chắt lọc từ thiên nhiên, mang trong mình tinh tuý của đất trời — để mỗi khoảnh khắc thưởng thức là một trải nghiệm đáng nhớ.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=90&auto=format&fit=crop',
    alt: 'Trà Sữa Đen',
    bgGlow: 'rgba(13,35,24,0.85)',
  },
  {
    id: 1,
    eyebrow: 'Signature Collection',
    titleTop: 'Deep',
    titleItalic: 'Aroma',
    titleOutline: 'Crafted',
    desc: 'Cà phê từ cao nguyên Đà Lạt, rang mộc truyền thống — mỗi ly là một buổi sáng trọn vẹn, mỗi hương thơm là một ký ức.',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=700&q=90&auto=format&fit=crop',
    alt: 'Cà Phê',
    bgGlow: 'rgba(26,18,6,0.85)',
  },
  {
    id: 2,
    eyebrow: 'Fresh Series 2025',
    titleTop: 'Wild',
    titleItalic: 'Garden',
    titleOutline: 'Bloom',
    desc: 'Hương vị trái cây tươi giòn — đào ngọt, cam chua, sả thơm — sảng khoái từ trong ra ngoài, tinh khiết không pha trộn.',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=700&q=90&auto=format&fit=crop',
    alt: 'Trà Trái Cây',
    bgGlow: 'rgba(10,13,26,0.85)',
  },
];

export default function HeroCarousel({ expandHandlers = {} }) {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const goTo = useCallback((n) => {
    if (transitioning || n === current) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(n);
      setTransitioning(false);
    }, 400);
  }, [current, transitioning]);

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [next]);

  const slide = SLIDES[current];

  return (
    <section className="relative h-screen overflow-hidden flex items-center">
      {/* Background gradient */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse 80% 80% at 62% 50%, ${slide.bgGlow} 0%, transparent 70%),
                       radial-gradient(ellipse 40% 60% at 18% 80%, rgba(201,169,110,0.06) 0%, transparent 60%)`,
        }}
      />

      {/* Floating bottle image (right side) */}
      <div
        className="absolute right-[8%] top-1/2 -translate-y-1/2 w-[min(420px,42vw)] h-[min(580px,70vh)] flex items-center justify-center"
        style={{
          opacity: transitioning ? 0 : 1,
          transform: `translateY(-50%) ${transitioning ? 'scale(0.97)' : 'scale(1)'}`,
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        <div
          className="relative w-full h-full animate-float"
          style={{ filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.8)) drop-shadow(0 0 60px rgba(201,169,110,0.15))' }}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            className="object-contain hover:scale-[1.04] transition-transform duration-700"
            sizes="(max-width:768px) 40vw, 420px"
            priority
          />
        </div>
      </div>

      {/* Text content */}
      <div
        className="relative z-10 pl-[8%] pr-[4%] max-w-[700px]"
        style={{
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'translateY(12px)' : 'translateY(0)',
          transition: 'opacity 0.45s ease, transform 0.45s ease',
        }}
      >
        {/* Eyebrow */}
        <div
          className="flex items-center gap-4 mb-6 text-[10px] tracking-[0.3em] uppercase text-[#C9A96E] hero-enter"
          style={{ animationDelay: '0.2s' }}
        >
          <span className="block w-10 h-px bg-[#C9A96E]" />
          {slide.eyebrow}
        </div>

        {/* Title */}
        <h1
          className="font-['Cormorant_Garamond'] font-light leading-[0.88] tracking-[-0.02em] mb-8 hero-enter"
          style={{ fontSize: 'clamp(60px,9vw,120px)', animationDelay: '0.4s' }}
        >
          {slide.titleTop}<br />
          <em className="italic text-[#C9A96E]">{slide.titleItalic}</em><br />
          <span
            style={{
              WebkitTextStroke: '1px rgba(245,240,232,0.22)',
              color: 'transparent',
            }}
          >
            {slide.titleOutline}
          </span>
        </h1>

        {/* Description */}
        <p
          className="text-[13px] leading-[1.85] text-white/45 max-w-[300px] mb-12 font-light hero-enter"
          style={{ animationDelay: '0.6s' }}
        >
          {slide.desc}
        </p>

        {/* CTAs */}
        <div
          className="flex items-center gap-5 hero-enter"
          style={{ animationDelay: '0.8s' }}
        >
          <BtnPrimary {...expandHandlers}>Khám Phá Ngay</BtnPrimary>
          <BtnSecondary {...expandHandlers}>Xem Bộ Sưu Tập</BtnSecondary>
        </div>
      </div>

      {/* Dots navigation */}
      <div
        className="absolute bottom-12 left-[8%] flex gap-3 hero-enter z-10"
        style={{ animationDelay: '1s' }}
      >
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            {...expandHandlers}
            aria-label={`Slide ${i + 1}`}
            className="h-px cursor-none border-none bg-transparent p-0 transition-all duration-300"
            style={{
              width: i === current ? '48px' : '24px',
              background: i === current ? '#C9A96E' : 'rgba(245,240,232,0.25)',
            }}
          />
        ))}
      </div>

      {/* Counter */}
      <div
        className="absolute bottom-12 right-[8%] text-[11px] text-white/25 tracking-[0.1em] hero-enter z-10"
        style={{ animationDelay: '1s' }}
      >
        {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 hero-enter z-10" style={{ animationDelay: '1.2s' }}>
        <span className="text-[9px] tracking-[0.25em] uppercase text-white/25">Scroll</span>
        <span className="w-px h-12 block origin-top animate-scroll-pulse"
          style={{ background: 'linear-gradient(to bottom, rgba(201,169,110,0.5), transparent)' }} />
      </div>
    </section>
  );
}

/* ─── Mini CTA components ────────────────────────────────────────────────────── */
function BtnPrimary({ children, ...props }) {
  return (
    <button
      {...props}
      className="relative overflow-hidden px-9 py-[14px] text-[10px] tracking-[0.2em] uppercase text-white border border-[rgba(201,169,110,0.45)] bg-transparent cursor-none
                 transition-colors duration-400
                 before:absolute before:inset-0 before:bg-[#C9A96E] before:-translate-x-full before:transition-transform before:duration-400
                 hover:text-black hover:before:translate-x-0"
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}

function BtnSecondary({ children, ...props }) {
  return (
    <button
      {...props}
      className="flex items-center gap-3 text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white/90 transition-colors duration-300 cursor-none bg-transparent border-none
                 after:content-['→'] after:transition-transform after:duration-300 hover:after:translate-x-1.5"
    >
      {children}
    </button>
  );
}
