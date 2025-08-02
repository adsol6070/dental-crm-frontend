// services/api/appointmentApi.ts

import { API_ENDPOINTS } from "@/config/api.config";
import { httpClient } from "../httpClient";
import {
  CreateAppointmentPayload,
  AppointmentListResponse,
  AppointmentBookingResponse,
  GetAppointmentByIdResponse,
  ApiResponse,
  CancelAppointmentResponse,
  RescheduleAppointmentPayload,
  GetAppointmentDetailsResponse,
  UpdateAppointmentStatusPayload,
  UpdateAppointmentStatusResponse,
} from "./appointmentTypes";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("auth_token") ?? ""}`,
});

export const appointmentApi = {
  bookAppointment: async (
    data: CreateAppointmentPayload
  ): Promise<AppointmentBookingResponse> => {
    const response = await httpClient.post<
      ApiResponse<AppointmentBookingResponse>
    >(API_ENDPOINTS.APPOINTMENT.BOOK_APPOINTMENT, data, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  },

  getAllAppointment: async (): Promise<AppointmentListResponse> => {
    const response = await httpClient.get<AppointmentListResponse>(
      API_ENDPOINTS.APPOINTMENT.GET_ALL,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },
  getAppointmentById: async (
    id: string
  ): Promise<GetAppointmentByIdResponse> => {
    const response = await httpClient.get<GetAppointmentByIdResponse>(
      API_ENDPOINTS.APPOINTMENT.GET_BY_ID(id),
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },
  cancelAppointment: async (id: string): Promise<CancelAppointmentResponse> => {
    const response = await httpClient.delete<
      ApiResponse<CancelAppointmentResponse>
    >(API_ENDPOINTS.APPOINTMENT.CANCEL_APPOINTMENT(id), {
      headers: getAuthHeader(),
    });
    return response.data.data;
  },
  rescheduleAppointment: async (
    id: string,
    payload: RescheduleAppointmentPayload
  ): Promise<ApiResponse<GetAppointmentDetailsResponse>> => {
    const response = await httpClient.post<
      ApiResponse<GetAppointmentDetailsResponse>
    >(API_ENDPOINTS.APPOINTMENT.RESCHEDULE_APPOINTMENT(id), payload, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  updateAppointmentStatus: async (
    appointmentId: string,
    payload: UpdateAppointmentStatusPayload
  ): Promise<ApiResponse<UpdateAppointmentStatusResponse>> => {
    const response = await httpClient.patch<
      ApiResponse<UpdateAppointmentStatusResponse>
    >(API_ENDPOINTS.APPOINTMENT.UPDATE_APPOINTMENT_STATUS(appointmentId), payload, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};
