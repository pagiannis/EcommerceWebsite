import type { Gender } from './gender';
import type { ProductType } from './productType';
import type { DressStyle } from './dressStyle';
import type { Size } from './size';

export interface Product {
  id: string;
  name: string;
  gender: Gender;
  productType: ProductType;
  dressStyle: DressStyle;
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
