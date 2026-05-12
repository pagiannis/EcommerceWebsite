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
  const register = useAuthStore((s) => s.register);
  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
  });
}

export function useLogoutMutation() {
  const logout = useAuthStore((s) => s.logout);
  return useMutation({
    mutationFn: () => logout(),
  });
}
