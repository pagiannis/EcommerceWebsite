import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CircleUserRound } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export default function UserDropdown() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleOpen() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function handleClose() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  function handleSignOut() {
    setOpen(false);
    navigate("/logout");
  }

  const linkClass =
    "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50";

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
    >
      <button
        type="button"
        aria-label="Account"
        onClick={() => setOpen((o) => !o)}
      >
        <CircleUserRound className="h-6 w-6" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-0 min-w-[180px] rounded-xl border border-gray-100 bg-white py-3 shadow-lg">
          {isLoggedIn() ? (
            <>
              <p className="px-4 py-2 text-sm font-semibold text-gray-900">
                Hi, {user!.firstName}
              </p>
              <div className="mx-4 mb-1 border-t border-gray-200" />
              <Link to="/account" className={linkClass} onClick={() => setOpen(false)}>
                My Account
              </Link>
              <Link to="/account/orders" className={linkClass} onClick={() => setOpen(false)}>
                My Orders
              </Link>
              <Link to="/account/wishlist" className={linkClass} onClick={() => setOpen(false)}>
                Wishlist
              </Link>
              <div className="mx-4 mt-1 border-t border-gray-200" />
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-gray-500 underline hover:bg-gray-50"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                Join
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
