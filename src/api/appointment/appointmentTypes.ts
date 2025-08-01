export type AppointmentType =
  | "consultation"
  | "follow-up"
  | "emergency"
  | "routine-checkup"
  | "procedure";

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "no-show";

export type Priority = "low" | "medium" | "high" | "urgent";

export type BookingSource =
  | "website"
  | "mobile-app"
  | "whatsapp"
  | "phone-call"
  | "email"
  | "sms"
  | "in-person"
  | "third-party"
  | "referral"
  | "qr-code"
  | "social-media"
  | "voice-bot"
  | "api";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface ConsultationPayload {
  diagnosis?: string;
  prescription?: string;
  nextAppointment?: string;
  followUpRequired?: boolean;
}

export interface MetadataPayload {
  ipAddress?: string;
  userAgent?: string;
  referralSource?: string;
  campaignId?: string;
}

export interface CreateAppointmentPayload {
  patient: string;
  doctor: string;
  appointmentDateTime: string;
  duration?: number;
  appointmentType: AppointmentType;
  status?: AppointmentStatus;
  priority?: Priority;
  bookingSource: BookingSource;
  symptoms?: string[];
  notes?: string;
  specialRequirements?: string;
  paymentStatus?: PaymentStatus;
  paymentAmount?: number;
  paymentMethod?: string;
  consultation?: ConsultationPayload;
  metadata?: MetadataPayload;
}

// ⬇️ Types for nested populated patient/doctor response
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface ReminderSettings {
  enableReminders: boolean;
  reminderTime: number;
}

export interface Patient {
  _id: string;
  patientId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    bloodGroup: string;
  };
  contactInfo: {
    address: Address;
    email: string;
    phone: string;
    alternatePhone: string;
  };
  medicalInfo: {
    emergencyContact: EmergencyContact;
    allergies: string[];
    chronicConditions: string[];
    currentMedications: string[];
  };
  preferences: {
    reminderSettings: ReminderSettings;
    preferredLanguage: string;
    communicationMethod: string;
  };
  authentication: {
    isVerified: boolean;
    verificationToken: string;
  };
  statistics: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShowCount: number;
    lastVisit: string;
  };
  registrationSource: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  age: number;
  id: string;
  __v: number;
}

export interface WorkingDay {
  day: string;
  startTime: string;
  endTime: string;
  isWorking: boolean;
  _id: string;
  id: string;
}

export interface BreakTime {
  startTime: string;
  endTime: string;
  description: string;
  _id: string;
  id: string;
}

export interface Doctor {
  _id: string;
  doctorId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  professionalInfo: {
    specialization: string;
    qualifications: string[];
    experience: number;
    licenseNumber: string;
    department: string;
  };
  schedule: {
    workingDays: WorkingDay[];
    slotDuration: number;
    breakTimes: BreakTime[];
  };
  availability: {
    isAvailable: boolean;
    unavailableDates: string[];
    maxAppointmentsPerDay: number;
  };
  fees: {
    consultationFee: number;
    followUpFee: number;
    emergencyFee: number;
  };
  statistics: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    rating: number;
    reviewCount: number;
  };
  authentication: {
    isVerified: boolean;
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
  };
  isActive: boolean;
  isVerifiedByAdmin: boolean;
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  id: string;
  __v: number;
}

export interface Appointment {
  _id: string;
  id: string;
  appointmentId: string;
  patient: Patient;
  doctor: Doctor;
  appointmentDateTime: string;
  endDateTime: string;
  duration: number;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  priority: Priority;
  bookingSource: BookingSource;
  symptoms: string[];
  notes?: string;
  specialRequirements?: string;
  remindersSent: number;
  lastReminderSent?: string;
  cancelledAt?: string;
  paymentStatus: PaymentStatus;
  paymentAmount?: number;
  paymentMethod?: string;
  consultation?: ConsultationPayload;
  metadata?: MetadataPayload;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface AppointmentBookingResponse {
  appointment: Appointment;
  confirmationCode: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
export interface AppointmentSummary {
  _id: string;
  appointmentId: string;
  patient: {
    _id: string;
    patientId: string;
    personalInfo: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      gender: string;
      bloodGroup: string;
    };
    contactInfo: {
      email: string;
      phone: string;
      alternatePhone: string;
      address: Address;
    };
  };
  doctor: {
    _id: string;
    doctorId: string;
    personalInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    professionalInfo: {
      specialization: string;
      qualifications: string[];
      experience: number;
      licenseNumber: string;
      department: string;
    };
  };
  appointmentDateTime: string;
  duration: number;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  priority: Priority;
  bookingSource: BookingSource;
  symptoms: string[];
  notes?: string;
  specialRequirements?: string;
  remindersSent: number;
  paymentStatus: PaymentStatus;
  paymentAmount?: number;
  metadata?: MetadataPayload;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface AppointmentListResponse {
  appointments: AppointmentSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface GetAppointmentByIdResponse {
  success: boolean;
  data: {
    appointment: Appointment;
  };
}

export interface GetAllDoctorAppointmentsResponse {
  success: boolean;
  data: AppointmentSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface GetDoctorAppointmentByIdResponse {
  success: boolean;
  data: AppointmentSummary;
}
export interface UpdateAppointmentStatusPayload {
  status: AppointmentStatus;
  reason?: string;
}
export interface GetAppointmentDetailsResponse {
  success: boolean;
  data: {
    appointment: Appointment;
  };
}

export interface CancelAppointmentResponse {
  success: boolean;
  message: string;
  data: {
    appointment: Appointment;
    refundEligible: boolean;
  };
}
export interface RescheduleAppointmentPayload {
  newDateTime: string; 
  reason: string;
}
export interface UpdateAppointmentStatusPayload {
  status: AppointmentStatus;
  notes?: string; 
}
export interface UpdateAppointmentStatusResponse {
  success: boolean;
  message: string;
  data: {
    appointment: Appointment;
  };
}