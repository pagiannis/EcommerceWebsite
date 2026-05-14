import type { CheckoutData } from "../../types/checkout";

interface Props {
  checkoutData: CheckoutData;
  onBack: () => void;
  onPlaceOrder: () => void;
}

export default function ReviewStep({ onBack, onPlaceOrder }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 p-8">
      <h2 className="mb-6 text-xl font-bold text-gray-900">Review Order</h2>
      <p className="text-sm text-gray-400">Review summary coming in Step 4.</p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={onBack}
          className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          onClick={onPlaceOrder}
          className="rounded-full bg-brand-black px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Place Order →
        </button>
      </div>
    </div>
  );
}
