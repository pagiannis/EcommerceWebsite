import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import {
  useAdminProductList,
  useAdminBrands,
  useAdminProductTypes,
  useAdminCategories,
  useDeleteProduct,
} from "../../hooks/useAdminProducts";
import type { ProductResponse } from "../../services/productsService";
import ProductFormModal from "../../components/admin/ProductFormModal";
import VariantModal from "../../components/admin/VariantModal";

export default function AdminProductsPage() {
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [variantProduct, setVariantProduct] = useState<ProductResponse | null>(null);

  const { data, isLoading, isError } = useAdminProductList(page);
  const { data: brands = [] } = useAdminBrands();
  const { data: categories = [] } = useAdminCategories();
  const { data: productTypes = [] } = useAdminProductTypes();
  const deleteProduct = useDeleteProduct();

  function openAdd() {
    setEditingProduct(null);
    setModalOpen(true);
  }

  function openEdit(product: ProductResponse) {
    setEditingProduct(product);
    setModalOpen(true);
  }

  async function handleDelete() {
    if (deleteTargetId === null) return;
    try {
      await deleteProduct.mutateAsync(deleteTargetId);
      setDeleteTargetId(null);
    } catch {
      // error shown in modal
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Products</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-brand-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={15} />
          Add Product
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-gray-300" size={32} />
        </div>
      ) : isError ? (
        <p className="text-center py-24 text-gray-400">Failed to load products.</p>
      ) : (
        <>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Name", "Category", "Brand", "Type", "Style", "Price", "Rating", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.content.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium max-w-[200px] truncate">{product.name}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{product.category}</td>
                    <td className="px-4 py-3 text-gray-500">{product.brand}</td>
                    <td className="px-4 py-3 text-gray-500">{product.productType}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{product.dressStyle.toLowerCase()}</td>
                    <td className="px-4 py-3 font-medium">${product.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-500">{product.rating.toFixed(1)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setVariantProduct(product)}
                          title="Manage Variants"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-black hover:bg-gray-100 transition-colors"
                        >
                          <Layers size={15} />
                        </button>
                        <button
                          onClick={() => openEdit(product)}
                          title="Edit"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-black hover:bg-gray-100 transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(product.id)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>{data?.totalElements.toLocaleString()} products total</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={data?.first}
                className="p-1.5 rounded-lg border disabled:opacity-40 hover:bg-white transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span>Page {(data?.number ?? 0) + 1} of {data?.totalPages}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={data?.last}
                className="p-1.5 rounded-lg border disabled:opacity-40 hover:bg-white transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {variantProduct && (
        <VariantModal
          key={variantProduct.id}
          product={variantProduct}
          onClose={() => setVariantProduct(null)}
        />
      )}

      {modalOpen && (
        <ProductFormModal
          key={editingProduct?.id ?? "new"}
          product={editingProduct}
          brands={brands}
          categories={categories}
          productTypes={productTypes}
          onClose={() => setModalOpen(false)}
        />
      )}

      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="font-display font-bold text-lg mb-2">Delete Product</h2>
            <p className="text-gray-500 text-sm mb-5">This action cannot be undone.</p>
            {deleteProduct.error && (
              <p className="text-brand-red text-sm mb-4">
                Cannot delete — the product may have associated orders or reviews.
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteProduct.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleteProduct.isPending && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
