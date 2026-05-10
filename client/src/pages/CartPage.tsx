import { Loader2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useServerCartSync } from '../hooks/useCart';
import Breadcrumb from '../components/ui/Breadcrumb';
import CartItem from '../components/cart/CartItem';
import OrderSummary from '../components/cart/OrderSummary';

export default function CartPage() {
  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const { isLoading, isError } = useServerCartSync();

  if (user && isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <ShoppingCart className="h-16 w-16 text-gray-300 p-2" />
        <h2 className="font-display text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="mt-2 text-gray-500">Looks like you haven't added anything yet.</p>
        <Link
          to="/shop"
          className="mt-6 rounded-full bg-brand-black px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />

      <h1 className="font-display mb-8 text-4xl font-extrabold uppercase tracking-tight text-brand-black">
        Your Cart
      </h1>

      {isError && (
        <p className="mb-4 text-sm text-brand-red">
          Could not sync with server. Showing local data.
        </p>
      )}

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <CartItem
              key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
              item={item}
            />
          ))}
        </div>
        <OrderSummary subtotal={subtotal} />
      </div>
    </div>
  );
}
