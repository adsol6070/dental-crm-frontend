export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `/api/auth/login`,
    REGISTER: `/api/auth/register`,
    LOGOUT: `/api/auth/logout`,
    FORGOT_PASSWORD: `/api/auth/forgot-password`,
    RESET_PASSWORD: `/api/auth/reset-password`,
    RESEND_VERIFICATION: `/api/auth/resend-verification-email`,
    VERIFY_EMAIL: `/api/auth/verify-email`,
  },
  USER: {
    ME: `/api/users/me`,
    GET_ALL: `/api/users/`,
    GET_BY_ID: (id: string) => `/api/users/${id}`,
    UPDATE: (id: string) => `/api/users/${id}`,
  },
};
