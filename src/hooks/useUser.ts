import { userApi } from "@/api/user/userApi";
import { User, UserPayload } from "@/api/user/userTypes";
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
    onError: (error) => {
      toast.error("Something went wrong!");
      console.log("Error:", error);
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
