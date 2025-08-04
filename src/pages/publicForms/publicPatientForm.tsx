// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import styled from "styled-components";
import { theme } from "@/config/theme.config";
import { useCreatePatient } from "@/hooks/usePatient";
import { usePublicDoctorList } from "@/hooks/useDoctor";
import { useBookAppointment } from "@/hooks/useAppointment";
import { Toaster } from "react-hot-toast";
import { httpClient } from "@/api/httpClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Validation Schemas
const patientSchema = yup.object({
  firstName: yup.string().required("First name is required").max(50, "First name too long").trim(),
  lastName: yup.string().required("Last name is required").max(50, "Last name too long").trim(),
  dateOfBirth: yup.string().required("Date of birth is required").test(
    "not-future",
    "Date of birth cannot be in the future",
    function (value) {
      if (!value) return false;
      return new Date(value) <= new Date();
    }
  ),
  gender: yup.string().required("Gender is required").oneOf(["male", "female", "other"], "Invalid gender selection"),
  email: yup.string().required("Email is required").email("Invalid email format").max(100, "Email too long").trim(),
  phone: yup.string().required("Phone is required").matches(
    /^[6-9]\d{9}$/,
    "Invalid phone number - must be 10 digits starting with 6-9"
  ),
  password: yup.string().required("Password is required").min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  confirmPassword: yup.string().required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
});

const appointmentSchema = yup.object({
  doctor: yup.string().required("Doctor is required"),
  appointmentDate: yup.string().required("Appointment date is required"),
  appointmentType: yup.string().required("Appointment type is required")
    .oneOf(["consultation", "follow-up", "emergency"], "Invalid appointment type"),
  symptoms: yup.string().optional(),
  notes: yup.string().optional(),
});

type PatientFormData = yup.InferType<typeof patientSchema>;
type AppointmentFormData = yup.InferType<typeof appointmentSchema>;

interface CreatedPatient {
  _id: string;
  patientId: string;
  fullName: string;
  contactInfo: {
    phone: string;
    email: string;
  };
}

interface DoctorInfo {
  _id: string;
  doctorId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
  };
  professionalInfo: {
    specialization: string;
    experience: number;
  };
  fullName: string;
  fees?: {
    consultationFee?: number;
    followUpFee?: number;
    emergencyFee?: number;
  };
}

type FormStep = "patient" | "appointment-prompt" | "appointment";

const CombinedPatientAppointmentForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<FormStep>("patient");
  const [createdPatient, setCreatedPatient] = useState<CreatedPatient | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [calculatedFee, setCalculatedFee] = useState(0);
  const [availabilityData, setAvailabilityData] = useState<{ date: string; available: boolean }[]>([]);
  const [availableTimes, setAvailableTimes] = useState<any[]>([]);

  // Hooks
  const createPatientMutation = useCreatePatient();
  const { data, isLoading: doctorsLoading } = usePublicDoctorList();
  const bookAppointmentMutation = useBookAppointment();
  console.log("dcotors data", data)
  const doctors = data?.data.doctors || [];

  // Patient Form
  const patientForm = useForm<PatientFormData>({
    resolver: yupResolver(patientSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: undefined,
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Appointment Form
  const appointmentForm = useForm<AppointmentFormData>({
    resolver: yupResolver(appointmentSchema),
    mode: "onChange",
    defaultValues: {
      doctor: "",
      appointmentDate: "",
      appointmentType: undefined,
      symptoms: "",
      notes: "",
    },
  });

  const watchedDoctor = appointmentForm.watch("doctor");
  const watchedAppointmentType = appointmentForm.watch("appointmentType");
  const watchedAppointmentDate = appointmentForm.watch("appointmentDate");

  // Calculate fee when doctor or appointment type changes
  useEffect(() => {
    if (watchedDoctor && watchedAppointmentType && doctors) {
      const selectedDoctor = doctors.find((doc: DoctorInfo) => doc._id === watchedDoctor);
      if (selectedDoctor?.fees) {
        let fee = 0;
        if (watchedAppointmentType === "consultation") {
          fee = selectedDoctor.fees.consultationFee ?? 0;
        } else if (watchedAppointmentType === "follow-up") {
          fee = selectedDoctor.fees.followUpFee ?? 0;
        } else if (watchedAppointmentType === "emergency") {
          fee = selectedDoctor.fees.emergencyFee ?? 0;
        }
        setCalculatedFee(fee);
      } else {
        setCalculatedFee(0);
      }
    } else {
      setCalculatedFee(0);
    }
  }, [watchedDoctor, watchedAppointmentType, doctors]);

  // Fetch doctor availability
  useEffect(() => {
    const fetchDoctorAvailability = async () => {
      if (!watchedDoctor) return;
      
      const startDate = new Date().toISOString().split("T")[0];
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      try {
        const res = await httpClient.get(
          `/api/appointments/availability/${watchedDoctor}`,
          { params: { startDate, endDate } }
        );
        setAvailabilityData(res.data.data.availability);
      } catch (error) {
        console.error("Failed to fetch availability", error);
        setAvailabilityData([]);
      }
    };

    fetchDoctorAvailability();
  }, [watchedDoctor]);

  // Fetch available slots
  useEffect(() => {
    const fetchSlots = async () => {
      if (!watchedDoctor || !watchedAppointmentDate) return;

      try {
        const res = await httpClient.get(
          `/api/appointments/slots/${watchedDoctor}/${watchedAppointmentDate}`
        );
        setAvailableTimes(res.data.data.slots || []);
      } catch (error) {
        console.error("Failed to fetch slots", error);
        setAvailableTimes([]);
      }
    };

    fetchSlots();
  }, [watchedAppointmentDate, watchedDoctor]);

  const availableDates = availabilityData
    .filter((day) => day.available)
    .map((day) => new Date(day.date));

  const isDateAvailable = (date: Date) => {
    return availableDates.some(
      (availableDate) => availableDate.toDateString() === date.toDateString()
    );
  };

  const handlePatientSubmit = async (data: PatientFormData) => {
    try {
      const patientPayload = {
        personalInfo: {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
        },
        contactInfo: {
          email: data.email.trim().toLowerCase(),
          phone: data.phone.replace(/\D/g, ""),
          address: {
            country: "India",
          },
        },
        registrationSource: "website" as const,
        preferences: {
          preferredLanguage: "English",
          communicationMethod: "email" as const,
          reminderSettings: {
            enableReminders: true,
            reminderTime: 24,
          },
        },
        authentication: {
          password: data.password,
        },
      };

      const response = await createPatientMutation.mutateAsync(patientPayload);
      setCreatedPatient(response.patient);
      setCurrentStep("appointment-prompt");
    } catch (error) {
      console.error("Error creating patient:", error);
    }
  };

  const handleAppointmentSubmit = async (data: AppointmentFormData) => {
    if (!createdPatient) return;

    try {
      const appointmentPayload = {
        patient: createdPatient._id,
        doctor: data.doctor,
        appointmentDate: data.appointmentDate,
        appointmentType: data.appointmentType,
        status: "scheduled" as const,
        priority: "medium" as const,
        bookingSource: "website" as const,
        symptoms: data.symptoms ? data.symptoms.split(",").map((s) => s.trim()).filter(Boolean) : [],
        notes: data.notes,
        paymentStatus: "pending" as const,
        paymentAmount: calculatedFee,
        metadata: {
          ipAddress: "127.0.0.1",
          userAgent: navigator.userAgent,
        },
      };

      await bookAppointmentMutation.mutateAsync(appointmentPayload);
      
      // Reset forms and show success
      patientForm.reset();
      appointmentForm.reset();
      setCreatedPatient(null);
      setCurrentStep("patient");
      setShowAppointmentForm(false);
    } catch (error) {
      console.error("Error creating appointment:", error);
    }
  };

  const handleBookAppointment = () => {
    setShowAppointmentForm(true);
    setCurrentStep("appointment");
  };

  const handleSkipAppointment = () => {
    patientForm.reset();
    setCreatedPatient(null);
    setCurrentStep("patient");
  };

  const getDoctorDisplayName = (doctor: DoctorInfo) => {
    return doctor.fullName || `Dr. ${doctor.personalInfo.firstName} ${doctor.personalInfo.lastName}`;
  };

  const renderPatientForm = () => (
    <FormSection>
      <SectionHeader>
        <SectionIcon>👤</SectionIcon>
        <SectionTitle>Patient Registration</SectionTitle>
      </SectionHeader>
      
      <form onSubmit={patientForm.handleSubmit(handlePatientSubmit)}>
        <FormGrid>
          <FormGroup>
            <Label>First Name *</Label>
            <Controller
              name="firstName"
              control={patientForm.control}
              render={({ field }) => (
                <Input {...field} hasError={!!patientForm.formState.errors.firstName} />
              )}
            />
            {patientForm.formState.errors.firstName && (
              <ErrorText>{patientForm.formState.errors.firstName.message}</ErrorText>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Last Name *</Label>
            <Controller
              name="lastName"
              control={patientForm.control}
              render={({ field }) => (
                <Input {...field} hasError={!!patientForm.formState.errors.lastName} />
              )}
            />
            {patientForm.formState.errors.lastName && (
              <ErrorText>{patientForm.formState.errors.lastName.message}</ErrorText>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Date of Birth *</Label>
            <Controller
              name="dateOfBirth"
              control={patientForm.control}
              render={({ field }) => (
                <Input {...field} type="date" hasError={!!patientForm.formState.errors.dateOfBirth} />
              )}
            />
            {patientForm.formState.errors.dateOfBirth && (
              <ErrorText>{patientForm.formState.errors.dateOfBirth.message}</ErrorText>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Gender *</Label>
            <Controller
              name="gender"
              control={patientForm.control}
              render={({ field }) => (
                <Select {...field} hasError={!!patientForm.formState.errors.gender}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              )}
            />
            {patientForm.formState.errors.gender && (
              <ErrorText>{patientForm.formState.errors.gender.message}</ErrorText>
            )}
          </FormGroup>

          <FormGroup className="full-width">
            <Label>Email Address *</Label>
            <Controller
              name="email"
              control={patientForm.control}
              render={({ field }) => (
                <Input {...field} type="email" hasError={!!patientForm.formState.errors.email} />
              )}
            />
            {patientForm.formState.errors.email && (
              <ErrorText>{patientForm.formState.errors.email.message}</ErrorText>
            )}
          </FormGroup>

          <FormGroup className="full-width">
            <Label>Phone Number *</Label>
            <Controller
              name="phone"
              control={patientForm.control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter 10-digit mobile number" hasError={!!patientForm.formState.errors.phone} />
              )}
            />
            {patientForm.formState.errors.phone && (
              <ErrorText>{patientForm.formState.errors.phone.message}</ErrorText>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Password *</Label>
            <Controller
              name="password"
              control={patientForm.control}
              render={({ field }) => (
                <Input {...field} type="password" hasError={!!patientForm.formState.errors.password} />
              )}
            />
            {patientForm.formState.errors.password && (
              <ErrorText>{patientForm.formState.errors.password.message}</ErrorText>
            )}
            <HelperText>Minimum 8 characters with uppercase and special character required</HelperText>
          </FormGroup>

          <FormGroup>
            <Label>Confirm Password *</Label>
            <Controller
              name="confirmPassword"
              control={patientForm.control}
              render={({ field }) => (
                <Input {...field} type="password" hasError={!!patientForm.formState.errors.confirmPassword} />
              )}
            />
            {patientForm.formState.errors.confirmPassword && (
              <ErrorText>{patientForm.formState.errors.confirmPassword.message}</ErrorText>
            )}
          </FormGroup>
        </FormGrid>

        <FormActions>
          <ActionButton type="submit" disabled={createPatientMutation.isPending}>
            {createPatientMutation.isPending ? "Creating Patient..." : "Register Patient"}
          </ActionButton>
        </FormActions>
      </form>
    </FormSection>
  );

  const renderAppointmentPrompt = () => (
    <SuccessSection>
      <SuccessIcon>🎉</SuccessIcon>
      <SuccessTitle>Patient Registered Successfully!</SuccessTitle>
      <SuccessMessage>
        <strong>{createdPatient?.fullName} </strong> has been registered with Patient ID: <strong>{createdPatient?.patientId}</strong>
      </SuccessMessage>
      
      <AppointmentPrompt>
        <PromptTitle>Would you like to book an appointment?</PromptTitle>
        <PromptActions>
          <ActionButton onClick={handleBookAppointment}>
            📅 Yes, Book Appointment
          </ActionButton>
          <ActionButton variant="secondary" onClick={handleSkipAppointment}>
            Skip for Now
          </ActionButton>
        </PromptActions>
      </AppointmentPrompt>
    </SuccessSection>
  );

  const renderAppointmentForm = () => (
    <FormSection>
      <SectionHeader>
        <SectionIcon>📅</SectionIcon>
        <div>
          <SectionTitle>Book Appointment</SectionTitle>
          <PatientInfo>
            for {createdPatient?.fullName} 
            (ID: {createdPatient?.patientId})
          </PatientInfo>
        </div>
      </SectionHeader>

      <form onSubmit={appointmentForm.handleSubmit(handleAppointmentSubmit)}>
        <FormGrid>
          <FormGroup>
            <Label>Doctor *</Label>
            <Controller
              name="doctor"
              control={appointmentForm.control}
              render={({ field }) => (
                <Select {...field} hasError={!!appointmentForm.formState.errors.doctor}>
                  <option value="">Select doctor</option>
                  { doctors.map((doctor: DoctorInfo) => (
                    <option key={doctor._id} value={doctor._id}>
                      {getDoctorDisplayName(doctor)} - {doctor.professionalInfo.specialization}
                    </option>
                  ))}
                </Select>
              )}
            />
            {appointmentForm.formState.errors.doctor && (
              <ErrorText>{appointmentForm.formState.errors.doctor.message}</ErrorText>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Appointment Type *</Label>
            <Controller
              name="appointmentType"
              control={appointmentForm.control}
              render={({ field }) => (
                <Select {...field} hasError={!!appointmentForm.formState.errors.appointmentType}>
                  <option value="">Select type</option>
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                </Select>
              )}
            />
            {appointmentForm.formState.errors.appointmentType && (
              <ErrorText>{appointmentForm.formState.errors.appointmentType.message}</ErrorText>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Appointment Date *</Label>
            <Controller
              name="appointmentDate"
              control={appointmentForm.control}
              render={({ field }) => (
                <DatePicker
                  selected={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : "")}
                  filterDate={isDateAvailable}
                  minDate={new Date()}
                  dateFormat="yyyy-MM-dd"
                  customInput={<Input hasError={!!appointmentForm.formState.errors.appointmentDate} />}
                />
              )}
            />
            {appointmentForm.formState.errors.appointmentDate && (
              <ErrorText>{appointmentForm.formState.errors.appointmentDate.message}</ErrorText>
            )}
          </FormGroup>

          <FormGroup className="full-width">
            <Label>Symptoms</Label>
            <Controller
              name="symptoms"
              control={appointmentForm.control}
              render={({ field }) => (
                <TextArea {...field} placeholder="Describe your symptoms (separate multiple with commas)" />
              )}
            />
            <HelperText>Optional - describe your symptoms</HelperText>
          </FormGroup>

          <FormGroup className="full-width">
            <Label>Additional Notes</Label>
            <Controller
              name="notes"
              control={appointmentForm.control}
              render={({ field }) => (
                <TextArea {...field} placeholder="Any additional information or special requests" />
              )}
            />
          </FormGroup>
        </FormGrid>

        {watchedDoctor && watchedAppointmentType && (
          <FeeDisplayCard>
            <FeeLabel>Consultation Fee</FeeLabel>
            <FeeAmount>₹{calculatedFee.toLocaleString()}</FeeAmount>
            <FeeDescription>
              {watchedAppointmentType.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())} 
              with {getDoctorDisplayName(doctors?.find((doc: DoctorInfo) => doc._id === watchedDoctor) || {} as DoctorInfo)}
            </FeeDescription>
          </FeeDisplayCard>
        )}

        <FormActions>
          <ActionButton type="button" variant="secondary" onClick={handleSkipAppointment}>
            Cancel
          </ActionButton>
          <ActionButton type="submit" disabled={bookAppointmentMutation.isPending}>
            {bookAppointmentMutation.isPending ? "Booking Appointment..." : "Book Appointment"}
          </ActionButton>
        </FormActions>
      </form>
    </FormSection>
  );

  return (
    <FormContainer>
      <FormHeader>
        <HeaderContent>
          <Title>Patient Registration & Appointment Booking</Title>
          <Subtitle>
            {currentStep === "patient" && "Register as a new patient"}
            {currentStep === "appointment-prompt" && "Registration completed successfully"}
            {currentStep === "appointment" && "Book your appointment"}
          </Subtitle>
        </HeaderContent>
        <ProgressIndicator>
          <ProgressStep active={currentStep === "patient"} completed={currentStep !== "patient"}>
            1
          </ProgressStep>
          <ProgressConnector />
          <ProgressStep active={currentStep !== "patient"} completed={false}>
            2
          </ProgressStep>
        </ProgressIndicator>
      </FormHeader>

      <FormContent>
        {currentStep === "patient" && renderPatientForm()}
        {currentStep === "appointment-prompt" && renderAppointmentPrompt()}
        {currentStep === "appointment" && renderAppointmentForm()}
      </FormContent>

      <Toaster />
    </FormContainer>
  );
};

// Styled Components
const FormContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const FormHeader = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #8b5cf6 100%);
  color: white;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
`;

const ProgressIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProgressStep = styled.div<{ active: boolean; completed: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  background: ${props => 
    props.completed ? "#10b981" : 
    props.active ? "white" : 
    "rgba(255, 255, 255, 0.3)"};
  color: ${props => 
    props.completed ? "white" : 
    props.active ? theme.colors.primary : 
    "white"};
  transition: all 0.3s ease;
`;

const ProgressConnector = styled.div`
  width: 40px;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
`;

const FormContent = styled.div`
  padding: 32px;
`;

const FormSection = styled.div`
  width: 100%;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f5f9;
`;

const SectionIcon = styled.div`
  font-size: 24px;
  margin-top: 2px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const PatientInfo = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 4px 0 0 0;
  font-weight: 500;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;

  .full-width {
    grid-column: 1 / -1;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
`;

const Input = styled.input<{ hasError?: boolean }>`
  padding: 12px 16px;
  border: 2px solid ${props => props.hasError ? "#ef4444" : "#e5e7eb"};
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Select = styled.select<{ hasError?: boolean }>`
  padding: 12px 16px;
  border: 2px solid ${props => props.hasError ? "#ef4444" : "#e5e7eb"};
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  transition: all 0.2s ease;
  font-family: inherit;
  background: white;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const ErrorText = styled.span`
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  font-weight: 500;
`;

const HelperText = styled.span`
  color: #6b7280;
  font-size: 12px;
  margin-top: 4px;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

const ActionButton = styled.button<{ variant?: "secondary" }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 160px;

  ${props => props.variant === "secondary" ? `
    background: white;
    color: #374151;
    border: 2px solid #e5e7eb;

    &:hover:not(:disabled) {
      background: #f9fafb;
      border-color: #d1d5db;
    }
  ` : `
    background: ${theme.colors.primary};
    color: white;
    border: 2px solid ${theme.colors.primary};

    &:hover:not(:disabled) {
      background: ${theme.colors.primary}dd;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
    min-width: auto;
  }
`;

const SuccessSection = styled.div`
  text-align: center;
  padding: 40px 20px;
`;

const SuccessIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const SuccessTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #10b981;
  margin: 0 0 8px 0;
`;

const SuccessMessage = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 32px 0;
  line-height: 1.5;
`;

const AppointmentPrompt = styled.div`
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 16px;
  padding: 24px;
  margin-top: 24px;
`;

const PromptTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #0c4a6e;
  margin: 0 0 20px 0;
`;

const PromptActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FeeDisplayCard = styled.div`
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  margin: 20px 0;
`;

const FeeLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #0369a1;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FeeAmount = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #0c4a6e;
  margin-bottom: 4px;
`;

const FeeDescription = styled.div`
  font-size: 12px;
  color: #0369a1;
  opacity: 0.8;
`;

export default CombinedPatientAppointmentForm;
