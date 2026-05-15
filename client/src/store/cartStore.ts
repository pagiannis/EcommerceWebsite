import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartProduct } from '../types/cartItem';
import type { Size } from '../types/size';

interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (product: CartProduct, color: string, size: Size, variantId: number, qty?: number) => void;
  removeItem: (productId: string, color: string, size: Size) => void;
  updateQuantity: (productId: string, color: string, size: Size, qty: number) => void;
  setCartItemId: (variantId: number, cartItemId: number) => void;
  loadServerCart: (items: CartItem[]) => void;
  clearCart: () => void;
}

export function cartItemKey(productId: string, color: string, size: Size) {
  return `${productId}__${color}__${size}`;
}

function deriveAggregates(items: CartItem[]) {
  return {
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,

      addItem(product, color, size, variantId, qty = 1) {
        set((state) => {
          const key = cartItemKey(product.id, color, size);
          const exists = state.items.some(
            (i) => cartItemKey(i.product.id, i.selectedColor, i.selectedSize) === key
          );
          const items = exists
            ? state.items.map((i) =>
                cartItemKey(i.product.id, i.selectedColor, i.selectedSize) === key
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              )
            : [...state.items, { product, selectedColor: color, selectedSize: size, quantity: qty, variantId }];
          return { items, ...deriveAggregates(items) };
        });
      },

      removeItem(productId, color, size) {
        set((state) => {
          const key = cartItemKey(productId, color, size);
          const items = state.items.filter(
            (i) => cartItemKey(i.product.id, i.selectedColor, i.selectedSize) !== key
          );
          return { items, ...deriveAggregates(items) };
        });
      },

      updateQuantity(productId, color, size, qty) {
        if (qty <= 0) {
          get().removeItem(productId, color, size);
          return;
        }
        set((state) => {
          const key = cartItemKey(productId, color, size);
          const items = state.items.map((i) =>
            cartItemKey(i.product.id, i.selectedColor, i.selectedSize) === key
              ? { ...i, quantity: qty }
              : i
          );
          return { items, ...deriveAggregates(items) };
        });
      },

      setCartItemId(variantId, cartItemId) {
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, cartItemId } : i
          ),
        }));
      },

      loadServerCart(items) {
        set({ items, ...deriveAggregates(items) });
      },

      clearCart() {
        set({ items: [], totalItems: 0, subtotal: 0 });
      },
    }),
    {
      name: 'cart',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const { totalItems, subtotal } = deriveAggregates(state.items);
          state.totalItems = totalItems;
          state.subtotal = subtotal;
        }
      },
    }
  )
);
