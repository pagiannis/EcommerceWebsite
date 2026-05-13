import apiClient from "./apiClient";

export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentMethod = "CARD" | "PAYPAL" | "CASH_ON_DELIVERY";

export interface OrderItemResponse {
  id: number;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  imageUrl?: string;
}

export interface OrderAddressResponse {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

export interface OrderResponse {
  id: number;
  status: OrderStatus;
  createdAt: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  shippingAddress: OrderAddressResponse;
  items: OrderItemResponse[];
}

export async function getOrders(userId: number): Promise<OrderResponse[]> {
  const { data } = await apiClient.get<OrderResponse[]>(`/orders/user/${userId}`);
  return data;
}
