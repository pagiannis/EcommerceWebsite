import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdminUsers, adminUpdateUser, adminUpdateUserRole, adminDeleteUser } from '../services/adminUsersService';
import type { AdminUpdateUserPayload } from '../services/adminUsersService';
import type { UserRole } from '../services/accountService';

export function useAdminUserList(page: number) {
  return useQuery({
    queryKey: ['admin', 'users', page],
    queryFn: () => fetchAdminUsers({ page }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdminUpdateUserPayload }) =>
      adminUpdateUser(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: UserRole }) =>
      adminUpdateUserRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminDeleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}
