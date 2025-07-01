import { API_ENDPOINTS } from "@/config/api.config";
import { httpClient } from "../httpClient";
import { User, UserPayload, ApiResponse } from "./userTypes";

export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await httpClient.get<ApiResponse<User[]>>(
      API_ENDPOINTS.USER.GET_ALL
    );
    return response.data.data;
  },
  getUserById: async (id: string): Promise<User> => {
    const response = await httpClient.get<ApiResponse<User>>(
      API_ENDPOINTS.USER.GET_BY_ID(id)
    );
    return response.data.data;
  },

  updateUser: async (id: string, data: UserPayload): Promise<User> => {
    const response = await httpClient.patch<User>(
      API_ENDPOINTS.USER.UPDATE(id),
      data
    );
    return response.data;
  },
  me: async (): Promise<any> => {
    const response = await httpClient.get<ApiResponse<{ user: User }>>(
      API_ENDPOINTS.USER.ME
    );
    return response.data.data.user;
  },
};
