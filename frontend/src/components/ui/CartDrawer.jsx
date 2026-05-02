'use client';

import Image from 'next/image';
import { useCart } from '@/context/CartContext';

const fmt = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

export default function CartDrawer({ open, onClose }) {
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart } = useCart();

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 transition-opacity duration-300"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-[420px] z-50 flex flex-col transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
        style={{
          background: '#0E0E0E',
          borderLeft: '1px solid rgba(201,169,110,0.12)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-8 py-6"
          style={{ borderBottom: '1px solid rgba(245,240,232,0.06)' }}
        >
          <div>
            <h2 className="font-['Cormorant_Garamond'] text-xl font-light tracking-[0.05em]">
              Giỏ Hàng
            </h2>
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/25 mt-0.5">
              {totalItems} sản phẩm
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/80 hover:border-[#C9A96E] transition-all duration-300 cursor-none bg-transparent"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-5">
              <span className="text-5xl opacity-20">🛒</span>
              <p className="text-[11px] tracking-[0.2em] uppercase text-white/20">Giỏ hàng trống</p>
              <button
                onClick={onClose}
                className="text-[10px] tracking-[0.2em] uppercase text-[#C9A96E]/60 hover:text-[#C9A96E] transition-colors cursor-none bg-transparent border-none"
              >
                Tiếp tục mua sắm →
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item._id}
                className="flex gap-4 pb-5"
                style={{ borderBottom: '1px solid rgba(245,240,232,0.05)' }}
              >
                {/* Thumbnail */}
                <div
                  className="w-16 h-16 flex-shrink-0 relative overflow-hidden"
                  style={{ background: 'rgba(245,240,232,0.03)', border: '1px solid rgba(201,169,110,0.1)' }}
                >
                  {item.imageURL ? (
                    <Image src={item.imageURL} alt={item.name} fill className="object-cover" sizes="64px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl opacity-40">🥤</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-['Cormorant_Garamond'] text-[15px] font-light leading-tight truncate mb-1">
                    {item.name}
                  </p>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-white/25 mb-3">{item.category}</p>

                  <div className="flex items-center justify-between">
                    {/* Qty control */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-6 h-6 border border-white/10 text-white/40 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-all duration-200 flex items-center justify-center text-xs cursor-none bg-transparent"
                      >−</button>
                      <span className="text-sm text-white/70 w-3 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-6 h-6 border border-white/10 text-white/40 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-all duration-200 flex items-center justify-center text-xs cursor-none bg-transparent"
                      >+</button>
                    </div>

                    {/* Price */}
                    <span className="font-['Cormorant_Garamond'] text-[16px] text-[#C9A96E]">
                      {fmt(item.price * item.quantity)}
                    </span>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-white/15 hover:text-red-400 transition-colors duration-200 cursor-none bg-transparent border-none text-xs mt-1 self-start"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div
            className="px-8 py-7 space-y-4"
            style={{ borderTop: '1px solid rgba(245,240,232,0.06)' }}
          >
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/35">Tổng Cộng</span>
              <span className="font-['Cormorant_Garamond'] text-2xl text-[#C9A96E]">{fmt(totalPrice)}</span>
            </div>

            <button className="w-full py-4 text-[10px] tracking-[0.25em] uppercase relative overflow-hidden border border-[#C9A96E] text-[#C9A96E] bg-transparent cursor-none
                               transition-all duration-400 hover:text-black hover:bg-[#C9A96E] group">
              Thanh Toán
            </button>

            <button
              onClick={clearCart}
              className="w-full text-[9px] tracking-[0.2em] uppercase text-white/20 hover:text-red-400 transition-colors duration-300 cursor-none bg-transparent border-none py-1"
            >
              Xóa Tất Cả
            </button>
          </div>
        )}
      </div>
    </>
  );
}
