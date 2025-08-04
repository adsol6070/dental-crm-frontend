export type Gender = "male" | "female" | "other";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type CommunicationMethod = "email" | "sms" | "whatsapp" | "phone";
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

// Pagination structure
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface GetPatientProfileResponse {
  success: boolean;
  data: {
    patient: Patient;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

export type AppointmentType = "consultation" | "follow-up" | "emergency";
export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed" | "scheduled";
export type AppointmentPriority = "low" | "medium" | "high";
export type PaymentStatus = "paid" | "unpaid" | "pending";
export type PaymentMethod = "cash" | "card" | "upi" | "netbanking" | "insurance";

export interface DoctorPersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface DoctorProfessionalInfo {
  specialization: string;
  qualifications: string[];
  experience: number;
  licenseNumber: string;
  department: string;
}

export interface DoctorInfo {
  _id: string;
  doctorId: string;
  personalInfo: DoctorPersonalInfo;
  professionalInfo: DoctorProfessionalInfo;
}


export interface ConsultationInfo {
  diagnosis: string;
  prescription: string;
  nextAppointment: string;
  followUpRequired: boolean;
}

export interface AppointmentMetadata {
  ipAddress?: string;
  userAgent?: string;
  referralSource?: string;
  campaignId?: string;
}

export interface Appointment {
  _id: string;
  appointmentId: string;
  patient: string; // Still a reference ID
  doctor: DoctorInfo;
  appointmentStartTime: string;
  appointmentEndTime: string;
  duration: number;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  priority: AppointmentPriority;
  bookingSource: RegistrationSource;
  symptoms: string[];
  notes?: string;
  specialRequirements?: string;
  remindersSent: number;
  lastReminderSent?: string;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  paymentMethod?: PaymentMethod; // Optional because it’s not always included
  metadata?: AppointmentMetadata;
  consultation?: ConsultationInfo; // Optional — not present in latest example
  createdAt: string;
  updatedAt: string;
}

export interface GetPatientAppointmentsResponse {
  data: {
    appointments: Appointment[];
  };
  pagination: Pagination;
}

// Already defined and reused
export interface ConsultationInfo {
  diagnosis: string;
  prescription: string;
  nextAppointment: string; // ISO string
  followUpRequired: boolean;
}

// Medical Record
export interface MedicalRecord {
  _id: string;
  appointmentId: string;
  appointmentDateTime: string;
  consultation: ConsultationInfo;
  doctor: DoctorInfo;
}

// Medical Records API Response
export interface GetMedicalRecordsResponse {
  success: boolean;
  data: {
    medicalRecords: MedicalRecord[];
  };
}

export interface DashboardData {
  upcomingAppointments: Appointment[];
  recentAppointments: (Appointment & { consultation: ConsultationInfo })[];
  statistics: Statistics;
  monthlyStats: MonthlyStat[];
  personalInfo: PersonalInfo;
  preferences: Preferences;
}

export interface MonthlyStat {
  _id: number; // Represents the month (e.g., 7 for July)
  count: number;
}

export interface GetDashboardDataResponse {
  success: boolean;
  data: DashboardData;
}
