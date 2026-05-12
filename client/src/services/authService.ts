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

export async function getUser(id: number): Promise<UserResponse> {
  const { data } = await apiClient.get<UserResponse>(`/users/${id}`);
  return data;
}
