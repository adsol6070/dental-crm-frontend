// contexts/AuthContext.tsx - Shared Authentication Context
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { apiClient } from "../services/apiClient";
import { tokenStorage } from "../utils/tokenStorage";
import { PermissionCategory } from "../types/Permissions";
import { ROUTES } from "@/config/route-paths.config";
import { useNavigate } from "react-router-dom";

// ==================== TYPE DEFINITIONS ====================

// User types enum
export enum UserType {
  PATIENT = "patient",
  DOCTOR = "doctor",
  ADMIN = "admin",
}

// Base user interface
interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  isVerified?: boolean;
}

// Patient-specific interface
export interface PatientUser extends BaseUser {
  type: UserType.PATIENT;
  patientId: string;
  age?: number;
  bloodGroup?: string;
  communicationMethod: "email" | "sms" | "whatsapp" | "phone";
  registrationSource: string;
}

// Doctor-specific interface
export interface DoctorUser extends BaseUser {
  type: UserType.DOCTOR;
  doctorId: string;
  specialization: string;
  licenseNumber: string;
  experience: number;
  rating: number;
  department?: string;
  isVerifiedByAdmin: boolean;
}

// Admin-specific interface
export interface AdminUser extends BaseUser {
  type: UserType.ADMIN;
  userId: string;
  role: "super_admin" | "admin" | "moderator" | "staff";
  permissions: PermissionCategory[];
}

// Union type for all user types
export type AuthUser = PatientUser | DoctorUser | AdminUser;

// Authentication state interface
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginAttempts: number;
  lastLoginError: string | null;
  sessionExpiresAt: Date | null;
  requiresPasswordChange: boolean;
  tempToken: string | null;
}

// Login credentials interfaces
export interface PatientLoginCredentials {
  email: string;
  password: string;
  userType: UserType.PATIENT;
  twoFactorCode?: string;
}

export interface DoctorLoginCredentials {
  email: string;
  password: string;
  userType: UserType.DOCTOR;
  twoFactorCode?: string;
}

export interface AdminLoginCredentials {
  email: string;
  password: string;
  userType: UserType.ADMIN;
  twoFactorCode?: string;
}

export type LoginCredentials =
  | PatientLoginCredentials
  | DoctorLoginCredentials
  | AdminLoginCredentials;

// Registration interfaces
export interface PatientRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  password: string;
  confirmPassword: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  communicationMethod?: "email" | "sms" | "whatsapp" | "phone";
  registrationSource?: string;
}

export interface DoctorRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  qualifications: string[];
  experience: number;
  licenseNumber: string;
  department?: string;
  consultationFee: number;
  password: string;
  confirmPassword: string;
  workingDays?: any[];
}

// Auth context actions
export enum AuthActionType {
  LOGIN_START = "LOGIN_START",
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILURE = "LOGIN_FAILURE",
  PASSWORD_CHANGE_REQUIRED = "PASSWORD_CHANGE_REQUIRED",
  LOGOUT = "LOGOUT",
  REGISTER_START = "REGISTER_START",
  REGISTER_SUCCESS = "REGISTER_SUCCESS",
  REGISTER_FAILURE = "REGISTER_FAILURE",
  LOAD_USER_START = "LOAD_USER_START",
  LOAD_USER_SUCCESS = "LOAD_USER_SUCCESS",
  LOAD_USER_FAILURE = "LOAD_USER_FAILURE",
  UPDATE_USER = "UPDATE_USER",
  CLEAR_ERROR = "CLEAR_ERROR",
  REFRESH_TOKEN_START = "REFRESH_TOKEN_START",
  REFRESH_TOKEN_SUCCESS = "REFRESH_TOKEN_SUCCESS",
  REFRESH_TOKEN_FAILURE = "REFRESH_TOKEN_FAILURE",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  PASSWORD_CHANGE_SUCCESS = "PASSWORD_CHANGE_SUCCESS",
  PASSWORD_CHANGE_FAILURE = "PASSWORD_CHANGE_FAILURE",
}

// Auth actions
export type AuthAction =
  | { type: AuthActionType.LOGIN_START }
  | {
      type: AuthActionType.LOGIN_SUCCESS;
      payload: { user: AuthUser; token: string; expiresAt: Date };
    }
  | { type: AuthActionType.LOGIN_FAILURE; payload: { error: string } }
  | { type: AuthActionType.LOGOUT }
  | { type: AuthActionType.REGISTER_START }
  | {
      type: AuthActionType.REGISTER_SUCCESS;
      payload: { user: AuthUser; token: string; expiresAt: Date };
    }
  | { type: AuthActionType.REGISTER_FAILURE; payload: { error: string } }
  | { type: AuthActionType.LOAD_USER_START }
  | { type: AuthActionType.LOAD_USER_SUCCESS; payload: { user: AuthUser } }
  | { type: AuthActionType.LOAD_USER_FAILURE; payload: { error: string } }
  | { type: AuthActionType.UPDATE_USER; payload: { user: Partial<AuthUser> } }
  | { type: AuthActionType.CLEAR_ERROR }
  | { type: AuthActionType.REFRESH_TOKEN_START }
  | {
      type: AuthActionType.REFRESH_TOKEN_SUCCESS;
      payload: { token: string; expiresAt: Date };
    }
  | { type: AuthActionType.REFRESH_TOKEN_FAILURE }
  | { type: AuthActionType.SESSION_EXPIRED }
  | {
      type: AuthActionType.PASSWORD_CHANGE_REQUIRED;
      payload: { tempToken: string; userType: UserType };
    }
  | { type: AuthActionType.PASSWORD_CHANGE_SUCCESS }
  | {
      type: AuthActionType.PASSWORD_CHANGE_FAILURE;
      payload: { error: string };
    };
// Auth context interface
export interface AuthContextValue {
  // State
  state: AuthState;

  // Actions
  login: (credentials: LoginCredentials) => Promise<any>;
  logout: () => void;
  register: (
    data: PatientRegistrationData | DoctorRegistrationData,
    userType: UserType
  ) => Promise<void>;
  refreshToken: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (userData: Partial<AuthUser>) => void;
  clearError: () => void;

  changePassword: (
    tempToken: string,
    newPassword: string,
    userType: UserType
  ) => Promise<void>;
  // Utility functions
  isPatient: () => boolean;
  isDoctor: () => boolean;
  isAdmin: () => boolean;
  hasPermission: (permission: PermissionCategory) => boolean;
  hasAnyPermission: (permissions: PermissionCategory[]) => boolean;
  hasRole: (role: string) => boolean;
  getRedirectPath: () => string;
  checkSessionValidity: () => boolean;

  // User type guards
  asPatient: () => PatientUser | null;
  asDoctor: () => DoctorUser | null;
  asAdmin: () => AdminUser | null;

  // Admin role utilities
  isSuperAdmin: () => boolean;
  isRegularAdmin: () => boolean;
  isModerator: () => boolean;
  isStaff: () => boolean;
  getAdminRoleDisplayName: () => string;
}

// ==================== AUTH REDUCER ====================

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  loginAttempts: 0,
  lastLoginError: null,
  sessionExpiresAt: null,
  requiresPasswordChange: false,
  tempToken: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case AuthActionType.LOGIN_START:
    case AuthActionType.REGISTER_START:
    case AuthActionType.LOAD_USER_START:
    case AuthActionType.REFRESH_TOKEN_START:
      return {
        ...state,
        isLoading: true,
        lastLoginError: null,
      };

    case AuthActionType.LOGIN_SUCCESS:
    case AuthActionType.REGISTER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        sessionExpiresAt: action.payload.expiresAt,
        loginAttempts: 0,
        lastLoginError: null,
      };

    case AuthActionType.LOGIN_FAILURE:
    case AuthActionType.REGISTER_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        sessionExpiresAt: null,
        loginAttempts: state.loginAttempts + 1,
        lastLoginError: action.payload.error,
      };

    case AuthActionType.LOAD_USER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        isAuthenticated: true,
        lastLoginError: null,
      };

    case AuthActionType.LOAD_USER_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        sessionExpiresAt: null,
        lastLoginError: action.payload.error,
      };

    // In your auth reducer
    case AuthActionType.PASSWORD_CHANGE_REQUIRED:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        tempToken: action.payload.tempToken,
        requiresPasswordChange: true,
        lastLoginError: null,
      };

    case AuthActionType.UPDATE_USER:
      // Fix: Ensure proper type safety when updating user
      return {
        ...state,
        user: state.user
          ? ({ ...state.user, ...action.payload.user } as AuthUser)
          : null,
      };

    case AuthActionType.REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        token: action.payload.token,
        sessionExpiresAt: action.payload.expiresAt,
        lastLoginError: null,
      };

    case AuthActionType.REFRESH_TOKEN_FAILURE:
    case AuthActionType.SESSION_EXPIRED:
    case AuthActionType.LOGOUT:
      return {
        ...initialState,
        loginAttempts: state.loginAttempts,
      };

    case AuthActionType.CLEAR_ERROR:
      return {
        ...state,
        lastLoginError: null,
      };

    case AuthActionType.PASSWORD_CHANGE_REQUIRED:
      return {
        ...state,
        isLoading: false,
        requiresPasswordChange: true,
        tempToken: action.payload.tempToken,
        lastLoginError: null,
      };

    case AuthActionType.PASSWORD_CHANGE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        requiresPasswordChange: false,
        tempToken: null,
        lastLoginError: null,
      };

    case AuthActionType.PASSWORD_CHANGE_FAILURE:
      return {
        ...state,
        isLoading: false,
        lastLoginError: action.payload.error,
      };

    default:
      return state;
  }
};

// ==================== AUTH CONTEXT ====================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ==================== AUTH PROVIDER ====================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ==================== EFFECTS ====================

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  // Set up token refresh timer
  useEffect(() => {
    if (state.token && state.sessionExpiresAt) {
      const timeUntilExpiry = state.sessionExpiresAt.getTime() - Date.now();
      const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 60 * 1000); // Refresh 5 min before expiry

      const refreshTimer = setTimeout(() => {
        // refreshToken();
      }, refreshTime);

      return () => clearTimeout(refreshTimer);
    }
  }, [state.token, state.sessionExpiresAt]);

  // ==================== AUTH FUNCTIONS ====================

  const initializeAuth = async (): Promise<void> => {
    dispatch({ type: AuthActionType.LOAD_USER_START });

    try {
      const token = tokenStorage.getToken();
      if (!token) {
        dispatch({
          type: AuthActionType.LOAD_USER_FAILURE,
          payload: { error: "No token found" },
        });
        return;
      }

      // Check if token is expired
      if (tokenStorage.isTokenExpired()) {
        tokenStorage.removeToken();
        dispatch({ type: AuthActionType.SESSION_EXPIRED });
        return;
      }

      // Set token in API client
      apiClient.setAuthToken(token);

      console.log("Came Here Haha:");
      // Determine user type from token
      const userTypeFromToken = tokenStorage.getUserTypeFromToken();

      if (!userTypeFromToken) {
        throw new Error("Invalid token: No user type found");
      }

      // Convert specific admin roles to UserType.ADMIN
      const userType = normalizeUserType(userTypeFromToken);

      // Load user data based on normalized type
      const user = await loadUserByType(userType);
      dispatch({ type: AuthActionType.LOAD_USER_SUCCESS, payload: { user } });
    } catch (error) {
      console.error("Auth initialization failed:", error);
      tokenStorage.removeToken();
      dispatch({
        type: AuthActionType.LOAD_USER_FAILURE,
        payload: { error: "Failed to load user" },
      });
    }
  };

  const normalizeUserType = (userTypeFromToken: string): UserType => {
    // Convert specific admin roles to UserType.ADMIN
    const adminRoles = ["super_admin", "admin", "moderator", "staff"];

    if (adminRoles.includes(userTypeFromToken)) {
      return UserType.ADMIN;
    }

    // For patient and doctor, return as-is
    if (
      userTypeFromToken === UserType.PATIENT ||
      userTypeFromToken === UserType.DOCTOR
    ) {
      return userTypeFromToken as UserType;
    }

    // Default fallback
    throw new Error(`Unknown user type: ${userTypeFromToken}`);
  };

  const loadUserByType = async (userType: UserType): Promise<AuthUser> => {
    switch (userType) {
      case UserType.PATIENT:
        const patientResponse = await apiClient.get("/api/patients/profile");
        return transformPatientData(patientResponse.data.patient);

      case UserType.DOCTOR:
        const doctorResponse = await apiClient.get(
          "/api/doctors/doctor/profile"
        );
        return transformDoctorData(doctorResponse.data.doctor);

      case UserType.ADMIN:
        const adminResponse = await apiClient.get("/api/users/profile");
        return transformAdminData(adminResponse.data.user);

      default:
        throw new Error(`Unknown user type: ${userType}`);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<any> => {
    dispatch({ type: AuthActionType.LOGIN_START });

    try {
      const endpoint = getLoginEndpoint(credentials.userType);
      const response = await apiClient.post(endpoint, {
        email: credentials.email,
        password: credentials.password,
        ...(credentials.twoFactorCode && {
          twoFactorCode: credentials.twoFactorCode,
        }),
      });
      console.log("response ", response);

      // ✅ Handle password change requirement
      if (response.requiresPasswordChange) {
        console.log("Password change required, dispatching appropriate action");

        // ✅ Dispatch a proper action for password change state
        dispatch({
          type: AuthActionType.PASSWORD_CHANGE_REQUIRED,
          payload: {
            tempToken: response.tempToken,
            userType: credentials.userType,
            // requiresPasswordChange: true,
          },
        });

        // ✅ Return the data for the component to handle
        return {
          tempToken: response.tempToken,
          requiresPasswordChange: response.requiresPasswordChange,
          userType: credentials.userType,
        };
      }

      console.log("Response full:", response);
      console.log("Response:", response.data);

      // Handle dynamic response structure based on user type
      let token: string;
      let user: any;
      let expiresAt: Date;

      // Extract data based on user type and response structure
      switch (credentials.userType) {
        case UserType.PATIENT:
          if (response.data.patient) {
            token = response.data.token || response.data.data.accessToken;
            user = response.data.patient || response.data.user;
          } else {
            token = response.data.token || response.data.accessToken;
            user = response.data.patient || response.data.user;
          }
          break;

        case UserType.DOCTOR:
          if (response.data.data) {
            token = response.data.data.token || response.data.data.accessToken;
            user = response.data.data.doctor || response.data.data.user;
          } else {
            token = response.data.token || response.data.accessToken;
            user = response.data.doctor || response.data.user;
          }
          break;

        case UserType.ADMIN:
          if (response.data.data) {
            token = response.data.data.token || response.data.data.accessToken;
            user = response.data.data.admin || response.data.data.user;
          } else {
            token = response.data.token || response.data.accessToken;
            user = response.data.admin || response.data.user;
          }
          break;

        // default:
        //   throw new Error(`Unsupported user type: ${credentials.userType}`);
      }

      // Validate extracted data
      if (!token) {
        throw new Error("No authentication token received from server");
      }
      if (!user) {
        throw new Error("No user data received from server");
      }

      console.log("Token Received:", token);
      console.log("User Received:", user);

      expiresAt = tokenStorage.getTokenExpiration(token);

      // Store token
      tokenStorage.setToken(token);
      apiClient.setAuthToken(token);

      // ✅ Dispatch successful login
      dispatch({
        type: AuthActionType.LOGIN_SUCCESS,
        payload: {
          user,
          token,
          // userType: credentials.userType,
          // isAuthenticated: true,
          expiresAt,
        },
      });

      // ✅ Initialize auth and return success
      initializeAuth();

      return {
        success: true,
        user,
        token,
        userType: credentials.userType,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Login failed";

      dispatch({
        type: AuthActionType.LOGIN_FAILURE,
        payload: { error: errorMessage },
      });

      throw error;
    }
  };

  const changePassword = async (
    tempToken: string,
    newPassword: string,
    userType: UserType
  ): Promise<void> => {
    try {
      const endpoint = getChangePasswordEndpoint(userType);

      const response = await apiClient.post(endpoint, {
        tempToken,
        newPassword,
        // isForceChange: true,
      });

      console.log("response chaneg password", response);

      // Restore original token or remove it
      // if (originalToken) {
      //   apiClient.setAuthToken(originalToken);
      // } else {
      //   apiClient.removeAuthToken();
      // }

      dispatch({ type: AuthActionType.PASSWORD_CHANGE_SUCCESS });

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to change password";

      dispatch({
        type: AuthActionType.PASSWORD_CHANGE_FAILURE,
        payload: { error: errorMessage },
      });

      throw error;
    }
  };
  const getChangePasswordEndpoint = (userType: UserType): string => {
    switch (userType) {
      case UserType.PATIENT:
        return "/api/patients/change-password";
      case UserType.DOCTOR:
        return "/api/doctors/change-password";
      case UserType.ADMIN:
        return "/api/users/change-password";
      default:
        throw new Error(`Invalid user type: ${userType}`);
    }
  };
  const register = async (
    data: PatientRegistrationData | DoctorRegistrationData,
    userType: UserType
  ): Promise<void> => {
    dispatch({ type: AuthActionType.REGISTER_START });

    try {
      const endpoint = getRegistrationEndpoint(userType);
      const response = await apiClient.post(endpoint, data);

      const { token, user } = response.data.data;
      const expiresAt = tokenStorage.getTokenExpiration(token);

      // Store token
      tokenStorage.setToken(token);
      apiClient.setAuthToken(token);

      // Transform user data
      const transformedUser = transformUserData(user, userType);

      dispatch({
        type: AuthActionType.REGISTER_SUCCESS,
        payload: { user: transformedUser, token, expiresAt },
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      dispatch({
        type: AuthActionType.REGISTER_FAILURE,
        payload: { error: errorMessage },
      });
      throw error;
    }
  };

  const logout = (): void => {
    tokenStorage.removeToken();
    apiClient.removeAuthToken();
    dispatch({ type: AuthActionType.LOGOUT });
  };

  const refreshToken = async (): Promise<void> => {
    if (!state.token) return;

    dispatch({ type: AuthActionType.REFRESH_TOKEN_START });

    try {
      const response = await apiClient.post("/api/auth/refresh-token", {});
      const { token } = response.data.data;
      const expiresAt = tokenStorage.getTokenExpiration(token);

      tokenStorage.setToken(token);
      apiClient.setAuthToken(token);

      dispatch({
        type: AuthActionType.REFRESH_TOKEN_SUCCESS,
        payload: { token, expiresAt },
      });
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      dispatch({ type: AuthActionType.REFRESH_TOKEN_FAILURE });
    }
  };

  const loadUser = async (): Promise<void> => {
    if (!state.token) return;

    dispatch({ type: AuthActionType.LOAD_USER_START });

    try {
      const userTypeFromToken = tokenStorage.getUserTypeFromToken();
      if (!userTypeFromToken) throw new Error("No user type in token");

      // Normalize the user type
      const userType = normalizeUserType(userTypeFromToken);

      const user = await loadUserByType(userType);
      dispatch({ type: AuthActionType.LOAD_USER_SUCCESS, payload: { user } });
    } catch (error: any) {
      dispatch({
        type: AuthActionType.LOAD_USER_FAILURE,
        payload: { error: "Failed to load user" },
      });
    }
  };

  const updateUser = (userData: Partial<AuthUser>): void => {
    dispatch({ type: AuthActionType.UPDATE_USER, payload: { user: userData } });
  };

  const clearError = (): void => {
    dispatch({ type: AuthActionType.CLEAR_ERROR });
  };

  // ==================== UTILITY FUNCTIONS ====================

  const isSuperAdmin = (): boolean => {
    return isAdmin() && (state.user as AdminUser).role === "super_admin";
  };

  const isRegularAdmin = (): boolean => {
    return isAdmin() && (state.user as AdminUser).role === "admin";
  };

  const isModerator = (): boolean => {
    return isAdmin() && (state.user as AdminUser).role === "moderator";
  };

  const isStaff = (): boolean => {
    return isAdmin() && (state.user as AdminUser).role === "staff";
  };

  const isPatient = (): boolean => {
    return state.user?.type === UserType.PATIENT;
  };

  const isDoctor = (): boolean => {
    return state.user?.type === UserType.DOCTOR;
  };

  const isAdmin = (): boolean => {
    return state.user?.type === UserType.ADMIN;
  };

  const hasPermission = (permission: PermissionCategory): boolean => {
    if (!isAdmin()) return false;
    const adminUser = state.user as AdminUser;
    return (
      adminUser.role === "super_admin" ||
      adminUser.permissions.includes(permission)
    );
  };

  const hasAnyPermission = (permissions: PermissionCategory[]): boolean => {
    if (!isAdmin()) return false;
    const adminUser = state.user as AdminUser;
    if (adminUser.role === "super_admin") return true;
    return permissions.some((permission) =>
      adminUser.permissions.includes(permission)
    );
  };

  const hasRole = (role: string): boolean => {
    if (!isAdmin()) return false;
    const adminUser = state.user as AdminUser;
    return adminUser.role === role;
  };

  // Helper function to get admin role display name
  const getAdminRoleDisplayName = (): string => {
    if (!isAdmin()) return "User";
    const adminUser = state.user as AdminUser;

    switch (adminUser.role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "moderator":
        return "Moderator";
      case "staff":
        return "Staff";
      default:
        return "Admin";
    }
  };

  const getRedirectPath = (): string => {
    if (!state.user) return "/auth/login";

    switch (state.user.type) {
      case UserType.PATIENT:
        return ROUTES.PATIENT.DASHBOARD;
      case UserType.DOCTOR:
        return ROUTES.DOCTOR.DASHBOARD;
      case UserType.ADMIN:
        return ROUTES.ADMIN.DASHBOARD;
      default:
        return "/auth/login";
    }
  };

  const checkSessionValidity = (): boolean => {
    if (!state.sessionExpiresAt) return false;
    return Date.now() < state.sessionExpiresAt.getTime();
  };

  // Type guards
  const asPatient = (): PatientUser | null => {
    return isPatient() ? (state.user as PatientUser) : null;
  };

  const asDoctor = (): DoctorUser | null => {
    return isDoctor() ? (state.user as DoctorUser) : null;
  };

  const asAdmin = (): AdminUser | null => {
    return isAdmin() ? (state.user as AdminUser) : null;
  };

  // ==================== HELPER FUNCTIONS ====================

  const getLoginEndpoint = (userType: UserType): string => {
    switch (userType) {
      case UserType.PATIENT:
        return "/api/patients/login";
      case UserType.DOCTOR:
        return "/api/doctors/login";
      case UserType.ADMIN:
        return "/api/users/login";
      default:
        throw new Error(`Invalid user type: ${userType}`);
    }
  };

  const getRegistrationEndpoint = (userType: UserType): string => {
    switch (userType) {
      case UserType.PATIENT:
        return "/api/patients/register";
      case UserType.DOCTOR:
        return "/api/doctors/register";
      default:
        throw new Error(
          `Registration not supported for user type: ${userType}`
        );
    }
  };

  const transformUserData = (userData: any, userType: UserType): AuthUser => {
    switch (userType) {
      case UserType.PATIENT:
        return transformPatientData(userData);
      case UserType.DOCTOR:
        return transformDoctorData(userData);
      case UserType.ADMIN:
        return transformAdminData(userData);
      default:
        throw new Error(`Unknown user type: ${userType}`);
    }
  };

  const transformPatientData = (patientData: any): PatientUser => {
    console.log("Patient Data:", patientData);
    return {
      type: UserType.PATIENT,
      id: patientData._id,
      patientId: patientData.patientId,
      email: patientData.contactInfo.email,
      firstName: patientData.personalInfo.firstName,
      lastName: patientData.personalInfo.lastName,
      fullName: patientData.fullName,
      isActive: patientData.isActive,
      isVerified: patientData.authentication?.isVerified || false,
      age: patientData.age,
      bloodGroup: patientData.personalInfo.bloodGroup,
      communicationMethod:
        patientData.preferences?.communicationMethod || "email",
      registrationSource: patientData.registrationSource,
    };
  };

  const transformDoctorData = (doctorData: any): DoctorUser => {
    return {
      type: UserType.DOCTOR,
      id: doctorData._id,
      doctorId: doctorData.doctorId,
      email: doctorData.personalInfo.email,
      firstName: doctorData.personalInfo.firstName,
      lastName: doctorData.personalInfo.lastName,
      fullName: doctorData.fullName,
      isActive: doctorData.isActive,
      isVerified: doctorData.authentication?.isVerified || false,
      specialization: doctorData.professionalInfo.specialization,
      licenseNumber: doctorData.professionalInfo.licenseNumber,
      experience: doctorData.professionalInfo.experience,
      rating: doctorData.statistics.rating,
      department: doctorData.professionalInfo.department,
      isVerifiedByAdmin: doctorData.isVerifiedByAdmin || false,
    };
  };

  const transformAdminData = (adminData: any): AdminUser => {
    return {
      type: UserType.ADMIN, // Always set type as ADMIN for admin users
      id: adminData._id,
      userId: adminData.id,
      email: adminData.email,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      fullName: adminData.fullName,
      isActive: adminData.isActive,
      role: adminData.role, // This will be super_admin, admin, moderator, or staff
      permissions: adminData.permissions || [],
    };
  };

  // ==================== CONTEXT VALUE ====================

  const contextValue: AuthContextValue = {
    state,
    login,
    logout,
    register,
    refreshToken,
    loadUser,
    updateUser,
    clearError,
    changePassword,
    isPatient,
    isDoctor,
    isAdmin,
    hasPermission,
    hasAnyPermission,
    hasRole,
    getRedirectPath,
    checkSessionValidity,
    asPatient,
    asDoctor,
    asAdmin,
    isSuperAdmin,
    isRegularAdmin,
    isModerator,
    isStaff,
    getAdminRoleDisplayName,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// ==================== CUSTOM HOOK ====================

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// ==================== ADDITIONAL HOOKS ====================

// Hook for admin role checking
export const useAdminRole = () => {
  const {
    isAdmin,
    isSuperAdmin,
    isRegularAdmin,
    isModerator,
    isStaff,
    getAdminRoleDisplayName,
    hasRole,
  } = useAuth();

  return {
    isAdmin,
    isSuperAdmin,
    isRegularAdmin,
    isModerator,
    isStaff,
    getAdminRoleDisplayName,
    hasRole,
  };
};

// Hook for patient-specific functionality
export const usePatientAuth = (): PatientUser | null => {
  const { asPatient } = useAuth();
  return asPatient();
};

// Hook for doctor-specific functionality
export const useDoctorAuth = (): DoctorUser | null => {
  const { asDoctor } = useAuth();
  return asDoctor();
};

// Hook for admin-specific functionality
export const useAdminAuth = (): AdminUser | null => {
  const { asAdmin } = useAuth();
  return asAdmin();
};

// Hook for permission checking
export const usePermissions = () => {
  const { hasPermission, hasAnyPermission, hasRole, isAdmin } = useAuth();
  return { hasPermission, hasAnyPermission, hasRole, isAdmin };
};

// Hook for auth state
export const useAuthState = () => {
  const { state } = useAuth();
  return state;
};
