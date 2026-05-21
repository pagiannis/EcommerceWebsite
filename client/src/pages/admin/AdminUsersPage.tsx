import { useState } from "react";
import { Pencil, Shield, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminUserList, useDeleteUser } from "../../hooks/useAdminUsers";
import { useAuthStore } from "../../store/authStore";
import type { UserResponse, UserRole } from "../../services/accountService";
import UserRoleModal from "../../components/admin/UserRoleModal";
import UserEditModal from "../../components/admin/UserEditModal";

const ROLE_BADGE: Record<UserRole, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  USER: "bg-gray-100 text-gray-600",
};

export default function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const [editUser, setEditUser] = useState<UserResponse | null>(null);
  const [roleUser, setRoleUser] = useState<UserResponse | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const { data, isLoading, isError } = useAdminUserList(page);
  const deleteUser = useDeleteUser();
  const currentUserId = useAuthStore((s) => s.user?.id);

  async function handleDelete() {
    if (deleteTargetId === null) return;
    try {
      await deleteUser.mutateAsync(deleteTargetId);
      setDeleteTargetId(null);
    } catch {
      // error shown in dialog
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Users</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-gray-300" size={32} />
        </div>
      ) : isError ? (
        <p className="text-center py-24 text-gray-400">Failed to load users.</p>
      ) : (
        <>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Name", "Email", "Phone", "Role", "Joined", ""].map((h) => (
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
                      No users found.
                    </td>
                  </tr>
                ) : (
                  data?.content.map((user) => {
                    const isSelf = user.id === currentUserId;
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium whitespace-nowrap">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="px-4 py-3 text-gray-500 max-w-[220px] truncate">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {user.phone || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE[user.role]}`}
                          >
                            {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() => setEditUser(user)}
                              title="Edit Details"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-brand-black hover:bg-gray-100 transition-colors"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setRoleUser(user)}
                              disabled={isSelf}
                              title={isSelf ? "Cannot change your own role" : "Change Role"}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-brand-black hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Shield size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteTargetId(user.id)}
                              disabled={isSelf}
                              title={isSelf ? "Cannot delete your own account" : "Delete User"}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={15} />
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
            <span>{data?.totalElements.toLocaleString()} users total</span>
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

      {editUser && (
        <UserEditModal
          key={editUser.id}
          user={editUser}
          onClose={() => setEditUser(null)}
        />
      )}

      {roleUser && (
        <UserRoleModal
          key={roleUser.id}
          user={roleUser}
          onClose={() => setRoleUser(null)}
        />
      )}

      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="font-display font-bold text-lg mb-2">Delete User</h2>
            <p className="text-gray-500 text-sm mb-5">This action cannot be undone.</p>
            {deleteUser.error && (
              <p className="text-brand-red text-sm mb-4">
                Cannot delete — this user may have associated orders or reviews.
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
                disabled={deleteUser.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleteUser.isPending && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
