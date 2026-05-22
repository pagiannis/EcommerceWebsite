import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X } from "lucide-react";
import {
  useCreateProductType,
  useUpdateProductType,
} from "../../hooks/useAdminProductTypes";
import type {
  ProductTypeItem,
  ProductTypePayload,
} from "../../services/adminProductTypesService";

const inputCls =
  "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black";

const schema = z.object({
  name: z.string().min(1, "Required").max(255),
});

type FormValues = z.infer<typeof schema>;

function toPayload(values: FormValues): ProductTypePayload {
  return { name: values.name };
}

interface Props {
  productType: ProductTypeItem | null;
  onClose: () => void;
}

export default function ProductTypeFormModal({ productType, onClose }: Props) {
  const isEdit = productType !== null;
  const create = useCreateProductType();
  const update = useUpdateProductType();
  const isMutating = create.isPending || update.isPending;
  const serverError = create.error || update.error;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: isEdit ? { name: productType.name } : { name: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      if (isEdit) {
        await update.mutateAsync({ id: productType.id, payload: toPayload(values) });
      } else {
        await create.mutateAsync(toPayload(values));
      }
      onClose();
      // eslint-disable-next-line no-empty
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-display font-bold text-lg">
            {isEdit ? "Edit Product Type" : "New Product Type"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {serverError && (
            <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-brand-red text-sm">
              Something went wrong. Please try again.
            </div>
          )}

          <div className="px-6 py-5">
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              {...register("name")}
              className={inputCls}
              placeholder="e.g. T-Shirt"
              autoFocus
            />
            {errors.name && (
              <p className="text-brand-red text-xs mt-1">{errors.name.message}</p>
            )}
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
              disabled={isMutating}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-brand-black text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {isMutating && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
