import { useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { LuShoppingCart } from "react-icons/lu";
import { FaChevronDown, FaRegUserCircle } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { IoMenu, IoClose } from "react-icons/io5";

const brandsList = [
  { slug: "nike", label: "Nike" },
  { slug: "levis", label: "Levi's" },
  { slug: "tommy-hilfiger", label: "Tommy Hilfiger" },
  { slug: "ralph-lauren", label: "Ralph Lauren" },
  { slug: "hm", label: "H&M" },
  { slug: "zara", label: "Zara" },
  { slug: "calvin-klein", label: "Calvin Klein" },
] as const;

const megaMenu = [
  {
    category: "men",
    label: "Men",
    types: ["T-Shirts", "Jeans", "Shirts", "Polo", "Hoodies", "Shorts", "Blazers"],
  },
  {
    category: "women",
    label: "Women",
    types: ["T-Shirts", "Jeans", "Hoodies"],
  },
  {
    category: "kids",
    label: "Kids",
    types: [],
  },
] as const;

const typeParam: Record<string, string> = {
  "T-Shirts": "t-shirt",
  Jeans: "jeans",
  Shirts: "shirt",
  Polo: "polo",
  Hoodies: "hoodie",
  Shorts: "shorts",
  Blazers: "blazer",
};

export default function Navbar() {
  const { totalItems } = useCart();
  const [shopOpen, setShopOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const brandsCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  function openShop() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setShopOpen(true);
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setShopOpen(false), 150);
  }

  function openBrands() {
    if (brandsCloseTimer.current) clearTimeout(brandsCloseTimer.current);
    setBrandsOpen(true);
  }

  function scheduleBrandsClose() {
    brandsCloseTimer.current = setTimeout(() => setBrandsOpen(false), 150);
  }

  function openMobileSearch() {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }

  function closeMobileSearch() {
    setSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-4 lg:px-8">
        {/* Mobile: hamburger left */}
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

        {/* Mobile: search input */}
        {searchOpen && (
          <div className="flex flex-1 items-center gap-2 md:hidden">
            <div className="relative flex-1">
              <IoIosSearch className="absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Search for products..."
                className="w-full rounded-full bg-brand-gray py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <button
              type="button"
              onClick={closeMobileSearch}
              aria-label="Close search"
            >
              <IoClose className="h-6 w-6" />
            </button>
          </div>
        )}

        {/* Desktop: nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {/* Shop mega menu */}
          <div
            className="relative"
            onMouseEnter={openShop}
            onMouseLeave={scheduleClose}
          >
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-black"
            >
              Shop
              <FaChevronDown className="h-3 w-3" />
            </button>

            {shopOpen && (
              <div className="absolute left-0 top-full mt-1 grid grid-cols-3 gap-8 rounded-xl border border-gray-100 bg-white px-8 py-6 shadow-lg w-[420px]">
                {megaMenu.map((col) => (
                  <div key={col.category}>
                    <Link
                      to={`/shop?category=${col.category}`}
                      className="mb-2 block text-sm font-bold text-brand-black hover:underline"
                      onClick={() => setShopOpen(false)}
                    >
                      {col.label}
                    </Link>
                    <ul className="space-y-1.5">
                      {col.types.length === 0 ? (
                        <li>
                          <Link
                            to={`/shop?category=${col.category}`}
                            className="text-sm text-gray-600 hover:text-black"
                            onClick={() => setShopOpen(false)}
                          >
                            All
                          </Link>
                        </li>
                      ) : (
                        col.types.map((type) => (
                          <li key={type}>
                            <Link
                              to={`/shop?category=${col.category}&type=${typeParam[type]}`}
                              className="text-sm text-gray-600 hover:text-black"
                              onClick={() => setShopOpen(false)}
                            >
                              {type}
                            </Link>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

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

        {/* Desktop: search bar */}
        <div className="hidden flex-1 items-center justify-center px-8 md:flex">
          <div className="relative w-full max-w-sm">
            <IoIosSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search for products..."
              className="w-full rounded-full bg-brand-gray py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        {/* Icons — hidden on mobile when search is open */}
        {!searchOpen && (
          <div className="flex items-center gap-4 ml-auto md:ml-auto">
            {/* Search icon — mobile only */}
            <button
              type="button"
              className="md:hidden"
              onClick={openMobileSearch}
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
            <Link to="/account" className="relative">
              <FaRegUserCircle className="h-6 w-6" />
            </Link>
          </div>
        )}
      </div>

      {/* Mobile: menu */}
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
