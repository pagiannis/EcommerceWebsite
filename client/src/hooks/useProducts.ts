import { useQuery } from '@tanstack/react-query';
import { fetchProducts, type ProductsParams, type ProductResponse } from '../services/productsService';
import type { Page } from '../types/api';

export function useProducts(params: ProductsParams = {}, options: { enabled?: boolean } = {}) {
  return useQuery<Page<ProductResponse>>({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
    enabled: options.enabled ?? true,
  });
}
