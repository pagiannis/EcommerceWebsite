import { Link } from "react-router-dom";
import { ShoppingBag, Clock, Users, Package, Loader2 } from "lucide-react";
import { useAdminDashboard } from "../../hooks/admin/useDashboard";
import type { OrderStatus } from "../../services/ordersService";

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminDashboardPage() {
  const { orders, pendingOrders, users, products } = useAdminDashboard();

  const recentOrders = orders.data?.content.slice(0, 5) ?? [];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={orders.data?.totalElements}
          isLoading={orders.isLoading}
          icon={<ShoppingBag size={18} className="text-gray-600" />}
          iconBg="bg-gray-50"
        />
        <StatCard
          label="Pending Orders"
          value={pendingOrders.data?.totalElements}
          isLoading={pendingOrders.isLoading}
          icon={<Clock size={18} className="text-gray-600" />}
          iconBg="bg-gray-50"
        />
        <StatCard
          label="Total Users"
          value={users.data?.totalElements}
          isLoading={users.isLoading}
          icon={<Users size={18} className="text-gray-600" />}
          iconBg="bg-gray-50"
        />
        <StatCard
          label="Total Products"
          value={products.data?.totalElements}
          isLoading={products.isLoading}
          icon={<Package size={18} className="text-gray-600" />}
          iconBg="bg-gray-50"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-lg">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-sm text-gray-500 hover:text-brand-black transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="bg-white rounded-xl border overflow-x-auto">
          {orders.isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-gray-300" size={28} />
            </div>
          ) : orders.isError ? (
            <p className="text-center py-16 text-gray-400 text-sm">
              Failed to load orders.
            </p>
          ) : recentOrders.length === 0 ? (
            <p className="text-center py-16 text-gray-400 text-sm">
              No orders yet.
            </p>
          ) : (
            <table className="w-full min-w-[480px] text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Order #", "Date", "Items", "Total", "Status"].map((h) => (
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
                {recentOrders.map((order) => {
                  const itemCount = order.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0,
                  );
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        #{order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{itemCount}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[order.status]}`}
                        >
                          {order.status.charAt(0) +
                            order.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | undefined;
  isLoading: boolean;
  icon: React.ReactNode;
  iconBg: string;
}

function StatCard({ label, value, isLoading, icon, iconBg }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <span className={`p-2 rounded-lg ${iconBg}`}>{icon}</span>
      </div>
      <p className="text-3xl font-bold font-display">
        {isLoading ? "—" : (value?.toLocaleString() ?? "—")}
      </p>
    </div>
  );
}
