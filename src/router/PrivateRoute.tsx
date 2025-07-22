import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { ROUTES } from "@/config/route-paths.config";
import { useAuth, UserType } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedUserTypes?: UserType[];
  requireAuth?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  allowedUserTypes = [],
  requireAuth = true,
  redirectTo,
}: ProtectedRouteProps) => {
  const { state, getRedirectPath } = useAuth();
  const location = useLocation();

  console.log("State:", state);
  console.log("getRedirectPath:", getRedirectPath());

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && !state.isAuthenticated) {
    return (
      <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />
    );
  }

  if (allowedUserTypes.length === 0) {
    return <>{children}</>;
  }

  if (state.user) {
    const isUserTypeAllowed = allowedUserTypes.includes(state.user.type);

    if (!isUserTypeAllowed) {
      const redirectPath = redirectTo || getRedirectPath();
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};

export const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { state, getRedirectPath } = useAuth();

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (state.isAuthenticated && state.user) {
    const redirectPath = getRedirectPath();
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
