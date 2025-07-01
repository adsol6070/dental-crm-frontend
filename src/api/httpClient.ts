import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL } from "../config/api.config";

const AUTH_EXCLUDED_ENDPOINTS = ["/auth/login", "/auth/register"];

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");

    if (token && config.url && !AUTH_EXCLUDED_ENDPOINTS.includes(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;

    if (!error.response) {
      console.error("Network error. Check your internet connection.");
      return Promise.reject({ message: "Network Error" });
    }

    if (status === 400) {
      console.error("Bad request: Please check the sent data.");
    } else if (status === 401) {
    } else if (status === 403) {
      console.error("Access denied: You do not have permission.");
    } else if (status === 404) {
      console.error("Request resource not found.");
    } else if (status === 429) {
      console.warn("Too many requests: You are being rate-limited.");
    } else if (status === 500) {
      console.error("Server error. Please try again later.");
    }

    return Promise.reject(error);
  }
);
