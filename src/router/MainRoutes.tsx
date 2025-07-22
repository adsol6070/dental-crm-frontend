import { Routes, Route } from "react-router-dom";
import AuthRoutes from "./AuthRoutes";
import PatientRoutes from "./PatientRoutes";
import DoctorRoutes from "./DoctorRoutes";
import AdminRoutes from "./AdminRoutes";
import { PREFIXES } from "@/config/route-paths.config";
import { NotFound } from "@/pages";

const MainRoutes = () => {
  return (
    <Routes>
      <Route path={`${PREFIXES.AUTH}/*`} element={<AuthRoutes />} />
      <Route path={`${PREFIXES.PATIENT}/*`} element={<PatientRoutes />} />
      <Route path={`${PREFIXES.DOCTOR}/*`} element={<DoctorRoutes />} />
      <Route path={`${PREFIXES.ADMIN}/*`} element={<AdminRoutes />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default MainRoutes;
