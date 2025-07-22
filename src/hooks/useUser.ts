import { userApi } from "@/api/user/userApi";
import { User, UserPayload } from "@/api/user/userTypes";
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

export const useUsers = () =>
  useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: userApi.getUsers,
  });

export const useUserById = (id: string) =>
  useQuery<User, Error>({
    queryKey: ["user", id],
    queryFn: () => userApi.getUserById(id),
    enabled: !!id,
  });

// export const useCreateUser = () =>
//   useCustomMutation(
//     (userData: UserPayload) => userApi.createUser(userData),
//     ["users"],
//     "User created successfully!"
//   );

export const useUpdateUser = () =>
  useCustomMutation(
    ({ id, userData }: { id: string; userData: UserPayload }) =>
      userApi.updateUser(id, userData),
    ["users"],
    "Profile updated successfully!"
  );

export const useMe = () =>
  useQuery<User, Error>({
    queryKey: ["me"],
    queryFn: userApi.me,
  });

// export const useDeleteUser = () =>
//   useCustomMutation(
//     (id: string) => userApi.deleteUser(id),
//     ["users"],
//     "User deleted successfully!"
//   );
