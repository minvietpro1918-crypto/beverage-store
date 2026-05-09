'use client';

import { useState } from 'react';

/**
 * StarRating
 * Props:
 *   value       — current rating (0–5)
 *   onChange    — if provided, renders interactive stars
 *   size        — 'sm' | 'md' | 'lg'  (default: 'md')
 *   showCount   — show review count next to stars
 *   count       — review count number
 */
export default function StarRating({ value = 0, onChange, size = 'md', showCount, count = 0 }) {
  const [hovered, setHovered] = useState(0);
  const interactive = !!onChange;

  const sizes = { sm: 14, md: 18, lg: 24 };
  const px    = sizes[size] || 18;

  const filled = interactive ? (hovered || value) : value;

  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex items-center gap-0.5 ${interactive ? 'cursor-pointer' : ''}`}>
        {[1, 2, 3, 4, 5].map(star => {
          const isFull    = star <= Math.floor(filled);
          const isHalf    = !interactive && star === Math.ceil(filled) && filled % 1 >= 0.3 && filled % 1 < 0.8;
          const isEmpty   = star > Math.ceil(filled) || (star === Math.ceil(filled) && filled % 1 < 0.3);

          return (
            <span key={star}
              onMouseEnter={() => interactive && setHovered(star)}
              onMouseLeave={() => interactive && setHovered(0)}
              onClick={() => interactive && onChange(star)}
              style={{ fontSize: px, lineHeight: 1, cursor: interactive ? 'pointer' : 'default', userSelect: 'none' }}
            >
              {isFull  ? <StarFull  color={interactive && hovered >= star ? '#C9A96E' : '#C9A96E'} size={px} /> :
               isHalf  ? <StarHalf  size={px} /> :
               <StarEmpty size={px} />}
            </span>
          );
        })}
      </div>

      {showCount && (
        <span className="text-[11px] text-white/35 ml-1">
          {value > 0 ? value.toFixed(1) : '—'}
          {count > 0 && <span className="ml-1">({count})</span>}
        </span>
      )}
    </div>
  );
}

const StarFull  = ({ size, color = '#C9A96E' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const StarHalf  = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <defs>
      <linearGradient id="half"><stop offset="50%" stopColor="#C9A96E"/><stop offset="50%" stopColor="rgba(245,240,232,0.15)"/></linearGradient>
    </defs>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#half)"/>
  </svg>
);
const StarEmpty = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="rgba(245,240,232,0.15)">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
