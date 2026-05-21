import apiClient from './apiClient';

export const VARIANT_COLORS = ['RED', 'BLUE', 'BLACK', 'WHITE', 'GREEN', 'YELLOW', 'PINK', 'GRAY', 'BROWN', 'PURPLE', 'ORANGE', 'NAVY'] as const;
export const VARIANT_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'] as const;

export interface VariantPayload {
  color: typeof VARIANT_COLORS[number];
  size: typeof VARIANT_SIZES[number];
  stockQuantity: number;
  sku: string;
}

export interface AdminVariantResponse {
  id: number;
  color: string;
  size: string;
  stockQuantity: number;
  sku: string;
}

export async function adminCreateVariant(productId: number, payload: VariantPayload): Promise<AdminVariantResponse> {
  const { data } = await apiClient.post<AdminVariantResponse>(`/admin/products/${productId}/variants`, payload);
  return data;
}

export async function adminUpdateVariant(variantId: number, payload: VariantPayload): Promise<AdminVariantResponse> {
  const { data } = await apiClient.put<AdminVariantResponse>(`/admin/products/variants/${variantId}`, payload);
  return data;
}

export async function adminDeleteVariant(variantId: number): Promise<void> {
  await apiClient.delete(`/admin/products/variants/${variantId}`);
}
