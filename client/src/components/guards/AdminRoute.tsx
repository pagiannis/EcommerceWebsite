import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuthStore } from "../../store/authStore";

export default function AdminRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/" replace />;
  return <>{children}</>;
}
