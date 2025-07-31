import { lazy } from "react";

export const PatientDashboard = lazy(() => import("./PatientDashboard"));
export const PatientProfile = lazy(() => import("./patientProfile"));
export const PatientAppointments = lazy(() => import("./myAppointments"));
export const AppointmentDetail = lazy(() => import("./AppointmentDetail"));
export const MedicalHistory = lazy(() => import("./medicalHistory"));
export const PatientPrescription = lazy(() => import("./patientPrescription"));
export const PatientBilling = lazy(() => import("./patientBilling"));