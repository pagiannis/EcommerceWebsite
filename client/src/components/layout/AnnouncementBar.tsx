import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function AnnouncementBar() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [visible, setVisible] = useState(true);
  if (isLoggedIn() || !visible) return null;
  return (
    <div className="bg-brand-black py-2 text-sm text-white">
      <div className="relative mx-auto max-w-7xl px-4 text-center">
        Sign up and get 20% off to your first order.{" "}
        <Link
          to="/register"
          className="font-semibold underline hover:no-underline"
        >
          Sign Up Now
        </Link>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute right-0 lg:right-9 top-1/2 -translate-y-1/2 text-white opacity-70 hover:opacity-100"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
