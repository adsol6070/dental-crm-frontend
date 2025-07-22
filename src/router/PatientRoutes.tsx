import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./PrivateRoute";
import { UserType } from "@/context/AuthContext";
import { MainLayout } from "@/layout";
import { PATIENT_ROUTES } from "@/config/app-routes.config";

const PatientRoutes = () => {
  return (
    <ProtectedRoute allowedUserTypes={[UserType.PATIENT]}>
      <Routes>
        <Route element={<MainLayout />}>
          {PATIENT_ROUTES.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>
      </Routes>
    </ProtectedRoute>
  );
};

export default PatientRoutes;
