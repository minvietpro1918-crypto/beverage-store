'use client';

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame
} from 'framer-motion';

export default function InfiniteMarquee() {
  const texts = Array(8).fill("PURE ESSENCE ✦ CRAFTED WITH PASSION ✦ WILD GARDEN ✦ PREMIUM BEVERAGE ✦ ");
  
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  
  // Làm mượt vận tốc cuộn chuột
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });
  
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false
  });

  // -1 là chạy từ phải sang trái (mặc định), 1 là chạy từ trái sang phải
  const directionFactor = useRef(-1);

  useAnimationFrame((t, delta) => {
    // Đổi chiều chạy của Marquee dựa vào vận tốc cuộn chuột
    const currentVelocity = velocityFactor.get();
    if (currentVelocity < 0) {
      directionFactor.current = 1; // Cuộn lên -> chạy qua phải
    } else if (currentVelocity > 0) {
      directionFactor.current = -1; // Cuộn xuống -> chạy qua trái
    }

    // Vận tốc cơ bản khi không cuộn (chạy 3% / giây)
    let moveBy = directionFactor.current * 3 * (delta / 1000);

    // Nếu đang cuộn, dải chữ sẽ chạy nhanh hơn (gia tốc x15)
    if (currentVelocity !== 0) {
      moveBy += directionFactor.current * Math.abs(currentVelocity) * 15 * (delta / 1000);
    }

    baseX.set(baseX.get() + moveBy);
  });

  // Hàm wrap: Giữ cho tọa độ x luôn xoay vòng mượt mà giữa -50% và 0%
  const wrap = (min, max, v) => {
    const rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
  };

  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  return (
    <div className="relative w-full overflow-hidden bg-[#09090b] py-6 border-y border-[rgba(201,169,110,0.15)] flex items-center">
      <motion.div 
        style={{ x }} 
        className="flex items-center w-max whitespace-nowrap text-[#C9A96E]/60 font-['Cormorant_Garamond'] italic text-[20px] md:text-[28px] tracking-wider"
      >
        {/* Dàn phẳng mảng văn bản, không dùng thẻ div bọc ngoài để Flexbox tính toán chuẩn xác */}
        {[...texts, ...texts].map((text, i) => (
          <span key={i} className="pr-4 shrink-0 inline-block">{text}</span>
        ))}
      </motion.div>
    </div>
  );
}