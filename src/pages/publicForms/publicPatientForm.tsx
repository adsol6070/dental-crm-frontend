// @ts-nocheck
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useCreatePatient } from "@/hooks/usePatient"
import { usePublicDoctorList } from "@/hooks/useDoctor"
import { useBookAppointment } from "@/hooks/useAppointment"
import { Toaster } from "react-hot-toast";
import { httpClient } from "@/api/httpClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Types
interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | '';
  bloodGroup: string;
  email: string;
  phone: string;
  alternatePhone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  preferredLanguage: string;
  communicationMethod: 'email' | 'sms' | 'whatsapp' | 'phone';
  enableReminders: boolean;
  reminderTime: number;
  password: string;
  confirmPassword: string;
}

interface AppointmentFormData {
  doctor: string;
  appointmentDate: string;
  appointmentStartTime: string;
  appointmentEndTime: string;
  duration: number;
  appointmentType: 'consultation' | 'follow-up' | 'emergency' | '';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  symptoms: string;
  notes: string;
  specialRequirements: string;
  paymentMethod: string;
  referralSource: string;
}

type FormStep = 'welcome' | 'personal' | 'contact' | 'medical' | 'appointment' | 'payment' | 'confirmation' | 'post-registration';

const PublicBookingPlatform = () => {
  const [currentStep, setCurrentStep] = useState<FormStep>('welcome');
  const [createdPatient, setCreatedPatient] = useState(null);
  const [showBookingOption, setShowBookingOption] = useState(false);
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState(null);
  const [isNewPatient, setIsNewPatient] = useState(true);
  
  const [patientData, setPatientData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    email: '',
    phone: '',
    alternatePhone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    allergies: [],
    chronicConditions: [],
    currentMedications: [],
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    preferredLanguage: 'English',
    communicationMethod: 'email',
    enableReminders: true,
    reminderTime: 24,
    password: '',
    confirmPassword: ''
  });

  const [appointmentData, setAppointmentData] = useState<AppointmentFormData>({
    doctor: '',
    appointmentDate: '',
    appointmentStartTime: '',
    appointmentEndTime: '',
    duration: 30,
    appointmentType: '',
    priority: 'medium',
    symptoms: '',
    notes: '',
    specialRequirements: '',
    paymentMethod: '',
    referralSource: ''
  });

  const [errors, setErrors] = useState<any>({});
  const [calculatedFee, setCalculatedFee] = useState(0);
  const [availabilityData, setAvailabilityData] = useState<{ date: string; available: boolean }[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Available dates for DatePicker
  const availableDates = availabilityData
    .filter((day) => day.available)
    .map((day) => new Date(day.date));

  const isDateAvailable = (date: Date) => {
    return availableDates.some(
      (availableDate) => availableDate.toDateString() === date.toDateString()
    );
  };

  // Hooks
  const createPatientMutation = useCreatePatient();
  const { data: doctors, isLoading: doctorsLoading } = usePublicDoctorList();
  const bookAppointmentMutation = useBookAppointment();

  console.log("doctors", doctors);

  // Fetch doctor availability when doctor is selected
  useEffect(() => {
    const fetchDoctorAvailability = async () => {
      if (!appointmentData.doctor) {
        setAvailabilityData([]);
        return;
      }

      setLoadingAvailability(true);
      const startDate = new Date().toISOString().split("T")[0];
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
        .toISOString()
        .split("T")[0];

      try {
        const res = await httpClient.get(
          `/api/appointments/availability/${appointmentData.doctor}`,
          { params: { startDate, endDate } }
        );

        setAvailabilityData(res.data.data.availability || []);
      } catch (error) {
        console.error("Failed to fetch availability", error);
        setAvailabilityData([]);
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchDoctorAvailability();
  }, [appointmentData.doctor]);

  // Fetch available slots when date is selected
  useEffect(() => {
    const fetchSlots = async () => {
      if (!appointmentData.doctor || !appointmentData.appointmentDate) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const res = await httpClient.get(
          `/api/appointments/slots/${appointmentData.doctor}/${appointmentData.appointmentDate}`
        );

        setAvailableSlots(res.data.data.slots || []);
      } catch (error) {
        console.error("Failed to fetch slots", error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [appointmentData.appointmentDate, appointmentData.doctor]);

  // Calculate fee when doctor or appointment type changes
  useEffect(() => {
    if (appointmentData.doctor && appointmentData.appointmentType && doctors) {
      const selectedDoctor = doctors?.data?.doctors?.find(doc => doc._id === appointmentData.doctor);
      if (selectedDoctor?.fees) {
        let fee = 0;
        switch (appointmentData.appointmentType) {
          case 'consultation':
            fee = selectedDoctor.fees.consultationFee || 0;
            break;
          case 'follow-up':
            fee = selectedDoctor.fees.followUpFee || 0;
            break;
          case 'emergency':
            fee = selectedDoctor.fees.emergencyFee || 0;
            break;
        }
        setCalculatedFee(fee);
      }
    }
  }, [appointmentData.doctor, appointmentData.appointmentType, doctors]);

  const steps = [
    { id: 'welcome', title: 'Welcome', icon: '👋', description: 'Choose your path' },
    { id: 'personal', title: 'Personal Info', icon: '👤', description: 'Basic details' },
    { id: 'contact', title: 'Contact Info', icon: '📧', description: 'Contact & address' },
    { id: 'medical', title: 'Medical Info', icon: '🏥', description: 'Medical history' },
    { id: 'post-registration', title: 'Options', icon: '🎯', description: 'Choose action' },
    { id: 'appointment', title: 'Appointment', icon: '📅', description: 'Book appointment' },
    { id: 'payment', title: 'Payment', icon: '💳', description: 'Payment details' },
    { id: 'confirmation', title: 'Confirm', icon: '✅', description: 'Review & submit' }
  ];

  const handlePatientInputChange = (field: keyof PatientFormData, value: any) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const handleAppointmentInputChange = (field: keyof AppointmentFormData, value: any) => {
    setAppointmentData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (!selectedValue) {
      setAppointmentData(prev => ({
        ...prev,
        appointmentStartTime: '',
        appointmentEndTime: '',
        duration: 30
      }));
      return;
    }

    try {
      const { startTime, endTime } = JSON.parse(selectedValue);
      const startDateTime = new Date(
        `${appointmentData.appointmentDate}T${startTime}:00+05:30`
      );
      const endDateTime = new Date(
        `${appointmentData.appointmentDate}T${endTime}:00+05:30`
      );

      const durationMinutes =
        (endDateTime.getTime() - startDateTime.getTime()) / 60000;

      setAppointmentData(prev => ({
        ...prev,
        appointmentStartTime: startDateTime.toISOString(),
        appointmentEndTime: endDateTime.toISOString(),
        duration: durationMinutes,
      }));
    } catch (error) {
      console.error("Invalid slot format", error);
    }
  };

  const handleDateChange = (name: string, date: Date | null) => {
    const formattedDate = date ? date.toISOString().split("T")[0] : "";

    setAppointmentData(prev => ({
      ...prev,
      [name]: formattedDate,
      // Reset time selection when date changes
      ...(name === 'appointmentDate' && {
        appointmentStartTime: '',
        appointmentEndTime: '',
      })
    }));

    // Clear error if exists
    if (errors[name as keyof AppointmentFormData]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const addTag = (field: 'allergies' | 'chronicConditions' | 'currentMedications', value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;
    
    const currentValues = patientData[field];
    if (!currentValues.includes(trimmedValue)) {
      handlePatientInputChange(field, [...currentValues, trimmedValue]);
    }
  };

  const removeTag = (field: 'allergies' | 'chronicConditions' | 'currentMedications', index: number) => {
    const currentValues = patientData[field];
    handlePatientInputChange(field, currentValues.filter((_, i) => i !== index));
  };

  const validateStep = (step: FormStep): boolean => {
    const newErrors: any = {};

    switch (step) {
      case 'personal':
        if (!patientData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!patientData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!patientData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!patientData.gender) newErrors.gender = 'Gender is required';
        break;

      case 'contact':
        if (!patientData.email.trim()) newErrors.email = 'Email is required';
        if (!/\S+@\S+\.\S+/.test(patientData.email)) newErrors.email = 'Invalid email format';
        if (!patientData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!/^[6-9]\d{9}$/.test(patientData.phone)) newErrors.phone = 'Invalid phone number';
        break;

      case 'medical':
        if (!patientData.password) newErrors.password = 'Password is required';
        if (patientData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (patientData.password !== patientData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        break;

      case 'appointment':
        if (!appointmentData.doctor) newErrors.doctor = 'Please select a doctor';
        if (!appointmentData.appointmentDate) newErrors.appointmentDate = 'Please select a date';
        if (!appointmentData.appointmentStartTime) newErrors.appointmentTime = 'Please select a time';
        if (!appointmentData.appointmentType) newErrors.appointmentType = 'Please select appointment type';
        break;

      case 'payment':
        if (!appointmentData.paymentMethod) newErrors.paymentMethod = 'Please select payment method';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (currentStep === 'medical' && validateStep(currentStep)) {
      // Create patient after medical step with loading state
      setIsCreatingPatient(true);
      try {
        const payload = {
          personalInfo: {
            firstName: patientData.firstName.trim(),
            lastName: patientData.lastName.trim(),
            dateOfBirth: patientData.dateOfBirth,
            gender: patientData.gender,
            ...(patientData.bloodGroup && { bloodGroup: patientData.bloodGroup }),
          },
          contactInfo: {
            email: patientData.email.trim().toLowerCase(),
            phone: patientData.phone.replace(/\D/g, ""),
            ...(patientData.alternatePhone && {
              alternatePhone: patientData.alternatePhone.replace(/\D/g, ""),
            }),
            address: {
              ...(patientData.street && { street: patientData.street.trim() }),
              ...(patientData.city && { city: patientData.city.trim() }),
              ...(patientData.state && { state: patientData.state.trim() }),
              ...(patientData.zipCode && { zipCode: patientData.zipCode.trim() }),
              country: patientData.country.trim(),
            },
          },
          medicalInfo: {
            ...(patientData.allergies.length > 0 && { allergies: patientData.allergies }),
            ...(patientData.chronicConditions.length > 0 && {
              chronicConditions: patientData.chronicConditions,
            }),
            ...(patientData.currentMedications.length > 0 && {
              currentMedications: patientData.currentMedications,
            }),
            ...(patientData.emergencyContactName && {
              emergencyContact: {
                name: patientData.emergencyContactName.trim(),
                ...(patientData.emergencyContactRelationship && {
                  relationship: patientData.emergencyContactRelationship.trim(),
                }),
                ...(patientData.emergencyContactPhone && {
                  phone: patientData.emergencyContactPhone.replace(/\D/g, ""),
                }),
              },
            }),
          },
          preferences: {
            preferredLanguage: patientData.preferredLanguage.trim(),
            communicationMethod: patientData.communicationMethod,
            reminderSettings: {
              enableReminders: patientData.enableReminders,
              reminderTime: patientData.reminderTime,
            },
          },
          registrationSource: 'website',
          authentication: { password: patientData.password },
        };

        const result = await createPatientMutation.mutateAsync(payload);
        console.log("result", result);
        setCreatedPatient(result?.patient);
        
        // Store patient session for future bookings
        sessionStorage.setItem('currentPatient', JSON.stringify(result?.patient));
        
        setCurrentStep('post-registration');
      } catch (error) {
        console.error('Error creating patient:', error);
        setErrors({ general: 'Failed to create patient. Please try again.' });
      } finally {
        setIsCreatingPatient(false);
      }
      return;
    }

    if (validateStep(currentStep)) {
      const currentIndex = steps.findIndex(step => step.id === currentStep);
      if (currentIndex < steps.length - 1) {
        let nextStep = steps[currentIndex + 1].id as FormStep;
        
        // Skip appointment and payment steps if not booking
        if (nextStep === 'appointment' && !showBookingOption) {
          nextStep = 'confirmation';
        }
        
        setCurrentStep(nextStep);
      }
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      let prevStep = steps[currentIndex - 1].id as FormStep;
      
      // Skip post-registration when going back from appointment
      if (currentStep === 'appointment' && prevStep === 'post-registration') {
        prevStep = 'medical';
      }
      
      setCurrentStep(prevStep);
    }
  };

  const handleBookAppointment = () => {
    setShowBookingOption(true);
    setCurrentStep('appointment');
  };

  const handleSkipAppointment = () => {
    setShowBookingOption(false);
    setCurrentStep('confirmation');
  };

  const handleLoginRedirect = () => {
    // Redirect to login page
    window.location.href = 'auth/login';
  };

  const handleNewPatientRegistration = () => {
    setIsNewPatient(true);
    setCurrentStep('personal');
  };

  const handleExistingPatientLogin = () => {
    setIsNewPatient(false);
    handleLoginRedirect();
  };

  const handleBookAnotherAppointment = () => {
    // Reset appointment data but keep patient data
    setAppointmentData({
      doctor: '',
      appointmentDate: '',
      appointmentStartTime: '',
      appointmentEndTime: '',
      duration: 30,
      appointmentType: '',
      priority: 'medium',
      symptoms: '',
      notes: '',
      specialRequirements: '',
      paymentMethod: '',
      referralSource: ''
    });
    setErrors({});
    setCalculatedFee(0);
    setAvailabilityData([]);
    setAvailableSlots([]);
    setShowBookingOption(true);
    setCurrentStep('appointment');
  };

  const handleSubmitAppointment = async () => {
    if (!validateStep('payment')) return;
    
    try {
      const appointmentPayload = {
        patient: createdPatient.id,
        doctor: appointmentData.doctor,
        appointmentDate: appointmentData.appointmentDate,
        appointmentStartTime: appointmentData.appointmentStartTime,
        appointmentEndTime: appointmentData.appointmentEndTime,
        duration: appointmentData.duration,
        appointmentType: appointmentData.appointmentType,
        status: 'scheduled',
        priority: appointmentData.priority,
        bookingSource: 'website',
        symptoms: appointmentData.symptoms ? appointmentData.symptoms.split(',').map(s => s.trim()).filter(Boolean) : [],
        notes: appointmentData.notes,
        specialRequirements: appointmentData.specialRequirements,
        remindersSent: 0,
        paymentStatus: 'pending',
        paymentAmount: calculatedFee,
        paymentMethod: appointmentData.paymentMethod || undefined,
        metadata: {
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          ...(appointmentData.referralSource && { referralSource: appointmentData.referralSource }),
        },
      };

      // Remove undefined values
      const cleanPayload = Object.fromEntries(
        Object.entries(appointmentPayload).filter(
          ([_, value]) => value !== undefined && value !== ""
        )
      );

      const appointmentResult = await bookAppointmentMutation.mutateAsync(cleanPayload);
      setBookedAppointment(appointmentResult);
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Error booking appointment:', error);
      setErrors({ general: 'Failed to book appointment. Please try again.' });
    }
  };

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  // Loading Screen for Patient Creation
  const renderPatientCreationLoading = () => (
    <LoadingOverlay>
      <LoadingContent>
        <ProfessionalLoader>
          <LoaderRing />
          <LoaderRing />
          <LoaderRing />
        </ProfessionalLoader>
        <LoadingTitle>Creating Your Patient Account</LoadingTitle>
        <LoadingMessage>
          Please wait while we set up your profile and secure your medical information...
        </LoadingMessage>
        <LoadingSteps>
          <LoadingStep completed>✓ Validating Information</LoadingStep>
          <LoadingStep active>🔄 Creating Account</LoadingStep>
          <LoadingStep>⏳ Setting Up Profile</LoadingStep>
          <LoadingStep>🔒 Securing Data</LoadingStep>
        </LoadingSteps>
      </LoadingContent>
    </LoadingOverlay>
  );

  const renderWelcome = () => (
    <WelcomeContent>
      <WelcomeHeader>
        <WelcomeIcon>🏥</WelcomeIcon>
        <WelcomeTitle>Welcome to Sujan Singh Dental</WelcomeTitle>
        <WelcomeSubtitle>Book your appointment with ease</WelcomeSubtitle>
      </WelcomeHeader>

      <OptionsGrid>
        <WelcomeOption onClick={handleNewPatientRegistration}>
          <OptionIcon>👤</OptionIcon>
          <OptionTitle>New Patient</OptionTitle>
          <OptionDescription>
            First time here? Create your patient account and book an appointment
          </OptionDescription>
          <OptionFeatures>
            <Feature>✓ Quick registration process</Feature>
            <Feature>✓ Secure medical records</Feature>
            <Feature>✓ Easy appointment booking</Feature>
          </OptionFeatures>
          <OptionButton>Get Started</OptionButton>
        </WelcomeOption>

        <WelcomeOption onClick={handleExistingPatientLogin}>
          <OptionIcon>🔐</OptionIcon>
          <OptionTitle>Existing Patient</OptionTitle>
          <OptionDescription>
            Already have an account? Login to book appointments and manage your profile
          </OptionDescription>
          <OptionFeatures>
            <Feature>✓ Access your medical history</Feature>
            <Feature>✓ View past appointments</Feature>
            <Feature>✓ Quick booking process</Feature>
          </OptionFeatures>
          <OptionButton variant="secondary">Login</OptionButton>
        </WelcomeOption>
      </OptionsGrid>
    </WelcomeContent>
  );

  const renderPersonalInfo = () => (
    <StepContent>
      <StepHeader>
        <StepIcon>👤</StepIcon>
        <div>
          <StepTitle>Personal Information</StepTitle>
          <StepDescription>Tell us about yourself</StepDescription>
        </div>
      </StepHeader>

      <FormGrid>
        <FormGroup>
          <Label>First Name *</Label>
          <Input
            value={patientData.firstName}
            onChange={(e) => handlePatientInputChange('firstName', e.target.value)}
            placeholder="Enter your first name"
            hasError={!!errors.firstName}
          />
          {errors.firstName && <ErrorText>{errors.firstName}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label>Last Name *</Label>
          <Input
            value={patientData.lastName}
            onChange={(e) => handlePatientInputChange('lastName', e.target.value)}
            placeholder="Enter your last name"
            hasError={!!errors.lastName}
          />
          {errors.lastName && <ErrorText>{errors.lastName}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label>Date of Birth *</Label>
          <Input
            type="date"
            value={patientData.dateOfBirth}
            onChange={(e) => handlePatientInputChange('dateOfBirth', e.target.value)}
            hasError={!!errors.dateOfBirth}
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.dateOfBirth && <ErrorText>{errors.dateOfBirth}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label>Gender *</Label>
          <Select
            value={patientData.gender}
            onChange={(e) => handlePatientInputChange('gender', e.target.value)}
            hasError={!!errors.gender}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
          {errors.gender && <ErrorText>{errors.gender}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label>Blood Group</Label>
          <Select
            value={patientData.bloodGroup}
            onChange={(e) => handlePatientInputChange('bloodGroup', e.target.value)}
          >
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
        </FormGroup>
      </FormGrid>
    </StepContent>
  );

  const renderContactInfo = () => (
    <StepContent>
      <StepHeader>
        <StepIcon>📧</StepIcon>
        <div>
          <StepTitle>Contact Information</StepTitle>
          <StepDescription>How can we reach you?</StepDescription>
        </div>
      </StepHeader>

      <FormGrid>
        <FormGroup className="full-width">
          <Label>Email Address *</Label>
          <Input
            type="email"
            value={patientData.email}
            onChange={(e) => handlePatientInputChange('email', e.target.value)}
            placeholder="Enter your email address"
            hasError={!!errors.email}
          />
          {errors.email && <ErrorText>{errors.email}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label>Phone Number *</Label>
          <Input
            value={patientData.phone}
            onChange={(e) => handlePatientInputChange('phone', e.target.value)}
            placeholder="Enter 10-digit mobile number"
            hasError={!!errors.phone}
          />
          {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label>Alternate Phone</Label>
          <Input
            value={patientData.alternatePhone}
            onChange={(e) => handlePatientInputChange('alternatePhone', e.target.value)}
            placeholder="Alternate phone number"
          />
        </FormGroup>

        <FormGroup className="full-width">
          <Label>Street Address</Label>
          <Input
            value={patientData.street}
            onChange={(e) => handlePatientInputChange('street', e.target.value)}
            placeholder="Enter your street address"
          />
        </FormGroup>

        <FormGroup>
          <Label>City</Label>
          <Input
            value={patientData.city}
            onChange={(e) => handlePatientInputChange('city', e.target.value)}
            placeholder="Enter your city"
          />
        </FormGroup>

        <FormGroup>
          <Label>State</Label>
          <Input
            value={patientData.state}
            onChange={(e) => handlePatientInputChange('state', e.target.value)}
            placeholder="Enter your state"
          />
        </FormGroup>

        <FormGroup>
          <Label>ZIP Code</Label>
          <Input
            value={patientData.zipCode}
            onChange={(e) => handlePatientInputChange('zipCode', e.target.value)}
            placeholder="Enter ZIP code"
          />
        </FormGroup>

        <FormGroup>
          <Label>Country</Label>
          <Input
            value={patientData.country}
            onChange={(e) => handlePatientInputChange('country', e.target.value)}
            placeholder="Enter your country"
          />
        </FormGroup>
      </FormGrid>
    </StepContent>
  );

  const renderMedicalInfo = () => (
    <StepContent>
      <StepHeader>
        <StepIcon>🏥</StepIcon>
        <div>
          <StepTitle>Medical Information & Security</StepTitle>
          <StepDescription>Medical history and account security</StepDescription>
        </div>
      </StepHeader>

      <FormGrid>
        <FormGroup className="full-width">
          <Label>Allergies</Label>
          <TagContainer>
            <TagsList>
              {patientData.allergies.map((tag, index) => (
                <Tag key={index}>
                  <TagText>{tag}</TagText>
                  <TagRemove onClick={() => removeTag('allergies', index)}>×</TagRemove>
                </Tag>
              ))}
              <TagInput
                placeholder="Type allergy and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = e.currentTarget.value.trim();
                    if (value) {
                      addTag('allergies', value);
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
            </TagsList>
          </TagContainer>
        </FormGroup>

        <FormGroup className="full-width">
          <Label>Chronic Conditions</Label>
          <TagContainer>
            <TagsList>
              {patientData.chronicConditions.map((tag, index) => (
                <Tag key={index}>
                  <TagText>{tag}</TagText>
                  <TagRemove onClick={() => removeTag('chronicConditions', index)}>×</TagRemove>
                </Tag>
              ))}
              <TagInput
                placeholder="Type condition and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = e.currentTarget.value.trim();
                    if (value) {
                      addTag('chronicConditions', value);
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
            </TagsList>
          </TagContainer>
        </FormGroup>

        <FormGroup className="full-width">
          <Label>Current Medications</Label>
          <TagContainer>
            <TagsList>
              {patientData.currentMedications.map((tag, index) => (
                <Tag key={index}>
                  <TagText>{tag}</TagText>
                  <TagRemove onClick={() => removeTag('currentMedications', index)}>×</TagRemove>
                </Tag>
              ))}
              <TagInput
                placeholder="Type medication and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = e.currentTarget.value.trim();
                    if (value) {
                      addTag('currentMedications', value);
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
            </TagsList>
          </TagContainer>
        </FormGroup>

        <SectionDivider>
          <SectionTitle>Emergency Contact</SectionTitle>
        </SectionDivider>

        <FormGroup>
          <Label>Contact Name</Label>
          <Input
            value={patientData.emergencyContactName}
            onChange={(e) => handlePatientInputChange('emergencyContactName', e.target.value)}
            placeholder="Emergency contact name"
          />
        </FormGroup>

        <FormGroup>
          <Label>Relationship</Label>
          <Input
            value={patientData.emergencyContactRelationship}
            onChange={(e) => handlePatientInputChange('emergencyContactRelationship', e.target.value)}
            placeholder="Relationship to you"
          />
        </FormGroup>

        <FormGroup>
          <Label>Contact Phone</Label>
          <Input
            value={patientData.emergencyContactPhone}
            onChange={(e) => handlePatientInputChange('emergencyContactPhone', e.target.value)}
            placeholder="Emergency contact phone"
          />
        </FormGroup>

        <SectionDivider>
          <SectionTitle>Account Security</SectionTitle>
        </SectionDivider>

        <FormGroup>
          <Label>Password *</Label>
          <Input
            type="password"
            value={patientData.password}
            onChange={(e) => handlePatientInputChange('password', e.target.value)}
            placeholder="Create a secure password"
            hasError={!!errors.password}
          />
          {errors.password && <ErrorText>{errors.password}</ErrorText>}
          <HelperText>Minimum 8 characters with uppercase and special character</HelperText>
        </FormGroup>

        <FormGroup>
          <Label>Confirm Password *</Label>
          <Input
            type="password"
            value={patientData.confirmPassword}
            onChange={(e) => handlePatientInputChange('confirmPassword', e.target.value)}
            placeholder="Confirm your password"
            hasError={!!errors.confirmPassword}
          />
          {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
        </FormGroup>
      </FormGrid>
    </StepContent>
  );

  const renderPostRegistration = () => (
    <StepContent>
      <PostRegHeader>
        <PostRegIcon>🎉</PostRegIcon>
        <PostRegTitle>Registration Successful!</PostRegTitle>
        <PostRegMessage>
          Welcome, {createdPatient?.fullName}! Your patient account has been created successfully.
        </PostRegMessage>
        <PatientIdCard>
          <PatientIdLabel>Your Patient ID:</PatientIdLabel>
          <PatientIdValue>{createdPatient?.patientId}</PatientIdValue>
        </PatientIdCard>
      </PostRegHeader>

      <OptionsContainer>
        <OptionCard onClick={handleBookAppointment}>
          <OptionIcon>📅</OptionIcon>
          <OptionTitle>Book Appointment</OptionTitle>
          <OptionDescription>Schedule an appointment with our doctors</OptionDescription>
          <OptionButton>Book Now</OptionButton>
        </OptionCard>

        <OptionCard onClick={handleSkipAppointment}>
          <OptionIcon>📋</OptionIcon>
          <OptionTitle>Complete Registration</OptionTitle>
          <OptionDescription>Finish registration and book appointment later</OptionDescription>
          <OptionButton variant="secondary">Complete</OptionButton>
        </OptionCard>
      </OptionsContainer>
    </StepContent>
  );

  const renderAppointment = () => {
    if (doctorsLoading) {
      return (
        <StepContent>
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Loading doctors...</LoadingText>
          </LoadingContainer>
        </StepContent>
      );
    }

    return (
      <StepContent>
        <StepHeader>
          <StepIcon>📅</StepIcon>
          <div>
            <StepTitle>Book Your Appointment</StepTitle>
            <StepDescription>Choose your preferred doctor and time</StepDescription>
          </div>
        </StepHeader>

        <FormGrid>
          <FormGroup className="full-width">
            <Label>Select Doctor *</Label>
            <DoctorGrid>
              {doctors?.data?.doctors?.map((doctor) => (
                <DoctorCard
                  key={doctor._id}
                  selected={appointmentData.doctor === doctor._id}
                  onClick={() => handleAppointmentInputChange('doctor', doctor._id)}
                >
                  <DoctorAvatar>
                    {doctor.personalInfo.firstName[0]}{doctor.personalInfo.lastName[0]}
                  </DoctorAvatar>
                  <DoctorInfo>
                    <DoctorName>Dr. {doctor.personalInfo.firstName} {doctor.personalInfo.lastName}</DoctorName>
                    <DoctorSpecialty>{doctor.professionalInfo.specialization}</DoctorSpecialty>
                    <DoctorExperience>{doctor.professionalInfo.experience} years experience</DoctorExperience>
                  </DoctorInfo>
                  <DoctorFees>
                    <FeeItem>Consultation: ₹{doctor.fees?.consultationFee || 0}</FeeItem>
                    <FeeItem>Follow-up: ₹{doctor.fees?.followUpFee || 0}</FeeItem>
                  </DoctorFees>
                </DoctorCard>
              ))}
            </DoctorGrid>
            {errors.doctor && <ErrorText>{errors.doctor}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label>Appointment Type *</Label>
            <Select
              value={appointmentData.appointmentType}
              onChange={(e) => handleAppointmentInputChange('appointmentType', e.target.value)}
              hasError={!!errors.appointmentType}
            >
              <option value="">Select type</option>
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-up</option>
              <option value="emergency">Emergency</option>
            </Select>
            {errors.appointmentType && <ErrorText>{errors.appointmentType}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label>Appointment Date *</Label>
            <DatePickerWrapper>
              <DatePicker
                selected={
                  appointmentData.appointmentDate
                    ? new Date(appointmentData.appointmentDate)
                    : null
                }
                onChange={(date) => handleDateChange("appointmentDate", date)}
                filterDate={isDateAvailable}
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select appointment date"
                disabled={!appointmentData.doctor || loadingAvailability}
                customInput={
                  <CustomDateInput 
                    hasError={!!errors.appointmentDate}
                    disabled={!appointmentData.doctor || loadingAvailability}
                  />
                }
              />
              {loadingAvailability && (
                <DatePickerLoading>
                  <MiniSpinner />
                  Loading availability...
                </DatePickerLoading>
              )}
            </DatePickerWrapper>
            {errors.appointmentDate && <ErrorText>{errors.appointmentDate}</ErrorText>}
            {!appointmentData.doctor && (
              <HelperText>Please select a doctor first to view available dates</HelperText>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Appointment Time *</Label>
            <Select
              value={
                appointmentData.appointmentStartTime && appointmentData.appointmentEndTime
                  ? JSON.stringify({
                      startTime: new Date(appointmentData.appointmentStartTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                      endTime: new Date(appointmentData.appointmentEndTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                    })
                  : ""
              }
              onChange={handleSlotChange}
              hasError={!!errors.appointmentTime}
              disabled={!appointmentData.appointmentDate || loadingSlots}
            >
              <option value="">
                {loadingSlots ? "Loading time slots..." : "Select a time"}
              </option>
              {availableSlots
                .filter((slot) => slot?.available)
                .map((slot, index) => (
                  <option
                    key={`${slot.dateTime}-${index}`}
                    value={JSON.stringify({
                      startTime: slot.startTime,
                      endTime: slot.endTime,
                    })}
                  >
                    {slot.startTime} - {slot.endTime}
                  </option>
                ))}
            </Select>
            {errors.appointmentTime && <ErrorText>{errors.appointmentTime}</ErrorText>}
            {!appointmentData.appointmentDate && (
              <HelperText>Please select a date first to view available time slots</HelperText>
            )}
            {appointmentData.appointmentDate && availableSlots.length === 0 && !loadingSlots && (
              <HelperText style={{ color: '#ef4444' }}>No available slots for this date</HelperText>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Priority</Label>
            <Select
              value={appointmentData.priority}
              onChange={(e) => handleAppointmentInputChange('priority', e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </FormGroup>

          <FormGroup className="full-width">
            <Label>Symptoms</Label>
            <TextArea
              value={appointmentData.symptoms}
              onChange={(e) => handleAppointmentInputChange('symptoms', e.target.value)}
              placeholder="Describe your symptoms (separate multiple symptoms with commas)"
              rows={3}
            />
            <HelperText>Separate multiple symptoms with commas</HelperText>
          </FormGroup>

          <FormGroup className="full-width">
            <Label>Additional Notes</Label>
            <TextArea
              value={appointmentData.notes}
              onChange={(e) => handleAppointmentInputChange('notes', e.target.value)}
              placeholder="Any additional notes or special requirements"
              rows={3}
            />
          </FormGroup>

          <FormGroup>
            <Label>How did you hear about us?</Label>
            <Input
              value={appointmentData.referralSource}
              onChange={(e) => handleAppointmentInputChange('referralSource', e.target.value)}
              placeholder="e.g., Google, Facebook, Friend referral"
            />
          </FormGroup>

          {calculatedFee > 0 && (
            <FeeCard className="full-width">
              <FeeCardHeader>
                <FeeIcon>💰</FeeIcon>
                <FeeTitle>Consultation Fee</FeeTitle>
              </FeeCardHeader>
              <FeeAmount>₹{calculatedFee.toLocaleString()}</FeeAmount>
              <FeeDescription>
                {appointmentData.appointmentType.replace(/\b\w/g, l => l.toUpperCase())} with{' '}
                Dr. {doctors?.data?.doctors?.find(d => d._id === appointmentData.doctor)?.personalInfo?.firstName} {doctors?.data?.doctors?.find(d => d._id === appointmentData.doctor)?.personalInfo?.lastName}
              </FeeDescription>
            </FeeCard>
          )}
        </FormGrid>
      </StepContent>
    );
  };

  const renderPayment = () => (
    <StepContent>
      <StepHeader>
        <StepIcon>💳</StepIcon>
        <div>
          <StepTitle>Payment Information</StepTitle>
          <StepDescription>Choose your payment method</StepDescription>
        </div>
      </StepHeader>

      <FormGrid>
        <FormGroup className="full-width">
          <Label>Payment Method *</Label>
          <PaymentGrid>
            {[
              { id: 'upi', name: 'UPI', icon: '📱', description: 'Pay with UPI apps' },
              { id: 'card', name: 'Card', icon: '💳', description: 'Credit/Debit card' },
              { id: 'netbanking', name: 'Net Banking', icon: '🏦', description: 'Online banking' },
              { id: 'wallet', name: 'Wallet', icon: '💰', description: 'Digital wallets' },
              { id: 'cash', name: 'Cash', icon: '💵', description: 'Pay at clinic' }
            ].map((method) => (
              <PaymentCard
                key={method.id}
                selected={appointmentData.paymentMethod === method.id}
                onClick={() => handleAppointmentInputChange('paymentMethod', method.id)}
              >
                <PaymentIcon>{method.icon}</PaymentIcon>
                <PaymentName>{method.name}</PaymentName>
                <PaymentDescription>{method.description}</PaymentDescription>
              </PaymentCard>
            ))}
          </PaymentGrid>
          {errors.paymentMethod && <ErrorText>{errors.paymentMethod}</ErrorText>}
        </FormGroup>

        <SummaryCard className="full-width">
          <SummaryHeader>
            <SummaryIcon>📋</SummaryIcon>
            <SummaryTitle>Booking Summary</SummaryTitle>
          </SummaryHeader>
          <SummaryContent>
            <SummaryRow>
              <SummaryLabel>Patient:</SummaryLabel>
              <SummaryValue>{createdPatient?.fullName}</SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel>Patient ID:</SummaryLabel>
              <SummaryValue>{createdPatient?.patientId}</SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel>Doctor:</SummaryLabel>
              <SummaryValue>
                Dr. {doctors?.data?.doctors?.find(d => d._id === appointmentData.doctor)?.personalInfo?.firstName} {doctors?.data?.doctors?.find(d => d._id === appointmentData.doctor)?.personalInfo?.lastName}
              </SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel>Specialization:</SummaryLabel>
              <SummaryValue>
                {doctors?.data?.doctors?.find(d => d._id === appointmentData.doctor)?.professionalInfo?.specialization}
              </SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel>Date & Time:</SummaryLabel>
              <SummaryValue>
                {appointmentData.appointmentDate} at {appointmentData.appointmentStartTime ? new Date(appointmentData.appointmentStartTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'Not selected'}
              </SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel>Type:</SummaryLabel>
              <SummaryValue>
                {appointmentData.appointmentType.replace(/\b\w/g, l => l.toUpperCase())}
              </SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel>Duration:</SummaryLabel>
              <SummaryValue>{appointmentData.duration} minutes</SummaryValue>
            </SummaryRow>
            <SummaryDivider />
            <SummaryRow>
              <SummaryLabel>Total Fee:</SummaryLabel>
              <SummaryTotal>₹{calculatedFee.toLocaleString()}</SummaryTotal>
            </SummaryRow>
          </SummaryContent>
        </SummaryCard>
      </FormGrid>
    </StepContent>
  );

  const renderConfirmation = () => (
    <ConfirmationContent>
      <ConfirmationIcon>🎉</ConfirmationIcon>
      <ConfirmationTitle>
        {showBookingOption ? 'Appointment Booked!' : 'Registration Complete!'}
      </ConfirmationTitle>
      <ConfirmationMessage>
        {showBookingOption 
          ? 'Your appointment has been successfully booked. You will receive a confirmation email shortly.'
          : 'Your patient account has been created successfully. You can book appointments anytime from your dashboard.'
        }
      </ConfirmationMessage>
      
      <ConfirmationDetails>
        <DetailRow>
          <DetailLabel>Patient ID:</DetailLabel>
          <DetailValue>{createdPatient?.patientId}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Patient:</DetailLabel>
          <DetailValue>{createdPatient?.fullName}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Email:</DetailLabel>
          <DetailValue>{createdPatient?.contactInfo?.email}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Phone:</DetailLabel>
          <DetailValue>{createdPatient?.contactInfo?.phone}</DetailValue>
        </DetailRow>
        {showBookingOption && (
          <>
            <DetailRow>
              <DetailLabel>Appointment ID:</DetailLabel>
              <DetailValue>#APT-{Math.random().toString(36).substr(2, 9).toUpperCase()}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Doctor:</DetailLabel>
              <DetailValue>Dr. {doctors?.data?.doctors?.find(d => d._id === appointmentData.doctor)?.personalInfo?.firstName} {doctors?.data?.doctors?.find(d => d._id === appointmentData.doctor)?.personalInfo?.lastName}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Date & Time:</DetailLabel>
              <DetailValue>
                {appointmentData.appointmentDate} at {appointmentData.appointmentStartTime ? new Date(appointmentData.appointmentStartTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'Not selected'}
              </DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Duration:</DetailLabel>
              <DetailValue>{appointmentData.duration} minutes</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Fee Paid:</DetailLabel>
              <DetailValue>₹{calculatedFee.toLocaleString()}</DetailValue>
            </DetailRow>
          </>
        )}
      </ConfirmationDetails>

      <ConfirmationActions>
        <ActionButton onClick={() => window.print()}>📄 Download Receipt</ActionButton>
        {showBookingOption ? (
          <ActionButton variant="secondary" onClick={handleBookAnotherAppointment}>
            📅 Book Another Appointment
          </ActionButton>
        ) : (
          <ActionButton variant="secondary" onClick={() => window.location.reload()}>
            👤 Register Another Patient
          </ActionButton>
        )}
      </ConfirmationActions>
    </ConfirmationContent>
  );

  const getVisibleSteps = () => {
    if (currentStep === 'welcome') {
      return [steps[0]]; // Only show welcome step
    }
    if (!showBookingOption && currentStep !== 'post-registration') {
      return steps.filter(step => !['welcome', 'appointment', 'payment'].includes(step.id));
    }
    return steps.filter(step => step.id !== 'welcome');
  };

  const visibleSteps = getVisibleSteps();
  const visibleCurrentStepIndex = visibleSteps.findIndex(step => step.id === currentStep);
  const visibleProgressPercentage = ((visibleCurrentStepIndex + 1) / visibleSteps.length) * 100;

  // Show loading overlay when creating patient
  if (isCreatingPatient) {
    return (
      <PlatformContainer>
        <Toaster position="top-right" />
        {renderPatientCreationLoading()}
      </PlatformContainer>
    );
  }

  return (
    <PlatformContainer>
      <Toaster position="top-right" />

      {/* Progress Indicator - Hidden on welcome step */}
      {currentStep !== 'welcome' && (
        <ProgressContainer>
          <ProgressHeader>
            <ProgressTitle>
              {showBookingOption 
                ? 'Complete Your Registration & Booking' 
                : 'Complete Your Registration'
              }
            </ProgressTitle>
            <ProgressText>Step {visibleCurrentStepIndex + 1} of {visibleSteps.length}</ProgressText>
          </ProgressHeader>
          
          <ProgressBar>
            <ProgressFill percentage={visibleProgressPercentage} />
          </ProgressBar>
          
          <StepIndicators>
            {visibleSteps.map((step, index) => (
              <StepIndicator
                key={step.id}
                active={step.id === currentStep}
                completed={index < visibleCurrentStepIndex}
              >
                <StepIndicatorIcon>{step.icon}</StepIndicatorIcon>
                <StepIndicatorTitle>{step.title}</StepIndicatorTitle>
                <StepIndicatorDescription>{step.description}</StepIndicatorDescription>
              </StepIndicator>
            ))}
          </StepIndicators>
        </ProgressContainer>
      )}

      {/* Main Content */}
      <MainContainer>
        <FormCard>
          {currentStep === 'welcome' && renderWelcome()}
          {currentStep === 'personal' && renderPersonalInfo()}
          {currentStep === 'contact' && renderContactInfo()}
          {currentStep === 'medical' && renderMedicalInfo()}
          {currentStep === 'post-registration' && renderPostRegistration()}
          {currentStep === 'appointment' && renderAppointment()}
          {currentStep === 'payment' && renderPayment()}
          {currentStep === 'confirmation' && renderConfirmation()}
        </FormCard>

        {/* Form Actions - Hidden on welcome and confirmation steps */}
        {!['confirmation', 'post-registration', 'welcome'].includes(currentStep) && (
          <FormActions>
            <ActionButton
              variant="secondary"
              onClick={handleBack}
              disabled={visibleCurrentStepIndex === 0}
            >
              ← Back
            </ActionButton>

            {currentStep === 'payment' ? (
              <ActionButton 
                onClick={handleSubmitAppointment} 
                disabled={bookAppointmentMutation.isLoading}
              >
                {bookAppointmentMutation.isLoading ? 'Booking...' : 'Complete Booking'}
              </ActionButton>
            ) : (
              <ActionButton 
                onClick={handleNext}
                disabled={createPatientMutation.isLoading || isCreatingPatient}
              >
                {(createPatientMutation.isLoading || isCreatingPatient) ? 'Creating Account...' : 'Next Step →'}
              </ActionButton>
            )}
          </FormActions>
        )}
      </MainContainer>
    </PlatformContainer>
  );
};

// Custom DatePicker Input Component
const CustomDateInput = React.forwardRef<HTMLInputElement, any>(({ value, onClick, hasError, disabled }, ref) => (
  <Input
    ref={ref}
    value={value}
    onClick={onClick}
    readOnly
    placeholder="Select appointment date"
    hasError={hasError}
    disabled={disabled}
    style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
  />
));

// Styled Components

// Loading Animation Keyframes
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Loading Overlay Components
const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const LoadingContent = styled.div`
  text-align: center;
  color: white;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const ProfessionalLoader = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 24px auto;
`;

const LoaderRing = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: ${spin} 1.2s linear infinite;

  &:nth-child(1) {
    animation-delay: 0s;
  }

  &:nth-child(2) {
    width: 60px;
    height: 60px;
    top: 10px;
    left: 10px;
    border-top-color: rgba(255, 255, 255, 0.6);
    animation-delay: 0.3s;
    animation-direction: reverse;
  }

  &:nth-child(3) {
    width: 40px;
    height: 40px;
    top: 20px;
    left: 20px;
    border-top-color: rgba(255, 255, 255, 0.4);
    animation-delay: 0.6s;
  }
`;

const LoadingTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: white;
`;

const LoadingMessage = styled.p`
  font-size: 16px;
  margin: 0 0 32px 0;
  opacity: 0.9;
  max-width: 400px;
  line-height: 1.5;
`;

const LoadingSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`;

const LoadingStep = styled.div<{ completed?: boolean; active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  opacity: ${props => props.completed ? 1 : props.active ? 0.8 : 0.5};
  animation: ${props => props.active ? pulse : 'none'} 1.5s ease-in-out infinite;
`;

// Welcome Page Components
const WelcomeContent = styled.div`
  padding: 40px 32px;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

const WelcomeHeader = styled.div`
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    margin-bottom: 32px;
  }
`;

const WelcomeIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 48px;
    margin-bottom: 12px;
  }
`;

const WelcomeTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 18px;
  color: #6b7280;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const WelcomeOption = styled.div`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.15);
  }
  
  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`;

const OptionFeatures = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 16px 0 24px 0;
  text-align: left;
`;

const Feature = styled.div`
  font-size: 14px;
  color: #059669;
  font-weight: 500;
`;

const PlatformContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const PlatformHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const HeaderLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const LogoIcon = styled.div`
  font-size: 32px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const LogoText = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const HeaderSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  margin: 0;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const ProgressContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto 30px auto;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    margin: 0 auto 20px auto;
    padding: 16px;
    border-radius: 12px;
  }
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
    text-align: center;
    margin-bottom: 16px;
  }
`;

const ProgressTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const ProgressText = styled.span`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
`;

const ProgressFill = styled.div<{ percentage: number }>`
  width: ${props => props.percentage}%;
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const StepIndicators = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 8px;
  }
`;

const StepIndicator = styled.div<{ active: boolean; completed: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 12px;
  border-radius: 12px;
  background: ${props => 
    props.active ? 'linear-gradient(135deg, #667eea, #764ba2)' :
    props.completed ? '#10b981' : '#f9fafb'
  };
  color: ${props => props.active || props.completed ? 'white' : '#6b7280'};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 768px) {
    padding: 8px;
    border-radius: 8px;
  }
`;

const StepIndicatorIcon = styled.div`
  font-size: 20px;
  margin-bottom: 6px;
  
  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 4px;
  }
`;

const StepIndicatorTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 2px;
  
  @media (max-width: 768px) {
    font-size: 10px;
  }
`;

const StepIndicatorDescription = styled.div`
  font-size: 10px;
  opacity: 0.8;
  
  @media (max-width: 768px) {
    font-size: 9px;
  }
`;

const MainContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const FormCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    border-radius: 12px;
    margin-bottom: 16px;
  }
`;

const StepContent = styled.div`
  padding: 32px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  text-align: left;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 12px;
    margin-bottom: 24px;
  }
`;

const StepIcon = styled.div`
  font-size: 32px;
  padding: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: grayscale(0.8);
  
  @media (max-width: 768px) {
    font-size: 24px;
    width: 48px;
    height: 48px;
    padding: 8px;
  }
`;

const StepTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const StepDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const MiniSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
`;

const DatePickerWrapper = styled.div`
  position: relative;
  
  .react-datepicker-wrapper {
    width: 100%;
  }
  
  .react-datepicker__input-container {
    width: 100%;
  }
`;

const DatePickerLoading = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  
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
  border: 2px solid ${props => props.hasError ? '#ef4444' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
  padding: 12px 16px;
  border: 2px solid ${props => props.hasError ? '#ef4444' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
    opacity: 0.6;
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
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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

const SectionDivider = styled.div`
  grid-column: 1 / -1;
  margin: 20px 0 10px 0;
`;

const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
`;

// Post Registration Components
const PostRegHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const PostRegIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const PostRegTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #059669;
  margin: 0 0 12px 0;
`;

const PostRegMessage = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const PatientIdCard = styled.div`
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 12px;
  padding: 16px;
  display: inline-block;
  margin-bottom: 24px;
`;

const PatientIdLabel = styled.div`
  font-size: 12px;
  color: #0369a1;
  font-weight: 500;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PatientIdValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #0c4a6e;
  font-family: 'Courier New', monospace;
`;

const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const OptionCard = styled.div`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
  }
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const OptionIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 40px;
    margin-bottom: 12px;
  }
`;

const OptionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const OptionDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 20px 0;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 13px;
    margin: 0 0 16px 0;
  }
`;

const OptionButton = styled.button<{ variant?: 'secondary' }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  
  ${props => props.variant === 'secondary' ? `
    background: white;
    color: #374151;
    border: 2px solid #d1d5db;
    
    &:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }
  ` : `
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: 2px solid transparent;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
  `}
`;

// Tag Components
const TagContainer = styled.div`
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  background: white;
  transition: all 0.2s ease;
  
  &:focus-within {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
  background: #667eea20;
  border: 1px solid #667eea50;
  border-radius: 20px;
  padding: 4px 8px 4px 12px;
  font-size: 12px;
  color: #667eea;
`;

const TagText = styled.span`
  margin-right: 6px;
`;

const TagRemove = styled.button`
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: #667eea20;
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

// Doctor Selection Components
const DoctorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DoctorCard = styled.div<{ selected: boolean }>`
  border: 2px solid ${props => props.selected ? '#667eea' : '#e5e7eb'};
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.selected ? '#667eea10' : 'white'};
  
  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }
`;

const DoctorAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 12px;
`;

const DoctorInfo = styled.div`
  margin-bottom: 12px;
`;

const DoctorName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
`;

const DoctorSpecialty = styled.div`
  font-size: 14px;
  color: #667eea;
  font-weight: 500;
  margin-bottom: 2px;
`;

const DoctorExperience = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const DoctorFees = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const FeeItem = styled.div`
  font-size: 12px;
  color: #374151;
`;

// Payment Components
const PaymentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const PaymentCard = styled.div<{ selected: boolean }>`
  border: 2px solid ${props => props.selected ? '#667eea' : '#e5e7eb'};
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.selected ? '#667eea10' : 'white'};
  
  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
  }
`;

const PaymentIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const PaymentName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
`;

const PaymentDescription = styled.div`
  font-size: 11px;
  color: #6b7280;
`;

const FeeCard = styled.div`
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
`;

const FeeCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const FeeIcon = styled.div`
  font-size: 18px;
`;

const FeeTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #0369a1;
`;

const FeeAmount = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #0c4a6e;
  margin-bottom: 4px;
`;

const FeeDescription = styled.div`
  font-size: 12px;
  color: #0369a1;
`;

// Summary Components
const SummaryCard = styled.div`
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
`;

const SummaryHeader = styled.div`
  background: #1f2937;
  color: white;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SummaryIcon = styled.div`
  font-size: 18px;
`;

const SummaryTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
`;

const SummaryContent = styled.div`
  padding: 16px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SummaryLabel = styled.span`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
`;

const SummaryValue = styled.span`
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
  text-align: right;
`;

const SummaryTotal = styled.span`
  font-size: 18px;
  color: #059669;
  font-weight: 700;
`;

const SummaryDivider = styled.div`
  height: 1px;
  background: #d1d5db;
  margin: 12px 0;
`;

// Confirmation Components
const ConfirmationContent = styled.div`
  text-align: center;
  padding: 40px 32px;
  
  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

const ConfirmationIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 48px;
    margin-bottom: 16px;
  }
`;

const ConfirmationTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #059669;
  margin: 0 0 12px 0;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const ConfirmationMessage = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 32px 0;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 14px;
    margin: 0 0 24px 0;
  }
`;

const ConfirmationDetails = styled.div`
  background: #f9fafb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  text-align: left;
  
  @media (max-width: 768px) {
    padding: 16px;
    margin-bottom: 24px;
  }
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
`;

const DetailLabel = styled.span`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
`;

const DetailValue = styled.span`
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ConfirmationActions = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column-reverse;
    gap: 12px;
  }
`;

const ActionButton = styled.button<{ variant?: 'secondary' }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 140px;
  
  ${props => props.variant === 'secondary' ? `
    background: white;
    color: #374151;
    border: 2px solid #d1d5db;
    
    &:hover:not(:disabled) {
      background: #f9fafb;
      border-color: #9ca3af;
    }
  ` : `
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: 2px solid transparent;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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

export default PublicBookingPlatform;