export type Gender = "male" | "female" | "other";
export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";
export type CommunicationMethod = "email" | "sms" | "whatsapp" | "phone";
export type statusOptions = "active" | "inactive" | "suspended";
export type RegistrationSource =
  | "website"
  | "mobile-app"
  | "whatsapp"
  | "phone-call"
  | "in-person"
  | "referral";

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface EmergencyContact {
  name?: string;
  relationship?: string;
  phone?: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO string
  gender: Gender;
  bloodGroup?: BloodGroup;
}

export interface ContactInfo {
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: Address;
}

export interface MedicalInfo {
  allergies?: string[];
  chronicConditions?: string[];
  currentMedications?: string[];
  emergencyContact?: EmergencyContact;
}

export interface ReminderSettings {
  enableReminders?: boolean;
  reminderTime?: number;
}

export interface Preferences {
  preferredLanguage?: string;
  communicationMethod?: CommunicationMethod;
  reminderSettings?: ReminderSettings;
}

export interface Authentication {
  isVerified?: boolean;
  verificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: string;
}

export interface Statistics {
  totalAppointments?: number;
  completedAppointments?: number;
  cancelledAppointments?: number;
  noShowCount?: number;
  lastVisit?: string;
}

export interface Patient {
  _id: string;
  patientId: string;
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  medicalInfo?: MedicalInfo;
  preferences?: Preferences;
  authentication?: Authentication;
  statistics?: Statistics;
  registrationSource: RegistrationSource;
  isActive?: boolean;
  fullName?: string;
  age?: number;
  createdAt: string;
  updatedAt: string;
}

// Payload type for creating/updating patients
export interface PatientPayload {
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  registrationSource: RegistrationSource;
  authentication?: {
    password?: string;
  };
  medicalInfo?: MedicalInfo;
  preferences?: Preferences;
}

export interface PatientStatusPayload {
  isActive: boolean;
  reason: string;
}

export interface DoctorVerificationPayload {
  verificationStatus: string;
  reason: string;
}

// Pagination structure
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Modified ApiResponse types
export interface PaginatedPatientsResponse {
  patients: Patient[];
}

export interface AdminProfile {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  mustChangePassword: boolean;
  tempPassword: boolean;
  twoFactorEnabled: boolean;
  fullName: string;
}

export interface GetAdminProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: AdminProfile;
  };
}

export interface TwoFAData {
  secret: string;
  qrCode: string;
  manualEntryKey: string;
}

export interface disablePayload {
  password: string;
  twoFactorCode: string;
}

export interface changePassPayload {
  currentPassword: string;
  newPassword: string;
}

export interface TwoFAApiResponse {
  success: boolean;
  message?: string;
  data: TwoFAData;
}

export interface genericApiResponse {
  success: boolean;
  message?: string;
}

export interface UserCreatePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role?: string;
  sendCredentials: boolean;
}

export interface CreatedAdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreatedApiResponse {
  success: boolean;
  message?: string;
  data: {
    user: CreatedAdminUser;
    tempPassword?: string; 
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

export interface CreatedBy {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
  id: string;
}

export interface AdminUser {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  permissions: string[];
  isActive: boolean;
  mustChangePassword: boolean;
  tempPassword: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  createdBy?: CreatedBy;
  lastLogin?: string;
}
export interface UserStatusPayload {
  status: statusOptions;
  isActive: boolean;
}
export interface UsersListApiResponse {
  success: boolean;
  data: {
    users: AdminUser[];
    pagination: Pagination;
  };
}
