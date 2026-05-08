import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserResponse } from "../services/authService";
import { login as apiLogin, logout as apiLogout } from "../services/authService";

interface AuthState {
  user: UserResponse | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,

      login: async (email, password) => {
        const user = await apiLogin(email, password);
        set({ user });
      },

      logout: async () => {
        await apiLogout();
        set({ user: null });
      },

      isLoggedIn: () => get().user !== null,
    }),
    {
      name: "auth",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
