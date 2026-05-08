import { useQuery } from '@tanstack/react-query';
import { fetchProductById, mapApiProduct } from '../services/productsService';

export function useProduct(productId: string | undefined) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProductById(productId!).then(mapApiProduct),
    enabled: !!productId,
  });
}
