import { Routes, Route } from "react-router-dom";
import { MainLayout } from "@/layout";
import PrivateRoute from "./PrivateRoute";
import { PRIVATE_ROUTES } from "../config/app-routes.config";

const PrivateRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        {PRIVATE_ROUTES.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>
    </Routes>
  );
};

export default PrivateRoutes;
