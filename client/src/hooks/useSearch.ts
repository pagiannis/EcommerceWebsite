import { useQuery } from '@tanstack/react-query';
import { fetchSearchResults, type PaginatedProductsResponse, type SearchParams } from '../services/productsService';

export function useSearch(params: SearchParams, options: { enabled?: boolean } = {}) {
  return useQuery<PaginatedProductsResponse>({
    queryKey: ['search', params],
    queryFn: () => fetchSearchResults(params),
    enabled: (options.enabled ?? true) && params.query.trim().length > 0,
  });
}
