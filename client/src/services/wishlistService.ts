import apiClient from "./apiClient";
import type { Product } from "../types/product";
import { type ProductResponse, mapApiProduct } from "./productsService";

export async function getWishlist(userId: number): Promise<Product[]> {
  const { data } = await apiClient.get<ProductResponse[]>(`/users/${userId}/wishlist`);
  return data.map(mapApiProduct);
}
