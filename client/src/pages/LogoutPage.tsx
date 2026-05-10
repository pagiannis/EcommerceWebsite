import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();

  useEffect(() => {
    const start = Date.now();
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        const remaining = Math.max(0, 800 - (Date.now() - start));
        setTimeout(() => navigate("/", { replace: true }), remaining);
      },
    });
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white">
      <span className="font-display text-3xl font-extrabold tracking-tight text-brand-black">
        SHOP.CO
      </span>
      <Loader2 className="mr-2 h-8 w-8 animate-spin" />
    </div>
  );
}
