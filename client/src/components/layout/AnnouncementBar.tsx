import { useState } from "react";
import { Link } from "react-router-dom";

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="bg-brand-black py-2 text-sm text-white">
      <div className="relative mx-auto max-w-7xl px-4 text-center">
        Sign up and get 20% off to your first order.{" "}
        <Link to="/shop" className="font-semibold underline hover:no-underline">
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
