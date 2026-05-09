'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import MagneticButton from '@/components/ui/MagneticButton';
import { motion, useMotionValue, useTransform } from 'framer-motion';

// Slide 3 (Wild Garden) đã được tách ra thành ScrollSequenceHero riêng biệt
// File này chỉ giữ slide 1 và 2 làm carousel bình thường
const SLIDES = [
  {
    id: 0, eyebrow: 'Ưu Đãi Vận Chuyển',
    titleTop: 'Miễn Phí', titleItalic: 'Giao Hàng', titleOutline: 'Siêu Tốc',
    desc: 'Nhận ngay ưu đãi miễn phí vận chuyển tận nơi cho tất cả các đơn hàng có giá trị từ 150.000đ trở lên.',
    image: '/images/tangerine-newt-removebg-preview.png', // Thay tên file cho khớp với ảnh 1 của bạn
    alt: 'Giao hàng', bgGlow: 'rgba(13,35,24,0.85)',
  },
  {
    id: 1, eyebrow: 'Khuyến Mãi Đặc Biệt',
    titleTop: 'Săn Mã', titleItalic: 'Giảm Giá', titleOutline: 'Cực Khủng',
    desc: 'Đừng bỏ lỡ các mã Coupon hấp dẫn mỗi ngày. Nhập mã tại bước thanh toán để nhận ngay ưu đãi bất ngờ.',
    image: '/images/johanna-removebg-preview.png', // Thay tên file cho khớp với ảnh 2 của bạn
    alt: 'Khuyến mãi', bgGlow: 'rgba(26,18,6,0.85)',
  },
];

export default function HeroCarousel() {
  const [current, setCurrent]     = useState(0);
  const [transitioning, setTrans] = useState(false);

  // Setup hiệu ứng 3D Tilt bằng Framer Motion
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [15, -15]); // Trục Y của chuột điều khiển xoay X
  const rotateY = useTransform(mouseX, [-300, 300], [-15, 15]); // Trục X của chuột điều khiển xoay Y

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => {
    mouseX.set(0); mouseY.set(0);
  };

  const goTo = useCallback((n) => {
    if (transitioning || n === current) return;
    setTrans(true);
    setTimeout(() => { setCurrent(n); setTrans(false); }, 400);
  }, [current, transitioning]);

  useEffect(() => {
    const t = setInterval(() => goTo((current + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, [current, goTo]);

  const slide = SLIDES[current];

  const scrollToProducts = () =>
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden flex items-center" style={{ backgroundColor: '#09090b' }}>
      <div className="absolute inset-0 transition-all duration-700"
        style={{ background: `radial-gradient(ellipse 80% 80% at 62% 50%, ${slide.bgGlow} 0%, transparent 70%)` }} />

      {/* Khối chứa ảnh sản phẩm có bắt sự kiện chuột */}
      <div 
        className="hidden sm:flex absolute right-[4%] md:right-[8%] top-1/2 -translate-y-1/2 items-center justify-center z-20"
        style={{ width: 'min(340px,38vw)', height: 'min(500px,65vh)',
          opacity: transitioning ? 0 : 1,
          transform: `translateY(-50%) ${transitioning ? 'scale(0.97)' : 'scale(1)'}`,
          transition: 'opacity 0.5s, transform 0.5s' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Áp dụng 3D xoay và Bộ lọc màu điện ảnh */}
        <motion.div 
          className="relative w-full h-full animate-float"
          style={{ 
            rotateX, rotateY,
            filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.8)) drop-shadow(0 0 60px rgba(201,169,110,0.3)) saturate(1.25) contrast(1.15)' 
          }}
        >
          <Image src={slide.image} alt={slide.alt} fill className="object-contain"
            sizes="(max-width:640px) 0px,(max-width:1024px) 38vw,340px" priority />
        </motion.div>
      </div>

      {/* Text */}
      <div className="relative z-10 px-5 sm:px-8 md:pl-[8%] md:pr-[4%] max-w-full md:max-w-[680px]"
        style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? 'translateY(12px)' : 'none', transition: 'opacity .45s, transform .45s' }}>
        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 text-[9px] md:text-[10px] tracking-[0.28em] uppercase text-[#C9A96E] hero-enter" style={{ animationDelay: '.2s' }}>
          <span className="block w-6 md:w-10 h-px bg-[#C9A96E] flex-shrink-0" />
          {slide.eyebrow}
        </div>
        <h1 className="font-['Cormorant_Garamond'] font-light leading-[0.88] tracking-[-0.02em] mb-6 md:mb-8 hero-enter"
          style={{ fontSize: 'clamp(52px,10vw,120px)', animationDelay: '.4s' }}>
          {slide.titleTop}<br />
          <em className="italic text-[#C9A96E]">{slide.titleItalic}</em><br />
          <span style={{ WebkitTextStroke: '1px rgba(245,240,232,0.22)', color: 'transparent' }}>{slide.titleOutline}</span>
        </h1>
        <p className="hidden sm:block text-[12px] md:text-[13px] leading-[1.85] text-white/45 max-w-[300px] mb-10 font-light hero-enter" style={{ animationDelay: '.6s' }}>
          {slide.desc}
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8 hero-enter" style={{ animationDelay: '.8s' }}>
          <MagneticButton>
            <button onClick={scrollToProducts}
              className="relative overflow-hidden px-7 md:px-9 py-3 md:py-[14px] text-[10px] tracking-[0.2em] uppercase text-white border border-[rgba(201,169,110,0.45)] bg-transparent cursor-pointer group">
              <span className="absolute inset-0 bg-[#C9A96E] -translate-x-full group-hover:translate-x-0 transition-transform duration-400" />
              <span className="relative z-10 group-hover:text-black transition-colors duration-400">Khám Phá Ngay</span>
            </button>
          </MagneticButton>
          <MagneticButton>
            <button onClick={scrollToProducts}
              className="flex items-center gap-3 text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white/90 transition-colors duration-300 cursor-pointer bg-transparent border-none after:content-['→'] after:transition-transform after:duration-300 hover:after:translate-x-1.5">
              Xem Bộ Sưu Tập
            </button>
          </MagneticButton>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 md:bottom-12 left-5 md:left-[8%] flex gap-2 md:gap-3 z-10">
        {SLIDES.map((s, i) => (
          <button key={s.id} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`}
            className="h-px border-none bg-transparent p-0 transition-all duration-300 cursor-pointer"
            style={{ width: i === current ? '40px' : '20px', background: i === current ? '#C9A96E' : 'rgba(245,240,232,0.25)' }} />
        ))}
      </div>
    </section>
  );
}
