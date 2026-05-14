import type { PaymentData } from "../../types/checkout";

interface Props {
  defaultValues: PaymentData | null;
  onSubmit: (data: PaymentData) => void;
  onBack: () => void;
}

export default function PaymentStep({ onSubmit, onBack }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 p-8">
      <h2 className="mb-6 text-xl font-bold text-gray-900">Payment Method</h2>
      <p className="text-sm text-gray-400">Payment form coming in Step 3.</p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={onBack}
          className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          onClick={() => onSubmit({ method: "card" })}
          className="rounded-full bg-brand-black px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Continue to Review →
        </button>
      </div>
    </div>
  );
}
