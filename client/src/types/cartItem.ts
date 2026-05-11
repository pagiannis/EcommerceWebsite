import type { Product } from './product';
import type { Size } from './size';

export interface CartItem {
  product: Product;
  selectedColor: string;
  selectedSize: Size;
  quantity: number;
  variantId: number;
  cartItemId?: number;
}
