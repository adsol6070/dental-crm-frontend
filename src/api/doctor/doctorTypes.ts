// types/doctor.ts

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ProfessionalInfo {
  specialization: string;
  qualifications: string[];
  experience: number; // in years
  licenseNumber: string;
  department?: string;
}

export interface WorkingDay {
  day: DayOfWeek;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  isWorking: boolean;
  _id: string;
  id: string;
}

export interface BreakTime {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  description?: string;
  _id: string;
  id: string;
}

export interface AddBreakPayload {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  description?: string;
}

export interface Schedule {
  workingDays: WorkingDay[];
  slotDuration: number; // in minutes
  breakTimes: BreakTime[];
}

export interface Availability {
  isAvailable: boolean;
  unavailableDates: string[]; // ISO date strings
  maxAppointmentsPerDay: number;
}

export interface Fees {
  consultationFee: number;
  followUpFee?: number;
  emergencyFee?: number;
}

export interface Statistics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments?: number;
  rating: number;
  reviewCount: number;
}
export interface Authentication {
  password: string;
}
export interface Doctor {
  _id: string;
  id: string;
  doctorId: string;
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  schedule: Schedule;
  availability: Availability;
  fees: Fees;
  statistics: Statistics;
  authentication: Authentication;
  isActive: boolean;
  isVerifiedByAdmin: boolean;
  fullName: string;
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorResponseData {
  doctor: Doctor;
}

export interface DoctorPayload {
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  schedule: Schedule;
  availability: Availability;
  fees: Fees;
  authentication: Authentication;
}

export interface DoctorsApiResponse {
  doctors: Doctor[];
}

export interface DetailApiResponse {
  doctor: Doctor;
  appointmentStats: any[];
}

export interface DoctorResponseData {
  doctor: Doctor;
}

export interface DoctorProfileResponse {
  success: boolean;
  data: DoctorResponseData;
}

export interface Availability {
  isAvailable: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
