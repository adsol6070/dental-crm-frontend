// services/api/doctorApi.ts

import { API_ENDPOINTS } from "@/config/api.config";
import { httpClient } from "../httpClient";
import {
  Doctor,
  DoctorPayload,
  DoctorDashboardApiResponse,
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
  AddBreakPayload,
  Availability,
  Schedule,
  AppointmentStatisticsApiResponse,
  CompleteUpdateProfilePayload,
  PersonalInfoPayload,
  ProfessionalInfoPayload,
  AddConsultationPayload,
  PaginatedPatientsResponse,
  PatientConsultationHistoryResponse,
  PublicDoctorListApiResponse,
} from "./doctorTypes";
import {
  GetAllDoctorAppointmentsResponse,
  GetDoctorAppointmentByIdResponse,
  UpdateAppointmentStatusPayload,
} from "../appointment/appointmentTypes";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("auth_token") ?? ""}`,
});

export const doctorApi = {
  createDoctor: async (data: DoctorPayload): Promise<Doctor> => {
    const response = await httpClient.post<ApiResponse<Doctor>>(
      API_ENDPOINTS.DOCTOR.CREATE,
      data,
       {
        headers: getAuthHeader(),
      }
    );
    return response.data.data;
  },

  getDoctorProfile: async (): Promise<DoctorProfileResponse> => {
    const response = await httpClient.get<DoctorProfileResponse>(
      API_ENDPOINTS.DOCTOR.GET_DOCTOR_PROFILE,
       {
        headers: getAuthHeader(),
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
      data,
       {
        headers: getAuthHeader(),
      }
    );
    return response.data.data;
  },
  getUnavailableDates: async (): Promise<UnavailableDate[]> => {
    const response = await httpClient.get<UnavailableDateApiResponse>(
      API_ENDPOINTS.DOCTOR.GET_UNAVAILABLE_DATES,
       {
        headers: getAuthHeader(),
      }
    );
    return response.data.data.unavailableDates;
  },

  // Get summary (e.g. count per month, etc. - depends on your backend)
  getUnavailableDatesSummary: async (): Promise<any> => {
    const response = await httpClient.get<UnavailableDateSummaryApiResponse>(
      API_ENDPOINTS.DOCTOR.GET_UNAVAILABLE_DATES_SUMMARY,
     {
        headers: getAuthHeader(),
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
        headers: getAuthHeader(),
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
        headers: getAuthHeader(),
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
        headers: getAuthHeader(),
      }
    );
    return response.data.data;
  },

  // delete
  deleteUnavailableDates: async (
    dateId: string
  ): Promise<{ deletedCount: number }> => {
    const response = await httpClient.delete<
      ApiResponse<{ deletedCount: number }>
    >(API_ENDPOINTS.DOCTOR.DELETE_UNAVAILABLE_DATES(dateId),  {
        headers: getAuthHeader(),
      });
    return response.data.data;
  },

  getDoctorFees: async (): Promise<any> => {
    const response = await httpClient.get<UpdateFeesApiResponse>(
      API_ENDPOINTS.DOCTOR.GET_DOCTOR_FEES,
       {
        headers: getAuthHeader(),
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
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },
  addBreakTime: async (data: AddBreakPayload): Promise<ApiResponse<null>> => {
    const response = await httpClient.post<ApiResponse<null>>(
      API_ENDPOINTS.DOCTOR.ADD_BREAK, // <-- Add this endpoint in config
      data,
       {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  removeBreakTime: async (breakId: string): Promise<ApiResponse<null>> => {
    const response = await httpClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.DOCTOR.REMOVE_BREAK(breakId),
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  getSchedule: async (): Promise<ApiResponse<null>> => {
    const response = await httpClient.get<ApiResponse<null>>(
      API_ENDPOINTS.DOCTOR.GET_SCHEDULE,
    {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  updateAvailability: async (
    data: Availability
  ): Promise<ApiResponse<{ availability: Availability }>> => {
    const response = await httpClient.patch<
      ApiResponse<{ availability: Availability }>
    >(API_ENDPOINTS.DOCTOR.UPDATE_AVAILABILITY, data,  {
        headers: getAuthHeader(),
      });
    return response.data;
  },

  updateDoctorSchedule: async (
    scheduleData: Schedule
  ): Promise<ApiResponse<{ schedule: Schedule }>> => {
    const response = await httpClient.put<ApiResponse<{ schedule: Schedule }>>(
      API_ENDPOINTS.DOCTOR.UPDATE_SCHEDULE,
      scheduleData,
       {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  getDashboard: async (): Promise<DoctorDashboardApiResponse> => {
    const response = await httpClient.get<DoctorDashboardApiResponse>(
      API_ENDPOINTS.DOCTOR.GET_DOCTOR_DASHBOARD,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  getAnalytics: async (): Promise<AppointmentStatisticsApiResponse> => {
    const response = await httpClient.get<AppointmentStatisticsApiResponse>(
      API_ENDPOINTS.DOCTOR.GET_DOCTOR_ANALYTICS,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },
  updateDoctorProfileComplete: async (
    completeData: CompleteUpdateProfilePayload
  ): Promise<ApiResponse<{ complete: CompleteUpdateProfilePayload }>> => {
    const response = await httpClient.patch<
      ApiResponse<{ complete: CompleteUpdateProfilePayload }>
    >(API_ENDPOINTS.DOCTOR.UPDATE_DOCTOR_PROFILE, completeData,  {
        headers: getAuthHeader(),
      });

    return response.data;
  },
  updateDoctorProfileContact: async (
    contactData: PersonalInfoPayload
  ): Promise<ApiResponse<{ contact: PersonalInfoPayload }>> => {
    const response = await httpClient.patch<
      ApiResponse<{ contact: PersonalInfoPayload }>
    >(API_ENDPOINTS.DOCTOR.UPDATE_DOCTOR_PROFILE_CONTACT_INFO, contactData,  {
        headers: getAuthHeader(),
      });

    return response.data;
  },
  updateDoctorProfileProfessional: async (
    professionalData: ProfessionalInfoPayload
  ): Promise<ApiResponse<{ professional: ProfessionalInfoPayload }>> => {
    const response = await httpClient.patch<
      ApiResponse<{ professional: ProfessionalInfoPayload }>
    >(
      API_ENDPOINTS.DOCTOR.UPDATE_DOCTOR_PROFILE_PROFESSIONAL_INFO,
      professionalData,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  },

  getDoctorAppointments: async (): Promise<GetAllDoctorAppointmentsResponse> => {
      const response = await httpClient.get<GetAllDoctorAppointmentsResponse>(
        API_ENDPOINTS.DOCTOR.GET_DOCTOR_APPOINTMENTS,
        {
        headers: getAuthHeader(),
      }
      );

      return response.data;
    },
  getDoctorAppointmentById: async (
    id: string
  ): Promise<GetDoctorAppointmentByIdResponse> => {
    const response = await httpClient.get<GetDoctorAppointmentByIdResponse>(
      API_ENDPOINTS.DOCTOR.GET_DOCTOR_APPOINTMENT_BY_ID(id),
     {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },
  getDoctorTodayAppointments: async (): Promise<GetAllDoctorAppointmentsResponse> => {
      const response = await httpClient.get<GetAllDoctorAppointmentsResponse>(
        API_ENDPOINTS.DOCTOR.GET_DOCTOR_TODAY_APPOINTMENTS,
        {
        headers: getAuthHeader(),
      }
      );

      return response.data;
    },
  getDoctorUpcomingAppointments: async (): Promise<GetAllDoctorAppointmentsResponse> => {
      const response = await httpClient.get<GetAllDoctorAppointmentsResponse>(
        API_ENDPOINTS.DOCTOR.GET_DOCTOR_UPCOMING_APPOINTMENTS,
       {
        headers: getAuthHeader(),
      }
      );

      return response.data;
    },

  updateDoctorAppointmentConsultation: async (
    id: string,
    consultationData: AddConsultationPayload
  ): Promise<ApiResponse<{ consultation: AddConsultationPayload }>> => {
    const response = await httpClient.post<
      ApiResponse<{ consultation: AddConsultationPayload }>
    >(API_ENDPOINTS.DOCTOR.UPDATE_CONSULTATION(id), consultationData,  {
        headers: getAuthHeader(),
      });
    return response.data;
  },
  updateDoctorAppointmentStatus: async (
    id: string,
    statusData: UpdateAppointmentStatusPayload
  ): Promise<ApiResponse<{ consultation: UpdateAppointmentStatusPayload }>> => {
    const response = await httpClient.patch<
      ApiResponse<{ consultation: UpdateAppointmentStatusPayload }>
    >(API_ENDPOINTS.DOCTOR.UPDATE_APPOINTMENT_STATUS(id), statusData,  {
        headers: getAuthHeader(),
      });
    return response.data;
  },
   getAllDoctorPatients: async (
  ): Promise<PaginatedPatientsResponse> => {
    const response = await httpClient.get<PaginatedPatientsResponse>(
      API_ENDPOINTS.DOCTOR.GET_ALL_DOCTOR_PATIENT,
       {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  getDoctorPatientConsultationHistory: async (
    patientId: string
  ): Promise<PatientConsultationHistoryResponse> => {
    const response = await httpClient.get<PatientConsultationHistoryResponse>(
      API_ENDPOINTS.DOCTOR.GET_DOCTOR_PATIENT_HISTORY(patientId),
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },
    getPublicDoctorList: async (
  ): Promise<PublicDoctorListApiResponse> => {
    const response = await httpClient.get<PublicDoctorListApiResponse>(
      API_ENDPOINTS.PUBLIC.GET_PUBLIC_DOCTOR_LIST,
    );
    return response.data;
  },
};
