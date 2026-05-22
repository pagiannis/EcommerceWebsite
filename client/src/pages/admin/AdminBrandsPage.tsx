import { useState } from "react";
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { useAdminBrandList, useDeleteBrand } from "../../hooks/admin/useBrands";
import type { BrandItem } from "../../services/adminBrandsService";
import BrandFormModal from "../../components/admin/BrandFormModal";

export default function AdminBrandsPage() {
  const { data: brands = [], isLoading, isError } = useAdminBrandList();
  const deleteBrand = useDeleteBrand();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  function openAdd() {
    setEditingBrand(null);
    setModalOpen(true);
  }

  function openEdit(brand: BrandItem) {
    setEditingBrand(brand);
    setModalOpen(true);
  }

  async function handleDelete() {
    if (deleteTargetId === null) return;
    try {
      await deleteBrand.mutateAsync(deleteTargetId);
      setDeleteTargetId(null);
    } catch {
      // error shown in modal
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Brands</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-brand-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={15} />
          Add Brand
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-gray-300" size={32} />
        </div>
      ) : isError ? (
        <p className="text-center py-24 text-gray-400">Failed to load brands.</p>
      ) : (
        <>
          <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Name", "Logo URL", ""].map((h) => (
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
                {brands.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center text-gray-400">
                      No brands yet.
                    </td>
                  </tr>
                ) : (
                  brands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{brand.name}</td>
                      <td className="px-4 py-3 text-gray-400 max-w-[280px] truncate text-xs">
                        {brand.logoUrl ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => openEdit(brand)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-black hover:bg-gray-100 transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(brand.id)}
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
            {brands.length} {brands.length === 1 ? "brand" : "brands"} total
          </div>
        </>
      )}

      {modalOpen && (
        <BrandFormModal
          key={editingBrand?.id ?? "new"}
          brand={editingBrand}
          onClose={() => setModalOpen(false)}
        />
      )}

      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="font-display font-bold text-lg mb-2">Delete Brand</h2>
            <p className="text-gray-500 text-sm mb-5">
              This action cannot be undone.
            </p>
            {deleteBrand.error && (
              <p className="text-brand-red text-sm mb-4">
                Cannot delete — this brand still has products assigned to it.
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteTargetId(null);
                  deleteBrand.reset();
                }}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteBrand.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleteBrand.isPending && (
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
