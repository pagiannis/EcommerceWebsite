import { useState } from "react";
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import {
  useAdminProductTypeList,
  useDeleteProductType,
} from "../../hooks/admin/useProductTypes";
import type { ProductTypeItem } from "../../services/admin/productTypesService";
import ProductTypeFormModal from "../../components/admin/ProductTypeFormModal";

export default function AdminProductTypesPage() {
  const { data: productTypes = [], isLoading, isError } = useAdminProductTypeList();
  const deleteProductType = useDeleteProductType();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<ProductTypeItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  function openAdd() {
    setEditingType(null);
    setModalOpen(true);
  }

  function openEdit(pt: ProductTypeItem) {
    setEditingType(pt);
    setModalOpen(true);
  }

  async function handleDelete() {
    if (deleteTargetId === null) return;
    try {
      await deleteProductType.mutateAsync(deleteTargetId);
      setDeleteTargetId(null);
    } catch {
      // error shown in modal
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Product Types</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-brand-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={15} />
          Add Type
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-gray-300" size={32} />
        </div>
      ) : isError ? (
        <p className="text-center py-24 text-gray-400">
          Failed to load product types.
        </p>
      ) : (
        <>
          <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="w-full min-w-[300px] text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Name", ""].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {productTypes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-12 text-center text-gray-400"
                    >
                      No product types yet.
                    </td>
                  </tr>
                ) : (
                  productTypes.map((pt) => (
                    <tr key={pt.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{pt.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => openEdit(pt)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-black hover:bg-gray-100 transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(pt.id)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            {productTypes.length}{" "}
            {productTypes.length === 1 ? "type" : "types"} total
          </div>
        </>
      )}

      {modalOpen && (
        <ProductTypeFormModal
          key={editingType?.id ?? "new"}
          productType={editingType}
          onClose={() => setModalOpen(false)}
        />
      )}

      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="font-display font-bold text-lg mb-2">
              Delete Product Type
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              This action cannot be undone.
            </p>
            {deleteProductType.error && (
              <p className="text-brand-red text-sm mb-4">
                Cannot delete — this type still has products assigned to it.
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteTargetId(null);
                  deleteProductType.reset();
                }}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteProductType.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleteProductType.isPending && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
