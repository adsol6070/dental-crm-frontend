import { lazy } from "react";

export const DoctorDashboard = lazy(() => import("./DoctorDashboard"));
export const DoctorSchedule = lazy(() => import("./DoctorSchedule"));
export const DoctorProfile = lazy(() => import("./DoctorProfile"));
export const UnavailableDates = lazy(() => import("./UnavailableDates"));
export const FeesPricing = lazy(() => import("./FeesPricing"));
export const Appointments = lazy(() => import("./Appointments"));
export const Analytics = lazy(() => import("./Analytics"));
export const MyPatients = lazy(() => import("./myPatients"));
export const Reviews = lazy(() => import("./Reviews"));
export const DoctorPatientServices = lazy(
  () => import("./DoctorPatientServices")
);
export const DoctorAllServices = lazy(() => import("./DoctorAllServices"));
export const DoctorServiceReports = lazy(
  () => import("./DoctorServiceReports")
);
