// services/api/patientApi.ts

import { API_ENDPOINTS } from "@/config/api.config";
import { httpClient } from "../httpClient";
import {
  Patient,
  PatientPayload,
  ApiResponse,
  GetPatientProfileResponse,
  GetPatientAppointmentsResponse,
  GetMedicalRecordsResponse,
  GetDashboardDataResponse,
} from "./patientTypes";
import { GetAppointmentDetailsResponse } from "../appointment/appointmentTypes";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("auth_token") ?? ""}`,
});

export const patientApi = {
  getPatientProfile: async (): Promise<GetPatientProfileResponse> => {
    const response = await httpClient.get<GetPatientProfileResponse>(
      API_ENDPOINTS.PATIENT.GET_PATIENT_PROFILE,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  getPatientAppointments: async (): Promise<GetPatientAppointmentsResponse> => {
    const response = await httpClient.get<GetPatientAppointmentsResponse>(
      API_ENDPOINTS.PATIENT.GET_PATIENT_APPOINTMENTS,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  getPatientMedicalHistory: async (): Promise<GetMedicalRecordsResponse> => {
    const response = await httpClient.get<GetMedicalRecordsResponse>(
      API_ENDPOINTS.PATIENT.GET_PATIENT_MEDICAL_RECORDS,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  createPatient: async (data: PatientPayload): Promise<Patient> => {
    const response = await httpClient.post<ApiResponse<Patient>>(
      API_ENDPOINTS.PATIENT.CREATE,
      data,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data.data;
  },

  getPatientDashboard: async (): Promise<GetDashboardDataResponse> => {
    const response = await httpClient.get<GetDashboardDataResponse>(
      API_ENDPOINTS.PATIENT.GET_PATIENT_DASHBOARD,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },
  getPatientAppointmentById: async (
    id: string
  ): Promise<GetAppointmentDetailsResponse> => {
    const response = await httpClient.get<
      ApiResponse<GetAppointmentDetailsResponse>
    >(API_ENDPOINTS.PATIENT.GET_PATIENT_APPOINTMENT_BY_ID(id), {
      headers: getAuthHeader(),
    });
    return response.data.data;
  },
};
