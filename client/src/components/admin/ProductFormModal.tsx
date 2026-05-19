import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X } from "lucide-react";
import { useCreateProduct, useUpdateProduct } from "../../hooks/useAdminProducts";
import type { ProductResponse } from "../../services/productsService";
import type { BrandItem, CategoryItem, ProductTypeItem, AdminProductPayload } from "../../services/adminProductsService";

const dressStyleSchema = z.enum(["CASUAL", "FORMAL", "PARTY", "GYM"]);
const DRESS_STYLES = dressStyleSchema.options;

const schema = z.object({
  name: z.string().min(1, "Required").max(255),
  description: z.string().optional(),
  categoryId: z.string().refine((v) => v !== "0", "Required"),
  brandId: z.string().refine((v) => v !== "0", "Required"),
  productTypeId: z.string().refine((v) => v !== "0", "Required"),
  dressStyle: dressStyleSchema,
  price: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Must be > 0"),
  originalPrice: z.string().optional(),
  discountPercent: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export interface ProductFormModalProps {
  product: ProductResponse | null;
  brands: BrandItem[];
  categories: CategoryItem[];
  productTypes: ProductTypeItem[];
  onClose: () => void;
}

export default function ProductFormModal({
  product,
  brands,
  categories,
  productTypes,
  onClose,
}: ProductFormModalProps) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isEdit = product !== null;

  const defaultCategoryId =
    categories.find((c) => c.name.toLowerCase() === product?.category?.toLowerCase())?.id ?? 0;
  const defaultBrandId = brands.find((b) => b.name === product?.brand)?.id ?? 0;
  const defaultProductTypeId =
    productTypes.find((pt) => pt.name === product?.productType)?.id ?? 0;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: isEdit
      ? {
          name: product.name,
          description: product.description ?? "",
          categoryId: defaultCategoryId > 0 ? defaultCategoryId.toString() : "0",
          brandId: defaultBrandId > 0 ? defaultBrandId.toString() : "0",
          productTypeId: defaultProductTypeId > 0 ? defaultProductTypeId.toString() : "0",
          dressStyle: product.dressStyle as z.infer<typeof dressStyleSchema>,
          price: product.price.toString(),
          originalPrice: product.originalPrice?.toString() ?? "",
          discountPercent: product.discountPercent?.toString() ?? "",
        }
      : {
          name: "",
          description: "",
          categoryId: "0",
          brandId: "0",
          productTypeId: "0",
          dressStyle: "CASUAL" as const,
          price: "",
          originalPrice: "",
          discountPercent: "",
        },
  });

  async function onSubmit(values: FormValues) {
    const payload: AdminProductPayload = {
      name: values.name,
      description: values.description || undefined,
      categoryId: parseInt(values.categoryId),
      brandId: parseInt(values.brandId),
      productTypeId: parseInt(values.productTypeId),
      dressStyle: values.dressStyle,
      price: parseFloat(values.price),
      originalPrice: values.originalPrice ? parseFloat(values.originalPrice) : undefined,
      discountPercent: values.discountPercent ? parseInt(values.discountPercent) : undefined,
    };

    try {
      if (isEdit) {
        await updateProduct.mutateAsync({ id: product.id, payload });
      } else {
        await createProduct.mutateAsync(payload);
      }
      onClose();
    } catch {
      // error shown below
    }
  }

  const isMutating = createProduct.isPending || updateProduct.isPending;
  const serverError = createProduct.error || updateProduct.error;
  const inputCls =
    "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h2 className="font-display font-bold text-lg">
            {isEdit ? "Edit Product" : "Add Product"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          {serverError && (
            <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-brand-red text-sm shrink-0">
              Something went wrong. Please try again.
            </div>
          )}
          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input {...register("name")} className={inputCls} />
              {errors.name && <p className="text-brand-red text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea {...register("description")} rows={3} className={`${inputCls} resize-none`} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select {...register("categoryId")} className={inputCls}>
                  <option value="0">Select…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-brand-red text-xs mt-1">{errors.categoryId.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Brand *</label>
                <select {...register("brandId")} className={inputCls}>
                  <option value="0">Select…</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                {errors.brandId && (
                  <p className="text-brand-red text-xs mt-1">{errors.brandId.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Product Type *</label>
                <select {...register("productTypeId")} className={inputCls}>
                  <option value="0">Select…</option>
                  {productTypes.map((pt) => (
                    <option key={pt.id} value={pt.id}>{pt.name}</option>
                  ))}
                </select>
                {errors.productTypeId && (
                  <p className="text-brand-red text-xs mt-1">{errors.productTypeId.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dress Style *</label>
                <select {...register("dressStyle")} className={inputCls}>
                  {DRESS_STYLES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Price *</label>
                <input type="number" step="0.01" {...register("price")} className={inputCls} />
                {errors.price && (
                  <p className="text-brand-red text-xs mt-1">{errors.price.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Original Price</label>
                <input type="number" step="0.01" {...register("originalPrice")} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discount %</label>
                <input type="number" {...register("discountPercent")} className={inputCls} />
              </div>
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
              {isEdit ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
