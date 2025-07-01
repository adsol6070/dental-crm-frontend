const PREFIXES = {
  PRIVATE: "/app",
  AUTH: "/auth",
};

const ROUTE_PATHS = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgotpassword",
  RESET_PASSWORD: "/resetpassword/:token",
  RESEND_VERIFICATION: "/resendverification",
  VERIFY_EMAIL: "/verifyemail/:token",
  NOT_FOUND: "*",
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
        >,
        string | ((...args: any[]) => string)
      >
    ),
  NOT_FOUND: ROUTE_PATHS.NOT_FOUND,
};

export { PREFIXES, ROUTE_PATHS, ROUTES };
