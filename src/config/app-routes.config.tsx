import { ROUTE_PATHS } from "@/config/route-paths.config";
import {
  Dashboard,
  Login,
  Profile,
  Register,
  Settings,
  ForgotPassword,
  ResetPassword,
  ResendVerification,
  VerifyEmail,
} from "@/pages";

export const AUTH_ROUTES = [
  { path: ROUTE_PATHS.LOGIN, element: <Login /> },
  { path: ROUTE_PATHS.REGISTER, element: <Register /> },
  { path: ROUTE_PATHS.FORGOT_PASSWORD, element: <ForgotPassword /> },
  { path: ROUTE_PATHS.RESET_PASSWORD, element: <ResetPassword /> },
  { path: ROUTE_PATHS.RESEND_VERIFICATION, element: <ResendVerification /> },
  { path: ROUTE_PATHS.VERIFY_EMAIL, element: <VerifyEmail /> },
];

export const PRIVATE_ROUTES = [
  { path: ROUTE_PATHS.HOME, element: <Dashboard /> },
  { path: ROUTE_PATHS.DASHBOARD, element: <Dashboard /> },
  { path: ROUTE_PATHS.PROFILE, element: <Profile /> },
  { path: ROUTE_PATHS.SETTINGS, element: <Settings /> },
  
];
