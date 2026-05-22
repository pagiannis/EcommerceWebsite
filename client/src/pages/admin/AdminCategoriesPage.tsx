import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Pencil } from "lucide-react";
import {
  useAdminCategoryList,
  useDeleteCategory,
} from "../../hooks/admin/useCategories";
import type { CategoryItem } from "../../services/adminCategoriesService";
import CategoryFormModal from "../../components/admin/CategoryFormModal";

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading, isError } = useAdminCategoryList();
  const deleteCategory = useDeleteCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(
    null,
  );
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  function openAdd() {
    setEditingCategory(null);
    setModalOpen(true);
  }

  function openEdit(category: CategoryItem) {
    setEditingCategory(category);
    setModalOpen(true);
  }

  async function handleDelete() {
    if (deleteTargetId === null) return;
    try {
      await deleteCategory.mutateAsync(deleteTargetId);
      setDeleteTargetId(null);
    } catch {
      // error shown in modal
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Categories</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-brand-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={15} />
          Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-gray-300" size={32} />
        </div>
      ) : isError ? (
        <p className="text-center py-24 text-gray-400">
          Failed to load categories.
        </p>
      ) : (
        <>
          <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Name", "Description", "Image URL", ""].map((h) => (
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
                {categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-12 text-center text-gray-400"
                    >
                      No categories yet.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium capitalize">
                        {cat.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[280px] truncate">
                        {cat.description ?? (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 max-w-[220px] truncate text-xs">
                        {cat.imageUrl ?? (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => openEdit(cat)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-black hover:bg-gray-100 transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(cat.id)}
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
            <span>
              {categories.length}{" "}
              {categories.length === 1 ? "category" : "categories"} total
            </span>
          </div>
        </>
      )}

      {modalOpen && (
        <CategoryFormModal
          key={editingCategory?.id ?? "new"}
          category={editingCategory}
          onClose={() => setModalOpen(false)}
        />
      )}

      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="font-display font-bold text-lg mb-2">
              Delete Category
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              This action cannot be undone.
            </p>
            {deleteCategory.error && (
              <p className="text-brand-red text-sm mb-4">
                Cannot delete — this category still has products assigned to it.
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteTargetId(null);
                  deleteCategory.reset();
                }}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteCategory.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleteCategory.isPending && (
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
