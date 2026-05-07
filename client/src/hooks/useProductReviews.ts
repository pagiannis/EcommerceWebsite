import { useQuery } from '@tanstack/react-query';
import { fetchProductReviews, mapApiReview } from '../services/reviewsService';

export function useProductReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => fetchProductReviews(productId!).then(r => r.map(mapApiReview)),
    enabled: !!productId,
  });
}
