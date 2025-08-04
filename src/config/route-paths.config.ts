const PREFIXES = {
  PRIVATE: "/app",
  AUTH: "/auth",
  PATIENT: "/patient",
  DOCTOR: "/doctor",
  ADMIN: "/admin",
};

const ROUTE_PATHS = {
  HOME: "/",

  // Auth routes
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgotpassword",
  RESET_PASSWORD: "/resetpassword/:token",
  RESEND_VERIFICATION: "/resendverification",
  VERIFY_EMAIL: "/verifyemail/:token",
  FORCE_CHANGE_PASSWORD: "/forceChangePassword",
  NOT_FOUND: "*",

  // Common routes
  PROFILE: "/profile",
  SETTINGS: "/settings",

  // Dashboard routes (user-type specific)
  DASHBOARD: "/dashboard",
  PATIENT_DASHBOARD: "/dashboard",
  DOCTOR_DASHBOARD: "/dashboard",
  ADMIN_DASHBOARD: "/dashboard",

  // Profile routes (user-type specific)
  ADMIN_PROFILE: "/admin-profile",
  DOCTOR_PROFILE: "/doctor-profile",
  PATIENT_PROFILE: "/patient-profile",

  // Patient-specific routes
  PATIENT_APPOINTMENTS: "/appointments",
  PATIENT_APPOINTMENT_DETAIL: "/appointments/:appointmentId",
  PATIENT_MEDICAL_HISTORY: "/medical-history",
  PATIENT_PRESCRIPTIONS: "/prescriptions",
  PATIENT_BILLING: "/billing",
  PUBLIC_PATIENT_FORM: "/publicform",

  // Doctor-specific routes
  DOCTOR_PATIENTS: "/patients",
  DOCTOR_APPOINTMENTS: "/appointments",
  DOCTOR_SCHEDULE: "/schedule",
  DOCTOR_PRESCRIPTIONS: "/prescriptions",

  DOCTOR_ANALYTICS: "/analytics",
  DOCTOR_UNAVAILABLE_DAYS: "/unavailable-days",
  DOCTOR_APPOINTMENTS_TODAY: "/appointments/today",
  DOCTOR_APPOINTMENTS_UPCOMING: "/appointments/upcoming",
  DOCTOR_APPOINTMENT_DETAILS: "/appointments/:appointmentId",
  DOCTOR_FEES: "/fees",
  DOCTOR_REVIEWS: "/reviews",
  DOCTOR_NOTIFICATIONS: "/notifications",
  DOCTOR_CHANGE_PASSWORD: "/settings/change-password",
  DOCTOR_ACCOUNT_MANAGEMENT: "/settings/account",

  // Admin-specific routes
  CREATE_PATIENT: "/patients/create",
  PATIENT_LIST: "/patients/list",
  EDIT_PATIENT: "/patients/edit/:patientId",
  PATIENT_VIEW: "/patients/details/:patientId",

  CREATE_DOCTOR: "/doctors/create",
  DOCTOR_LIST: "/doctors/list",
  DOCTOR_VIEW: "/doctors/details/:doctorId",

  CREATE_APPOINTMENT: "/appointments/create",
  APPOINTMENT_LIST: "/appointments/list",
  APPOINTMENT_VIEW: "/appointments/details/:appointmentId",

  // System management (Admin only)
  USER_MANAGEMENT: "/users",
  SYSTEM_SETTINGS: "/system-settings",
  REPORTS: "/reports",
};

const getFullPath = <T extends string | ((...args: any[]) => string)>(
  prefix: string,
  route: T
): T extends (...args: any[]) => string
  ? (...args: Parameters<T>) => string
  : string => {
  return (
    typeof route === "function"
      ? (...args: any[]) => `${prefix}${(route as any)(...args)}`
      : (`${prefix}${route}` as any)
  ) as any;
};

const ROUTES = {
  AUTH: Object.keys(ROUTE_PATHS)
    .filter((key): key is keyof typeof ROUTE_PATHS =>
      [
        "LOGIN",
        "REGISTER",
        "FORGOT_PASSWORD",
        "RESET_PASSWORD",
        "RESEND_VERIFICATION",
        "VERIFY_EMAIL",
      ].includes(key)
    )
    .reduce(
      (acc, key) => ({
        ...acc,
        [key]: getFullPath(PREFIXES.AUTH, ROUTE_PATHS[key]),
      }),
      {} as Record<
        | "LOGIN"
        | "REGISTER"
        | "FORGOT_PASSWORD"
        | "RESET_PASSWORD"
        | "RESEND_VERIFICATION"
        | "VERIFY_EMAIL",
        string
      >
    ),

  // Patient routes
  PATIENT: {
    DASHBOARD: getFullPath(PREFIXES.PATIENT, ROUTE_PATHS.PATIENT_DASHBOARD),
    APPOINTMENTS: getFullPath(
      PREFIXES.PATIENT,
      ROUTE_PATHS.PATIENT_APPOINTMENTS
    ),
    MEDICAL_HISTORY: getFullPath(
      PREFIXES.PATIENT,
      ROUTE_PATHS.PATIENT_MEDICAL_HISTORY
    ),
    PRESCRIPTIONS: getFullPath(
      PREFIXES.PATIENT,
      ROUTE_PATHS.PATIENT_PRESCRIPTIONS
    ),
    BILLING: getFullPath(PREFIXES.PATIENT, ROUTE_PATHS.PATIENT_BILLING),
    PROFILE: getFullPath(PREFIXES.PATIENT, ROUTE_PATHS.PATIENT_PROFILE),
    SETTINGS: getFullPath(PREFIXES.PATIENT, ROUTE_PATHS.SETTINGS),
  },

  // Doctor routes
  DOCTOR: {
    DASHBOARD: getFullPath(PREFIXES.DOCTOR, ROUTE_PATHS.DOCTOR_DASHBOARD),
    ANALYTICS: getFullPath(PREFIXES.DOCTOR, ROUTE_PATHS.DOCTOR_ANALYTICS),
    PATIENTS: getFullPath(PREFIXES.DOCTOR, ROUTE_PATHS.DOCTOR_PATIENTS),
    APPOINTMENTS: getFullPath(PREFIXES.DOCTOR, ROUTE_PATHS.DOCTOR_APPOINTMENTS),
    APPOINTMENTS_TODAY: getFullPath(
      PREFIXES.DOCTOR,
      ROUTE_PATHS.DOCTOR_APPOINTMENTS_TODAY
    ),
    APPOINTMENTS_UPCOMING: getFullPath(
      PREFIXES.DOCTOR,
      ROUTE_PATHS.DOCTOR_APPOINTMENTS_UPCOMING
    ),
    APPOINTMENT_DETAILS: getFullPath(
      PREFIXES.DOCTOR,
      ROUTE_PATHS.DOCTOR_APPOINTMENT_DETAILS
    ),
    SCHEDULE: getFullPath(PREFIXES.DOCTOR, ROUTE_PATHS.DOCTOR_SCHEDULE),
    UNAVAILABLE_DAYS: getFullPath(
      PREFIXES.DOCTOR,
      ROUTE_PATHS.DOCTOR_UNAVAILABLE_DAYS
    ),
    PRESCRIPTIONS: getFullPath(
      PREFIXES.DOCTOR,
      ROUTE_PATHS.DOCTOR_PRESCRIPTIONS
    ),
    FEES: getFullPath(PREFIXES.DOCTOR, ROUTE_PATHS.DOCTOR_FEES),
    REVIEWS: getFullPath(PREFIXES.DOCTOR, ROUTE_PATHS.DOCTOR_REVIEWS),
    NOTIFICATIONS: getFullPath(
      PREFIXES.DOCTOR,
      ROUTE_PATHS.DOCTOR_NOTIFICATIONS
    ),
    PROFILE: getFullPath(PREFIXES.DOCTOR, ROUTE_PATHS.DOCTOR_PROFILE),
    SETTINGS: getFullPath(PREFIXES.DOCTOR, ROUTE_PATHS.SETTINGS),
    CHANGE_PASSWORD: getFullPath(
      PREFIXES.DOCTOR,
      ROUTE_PATHS.DOCTOR_CHANGE_PASSWORD
    ),
    ACCOUNT_MANAGEMENT: getFullPath(
      PREFIXES.DOCTOR,
      ROUTE_PATHS.DOCTOR_ACCOUNT_MANAGEMENT
    ),
  },
  // Admin routes
  ADMIN: {
    DASHBOARD: getFullPath(PREFIXES.ADMIN, ROUTE_PATHS.ADMIN_DASHBOARD),

    // Patient management
    CREATE_PATIENT: getFullPath(PREFIXES.ADMIN, ROUTE_PATHS.CREATE_PATIENT),
    PATIENT_LIST: getFullPath(PREFIXES.ADMIN, ROUTE_PATHS.PATIENT_LIST),
    EDIT_PATIENT: getFullPath(PREFIXES.ADMIN, ROUTE_PATHS.EDIT_PATIENT),
    PATIENT_VIEW: getFullPath(PREFIXES.ADMIN, ROUTE_PATHS.PATIENT_VIEW),

    // Doctor management
    CREATE_DOCTOR: getFullPath(PREFIXES.ADMIN, ROUTE_PATHS.CREATE_DOCTOR),
    DOCTOR_LIST: getFullPath(PREFIXES.ADMIN, ROUTE_PATHS.DOCTOR_LIST),
    DOCTOR_VIEW: getFullPath(PREFIXES.ADMIN, ROUTE_PATHS.DOCTOR_VIEW),

    // Appointment management
    CREATE_APPOINTMENT: getFullPath(
      PREFIXES.ADMIN,
      ROUTE_PATHS.CREATE_APPOINTMENT
    ),
    APPOINTMENT_LIST: getFullPath(PREFIXES.ADMIN, ROUTE_PATHS.APPOINTMENT_LIST),
    APPOINTMENT_VIEW: getFullPath(PREFIXES.ADMIN, ROUTE_PATHS.APPOINTMENT_VIEW),

    // System management
    USER_MANAGEMENT: getFullPath(PREFIXES.ADMIN, ROUTE_PATHS.USER_MANAGEMENT),
    SYSTEM_SETTINGS: getFullPath(PREFIXES.ADMIN, ROUTE_PATHS.SYSTEM_SETTINGS),
    REPORTS: getFullPath(PREFIXES.ADMIN, ROUTE_PATHS.REPORTS),

    PROFILE: getFullPath(PREFIXES.ADMIN, ROUTE_PATHS.ADMIN_PROFILE),
    SETTINGS: getFullPath(PREFIXES.ADMIN, ROUTE_PATHS.SETTINGS),
  },

  PUBLIC: {
    PUBLIC_PATIENT_FORM: ROUTE_PATHS.PUBLIC_PATIENT_FORM,
  },

  PRIVATE: Object.keys(ROUTE_PATHS)
    .filter(
      (key): key is keyof typeof ROUTE_PATHS =>
        ![
          "LOGIN",
          "REGISTER",
          "FORGOT_PASSWORD",
          "RESET_PASSWORD",
          "RESEND_VERIFICATION",
          "VERIFY_EMAIL",
          "NOT_FOUND",
          "PUBLIC_PATIENT_FORM",
        ].includes(key)
    )
    .reduce(
      (acc, key) => ({
        ...acc,
        [key]: getFullPath(PREFIXES.PRIVATE, ROUTE_PATHS[key]),
      }),
      {} as Record<
        Exclude<
          keyof typeof ROUTE_PATHS,
          | "LOGIN"
          | "REGISTER"
          | "FORGOT_PASSWORD"
          | "RESET_PASSWORD"
          | "RESEND_VERIFICATION"
          | "VERIFY_EMAIL"
          | "NOT_FOUND"
          | "PUBLIC_PATIENT_FORM"
        >,
        string | ((...args: any[]) => string)
      >
    ),
  NOT_FOUND: ROUTE_PATHS.NOT_FOUND,
};

export { PREFIXES, ROUTE_PATHS, ROUTES };
