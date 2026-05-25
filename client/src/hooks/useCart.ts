import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CartItem } from "../types/cartItem";
import type { Product } from "../types/product";
import type { Size } from "../types/size";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import * as cartService from "../services/cartService";

interface AddToCartArgs {
  product: Product;
  color: string;
  size: Size;
  variantId: number;
  qty?: number;
}

interface RemoveFromCartArgs {
  productId: string;
  color: string;
  size: Size;
}

interface UpdateCartQuantityArgs {
  productId: string;
  color: string;
  size: Size;
  qty: number;
}

export function useServerCartSync() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async (): Promise<CartItem[]> => {
      const serverItems = await cartService.getCart(user!.id);
      const { items: localItems, loadServerCart } = useCartStore.getState();
      const mergedItems = cartService.mergeServerCart(serverItems, localItems);
      loadServerCart(mergedItems);
      return mergedItems;
    },
    enabled: !!user,
    staleTime: 0,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ product, color, size, variantId, qty = 1 }: AddToCartArgs) => {
      const stockQuantity = product.variants.find((v) => v.id === variantId)?.stockQuantity;
      useCartStore.getState().addItem(product, color, size, variantId, qty, stockQuantity);

      const { user } = useAuthStore.getState();
      if (user) {
        const serverItem = await cartService.addToCart(user.id, variantId, qty);
        useCartStore.getState().setCartItemId(variantId, serverItem.id);
        queryClient.invalidateQueries({ queryKey: ["cart", user.id] });
      }
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, color, size }: RemoveFromCartArgs) => {
      const { items } = useCartStore.getState();
      const target = items.find(
        (i) => i.product.id === productId && i.selectedColor === color && i.selectedSize === size
      );
      const { cartItemId } = target ?? {};

      useCartStore.getState().removeItem(productId, color, size);

      const { user } = useAuthStore.getState();
      if (user && cartItemId !== undefined) {
        await cartService.removeCartItem(cartItemId);
        queryClient.invalidateQueries({ queryKey: ["cart", user.id] });
      }
    },
  });
}

export function useUpdateCartQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, color, size, qty }: UpdateCartQuantityArgs) => {
      const { items } = useCartStore.getState();
      const target = items.find(
        (i) => i.product.id === productId && i.selectedColor === color && i.selectedSize === size
      );
      const { cartItemId } = target ?? {};

      useCartStore.getState().updateQuantity(productId, color, size, qty);

      const { user } = useAuthStore.getState();
      if (user && cartItemId !== undefined) {
        if (qty <= 0) {
          await cartService.removeCartItem(cartItemId);
        } else {
          await cartService.updateCartItem(cartItemId, qty);
        }
        queryClient.invalidateQueries({ queryKey: ["cart", user.id] });
      }
    },
  });
}
