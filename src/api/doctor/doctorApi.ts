// services/api/doctorApi.ts

import { API_ENDPOINTS } from "@/config/api.config";
import { httpClient } from "../httpClient";
import {
  Doctor,
  DoctorPayload,
  DoctorProfileResponse,
  ApiResponse,
  AddBreakPayload,
  Availability,
  Schedule,
} from "./doctorTypes";

const token = localStorage.getItem("auth_token");
export const doctorApi = {
  createDoctor: async (data: DoctorPayload): Promise<Doctor> => {
    const response = await httpClient.post<ApiResponse<Doctor>>(
      API_ENDPOINTS.DOCTOR.CREATE,
      data
    );
    return response.data.data;
  },

  getDoctorProfile: async (): Promise<DoctorProfileResponse> => {
    const response = await httpClient.get<DoctorProfileResponse>(
      API_ENDPOINTS.DOCTOR.GET_DOCTOR_PROFILE,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    return response.data;
  },

  updateDoctor: async (
    id: string,
    data: Partial<DoctorPayload>
  ): Promise<Doctor> => {
    const response = await httpClient.patch<ApiResponse<Doctor>>(
      API_ENDPOINTS.DOCTOR.UPDATE(id),
      data
    );
    return response.data.data;
  },

  addBreakTime: async (data: AddBreakPayload): Promise<ApiResponse<null>> => {
    const response = await httpClient.post<ApiResponse<null>>(
      API_ENDPOINTS.DOCTOR.ADD_BREAK, // <-- Add this endpoint in config
      data,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data;
  },

  removeBreakTime: async (breakId: string): Promise<ApiResponse<null>> => {
    const response = await httpClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.DOCTOR.REMOVE_BREAK(breakId),
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data;
  },

  getSchedule: async (): Promise<ApiResponse<null>> => {
    const response = await httpClient.get<ApiResponse<null>>(
      API_ENDPOINTS.DOCTOR.GET_SCHEDULE,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data;
  },

  updateAvailability: async (
    data: Availability
  ): Promise<ApiResponse<{ availability: Availability }>> => {
    const response = await httpClient.patch<
      ApiResponse<{ availability: Availability }>
    >(API_ENDPOINTS.DOCTOR.UPDATE_AVAILABILITY, data, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return response.data;
  },

  updateDoctorSchedule: async (
    scheduleData: Schedule
  ): Promise<ApiResponse<{ schedule: Schedule }>> => {
    const response = await httpClient.put<ApiResponse<{ schedule: Schedule }>>(
      API_ENDPOINTS.DOCTOR.UPDATE_SCHEDULE, // Ensure this is defined in your config
      scheduleData,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    return response.data;
  },
};
