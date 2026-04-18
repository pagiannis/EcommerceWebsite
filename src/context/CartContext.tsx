import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { CartItem, Product, Size } from '../types';

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, color: string, size: Size) => void;
  removeItem: (productId: string, color: string, size: Size) => void;
  updateQuantity: (productId: string, color: string, size: Size, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function itemKey(productId: string, color: string, size: Size) {
  return `${productId}__${color}__${size}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  function addItem(product: Product, color: string, size: Size) {
    const key = itemKey(product.id, color, size);
    setItems(prev => {
      const existing = prev.find(i => itemKey(i.product.id, i.selectedColor, i.selectedSize) === key);
      if (existing) {
        return prev.map(i =>
          itemKey(i.product.id, i.selectedColor, i.selectedSize) === key
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, selectedColor: color, selectedSize: size, quantity: 1 }];
    });
  }

  function removeItem(productId: string, color: string, size: Size) {
    const key = itemKey(productId, color, size);
    setItems(prev => prev.filter(i => itemKey(i.product.id, i.selectedColor, i.selectedSize) !== key));
  }

  function updateQuantity(productId: string, color: string, size: Size, qty: number) {
    const key = itemKey(productId, color, size);
    if (qty <= 0) {
      removeItem(productId, color, size);
      return;
    }
    setItems(prev =>
      prev.map(i =>
        itemKey(i.product.id, i.selectedColor, i.selectedSize) === key ? { ...i, quantity: qty } : i
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
