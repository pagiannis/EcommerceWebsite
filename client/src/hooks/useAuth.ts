import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import type { RegisterPayload } from "../services/authService";

export function useLoginMutation() {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
  });
}

export function useRegisterMutation() {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const { register } = await import("../services/authService");
      await register(payload);
      await login(payload.email, payload.password);
    },
  });
}

export function useLogoutMutation() {
  const logout = useAuthStore((s) => s.logout);
  return useMutation({
    mutationFn: () => logout(),
  });
}
