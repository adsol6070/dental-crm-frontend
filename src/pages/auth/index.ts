import { lazy } from "react";

export const Login = lazy(() => import("./Login"));
export const Register = lazy(() => import("./Register"));
export const ForgotPassword = lazy(() => import("./ForgotPassword"));
export const ResetPassword = lazy(() => import("./ResetPassword"));
export const ResendVerification = lazy(() => import("./ResendVerification"));
export const VerifyEmail = lazy(() => import("./VerifyEmail"));
