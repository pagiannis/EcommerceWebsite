import { useQueryClient, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  adminCreateVariant,
  adminUpdateVariant,
  adminDeleteVariant,
  type VariantPayload,
} from '../../services/admin/productVariantsService';

export function useAddVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, payload }: { productId: number; payload: VariantPayload }) =>
      adminCreateVariant(productId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Variant added');
    },
  });
}

export function useUpdateVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId, payload }: { variantId: number; payload: VariantPayload }) =>
      adminUpdateVariant(variantId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Variant updated');
    },
  });
}

export function useDeleteVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminDeleteVariant,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Variant deleted');
    },
  });
}
