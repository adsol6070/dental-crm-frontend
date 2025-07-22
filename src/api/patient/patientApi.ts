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
} from "./patientTypes";

const token = localStorage.getItem("auth_token");
export const patientApi = {

  getPatientProfile: async (): Promise<GetPatientProfileResponse> => {

    const response = await httpClient.get<GetPatientProfileResponse>(
      API_ENDPOINTS.PATIENT.GET_PATIENT_PROFILE,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    return response.data;
  },

  getPatientAppointments: async (): Promise<GetPatientAppointmentsResponse> => {
    const token = localStorage.getItem("auth_token");

    const response = await httpClient.get<GetPatientAppointmentsResponse>(
      API_ENDPOINTS.PATIENT.GET_PATIENT_APPOINTMENTS,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    return response.data;
  },

  getPatientMedicalHistory: async (): Promise<GetMedicalRecordsResponse> => {
    const response = await httpClient.get<GetMedicalRecordsResponse>(
      API_ENDPOINTS.PATIENT.GET_PATIENT_MEDICAL_RECORDS,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    return response.data;
  },

  createPatient: async (data: PatientPayload): Promise<Patient> => {
    const response = await httpClient.post<ApiResponse<Patient>>(
      API_ENDPOINTS.PATIENT.CREATE,
      data,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data.data;
  },
};
