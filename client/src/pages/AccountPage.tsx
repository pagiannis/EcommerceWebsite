import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser, useUpdateUserMutation } from "../hooks/useAccount";
import { profileSchema, type ProfileValues } from "../schemas/profileSchema";
import AccountSkeleton from "../components/account/AccountSkeleton";
import { Loader2 } from "lucide-react";

export default function AccountPage() {
  const { data: user, isError, isLoading } = useUser();
  const updateMutation = useUpdateUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "" },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? "",
      });
    }
  }, [user, reset]);

  async function onSubmit(values: ProfileValues) {
    const updatedUser = await updateMutation.mutateAsync({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone || undefined,
    });
    reset({
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone ?? "",
    });
  }

  const memberSince = user
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : null;

  if (isError) {
    return (
      <p className="text-sm text-brand-red">
        Failed to load profile. Please try again.
      </p>
    );
  }

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-extrabold uppercase tracking-tight text-brand-black">
        Personal Information
      </h1>

      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        {isLoading ? (
          <AccountSkeleton />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <dl className="divide-y divide-gray-100">
              <FormRow label="First name" error={errors.firstName?.message}>
                <input
                  {...register("firstName")}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-black"
                />
              </FormRow>
              <FormRow label="Last name" error={errors.lastName?.message}>
                <input
                  {...register("lastName")}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-black"
                />
              </FormRow>
              <FormRow label="Email" error={errors.email?.message}>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-black"
                />
              </FormRow>
              <FormRow label="Phone" error={errors.phone?.message}>
                <input
                  type="tel"
                  {...register("phone")}
                  placeholder="Add phone number"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm placeholder:text-gray-400 outline-none focus:border-brand-black"
                />
              </FormRow>
              <InfoRow label="Member since" value={memberSince!} />
            </dl>

            <div className="mt-6 flex items-center justify-end gap-3">
              {updateMutation.isError && (
                <p className="text-sm text-brand-red">
                  Failed to save changes. Please try again.
                </p>
              )}
              {updateMutation.isSuccess && !isDirty && (
                <p className="text-sm text-green-600">Changes saved.</p>
              )}
              <button
                type="submit"
                disabled={!isDirty || updateMutation.isPending}
                className="inline-flex items-center rounded-full bg-brand-black px-6 py-2.5 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function FormRow({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start">
      <dt className="pt-2.5 text-sm text-gray-500 sm:w-1/2">{label}</dt>
      <dd className="sm:w-1/2">
        {children}
        {error && <p className="mt-1 text-xs text-brand-red">{error}</p>}
      </dd>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center">
      <dt className="text-sm text-gray-500 sm:w-1/2">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 sm:w-1/2">{value}</dd>
    </div>
  );
}
