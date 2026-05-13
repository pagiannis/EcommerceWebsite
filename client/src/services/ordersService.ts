import apiClient from "./apiClient";

export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface OrderItemResponse {
  id: number;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  priceAtPurchase: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  items: OrderItemResponse[];
}

export async function getOrders(userId: number): Promise<OrderResponse[]> {
  const { data } = await apiClient.get<OrderResponse[]>(`/orders/user/${userId}`);
  return data;
}
