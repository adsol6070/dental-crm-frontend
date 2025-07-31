// services/api/adminApi.ts

import { API_ENDPOINTS } from "@/config/api.config";
import { httpClient } from "../httpClient";
import {
  Patient,
  PatientPayload,
  PaginatedPatientsResponse,
  PatientStatusPayload,
  GetAdminProfileResponse,
  DoctorVerificationPayload,
  TwoFAData,
  TwoFAApiResponse,
  disablePayload,
  changePassPayload,
  UserCreatePayload,
  UserCreatedApiResponse,
  genericApiResponse,
  AdminUser,
  UsersListApiResponse,
  UserStatusPayload,
  ApiResponse,
} from "./adminTypes";
import { Doctor, DoctorsApiResponse } from "../doctor/doctorTypes";

const token = localStorage.getItem("auth_token");
export const adminApi = {
  getPatientsWithMeta: async (): Promise<
    ApiResponse<PaginatedPatientsResponse>
  > => {
    const response = await httpClient.get<
      ApiResponse<PaginatedPatientsResponse>
    >(API_ENDPOINTS.ADMIN.GET_ALL, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return response.data;
  },

  getPatientById: async (id: string): Promise<Patient> => {
    const response = await httpClient.get<ApiResponse<Patient>>(
      API_ENDPOINTS.ADMIN.GET_BY_ID(id),
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data.data;
  },

  getAdminProfile: async (): Promise<GetAdminProfileResponse> => {
    const response = await httpClient.get<GetAdminProfileResponse>(
      API_ENDPOINTS.ADMIN.GET_ADMIN_PROFILE,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    return response.data;
  },

  updatePatient: async (
    id: string,
    data: Partial<PatientPayload>
  ): Promise<Patient> => {
    const response = await httpClient.patch<ApiResponse<Patient>>(
      API_ENDPOINTS.ADMIN.UPDATE(id),
      data,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data.data;
  },

  updatePatientStatus: async (
    id: string,
    data: Partial<PatientStatusPayload>
  ): Promise<Patient> => {
    const response = await httpClient.patch<ApiResponse<Patient>>(
      API_ENDPOINTS.ADMIN.PATIENT_STATUS_UPDATE(id),
      data,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data.data;
  },

  deletePatient: async (id: string): Promise<{ message: string }> => {
    const response = await httpClient.delete<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.ADMIN.DELETE(id),
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data.data;
  },

  getDoctors: async (): Promise<Doctor[]> => {
    const response = await httpClient.get<ApiResponse<DoctorsApiResponse>>(
      API_ENDPOINTS.ADMIN.GET_ALL_DOCTORS,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    console.log("Response:", response);
    return response.data.data.doctors;
  },

  getDoctorById: async (id: string): Promise<Doctor> => {
    const response = await httpClient.get<ApiResponse<Doctor>>(
      API_ENDPOINTS.ADMIN.GET_DOCTOR_BY_ID(id),
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data.data;
  },

  verifyDoctor: async (
    id: string,
    data: Partial<DoctorVerificationPayload>
  ): Promise<Doctor> => {
    const response = await httpClient.patch<ApiResponse<Doctor>>(
      API_ENDPOINTS.ADMIN.VERIFY_DOCTOR(id),
      data,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data.data;
  },

  deleteDoctor: async (id: string): Promise<{ message: string }> => {
    const response = await httpClient.delete<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.ADMIN.DELETE_DOCTOR(id),
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data.data;
  },

  enableTwoFA: async (): Promise<TwoFAData> => {
    const response = await httpClient.post<TwoFAApiResponse>(
      API_ENDPOINTS.ADMIN.ENABLE_2FA,
      {},
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data.data;
  },

  verifyTwoFA: async (verifyToken: string): Promise<genericApiResponse> => {
    const response = await httpClient.post<genericApiResponse>(
      API_ENDPOINTS.ADMIN.VERIFY_TWOFA,
      { token: verifyToken },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data;
  },

  disableTwoFA: async (data: disablePayload): Promise<genericApiResponse> => {
    const response = await httpClient.post<genericApiResponse>(
      API_ENDPOINTS.ADMIN.DISABLE_TWOFA,
      data,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data;
  },

  changePassword: async (
    data: changePassPayload
  ): Promise<genericApiResponse> => {
    const response = await httpClient.put<genericApiResponse>(
      API_ENDPOINTS.ADMIN.CHANGE_PASSWORD,
      data,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data;
  },

    createUser: async (
    data: UserCreatePayload
  ): Promise<UserCreatedApiResponse> => {
    const response = await httpClient.post<UserCreatedApiResponse>(
      API_ENDPOINTS.ADMIN.CREATE_USER,
      data,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data;
  },

  getAllUsers: async (): Promise<UsersListApiResponse> => {
  const response = await httpClient.get<UsersListApiResponse>(
    API_ENDPOINTS.ADMIN.GET_ALL_USERS,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    }
  );
  return response.data;
},

updateUserStatus: async (
    id: string,
    data: UserStatusPayload
  ): Promise<AdminUser> => {
    const response = await httpClient.put<ApiResponse<AdminUser>>(
      API_ENDPOINTS.ADMIN.USER_STATUS_UPDATE(id),
      data,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data.data;
  },

  deleteUser: async (id: string): Promise<{ message: string }> => {
    const response = await httpClient.delete<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.ADMIN.DELETE_USER(id),
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data.data;
  },
};
