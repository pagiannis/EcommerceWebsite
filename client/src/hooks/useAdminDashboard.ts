import { useQuery } from '@tanstack/react-query';
import { fetchAdminOrders } from '../services/adminOrdersService';
import { fetchAdminUsers } from '../services/adminUsersService';
import { fetchProducts } from '../services/productsService';

export function useAdminDashboard() {
  const orders = useQuery({
    queryKey: ['admin', 'dashboard', 'orders'],
    queryFn: () => fetchAdminOrders({ page: 0 }),
  });
  const pendingOrders = useQuery({
    queryKey: ['admin', 'dashboard', 'pendingOrders'],
    queryFn: () => fetchAdminOrders({ page: 0, status: 'PENDING' }),
  });
  const users = useQuery({
    queryKey: ['admin', 'dashboard', 'users'],
    queryFn: () => fetchAdminUsers({ page: 0 }),
  });
  const products = useQuery({
    queryKey: ['admin', 'dashboard', 'products'],
    queryFn: () => fetchProducts({ page: 0, size: 1, sort: 'NEWEST' }),
  });
  return { orders, pendingOrders, users, products };
}
