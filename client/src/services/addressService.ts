import apiClient from "./apiClient";

export interface AddressResponse {
  id: number;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface CreateAddressPayload {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export async function getAddresses(userId: number): Promise<AddressResponse[]> {
  const { data } = await apiClient.get<AddressResponse[]>(
    `/users/${userId}/addresses`
  );
  return data;
}

export async function createAddress(
  userId: number,
  payload: CreateAddressPayload
): Promise<AddressResponse> {
  const { data } = await apiClient.post<AddressResponse>(
    `/users/${userId}/addresses`,
    payload
  );
  return data;
}
