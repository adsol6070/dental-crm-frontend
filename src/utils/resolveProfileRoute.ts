import { ROUTES } from "@/config/route-paths.config";

export const resolveProfileRoute = (role: string): any => {
  switch (role) {
    case "admin":
      return ROUTES.ADMIN.PROFILE;
    case "doctor":
      return ROUTES.DOCTOR.PROFILE;
    case "patient":
      return ROUTES.PATIENT.PROFILE;
    default:
      return ROUTES.NOT_FOUND; 
  }
};
