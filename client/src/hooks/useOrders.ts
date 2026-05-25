import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { getOrders, reorderFromOrder } from "../services/ordersService";
import { getCart, mergeServerCart } from "../services/cartService";
import { useCartStore } from "../store/cartStore";

export function useOrders() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["users", userId, "orders"],
    queryFn: () => getOrders(userId!),
    enabled: userId !== undefined,
  });
}

export function useReorder() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (orderId: number) => reorderFromOrder(orderId, user!.id),
    onSuccess: async () => {
      const serverItems = await getCart(user!.id);
      const { items: localItems, loadServerCart } = useCartStore.getState();
      
      loadServerCart(mergeServerCart(serverItems, localItems));
      queryClient.invalidateQueries({ queryKey: ["cart", user!.id] });
    },
  });
}
