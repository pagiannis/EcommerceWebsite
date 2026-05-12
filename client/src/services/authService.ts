import apiClient from "./apiClient";
import type { UserResponse } from "./accountService";

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export async function login(email: string, password: string): Promise<UserResponse> {
  const { data } = await apiClient.post<UserResponse>("/users/login", { email, password });
  return data;
}

export async function register(payload: RegisterPayload): Promise<UserResponse> {
  const { data } = await apiClient.post<UserResponse>("/users/register", payload);
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/users/logout");
}
