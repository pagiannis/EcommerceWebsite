import apiClient from '../apiClient';

export interface ProductTypeItem {
  id: number;
  name: string;
}

export interface ProductTypePayload {
  name: string;
}

export async function fetchAdminProductTypes(): Promise<ProductTypeItem[]> {
  const { data } = await apiClient.get<{ content: ProductTypeItem[] }>('/admin/product-types', {
    params: { size: 100 },
  });
  return data.content;
}

export async function adminCreateProductType(payload: ProductTypePayload): Promise<ProductTypeItem> {
  const { data } = await apiClient.post<ProductTypeItem>('/admin/product-types', payload);
  return data;
}

export async function adminUpdateProductType(id: number, payload: ProductTypePayload): Promise<ProductTypeItem> {
  const { data } = await apiClient.put<ProductTypeItem>(`/admin/product-types/${id}`, payload);
  return data;
}

export async function adminDeleteProductType(id: number): Promise<void> {
  await apiClient.delete(`/admin/product-types/${id}`);
}
