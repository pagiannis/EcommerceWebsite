import { create } from 'zustand';
import type { CartItem } from '../types/cartItem';
import type { Product } from '../types/product';
import type { Size } from '../types/size';

interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (product: Product, color: string, size: Size) => void;
  removeItem: (productId: string, color: string, size: Size) => void;
  updateQuantity: (productId: string, color: string, size: Size, qty: number) => void;
  clearCart: () => void;
}

function itemKey(productId: string, color: string, size: Size) {
  return `${productId}__${color}__${size}`;
}

function deriveAggregates(items: CartItem[]) {
  return {
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  };
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  totalItems: 0,
  subtotal: 0,

  addItem(product, color, size) {
    set((state) => {
      const key = itemKey(product.id, color, size);
      const exists = state.items.some(
        (i) => itemKey(i.product.id, i.selectedColor, i.selectedSize) === key
      );
      const items = exists
        ? state.items.map((i) =>
            itemKey(i.product.id, i.selectedColor, i.selectedSize) === key
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        : [...state.items, { product, selectedColor: color, selectedSize: size, quantity: 1 }];
      return { items, ...deriveAggregates(items) };
    });
  },

  removeItem(productId, color, size) {
    set((state) => {
      const key = itemKey(productId, color, size);
      const items = state.items.filter(
        (i) => itemKey(i.product.id, i.selectedColor, i.selectedSize) !== key
      );
      return { items, ...deriveAggregates(items) };
    });
  },

  updateQuantity(productId, color, size, qty) {
    if (qty <= 0) {
      useCartStore.getState().removeItem(productId, color, size);
      return;
    }
    set((state) => {
      const key = itemKey(productId, color, size);
      const items = state.items.map((i) =>
        itemKey(i.product.id, i.selectedColor, i.selectedSize) === key
          ? { ...i, quantity: qty }
          : i
      );
      return { items, ...deriveAggregates(items) };
    });
  },

  clearCart() {
    set({ items: [], totalItems: 0, subtotal: 0 });
  },
}));
