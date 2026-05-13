import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { getOrders } from "../services/ordersService";

export function useOrders() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["orders", userId],
    queryFn: () => getOrders(userId!),
    enabled: userId !== undefined,
  });
}
