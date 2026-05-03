const INGREDIENTS = [
  { icon: '🍃', name: 'Trà Xanh Tự Nhiên', origin: 'Thái Nguyên, Việt Nam', desc: 'Búp trà non hái tay mỗi sáng sớm, giữ trọn hương thơm tinh khiết.' },
  { icon: '☕', name: 'Cà Phê Arabica', origin: 'Đà Lạt, Lâm Đồng', desc: 'Rang mộc theo phương pháp truyền thống, vị đậm đà, hậu ngọt.' },
  { icon: '🥛', name: 'Sữa Tươi Nhập Khẩu', origin: 'Hokkaido, Nhật Bản', desc: 'Sữa tươi béo ngậy với hàm lượng béo cao, tạo độ mịn hoàn hảo.' },
  { icon: '🍑', name: 'Trái Cây Tươi Mùa', origin: 'Đồng bằng SCL', desc: 'Thu hoạch theo mùa, không bảo quản — tươi nhất vào từng thời điểm.' },
];

export default function IngredientsSection() {
  return (
    <section id="ingredients" className="py-20 md:py-32 px-5 sm:px-8 md:px-[8%]">
      {/* Header */}
      <div className="mb-12 md:mb-20 fade-up">
        <p className="text-[9px] tracking-[0.35em] uppercase text-[#C9A96E] mb-4 md:mb-5">Tinh Hoa Nguyên Liệu</p>
        <h2 className="font-['Cormorant_Garamond'] font-light leading-[1] tracking-[-0.01em]"
          style={{ fontSize: 'clamp(36px,5vw,72px)' }}>
          Từ Thiên Nhiên<br />
          <em className="italic">Đến Ly Của Bạn</em>
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ border: '1px solid rgba(245,240,232,0.06)' }}>
        {INGREDIENTS.map((item, i) => (
          <div
            key={item.name}
            className="p-6 md:p-8 fade-up group hover:bg-[rgba(201,169,110,0.04)] transition-colors duration-500"
            style={{ borderRight: i < 3 ? '1px solid rgba(245,240,232,0.06)' : 'none', transitionDelay: `${i * 0.08}s` }}
          >
            <span className="text-3xl md:text-4xl block mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-500 origin-left">{item.icon}</span>
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#C9A96E]/60 mb-2">{item.origin}</p>
            <h3 className="font-['Cormorant_Garamond'] text-lg md:text-xl font-light mb-2 md:mb-3">{item.name}</h3>
            <p className="text-[11px] md:text-[12px] text-white/35 leading-[1.75] font-light">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Bottom stat bar */}
      <div className="mt-px grid grid-cols-3 gap-px" style={{ borderLeft: '1px solid rgba(245,240,232,0.06)', borderRight: '1px solid rgba(245,240,232,0.06)', borderBottom: '1px solid rgba(245,240,232,0.06)' }}>
        {[['0%', 'Chất Bảo Quản'], ['100%', 'Nguồn Gốc Rõ Ràng'], ['12+', 'Đối Tác Nông Trại']].map(([num, label], i) => (
          <div key={label} className="py-6 md:py-8 text-center fade-up" style={{ borderRight: i < 2 ? '1px solid rgba(245,240,232,0.06)' : 'none' }}>
            <div className="font-['Cormorant_Garamond'] text-3xl md:text-4xl font-light text-[#C9A96E]">{num}</div>
            <div className="text-[9px] tracking-[0.18em] uppercase text-white/25 mt-1.5">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
