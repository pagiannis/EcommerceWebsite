import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserResponse, RegisterPayload } from "../services/authService";
import { login as apiLogin, logout as apiLogout, register as apiRegister } from "../services/authService";
import { useCartStore } from "./cartStore";
import * as cartService from "../services/cartService";

interface AuthState {
  user: UserResponse | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  isLoggedIn: () => boolean;
}

async function syncCartWithServer(userId: number): Promise<void> {
  const cart = useCartStore.getState();
  const guestItems = cart.items;

  const unsyncedItems = guestItems.filter((item) => item.cartItemId === undefined);
  await Promise.all(
    unsyncedItems.map((item) =>
      cartService.addToCart(userId, item.variantId, item.quantity).catch(() => {})
    )
  );

  const serverItems = await cartService.getCart(userId);
  const mergedItems = cartService.mergeServerCart(serverItems, guestItems);
  cart.loadServerCart(mergedItems);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,

      login: async (email, password) => {
        const user = await apiLogin(email, password);
        set({ user });
        await syncCartWithServer(user.id);
      },

      register: async (payload) => {
        await apiRegister(payload);
        const user = await apiLogin(payload.email, payload.password);
        set({ user });
        await syncCartWithServer(user.id);
      },

      logout: async () => {
        await apiLogout();
        set({ user: null });
        useCartStore.getState().clearCart();
      },

      isLoggedIn: () => get().user !== null,
    }),
    {
      name: "auth",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
