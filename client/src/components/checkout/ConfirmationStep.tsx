import { Check } from "lucide-react";

export default function ConfirmationStep() {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <Check className="h-10 w-10 text-green-600" />
      </div>
      <h2 className="font-display text-3xl font-bold text-gray-900">
        Order Confirmed!
      </h2>
      <p className="mt-2 text-gray-400">Confirmation details coming in Step 5.</p>
    </div>
  );
}
