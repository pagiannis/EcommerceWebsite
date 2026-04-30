import { useState } from "react";
import PromoCodeIcon from "../ui/PromoCodeIcon";

const DELIVERY_FEE = 15;
const PROMO_CODES: Record<string, number> = { SHOP20: 20, SAVE10: 10 };

interface OrderSummaryProps {
  subtotal: number;
}

export default function OrderSummary({ subtotal }: OrderSummaryProps) {
  const [promoInput, setPromoInput] = useState("");
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

  return (
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

      <div className="mt-5 flex gap-2">
        <div className="relative flex-1">
          <PromoCodeIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={promoInput}
            onChange={(e) => {
              setPromoInput(e.target.value);
              setPromoError(false);
            }}
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
      {promoError && (
        <p className="mt-1 text-xs text-brand-red">Invalid promo code.</p>
      )}
      {appliedPromo && (
        <p className="mt-1 text-xs text-green-600">
          Code "{appliedPromo}" applied!
        </p>
      )}

      <button
        type="button"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand-black py-4 text-sm font-semibold text-white transition hover:bg-gray-800"
      >
        Go to Checkout →
      </button>
    </div>
  );
}
