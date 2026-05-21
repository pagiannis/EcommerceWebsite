import { useQuery } from '@tanstack/react-query';
import { fetchSearchResults, type SearchParams, type ProductResponse } from '../services/productsService';
import type { Page } from '../services/apiTypes';

export function useSearch(params: SearchParams, options: { enabled?: boolean } = {}) {
  return useQuery<Page<ProductResponse>>({
    queryKey: ['search', params],
    queryFn: () => fetchSearchResults(params),
    enabled: (options.enabled ?? true) && params.query.trim().length > 0,
  });
}
