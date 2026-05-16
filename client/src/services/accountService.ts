import apiClient from "./apiClient";

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export interface UpdateUserPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export async function getUser(id: number): Promise<UserResponse> {
  const { data } = await apiClient.get<UserResponse>(`/users/${id}`);
  return data;
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<UserResponse> {
  const { data } = await apiClient.put<UserResponse>(`/users/${id}`, payload);
  return data;
}
