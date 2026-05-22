import apiClient from './apiClient';
import type { ProductResponse } from './productsService';
import type { Page } from '../types/api';

export interface AdminProductPayload {
  name: string;
  description?: string;
  categoryId: number;
  brandId: number;
  productTypeId: number;
  dressStyle: 'CASUAL' | 'FORMAL' | 'PARTY' | 'GYM';
  price: number;
  originalPrice?: number;
  discountPercent?: number;
}

export interface BrandItem {
  id: number;
  name: string;
  logoUrl?: string;
}

export interface ProductTypeItem {
  id: number;
  name: string;
}


// ---- Products ----

export async function adminCreateProduct(payload: AdminProductPayload): Promise<ProductResponse> {
  const { data } = await apiClient.post<ProductResponse>('/admin/products', payload);
  return data;
}

export async function adminUpdateProduct(id: number, payload: AdminProductPayload): Promise<ProductResponse> {
  const { data } = await apiClient.put<ProductResponse>(`/admin/products/${id}`, payload);
  return data;
}

export async function adminDeleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/admin/products/${id}`);
}

// ---- Lookup lists for form dropdowns ----

export async function fetchAdminBrands(): Promise<BrandItem[]> {
  const { data } = await apiClient.get<Page<BrandItem>>('/admin/brands', {
    params: { size: 100 },
  });
  return data.content;
}

export async function fetchAdminProductTypes(): Promise<ProductTypeItem[]> {
  const { data } = await apiClient.get<Page<ProductTypeItem>>('/admin/product-types', {
    params: { size: 100 },
  });
  return data.content;
}
