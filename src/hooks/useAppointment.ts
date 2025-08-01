import { appointmentApi } from "@/api/appointment/appointmentApi";
import {
  AppointmentBookingResponse,
  CreateAppointmentPayload,
  GetAppointmentByIdResponse,
  AppointmentListResponse,
  CancelAppointmentResponse,
  RescheduleAppointmentPayload,
  ApiResponse,
  GetAppointmentDetailsResponse,
  UpdateAppointmentStatusPayload,
  UpdateAppointmentStatusResponse,
} from "@/api/appointment/appointmentTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-hot-toast";

// 🔁 Shared mutation handler
const useCustomAppointmentMutation = <T, V>(
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
            message = serverMessage || "Invalid input.";
            break;
          case 401:
            message = "Unauthorized. Please login.";
            break;
          case 403:
            message = "Access denied.";
            break;
          case 404:
            message = "Appointment service not found.";
            break;
          case 409:
            message = serverMessage || "Duplicate appointment.";
            break;
          case 422:
            message = serverMessage || "Validation failed.";
            break;
          case 429:
            message = "Rate limit exceeded.";
            break;
          case 500:
            message = "Internal server error.";
            break;
          default:
            message = serverMessage || "Unexpected error occurred.";
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

// 📌 Book appointment
export const useBookAppointment = () =>
  useCustomAppointmentMutation<
    AppointmentBookingResponse,
    CreateAppointmentPayload
  >(
    (data) => appointmentApi.bookAppointment(data),
    ["appointments"],
    "Appointment booked successfully!"
  );

// 📌 Get all appointments
export const useAllAppointments = () =>
  useQuery<AppointmentListResponse, Error>({
    queryKey: ["appointments"],
    queryFn: () => appointmentApi.getAllAppointment(),
    enabled: true,
    select: (data) => data,
  });

export const useAppointmentById = (id: string) =>
  useQuery<GetAppointmentByIdResponse, Error>({
    queryKey: ["appointment", id],
    queryFn: () => appointmentApi.getAppointmentById(id),
    enabled: !!id,
  });

export const useCancelAppointment = () =>
  useCustomAppointmentMutation<CancelAppointmentResponse, string>(
    (id) => appointmentApi.cancelAppointment(id),
    ["appointments"],
    "Appointment cancelled successfully!"
  );

export const useRescheduleAppointment = () =>
  useCustomAppointmentMutation<
    ApiResponse<GetAppointmentDetailsResponse>,
    { id: string; data: RescheduleAppointmentPayload }
  >(
    ({ id, data }) => appointmentApi.rescheduleAppointment(id, data),
    ["appointments"],
    "Appointment rescheduled successfully!"
  );

export const useUpdateAppointmentStatus = (id: string) =>
  useCustomAppointmentMutation<
    ApiResponse<UpdateAppointmentStatusResponse>,
    UpdateAppointmentStatusPayload
  >(
    (data: UpdateAppointmentStatusPayload) =>
      appointmentApi.updateAppointmentStatus(id, data),
    ["appointments", id],
    "Appointment status updated successfully!"
  );
