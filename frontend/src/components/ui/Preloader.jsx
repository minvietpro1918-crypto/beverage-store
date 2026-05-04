'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Giả lập tiến trình tải trang (0 -> 100) mượt mà
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 10) + 1;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => setIsLoading(false), 400); // Giữ số 100% một nhịp ngắn trước khi kéo màn
      }
      setProgress(current);
    }, 40);

    return () => clearInterval(interval);
  }, []);

  if (!isLoading) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#09090b] text-[#C9A96E]"
      // Màn hình trượt lên trên mượt mà khi kết thúc
      exit={{ y: '-100vh', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
    >
      {/* Chữ Loading mờ */}
      <div className="text-[10px] tracking-[0.4em] uppercase text-white/30 mb-4 animate-pulse">
        Đang đánh thức hương vị
      </div>

      {/* Bộ đếm phần trăm */}
      <div className="font-['Cormorant_Garamond'] text-[60px] md:text-[80px] font-light leading-none">
        {progress}
        <span className="text-[20px] align-top">%</span>
      </div>

      {/* Thanh Progress bar ở dưới cùng */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[200px] h-[1px] bg-white/10">
        <motion.div 
          className="h-full bg-[#C9A96E]" 
          animate={{ width: `${progress}%` }} 
          transition={{ ease: "linear", duration: 0.1 }}
        />
      </div>
    </motion.div>
  );
}