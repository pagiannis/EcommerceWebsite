import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { shippingSchema } from "../../schemas/shippingSchema";
import FormField from "../ui/FormField";
import { useAuthStore } from "../../store/authStore";
import { createAddress } from "../../services/addressService";
import type { AddressResponse } from "../../services/addressService";
import { useAddresses } from "../../hooks/useAddresses";
import type { ShippingData } from "../../types/checkout";
import ShippingStepSkeleton from "./ShippingStepSkeleton";

type FormValues = z.infer<typeof shippingSchema>;

interface Props {
  defaultValues: ShippingData | null;
  onSubmit: (data: ShippingData, addressId: number) => void;
}

export default function ShippingStep({ defaultValues, onSubmit }: Props) {
  const user = useAuthStore((s) => s.user);
  const [serverError, setServerError] = useState<string | null>(null);
  // track the pre-filled default address so we can skip POST if unchanged
  const prefilled = useRef<AddressResponse | null>(null);

  const { data: addresses, isLoading: addressesLoading } = useAddresses();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      zip: "",
      country: "",
    },
  });

  useEffect(() => {
    // Coming back from a later step — restore exactly what the user entered
    if (defaultValues) {
      reset(defaultValues);
      return;
    }

    const defaultAddr = addresses?.find((a) => a.isDefault) ?? addresses?.[0] ?? null;
    prefilled.current = defaultAddr;

    reset({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      address: defaultAddr?.street ?? "",
      city: defaultAddr?.city ?? "",
      zip: defaultAddr?.postalCode ?? "",
      country: defaultAddr?.country ?? "",
    });
  }, [defaultValues, addresses, user, reset]);

  async function onFormSubmit(values: FormValues) {
    if (!user) return;
    setServerError(null);

    const addr = prefilled.current;
    const addressUnchanged =
      addr !== null &&
      values.address === addr.street &&
      values.city === addr.city &&
      values.zip === addr.postalCode &&
      values.country === addr.country;

    if (addressUnchanged) {
      onSubmit(values, addr.id);
      return;
    }

    try {
      const saved = await createAddress(user.id, {
        street: values.address,
        city: values.city,
        postalCode: values.zip,
        country: values.country,
        isDefault: false,
      });
      onSubmit(values, saved.id);
    } catch {
      setServerError("Failed to save address. Please try again.");
    }
  }

  if (addressesLoading) {
    return <ShippingStepSkeleton />;
  }

  return (
    // eslint-disable-next-line react-hooks/refs
    <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
      <div className="rounded-2xl border border-gray-200 p-5 sm:p-8">
        <h2 className="mb-6 text-xl font-bold text-gray-900">Shipping Address</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="First name"
              autoComplete="given-name"
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <FormField
              label="Last name"
              autoComplete="family-name"
              error={errors.lastName?.message}
              {...register("lastName")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <FormField
              label="Phone"
              type="tel"
              autoComplete="tel"
              hint="(optional)"
              placeholder="+1 234 567 8900"
              error={errors.phone?.message}
              {...register("phone")}
            />
          </div>

          <FormField
            label="Street address"
            autoComplete="street-address"
            placeholder="123 Main St, Apt 4B"
            error={errors.address?.message}
            {...register("address")}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="City"
              autoComplete="address-level2"
              error={errors.city?.message}
              {...register("city")}
            />
            <FormField
              label="ZIP / Postal code"
              autoComplete="postal-code"
              error={errors.zip?.message}
              {...register("zip")}
            />
          </div>

          <FormField
            label="Country"
            autoComplete="country-name"
            placeholder="e.g. United States"
            error={errors.country?.message}
            {...register("country")}
          />
        </div>

        {serverError && (
          <p className="mt-4 text-sm text-brand-red">{serverError}</p>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-full bg-brand-black px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Continue to Payment →"
          )}
        </button>
      </div>
    </form>
  );
}
