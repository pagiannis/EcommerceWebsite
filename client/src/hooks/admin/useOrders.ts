import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchAdminOrders, adminUpdateOrderStatus } from '../../services/adminOrdersService';
import type { OrderStatus } from '../../services/ordersService';

export function useAdminOrderList(page: number, status?: OrderStatus) {
  return useQuery({
    queryKey: ['admin', 'orders', page, status],
    queryFn: () => fetchAdminOrders({ page, status }),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      adminUpdateOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Order status updated');
    },
  });
}
