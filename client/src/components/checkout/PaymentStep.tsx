import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Loader2, Wallet } from "lucide-react";
import { paymentSchema } from "../../schemas/paymentSchema";
import FormField from "../ui/FormField";
import type { PaymentData } from "../../types/checkout";

type FormValues = z.infer<typeof paymentSchema>;

interface Props {
  defaultValues: PaymentData | null;
  onSubmit: (data: PaymentData) => void;
  onBack: () => void;
}

export default function PaymentStep({ defaultValues, onSubmit, onBack }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { method: "card", cardNumber: "", cardName: "", expiry: "", cvv: "" },
  });

  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  const method = watch("method");

  async function onFormSubmit(values: FormValues) {
    await new Promise((r) => setTimeout(r, 1200));
    onSubmit(values as PaymentData);
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
      <div className="rounded-2xl border border-gray-200 p-8">
        <h2 className="mb-6 text-xl font-bold text-gray-900">Payment Method</h2>

        {/* Method selector */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          {(
            [
              { value: "card", label: "Credit / Debit Card", Icon: CreditCard },
              { value: "paypal", label: "PayPal", Icon: Wallet },
            ] as const
          ).map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue("method", value, { shouldValidate: true })}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                method === value
                  ? "border-brand-black bg-brand-black text-white"
                  : "border-gray-200 text-gray-700 hover:border-gray-400"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {/* Card fields */}
        {method === "card" && (
          <div className="space-y-4">
            <FormField
              label="Card number"
              autoComplete="cc-number"
              inputMode="numeric"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              error={errors.cardNumber?.message}
              {...register("cardNumber")}
            />
            <FormField
              label="Name on card"
              autoComplete="cc-name"
              placeholder="John Doe"
              error={errors.cardName?.message}
              {...register("cardName")}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Expiry"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                maxLength={5}
                error={errors.expiry?.message}
                {...register("expiry")}
              />
              <FormField
                label="CVV"
                autoComplete="cc-csc"
                inputMode="numeric"
                placeholder="123"
                maxLength={4}
                error={errors.cvv?.message}
                {...register("cvv")}
              />
            </div>
          </div>
        )}

        {/* PayPal */}
        {method === "paypal" && (
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-6 py-8 text-center text-sm text-gray-500">
            You'll be redirected to PayPal to complete your payment after reviewing your order.
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-full bg-brand-black px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Continue to Review →"
          )}
        </button>
      </div>
    </form>
  );
}
