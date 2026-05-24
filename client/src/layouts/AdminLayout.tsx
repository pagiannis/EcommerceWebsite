import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import {
  LayoutDashboard,
  Package,
  Tag,
  Award,
  Layers,
  ShoppingBag,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tag },
  { to: "/admin/brands", label: "Brands", icon: Award },
  { to: "/admin/product-types", label: "Product Types", icon: Layers },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-56 bg-brand-black flex flex-col transition-transform duration-200 md:static md:translate-x-0 md:shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <span className="font-display text-white text-base tracking-wide">
            Admin Panel
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white/60 hover:text-white md:hidden"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
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
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={() => { setSidebarOpen(false); navigate("/logout"); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-brand-black transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="font-display text-base font-bold">Admin Panel</span>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      <Toaster
        position="top-center"
        toastOptions={{ duration: 3000, style: { fontSize: "0.875rem" } }}
      />
    </div>
  );
}
