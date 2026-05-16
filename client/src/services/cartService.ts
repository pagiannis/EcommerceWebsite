import apiClient from './apiClient';
import type { CartItem } from '../types/cartItem';
import type { Size } from '../types/size';
import { SIZE_FROM_API, COLOR_ENUM_TO_HEX } from './productsService';

export interface CartItemResponse {
  id: number;
  variantId: number;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export const getCart = (userId: number): Promise<CartItemResponse[]> =>
  apiClient.get<CartItemResponse[]>(`/cart/${userId}`).then((r) => r.data);

export const addToCart = (userId: number, variantId: number, quantity: number): Promise<CartItemResponse> =>
  apiClient.post<CartItemResponse>(`/cart/${userId}`, { variantId, quantity }).then((r) => r.data);

export const updateCartItem = (cartItemId: number, quantity: number): Promise<CartItemResponse> =>
  apiClient.put<CartItemResponse>(`/cart/${cartItemId}`, undefined, { params: { quantity } }).then((r) => r.data);

export const removeCartItem = (cartItemId: number): Promise<void> =>
  apiClient.delete(`/cart/${cartItemId}`).then(() => undefined);

export function mergeServerCart(
  serverItems: CartItemResponse[],
  localItems: CartItem[],
): CartItem[] {
  return serverItems.map((si) => {
    const local = localItems.find((i) => i.variantId === si.variantId);
    if (local) {
      return { ...local, cartItemId: si.id, quantity: si.quantity };
    }
    return {
      product: {
        id: String(si.variantId),
        name: si.productName,
        price: si.unitPrice,
        images: [],
      },
      selectedColor: COLOR_ENUM_TO_HEX[si.color] ?? si.color,
      selectedSize: (SIZE_FROM_API[si.size] ?? si.size) as Size,
      quantity: si.quantity,
      variantId: si.variantId,
      cartItemId: si.id,
    };
  });
}
