// services/api/doctorApi.ts

import { API_ENDPOINTS } from "@/config/api.config";
import { httpClient } from "../httpClient";
import {
  Doctor,
  DoctorPayload,
  DoctorProfileResponse,
  ApiResponse,
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

};
