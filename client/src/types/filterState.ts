import type { DressStyle } from './dressStyle';
import type { Size } from './size';

export interface FilterState {
  category: DressStyle | 'all';
  priceRange: [number, number];
  colors: string[];
  sizes: Size[];
}
