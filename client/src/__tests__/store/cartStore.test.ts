import { describe, it, expect, beforeEach } from 'vitest';
import { cartItemKey, useCartStore } from '../../store/cartStore';
import type { CartProduct } from '../../types/cartItem';

const product: CartProduct = {
  id: 'p1',
  name: 'Test Shirt',
  price: 50,
  images: ['img.png'],
};

const product2: CartProduct = {
  id: 'p2',
  name: 'Jacket',
  price: 100,
  images: [],
};

function resetStore() {
  useCartStore.setState({ items: [], totalItems: 0, subtotal: 0 });
}

describe('cartItemKey', () => {
  it('generates a composite key from productId, color, size', () => {
    expect(cartItemKey('p1', 'red', 'Medium')).toBe('p1__red__Medium');
  });

  it('generates different keys for different colors', () => {
    expect(cartItemKey('p1', 'red', 'Medium')).not.toBe(cartItemKey('p1', 'blue', 'Medium'));
  });

  it('generates different keys for different sizes', () => {
    expect(cartItemKey('p1', 'red', 'Small')).not.toBe(cartItemKey('p1', 'red', 'Large'));
  });
});

describe('cartStore', () => {
  beforeEach(resetStore);

  it('starts empty', () => {
    const { items, totalItems, subtotal } = useCartStore.getState();
    expect(items).toHaveLength(0);
    expect(totalItems).toBe(0);
    expect(subtotal).toBe(0);
  });

  describe('addItem', () => {
    it('adds a new item and updates aggregates', () => {
      useCartStore.getState().addItem(product, 'red', 'Medium', 1);
      const { items, totalItems, subtotal } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(totalItems).toBe(1);
      expect(subtotal).toBe(50);
    });

    it('increments quantity when the same color/size combo is added again', () => {
      useCartStore.getState().addItem(product, 'red', 'Medium', 1);
      useCartStore.getState().addItem(product, 'red', 'Medium', 1);
      const { items, totalItems, subtotal } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(2);
      expect(totalItems).toBe(2);
      expect(subtotal).toBe(100);
    });

    it('adds a separate entry for a different color', () => {
      useCartStore.getState().addItem(product, 'red', 'Medium', 1);
      useCartStore.getState().addItem(product, 'blue', 'Medium', 1);
      expect(useCartStore.getState().items).toHaveLength(2);
    });

    it('adds a separate entry for a different size', () => {
      useCartStore.getState().addItem(product, 'red', 'Medium', 1);
      useCartStore.getState().addItem(product, 'red', 'Large', 1);
      expect(useCartStore.getState().items).toHaveLength(2);
    });

    it('respects custom qty on initial add', () => {
      useCartStore.getState().addItem(product, 'red', 'Medium', 1, 3);
      expect(useCartStore.getState().items[0].quantity).toBe(3);
      expect(useCartStore.getState().totalItems).toBe(3);
    });
  });

  describe('removeItem', () => {
    it('removes the matching item', () => {
      useCartStore.getState().addItem(product, 'red', 'Medium', 1);
      useCartStore.getState().removeItem('p1', 'red', 'Medium');
      expect(useCartStore.getState().items).toHaveLength(0);
      expect(useCartStore.getState().totalItems).toBe(0);
      expect(useCartStore.getState().subtotal).toBe(0);
    });

    it('does not affect other items', () => {
      useCartStore.getState().addItem(product, 'red', 'Medium', 1);
      useCartStore.getState().addItem(product2, 'black', 'Large', 2);
      useCartStore.getState().removeItem('p1', 'red', 'Medium');
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].product.id).toBe('p2');
    });
  });

  describe('updateQuantity', () => {
    it('updates the quantity and recalculates aggregates', () => {
      useCartStore.getState().addItem(product, 'red', 'Medium', 1);
      useCartStore.getState().updateQuantity('p1', 'red', 'Medium', 4);
      expect(useCartStore.getState().items[0].quantity).toBe(4);
      expect(useCartStore.getState().subtotal).toBe(200);
    });

    it('removes the item when qty is 0', () => {
      useCartStore.getState().addItem(product, 'red', 'Medium', 1);
      useCartStore.getState().updateQuantity('p1', 'red', 'Medium', 0);
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('removes the item when qty is negative', () => {
      useCartStore.getState().addItem(product, 'red', 'Medium', 1);
      useCartStore.getState().updateQuantity('p1', 'red', 'Medium', -1);
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('empties items and resets aggregates', () => {
      useCartStore.getState().addItem(product, 'red', 'Medium', 1);
      useCartStore.getState().addItem(product2, 'black', 'Large', 2);
      useCartStore.getState().clearCart();
      const { items, totalItems, subtotal } = useCartStore.getState();
      expect(items).toHaveLength(0);
      expect(totalItems).toBe(0);
      expect(subtotal).toBe(0);
    });
  });

  describe('loadServerCart', () => {
    it('replaces all items and recalculates aggregates', () => {
      useCartStore.getState().addItem(product, 'red', 'Medium', 1);
      useCartStore.getState().loadServerCart([
        {
          product: product2,
          selectedColor: 'black',
          selectedSize: 'Large',
          quantity: 3,
          variantId: 99,
        },
      ]);
      const { items, totalItems, subtotal } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(totalItems).toBe(3);
      expect(subtotal).toBe(300);
    });
  });
});
