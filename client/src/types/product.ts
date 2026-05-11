import type { Category } from './category';
import type { ProductType } from './productType';
import type { DressStyle } from './dressStyle';
import type { Brand } from './brand';
import type { Size } from './size';

export interface ProductVariant {
  id: number;
  colorHex: string;
  size: string;
  stockQuantity: number;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  productType: ProductType;
  dressStyle: DressStyle;
  brand: Brand;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  colors: string[];
  sizes: Size[];
  variants: ProductVariant[];
  description: string;
  isNew?: boolean;
  isBestSeller?: boolean;
}
