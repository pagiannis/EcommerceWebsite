import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLoginMutation } from "../hooks/useAuth";
import { useAuthStore } from "../store/authStore";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { mutate: login, isPending, error } = useLoginMutation();

  useEffect(() => {
    if (isLoggedIn()) navigate("/", { replace: true });
  }, [isLoggedIn, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    login(values, { onSuccess: () => navigate("/") });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-gray px-4">
      <Link
        to="/"
        className="mb-8 font-display text-3xl font-extrabold tracking-tight text-brand-black"
      >
        SHOP.CO
      </Link>

      <div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-sm">
        <h1 className="mb-6 font-display text-2xl font-extrabold uppercase tracking-tight text-brand-black">
          Sign In
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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

          {error && (
            <p className="text-sm text-brand-red">
              Invalid email or password. Please try again.
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-brand-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {isPending ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-brand-black hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
