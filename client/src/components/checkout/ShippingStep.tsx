import type { ShippingData } from "../../types/checkout";

interface Props {
  defaultValues: ShippingData | null;
  onSubmit: (data: ShippingData) => void;
}

export default function ShippingStep({ onSubmit }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 p-8">
      <h2 className="mb-6 text-xl font-bold text-gray-900">Shipping Address</h2>
      <p className="text-sm text-gray-400">Form coming in Step 2.</p>
      <button
        onClick={() =>
          onSubmit({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            zip: "",
            country: "",
          })
        }
        className="mt-6 rounded-full bg-brand-black px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800"
      >
        Continue to Payment →
      </button>
    </div>
  );
}
