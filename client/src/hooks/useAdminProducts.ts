import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  fetchAdminBrands,
  fetchAdminProductTypes,
  type AdminProductPayload,
} from '../services/adminProductsService';
import { fetchAdminCategories } from '../services/adminCategoriesService';
import { fetchProducts } from '../services/productsService';

export function useAdminProductList(page: number) {
  return useQuery({
    queryKey: ['admin', 'products', page],
    queryFn: () => fetchProducts({ page, size: 20, sort: 'NEWEST' }),
  });
}

export function useAdminBrands() {
  return useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: fetchAdminBrands,
  });
}

export function useAdminProductTypes() {
  return useQuery({
    queryKey: ['admin', 'productTypes'],
    queryFn: fetchAdminProductTypes,
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: fetchAdminCategories,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminCreateProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdminProductPayload }) =>
      adminUpdateProduct(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminDeleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });
}
