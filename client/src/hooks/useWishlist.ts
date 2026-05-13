import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { addToWishlist, getWishlist, removeFromWishlist } from "../services/wishlistService";

export function useWishlist() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["users", userId, "wishlist"],
    queryFn: () => getWishlist(userId!),
    enabled: userId !== undefined,
  });
}

export function useToggleWishlist(productId: string) {
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  const { data: wishlistItems } = useWishlist();

  const isWishlisted = wishlistItems?.some((item) => item.productId === Number(productId)) ?? false;

  const mutation = useMutation({
    mutationFn: () =>
      isWishlisted
        ? removeFromWishlist(userId!, Number(productId))
        : addToWishlist(userId!, Number(productId)),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users", userId, "wishlist"] });
    },
  });

  return {
    isWishlisted,
    toggle: () => mutation.mutate(),
    isPending: mutation.isPending,
  };
}

