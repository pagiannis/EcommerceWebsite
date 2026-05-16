import { Link, Outlet, ScrollRestoration } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function CheckoutLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ScrollRestoration />
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <Link
            to="/"
            className="font-display text-2xl font-extrabold tracking-tight text-brand-black"
          >
            SHOP.CO
          </Link>
          <Link
            to="/cart"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to cart
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
