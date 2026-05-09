'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axiosConfig';

const CartContext = createContext(null);

const CART_KEY     = 'sip_brew_cart_v2';
const CART_VERSION = 2; // tăng khi thay đổi schema để tự migrate

// ── Persist helpers ─────────────────────────────────────────────────────────
const saveToStorage = (cart) => {
  try {
    const payload = { version: CART_VERSION, cart, savedAt: Date.now() };
    localStorage.setItem(CART_KEY, JSON.stringify(payload));
    // Backup vào sessionStorage phòng user xóa localStorage
    sessionStorage.setItem(CART_KEY, JSON.stringify(payload));
  } catch (e) { console.warn('Cart save failed:', e); }
};

const loadFromStorage = () => {
  try {
    // Ưu tiên localStorage, fallback sessionStorage
    const raw = localStorage.getItem(CART_KEY) || sessionStorage.getItem(CART_KEY);
    if (!raw) return [];
    const { version, cart } = JSON.parse(raw);
    if (version !== CART_VERSION) return []; // schema cũ → reset
    return Array.isArray(cart) ? cart : [];
  } catch { return []; }
};

export function CartProvider({ children }) {
  const [cart,        setCart]        = useState([]);
  const [hydrated,    setHydrated]    = useState(false);
  const [stockMap,    setStockMap]    = useState({});  // { productId: availableStock }
  const syncTimerRef  = useRef(null);

  // ── 1. Hydrate từ storage khi mount ─────────────────────────────────────
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved.length > 0) {
      setCart(saved);
      // Validate tồn kho ngầm sau khi load
      validateStockSilently(saved);
    }
    setHydrated(true);
  }, []);

  // ── 2. Persist mỗi khi cart thay đổi ────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(cart);
  }, [cart, hydrated]);

  // ── 3. Validate tồn kho ngầm (không block UI) ───────────────────────────
  const validateStockSilently = async (cartItems) => {
    if (!cartItems.length) return;
    try {
      const ids = cartItems.map(i => i._id).join(',');
      const { data } = await api.get('/products', { params: { ids, limit: 50 } });
      const map = {};
      (data.products || []).forEach(p => { map[p._id] = p.stock; });
      setStockMap(map);

      // Điều chỉnh số lượng nếu vượt tồn kho
      setCart(prev => {
        let changed = false;
        const adjusted = prev.map(item => {
          const avail = map[item._id];
          if (avail !== undefined && item.quantity > avail) {
            changed = true;
            return { ...item, quantity: Math.max(0, avail) };
          }
          return item;
        }).filter(item => item.quantity > 0);

        if (changed) {
          toast('🔄 Giỏ hàng đã được cập nhật do thay đổi tồn kho', {
            duration: 4000,
            style: { background: '#1a1a1a', color: '#F5F0E8', border: '1px solid rgba(201,169,110,0.2)' },
          });
        }
        return changed ? adjusted : prev;
      });
    } catch { /* Bỏ qua lỗi network */ }
  };

  // ── addToCart với stock check ────────────────────────────────────────────
  const addToCart = useCallback((product, qty = 1) => {
    setCart(prev => {
      const existing    = prev.find(i => i._id === product._id);
      const currentQty  = existing?.quantity || 0;
      const newQty      = currentQty + qty;

      // Kiểm tra từ stockMap (nếu đã load) hoặc từ product.stock
      const maxStock = stockMap[product._id] ?? product.stock ?? 999;

      if (maxStock === 0) {
        toast.error(`"${product.name}" đã hết hàng!`);
        return prev;
      }

      if (newQty > maxStock) {
        const canAdd = maxStock - currentQty;
        if (canAdd <= 0) {
          toast.error(
            `"${product.name}" chỉ còn ${maxStock} sản phẩm trong kho — giỏ của bạn đã đạt giới hạn!`,
            { duration: 4000 }
          );
          return prev;
        }
        // Thêm phần còn lại có thể thêm
        toast(`Chỉ có thể thêm ${canAdd} sản phẩm nữa (tồn kho: ${maxStock})`, {
          icon: '⚠️', duration: 3500,
          style: { background: '#1a1a1a', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' },
        });
        if (existing) {
          return prev.map(i => i._id === product._id ? { ...i, quantity: maxStock } : i);
        }
        return [...prev, { ...product, quantity: maxStock }];
      }

      // Bình thường
      if (existing) {
        toast.success(`Đã thêm ${product.name} vào giỏ!`);
        return prev.map(i => i._id === product._id ? { ...i, quantity: newQty } : i);
      }
      toast.success(`${product.name} đã vào giỏ hàng!`);
      return [...prev, { ...product, quantity: qty }];
    });
  }, [stockMap]);

  // ── updateQuantity với stock check ──────────────────────────────────────
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) { removeFromCart(productId); return; }

    setCart(prev => {
      const item     = prev.find(i => i._id === productId);
      const maxStock = stockMap[productId] ?? item?.stock ?? 999;

      if (quantity > maxStock) {
        toast.error(`Chỉ còn ${maxStock} sản phẩm trong kho!`);
        return prev.map(i => i._id === productId ? { ...i, quantity: maxStock } : i);
      }
      return prev.map(i => i._id === productId ? { ...i, quantity } : i);
    });
  }, [stockMap]);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(i => i._id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    try {
      localStorage.removeItem(CART_KEY);
      sessionStorage.removeItem(CART_KEY);
    } catch {}
  }, []);

  // Refresh stockMap thủ công (gọi khi mở CartDrawer)
  const refreshStock = useCallback(() => {
    if (cart.length > 0) validateStockSilently(cart);
  }, [cart]);

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, hydrated, addToCart, removeFromCart,
      updateQuantity, clearCart, refreshStock,
      totalItems, totalPrice, stockMap,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
