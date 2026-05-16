import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import type { UpdateUserPayload } from "../services/accountService";
import { getUser, updateUser } from "../services/accountService";

export function useUser() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId!),
    enabled: userId !== undefined,
  });
}

export function useUpdateUserMutation() {
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateUser(userId!, payload),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["user", userId], updatedUser);
      useAuthStore.setState({ user: updatedUser });
    },
  });
}
