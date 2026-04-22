import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { LuShoppingCart } from "react-icons/lu";
import { FaChevronDown, FaRegUserCircle } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { IoMenu } from "react-icons/io5";

const shopCategories = ["Casual", "Formal", "Party", "Gym"];

export default function Navbar() {
  const { totalItems } = useCart();
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-display font-extrabold tracking-tight text-brand-black"
        >
          SHOP.CO
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center pl-10 gap-6 md:flex">
          <div className="relative" onMouseLeave={() => setShopOpen(false)}>
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-black"
              onMouseEnter={() => setShopOpen(true)}
            >
              Shop
              <FaChevronDown className="h-3 w-3" />
            </button>
            {shopOpen && (
              <div className="absolute left-0 top-full mt-1 w-40 rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
                {shopCategories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/shop?category=${cat.toLowerCase()}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-gray"
                    onClick={() => setShopOpen(false)}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <NavLink
            to="/shop"
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            On Sale
          </NavLink>
          <NavLink
            to="/shop"
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            New Arrivals
          </NavLink>
          <NavLink
            to="/shop"
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            Brands
          </NavLink>
        </nav>

        {/* Search */}
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

        {/* Icons */}
        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative">
            <LuShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-black text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
          <button type="button" className="hidden md:block">
            <FaRegUserCircle className="h-5 w-5" />
          </button>
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <IoMenu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
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
            <Link
              to="/shop"
              className="text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              On Sale
            </Link>
            <Link
              to="/shop"
              className="text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              New Arrivals
            </Link>
            <Link
              to="/shop"
              className="text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Brands
            </Link>
          </nav>
          <div className="mt-3">
            <input
              type="search"
              placeholder="Search for products..."
              className="w-full rounded-full bg-brand-gray px-4 py-2 text-sm outline-none"
            />
          </div>
        </div>
      )}
    </header>
  );
}
