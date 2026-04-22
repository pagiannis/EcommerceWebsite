import type { DressStyle } from './dressStyle';
import type { Size } from './size';

export interface Product {
  id: string;
  name: string;
  category: DressStyle;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  colors: string[];
  sizes: Size[];
  description: string;
  isNew?: boolean;
  isBestSeller?: boolean;
}
