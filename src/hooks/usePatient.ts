import { patientApi } from "@/api/patient/patientApi";
import {
  PatientPayload,
  GetPatientProfileResponse,
  GetPatientAppointmentsResponse,
  GetMedicalRecordsResponse,
} from "@/api/patient/patientTypes";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
            message = serverMessage || "Validation failed. Please correct the form.";
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

export const usePatientProfile = () =>
  useQuery<GetPatientProfileResponse, Error>({
    queryKey: ["patient"],
    queryFn: () => patientApi.getPatientProfile(),
    select: (response) => response,
  });
  
  export const usePatientRecords = () =>
  useQuery<GetMedicalRecordsResponse, Error>({
    queryKey: ["patient"],
    queryFn: () => patientApi.getPatientMedicalHistory(),
    select: (response) => response,
  });

export const usePatientAppointments = () =>
  useQuery<GetPatientAppointmentsResponse, Error>({
    queryKey: ["patient"],
    queryFn: () => patientApi.getPatientAppointments(),
    select: (response) => response,
  });

export const useCreatePatient = () =>
  useCustomMutation(
    (patientData: PatientPayload) => patientApi.createPatient(patientData),
    ["patients"],
    "Patient created successfully!"
  );
