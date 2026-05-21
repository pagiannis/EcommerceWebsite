import apiClient from './apiClient';
import type { OrderResponse, OrderStatus } from './ordersService';
import type { Page } from './apiTypes';

export async function fetchAdminOrders(params: {
  page: number;
  status?: OrderStatus;
}): Promise<Page<OrderResponse>> {
  const { data } = await apiClient.get<Page<OrderResponse>>('/admin/orders', {
    params: {
      page: params.page,
      size: 20,
      ...(params.status ? { status: params.status } : {}),
    },
  });
  return data;
}

export async function adminUpdateOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<OrderResponse> {
  const { data } = await apiClient.patch<OrderResponse>(
    `/admin/orders/${id}/status`,
    null,
    { params: { status } },
  );
  return data;
}
