import { lazy } from "react";

export const AdminDashboard = lazy(() => import("./AdminDashboard"));
export const AdminProfile = lazy(() => import("./AdminProfile"));
export const UserManagement = lazy(() => import("./UserManagement"));
export const CreatePatientForm = lazy(() => import("./createPatientForm"));
export const PatientList = lazy(() => import("./patientList"));
export const PatientView = lazy(() => import("./patientDetail"));
export const CreateDoctorForm = lazy(() => import("./createDoctorForm"));
export const DoctorList = lazy(() => import("./doctorList"));
export const DoctorView = lazy(() => import("./doctorDetail"));
export const Reports = lazy(() => import("./Reports"));