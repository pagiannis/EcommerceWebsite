import apiClient from './apiClient';
import type { UserResponse, UserRole } from './accountService';
import type { Page } from './apiTypes';

export interface AdminUpdateUserPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
}

export async function fetchAdminUsers(params: { page: number }): Promise<Page<UserResponse>> {
  const { data } = await apiClient.get<Page<UserResponse>>('/admin/users', {
    params: { page: params.page, size: 20 },
  });
  return data;
}

export async function adminUpdateUser(id: number, payload: AdminUpdateUserPayload): Promise<UserResponse> {
  const { data } = await apiClient.put<UserResponse>(`/admin/users/${id}`, payload);
  return data;
}

export async function adminUpdateUserRole(id: number, role: UserRole): Promise<UserResponse> {
  const { data } = await apiClient.patch<UserResponse>(`/admin/users/${id}/role`, null, {
    params: { role },
  });
  return data;
}

export async function adminDeleteUser(id: number): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`);
}
