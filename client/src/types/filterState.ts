import type { Gender } from './gender';
import type { ProductType } from './productType';
import type { DressStyle } from './dressStyle';
import type { Size } from './size';

export interface FilterState {
  gender: Gender | 'all';
  productType: ProductType | 'all';
  dressStyle: DressStyle | 'all';
  priceRange: [number, number];
  colors: string[];
  sizes: Size[];
  onSale: boolean;
  newArrivals: boolean;
  topSelling: boolean;
}
