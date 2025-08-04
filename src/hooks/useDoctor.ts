// hooks/useDoctors.ts

import { doctorApi } from "@/api/doctor/doctorApi";
import {
  DoctorPayload,
  DoctorProfileResponse,
  UnavailableDate,
  AddUnavailableDatePayload,
  AddUnavailableDateRangePayload,
  RemoveUnavailableDatePayload,
  UnavailableDateSummaryApiResponse,
  UpdateFeesBody,
  UpdateFeesApiResponse,
  AddBreakPayload,
  Availability,
  Schedule,
  ProfessionalInfoPayload,
  PersonalInfoPayload,
  CompleteUpdateProfilePayload,
  ApiResponse,
  AddConsultationPayload,
  PatientConsultationHistoryResponse,
  PublicDoctorListApiResponse,
} from "@/api/doctor/doctorTypes";
import {
  GetAllDoctorAppointmentsResponse,
  GetDoctorAppointmentByIdResponse,
  UpdateAppointmentStatusPayload,
} from "@/api/appointment/appointmentTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-hot-toast";

const useCustomMutation = <T, V>(
  mutationFn: (variables: V) => Promise<T>,
  queryKey: string[],
  successMessage: string
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: unknown) => {
      let message = "Something went wrong!";

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const serverMessage = error.response?.data?.message;

        switch (status) {
          case 400:
            message = serverMessage || "Bad request. Please check your input.";
            break;
          case 401:
            message = "Unauthorized. Please log in again.";
            break;
          case 403:
            message = "Access denied. You do not have permission.";
            break;
          case 404:
            message = "Resource not found.";
            break;
          case 409:
            message = serverMessage || "Conflict. Duplicate record detected.";
            break;
          case 422:
            message =
              serverMessage || "Validation failed. Please correct the form.";
            break;
          case 429:
            message = "Too many requests. Please slow down.";
            break;
          case 500:
            message = "Server error. Please try again later.";
            break;
          default:
            message = serverMessage || "An unexpected error occurred.";
            break;
        }

        console.error("API Error:", {
          status,
          serverMessage,
          details: error.response?.data,
        });
      } else {
        console.error("Unknown Error:", error);
      }

      toast.error(message);
    },
  });
};

export const useCreateDoctor = () =>
  useCustomMutation(
    (doctorData: DoctorPayload) => doctorApi.createDoctor(doctorData),
    ["doctors"],
    "Doctor created successfully!"
  );

export const useDoctorProfile = () =>
  useQuery<DoctorProfileResponse, Error>({
    queryKey: ["doctor"],
    queryFn: () => doctorApi.getDoctorProfile(),
    select: (response) => response,
  });

export const useUpdateDoctor = () =>
  useCustomMutation(
    ({ id, doctorData }: { id: string; doctorData: Partial<DoctorPayload> }) =>
      doctorApi.updateDoctor(id, doctorData),
    ["doctors"],
    "Doctor updated successfully!"
  );

export const useUnavailableDates = () =>
  useQuery<UnavailableDate[], Error>({
    queryKey: ["unavailable-dates"],
    queryFn: () => doctorApi.getUnavailableDates(),
  });

export const useUnavailableDatesSummary = () =>
  useQuery<UnavailableDateSummaryApiResponse, Error>({
    queryKey: ["unavailable-dates-summary"],
    queryFn: () => doctorApi.getUnavailableDatesSummary(),
  });

export const useCreateUnavailableDate = () =>
  useCustomMutation(
    (data: AddUnavailableDatePayload) => doctorApi.createUnavailableDate(data),
    ["unavailable-dates"],
    "Unavailable date added successfully!"
  );

export const useCreateUnavailableDateRange = () =>
  useCustomMutation(
    (data: AddUnavailableDateRangePayload) =>
      doctorApi.createUnavailableDateRange(data),
    ["unavailable-dates"],
    "Unavailable date range added!"
  );

export const useBulkDeleteUnavailableDate = () =>
  useCustomMutation(
    (data: RemoveUnavailableDatePayload) =>
      doctorApi.bulkDeleteUnavailableDate(data),
    ["unavailable-dates"],
    "Unavailable dates updated successfully!"
  );

export const useDeleteUnavailableDates = () =>
  useCustomMutation(
    (dateId: string) => doctorApi.deleteUnavailableDates(dateId),
    ["unavailable-dates"],
    "Unavailable dates removed successfully!"
  );

export const useDoctorFees = () =>
  useQuery<UpdateFeesApiResponse, Error>({
    queryKey: ["doctor"],
    queryFn: () => doctorApi.getDoctorFees(),
    select: (response) => response,
  });

export const useUpdateDoctorFees = () =>
  useCustomMutation(
    (data: UpdateFeesBody) => doctorApi.updateDoctorFees(data),
    ["doctor"],
    "Doctor fees updated successfully!"
  );

export const useUpdateDoctorProfile = () =>
  useCustomMutation(
    (data: CompleteUpdateProfilePayload) =>
      doctorApi.updateDoctorProfileComplete(data),
    ["doctor"],
    "Doctor profile updated successfully!"
  );

export const useUpdateDoctorContactInfo = () =>
  useCustomMutation(
    (contactData: PersonalInfoPayload) =>
      doctorApi.updateDoctorProfileContact(contactData),
    ["doctorProfile"],
    "Contact profile updated successfully!"
  );

export const useUpdateDoctorProfessionalInfo = () =>
  useCustomMutation(
    (professionalData: ProfessionalInfoPayload) =>
      doctorApi.updateDoctorProfileProfessional(professionalData),
    ["doctorProfile"],
    "Professional profile updated successfully!"
  );

export const useAddBreakTime = () =>
  useCustomMutation(
    (breakData: AddBreakPayload) => doctorApi.addBreakTime(breakData),
    ["doctorSchedule"],
    "Break time added successfully!"
  );

export const useRemoveBreakTime = () =>
  useCustomMutation(
    (breakId: string) => doctorApi.removeBreakTime(breakId),
    ["doctorSchedule"],
    "Break time removed successfully!"
  );

export const useDoctorSchedule = () =>
  useQuery({
    queryKey: ["doctorSchedule"],
    queryFn: () => doctorApi.getSchedule(),
    enabled: true,
    select: (data) => data,
  });

export const useUpdateAvailability = () =>
  useCustomMutation(
    (availabilityData: Availability) =>
      doctorApi.updateAvailability(availabilityData),
    ["doctorSchedule"],
    "Availability updated successfully!"
  );

export const useUpdateSchedule = () =>
  useCustomMutation(
    (scheduleData: Schedule) => doctorApi.updateDoctorSchedule(scheduleData),
    ["doctorSchedule"],
    "Schedule updated successfully!"
  );

export const useDoctorDashboard = () =>
  useQuery({
    queryKey: ["doctorDashboard"],
    queryFn: () => doctorApi.getDashboard(),
    enabled: true,
    select: (data) => data,
  });

export const useDoctorAnalytics = () =>
  useQuery({
    queryKey: ["doctorAnalytics"],
    queryFn: () => doctorApi.getAnalytics(),
    enabled: true,
    select: (data) => data,
  });

export const useDoctorAppointments = () =>
  useQuery<GetAllDoctorAppointmentsResponse, Error>({
    queryKey: ["doctorAppointments"],
    queryFn: () => doctorApi.getDoctorAppointments(),
    select: (data) => data,
  });

export const useDoctorAppointmentById = (id: string) =>
  useQuery<GetDoctorAppointmentByIdResponse, Error>({
    queryKey: ["doctorAppointments", id],
    queryFn: () => doctorApi.getDoctorAppointmentById(id),
    enabled: !!id,
  });

export const useDoctorTodayAppointments = () =>
  useQuery<GetAllDoctorAppointmentsResponse, Error>({
    queryKey: ["doctorAppointments"],
    queryFn: () => doctorApi.getDoctorTodayAppointments(),
    select: (response) => response,
  });

export const useDoctorUpcomingAppointments = () =>
  useQuery<GetAllDoctorAppointmentsResponse, Error>({
    queryKey: ["doctorAppointments"],
    queryFn: () => doctorApi.getDoctorUpcomingAppointments(),
    select: (response) => response,
  });

export const useUpdateAppointmentConsultation = (id: string) =>
  useCustomMutation<
    ApiResponse<{ consultation: AddConsultationPayload }>,
    AddConsultationPayload
  >(
    (data: AddConsultationPayload) =>
      doctorApi.updateDoctorAppointmentConsultation(id, data),
    ["doctorAppointments", id],
    "Consultation updated successfully!"
  );

export const useUpdateAppointmentStatus = (id: string) =>
  useCustomMutation<
    ApiResponse<{ consultation: UpdateAppointmentStatusPayload }>,
    UpdateAppointmentStatusPayload
  >(
    (data: UpdateAppointmentStatusPayload) =>
      doctorApi.updateDoctorAppointmentStatus(id, data),
    ["doctorAppointments", id],
    "Appointment status updated successfully!"
  );

export const useDoctorPatients = () =>
  useQuery({
    queryKey: ["doctorPatients"],
    queryFn: () => doctorApi.getAllDoctorPatients(),
    select: (data) => data,
  });

export const useDoctorPatientConsultationHistory = (patientId: string) =>
  useQuery<PatientConsultationHistoryResponse, Error>({
    queryKey: ["doctorPatientConsultationHistory", patientId],
    queryFn: () => doctorApi.getDoctorPatientConsultationHistory(patientId),
    enabled: !!patientId,
    select: (data) => data,
  });


export const usePublicDoctorList = () =>
  useQuery<PublicDoctorListApiResponse, Error>({
    queryKey: ["publicDoctorList"],
    queryFn: () => doctorApi.getPublicDoctorList(),
    select: (data) => data,
  });