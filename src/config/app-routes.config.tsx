import { ROUTE_PATHS } from "@/config/route-paths.config";
import {
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  ResendVerification,
  VerifyEmail,
  Settings,
  AdminDashboard,
  PatientDashboard,
  AdminProfile,
  Reports,
  PatientProfile,
  CreatePatientForm,
  PatientList,
  PatientView,
  AppointmentDetail,
  PatientPrescription,
  PatientBilling,
  DoctorDashboard,
  PatientAppointments,
  MedicalHistory,
  DoctorProfile,
  CreateDoctorForm,
  DoctorList,
  DoctorView,
  CreateAppointmentForm,
  AppointmentList,
  AppointmentView,
  UserManagement,
  ForcePasswordChange,
  DoctorSchedule,
  UnavailableDates,
  FeesPricing,
  Appointments,
  Analytics,
  MyPatients,
  Reviews,
} from "@/pages";

export const AUTH_ROUTES = [
  { path: ROUTE_PATHS.LOGIN, element: <Login /> },
  { path: ROUTE_PATHS.REGISTER, element: <Register /> },
  { path: ROUTE_PATHS.FORGOT_PASSWORD, element: <ForgotPassword /> },
  { path: ROUTE_PATHS.RESET_PASSWORD, element: <ResetPassword /> },
  { path: ROUTE_PATHS.RESEND_VERIFICATION, element: <ResendVerification /> },
  { path: ROUTE_PATHS.VERIFY_EMAIL, element: <VerifyEmail /> },
  { path: ROUTE_PATHS.FORCE_CHANGE_PASSWORD, element: <ForcePasswordChange /> },
];

// Patient Routes - Only for patients
export const PATIENT_ROUTES = [
  { path: ROUTE_PATHS.PATIENT_DASHBOARD, element: <PatientDashboard /> },
  { path: ROUTE_PATHS.PATIENT_APPOINTMENTS, element: <PatientAppointments /> },
  { path: ROUTE_PATHS.PATIENT_APPOINTMENT_DETAIL, element: <AppointmentDetail /> },
  { path: ROUTE_PATHS.PATIENT_MEDICAL_HISTORY, element: <MedicalHistory /> },
  { path: ROUTE_PATHS.PATIENT_PRESCRIPTIONS, element: <PatientPrescription /> },
  { path: ROUTE_PATHS.PATIENT_BILLING, element: <PatientBilling /> },
  { path: ROUTE_PATHS.PATIENT_PROFILE, element: <PatientProfile /> },
  { path: ROUTE_PATHS.SETTINGS, element: <Settings /> },
];

export const DOCTOR_ROUTES = [
  // Core Dashboard & Analytics
  { path: ROUTE_PATHS.DOCTOR_DASHBOARD, element: <DoctorDashboard /> },
  { path: ROUTE_PATHS.DOCTOR_ANALYTICS, element: <Analytics /> },

  // Profile Management
  { path: ROUTE_PATHS.DOCTOR_PROFILE, element: <DoctorProfile /> },

  // Schedule Management
  { path: ROUTE_PATHS.DOCTOR_SCHEDULE, element: <DoctorSchedule /> },
  { path: ROUTE_PATHS.DOCTOR_UNAVAILABLE_DAYS, element: <UnavailableDates /> },

  // Appointment Management
  { path: ROUTE_PATHS.DOCTOR_APPOINTMENTS, element: <Appointments /> },

  // Patient & Prescription Management
  { path: ROUTE_PATHS.DOCTOR_PATIENTS, element: <MyPatients /> },
  // { path: ROUTE_PATHS.DOCTOR_PRESCRIPTIONS, element: <DoctorPrescriptions /> },

  // Financial & Feedback Management
  { path: ROUTE_PATHS.DOCTOR_FEES, element: <FeesPricing /> },
  { path: ROUTE_PATHS.DOCTOR_REVIEWS, element: <Reviews /> },

  // Notifications & Communication
  // { path: ROUTE_PATHS.DOCTOR_NOTIFICATIONS, element: <DoctorNotifications /> },

  // Settings & Account Management
  // { path: ROUTE_PATHS.SETTINGS, element: <Settings /> },
  // { path: ROUTE_PATHS.DOCTOR_CHANGE_PASSWORD, element: <DoctorChangePassword /> },
  // { path: ROUTE_PATHS.DOCTOR_ACCOUNT_MANAGEMENT, element: <DoctorAccountManagement /> },
];

// Admin Routes - Only for admins
export const ADMIN_ROUTES = [
  { path: ROUTE_PATHS.ADMIN_DASHBOARD, element: <AdminDashboard /> },
  { path: ROUTE_PATHS.ADMIN_PROFILE, element: <AdminProfile /> },

  // Patient Management
  { path: ROUTE_PATHS.CREATE_PATIENT, element: <CreatePatientForm /> },
  { path: ROUTE_PATHS.PATIENT_LIST, element: <PatientList /> },
  { path: ROUTE_PATHS.EDIT_PATIENT, element: <CreatePatientForm /> },
  { path: ROUTE_PATHS.PATIENT_VIEW, element: <PatientView /> },

  // Doctor Management
  { path: ROUTE_PATHS.CREATE_DOCTOR, element: <CreateDoctorForm /> },
  { path: ROUTE_PATHS.DOCTOR_LIST, element: <DoctorList /> },
  { path: ROUTE_PATHS.DOCTOR_VIEW, element: <DoctorView /> },

  // Appointment Management
  { path: ROUTE_PATHS.CREATE_APPOINTMENT, element: <CreateAppointmentForm /> },
  { path: ROUTE_PATHS.APPOINTMENT_LIST, element: <AppointmentList /> },
  { path: ROUTE_PATHS.APPOINTMENT_VIEW, element: <AppointmentView /> },

  // System Management
  { path: ROUTE_PATHS.USER_MANAGEMENT, element: <UserManagement /> },
  // { path: ROUTE_PATHS.SYSTEM_SETTINGS, element: <SystemSettings /> },
  { path: ROUTE_PATHS.REPORTS, element: <Reports /> },

  // Common Routes
  // { path: ROUTE_PATHS.PROFILE, element: <Profile /> },
  // { path: ROUTE_PATHS.SETTINGS, element: <Settings /> },
];
