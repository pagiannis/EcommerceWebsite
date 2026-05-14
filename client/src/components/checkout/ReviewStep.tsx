import { useState } from "react";
import { isAxiosError } from "axios";
import { CreditCard, Loader2, Wallet } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import type { CheckoutData } from "../../types/checkout";

interface Props {
  checkoutData: CheckoutData;
  onBack: () => void;
  onPlaceOrder: () => Promise<void> | void;
}

export default function ReviewStep({ checkoutData, onBack, onPlaceOrder }: Props) {
  const [isPlacing, setIsPlacing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);

  const { shipping, payment } = checkoutData;

  async function handlePlaceOrder() {
    setIsPlacing(true);
    setServerError(null);
    try {
      await onPlaceOrder();
    } catch (err) {
      const msg = isAxiosError(err)
        ? (err.response?.data?.message ?? "Failed to place order. Please try again.")
        : "Failed to place order. Please try again.";
      setServerError(msg);
    } finally {
      setIsPlacing(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Items */}
      <div className="rounded-2xl border border-gray-200 p-8">
        <h2 className="mb-6 text-xl font-bold text-gray-900">Order Items</h2>
        <ul className="divide-y divide-gray-100">
          {items.map((item) => (
            <li
              key={`${item.product.id}__${item.selectedColor}__${item.selectedSize}`}
              className="flex gap-4 py-4 first:pt-0 last:pb-0"
            >
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                className="h-20 w-20 rounded-xl object-cover"
              />
              <div className="flex flex-1 items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900">{item.product.name}</p>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-3.5 w-3.5 rounded-full border border-gray-200"
                      style={{ backgroundColor: item.selectedColor }}
                    />
                    <span className="text-xs text-gray-500">{item.selectedSize}</span>
                  </div>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Shipping & Payment */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 p-6">
          <h3 className="mb-3 text-sm font-bold text-gray-900">Shipping Address</h3>
          {shipping && (
            <address className="not-italic space-y-0.5 text-sm text-gray-600">
              <p>{shipping.firstName} {shipping.lastName}</p>
              <p>{shipping.address}</p>
              <p>{shipping.city} {shipping.zip}</p>
              <p>{shipping.country}</p>
              <p className="mt-2 text-gray-400">{shipping.email}</p>
              {shipping.phone && <p className="text-gray-400">{shipping.phone}</p>}
            </address>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 p-6">
          <h3 className="mb-3 text-sm font-bold text-gray-900">Payment</h3>
          {payment && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {payment.method === "card" ? (
                <>
                  <CreditCard className="h-4 w-4 shrink-0 text-gray-400" />
                  <span>
                    **** **** **** {payment.cardNumber?.replace(/\s/g, "").slice(-4)}
                  </span>
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4 shrink-0 text-gray-400" />
                  <span>PayPal</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Total + actions */}
      <div className="rounded-2xl border border-gray-200 p-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span className="text-green-600">Free</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-gray-900">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {serverError && (
        <p className="text-sm text-brand-red">{serverError}</p>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isPlacing}
          className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={isPlacing}
          className="inline-flex items-center rounded-full bg-brand-black px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isPlacing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Placing Order...
            </>
          ) : (
            "Place Order →"
          )}
        </button>
      </div>
    </div>
  );
}
