import { useQuery } from '@tanstack/react-query';
import { fetchProducts, mapApiProduct, PRODUCT_TYPE_NAME } from '../services/productsService';
import type { Product } from '../types/product';

export function useRelatedProducts(product: Product | undefined) {
  return useQuery({
    queryKey: ['products', 'related', product?.category, product?.productType],
    queryFn: () =>
      fetchProducts({
        category: product!.category,
        productTypeName: PRODUCT_TYPE_NAME[product!.productType],
        size: 5,
      }).then(data =>
        data.content
          .map(mapApiProduct)
          .filter(p => p.id !== product!.id)
          .slice(0, 4),
      ),
    enabled: !!product,
  });
}
