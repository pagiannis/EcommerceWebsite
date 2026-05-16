import type { Size } from './size';

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
}

export interface CartItem {
  product: CartProduct;
  selectedColor: string;
  selectedSize: Size;
  quantity: number;
  variantId: number;
  cartItemId?: number;
}
