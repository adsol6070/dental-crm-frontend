// services/api/appointmentApi.ts

import { API_ENDPOINTS } from "@/config/api.config";
import { httpClient } from "../httpClient";
import {
  CreateAppointmentPayload,
  AppointmentListResponse,
  AppointmentBookingResponse,
  GetAppointmentByIdResponse,
  ApiResponse,
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
    >(API_ENDPOINTS.APPOINTMENT.BOOK_APPOINTMENT, data,  {
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
  getAppointmentById: async (id: string): Promise<GetAppointmentByIdResponse> => {
    const response = await httpClient.get<GetAppointmentByIdResponse>(
      API_ENDPOINTS.APPOINTMENT.GET_BY_ID(id),
       {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },
};
