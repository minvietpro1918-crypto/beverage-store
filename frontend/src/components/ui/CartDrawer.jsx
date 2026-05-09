'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

const fmt = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

export default function CartDrawer({ open, onClose }) {
  const {
    cart, removeFromCart, updateQuantity,
    totalItems, totalPrice, clearCart,
    refreshStock, stockMap,
  } = useCart();
  const router = useRouter();

  // Refresh tồn kho mỗi khi mở drawer
  useEffect(() => {
    if (open) refreshStock();
  }, [open]);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    onClose();
    router.push('/checkout');
  };

  const shipping  = totalPrice >= 150000 ? 0 : 20000;
  const grand     = totalPrice + shipping;
  const toFreeShip = 150000 - totalPrice;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-50 transition-opacity duration-300"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={onClose} />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] w-full sm:w-[400px] md:w-[420px]"
        style={{
          background: '#0E0E0E',
          borderLeft: '1px solid rgba(201,169,110,0.1)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(245,240,232,0.06)' }}>
          <div>
            <h2 className="font-['Cormorant_Garamond'] text-xl font-light tracking-[0.05em] text-white">Giỏ Hàng</h2>
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/25 mt-0.5">{totalItems} sản phẩm</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/80 hover:border-[#C9A96E] transition-all duration-300 cursor-pointer bg-transparent text-sm">
            ✕
          </button>
        </div>

        {/* Free shipping progress */}
        {cart.length > 0 && (
          <div className="px-6 py-3" style={{ borderBottom: '1px solid rgba(245,240,232,0.04)', background: 'rgba(201,169,110,0.03)' }}>
            {shipping === 0 ? (
              <p className="text-[10px] text-[#C9A96E] flex items-center gap-1.5">
                <span>✓</span> Bạn được miễn phí vận chuyển!
              </p>
            ) : (
              <div>
                <p className="text-[10px] text-white/35 mb-1.5">
                  Thêm <span className="text-[#C9A96E]">{fmt(toFreeShip)}</span> để được miễn phí ship
                </p>
                <div className="h-px w-full" style={{ background: 'rgba(245,240,232,0.08)' }}>
                  <div className="h-px transition-all duration-500"
                    style={{ width: `${Math.min((totalPrice / 150000) * 100, 100)}%`, background: '#C9A96E' }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <span className="text-5xl opacity-15">🛒</span>
              <p className="text-[11px] tracking-[0.2em] uppercase text-white/20">Giỏ hàng trống</p>
              <button onClick={onClose}
                className="text-[10px] tracking-[0.2em] uppercase text-[#C9A96E]/60 hover:text-[#C9A96E] transition-colors cursor-pointer bg-transparent border-none">
                Tiếp tục mua sắm →
              </button>
            </div>
          ) : cart.map(item => {
            const maxStock = stockMap[item._id] ?? item.stock ?? 999;
            const isLow    = maxStock > 0 && maxStock <= 5;
            const isOut    = maxStock === 0;

            return (
              <div key={item._id} className="flex gap-3 pb-4"
                style={{ borderBottom: '1px solid rgba(245,240,232,0.05)' }}>
                {/* Thumbnail */}
                <div className="w-14 h-14 flex-shrink-0 relative overflow-hidden"
                  style={{ background: 'rgba(245,240,232,0.04)', border: '1px solid rgba(201,169,110,0.1)' }}>
                  {item.imageURL
                    ? <Image src={item.imageURL} alt={item.name} fill className="object-cover" sizes="56px" />
                    : <div className="w-full h-full flex items-center justify-center text-xl opacity-30">🥤</div>
                  }
                  {isOut && (
                    <div className="absolute inset-0 flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.65)' }}>
                      <span className="text-[8px] text-red-400 uppercase tracking-wider">Hết</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-['Cormorant_Garamond'] text-[15px] font-light leading-tight truncate text-white/80 mb-0.5">
                    {item.name}
                  </p>
                  <p className="text-[9px] uppercase text-white/20 tracking-wider mb-2">{item.category}</p>

                  {/* Stock warning */}
                  {isOut && (
                    <p className="text-[9px] text-red-400/80 mb-1.5">⚠ Sản phẩm đã hết hàng</p>
                  )}
                  {isLow && !isOut && (
                    <p className="text-[9px] text-amber-400/70 mb-1.5">⚠ Chỉ còn {maxStock} sản phẩm</p>
                  )}

                  <div className="flex items-center justify-between">
                    {/* Qty control */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-6 h-6 border border-white/10 hover:border-[#C9A96E] hover:text-[#C9A96E] text-white/40 flex items-center justify-center text-xs cursor-pointer bg-transparent transition-all duration-200">
                        −
                      </button>
                      <span className="text-sm text-white/70 w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        disabled={item.quantity >= maxStock}
                        className="w-6 h-6 border border-white/10 hover:border-[#C9A96E] hover:text-[#C9A96E] text-white/40 flex items-center justify-center text-xs cursor-pointer bg-transparent transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed">
                        +
                      </button>
                    </div>
                    <span className="font-['Cormorant_Garamond'] text-[16px] text-[#C9A96E]">
                      {fmt(item.price * item.quantity)}
                    </span>
                  </div>
                </div>

                {/* Remove */}
                <button onClick={() => removeFromCart(item._id)}
                  className="text-white/15 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none text-xs mt-1 self-start">
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-6 py-6 space-y-3" style={{ borderTop: '1px solid rgba(245,240,232,0.06)' }}>
            <div className="flex justify-between text-[11px] text-white/30">
              <span>Tạm tính</span><span>{fmt(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-[11px]"
              style={{ color: shipping === 0 ? '#C9A96E' : 'rgba(245,240,232,0.3)' }}>
              <span>Vận chuyển</span>
              <span>{shipping === 0 ? 'Miễn phí' : fmt(shipping)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-1" style={{ borderTop: '1px solid rgba(245,240,232,0.06)' }}>
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/35">Tổng Cộng</span>
              <span className="font-['Cormorant_Garamond'] text-2xl text-[#C9A96E]">{fmt(grand)}</span>
            </div>

            <button onClick={handleCheckout}
              className="w-full py-4 text-[10px] tracking-[0.25em] uppercase border border-[#C9A96E] text-[#C9A96E] bg-transparent cursor-pointer transition-all duration-300 relative overflow-hidden group mt-1">
              <span className="absolute inset-0 bg-[#C9A96E] -translate-x-full group-hover:translate-x-0 transition-transform duration-400" />
              <span className="relative z-10 group-hover:text-black transition-colors duration-400">Tiến Hành Thanh Toán</span>
            </button>

            <button onClick={clearCart}
              className="w-full text-[9px] tracking-[0.2em] uppercase text-white/18 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none py-1">
              Xóa Tất Cả
            </button>
          </div>
        )}
      </div>
    </>
  );
}
