import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRegisterMutation } from "../hooks/useAuth";
import { useAuthStore } from "../store/authStore";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string> }
      | undefined;
    if (data?.errors) {
      const first = Object.values(data.errors)[0];
      if (first) return first;
    }
    if (data?.message) return data.message;
    if (error.response?.status === 409) return "This email is already in use.";
  }
  return "Registration failed. Please try again.";
}

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
    const payload = {
      ...values,
      phone: values.phone?.trim() ? values.phone.trim() : undefined,
    };
    registerUser(payload, { onSuccess: () => navigate("/") });
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

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                {...register("firstName")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-black"
                placeholder="John"
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-brand-red">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                {...register("lastName")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-black"
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-brand-red">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-black"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-brand-red">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-black"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-brand-red">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="tel"
              {...register("phone")}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-black"
              placeholder="+1 555 000 0000"
            />
          </div>

          {error && (
            <p className="text-sm text-brand-red">{getErrorMessage(error)}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-brand-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {isPending ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-black hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
