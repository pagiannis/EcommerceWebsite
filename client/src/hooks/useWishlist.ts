import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { getWishlist } from "../services/wishlistService";

export function useWishlist() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["users", userId, "wishlist"],
    queryFn: () => getWishlist(userId!),
    enabled: userId !== undefined,
  });
}
