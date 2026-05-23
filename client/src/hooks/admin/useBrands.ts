import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  fetchAdminBrands,
  adminCreateBrand,
  adminUpdateBrand,
  adminDeleteBrand,
  type BrandPayload,
} from '../../services/admin/brandsService';

export function useAdminBrandList() {
  return useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: fetchAdminBrands,
  });
}

export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminCreateBrand,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'brands'] });
      toast.success('Brand created');
    },
  });
}

export function useUpdateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BrandPayload }) =>
      adminUpdateBrand(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'brands'] });
      toast.success('Brand updated');
    },
  });
}

export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminDeleteBrand,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'brands'] });
      toast.success('Brand deleted');
    },
  });
}
