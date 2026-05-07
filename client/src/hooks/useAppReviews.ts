import { useQuery } from '@tanstack/react-query';
import { fetchAppReviews } from '../services/reviewsService';
import type { Testimonial } from '../types/testimonial';

function mapAppReview(api: { id: number; userName: string; rating: number; comment: string; approved: boolean }): Testimonial {
  return {
    id: String(api.id),
    author: api.userName,
    rating: api.rating,
    body: api.comment,
    verified: api.approved,
  };
}

export function useAppReviews() {
  return useQuery({
    queryKey: ['app-reviews'],
    queryFn: () => fetchAppReviews().then(r => r.map(mapAppReview)),
  });
}
