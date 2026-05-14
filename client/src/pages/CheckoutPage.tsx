import { useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import Breadcrumb from "../components/ui/Breadcrumb";
import ShippingStep from "../components/checkout/ShippingStep";
import PaymentStep from "../components/checkout/PaymentStep";
import ReviewStep from "../components/checkout/ReviewStep";
import ConfirmationStep from "../components/checkout/ConfirmationStep";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { createOrder } from "../services/ordersService";
import type { OrderResponse } from "../services/ordersService";
import type { CheckoutData, ShippingData, PaymentData } from "../types/checkout";

type Step = "shipping" | "payment" | "review" | "confirmation";

const STEPS: { key: Step; label: string }[] = [
  { key: "shipping", label: "Shipping" },
  { key: "payment", label: "Payment" },
  { key: "review", label: "Review" },
];

const PAYMENT_METHOD_MAP = {
  card: "CARD",
  paypal: "PAYPAL",
} as const;

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>("shipping");
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    shipping: null,
    addressId: null,
    payment: null,
  });
  const [order, setOrder] = useState<OrderResponse | null>(null);

  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  if (items.length === 0 && step !== "confirmation") {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h2 className="font-display text-2xl font-bold text-gray-900">
          Your cart is empty
        </h2>
        <p className="mt-2 text-gray-500">Add items before checking out.</p>
        <Link
          to="/shop"
          className="mt-6 rounded-full bg-brand-black px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  const activeIndex = STEPS.findIndex((s) => s.key === step);

  function handleShippingSubmit(data: ShippingData, addressId: number) {
    setCheckoutData((prev) => ({ ...prev, shipping: data, addressId }));
    setStep("payment");
  }

  function handlePaymentSubmit(data: PaymentData) {
    setCheckoutData((prev) => ({ ...prev, payment: data }));
    setStep("review");
  }

  function handleBack() {
    if (step === "payment") setStep("shipping");
    else if (step === "review") setStep("payment");
  }

  async function handlePlaceOrder() {
    const placed = await createOrder(user!.id, {
      shippingAddressId: checkoutData.addressId!,
      paymentMethod: PAYMENT_METHOD_MAP[checkoutData.payment!.method],
    });
    setOrder(placed);
    clearCart();
    setStep("confirmation");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", to: "/" },
          { label: "Cart", to: "/cart" },
          { label: "Checkout" },
        ]}
      />

      <h1 className="font-display mb-8 text-4xl font-extrabold uppercase tracking-tight text-brand-black">
        Checkout
      </h1>

      {step !== "confirmation" && (
        <div className="mb-10 flex items-center">
          {STEPS.map(({ key, label }, i) => {
            const done = i < activeIndex;
            const active = i === activeIndex;
            return (
              <div key={key} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                      done || active
                        ? "bg-brand-black text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span
                    className={`hidden text-sm font-semibold sm:inline ${
                      active ? "text-brand-black" : done ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-px w-8 sm:mx-4 sm:w-20 ${
                      done ? "bg-brand-black" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {step === "shipping" && (
        <ShippingStep
          defaultValues={checkoutData.shipping}
          onSubmit={handleShippingSubmit}
        />
      )}
      {step === "payment" && (
        <PaymentStep
          defaultValues={checkoutData.payment}
          onSubmit={handlePaymentSubmit}
          onBack={handleBack}
        />
      )}
      {step === "review" && (
        <ReviewStep
          checkoutData={checkoutData}
          onBack={handleBack}
          onPlaceOrder={handlePlaceOrder}
        />
      )}
      {step === "confirmation" && order && <ConfirmationStep order={order} />}
    </div>
  );
}
