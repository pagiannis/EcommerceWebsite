import apiClient from './apiClient';
import type { Review } from '../types/review';

export interface ReviewResponse {
  id: number;
  productId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export function mapApiReview(api: ReviewResponse): Review {
  return {
    id: String(api.id),
    productId: String(api.productId),
    author: api.userName,
    rating: api.rating,
    date: api.createdAt,
    body: api.comment,
    verified: false,
  };
}

export async function fetchProductReviews(productId: string): Promise<ReviewResponse[]> {
  const { data } = await apiClient.get<ReviewResponse[]>(`/reviews/product/${productId}`);
  return data;
}

export interface AppReviewResponse {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  approved: boolean;
}

export async function fetchAppReviews(): Promise<AppReviewResponse[]> {
  const { data } = await apiClient.get<AppReviewResponse[]>('/app-reviews');
  return data;
}
