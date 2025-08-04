import { Routes, Route } from "react-router-dom";
import { PUBLIC_ROUTES } from "../config/app-routes.config";
import { PublicRoute } from "./PrivateRoute";

const PublicRoutes = () => {
  return (
    <PublicRoute>
      <Routes>
        <Route>
          {PUBLIC_ROUTES.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>
      </Routes>
    </PublicRoute>
  );
};

export default PublicRoutes;
