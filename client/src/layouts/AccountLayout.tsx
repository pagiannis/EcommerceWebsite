import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const navItems = [
  { label: "My Account", to: "/account", end: true },
  { label: "My Orders", to: "/account/orders" },
  { label: "Wishlist", to: "/account/wishlist" },
];

export default function AccountLayout() {
  const user = useAuthStore((s) => s.user)!;
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  async function handleSignOut() {
    await logout();
    navigate("/");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
        <aside className="shrink-0 lg:w-48">
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Hi, {user.firstName}
          </p>
          <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
            {navItems.map(({ label, to, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  isActive
                    ? "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-brand-black bg-brand-gray"
                    : "whitespace-nowrap rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-brand-black transition-colors"
                }
              >
                {label}
              </NavLink>
            ))}
            <div className="lg:border-t lg:border-gray-200 lg:mt-2 lg:pt-2">
              <button
                type="button"
                onClick={handleSignOut}
                className="whitespace-nowrap px-3 py-2 text-left text-sm text-gray-400 hover:text-brand-black underline-offset-2 underline lg:no-underline lg:hover:underline transition-colors"
              >
                Sign out
              </button>
            </div>
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
