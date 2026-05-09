import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegisterMutation } from "../hooks/useAuth";
import { useAuthStore } from "../store/authStore";
import FormField from "../components/ui/FormField";

const schema = z.object({
  firstName: z.string().min(1, "First name is required").max(100, "First name must not exceed 100 characters"),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name must not exceed 100 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z
    .string()
    .refine(
      (val) => val === "" || /^\+?[0-9]{10,15}$/.test(val),
      "Phone must be 10–15 digits, optionally starting with +"
    ),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { mutate: registerUser, isPending, error } = useRegisterMutation();

  useEffect(() => {
    if (isLoggedIn()) navigate("/", { replace: true });
  }, [isLoggedIn, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    registerUser(
      { ...values, phone: values.phone || undefined },
      { onSuccess: () => navigate("/") }
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-gray px-4 py-12">
      <Link
        to="/"
        className="mb-8 font-display text-3xl font-extrabold tracking-tight text-brand-black"
      >
        SHOP.CO
      </Link>

      <div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-sm">
        <h1 className="mb-6 font-display text-2xl font-extrabold uppercase tracking-tight text-brand-black">
          Create Account
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="First Name"
              type="text"
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <FormField
              label="Last Name"
              type="text"
              error={errors.lastName?.message}
              {...register("lastName")}
            />
          </div>

          <FormField
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <FormField
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />

          <FormField
            label="Phone"
            hint="(optional)"
            type="tel"
            {...register("phone")}
          />

          {error && (
            <p className="text-sm text-brand-red">
              Registration failed. This email may already be in use.
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-brand-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {isPending ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-brand-black hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
