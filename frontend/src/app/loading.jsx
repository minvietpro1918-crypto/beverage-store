export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center bg-[#09090b]">
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Vòng ngoài mờ */}
        <div className="absolute inset-0 rounded-full border-[1px] border-[#C9A96E]/20"></div>
        
        {/* Vòng quay chính */}
        <div className="absolute inset-0 rounded-full border-[1px] border-[#C9A96E] border-t-transparent animate-spin"></div>
        
        {/* Điểm nhấn ở giữa */}
        <div className="h-1.5 w-1.5 rounded-full bg-[#C9A96E] animate-pulse"></div>
      </div>
      
      <p className="mt-8 text-[10px] uppercase tracking-[0.3em] text-[#C9A96E]/50 animate-pulse font-light">
        Đang tải dữ liệu...
      </p>
    </div>
  );
}