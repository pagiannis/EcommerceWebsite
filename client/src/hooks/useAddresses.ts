import { useQuery } from "@tanstack/react-query";
import { getAddresses } from "../services/addressService";
import { useAuthStore } from "../store/authStore";

export function useAddresses() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: () => getAddresses(user!.id),
    enabled: !!user,
  });
}
