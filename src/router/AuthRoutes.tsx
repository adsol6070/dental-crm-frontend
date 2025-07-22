import { Routes, Route } from "react-router-dom";
import { AuthLayout } from "@/layout";
import { AUTH_ROUTES } from "../config/app-routes.config";
import { PublicRoute } from "./PrivateRoute";

const AuthRoutes = () => {
  return (
    <PublicRoute>
      <Routes>
        <Route element={<AuthLayout />}>
          {AUTH_ROUTES.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>
      </Routes>
    </PublicRoute>
  );
};

export default AuthRoutes;
