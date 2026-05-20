import apiClient from './apiClient';

export interface CategoryItem {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface CategoryPayload {
  name: string;
  description?: string;
  imageUrl?: string;
}

export async function fetchAdminCategories(): Promise<CategoryItem[]> {
  const { data } = await apiClient.get<CategoryItem[]>('/categories');
  return data;
}

export async function adminCreateCategory(payload: CategoryPayload): Promise<CategoryItem> {
  const { data } = await apiClient.post<CategoryItem>('/admin/categories', payload);
  return data;
}

export async function adminUpdateCategory(id: number, payload: CategoryPayload): Promise<CategoryItem> {
  const { data } = await apiClient.put<CategoryItem>(`/admin/categories/${id}`, payload);
  return data;
}

export async function adminDeleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/admin/categories/${id}`);
}
