import { lazy } from "react";

export const CreateAppointmentForm = lazy(() => import("./createAppointmentForm"));
export const AppointmentList = lazy(() => import("./appointmentList"));
export const AppointmentView = lazy(() => import("./appointmentDetail"));