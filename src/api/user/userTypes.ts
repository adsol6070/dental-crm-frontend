export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPayload {
  name: string;
  email?: string;
  password?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
