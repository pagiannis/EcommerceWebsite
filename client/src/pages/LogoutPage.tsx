import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../hooks/useAuth";

export default function LogoutPage() {
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();

  useEffect(() => {
    const start = Date.now();
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        const remaining = Math.max(0, 500 - (Date.now() - start));
        setTimeout(() => navigate("/", { replace: true }), remaining);
      },
    });
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white">
      <span className="font-display text-3xl font-extrabold tracking-tight text-brand-black">
        SHOP.CO
      </span>
      <svg
        className="h-8 w-8 animate-spin text-brand-black"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </div>
  );
}
