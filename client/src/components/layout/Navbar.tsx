import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const shopCategories = ['Casual', 'Formal', 'Party', 'Gym'];

export default function Navbar() {
  const { totalItems } = useCart();
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-brand-black">
          SHOP.CO
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <div className="relative" onMouseLeave={() => setShopOpen(false)}>
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-black"
              onMouseEnter={() => setShopOpen(true)}
            >
              Shop
              <svg className="h-3 w-3" viewBox="0 0 10 6" fill="currentColor">
                <path d="M0 0l5 6 5-6H0z" />
              </svg>
            </button>
            {shopOpen && (
              <div className="absolute left-0 top-full mt-1 w-40 rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
                {shopCategories.map(cat => (
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
          <NavLink to="/shop" className="text-sm font-medium text-gray-700 hover:text-black">
            On Sale
          </NavLink>
          <NavLink to="/shop" className="text-sm font-medium text-gray-700 hover:text-black">
            New Arrivals
          </NavLink>
          <NavLink to="/shop" className="text-sm font-medium text-gray-700 hover:text-black">
            Brands
          </NavLink>
        </nav>

        {/* Search */}
        <div className="hidden flex-1 items-center justify-center px-8 md:flex">
          <div className="relative w-full max-w-sm">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
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
            <svg className="h-6 w-6 text-gray-700 hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-10 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-black text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
          <button type="button" className="hidden md:block">
            <svg className="h-6 w-6 text-gray-700 hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"
              />
            </svg>
          </button>
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="md:hidden"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-3 pt-3">
            <Link to="/shop" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>Shop</Link>
            <Link to="/shop" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>On Sale</Link>
            <Link to="/shop" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>New Arrivals</Link>
            <Link to="/shop" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>Brands</Link>
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
