import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import styled from "styled-components";
import { theme } from "@/config/theme.config";
import { useCreatePatient } from "@/hooks/usePatient";
import { useUpdatePatient } from "@/hooks/useAdmin";
import {
  PatientPayload,
  PersonalInfo,
  ContactInfo,
  MedicalInfo,
  Preferences,
  RegistrationSource,
  Gender,
  BloodGroup,
  Patient,
} from "@/api/patient/patientTypes";
import { Toaster } from "react-hot-toast";

// Validation schema using Yup
const createPatientSchema = yup.object({
  // Personal Information
  firstName: yup
    .string()
    .required("First name is required")
    .max(50, "First name too long")
    .trim(),
  lastName: yup
    .string()
    .required("Last name is required")
    .max(50, "Last name too long")
    .trim(),
  dateOfBirth: yup
    .string()
    .required("Date of birth is required")
    .test(
      "not-future",
      "Date of birth cannot be in the future",
      function (value) {
        if (!value) return false;
        return new Date(value) <= new Date();
      }
    ),
  gender: yup
    .string()
    .required("Gender is required")
    .oneOf(["male", "female", "other"], "Invalid gender selection"),
  bloodGroup: yup
    .string()
    .optional()
    .oneOf(
      ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      "Invalid blood group"
    ),

  // Contact Information
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format")
    .max(100, "Email too long")
    .trim(),
  phone: yup
    .string()
    .required("Phone is required")
    .matches(
      /^[6-9]\d{9}$/,
      "Invalid phone number - must be 10 digits starting with 6-9"
    ),
  alternatePhone: yup
    .string()
    .optional()
    .test(
      "alternate-phone-format",
      "Invalid alternate phone number",
      function (value) {
        if (!value || value.length === 0) {
          return true; // Allow empty values
        }
        return /^[6-9]\d{9}$/.test(value);
      }
    ),
  street: yup.string().optional().max(200, "Street address too long"),
  city: yup.string().optional().max(50, "City name too long"),
  state: yup.string().optional().max(50, "State name too long"),
  zipCode: yup.string().optional().max(10, "Zip code too long"),
  country: yup.string().max(50, "Country name too long").default("India"),

  // Medical Information
  allergies: yup.array().of(yup.string()).default([]),
  chronicConditions: yup.array().of(yup.string()).default([]),
  currentMedications: yup.array().of(yup.string()).default([]),
  emergencyContactName: yup
    .string()
    .optional()
    .max(100, "Emergency contact name too long"),
  emergencyContactRelationship: yup
    .string()
    .optional()
    .max(50, "Relationship description too long"),
  emergencyContactPhone: yup
    .string()
    .optional()
    .test(
      "emergency-phone-format",
      "Invalid emergency contact phone number",
      function (value) {
        if (!value || value.length === 0) {
          return true; // Allow empty values
        }
        return /^[6-9]\d{9}$/.test(value);
      }
    ),

  // Preferences
  preferredLanguage: yup
    .string()
    .max(50, "Language name too long")
    .default("English"),
  communicationMethod: yup
    .string()
    .oneOf(
      ["email", "sms", "whatsapp", "phone"],
      "Invalid communication method"
    )
    .default("email"),
  enableReminders: yup.boolean().default(true),
  reminderTime: yup
    .number()
    .min(1, "Minimum 1 hour")
    .max(168, "Maximum 168 hours")
    .default(24),

  // Security
  registrationSource: yup
    .string()
    .required("Registration source is required")
    .oneOf(
      [
        "website",
        "mobile-app",
        "whatsapp",
        "phone-call",
        "in-person",
        "referral",
      ],
      "Invalid registration source"
    ),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
});

const editPatientSchema = yup.object({
  // Personal Information
  firstName: yup
    .string()
    .required("First name is required")
    .max(50, "First name too long")
    .trim(),
  lastName: yup
    .string()
    .required("Last name is required")
    .max(50, "Last name too long")
    .trim(),
  dateOfBirth: yup
    .string()
    .required("Date of birth is required")
    .test(
      "not-future",
      "Date of birth cannot be in the future",
      function (value) {
        if (!value) return false;
        return new Date(value) <= new Date();
      }
    ),
  gender: yup
    .string()
    .required("Gender is required")
    .oneOf(["male", "female", "other"], "Invalid gender selection"),
  bloodGroup: yup
    .string()
    .optional()
    .oneOf(
      ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      "Invalid blood group"
    ),

  // Contact Information
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format")
    .max(100, "Email too long")
    .trim(),
  phone: yup
    .string()
    .required("Phone is required")
    .matches(
      /^[6-9]\d{9}$/,
      "Invalid phone number - must be 10 digits starting with 6-9"
    ),
  alternatePhone: yup
    .string()
    .optional()
    .test(
      "alternate-phone-format",
      "Invalid alternate phone number",
      function (value) {
        if (!value || value.length === 0) {
          return true; // Allow empty values
        }
        return /^[6-9]\d{9}$/.test(value);
      }
    ),
  street: yup.string().optional().max(200, "Street address too long"),
  city: yup.string().optional().max(50, "City name too long"),
  state: yup.string().optional().max(50, "State name too long"),
  zipCode: yup.string().optional().max(10, "Zip code too long"),
  country: yup.string().max(50, "Country name too long").default("India"),

  // Medical Information
  allergies: yup.array().of(yup.string()).default([]),
  chronicConditions: yup.array().of(yup.string()).default([]),
  currentMedications: yup.array().of(yup.string()).default([]),
  emergencyContactName: yup
    .string()
    .optional()
    .max(100, "Emergency contact name too long"),
  emergencyContactRelationship: yup
    .string()
    .optional()
    .max(50, "Relationship description too long"),
  emergencyContactPhone: yup
    .string()
    .optional()
    .test(
      "emergency-phone-format",
      "Invalid emergency contact phone number",
      function (value) {
        if (!value || value.length === 0) {
          return true; // Allow empty values
        }
        return /^[6-9]\d{9}$/.test(value);
      }
    ),

  // Preferences
  preferredLanguage: yup
    .string()
    .max(50, "Language name too long")
    .default("English"),
  communicationMethod: yup
    .string()
    .oneOf(
      ["email", "sms", "whatsapp", "phone"],
      "Invalid communication method"
    )
    .default("email"),
  enableReminders: yup.boolean().default(true),
  reminderTime: yup
    .number()
    .min(1, "Minimum 1 hour")
    .max(168, "Maximum 168 hours")
    .default(24),

  // Security - Modified for edit mode
  registrationSource: yup
    .string()
    .required("Registration source is required")
    .oneOf(
      [
        "website",
        "mobile-app",
        "whatsapp",
        "phone-call",
        "in-person",
        "referral",
      ],
      "Invalid registration source"
    ),

  password: yup
    .string()
    .optional()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    ),

  confirmPassword: yup
    .string()
    .optional()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .when("password", {
      is: (value) => value && value.length > 0,
      then: (schema) => schema.required("Please confirm your password"),
    }),
});

type FormData = yup.InferType<typeof createPatientSchema>;
type StepType = "personal" | "contact" | "medical" | "preferences" | "security";

const steps = [
  {
    id: "personal",
    title: "Personal Information",
    shortTitle: "Personal",
    description: "Basic personal details",
    icon: "👤",
    fields: ["firstName", "lastName", "dateOfBirth", "gender", "bloodGroup"],
  },
  {
    id: "contact",
    title: "Contact Information",
    shortTitle: "Contact",
    description: "Contact details and address",
    icon: "📧",
    fields: [
      "email",
      "phone",
      "alternatePhone",
      "street",
      "city",
      "state",
      "zipCode",
      "country",
    ],
  },
  {
    id: "medical",
    title: "Medical Information",
    shortTitle: "Medical",
    description: "Medical history and emergency contact",
    icon: "🏥",
    fields: [
      "allergies",
      "chronicConditions",
      "currentMedications",
      "emergencyContactName",
      "emergencyContactRelationship",
      "emergencyContactPhone",
    ],
  },
  {
    id: "preferences",
    title: "Preferences",
    shortTitle: "Preferences",
    description: "Communication and reminder settings",
    icon: "⚙️",
    fields: [
      "preferredLanguage",
      "communicationMethod",
      "enableReminders",
      "reminderTime",
    ],
  },
  {
    id: "security",
    title: "Account Security",
    shortTitle: "Security",
    description: "Password and registration details",
    icon: "🔒",
    fields: ["registrationSource", "password", "confirmPassword"],
  },
];
1
interface PatientFormProps {
  mode?: "create" | "edit";
  initialData?: Patient | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({
  mode = "create",
  initialData = null,
  onSuccess,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = React.useState<StepType>("personal");
  const [completedSteps, setCompletedSteps] = React.useState<StepType[]>([]);

  // Use the appropriate schema based on mode
  const schema = mode === "create" ? createPatientSchema : editPatientSchema;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: undefined,
      bloodGroup: undefined,
      email: "",
      phone: "",
      alternatePhone: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
      allergies: [],
      chronicConditions: [],
      currentMedications: [],
      emergencyContactName: "",
      emergencyContactRelationship: "",
      emergencyContactPhone: "",
      preferredLanguage: "English",
      communicationMethod: "email",
      enableReminders: true,
      reminderTime: 24,
      registrationSource: undefined,
      password: "",
      confirmPassword: "",
    },
  });

  // Watch values for tag inputs
  const allergies = watch("allergies");
  const chronicConditions = watch("chronicConditions");
  const currentMedications = watch("currentMedications");

  // Use the custom hooks for API integration
  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();

  // Initialize form with existing data in edit mode
  useEffect(() => {
    if (mode === "edit" && initialData) {
      console.log("edit mode data", initialData)
      populateFormWithExistingData(initialData);
    }
  }, [mode, initialData]);

  // Function to populate form with existing patient data
  const populateFormWithExistingData = (patient: Patient) => {
    const formData = {
      firstName: patient.personalInfo?.firstName || "",
      lastName: patient.personalInfo?.lastName || "",
      dateOfBirth: patient.personalInfo?.dateOfBirth || "",
      gender: patient.personalInfo?.gender || undefined,
      bloodGroup: patient.personalInfo?.bloodGroup || undefined,
      email: patient.contactInfo?.email || "",
      phone: patient.contactInfo?.phone || "",
      alternatePhone: patient.contactInfo?.alternatePhone || "",
      street: patient.contactInfo?.address?.street || "",
      city: patient.contactInfo?.address?.city || "",
      state: patient.contactInfo?.address?.state || "",
      zipCode: patient.contactInfo?.address?.zipCode || "",
      country: patient.contactInfo?.address?.country || "India",
      allergies: Array.isArray(patient.medicalInfo?.allergies)
        ? patient.medicalInfo.allergies
        : [],
      chronicConditions: Array.isArray(patient.medicalInfo?.chronicConditions)
        ? patient.medicalInfo.chronicConditions
        : [],
      currentMedications: Array.isArray(patient.medicalInfo?.currentMedications)
        ? patient.medicalInfo.currentMedications
        : [],
      emergencyContactName: patient.medicalInfo?.emergencyContact?.name || "",
      emergencyContactRelationship:
        patient.medicalInfo?.emergencyContact?.relationship || "",
      emergencyContactPhone: patient.medicalInfo?.emergencyContact?.phone || "",
      preferredLanguage: patient.preferences?.preferredLanguage || "English",
      communicationMethod: patient.preferences?.communicationMethod || "email",
      enableReminders:
        patient.preferences?.reminderSettings?.enableReminders ?? true,
      reminderTime: patient.preferences?.reminderSettings?.reminderTime || 24,
      registrationSource: patient.registrationSource || undefined,
      password: "",
      confirmPassword: "",
    };

    reset(formData);

    // In edit mode, mark all steps as completed by default
    setCompletedSteps([
      "personal",
      "contact",
      "medical",
      "preferences",
      "security",
    ]);
  };

  // Tag management functions
  const addTag = (
    field: "allergies" | "chronicConditions" | "currentMedications",
    value: string
  ) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    const currentValues = watch(field);
    if (!currentValues.includes(trimmedValue)) {
      setValue(field, [...currentValues, trimmedValue]);
    }
  };

  const removeTag = (
    field: "allergies" | "chronicConditions" | "currentMedications",
    index: number
  ) => {
    const currentValues = watch(field);
    setValue(
      field,
      currentValues.filter((_, i) => i !== index)
    );
  };

  // Check if current step has errors
  const getCurrentStepErrors = (stepId: StepType): boolean => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return false;

    return step.fields.some((field) => errors[field as keyof FormData]);
  };

  // Validate current step
  const validateCurrentStep = async (): Promise<boolean> => {
    const step = steps.find((s) => s.id === currentStep);
    if (!step) return false;

    const result = await trigger(step.fields as (keyof FormData)[]);
    return result;
  };

  const handleNext = async () => {
    const isStepValid = await validateCurrentStep();

    if (isStepValid) {
      setCompletedSteps((prev) => [
        ...prev.filter((s) => s !== currentStep),
        currentStep,
      ]);

      const currentIndex = steps.findIndex((step) => step.id === currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1].id as StepType);
      }
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as StepType);
    }
  };

  const handleStepClick = async (stepId: StepType) => {
    const stepIndex = steps.findIndex((step) => step.id === stepId);
    const currentIndex = steps.findIndex((step) => step.id === currentStep);

    // In edit mode, allow navigation to any step
    if (mode === "edit") {
      setCurrentStep(stepId);
      return;
    }

    // In create mode, allow going to previous steps or the next immediate step if current is valid
    if (
      stepIndex < currentIndex ||
      (stepIndex === currentIndex + 1 && (await validateCurrentStep()))
    ) {
      if (stepIndex === currentIndex + 1) {
        setCompletedSteps((prev) => [
          ...prev.filter((s) => s !== currentStep),
          currentStep,
        ]);
      }
      setCurrentStep(stepId);
    }
  };

  // Transform form data to API payload format
  const transformFormDataToPayload = (data: FormData): PatientPayload => {
    const personalInfo: PersonalInfo = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      dateOfBirth: data.dateOfBirth,
      gender: data.gender as Gender,
      ...(data.bloodGroup && { bloodGroup: data.bloodGroup as BloodGroup }),
    };

    const contactInfo: ContactInfo = {
      email: data.email.trim().toLowerCase(),
      phone: data.phone.replace(/\D/g, ""),
      ...(data.alternatePhone && {
        alternatePhone: data.alternatePhone.replace(/\D/g, ""),
      }),
      address: {
        ...(data.street && { street: data.street.trim() }),
        ...(data.city && { city: data.city.trim() }),
        ...(data.state && { state: data.state.trim() }),
        ...(data.zipCode && { zipCode: data.zipCode.trim() }),
        country: data.country.trim(),
      },
    };

    const medicalInfo: MedicalInfo = {
      ...(data.allergies.length > 0 && { allergies: data.allergies }),
      ...(data.chronicConditions.length > 0 && {
        chronicConditions: data.chronicConditions,
      }),
      ...(data.currentMedications.length > 0 && {
        currentMedications: data.currentMedications,
      }),
      ...(data.emergencyContactName && {
        emergencyContact: {
          name: data.emergencyContactName.trim(),
          ...(data.emergencyContactRelationship && {
            relationship: data.emergencyContactRelationship.trim(),
          }),
          ...(data.emergencyContactPhone && {
            phone: data.emergencyContactPhone.replace(/\D/g, ""),
          }),
        },
      }),
    };

    const preferences: Preferences = {
      preferredLanguage: data.preferredLanguage.trim(),
      communicationMethod: data.communicationMethod,
      reminderSettings: {
        enableReminders: data.enableReminders,
        reminderTime: data.reminderTime,
      },
    };

    const payload: PatientPayload = {
      personalInfo,
      contactInfo,
      registrationSource: data.registrationSource as RegistrationSource,
      ...(Object.keys(medicalInfo).length > 0 && { medicalInfo }),
      preferences,
      // Only include password in create mode or if password is being updated in edit mode
      ...((mode === "create" || (mode === "edit" && data.password)) && {
        authentication: { password: data.password },
      }),
    };

    return payload;
  };

  const onSubmit = async (data: FormData) => {
    try {
      const payload = transformFormDataToPayload(data);

      if (mode === "create") {
        await createPatientMutation.mutateAsync(payload);
        reset(); // Reset form after successful creation
        setCompletedSteps([]);
      } else if (mode === "edit" && initialData) {
        await updatePatientMutation.mutateAsync({
          id: initialData._id,
          patientData: payload,
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error(
        `Error ${mode === "create" ? "creating" : "updating"} patient:`,
        error
      );
    }
  };

  const getStepStatus = (stepId: StepType) => {
    if (completedSteps.includes(stepId)) return "completed";
    if (stepId === currentStep) return "current";
    return "pending";
  };

  const isLastStep = currentStep === "security";
  const isFirstStep = currentStep === "personal";
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  // Check if mutation is pending
  const isSubmitting =
    mode === "create"
      ? createPatientMutation.isPending
      : updatePatientMutation.isPending;

  return (
    <FormContainer>
      <Toaster position="top-right" toastOptions={{ duration: 2000 }} />

      {/* Form Header */}
      <FormHeader>
        <HeaderContent>
          <Title>
            {mode === "create" ? "Create New Patient" : "Edit Patient"}
          </Title>
          <Subtitle>
            {mode === "create"
              ? "Complete all steps to register a new patient in the system"
              : "Update patient information and preferences"}
          </Subtitle>
        </HeaderContent>
        <ProgressIndicator>
          <ProgressText>
            Step {currentStepIndex + 1} of {steps.length}
          </ProgressText>
          <ProgressBar>
            <ProgressFill percentage={progressPercentage} />
          </ProgressBar>
        </ProgressIndicator>
      </FormHeader>

      {/* Mobile Stepper */}
      <MobileStepper>
        {steps.map((step, index) => {
          const status = getStepStatus(step.id as StepType);
          const hasErrors = getCurrentStepErrors(step.id as StepType);
          return (
            <MobileStepItem key={step.id}>
              <MobileStepButton
                status={status}
                hasErrors={hasErrors}
                onClick={() => handleStepClick(step.id as StepType)}
                disabled={
                  status === "pending" &&
                  step.id !== currentStep &&
                  mode === "create"
                }
              >
                <MobileStepIcon status={status} hasErrors={hasErrors}>
                  {status === "completed" ? "✓" : hasErrors ? "!" : index + 1}
                </MobileStepIcon>
                <MobileStepTitle status={status}>
                  {step.shortTitle}
                </MobileStepTitle>
              </MobileStepButton>
            </MobileStepItem>
          );
        })}
      </MobileStepper>

      {/* Main Content */}
      <ContentArea>
        {/* Desktop Sidebar */}
        <Sidebar>
          <SidebarStepper>
            {steps.map((step, index) => {
              const status = getStepStatus(step.id as StepType);
              const hasErrors = getCurrentStepErrors(step.id as StepType);
              return (
                <SidebarStepItem key={step.id}>
                  <SidebarStepButton
                    status={status}
                    hasErrors={hasErrors}
                    onClick={() => handleStepClick(step.id as StepType)}
                    disabled={
                      status === "pending" &&
                      step.id !== currentStep &&
                      mode === "create"
                    }
                  >
                    <SidebarStepIcon status={status} hasErrors={hasErrors}>
                      {status === "completed"
                        ? "✓"
                        : hasErrors
                        ? "!"
                        : step.icon}
                    </SidebarStepIcon>
                    <SidebarStepContent>
                      <SidebarStepTitle status={status}>
                        {step.title}
                      </SidebarStepTitle>
                      <SidebarStepDescription status={status}>
                        {step.description}
                      </SidebarStepDescription>
                    </SidebarStepContent>
                  </SidebarStepButton>
                  {index < steps.length - 1 && (
                    <SidebarConnector
                      completed={completedSteps.includes(step.id as StepType)}
                    />
                  )}
                </SidebarStepItem>
              );
            })}
          </SidebarStepper>
        </Sidebar>

        {/* Form Content */}
        <FormContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormCard>
              {/* Personal Information Step */}
              {currentStep === "personal" && (
                <StepContainer>
                  <StepHeader>
                    <StepIcon>👤</StepIcon>
                    <StepTitle>Personal Information</StepTitle>
                    <StepSubtitle>
                      Please provide your basic personal details
                    </StepSubtitle>
                  </StepHeader>

                  <FormGrid>
                    <FormGroup>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Controller
                        name="firstName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="firstName"
                            hasError={!!errors.firstName}
                            placeholder="Enter your first name"
                            maxLength={50}
                          />
                        )}
                      />
                      {errors.firstName && (
                        <ErrorText>{errors.firstName.message}</ErrorText>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Controller
                        name="lastName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="lastName"
                            hasError={!!errors.lastName}
                            placeholder="Enter your last name"
                            maxLength={50}
                          />
                        )}
                      />
                      {errors.lastName && (
                        <ErrorText>{errors.lastName.message}</ErrorText>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Controller
                        name="dateOfBirth"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="date"
                            id="dateOfBirth"
                            hasError={!!errors.dateOfBirth}
                            max={new Date().toISOString().split("T")[0]}
                          />
                        )}
                      />
                      {errors.dateOfBirth && (
                        <ErrorText>{errors.dateOfBirth.message}</ErrorText>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="gender">Gender *</Label>
                      <Controller
                        name="gender"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            id="gender"
                            hasError={!!errors.gender}
                          >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </Select>
                        )}
                      />
                      {errors.gender && (
                        <ErrorText>{errors.gender.message}</ErrorText>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="bloodGroup">Blood Group</Label>
                      <Controller
                        name="bloodGroup"
                        control={control}
                        render={({ field }) => (
                          <Select {...field} id="bloodGroup">
                            <option value="">Select blood group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </Select>
                        )}
                      />
                      <HelperText>Optional field</HelperText>
                    </FormGroup>
                  </FormGrid>
                </StepContainer>
              )}

              {/* Contact Information Step */}
              {currentStep === "contact" && (
                <StepContainer>
                  <StepHeader>
                    <StepIcon>📧</StepIcon>
                    <StepTitle>Contact Information</StepTitle>
                    <StepSubtitle>
                      Provide your contact details and address
                    </StepSubtitle>
                  </StepHeader>

                  <FormGrid>
                    <FormGroup>
                      <Label htmlFor="email">Email Address *</Label>
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="email"
                            id="email"
                            hasError={!!errors.email}
                            placeholder="Enter your email address"
                            maxLength={100}
                          />
                        )}
                      />
                      {errors.email && (
                        <ErrorText>{errors.email.message}</ErrorText>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="tel"
                            id="phone"
                            hasError={!!errors.phone}
                            placeholder="Enter your phone number"
                            maxLength={10}
                          />
                        )}
                      />
                      {errors.phone && (
                        <ErrorText>{errors.phone.message}</ErrorText>
                      )}
                      <HelperText>
                        Enter 10-digit Indian mobile number
                      </HelperText>
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="alternatePhone">Alternate Phone</Label>
                      <Controller
                        name="alternatePhone"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="tel"
                            id="alternatePhone"
                            hasError={!!errors.alternatePhone}
                            placeholder="Enter alternate phone number"
                            maxLength={10}
                          />
                        )}
                      />
                      {errors.alternatePhone && (
                        <ErrorText>{errors.alternatePhone.message}</ErrorText>
                      )}
                      <HelperText>Optional field</HelperText>
                    </FormGroup>

                    <FormGroup className="full-width">
                      <Label htmlFor="street">Street Address</Label>
                      <Controller
                        name="street"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="street"
                            placeholder="Enter your street address"
                            maxLength={200}
                          />
                        )}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="city">City</Label>
                      <Controller
                        name="city"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="city"
                            placeholder="Enter your city"
                            maxLength={50}
                          />
                        )}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="state">State</Label>
                      <Controller
                        name="state"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="state"
                            placeholder="Enter your state"
                            maxLength={50}
                          />
                        )}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Controller
                        name="zipCode"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="zipCode"
                            placeholder="Enter zip code"
                            maxLength={10}
                          />
                        )}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="country">Country</Label>
                      <Controller
                        name="country"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="country"
                            placeholder="Enter your country"
                            maxLength={50}
                          />
                        )}
                      />
                    </FormGroup>
                  </FormGrid>
                </StepContainer>
              )}

              {/* Medical Information Step */}
              {currentStep === "medical" && (
                <StepContainer>
                  <StepHeader>
                    <StepIcon>🏥</StepIcon>
                    <StepTitle>Medical Information</StepTitle>
                    <StepSubtitle>
                      Medical history and emergency contact (Optional)
                    </StepSubtitle>
                  </StepHeader>

                  <FormGrid>
                    <FormGroup className="full-width">
                      <Label htmlFor="allergies">Allergies</Label>
                      <TagInputContainer>
                        <TagsList>
                          {allergies.map((tag, index) => (
                            <Tag key={index}>
                              <TagText>{tag}</TagText>
                              <TagRemove
                                onClick={() => removeTag("allergies", index)}
                              >
                                ×
                              </TagRemove>
                            </Tag>
                          ))}
                          <TagInput
                            placeholder={
                              allergies.length === 0
                                ? "Type allergy and press Enter"
                                : "Add another..."
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const value = e.currentTarget.value.trim();
                                if (value) {
                                  addTag("allergies", value);
                                  e.currentTarget.value = "";
                                }
                              }
                            }}
                          />
                        </TagsList>
                      </TagInputContainer>
                      <HelperText>
                        Type each allergy and press Enter to add as a tag
                      </HelperText>
                    </FormGroup>

                    <FormGroup className="full-width">
                      <Label htmlFor="chronicConditions">
                        Chronic Conditions
                      </Label>
                      <TagInputContainer>
                        <TagsList>
                          {chronicConditions.map((tag, index) => (
                            <Tag key={index}>
                              <TagText>{tag}</TagText>
                              <TagRemove
                                onClick={() =>
                                  removeTag("chronicConditions", index)
                                }
                              >
                                ×
                              </TagRemove>
                            </Tag>
                          ))}
                          <TagInput
                            placeholder={
                              chronicConditions.length === 0
                                ? "Type condition and press Enter"
                                : "Add another..."
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const value = e.currentTarget.value.trim();
                                if (value) {
                                  addTag("chronicConditions", value);
                                  e.currentTarget.value = "";
                                }
                              }
                            }}
                          />
                        </TagsList>
                      </TagInputContainer>
                      <HelperText>
                        Type each chronic condition and press Enter to add as a
                        tag
                      </HelperText>
                    </FormGroup>

                    <FormGroup className="full-width">
                      <Label htmlFor="currentMedications">
                        Current Medications
                      </Label>
                      <TagInputContainer>
                        <TagsList>
                          {currentMedications.map((tag, index) => (
                            <Tag key={index}>
                              <TagText>{tag}</TagText>
                              <TagRemove
                                onClick={() =>
                                  removeTag("currentMedications", index)
                                }
                              >
                                ×
                              </TagRemove>
                            </Tag>
                          ))}
                          <TagInput
                            placeholder={
                              currentMedications.length === 0
                                ? "Type medication and press Enter"
                                : "Add another..."
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const value = e.currentTarget.value.trim();
                                if (value) {
                                  addTag("currentMedications", value);
                                  e.currentTarget.value = "";
                                }
                              }
                            }}
                          />
                        </TagsList>
                      </TagInputContainer>
                      <HelperText>
                        Type each medication and press Enter to add as a tag
                      </HelperText>
                    </FormGroup>

                    <EmergencyContactSection>
                      <SectionTitle>Emergency Contact</SectionTitle>

                      <FormGroup>
                        <Label htmlFor="emergencyContactName">
                          Contact Name
                        </Label>
                        <Controller
                          name="emergencyContactName"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              id="emergencyContactName"
                              placeholder="Enter emergency contact name"
                              maxLength={100}
                            />
                          )}
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label htmlFor="emergencyContactRelationship">
                          Relationship
                        </Label>
                        <Controller
                          name="emergencyContactRelationship"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              id="emergencyContactRelationship"
                              placeholder="Relationship to patient"
                              maxLength={50}
                            />
                          )}
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label htmlFor="emergencyContactPhone">
                          Contact Phone
                        </Label>
                        <Controller
                          name="emergencyContactPhone"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="tel"
                              id="emergencyContactPhone"
                              hasError={!!errors.emergencyContactPhone}
                              placeholder="Emergency contact phone"
                              maxLength={10}
                            />
                          )}
                        />
                        {errors.emergencyContactPhone && (
                          <ErrorText>
                            {errors.emergencyContactPhone.message}
                          </ErrorText>
                        )}
                      </FormGroup>
                    </EmergencyContactSection>
                  </FormGrid>
                </StepContainer>
              )}

              {/* Preferences Step */}
              {currentStep === "preferences" && (
                <StepContainer>
                  <StepHeader>
                    <StepIcon>⚙️</StepIcon>
                    <StepTitle>Preferences</StepTitle>
                    <StepSubtitle>
                      Communication and reminder settings
                    </StepSubtitle>
                  </StepHeader>

                  <FormGrid>
                    <FormGroup>
                      <Label htmlFor="preferredLanguage">
                        Preferred Language
                      </Label>
                      <Controller
                        name="preferredLanguage"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="preferredLanguage"
                            placeholder="Enter preferred language"
                            maxLength={50}
                          />
                        )}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="communicationMethod">
                        Communication Method
                      </Label>
                      <Controller
                        name="communicationMethod"
                        control={control}
                        render={({ field }) => (
                          <Select {...field} id="communicationMethod">
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="phone">Phone</option>
                          </Select>
                        )}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="reminderTime">
                        Reminder Time (hours before)
                      </Label>
                      <Controller
                        name="reminderTime"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            id="reminderTime"
                            hasError={!!errors.reminderTime}
                            min="1"
                            max="168"
                            placeholder="24"
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 24)
                            }
                          />
                        )}
                      />
                      {errors.reminderTime && (
                        <ErrorText>{errors.reminderTime.message}</ErrorText>
                      )}
                      <HelperText>
                        How many hours before appointment to send reminder
                        (1-168 hours)
                      </HelperText>
                    </FormGroup>

                    <CheckboxGroup className="full-width">
                      <Controller
                        name="enableReminders"
                        control={control}
                        render={({ field }) => (
                          <>
                            <CheckboxInput
                              {...field}
                              type="checkbox"
                              id="enableReminders"
                              checked={field.value}
                            />
                            <CheckboxLabel htmlFor="enableReminders">
                              Enable appointment reminders
                            </CheckboxLabel>
                          </>
                        )}
                      />
                    </CheckboxGroup>
                  </FormGrid>
                </StepContainer>
              )}

              {/* Security Step */}
              {currentStep === "security" && (
                <StepContainer>
                  <StepHeader>
                    <StepIcon>🔒</StepIcon>
                    <StepTitle>Account Security</StepTitle>
                    <StepSubtitle>
                      {mode === "create"
                        ? "Set up your account password and registration details"
                        : "Update registration details and optionally change password"}
                    </StepSubtitle>
                  </StepHeader>

                  <FormGrid>
                    <FormGroup>
                      <Label htmlFor="registrationSource">
                        Registration Source *
                      </Label>
                      <Controller
                        name="registrationSource"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            id="registrationSource"
                            hasError={!!errors.registrationSource}
                          >
                            <option value="">Select source</option>
                            <option value="website">Website</option>
                            <option value="mobile-app">Mobile App</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="phone-call">Phone Call</option>
                            <option value="in-person">In Person</option>
                            <option value="referral">Referral</option>
                          </Select>
                        )}
                      />
                      {errors.registrationSource && (
                        <ErrorText>
                          {errors.registrationSource.message}
                        </ErrorText>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="password">
                        Password {mode === "create" ? "*" : "(Optional)"}
                      </Label>
                      <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="password"
                            id="password"
                            hasError={!!errors.password}
                            placeholder={
                              mode === "create"
                                ? "Enter a secure password"
                                : "Enter new password to change"
                            }
                          />
                        )}
                      />
                      {errors.password && (
                        <ErrorText>{errors.password.message}</ErrorText>
                      )}
                      <HelperText>
                        {mode === "create"
                          ? "Minimum 8 characters with uppercase and special character required"
                          : "Leave blank to keep current password. Minimum 8 characters if changing."}
                      </HelperText>
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="password"
                            id="confirmPassword"
                            hasError={!!errors.confirmPassword}
                            placeholder="Confirm your password"
                            disabled={!watch("password")}
                          />
                        )}
                      />
                      {errors.confirmPassword && (
                        <ErrorText>{errors.confirmPassword.message}</ErrorText>
                      )}
                    </FormGroup>
                  </FormGrid>
                </StepContainer>
              )}
            </FormCard>

            {/* Form Actions */}
            <FormActions>
              <ActionButton
                type="button"
                variant="secondary"
                onClick={onCancel || handleBack}
                disabled={isFirstStep && !onCancel}
              >
                {onCancel ? "Cancel" : "← Back"}
              </ActionButton>

              <StepIndicator>
                Step {currentStepIndex + 1} of {steps.length}
              </StepIndicator>

              {!isLastStep ? (
                <ActionButton type="button" onClick={handleNext}>
                  Next Step →
                </ActionButton>
              ) : (
                <ActionButton type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? mode === "create"
                      ? "Registering..."
                      : "Updating..."
                    : mode === "create"
                    ? "Complete Registration"
                    : "Update Patient"}
                </ActionButton>
              )}
            </FormActions>
          </form>
        </FormContent>
      </ContentArea>
    </FormContainer>
  );
};

// Styled Components - All the existing styled components remain the same
const FormContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  width: 100%;
`;

const FormHeader = styled.div`
  background: linear-gradient(
    135deg,
    ${theme.colors.primary} 0%,
    ${theme.colors.primary || "#6366f1"} 100%
  );
  color: white;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    padding: 16px 20px;
  }
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px 0;

  @media (max-width: 768px) {
    font-size: 20px;
    text-align: center;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  margin: 0;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 13px;
    text-align: center;
  }
`;

const ProgressIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
    gap: 8px;
  }
`;

const ProgressText = styled.span`
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0.9;
`;

const ProgressBar = styled.div`
  width: 200px;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ProgressFill = styled.div<{ percentage: number }>`
  width: ${(props) => props.percentage}%;
  height: 100%;
  background: white;
  border-radius: 999px;
  transition: width 0.3s ease;
`;

const MobileStepper = styled.div`
  display: none;

  @media (max-width: 1024px) {
    display: flex;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    padding: 16px 20px;
    overflow-x: auto;
    gap: 8px;
  }
`;

const MobileStepItem = styled.div`
  flex-shrink: 0;
`;

const MobileStepButton = styled.button<{
  status: "completed" | "current" | "pending";
  hasErrors?: boolean;
  disabled?: boolean;
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: ${(props) =>
    props.hasErrors
      ? "#fee2e2"
      : props.status === "current"
      ? `${theme.colors.primary}10`
      : props.status === "completed"
      ? "#10b98110"
      : "transparent"};
  border: 1px solid
    ${(props) =>
      props.hasErrors
        ? "#ef4444"
        : props.status === "current"
        ? theme.colors.primary
        : props.status === "completed"
        ? "#10b981"
        : "transparent"};
  border-radius: 8px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  transition: all 0.2s ease;
  min-width: 70px;

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.hasErrors
        ? "#fecaca"
        : props.status === "current"
        ? `${theme.colors.primary}15`
        : props.status === "completed"
        ? "#10b98115"
        : "#f1f5f9"};
  }
`;

const MobileStepIcon = styled.div<{
  status: "completed" | "current" | "pending";
  hasErrors?: boolean;
}>`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  background: ${(props) =>
    props.hasErrors
      ? "#ef4444"
      : props.status === "completed"
      ? "#10b981"
      : props.status === "current"
      ? theme.colors.primary
      : "#e2e8f0"};
  color: ${(props) =>
    props.hasErrors
      ? "white"
      : props.status === "completed"
      ? "white"
      : props.status === "current"
      ? "white"
      : "#64748b"};
`;

const MobileStepTitle = styled.div<{
  status: "completed" | "current" | "pending";
}>`
  font-size: 11px;
  font-weight: 500;
  color: ${(props) =>
    props.status === "completed"
      ? "#10b981"
      : props.status === "current"
      ? theme.colors.primary
      : "#64748b"};
  text-align: center;
`;

const ContentArea = styled.div`
  display: flex;
  flex: 1;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.div`
  width: 280px;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  padding: 20px 16px;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const SidebarStepper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SidebarStepItem = styled.div`
  position: relative;
`;

const SidebarStepButton = styled.button<{
  status: "completed" | "current" | "pending";
  hasErrors?: boolean;
  disabled?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  background: ${(props) =>
    props.hasErrors
      ? "#fee2e2"
      : props.status === "current"
      ? `${theme.colors.primary}10`
      : props.status === "completed"
      ? "#10b98110"
      : "transparent"};
  border: 1px solid
    ${(props) =>
      props.hasErrors
        ? "#ef4444"
        : props.status === "current"
        ? theme.colors.primary
        : props.status === "completed"
        ? "#10b981"
        : "transparent"};
  border-radius: 8px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  transition: all 0.2s ease;
  text-align: left;

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.hasErrors
        ? "#fecaca"
        : props.status === "current"
        ? `${theme.colors.primary}15`
        : props.status === "completed"
        ? "#10b98115"
        : "#f1f5f9"};
  }
`;

const SidebarStepIcon = styled.div<{
  status: "completed" | "current" | "pending";
  hasErrors?: boolean;
}>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  background: ${(props) =>
    props.hasErrors
      ? "#ef4444"
      : props.status === "completed"
      ? "#10b981"
      : props.status === "current"
      ? theme.colors.primary
      : "#e2e8f0"};
  color: ${(props) =>
    props.hasErrors
      ? "white"
      : props.status === "completed"
      ? "white"
      : props.status === "current"
      ? "white"
      : "#64748b"};
  transition: all 0.2s ease;
`;

const SidebarStepContent = styled.div`
  flex: 1;
`;

const SidebarStepTitle = styled.div<{
  status: "completed" | "current" | "pending";
}>`
  font-size: 13px;
  font-weight: 500;
  color: ${(props) =>
    props.status === "completed"
      ? "#10b981"
      : props.status === "current"
      ? theme.colors.primary
      : "#475569"};
  margin-bottom: 2px;
`;

const SidebarStepDescription = styled.div<{
  status: "completed" | "current" | "pending";
}>`
  font-size: 11px;
  color: ${(props) =>
    props.status === "completed"
      ? "#059669"
      : props.status === "current"
      ? `${theme.colors.primary}dd`
      : "#64748b"};
  line-height: 1.3;
`;

const SidebarConnector = styled.div<{ completed: boolean }>`
  position: absolute;
  left: 28px;
  top: 44px;
  width: 1px;
  height: 18px;
  background: ${(props) => (props.completed ? "#10b981" : "#e2e8f0")};
  transition: background-color 0.2s ease;
`;

const FormContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const FormCard = styled.div`
  flex: 1;
  background: white;
`;

const StepContainer = styled.div`
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const StepHeader = styled.div`
  text-align: center;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const StepIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 28px;
    margin-bottom: 6px;
  }
`;

const StepTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const StepSubtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;

  .full-width {
    grid-column: 1 / -1;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
`;

const Input = styled.input<{ hasError?: boolean }>`
  padding: 10px 12px;
  border: 1px solid ${(props) => (props.hasError ? "#ef4444" : "#d1d5db")};
  border-radius: 6px;
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

  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const Select = styled.select<{ hasError?: boolean }>`
  padding: 10px 12px;
  border: 1px solid ${(props) => (props.hasError ? "#ef4444" : "#d1d5db")};
  border-radius: 6px;
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

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary};
  }
`;

const CheckboxInput = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${theme.colors.primary};
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  font-weight: 500;
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
  line-height: 1.3;
`;

const EmergencyContactSection = styled.div`
  grid-column: 1 / -1;
  margin-top: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    padding: 16px;
    grid-template-columns: 1fr;
    gap: 14px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "🚨";
    font-size: 14px;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    padding: 14px 16px;
    flex-direction: column;
    gap: 12px;
  }
`;

const ActionButton = styled.button<{ variant?: "secondary" }>`
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;

  ${(props) =>
    props.variant === "secondary"
      ? `
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover:not(:disabled) {
      background: #f9fafb;
      border-color: #9ca3af;
    }
  `
      : `
    background: ${theme.colors.primary};
    color: white;
    border: 1px solid ${theme.colors.primary};
    
    &:hover:not(:disabled) {
      background: ${theme.colors.primary}dd;
      transform: translateY(-1px);
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
    order: ${(props) => (props.variant === "secondary" ? "2" : "1")};
  }
`;

const StepIndicator = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  padding: 6px 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    order: 3;
    width: 100%;
    text-align: center;
  }
`;

// Tag Input Styled Components
const TagInputContainer = styled.div`
  min-height: 60px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px;
  background: white;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  min-height: 24px;
`;

const Tag = styled.div`
  display: flex;
  align-items: center;
  background: ${theme.colors.primary}15;
  border: 1px solid ${theme.colors.primary}30;
  border-radius: 20px;
  padding: 4px 8px 4px 12px;
  font-size: 13px;
  color: ${theme.colors.primary};
  max-width: 200px;
`;

const TagText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 6px;
`;

const TagRemove = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.primary}20;
    color: #dc2626;
  }
`;

const TagInput = styled.input`
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  flex: 1;
  min-width: 120px;
  padding: 4px 0;
  color: #374151;

  &::placeholder {
    color: #9ca3af;
  }
`;

export default PatientForm;
