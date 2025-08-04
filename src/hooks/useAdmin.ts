import { adminApi } from "@/api/admin/adminApi";
import {
  Patient,
  PatientPayload,
  PaginatedPatientsResponse,
  PatientStatusPayload,
  disablePayload,
  GetAdminProfileResponse,
  changePassPayload,
  DoctorVerificationPayload,
  UserStatusPayload,
  UserCreatePayload,
  ApiResponse,
} from "@/api/admin/adminTypes";
import { Doctor } from "@/api/doctor/doctorTypes";
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

// ✅ Modified usePatients to return both data and pagination
export const usePatients = () =>
  useQuery<ApiResponse<PaginatedPatientsResponse>, Error>({
    queryKey: ["patients"],
    queryFn: () => adminApi.getPatientsWithMeta(),
    select: (response) => response, // Return entire response including pagination
  });

export const usePatientById = (id: string) =>
  useQuery<Patient, Error>({
    queryKey: ["patient", id],
    queryFn: () => adminApi.getPatientById(id),
    enabled: !!id,
  });

export const useAdminProfile = () =>
  useQuery<GetAdminProfileResponse, Error>({
    queryKey: ["admin"],
    queryFn: () => adminApi.getAdminProfile(),
    select: (response) => response,
  });

export const useUpdatePatient = () =>
  useCustomMutation(
    ({
      id,
      patientData,
    }: {
      id: string;
      patientData: Partial<PatientPayload>;
    }) => adminApi.updatePatient(id, patientData),
    ["patients"],
    "Patient updated successfully!"
  );

export const useUpdatePatientStatus = () =>
  useCustomMutation(
    ({
      id,
      patientStatusData,
    }: {
      id: string;
      patientStatusData: Partial<PatientStatusPayload>;
    }) => adminApi.updatePatientStatus(id, patientStatusData),
    ["patients"],
    "Patient status updated successfully!"
  );

export const useDeletePatient = () =>
  useCustomMutation(
    (id: string) => adminApi.deletePatient(id),
    ["patients"],
    "Patient deleted successfully!"
  );

export const useDoctors = () =>
  useQuery<Doctor[], Error>({
    queryKey: ["doctors"],
    queryFn: adminApi.getDoctors,
  });

export const useDoctorById = (id: string) =>
  useQuery<Doctor, Error>({
    queryKey: ["doctor", id],
    queryFn: () => adminApi.getDoctorById(id),
    enabled: !!id,
  });

export const useVerifyDoctor = () =>
  useCustomMutation(
    ({
      id,
      doctorVerificationData,
    }: {
      id: string;
      doctorVerificationData: Partial<DoctorVerificationPayload>;
    }) => adminApi.verifyDoctor(id, doctorVerificationData),
    ["doctor"],
    "Doctor verified successfully!"
  );

export const useDeleteDoctor = () =>
  useCustomMutation(
    (id: string) => adminApi.deleteDoctor(id),
    ["doctors"],
    "Doctor deleted successfully!"
  );

export const useEnableTwoFA = () =>
  useCustomMutation(
    (_: void) => adminApi.enableTwoFA(),
    ["admin"],
    "2FA code fecthed successfully!"
  );

export const useVerifyTwoFA = () =>
  useCustomMutation(
    (token: string) => adminApi.verifyTwoFA(token),
    ["admin"],
    "2FA code fecthed successfully!"
  );

export const useDisableTwoFA = () =>
  useCustomMutation(
    (data: disablePayload) => adminApi.disableTwoFA(data),
    ["admin"],
    "2FA diabled successfully!"
  );

export const useChangePassword = () =>
  useCustomMutation(
    (data: changePassPayload) => adminApi.changePassword(data),
    ["admin"],
    "Password changed successfully!"
  );

export const useCreateUserAdmin = () =>
  useCustomMutation(
    (data: UserCreatePayload) => adminApi.createUser(data),
    ["adminUsers"],
    "User Created successfully!"
  );

export const useGetUserAdmin = () =>
  useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => adminApi.getAllUsers(),
    select: (data) => data,
  });

export const useUpdateUserStatus = () =>
  useCustomMutation(
    ({
      id,
      userStatusData,
    }: {
      id: string;
      userStatusData: UserStatusPayload;
    }) => adminApi.updateUserStatus(id, userStatusData),
    ["adminUsers"],
    "User status updated successfully!"
  );

export const useDeleteUser = () =>
  useCustomMutation(
    (id: string) => adminApi.deleteUser(id),
    ["adminUsers"],
    "User deleted successfully!"
  );
