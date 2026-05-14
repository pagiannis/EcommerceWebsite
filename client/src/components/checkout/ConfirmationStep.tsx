import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import type { OrderResponse } from "../../services/ordersService";

interface Props {
  order: OrderResponse;
}

export default function ConfirmationStep({ order }: Props) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <Check className="h-10 w-10 text-green-600" />
      </div>

      <h2 className="font-display text-3xl font-bold text-gray-900">
        Order Confirmed!
      </h2>

      <p className="mt-2 text-gray-500">
        Thank you for your purchase. We'll send you a confirmation email
        shortly.
      </p>

      <div className="mt-6 rounded-2xl border border-gray-200 px-10 py-6 text-center">
        <p className="text-xs uppercase tracking-widest text-gray-400">
          Order number
        </p>
        <p className="mt-1 font-mono text-2xl font-bold text-gray-900">
          {order.orderNumber}
        </p>
        <p className="mt-3 text-sm text-gray-500">
          Total paid:{" "}
          <span className="font-semibold text-gray-900">
            ${order.total.toFixed(2)}
          </span>
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          to="/account/orders"
          className="w-48 rounded-full bg-brand-black py-3 text-center text-sm font-semibold text-white hover:bg-gray-800"
        >
          View My Orders
        </Link>
        <Link
          to="/shop"
          className="w-48 rounded-full border border-gray-300 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
