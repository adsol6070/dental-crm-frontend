import {
  authApi,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from "@/api";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { userApi } from "@/api/user/userApi";
import Swal from "sweetalert2";

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  register: (data: RegisterPayload) => Promise<void>;
  login: (data: LoginPayload) => Promise<any>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (data: ResetPasswordPayload) => Promise<any>;
  resendVerification: (email: string) => Promise<void>;
  verifyEmail: (verificationCode: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let logoutTimer: ReturnType<typeof setTimeout> | null = null;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const startAutoLogout = (token: string) => {
    try {
      const decoded: { exp: number } = jwtDecode(token);
      const expiresInMs = decoded.exp * 1000 - Date.now();

      if (logoutTimer) clearTimeout(logoutTimer);

      logoutTimer = setTimeout(() => {
        logout();
        toast.error("Session expired. Please log in again.");
      }, expiresInMs - 5 * 1000);
    } catch {
      logout();
    }
  };

  const checkLoggedIn = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      logout(false);
      setIsAuthLoading(false);
      return;
    }

    try {
      const respone = await userApi.me();
      console.log("response ", respone)
      setIsAuthenticated(true);
      startAutoLogout(token);
    } catch {
      logout(false);
      toast.error("Session expired. Please log in again.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const register = async (data: RegisterPayload) => {
    try {
      const response = await authApi.register(data);
      if (response.status === "success") {
        toast.success(response.message);
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Registration failed.";
      toast.error(message);
      throw new Error(message);
    }
  };

  const login = async (data: LoginPayload): Promise<any> => {
    try {
      const response = await authApi.login(data);
      if (response.status === "success") {
        localStorage.setItem("access_token", response.access_token);
        localStorage.setItem("refresh_token", response.refresh_token);
        await checkLoggedIn();
        toast.success("Login successful");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  const logout = (showToast = true) => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsAuthenticated(false);
    if (logoutTimer) clearTimeout(logoutTimer);
    if (showToast) toast.success("Logged out");
  };

  const forgotPassword = async (email: string): Promise<any> => {
    try {
      const response = await authApi.forgotPassword(email);
      if (response.status === "success") {
        toast.success(response.message);
      }
    } catch (error: any) {
      toast.error(
        error.response.data.message ?? "Failed to send password reset email."
      );
      throw error;
    }
  };

  const resetPassword = async (data: ResetPasswordPayload): Promise<any> => {
    try {
      const response = await authApi.resetPassword(data);
      if (response.status === "success") {
        toast.success(response.message);
      }
    } catch (error: any) {
      toast.error(error.response.data.message ?? "Failed to reset password.");
      throw error;
    }
  };

  const resendVerification = async (email: string) => {
    try {
      const response = await authApi.resendVerificationEmail(email);
      if (response.success) {
        Swal.fire({
          icon: "info",
          title: "Check Your Email",
          text: `${response.message}`,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to resend verification email. Please try again later.",
      });
    }
  };

  const verifyEmail = async (verificationCode: string): Promise<void> => {
    try {
      const response = await authApi.verifyEmail(verificationCode);
      if (response.status === "success") {
        toast.success(response.message);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      throw error
    }
  };

  useEffect(() => {
    checkLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthLoading,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        resendVerification,
        verifyEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
