// src/routes/ProtectedRoute.tsx
import { useAuthStore, type Role } from "@/store/authStore";
import { Navigate } from "react-router-dom";

interface AuthenticationProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export const Authentication = ({
  children,
  allowedRoles,
}: AuthenticationProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
