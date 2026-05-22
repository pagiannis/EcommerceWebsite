import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  fetchAdminProductTypes,
  adminCreateProductType,
  adminUpdateProductType,
  adminDeleteProductType,
  type ProductTypePayload,
} from '../services/adminProductTypesService';

export function useAdminProductTypeList() {
  return useQuery({
    queryKey: ['admin', 'product-types'],
    queryFn: fetchAdminProductTypes,
  });
}

export function useCreateProductType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminCreateProductType,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'product-types'] });
      toast.success('Product type created');
    },
  });
}

export function useUpdateProductType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductTypePayload }) =>
      adminUpdateProductType(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'product-types'] });
      toast.success('Product type updated');
    },
  });
}

export function useDeleteProductType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminDeleteProductType,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'product-types'] });
      toast.success('Product type deleted');
    },
  });
}
