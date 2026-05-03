'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

const SLIDES = [
  {
    id: 0, eyebrow: 'Bộ Sưu Tập Mới 2025',
    titleTop: 'Pure', titleItalic: 'Essence', titleOutline: 'Refined',
    desc: 'Từng giọt nước được chắt lọc từ thiên nhiên, mang trong mình tinh tuý của đất trời.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=90&auto=format&fit=crop',
    alt: 'Trà Sữa', bgGlow: 'rgba(13,35,24,0.85)',
  },
  {
    id: 1, eyebrow: 'Signature Collection',
    titleTop: 'Deep', titleItalic: 'Aroma', titleOutline: 'Crafted',
    desc: 'Cà phê từ cao nguyên Đà Lạt, rang mộc truyền thống — mỗi ly là một buổi sáng trọn vẹn.',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=700&q=90&auto=format&fit=crop',
    alt: 'Cà Phê', bgGlow: 'rgba(26,18,6,0.85)',
  },
  {
    id: 2, eyebrow: 'Fresh Series 2025',
    titleTop: 'Wild', titleItalic: 'Garden', titleOutline: 'Bloom',
    desc: 'Hương vị trái cây tươi giòn — đào ngọt, cam chua, sả thơm — sảng khoái từ trong ra ngoài.',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=700&q=90&auto=format&fit=crop',
    alt: 'Trà Trái Cây', bgGlow: 'rgba(10,13,26,0.85)',
  },
];

export default function HeroCarousel() {
  const [current, setCurrent]         = useState(0);
  const [transitioning, setTrans]     = useState(false);

  const goTo = useCallback((n) => {
    if (transitioning || n === current) return;
    setTrans(true);
    setTimeout(() => { setCurrent(n); setTrans(false); }, 400);
  }, [current, transitioning]);

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [next]);

  const slide = SLIDES[current];

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden flex items-center">
      {/* Background */}
      <div className="absolute inset-0 transition-all duration-700"
        style={{ background: `radial-gradient(ellipse 80% 80% at 62% 50%, ${slide.bgGlow} 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 18% 80%, rgba(201,169,110,0.06) 0%, transparent 60%)` }} />

      {/* Bottle image — hidden on small mobile, shown md+ */}
      <div
        className="hidden sm:flex absolute right-[4%] md:right-[8%] top-1/2 -translate-y-1/2 items-center justify-center"
        style={{
          width: 'min(340px,38vw)', height: 'min(500px,65vh)',
          opacity: transitioning ? 0 : 1,
          transform: `translateY(-50%) ${transitioning ? 'scale(0.97)' : 'scale(1)'}`,
          transition: 'opacity 0.5s, transform 0.5s',
        }}
      >
        <div className="relative w-full h-full animate-float"
          style={{ filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.8)) drop-shadow(0 0 60px rgba(201,169,110,0.15))' }}>
          <Image src={slide.image} alt={slide.alt} fill className="object-contain" sizes="(max-width:640px) 0px, (max-width:1024px) 38vw, 340px" priority />
        </div>
      </div>

      {/* Text content */}
      <div
        className="relative z-10 px-5 sm:px-8 md:pl-[8%] md:pr-[4%] max-w-full md:max-w-[680px]"
        style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? 'translateY(12px)' : 'none', transition: 'opacity .45s, transform .45s' }}
      >
        {/* Eyebrow */}
        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 text-[9px] md:text-[10px] tracking-[0.28em] uppercase text-[#C9A96E] hero-enter" style={{ animationDelay: '.2s' }}>
          <span className="block w-6 md:w-10 h-px bg-[#C9A96E] flex-shrink-0" />
          {slide.eyebrow}
        </div>

        {/* Title */}
        <h1 className="font-['Cormorant_Garamond'] font-light leading-[0.88] tracking-[-0.02em] mb-6 md:mb-8 hero-enter"
          style={{ fontSize: 'clamp(52px,10vw,120px)', animationDelay: '.4s' }}>
          {slide.titleTop}<br />
          <em className="italic text-[#C9A96E]">{slide.titleItalic}</em><br />
          <span style={{ WebkitTextStroke: '1px rgba(245,240,232,0.22)', color: 'transparent' }}>{slide.titleOutline}</span>
        </h1>

        {/* Desc — hide on very small screens */}
        <p className="hidden sm:block text-[12px] md:text-[13px] leading-[1.85] text-white/45 max-w-[280px] md:max-w-[300px] mb-10 md:mb-12 font-light hero-enter" style={{ animationDelay: '.6s' }}>
          {slide.desc}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 hero-enter" style={{ animationDelay: '.8s' }}>
          <button
            onClick={scrollToProducts}
            className="relative overflow-hidden px-7 md:px-9 py-3 md:py-[14px] text-[10px] tracking-[0.2em] uppercase text-white border border-[rgba(201,169,110,0.45)] bg-transparent cursor-pointer transition-colors duration-400 group"
          >
            <span className="absolute inset-0 bg-[#C9A96E] -translate-x-full group-hover:translate-x-0 transition-transform duration-400" />
            <span className="relative z-10 group-hover:text-black transition-colors duration-400">Khám Phá Ngay</span>
          </button>
          <button
            onClick={scrollToProducts}
            className="flex items-center gap-3 text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white/90 transition-colors duration-300 cursor-pointer bg-transparent border-none after:content-['→'] after:transition-transform after:duration-300 hover:after:translate-x-1.5"
          >
            Xem Bộ Sưu Tập
          </button>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 md:bottom-12 left-5 md:left-[8%] flex gap-2 md:gap-3 z-10 hero-enter" style={{ animationDelay: '1s' }}>
        {SLIDES.map((s, i) => (
          <button key={s.id} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`}
            className="h-px border-none bg-transparent p-0 transition-all duration-300 cursor-pointer"
            style={{ width: i === current ? '40px' : '20px', background: i === current ? '#C9A96E' : 'rgba(245,240,232,0.25)' }} />
        ))}
      </div>

      {/* Counter */}
      <div className="hidden md:block absolute bottom-12 right-[8%] text-[11px] text-white/25 tracking-[0.1em] z-10 hero-enter" style={{ animationDelay: '1s' }}>
        {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
      </div>

      {/* Scroll indicator */}
      <div className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-2 z-10 hero-enter" style={{ animationDelay: '1.2s' }}>
        <span className="text-[9px] tracking-[0.25em] uppercase text-white/25">Scroll</span>
        <span className="w-px h-12 block animate-scroll-pulse" style={{ background: 'linear-gradient(to bottom, rgba(201,169,110,0.5), transparent)' }} />
      </div>
    </section>
  );
}
