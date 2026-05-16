import apiClient from "./apiClient";

export interface WishlistItemResponse {
  id: number;
  productId: number;
  productName: string;
  imageUrl: string;
  brand: string;
  price: number;
  // null όταν το προϊόν δεν έχει έκπτωση
  originalPrice: number | null;
  discountPercent: number | null;
  rating: number;
  addedAt: string;
}

export async function getWishlist(userId: number): Promise<WishlistItemResponse[]> {
  const { data } = await apiClient.get<WishlistItemResponse[]>(`/users/${userId}/wishlist`);
  return data;
}

export async function addToWishlist(userId: number, productId: number): Promise<void> {
  await apiClient.post(`/users/${userId}/wishlist/${productId}`);
}

export async function removeFromWishlist(userId: number, productId: number): Promise<void> {
  await apiClient.delete(`/users/${userId}/wishlist/${productId}`);
}
