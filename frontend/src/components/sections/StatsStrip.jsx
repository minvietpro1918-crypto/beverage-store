const STATS = [
  { num: '100%', label: 'Tự Nhiên' },
  { num: '12+',  label: 'Dòng Sản Phẩm' },
  { num: '0',    label: 'Chất Bảo Quản' },
];

export default function StatsStrip() {
  return (
    <div
      className="mx-[8%] mb-36 p-12 flex items-center justify-between gap-8 border fade-up"
      style={{
        borderColor: 'rgba(245,240,232,0.06)',
        background: 'rgba(201,169,110,0.04)',
      }}
    >
      <div className="flex-shrink-0">
        <p className="text-[9px] tracking-[0.3em] uppercase text-[#C9A96E] mb-2">Cam Kết Của Chúng Tôi</p>
        <h3 className="font-['Cormorant_Garamond'] text-3xl font-light">Tinh Khiết Từ Nguồn Gốc</h3>
      </div>

      <p className="text-[12px] text-white/35 max-w-[360px] leading-[1.85] font-light">
        Mỗi thức uống được chế biến từ nguyên liệu tự nhiên, không chất bảo quản, không màu nhân tạo
        — chỉ có hương vị thuần túy từ thiên nhiên.
      </p>

      <div className="flex gap-16 flex-shrink-0">
        {STATS.map(({ num, label }) => (
          <div key={label} className="text-center">
            <div className="font-['Cormorant_Garamond'] text-5xl font-light text-[#C9A96E] leading-none">
              {num}
            </div>
            <div className="text-[9px] tracking-[0.2em] uppercase text-white/25 mt-2">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
