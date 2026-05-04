'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const MILESTONES = [
  { year: '2019', text: 'Những tách trà đầu tiên được pha chế trong căn bếp nhỏ ở Quận 1.' },
  { year: '2021', text: 'Ra mắt cửa hàng flagship — nơi hội tụ của những người yêu thức uống thượng hạng.' },
  { year: '2023', text: 'Hợp tác với 12 nông trại tại các vùng nguyên liệu nổi tiếng nhất Việt Nam.' },
  { year: '2025', text: 'Mở rộng bộ sưu tập với hơn 40 loại thức uống theo mùa.' },
];

const titleVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.8,
      ease: [0.21, 1.11, 0.81, 0.99]
    }
  })
};

export default function StorySection() {
  return (
    <section id="story" className="pt-20 md:pt-32 overflow-hidden flex flex-col">
      {/* Top label */}
      <div className="px-5 sm:px-8 md:px-[8%] mb-12 md:mb-20 fade-up">
        <p className="text-[9px] tracking-[0.35em] uppercase text-[#C9A96E] mb-4 md:mb-5">Câu Chuyện Của Chúng Tôi</p>
        {/* Kinetic Typography Title */}
        <motion.h2 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="font-['Cormorant_Garamond'] font-light leading-[1] tracking-[-0.01em]"
          style={{ fontSize: 'clamp(36px,5vw,72px)' }}>
          <motion.div custom={1} variants={titleVariants} className="overflow-hidden">Sinh Ra Từ</motion.div>
          <motion.div custom={2} variants={titleVariants} className="overflow-hidden">
            <em className="italic">Niềm Đam Mê</em>
          </motion.div>
        </motion.h2>
      </div>

      {/* Layout: image left + text right on desktop, stacked on mobile */}
      <div className="flex flex-col md:flex-row gap-0">
        {/* Image block */}
        <div className="w-full md:w-1/2 h-[50vw] md:h-[70vh] min-h-[280px] relative fade-up">
          <Image
            src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=85&auto=format&fit=crop"
            alt="Câu chuyện Sip & Brew"
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 50vw"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 60%, #0A0A0A 100%)' }} />
          <div className="absolute inset-0 md:hidden" style={{ background: 'linear-gradient(to top, #0A0A0A 10%, transparent 60%)' }} />
        </div>

        {/* Text block */}
        <div className="w-full md:w-1/2 px-5 sm:px-8 md:pl-16 lg:pl-24 md:pr-[8%] py-10 md:py-20 flex flex-col justify-center fade-up" style={{ transitionDelay: '0.15s' }}>
          <p className="text-[13px] md:text-[15px] text-white/50 leading-[1.9] font-light mb-10 md:mb-14 max-w-md">
            Sip & Brew bắt đầu từ một câu hỏi đơn giản: <em className="text-white/70 not-italic">"Tại sao thức uống ngon lại khó tìm đến vậy?"</em>
            <br /><br />
            Từ đó, chúng tôi dành nhiều năm để tìm kiếm, chọn lọc và hoàn thiện từng công thức — không phải để tạo ra sản phẩm, mà để mang lại trải nghiệm.
          </p>

          {/* Timeline */}
          <div className="space-y-6 md:space-y-8">
            {MILESTONES.map(({ year, text }, i) => (
              <div key={year} className="flex gap-5 md:gap-8 items-start fade-up" style={{ transitionDelay: `${0.2 + i * 0.1}s` }}>
                <div className="flex-shrink-0">
                  <span className="font-['Cormorant_Garamond'] text-[28px] md:text-[32px] font-light text-[#C9A96E]/60">{year}</span>
                </div>
                <div className="pt-2 border-t border-[rgba(245,240,232,0.08)] flex-1">
                  <p className="text-[11px] md:text-[12px] text-white/35 leading-[1.75] font-light">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
