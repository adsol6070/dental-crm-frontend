// services/api/doctorApi.ts

import { API_ENDPOINTS } from "@/config/api.config";
import { httpClient } from "../httpClient";
import {
  Doctor,
  DoctorPayload,
  DoctorProfileResponse,
  ApiResponse,
  UnavailableDate,
  AddUnavailableDatePayload,
  AddUnavailableDateRangePayload,
  RemoveUnavailableDatePayload,
  UnavailableDateSummaryApiResponse,
  UnavailableDateApiResponse,
  UpdateFeesBody,
  UpdateFeesApiResponse,
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
  getUnavailableDates: async (): Promise<UnavailableDate[]> => {
    const response = await httpClient.get<UnavailableDateApiResponse>(
      API_ENDPOINTS.DOCTOR.GET_UNAVAILABLE_DATES,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data.data.unavailableDates;
  },

  // Get summary (e.g. count per month, etc. - depends on your backend)
  getUnavailableDatesSummary: async (): Promise<any> => {
    const response = await httpClient.get<UnavailableDateSummaryApiResponse>(
      API_ENDPOINTS.DOCTOR.GET_UNAVAILABLE_DATES_SUMMARY,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data.data.summary;
  },

  // Create single date
  createUnavailableDate: async (
    data: AddUnavailableDatePayload
  ): Promise<UnavailableDate> => {
    const response = await httpClient.post<ApiResponse<UnavailableDate>>(
      API_ENDPOINTS.DOCTOR.CREATE_UNAVAILABLE_DATES,
      data,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data.data;
  },

  // Create date range
  createUnavailableDateRange: async (
    data: AddUnavailableDateRangePayload
  ): Promise<UnavailableDate[]> => {
    const response = await httpClient.post<ApiResponse<UnavailableDate[]>>(
      API_ENDPOINTS.DOCTOR.CREATE_UNAVAILABLE_DATE_RANGE,
      data,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data.data;
  },

  // Bulk update on a specific date
  bulkDeleteUnavailableDate: async (
    data: RemoveUnavailableDatePayload
  ): Promise<UnavailableDate[]> => {
    const response = await httpClient.post<ApiResponse<UnavailableDate[]>>(
      API_ENDPOINTS.DOCTOR.BULK_DELETE_UNAVAILABLE_DATES,
      data,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data.data;
  },

  // delete
  deleteUnavailableDates: async (
    dateId: string,
  ): Promise<{ deletedCount: number }> => {
    const response = await httpClient.delete<
      ApiResponse<{ deletedCount: number }>
    >(API_ENDPOINTS.DOCTOR.DELETE_UNAVAILABLE_DATES(dateId), {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return response.data.data;
  },

  getDoctorFees: async (): Promise<any> => {
    const response = await httpClient.get<UpdateFeesApiResponse>(
      API_ENDPOINTS.DOCTOR.GET_DOCTOR_FEES,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data;
  },

  updateDoctorFees: async (
    data: UpdateFeesBody
  ): Promise<UpdateFeesApiResponse> => {
    const response = await httpClient.put<UpdateFeesApiResponse>(
      API_ENDPOINTS.DOCTOR.UPDATE_DOCTOR_FEES,
      data,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data;
  },
};
