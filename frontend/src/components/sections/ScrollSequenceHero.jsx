'use client';

import { useEffect, useRef, useState } from 'react';

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const TOTAL_FRAMES   = 192;   // tổng số ảnh trong /frames
const ANIM_FRAMES    = 192;   // số frame để animate (1 → 120)
const SCROLL_HEIGHT  = '200vh'; // chiều cao vùng scroll (càng cao = scroll càng chậm)
const FRAME_PATH     = (n) => `/frames/frame_${String(n).padStart(4, '0')}.jpg`;
// Đổi đuôi thành .jpg hoặc .png nếu ảnh của bạn khác định dạng
// Ví dụ: `/frames/frame_0001.jpg` hoặc `/frames/frame_001.png`

export default function ScrollSequenceHero() {
  const containerRef = useRef(null);
  const canvasRef    = useRef(null);
  const ctxRef       = useRef(null);
  const framesRef    = useRef([]);      // cache ảnh đã load
  const rafRef       = useRef(null);
  const lastFrameRef = useRef(-1);

  const [textOpacity,   setTextOpacity]   = useState(1);
  const [textTranslate, setTextTranslate] = useState(0);
  const [loaded,        setLoaded]        = useState(false);
  const [loadProgress,  setLoadProgress]  = useState(0);

  // ─── 1. Khởi tạo canvas context ────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctxRef.current.scale(window.devicePixelRatio, window.devicePixelRatio);
      // Vẽ lại frame hiện tại sau khi resize
      const frame = framesRef.current[lastFrameRef.current];
      if (frame) drawFrame(frame, canvas);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // ─── 2. Preload tất cả frames ────────────────────────────────────────────
  useEffect(() => {
    let loadedCount = 0;
    framesRef.current = new Array(ANIM_FRAMES);

    const preloadImages = () => {
      for (let i = 0; i < ANIM_FRAMES; i++) {
        const img = new Image();
        img.src = FRAME_PATH(i + 1);
        img.onload = () => {
          framesRef.current[i] = img;
          loadedCount++;
          setLoadProgress(Math.round((loadedCount / ANIM_FRAMES) * 100));
          if (loadedCount === ANIM_FRAMES) {
            setLoaded(true);
            drawFrame(framesRef.current[0], canvasRef.current);
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === ANIM_FRAMES) {
            setLoaded(true);
            drawFrame(framesRef.current[0], canvasRef.current);
          }
        };
      }
    };

    preloadImages();
  }, []);

  // ─── 3. Hàm vẽ frame lên canvas ─────────────────────────────────────────
  const drawFrame = (img, canvas) => {
    if (!img || !canvas || !ctxRef.current) return;
    const ctx    = ctxRef.current;
    const cw     = canvas.offsetWidth;
    const ch     = canvas.offsetHeight;
    const scale  = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
    const dw     = img.naturalWidth  * scale;
    const dh     = img.naturalHeight * scale;
    const dx     = (cw - dw) / 2;
    const dy     = (ch - dh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  };

  // ─── 4. Scroll handler ────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;

    let targetFrame = 0;
    let currentFrame = 0;

    const onScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect     = container.getBoundingClientRect();
      const scrolled = -rect.top; // px đã scroll trong container
      const total    = container.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, scrolled / total)); // 0 → 1

      // ── Target Frame index ───────────────────────────────────────────
      targetFrame = Math.min(
        Math.floor(progress * ANIM_FRAMES),
        ANIM_FRAMES - 1
      );

      // ── Text fade + slide (fade out trong 30% đầu của scroll) ────────
      const textProgress = Math.min(1, progress / 0.30);
      setTextOpacity(1 - textProgress);
      setTextTranslate(-textProgress * 60); // slide lên 60px
    };

    const renderLoop = () => {
      // Lerp (Linear Interpolation) để frame chuyển đổi mượt mà
      currentFrame += (targetFrame - currentFrame) * 0.1;
      const frameIndex = Math.round(currentFrame);

      if (frameIndex !== lastFrameRef.current) {
        lastFrameRef.current = frameIndex;
        const frame = framesRef.current[frameIndex];
        if (frame) drawFrame(frame, canvasRef.current);
      }

      rafRef.current = requestAnimationFrame(renderLoop);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // trigger ngay khi mount
    renderLoop(); // Bắt đầu vòng lặp render liên tục

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [loaded]);

  return (
    // Container cao hơn 100vh để tạo vùng scroll
    <div
      ref={containerRef}
      className="relative"
      style={{ height: SCROLL_HEIGHT, backgroundColor: '#09090b' }}
    >
      {/* ── Sticky wrapper: canvas + text cố định trên màn hình ───────── */}
      <div className="sticky top-0 h-screen overflow-hidden flex items-center" style={{ backgroundColor: '#09090b' }}>

        {/* ── Canvas (phải) ─────────────────────────────────────────────── */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ backgroundColor: '#09090b' }}
        />

        {/* ── Loading bar ───────────────────────────────────────────────── */}
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20" style={{ backgroundColor: '#09090b' }}>
            <div className="w-48 h-px bg-white/10 relative overflow-hidden mb-4">
              <div
                className="absolute inset-y-0 left-0 bg-[#C9A96E] transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/30">
              Đang tải {loadProgress}%
            </p>
          </div>
        )}

        {/* ── Text overlay (trái) ───────────────────────────────────────── */}
        {loaded && (
          <div
            className="relative z-10 pl-[8%] pr-4 max-w-[700px] pointer-events-none"
            style={{
              opacity:   textOpacity,
              transform: `translateY(${textTranslate}px)`,
              transition: 'none', // transition được xử lý bởi scroll, không cần CSS transition
            }}
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-4 mb-6 text-[10px] tracking-[0.28em] uppercase text-[#C9A96E]">
              <span className="block w-8 h-px bg-[#C9A96E] flex-shrink-0" />
              Sip & Brew Signature
            </div>

            {/* Main title */}
            <h1
              className="font-['Cormorant_Garamond'] font-light leading-[0.88] tracking-[-0.02em] mb-8"
              style={{ fontSize: 'clamp(52px,8vw,110px)', color: '#F5F0E8' }}
            >
              Nghệ Thuật<br />
              <em className="italic text-[#C9A96E]">Thức Uống</em><br />
              <span style={{
                WebkitTextStroke: '1px rgba(245,240,232,0.22)',
                color: 'transparent',
              }}>
                Thượng Hạng
              </span>
            </h1>

            {/* Description */}
            <p
              className="text-[13px] leading-[1.85] max-w-[280px] mb-10 font-light"
              style={{ color: 'rgba(245,240,232,0.45)' }}
            >
              Đánh thức giác quan với những giọt cà phê nguyên bản và lá trà tươi chắt lọc tinh hoa từ tự nhiên. Sự hoàn hảo trong từng ngụm.
            </p>

            {/* Scroll hint */}
            <div className="flex items-center gap-3">
              <span
                className="text-[9px] tracking-[0.28em] uppercase"
                style={{ color: 'rgba(245,240,232,0.25)' }}
              >
                Cuộn xuống để khám phá
              </span>
              <svg
                width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="rgba(201,169,110,0.5)" strokeWidth="1.5"
                className="animate-bounce"
              >
                <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        )}

        {/* ── Frame counter (dev mode — xóa khi deploy) ────────────────── */}
        {process.env.NODE_ENV === 'development' && loaded && (
          <div className="absolute bottom-4 right-4 text-[10px] text-white/20 font-mono z-20">
            frame {(lastFrameRef.current + 1).toString().padStart(3, '0')} / {ANIM_FRAMES}
          </div>
        )}
      </div>
    </div>
  );
}
