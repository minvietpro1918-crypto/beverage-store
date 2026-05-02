import { useEffect, useRef } from 'react';

/**
 * useCursor — drives the two-part magnetic cursor.
 * Returns refs to attach to .cursor and .cursor-ring divs.
 */
export function useCursor() {
  const cursorRef = useRef(null);
  const ringRef   = useRef(null);
  const pos = useRef({ mx: 0, my: 0, rx: 0, ry: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      pos.current.mx = e.clientX;
      pos.current.my = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px';
        cursorRef.current.style.top  = e.clientY + 'px';
      }
    };

    const animate = () => {
      const { mx, my, rx, ry } = pos.current;
      const nx = rx + (mx - rx) * 0.12;
      const ny = ry + (my - ry) * 0.12;
      pos.current.rx = nx;
      pos.current.ry = ny;
      if (ringRef.current) {
        ringRef.current.style.left = nx + 'px';
        ringRef.current.style.top  = ny + 'px';
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /** Call on any interactive element to expand both cursor parts */
  const expandHandlers = {
    onMouseEnter: () => {
      cursorRef.current?.classList.add('expand');
      ringRef.current?.classList.add('expand');
    },
    onMouseLeave: () => {
      cursorRef.current?.classList.remove('expand');
      ringRef.current?.classList.remove('expand');
    },
  };

  return { cursorRef, ringRef, expandHandlers };
}
