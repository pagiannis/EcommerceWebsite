import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import Breadcrumb from '../components/ui/Breadcrumb';
import CartItem from '../components/cart/CartItem';
import OrderSummary from '../components/cart/OrderSummary';
import { ShoppingCart } from 'lucide-react';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const subtotal = useCartStore((s) => s.subtotal);

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

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <CartItem
              key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
              item={item}
              onRemove={removeItem}
              onQuantityChange={updateQuantity}
            />
          ))}
        </div>
        <OrderSummary subtotal={subtotal} />
      </div>
    </div>
  );
}
