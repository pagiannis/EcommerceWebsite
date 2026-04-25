import type { Gender } from './gender';
import type { ProductType } from './productType';
import type { DressStyle } from './dressStyle';
import type { Brand } from './brand';
import type { Size } from './size';

export interface FilterState {
  gender: Gender | 'all';
  productType: ProductType | 'all';
  dressStyle: DressStyle | 'all';
  brand: Brand | 'all';
  priceRange: [number, number];
  colors: string[];
  sizes: Size[];
  onSale: boolean;
  newArrivals: boolean;
  topSelling: boolean;
}
