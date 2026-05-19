import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Package, Tag, ShoppingBag, Users } from "lucide-react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tag },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      <aside className="w-56 shrink-0 bg-brand-black flex flex-col">
        <div className="px-6 py-5 border-b border-white/10">
          <span className="font-display text-white text-base tracking-wide">Admin Panel</span>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-white text-brand-black font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
