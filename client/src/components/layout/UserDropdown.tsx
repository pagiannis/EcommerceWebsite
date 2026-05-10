import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CircleUserRound } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export default function UserDropdown() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleOpen() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function handleClose() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

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
        <div className="absolute right-0 top-full mt-0 min-w-[160px] rounded-xl border border-gray-100 bg-white py-3 shadow-lg">
          {isLoggedIn() ? (
            <>
              <Link
                to="/account"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                My Account
              </Link>
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
