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

export type UnavailableDateType =
  | "full-day"
  | "half-day"
  | "morning"
  | "afternoon";

export interface UnavailableDate {
  id: string;
  date: string; // "YYYY-MM-DD"
  reason: string;
  type: UnavailableDateType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddUnavailableDatePayload {
  date: string;
  reason: string;
  type: UnavailableDateType;
  notes?: string;
}

export interface AddUnavailableDateRangePayload {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  type: UnavailableDateType;
  notes?: string;
}

export interface BulkUnavailableDatePayload {
  dates: string[]; // Array of YYYY-MM-DD
  reason: string;
  type: UnavailableDateType;
  notes?: string;
}

export interface RemoveUnavailableDatePayload {
  dateIds: string[];
}
export interface UnavailableDateSummary {
  total: number;
  upcoming: number;
  past: number;
  thisMonth: number;
  byType: {
    [key in UnavailableDateType]?: number;
  };
  byReason: {
    [reason: string]: number;
  };
}

export interface UnavailableDateSummaryApiResponse {
  success: boolean;
  data: {
    summary: UnavailableDateSummary;
  };
}
export interface UnavailableDateApiResponse {
  success: boolean;
  message: string;
  data: {
    unavailableDates: UnavailableDate[];
  };
}

export interface UpdateFeesBody {
  consultationFee: number;
  followUpFee?: number;
  emergencyFee?: number;
}

export interface UpdateFeesApiResponse {
  success: boolean;
  message: string;
  data: {
    fees: Fees;
  };
}
export interface AddConsultationPayload {
  diagnosis: string;
  prescription?: string;
  notes?: string;
  followUpRequired?: boolean;
  followUpDate?: string | Date;
  recommendations?: string;
}
export interface AppointmentStatistics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  upcomingAppointments: number;
  completionRate: string;
  cancellationRate: string;
  totalPatients: number;
}

export interface AppointmentStatisticsApiResponse {
  success: boolean;
  data: {
    statistics: AppointmentStatistics;
  };
}
export interface DashboardStatistics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  rating: number;
  reviewCount: number;
}

export interface AppointmentSummary {
  [key: string]: any;
}

export interface PatientSummary {
  [key: string]: any;
}

export interface MonthlyStat {
  [key: string]: any;
}

export interface DoctorDashboardData {
  todayAppointments: AppointmentSummary[];
  upcomingAppointments: AppointmentSummary[];
  recentPatients: PatientSummary[];
  statistics: DashboardStatistics;
  monthlyStats: MonthlyStat[];
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
}

export interface DoctorDashboardApiResponse {
  success: boolean;
  data: DoctorDashboardData;
}

export interface PersonalInfoPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  profileImage: string;
}

export interface ProfessionalInfoPayload {
  specialization?: string;
  qualifications?: string[];
  experience?: number;
  licenseNumber?: string;
  department?: string;
}
export interface CompleteUpdateProfilePayload {
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  professionalInfo?: {
    specialization?: string;
    qualifications?: string[];
    experience?: number;
    licenseNumber?: string;
    department?: string;
  };
  schedule?: {
    workingDays?: WorkingDay[];
    slotDuration?: number;
    breakTimes?: BreakTime[];
  };
  availability?: {
    isAvailable?: boolean;
    unavailableDates?: string[];
    maxAppointmentsPerDay?: number;
  };
  fees?: {
    consultationFee?: number;
    followUpFee?: number;
    emergencyFee?: number;
  };
}

export interface PatientAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PatientContactInfo {
  email: string;
  phone: string;
  alternatePhone: string;
  address: PatientAddress;
}

export interface PatientPersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date
  gender: string;
  bloodGroup: string;
}

export interface PatientStatistics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowCount: number;
  lastVisit?: string; // ISO date, optional
}

export interface Patient {
  _id: string;
  patientId: string;
  personalInfo: PatientPersonalInfo;
  contactInfo: PatientContactInfo;
  statistics: PatientStatistics;
}

export interface PaginatedPatientsResponse {
  success: boolean;
  data: Patient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ConsultationDetails {
  diagnosis: string;
  followUpRequired: boolean;
  prescription?: string;
  notes?: string;
  followUpDate?: string; // ISO date
  recommendations?: string;
}

export interface PatientConsultationHistoryItem {
  _id: string;
  id: string;
  consultation: ConsultationDetails;
  appointmentDateTime: string; // ISO date
  endDateTime: string | null;
  symptoms: string[];
  notes?: string;
}

export interface PatientConsultationHistoryResponse {
  success: boolean;
  data: {
    history: PatientConsultationHistoryItem[];
  };
}