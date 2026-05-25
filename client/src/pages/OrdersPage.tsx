import { Loader2, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useOrders, useReorder } from "../hooks/useOrders";
import type { OrderStatus } from "../services/ordersService";
import OrdersSkeleton from "../components/orders/OrdersSkeleton";
import { COLOR_ENUM_TO_HEX } from "../services/productsService";
import { SIZE_FROM_API } from "../services/productsService";

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const STATUS_CLASS: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-purple-50 text-purple-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export default function OrdersPage() {
  const { data: orders, isLoading, isError } = useOrders();
  const navigate = useNavigate();
  const { mutate: reorder, isPending: isReordering, variables: reorderingOrderId } = useReorder();

  if (isError) {
    return (
      <p className="text-sm text-brand-red">
        Failed to load orders. Please try again.
      </p>
    );
  }

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-extrabold uppercase tracking-tight text-brand-black">
        My Orders
      </h1>

      {isLoading ? (
        <OrdersSkeleton />
      ) : !orders || orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="h-12 w-12 text-gray-200" />
          <h2 className="mt-4 text-base font-semibold text-gray-900">No orders yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            When you place an order, it will show up here.
          </p>
          <Link
            to="/shop"
            className="mt-6 rounded-full bg-brand-black px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASS[order.status]}`}
                >
                  {STATUS_LABEL[order.status]}
                </span>
              </div>

              <ul className="mt-4 divide-y divide-gray-100">
                {order.items.map((item) => {
                  const colorHex = COLOR_ENUM_TO_HEX[item.color];
                  const sizeLabel = SIZE_FROM_API[item.size] ?? item.size;
                  return (
                    <li key={item.id} className="flex items-center gap-4 py-3">
                      <div className="h-14 w-14 flex-shrink-0 rounded-lg bg-gray-100" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {item.productName}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                          {colorHex ? (
                            <span
                              className="inline-block h-3 w-3 rounded-full border border-gray-200"
                              style={{ backgroundColor: colorHex }}
                            />
                          ) : null}
                          <span>{sizeLabel}</span>
                          <span>·</span>
                          <span>Qty {item.quantity}</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ${item.subtotal.toFixed(2)}
                      </p>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400">
                  Subtotal ${order.subtotal.toFixed(2)} · Tax ${order.tax.toFixed(2)} · Shipping ${order.shippingFee.toFixed(2)}
                </p>
                <div className="flex items-center gap-4">
                  <p className="text-sm font-semibold text-gray-900">
                    Total: ${order.total.toFixed(2)}
                  </p>
                  <button
                    onClick={() =>
                      reorder(order.id, { onSuccess: () => navigate("/cart") })
                    }
                    disabled={isReordering}
                    className="rounded-full bg-brand-black px-5 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isReordering && reorderingOrderId === order.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : null}
                    Reorder
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
