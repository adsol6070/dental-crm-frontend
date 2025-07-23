// hooks/useDoctors.ts

import { doctorApi } from "@/api/doctor/doctorApi";
import {
  Doctor,
  DoctorPayload,
  DoctorProfileResponse,
  UnavailableDate,
  AddUnavailableDatePayload,
  AddUnavailableDateRangePayload,
  RemoveUnavailableDatePayload,
  UnavailableDateSummaryApiResponse,
  UpdateFeesBody,
  UpdateFeesApiResponse,
} from "@/api/doctor/doctorTypes";
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
    (dateId: string) =>
      doctorApi.deleteUnavailableDates(dateId),
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
    (data: UpdateFeesBody) => doctorApi.updateDoctorFees(data),
    ["doctor"],
    "Doctor fees updated successfully!"
  );
        export const useUpdateDoctorProfessionalInfo = () =>
  useCustomMutation(
    (data: UpdateFeesBody) => doctorApi.updateDoctorFees(data),
    ["doctor"],
    "Doctor fees updated successfully!"
  );
  
          export const useUpdateDoctorContactInfo = () =>
  useCustomMutation(
    (data: UpdateFeesBody) => doctorApi.updateDoctorFees(data),
    ["doctor"],
    "Doctor fees updated successfully!"
  );
  

   