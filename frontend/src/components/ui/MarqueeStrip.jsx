const ITEMS = [
  'Trà Sữa Thượng Hạng', 'Cà Phê Arabica', 'Nước Ép Tươi',
  'Sinh Tố Nhiệt Đới', 'Trà Trái Cây', 'Matcha Premium',
];

export default function MarqueeStrip() {
  // duplicate for seamless loop
  const all = [...ITEMS, ...ITEMS];

  return (
    <div
      className="overflow-hidden py-5"
      style={{
        borderTop: '1px solid rgba(245,240,232,0.06)',
        borderBottom: '1px solid rgba(245,240,232,0.06)',
        background: 'rgba(201,169,110,0.04)',
      }}
    >
      <div className="flex animate-marquee whitespace-nowrap">
        {all.map((item, i) => (
          <span
            key={i}
            className="text-[10px] tracking-[0.3em] uppercase text-white/25 px-12 shrink-0"
          >
            {item}
            <span className="text-[#C9A96E] mx-4">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
