import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useUpdateOrderStatus } from "../../hooks/admin/useOrders";
import type { OrderResponse, OrderStatus } from "../../services/ordersService";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const inputCls =
  "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black";

interface Props {
  order: OrderResponse;
  onClose: () => void;
}

export default function OrderStatusModal({ order, onClose }: Props) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [serverError, setServerError] = useState<string | null>(null);
  const updateStatus = useUpdateOrderStatus();

  async function handleSave() {
    setServerError(null);
    try {
      await updateStatus.mutateAsync({ id: order.id, status });
      onClose();
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="font-display font-bold text-lg">Update Status</h2>
            <p className="text-xs text-gray-400 mt-0.5">{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {serverError && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-brand-red text-sm">
              {serverError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className={inputCls}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
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
            onClick={handleSave}
            disabled={updateStatus.isPending || status === order.status}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-brand-black text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {updateStatus.isPending && <Loader2 size={14} className="animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
