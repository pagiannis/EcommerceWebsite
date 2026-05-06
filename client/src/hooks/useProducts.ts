import { useQuery } from '@tanstack/react-query';
import { fetchProducts, type PaginatedProductsResponse, type ProductsParams } from '../services/productsService';

export function useProducts(params: ProductsParams = {}) {
  return useQuery<PaginatedProductsResponse>({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
  });
}
