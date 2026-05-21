import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";
import { useUpdateUser } from "../../hooks/useAdminUsers";
import type { UserResponse } from "../../services/accountService";

const inputCls =
  "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black";

const userEditSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().min(1, "Required").email("Invalid email"),
  phone: z.string().optional(),
  password: z.string().optional(),
});

type FormValues = z.infer<typeof userEditSchema>;

interface Props {
  user: UserResponse;
  onClose: () => void;
}

export default function UserEditModal({ user, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      ...(values.phone ? { phone: values.phone } : {}),
      ...(values.password ? { password: values.password } : {}),
    };
    try {
      await updateUser.mutateAsync({ id: user.id, payload });
      onClose();
    } catch {
      setServerError(
        "Could not save changes. The email may already be in use.",
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="font-display font-bold text-lg">Edit User</h2>
            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col"
          noValidate
        >
          <div className="px-6 py-5 space-y-4">
            {serverError && (
              <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-brand-red text-sm">
                {serverError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First name
                </label>
                <input
                  type="text"
                  {...register("firstName")}
                  className={inputCls}
                />
                {errors.firstName && (
                  <p className="text-brand-red text-xs mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Last name
                </label>
                <input
                  type="text"
                  {...register("lastName")}
                  className={inputCls}
                />
                {errors.lastName && (
                  <p className="text-brand-red text-xs mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" {...register("email")} className={inputCls} />
              {errors.email && (
                <p className="text-brand-red text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="tel" {...register("phone")} className={inputCls} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                New password
                <span className="ml-1 text-xs font-normal text-gray-400">
                  (leave blank to keep current)
                </span>
              </label>
              <input
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-brand-black text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
