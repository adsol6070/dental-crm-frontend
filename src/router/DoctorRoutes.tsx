import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./PrivateRoute";
import { UserType } from "@/context/AuthContext";
import { MainLayout } from "@/layout";
import { DOCTOR_ROUTES } from "@/config/app-routes.config";

const DoctorRoutes = () => {
  return (
    <ProtectedRoute allowedUserTypes={[UserType.DOCTOR]}>
      <Routes>
        <Route element={<MainLayout />}>
          {DOCTOR_ROUTES.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>
      </Routes>
    </ProtectedRoute>
  );
};

export default DoctorRoutes;
