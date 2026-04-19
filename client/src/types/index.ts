export type Size =
  | 'XX-Small'
  | 'X-Small'
  | 'Small'
  | 'Medium'
  | 'Large'
  | 'X-Large'
  | 'XX-Large'
  | '3X-Large'
  | '4X-Large';

export type DressStyle = 'casual' | 'formal' | 'party' | 'gym';

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

export interface CartItem {
  product: Product;
  selectedColor: string;
  selectedSize: Size;
  quantity: number;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  body: string;
  verified: boolean;
}

export interface Testimonial {
  id: string;
  author: string;
  rating: number;
  body: string;
  verified: boolean;
}

export interface FilterState {
  category: DressStyle | 'all';
  priceRange: [number, number];
  colors: string[];
  sizes: Size[];
}
