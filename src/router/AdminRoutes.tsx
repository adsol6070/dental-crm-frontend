import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./PrivateRoute";
import { UserType } from "@/context/AuthContext";
import { MainLayout } from "@/layout";
import { ADMIN_ROUTES } from "@/config/app-routes.config";

const AdminRoutes = () => {
  return (
    <ProtectedRoute allowedUserTypes={[UserType.ADMIN]}>
      <Routes>
        <Route element={<MainLayout />}>
          {ADMIN_ROUTES.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>
      </Routes>
    </ProtectedRoute>
  );
};

export default AdminRoutes;
