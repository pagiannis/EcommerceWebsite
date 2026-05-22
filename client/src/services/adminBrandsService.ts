import apiClient from './apiClient';

export interface BrandItem {
  id: number;
  name: string;
  logoUrl?: string;
}

export interface BrandPayload {
  name: string;
  logoUrl?: string;
}

export async function fetchAdminBrands(): Promise<BrandItem[]> {
  const { data } = await apiClient.get<{ content: BrandItem[] }>('/admin/brands', {
    params: { size: 100 },
  });
  return data.content;
}

export async function adminCreateBrand(payload: BrandPayload): Promise<BrandItem> {
  const { data } = await apiClient.post<BrandItem>('/admin/brands', payload);
  return data;
}

export async function adminUpdateBrand(id: number, payload: BrandPayload): Promise<BrandItem> {
  const { data } = await apiClient.put<BrandItem>(`/admin/brands/${id}`, payload);
  return data;
}

export async function adminDeleteBrand(id: number): Promise<void> {
  await apiClient.delete(`/admin/brands/${id}`);
}
