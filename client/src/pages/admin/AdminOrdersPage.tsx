import { useState } from "react";
import { Pencil, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminOrderList } from "../../hooks/useAdminOrders";
import type { OrderResponse, OrderStatus } from "../../services/ordersService";
import OrderStatusModal from "../../components/admin/OrderStatusModal";

const STATUS_OPTIONS: { label: string; value: OrderStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminOrdersPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [targetOrder, setTargetOrder] = useState<OrderResponse | null>(null);

  const { data, isLoading, isError } = useAdminOrderList(
    page,
    statusFilter || undefined,
  );

  function handleStatusFilterChange(value: OrderStatus | "") {
    setStatusFilter(value);
    setPage(0);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value as OrderStatus | "")}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-gray-300" size={32} />
        </div>
      ) : isError ? (
        <p className="text-center py-24 text-gray-400">Failed to load orders.</p>
      ) : (
        <>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Order #", "Date", "Items", "Total", "Status", ""].map((h) => (
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
                {data?.content.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  data?.content.map((order) => {
                    const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-700">
                          {order.orderNumber}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {totalQty} {totalQty === 1 ? "item" : "items"}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[order.status]}`}
                          >
                            {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <button
                              onClick={() => setTargetOrder(order)}
                              title="Update Status"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-brand-black hover:bg-gray-100 transition-colors"
                            >
                              <Pencil size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>{data?.totalElements.toLocaleString()} orders total</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={data?.first}
                className="p-1.5 rounded-lg border disabled:opacity-40 hover:bg-white transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                Page {(data?.number ?? 0) + 1} of {data?.totalPages}
              </span>
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

      {targetOrder && (
        <OrderStatusModal
          key={targetOrder.id}
          order={targetOrder}
          onClose={() => setTargetOrder(null)}
        />
      )}
    </div>
  );
}
