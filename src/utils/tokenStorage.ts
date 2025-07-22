import { UserType } from "@/context/AuthContext";

// utils/tokenStorage.ts
export const tokenStorage = {
  setToken: (token: string): void => {
    localStorage.setItem("auth_token", token);
  },

  getToken: (): string | null => {
    return localStorage.getItem("auth_token");
  },

  setTempToken: (token: string): void => {
    localStorage.setItem("temp_token", token);
  },

  getTempToken: (): string | null => {
    return localStorage.getItem("temp_token");
  },

  removeToken: (): void => {
    localStorage.removeItem("auth_token");
  },

  isTokenExpired: (): boolean => {
    const token = tokenStorage.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  },

  getTokenExpiration: (token: string): Date => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return new Date();
    }
  },

  getUserTypeFromToken: (): UserType | null => {
    const token = tokenStorage.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.type as UserType;
    } catch {
      return null;
    }
  },
};
