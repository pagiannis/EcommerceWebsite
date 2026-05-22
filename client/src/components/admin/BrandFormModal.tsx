import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X } from "lucide-react";
import { useCreateBrand, useUpdateBrand } from "../../hooks/useAdminBrands";
import type { BrandItem, BrandPayload } from "../../services/adminBrandsService";

const inputCls =
  "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black";

const brandSchema = z.object({
  name: z.string().min(1, "Required").max(255),
  logoUrl: z.string().optional(),
});

type FormValues = z.infer<typeof brandSchema>;

function toPayload(values: FormValues): BrandPayload {
  return {
    name: values.name,
    logoUrl: values.logoUrl?.trim() || undefined,
  };
}

interface Props {
  brand: BrandItem | null;
  onClose: () => void;
}

export default function BrandFormModal({ brand, onClose }: Props) {
  const isEdit = brand !== null;
  const create = useCreateBrand();
  const update = useUpdateBrand();
  const isMutating = create.isPending || update.isPending;
  const serverError = create.error || update.error;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: isEdit
      ? { name: brand.name, logoUrl: brand.logoUrl ?? "" }
      : { name: "", logoUrl: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      if (isEdit) {
        await update.mutateAsync({ id: brand.id, payload: toPayload(values) });
      } else {
        await create.mutateAsync(toPayload(values));
      }
      onClose();
      // eslint-disable-next-line no-empty
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h2 className="font-display font-bold text-lg">
            {isEdit ? "Edit Brand" : "New Brand"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {serverError && (
            <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-brand-red text-sm shrink-0">
              Something went wrong. Please try again.
            </div>
          )}

          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                {...register("name")}
                className={inputCls}
                placeholder="e.g. Nike"
              />
              {errors.name && (
                <p className="text-brand-red text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Logo URL</label>
              <input
                {...register("logoUrl")}
                className={inputCls}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isMutating}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-brand-black text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {isMutating && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Save Changes" : "Create Brand"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
