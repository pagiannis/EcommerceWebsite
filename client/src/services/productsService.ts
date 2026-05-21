import apiClient from './apiClient';
import type { Page } from './apiTypes';
import type { Product } from '../types/product';
import type { Category } from '../types/category';
import type { Brand } from '../types/brand';
import type { ProductType } from '../types/productType';
import type { DressStyle } from '../types/dressStyle';
import type { Size } from '../types/size';

export interface ProductVariantResponse {
  id: number;
  color: string;
  colorHex: string;
  size: string;
  stockQuantity: number;
  sku: string;
  price: number;
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  category: string;
  brand: string;
  productType: string;
  dressStyle: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  imageUrls: string[];
  variants: ProductVariantResponse[];
}


export interface ProductsParams {
  category?: string;
  page?: number;
  size?: number;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  filterSizes?: string[];
  dressStyle?: string;
  onSale?: boolean;
  topSelling?: boolean;
  brandName?: string;
  productTypeName?: string;
  sort?: 'NEWEST' | 'MOST_POPULAR' | 'PRICE_ASC' | 'PRICE_DESC';
  minRating?: number;
}

// FilterState ↔ API conversion maps (exported for ShopPage use)

export const COLOR_HEX_TO_ENUM: Record<string, string> = {
  '#000000': 'BLACK',
  '#FFFFFF': 'WHITE',
  '#FF0000': 'RED',
  '#0000FF': 'BLUE',
  '#00C000': 'GREEN',
  '#FFFF00': 'YELLOW',
  '#FFC0CB': 'PINK',
  '#808080': 'GRAY',
  '#8B4513': 'BROWN',
  '#800080': 'PURPLE',
  '#FFA500': 'ORANGE',
  '#000080': 'NAVY',
};

export const COLOR_ENUM_TO_HEX: Record<string, string> = {
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  RED: '#FF0000',
  BLUE: '#0000FF',
  GREEN: '#00C000',
  YELLOW: '#FFFF00',
  PINK: '#FFC0CB',
  GRAY: '#808080',
  BROWN: '#8B4513',
  PURPLE: '#800080',
  ORANGE: '#FFA500',
  NAVY: '#000080',
};

export const BRAND_NAME: Record<string, string> = {
  nike: 'Nike',
  levis: "Levi's",
  'tommy-hilfiger': 'Tommy Hilfiger',
  'ralph-lauren': 'Ralph Lauren',
  hm: 'H&M',
  zara: 'Zara',
  'calvin-klein': 'Calvin Klein',
};

export const PRODUCT_TYPE_NAME: Record<string, string> = {
  't-shirt': 'T-Shirt',
  jeans: 'Jeans',
  shirt: 'Shirt',
  polo: 'Polo',
  hoodie: 'Hoodie',
  shorts: 'Shorts',
  blazer: 'Blazer',
};

export const DRESS_STYLE_TO_API: Record<string, string> = {
  casual: 'CASUAL',
  formal: 'FORMAL',
  party: 'PARTY',
  gym: 'GYM',
};

export const SIZE_TO_API: Record<string, string> = {
  'X-Small': 'XS',
  Small: 'S',
  Medium: 'M',
  Large: 'L',
  'X-Large': 'XL',
  'XX-Large': 'XXL',
  '3X-Large': 'XXXL',
};

export const SORT_TO_API: Record<string, ProductsParams['sort']> = {
  'Most Popular': 'MOST_POPULAR',
  'Price: Low to High': 'PRICE_ASC',
  'Price: High to Low': 'PRICE_DESC',
  Newest: 'NEWEST',
};

// API → FilterState reverse maps (used only in mapApiProduct)

const BRAND_SLUG: Record<string, Brand> = {
  Nike: 'nike',
  "Levi's": 'levis',
  'Tommy Hilfiger': 'tommy-hilfiger',
  'Ralph Lauren': 'ralph-lauren',
  'H&M': 'hm',
  Zara: 'zara',
  'Calvin Klein': 'calvin-klein',
};

const PRODUCT_TYPE_SLUG: Record<string, ProductType> = {
  'T-Shirt': 't-shirt',
  Jeans: 'jeans',
  Shirt: 'shirt',
  Polo: 'polo',
  Hoodie: 'hoodie',
  Shorts: 'shorts',
  Blazer: 'blazer',
};

const DRESS_STYLE_FROM_API: Record<string, DressStyle> = {
  CASUAL: 'casual',
  FORMAL: 'formal',
  PARTY: 'party',
  GYM: 'gym',
  BUSINESS: 'formal',
};

export const SIZE_FROM_API: Record<string, Size> = {
  XS: 'X-Small',
  S: 'Small',
  M: 'Medium',
  L: 'Large',
  XL: 'X-Large',
  XXL: 'XX-Large',
  XXXL: '3X-Large',
};

export function mapApiProduct(api: ProductResponse): Product {
  return {
    id: String(api.id),
    name: api.name,
    description: api.description,
    category: api.category as Category,
    brand: (BRAND_SLUG[api.brand] ?? api.brand) as Brand,
    productType: (PRODUCT_TYPE_SLUG[api.productType] ?? api.productType) as ProductType,
    dressStyle: (DRESS_STYLE_FROM_API[api.dressStyle] ?? 'casual') as DressStyle,
    price: api.price,
    originalPrice: api.originalPrice,
    discountPercent: api.discountPercent,
    rating: api.rating,
    reviewCount: api.reviewCount,
    images: api.imageUrls,
    colors: [...new Set(api.variants.map((v) => v.colorHex))],
    sizes: [...new Set(api.variants.map((v) => SIZE_FROM_API[v.size] ?? v.size))] as Size[],
    variants: api.variants.map((v) => ({
      id: v.id,
      colorHex: v.colorHex,
      size: SIZE_FROM_API[v.size] ?? v.size,
      stockQuantity: v.stockQuantity,
    })),
  };
}

export async function fetchProducts(
  params: ProductsParams = {},
): Promise<Page<ProductResponse>> {
  const { data } = await apiClient.get<Page<ProductResponse>>('/products', {
    params,
    paramsSerializer: { indexes: null },
  });
  return data;
}

export async function fetchProductById(
  id: string
): Promise<ProductResponse> {
  const { data } = await apiClient.get<ProductResponse>(`/products/${id}`);
  return data;
}

export interface AutocompleteItem {
  id: number;
  name: string;
  imageUrl: string;
}

export interface SearchParams {
  query: string;
  page?: number;
  size?: number;
}

export async function fetchSearchResults(
  params: SearchParams,
): Promise<Page<ProductResponse>> {
  const { data } = await apiClient.get<Page<ProductResponse>>('/products/search', { params });
  return data;
}

export async function fetchAutocomplete(query: string): Promise<AutocompleteItem[]> {
  const { data } = await apiClient.get<AutocompleteItem[]>('/products/autocomplete', {
    params: { query },
  });
  return data;
}
