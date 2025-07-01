import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { ROUTES } from "@/config/route-paths.config";
import { useAuth } from "@/context/AuthContext";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <div>Loading...</div>;
  }

  // if (!isAuthenticated) {
  //   return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
  // }

  return <>{children}</>;
};

export default PrivateRoute;
