import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import QuantityStepper from '../components/ui/QuantityStepper';

const DELIVERY_FEE = 15;
const PROMO_CODES: Record<string, number> = { SHOP20: 20, SAVE10: 10 };

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState(false);

  const discountPct = appliedPromo ? PROMO_CODES[appliedPromo] : 0;
  const discountAmt = Math.round((subtotal * discountPct) / 100);
  const total = subtotal - discountAmt + DELIVERY_FEE;

  function handleApplyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setPromoError(false);
    } else {
      setPromoError(true);
      setAppliedPromo(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <svg className="mb-4 h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-10 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        </svg>
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
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-black">Home</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">Cart</span>
      </nav>

      <h1 className="font-display mb-8 text-4xl font-extrabold uppercase tracking-tight text-brand-black">
        Your Cart
      </h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Cart items */}
        <div className="flex-1 space-y-4">
          {items.map(item => (
            <div
              key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
              className="flex gap-4 rounded-2xl border border-gray-200 p-4"
            >
              <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-brand-gray">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                    <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      Color:
                      <span
                        className="inline-block h-3 w-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: item.selectedColor }}
                      />
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.product.id, item.selectedColor, item.selectedSize)}
                    className="text-brand-red hover:opacity-70"
                    aria-label="Remove item"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">${item.product.price}</span>
                  <QuantityStepper
                    value={item.quantity}
                    onChange={qty => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, qty)}
                    min={0}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="w-full rounded-2xl border border-gray-200 p-6 lg:w-96 lg:flex-shrink-0 h-fit">
          <h2 className="mb-5 text-xl font-bold text-gray-900">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">${subtotal}</span>
            </div>
            {discountAmt > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Discount (-{discountPct}%)</span>
                <span className="font-medium text-brand-red">-${discountAmt}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span className="font-medium text-gray-900">${DELIVERY_FEE}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-gray-900">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>

          {/* Promo code */}
          <div className="mt-5 flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A1.994 1.994 0 0 1 3 12V7a4 4 0 0 1 4-4z" />
              </svg>
              <input
                type="text"
                value={promoInput}
                onChange={e => { setPromoInput(e.target.value); setPromoError(false); }}
                placeholder="Add promo code"
                className="w-full rounded-full bg-brand-gray py-2.5 pl-9 pr-3 text-sm outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyPromo}
              className="rounded-full bg-brand-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Apply
            </button>
          </div>
          {promoError && <p className="mt-1 text-xs text-brand-red">Invalid promo code.</p>}
          {appliedPromo && <p className="mt-1 text-xs text-green-600">Code "{appliedPromo}" applied!</p>}

          <button
            type="button"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand-black py-4 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Go to Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}
