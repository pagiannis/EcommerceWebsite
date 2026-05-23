import { useState } from "react";
import { X, Pencil, Trash2, Loader2, Check } from "lucide-react";
import {
  useAddVariant,
  useUpdateVariant,
  useDeleteVariant,
} from "../../hooks/admin/useProductVariants";
import {
  VARIANT_COLORS,
  VARIANT_SIZES,
  type AdminVariantResponse,
  type VariantPayload,
} from "../../services/admin/productVariantsService";
import type { ProductResponse } from "../../services/productsService";

type VariantForm = {
  color: string;
  size: string;
  stockQuantity: string;
  sku: string;
};

const DEFAULT_FORM: VariantForm = {
  color: "BLACK",
  size: "M",
  stockQuantity: "0",
  sku: "",
};

const inputCls =
  "border rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-black w-full";

interface Props {
  product: ProductResponse;
  onClose: () => void;
}

export default function VariantModal({ product, onClose }: Props) {
  const [variants, setVariants] = useState<AdminVariantResponse[]>(
    product.variants.map((v) => ({
      id: v.id,
      color: v.color,
      size: v.size,
      stockQuantity: v.stockQuantity,
      sku: v.sku,
    })),
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<VariantForm>(DEFAULT_FORM);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [addForm, setAddForm] = useState<VariantForm>(DEFAULT_FORM);
  const [addError, setAddError] = useState<string | null>(null);

  const addVariant = useAddVariant();
  const updateVariant = useUpdateVariant();
  const deleteVariant = useDeleteVariant();

  function startEdit(v: AdminVariantResponse) {
    setEditingId(v.id);
    setEditForm({
      color: v.color,
      size: v.size,
      stockQuantity: String(v.stockQuantity),
      sku: v.sku,
    });
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  function toPayload(form: VariantForm): VariantPayload {
    return {
      color: form.color as VariantPayload["color"],
      size: form.size as VariantPayload["size"],
      stockQuantity: parseInt(form.stockQuantity),
      sku: form.sku.trim(),
    };
  }

  async function handleSaveEdit(variantId: number) {
    if (!editForm.sku.trim()) {
      setEditError("SKU is required.");
      return;
    }
    const stock = parseInt(editForm.stockQuantity);
    if (isNaN(stock) || stock < 0) {
      setEditError("Stock must be ≥ 0.");
      return;
    }

    try {
      const updated = await updateVariant.mutateAsync({
        variantId,
        payload: toPayload(editForm),
      });
      setVariants((prev) =>
        prev.map((v) => (v.id === variantId ? updated : v)),
      );
      setEditingId(null);
      setEditError(null);
    } catch {
      setEditError("Something went wrong.");
    }
  }

  async function handleDelete(variantId: number) {
    try {
      await deleteVariant.mutateAsync(variantId);
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
      setDeleteTargetId(null);
      // eslint-disable-next-line no-empty
    } catch {}
  }

  async function handleAdd() {
    if (!addForm.sku.trim()) {
      setAddError("SKU is required.");
      return;
    }
    const stock = parseInt(addForm.stockQuantity);
    if (isNaN(stock) || stock < 0) {
      setAddError("Stock must be ≥ 0.");
      return;
    }

    setAddError(null);
    try {
      const created = await addVariant.mutateAsync({
        productId: product.id,
        payload: toPayload(addForm),
      });
      setVariants((prev) => [...prev, created]);
      setAddForm(DEFAULT_FORM);
    } catch {
      setAddError("Something went wrong.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="font-display font-bold text-lg">Variants</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-sm">
              {product.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b sticky top-0">
              <tr>
                {["Color", "Size", "Stock", "SKU", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-medium text-gray-500 text-xs whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {variants.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-gray-400"
                  >
                    No variants yet — add one below.
                  </td>
                </tr>
              )}

              {variants.map((v) => {
                if (editingId === v.id) {
                  return (
                    <tr key={v.id} className="bg-blue-50">
                      <td className="px-3 py-2">
                        <select
                          value={editForm.color}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              color: e.target.value,
                            }))
                          }
                          className={inputCls}
                        >
                          {VARIANT_COLORS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={editForm.size}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, size: e.target.value }))
                          }
                          className={inputCls}
                        >
                          {VARIANT_SIZES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          value={editForm.stockQuantity}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              stockQuantity: e.target.value,
                            }))
                          }
                          className={inputCls}
                          style={{ width: 70 }}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={editForm.sku}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, sku: e.target.value }))
                          }
                          className={inputCls}
                        />
                        {editError && (
                          <p className="text-brand-red text-[10px] mt-0.5">
                            {editError}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSaveEdit(v.id)}
                            disabled={updateVariant.isPending}
                            className="p-1.5 rounded text-green-600 hover:bg-green-50 disabled:opacity-50 transition-colors"
                          >
                            {updateVariant.isPending ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Check size={14} />
                            )}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 rounded text-gray-400 hover:bg-gray-100 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                if (deleteTargetId === v.id) {
                  return (
                    <tr key={v.id} className="bg-red-50">
                      <td
                        colSpan={4}
                        className="px-4 py-2.5 text-sm text-gray-700"
                      >
                        Delete{" "}
                        <span className="font-medium">
                          {v.color} / {v.size}
                        </span>
                        ? This cannot be undone.
                        {deleteVariant.error && (
                          <span className="ml-2 text-brand-red text-xs">
                            Cannot delete — variant is in an active cart.
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDelete(v.id)}
                            disabled={deleteVariant.isPending}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            {deleteVariant.isPending && (
                              <Loader2 size={11} className="animate-spin" />
                            )}
                            Confirm
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTargetId(null);
                              deleteVariant.reset();
                            }}
                            className="px-2 py-1 rounded text-xs border hover:bg-gray-100 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{v.color}</td>
                    <td className="px-4 py-3 text-gray-700">{v.size}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {v.stockQuantity}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {v.sku}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => startEdit(v)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-black hover:bg-gray-100 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(v.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t bg-gray-50 px-4 py-4 shrink-0">
          <p className="text-xs font-medium text-gray-500 mb-2">Add Variant</p>
          <div className="flex items-center gap-2">
            <select
              value={addForm.color}
              onChange={(e) => {
                setAddForm((f) => ({ ...f, color: e.target.value }));
                setAddError(null);
              }}
              className={inputCls}
              style={{ width: 110 }}
            >
              {VARIANT_COLORS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={addForm.size}
              onChange={(e) => {
                setAddForm((f) => ({ ...f, size: e.target.value }));
                setAddError(null);
              }}
              className={inputCls}
              style={{ width: 80 }}
            >
              {VARIANT_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              value={addForm.stockQuantity}
              onChange={(e) => {
                setAddForm((f) => ({ ...f, stockQuantity: e.target.value }));
                setAddError(null);
              }}
              className={inputCls}
              style={{ width: 70 }}
              placeholder="Stock"
            />
            <input
              type="text"
              value={addForm.sku}
              onChange={(e) => {
                setAddForm((f) => ({ ...f, sku: e.target.value }));
                setAddError(null);
              }}
              className={`${inputCls} flex-1`}
              placeholder="SKU-001-BLK-M"
            />
            <button
              onClick={handleAdd}
              disabled={addVariant.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-black text-white text-xs hover:bg-gray-800 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {addVariant.isPending && (
                <Loader2 size={11} className="animate-spin" />
              )}
              Add
            </button>
          </div>
          {addError && (
            <p className="text-brand-red text-xs mt-1.5">{addError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
