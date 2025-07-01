export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  password: string;
  confirmPassword?: string;
  token: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  access_token: string;
  refresh_token: string;
}

export interface ForgotPasswordResponse {
  status: string;
  message: string;
}
