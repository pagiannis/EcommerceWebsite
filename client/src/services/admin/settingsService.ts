import apiClient from "../apiClient";

export interface SettingItem {
  key: string;
  value: string;
  description: string;
  updatedAt: string;
}

export interface SettingPayload {
  value: string;
  description: string;
}

export async function fetchAdminSettings(): Promise<SettingItem[]> {
  const { data } = await apiClient.get<SettingItem[]>("/admin/settings");
  return data;
}

export async function adminUpdateSetting(
  key: string,
  payload: SettingPayload
): Promise<SettingItem> {
  const { data } = await apiClient.put<SettingItem>(
    `/admin/settings/${key}`,
    payload
  );
  return data;
}