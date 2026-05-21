import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X, Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateProduct } from "../../hooks/useAdminProducts";
import type { ProductResponse } from "../../services/productsService";
import { adminCreateProduct, type BrandItem, type ProductTypeItem, type AdminProductPayload } from "../../services/adminProductsService";
import type { CategoryItem } from "../../services/adminCategoriesService";
import { adminCreateVariant, VARIANT_COLORS, VARIANT_SIZES } from "../../services/adminProductVariantsService";

const inputCls =
  "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black";
const variantInputCls =
  "w-full border rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-black";

const dressStyleSchema = z.enum(["CASUAL", "FORMAL", "PARTY", "GYM"]);
const DRESS_STYLES = dressStyleSchema.options;

const variantItemSchema = z.object({
  color: z.enum(VARIANT_COLORS),
  size: z.enum(VARIANT_SIZES),
  stockQuantity: z.string().refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, "Must be ≥ 0"),
  sku: z.string().min(1, "Required"),
});

const productSchema = z.object({
  name: z.string().min(1, "Required").max(255),
  description: z.string().optional(),
  categoryId: z.string().refine((v) => v !== "0", "Required"),
  brandId: z.string().refine((v) => v !== "0", "Required"),
  productTypeId: z.string().refine((v) => v !== "0", "Required"),
  dressStyle: dressStyleSchema,
  price: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Must be > 0"),
  originalPrice: z.string().optional(),
  discountPercent: z.string().optional(),
  variants: z.array(variantItemSchema),
});

type FormValues = z.infer<typeof productSchema>;

interface Props {
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
}: Props) {
  const updateProduct = useUpdateProduct();
  const queryClient = useQueryClient();
  const isEdit = product !== null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultCategoryId =
    categories.find((c) => c.name.toLowerCase() === product?.category?.toLowerCase())?.id ?? 0;
  const defaultBrandId = brands.find((b) => b.name === product?.brand)?.id ?? 0;
  const defaultProductTypeId =
    productTypes.find((pt) => pt.name === product?.productType)?.id ?? 0;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
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
          variants: [],
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
          variants: [{ color: "BLACK", size: "M", stockQuantity: "0", sku: "" }],
        },
  });

  const { fields: variantFields, append, remove } = useFieldArray({ control, name: "variants" });

  async function onSubmit(values: FormValues) {
    if (!isEdit && values.variants.length === 0) {
      setServerError("Add at least one variant before creating the product.");
      return;
    }

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

    setIsSubmitting(true);
    setServerError(null);

    try {
      if (isEdit) {
        await updateProduct.mutateAsync({ id: product.id, payload });
      } else {
        const created = await adminCreateProduct(payload);
        for (const v of values.variants) {
          await adminCreateVariant(created.id, {
            color: v.color,
            size: v.size,
            stockQuantity: parseInt(v.stockQuantity),
            sku: v.sku,
          });
        }
        queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      }
      onClose();
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
              {serverError}
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

            {!isEdit && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Variants *</label>
                  <button
                    type="button"
                    onClick={() => append({ color: "BLACK", size: "M", stockQuantity: "0", sku: "" })}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border hover:bg-gray-100 transition-colors"
                  >
                    <Plus size={12} />
                    Add Variant
                  </button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        {["Color", "Size", "Stock", "SKU", ""].map((h) => (
                          <th key={h} className="text-left px-2 py-2 font-medium text-gray-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {variantFields.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-2 py-4 text-center text-gray-400">
                            No variants yet — add at least one.
                          </td>
                        </tr>
                      ) : (
                        variantFields.map((field, idx) => (
                          <tr key={field.id}>
                            <td className="px-2 py-1.5">
                              <select
                                {...register(`variants.${idx}.color`)}
                                className={variantInputCls}
                              >
                                {VARIANT_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </td>
                            <td className="px-2 py-1.5">
                              <select
                                {...register(`variants.${idx}.size`)}
                                className={variantInputCls}
                              >
                                {VARIANT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                min={0}
                                {...register(`variants.${idx}.stockQuantity`)}
                                className={variantInputCls}
                              />
                              {errors.variants?.[idx]?.stockQuantity && (
                                <p className="text-brand-red text-[10px]">{errors.variants[idx]!.stockQuantity!.message}</p>
                              )}
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="text"
                                {...register(`variants.${idx}.sku`)}
                                placeholder="SKU-001-BLK-M"
                                className={variantInputCls}
                              />
                              {errors.variants?.[idx]?.sku && (
                                <p className="text-brand-red text-[10px]">{errors.variants[idx]!.sku!.message}</p>
                              )}
                            </td>
                            <td className="px-2 py-1.5">
                              <button
                                type="button"
                                onClick={() => remove(idx)}
                                className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-brand-black text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
