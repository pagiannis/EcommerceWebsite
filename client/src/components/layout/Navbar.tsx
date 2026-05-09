import { useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";
import { LuShoppingCart } from "react-icons/lu";
import { FaChevronDown } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { IoMenu } from "react-icons/io5";
import ShopMegaMenu, { megaMenu } from "./ShopMegaMenu";
import NavbarSearch from "./NavbarSearch";
import UserDropdown from "./UserDropdown";

const brandsList = [
  { slug: "nike", label: "Nike" },
  { slug: "levis", label: "Levi's" },
  { slug: "tommy-hilfiger", label: "Tommy Hilfiger" },
  { slug: "ralph-lauren", label: "Ralph Lauren" },
  { slug: "hm", label: "H&M" },
  { slug: "zara", label: "Zara" },
  { slug: "calvin-klein", label: "Calvin Klein" },
] as const;

export default function Navbar() {
  const totalItems = useCartStore((s) => s.totalItems);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);

  const brandsCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openBrands() {
    if (brandsCloseTimer.current) clearTimeout(brandsCloseTimer.current);
    setBrandsOpen(true);
  }

  function scheduleBrandsClose() {
    brandsCloseTimer.current = setTimeout(() => setBrandsOpen(false), 150);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-4 lg:px-8">
        {/* Mobile: hamburger */}
        {!searchOpen && (
          <button
            type="button"
            className="mr-4 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <IoMenu className="h-6 w-6" />
          </button>
        )}

        {/* Logo */}
        {!searchOpen && (
          <Link
            to="/"
            className="text-2xl font-display font-extrabold tracking-tight text-brand-black md:mr-10"
          >
            SHOP.CO
          </Link>
        )}

        {/* Desktop: nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <ShopMegaMenu />

          <NavLink
            to="/shop?onSale=true"
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            On Sale
          </NavLink>
          <NavLink
            to="/shop?newArrivals=true"
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            New Arrivals
          </NavLink>

          {/* Brands dropdown */}
          <div
            className="relative"
            onMouseEnter={openBrands}
            onMouseLeave={scheduleBrandsClose}
          >
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-black"
            >
              Brands
              <FaChevronDown className="h-3 w-3" />
            </button>

            {brandsOpen && (
              <div className="absolute left-0 top-full mt-1 min-w-[160px] rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg">
                <Link
                  to="/shop"
                  className="mb-2 block text-sm font-bold text-brand-black hover:underline"
                  onClick={() => setBrandsOpen(false)}
                >
                  All Brands
                </Link>
                <ul className="space-y-1.5">
                  {brandsList.map((b) => (
                    <li key={b.slug}>
                      <Link
                        to={`/shop?brand=${b.slug}`}
                        className="text-sm text-gray-600 hover:text-black"
                        onClick={() => setBrandsOpen(false)}
                      >
                        {b.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </nav>

        {/* Search (desktop bar + mobile overlay) */}
        <NavbarSearch
          searchOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
        />

        {/* Icons */}
        {!searchOpen && (
          <div className="flex items-center gap-4 ml-auto md:ml-0">
            <button
              type="button"
              className="md:hidden"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
            >
              <IoIosSearch className="h-6 w-6" />
            </button>
            <Link to="/cart" className="relative">
              <LuShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-black text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
            <UserDropdown />
          </div>
        )}
      </div>

      {/* Mobile: menu drawer */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-3 pt-3">
            <Link
              to="/shop"
              className="text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Shop
            </Link>
            {megaMenu.map((col) => (
              <Link
                key={col.category}
                to={`/shop?category=${col.category}`}
                className="text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {col.label}
              </Link>
            ))}
            <Link
              to="/shop?onSale=true"
              className="text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              On Sale
            </Link>
            <Link
              to="/shop?newArrivals=true"
              className="text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              New Arrivals
            </Link>
            <span className="text-sm font-semibold text-gray-400">Brands</span>
            {brandsList.map((b) => (
              <Link
                key={b.slug}
                to={`/shop?brand=${b.slug}`}
                className="pl-3 text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {b.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
