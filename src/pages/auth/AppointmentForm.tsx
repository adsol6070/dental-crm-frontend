import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const theme = {
  colors: {
    primary: '#6366f1',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b'
  }
};

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | '';
  
  // Address (Optional)
  street: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Medical Information (Optional)
  symptoms: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  
  // Emergency Contact (Optional)
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  
  // Appointment Details
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: 'consultation' | 'follow-up' | 'emergency' | '';
  specialRequirements: string;
  
  // Preferences
  preferredLanguage: string;
  communicationMethod: 'email' | 'sms' | 'whatsapp' | 'phone';
  
  // How did you hear about us
  referralSource: string;
}

// Mock doctors data - replace with actual API call
const mockDoctors = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialization: 'Cardiology',
    fees: { consultation: 1500, followUp: 800, emergency: 2500 }
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialization: 'Neurology',
    fees: { consultation: 1800, followUp: 900, emergency: 3000 }
  },
  {
    id: '3',
    name: 'Dr. Priya Sharma',
    specialization: 'General Medicine',
    fees: { consultation: 800, followUp: 500, emergency: 1500 }
  },
  {
    id: '4',
    name: 'Dr. Robert Wilson',
    specialization: 'Orthopedics',
    fees: { consultation: 1200, followUp: 700, emergency: 2000 }
  }
];

type StepType = 'personal' | 'medical' | 'appointment' | 'confirmation';

const steps = [
  {
    id: 'personal',
    title: 'Personal Information',
    subtitle: 'Tell us about yourself',
    icon: '👤'
  },
  {
    id: 'medical',
    title: 'Medical Information',
    subtitle: 'Your health details (optional)',
    icon: '🏥'
  },
  {
    id: 'appointment',
    title: 'Book Appointment',
    subtitle: 'Schedule your visit',
    icon: '📅'
  },
  {
    id: 'confirmation',
    title: 'Confirmation',
    subtitle: 'Review and confirm',
    icon: '✓'
  }
];

const PublicBookingForm = () => {
  const [currentStep, setCurrentStep] = useState<StepType>('personal');
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    symptoms: '',
    allergies: [],
    chronicConditions: [],
    currentMedications: [],
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: '',
    specialRequirements: '',
    preferredLanguage: 'English',
    communicationMethod: 'email',
    referralSource: ''
  });

  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [calculatedFee, setCalculatedFee] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate fee when doctor and appointment type change
  useEffect(() => {
    if (selectedDoctor && formData.appointmentType) {
      const doctor = mockDoctors.find(d => d.id === selectedDoctor);
      if (doctor?.fees) {
        let fee = 0;
        if (formData.appointmentType === 'consultation') {
          fee = doctor.fees.consultation;
        } else if (formData.appointmentType === 'follow-up') {
          fee = doctor.fees.followUp;
        } else if (formData.appointmentType === 'emergency') {
          fee = doctor.fees.emergency;
        }
        setCalculatedFee(fee);
      }
    } else {
      setCalculatedFee(0);
    }
  }, [selectedDoctor, formData.appointmentType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Tag management functions
  const addTag = (field: 'allergies' | 'chronicConditions' | 'currentMedications', value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    const currentValues = formData[field];
    if (!currentValues.includes(trimmedValue)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...currentValues, trimmedValue]
      }));
    }
  };

  const removeTag = (field: 'allergies' | 'chronicConditions' | 'currentMedications', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: StepType): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (step === 'personal') {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      
      // Email validation
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      // Phone validation (Indian format)
      if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }
    }
    
    if (step === 'appointment') {
      if (!selectedDoctor) newErrors.selectedDoctor = 'Please select a doctor' as any;
      if (!formData.appointmentDate) newErrors.appointmentDate = 'Appointment date is required';
      if (!formData.appointmentTime) newErrors.appointmentTime = 'Appointment time is required';
      if (!formData.appointmentType) newErrors.appointmentType = 'Appointment type is required';
      
      // Date validation - should not be in the past
      if (formData.appointmentDate) {
        const selectedDate = new Date(formData.appointmentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          newErrors.appointmentDate = 'Appointment date cannot be in the past';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const stepIndex = steps.findIndex(s => s.id === currentStep);
      if (stepIndex < steps.length - 1) {
        setCurrentStep(steps[stepIndex + 1].id as StepType);
      }
    }
  };

  const handleBack = () => {
    const stepIndex = steps.findIndex(s => s.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id as StepType);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep('appointment')) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would make actual API calls to:
      // 1. Create patient account
      // 2. Book appointment
      // 3. Send confirmation email/SMS
      
      console.log('Booking submitted:', {
        patient: formData,
        doctor: selectedDoctor,
        fee: calculatedFee
      });
      
      alert('Appointment booked successfully! You will receive a confirmation email shortly.');
    } catch (error) {
      console.error('Booking error:', error);
      alert('There was an error booking your appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;
  const today = new Date().toISOString().split('T')[0];

  return (
    <PageContainer>
      <FormContainer>
        {/* Header */}
        <FormHeader>
          <HeaderContent>
            <Title>Book Your Appointment</Title>
            <Subtitle>Register and schedule your visit in just a few steps</Subtitle>
          </HeaderContent>
          <ProgressIndicator>
            <ProgressText>Step {currentStepIndex + 1} of {steps.length}</ProgressText>
            <ProgressBar>
              <ProgressFill percentage={progressPercentage} />
            </ProgressBar>
          </ProgressIndicator>
        </FormHeader>

        {/* Step Indicator */}
        <StepIndicator>
          {steps.map((step, index) => (
            <StepItem key={step.id} active={step.id === currentStep} completed={index < currentStepIndex}>
              <StepIcon active={step.id === currentStep} completed={index < currentStepIndex}>
                {index < currentStepIndex ? '✓' : step.icon}
              </StepIcon>
              <StepContent>
                <StepTitle active={step.id === currentStep}>{step.title}</StepTitle>
                <StepSubtitle>{step.subtitle}</StepSubtitle>
              </StepContent>
            </StepItem>
          ))}
        </StepIndicator>

        {/* Form Content */}
        <FormContent>
          {/* Personal Information Step */}
          {currentStep === 'personal' && (
            <StepContainer>
              <SectionHeader>
                <SectionTitle>Personal Information</SectionTitle>
                <SectionDescription>Please provide your basic details to create your account</SectionDescription>
              </SectionHeader>

              <FormGrid>
                <FormGroup>
                  <Label>First Name *</Label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    hasError={!!errors.firstName}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && <ErrorText>{errors.firstName}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <Label>Last Name *</Label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    hasError={!!errors.lastName}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && <ErrorText>{errors.lastName}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    hasError={!!errors.email}
                    placeholder="Enter your email address"
                  />
                  {errors.email && <ErrorText>{errors.email}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <Label>Phone Number *</Label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    hasError={!!errors.phone}
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                  />
                  {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <Label>Date of Birth *</Label>
                  <Input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    hasError={!!errors.dateOfBirth}
                    max={today}
                  />
                  {errors.dateOfBirth && <ErrorText>{errors.dateOfBirth}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <Label>Gender *</Label>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    hasError={!!errors.gender}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                  {errors.gender && <ErrorText>{errors.gender}</ErrorText>}
                </FormGroup>

                <FormGroup className="full-width">
                  <Label>Street Address (Optional)</Label>
                  <Input
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="Enter your street address"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>City</Label>
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>State</Label>
                  <Input
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Enter your state"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Zip Code</Label>
                  <Input
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="Enter zip code"
                  />
                </FormGroup>
              </FormGrid>
            </StepContainer>
          )}

          {/* Medical Information Step */}
          {currentStep === 'medical' && (
            <StepContainer>
              <SectionHeader>
                <SectionTitle>Medical Information</SectionTitle>
                <SectionDescription>Help us understand your health needs better (all fields are optional)</SectionDescription>
              </SectionHeader>

              <FormGrid>
                <FormGroup className="full-width">
                  <Label>Current Symptoms</Label>
                  <TextArea
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleInputChange}
                    placeholder="Describe your current symptoms or reason for visit"
                    rows={3}
                  />
                </FormGroup>

                <FormGroup className="full-width">
                  <Label>Allergies</Label>
                  <TagInputContainer>
                    <TagsList>
                      {formData.allergies.map((tag, index) => (
                        <Tag key={index}>
                          <TagText>{tag}</TagText>
                          <TagRemove onClick={() => removeTag('allergies', index)}>×</TagRemove>
                        </Tag>
                      ))}
                      <TagInput
                        placeholder={formData.allergies.length === 0 ? "Type allergy and press Enter" : "Add another..."}
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
                  </TagInputContainer>
                  <HelperText>Press Enter after typing each allergy</HelperText>
                </FormGroup>

                <FormGroup className="full-width">
                  <Label>Chronic Conditions</Label>
                  <TagInputContainer>
                    <TagsList>
                      {formData.chronicConditions.map((tag, index) => (
                        <Tag key={index}>
                          <TagText>{tag}</TagText>
                          <TagRemove onClick={() => removeTag('chronicConditions', index)}>×</TagRemove>
                        </Tag>
                      ))}
                      <TagInput
                        placeholder={formData.chronicConditions.length === 0 ? "Type condition and press Enter" : "Add another..."}
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
                  </TagInputContainer>
                  <HelperText>Press Enter after typing each condition</HelperText>
                </FormGroup>

                <FormGroup className="full-width">
                  <Label>Current Medications</Label>
                  <TagInputContainer>
                    <TagsList>
                      {formData.currentMedications.map((tag, index) => (
                        <Tag key={index}>
                          <TagText>{tag}</TagText>
                          <TagRemove onClick={() => removeTag('currentMedications', index)}>×</TagRemove>
                        </Tag>
                      ))}
                      <TagInput
                        placeholder={formData.currentMedications.length === 0 ? "Type medication and press Enter" : "Add another..."}
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
                  </TagInputContainer>
                  <HelperText>Press Enter after typing each medication</HelperText>
                </FormGroup>

                <EmergencyContactSection>
                  <SectionSubtitle>Emergency Contact (Recommended)</SectionSubtitle>
                  
                  <FormGroup>
                    <Label>Contact Name</Label>
                    <Input
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleInputChange}
                      placeholder="Emergency contact name"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Contact Phone</Label>
                    <Input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleInputChange}
                      placeholder="Emergency contact phone"
                      maxLength={10}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Relationship</Label>
                    <Input
                      name="emergencyContactRelationship"
                      value={formData.emergencyContactRelationship}
                      onChange={handleInputChange}
                      placeholder="Relationship to you"
                    />
                  </FormGroup>
                </EmergencyContactSection>

                <FormGroup>
                  <Label>Preferred Language</Label>
                  <Select
                    name="preferredLanguage"
                    value={formData.preferredLanguage}
                    onChange={handleInputChange}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Punjabi">Punjabi</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>How would you like us to contact you?</Label>
                  <Select
                    name="communicationMethod"
                    value={formData.communicationMethod}
                    onChange={handleInputChange}
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Phone Call</option>
                  </Select>
                </FormGroup>
              </FormGrid>
            </StepContainer>
          )}

          {/* Appointment Step */}
          {currentStep === 'appointment' && (
            <StepContainer>
              <SectionHeader>
                <SectionTitle>Book Your Appointment</SectionTitle>
                <SectionDescription>Choose your preferred doctor, date, and time</SectionDescription>
              </SectionHeader>

              <FormGrid>
                <FormGroup className="full-width">
                  <Label>Select Doctor *</Label>
                  <DoctorGrid>
                    {mockDoctors.map((doctor) => (
                      <DoctorCard
                        key={doctor.id}
                        selected={selectedDoctor === doctor.id}
                        onClick={() => setSelectedDoctor(doctor.id)}
                      >
                        <DoctorName>{doctor.name}</DoctorName>
                        <DoctorSpec>{doctor.specialization}</DoctorSpec>
                        <DoctorFees>
                          <FeeItem>Consultation: ₹{doctor.fees.consultation}</FeeItem>
                          <FeeItem>Follow-up: ₹{doctor.fees.followUp}</FeeItem>
                        </DoctorFees>
                      </DoctorCard>
                    ))}
                  </DoctorGrid>
                  {errors.selectedDoctor && <ErrorText>{errors.selectedDoctor}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <Label>Appointment Type *</Label>
                  <Select
                    name="appointmentType"
                    value={formData.appointmentType}
                    onChange={handleInputChange}
                    hasError={!!errors.appointmentType}
                  >
                    <option value="">Select appointment type</option>
                    <option value="consultation">First Consultation</option>
                    <option value="follow-up">Follow-up Visit</option>
                    <option value="emergency">Emergency</option>
                  </Select>
                  {errors.appointmentType && <ErrorText>{errors.appointmentType}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <Label>Preferred Date *</Label>
                  <Input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleInputChange}
                    hasError={!!errors.appointmentDate}
                    min={today}
                  />
                  {errors.appointmentDate && <ErrorText>{errors.appointmentDate}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <Label>Preferred Time *</Label>
                  <Select
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
                    hasError={!!errors.appointmentTime}
                  >
                    <option value="">Select time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="09:30">9:30 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="10:30">10:30 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="14:30">2:30 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="15:30">3:30 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="16:30">4:30 PM</option>
                    <option value="17:00">5:00 PM</option>
                  </Select>
                  {errors.appointmentTime && <ErrorText>{errors.appointmentTime}</ErrorText>}
                </FormGroup>

                <FormGroup className="full-width">
                  <Label>Special Requirements</Label>
                  <TextArea
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleInputChange}
                    placeholder="Any special accommodations or requirements"
                    rows={3}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>How did you hear about us?</Label>
                  <Select
                    name="referralSource"
                    value={formData.referralSource}
                    onChange={handleInputChange}
                  >
                    <option value="">Select source</option>
                    <option value="google">Google Search</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="friend">Friend/Family</option>
                    <option value="doctor">Another Doctor</option>
                    <option value="advertisement">Advertisement</option>
                    <option value="other">Other</option>
                  </Select>
                </FormGroup>

                {selectedDoctor && formData.appointmentType && (
                  <ConsultationFeeCard className="full-width">
                    <FeeCardHeader>
                      <FeeIcon>💰</FeeIcon>
                      <FeeTitle>Consultation Fee</FeeTitle>
                    </FeeCardHeader>
                    <FeeCardBody>
                      <FeeDetails>
                        <FeeRow>
                          <FeeLabel>Doctor:</FeeLabel>
                          <FeeValue>{mockDoctors.find(d => d.id === selectedDoctor)?.name}</FeeValue>
                        </FeeRow>
                        <FeeRow>
                          <FeeLabel>Type:</FeeLabel>
                          <FeeValue>{formData.appointmentType.charAt(0).toUpperCase() + formData.appointmentType.slice(1)}</FeeValue>
                        </FeeRow>
                        <FeeRow>
                          <FeeLabel>Date:</FeeLabel>
                          <FeeValue>{formData.appointmentDate || 'Not selected'}</FeeValue>
                        </FeeRow>
                        <FeeRow>
                          <FeeLabel>Time:</FeeLabel>
                          <FeeValue>{formData.appointmentTime || 'Not selected'}</FeeValue>
                        </FeeRow>
                      </FeeDetails>
                      <FeeTotalSection>
                        <FeeTotalLabel>Total Fee</FeeTotalLabel>
                        <FeeTotalAmount>₹{calculatedFee.toLocaleString()}</FeeTotalAmount>
                      </FeeTotalSection>
                    </FeeCardBody>
                  </ConsultationFeeCard>
                )}
              </FormGrid>
            </StepContainer>
          )}

          {/* Confirmation Step */}
          {currentStep === 'confirmation' && (
            <StepContainer>
              <SectionHeader>
                <SectionTitle>Review Your Booking</SectionTitle>
                <SectionDescription>Please review your information before confirming</SectionDescription>
              </SectionHeader>

              <ConfirmationGrid>
                <ConfirmationSection>
                  <ConfirmationTitle>Personal Information</ConfirmationTitle>
                  <ConfirmationItem>
                    <strong>Name:</strong> {formData.firstName} {formData.lastName}
                  </ConfirmationItem>
                  <ConfirmationItem>
                    <strong>Email:</strong> {formData.email}
                  </ConfirmationItem>
                  <ConfirmationItem>
                    <strong>Phone:</strong> {formData.phone}
                  </ConfirmationItem>
                  <ConfirmationItem>
                    <strong>Date of Birth:</strong> {formData.dateOfBirth}
                  </ConfirmationItem>
                </ConfirmationSection>

                <ConfirmationSection>
                  <ConfirmationTitle>Appointment Details</ConfirmationTitle>
                  <ConfirmationItem>
                    <strong>Doctor:</strong> {mockDoctors.find(d => d.id === selectedDoctor)?.name}
                  </ConfirmationItem>
                  <ConfirmationItem>
                    <strong>Specialization:</strong> {mockDoctors.find(d => d.id === selectedDoctor)?.specialization}
                  </ConfirmationItem>
                  <ConfirmationItem>
                    <strong>Date:</strong> {formData.appointmentDate}
                  </ConfirmationItem>
                  <ConfirmationItem>
                    <strong>Time:</strong> {formData.appointmentTime}
                  </ConfirmationItem>
                  <ConfirmationItem>
                    <strong>Type:</strong> {formData.appointmentType}
                  </ConfirmationItem>
                  <ConfirmationItem>
                    <strong>Fee:</strong> ₹{calculatedFee.toLocaleString()}
                  </ConfirmationItem>
                </ConfirmationSection>

                {formData.symptoms && (
                  <ConfirmationSection className="full-width">
                    <ConfirmationTitle>Symptoms</ConfirmationTitle>
                    <ConfirmationItem>{formData.symptoms}</ConfirmationItem>
                  </ConfirmationSection>
                )}

                {(formData.allergies.length > 0 || formData.chronicConditions.length > 0 || formData.currentMedications.length > 0) && (
                  <ConfirmationSection className="full-width">
                    <ConfirmationTitle>Medical Information</ConfirmationTitle>
                    {formData.allergies.length > 0 && (
                      <ConfirmationItem>
                        <strong>Allergies:</strong> {formData.allergies.join(', ')}
                      </ConfirmationItem>
                    )}
                    {formData.chronicConditions.length > 0 && (
                      <ConfirmationItem>
                        <strong>Chronic Conditions:</strong> {formData.chronicConditions.join(', ')}
                      </ConfirmationItem>
                    )}
                    {formData.currentMedications.length > 0 && (
                      <ConfirmationItem>
                        <strong>Current Medications:</strong> {formData.currentMedications.join(', ')}
                      </ConfirmationItem>
                    )}
                  </ConfirmationSection>
                )}

                <PaymentNotice>
                  <PaymentIcon>💳</PaymentIcon>
                  <PaymentText>
                    <strong>Payment:</strong> You can pay ₹{calculatedFee.toLocaleString()} at the clinic during your visit. 
                    We accept cash, cards, and UPI payments.
                  </PaymentText>
                </PaymentNotice>

                <TermsNotice>
                  <TermsText>
                    By confirming this appointment, you agree to our terms and conditions and privacy policy. 
                    You will receive a confirmation email with appointment details and clinic information.
                  </TermsText>
                </TermsNotice>
              </ConfirmationGrid>
            </StepContainer>
          )}

          {/* Form Actions */}
          <FormActions>
            {currentStep !== 'personal' && (
              <ActionButton type="button" variant="secondary" onClick={handleBack}>
                ← Back
              </ActionButton>
            )}

            <StepIndicatorText>
              Step {currentStepIndex + 1} of {steps.length}
            </StepIndicatorText>

            {currentStep !== 'confirmation' ? (
              <ActionButton type="button" onClick={handleNext}>
                Next Step →
              </ActionButton>
            ) : (
              <ActionButton type="button" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Booking Appointment...' : 'Confirm Booking'}
              </ActionButton>
            )}
          </FormActions>
        </FormContent>
      </FormContainer>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FormContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
`;

const FormHeader = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #8b5cf6 100%);
  color: white;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 4px 0;
  
  @media (max-width: 768px) {
    font-size: 24px;
    text-align: center;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
  
  @media (max-width: 768px) {
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
    width: 200px;
  }
`;

const ProgressFill = styled.div<{ percentage: number }>`
  width: ${props => props.percentage}%;
  height: 100%;
  background: white;
  border-radius: 999px;
  transition: width 0.3s ease;
`;

const StepIndicator = styled.div`
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 20px 24px;
  gap: 20px;
  overflow-x: auto;
  
  @media (max-width: 768px) {
    padding: 16px 20px;
    gap: 16px;
  }
`;

const StepItem = styled.div<{ active: boolean; completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  opacity: ${props => props.active || props.completed ? 1 : 0.5};
`;

const StepIcon = styled.div<{ active: boolean; completed: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  background: ${props => 
    props.completed ? '#10b981' : 
    props.active ? theme.colors.primary : '#e2e8f0'};
  color: ${props => 
    props.completed || props.active ? 'white' : '#64748b'};
  transition: all 0.3s ease;
`;

const StepContent = styled.div`
  @media (max-width: 640px) {
    display: none;
  }
`;

const StepTitle = styled.div<{ active: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.active ? theme.colors.primary : '#475569'};
  margin-bottom: 2px;
`;

const StepSubtitle = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const FormContent = styled.div`
  padding: 0;
`;

const StepContainer = styled.div`
  padding: 32px;
  
  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const SectionDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
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
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
`;

const Input = styled.input<{ hasError?: boolean }>`
  padding: 12px 16px;
  border: 2px solid ${props => props.hasError ? theme.colors.danger : '#e2e8f0'};
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
  border: 2px solid ${props => props.hasError ? theme.colors.danger : '#e2e8f0'};
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
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
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
  color: ${theme.colors.danger};
  font-size: 12px;
  margin-top: 6px;
  font-weight: 500;
`;

const HelperText = styled.span`
  color: #6b7280;
  font-size: 12px;
  margin-top: 6px;
  line-height: 1.3;
`;

const EmergencyContactSection = styled.div`
  grid-column: 1 / -1;
  margin-top: 20px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const SectionSubtitle = styled.h3`
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

const DoctorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 8px;
`;

const DoctorCard = styled.div<{ selected: boolean }>`
  padding: 20px;
  border: 2px solid ${props => props.selected ? theme.colors.primary : '#e2e8f0'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.selected ? `${theme.colors.primary}05` : 'white'};
  
  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const DoctorName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
`;

const DoctorSpec = styled.div`
  font-size: 14px;
  color: ${theme.colors.primary};
  font-weight: 500;
  margin-bottom: 12px;
`;

const DoctorFees = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FeeItem = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const ConsultationFeeCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-top: 20px;
`;

const FeeCardHeader = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FeeIcon = styled.div`
  font-size: 20px;
`;

const FeeTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

const FeeCardBody = styled.div`
  padding: 20px;
`;

const FeeDetails = styled.div`
  margin-bottom: 16px;
`;

const FeeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
`;

const FeeLabel = styled.span`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const FeeValue = styled.span`
  font-size: 14px;
  color: #1e293b;
  font-weight: 600;
`;

const FeeTotalSection = styled.div`
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FeeTotalLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #0c4a6e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FeeTotalAmount = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #0c4a6e;
`;

const ConfirmationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  
  .full-width {
    grid-column: 1 / -1;
  }
`;

const ConfirmationSection = styled.div`
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const ConfirmationTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
`;

const ConfirmationItem = styled.div`
  font-size: 14px;
  color: #374151;
  margin-bottom: 8px;
  line-height: 1.4;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PaymentNotice = styled.div`
  grid-column: 1 / -1;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px;
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
  border: 1px solid #10b981;
  border-radius: 12px;
  margin-top: 8px;
`;

const PaymentIcon = styled.div`
  font-size: 20px;
  margin-top: 2px;
`;

const PaymentText = styled.div`
  font-size: 14px;
  color: #065f46;
  line-height: 1.5;
`;

const TermsNotice = styled.div`
  grid-column: 1 / -1;
  padding: 16px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  margin-top: 8px;
`;

const TermsText = styled.div`
  font-size: 12px;
  color: #92400e;
  line-height: 1.4;
  text-align: center;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  
  @media (max-width: 768px) {
    padding: 16px 20px;
    flex-direction: column;
    gap: 12px;
  }
`;

const ActionButton = styled.button<{ variant?: 'secondary' }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
  
  ${props => props.variant === 'secondary' ? `
    background: white;
    color: #374151;
    border: 2px solid #e2e8f0;
    
    &:hover:not(:disabled) {
      background: #f9fafb;
      border-color: #9ca3af;
    }
  ` : `
    background: ${theme.colors.primary};
    color: white;
    border: 2px solid ${theme.colors.primary};
    
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
    order: ${props => props.variant === 'secondary' ? '2' : '1'};
  }
`;

const StepIndicatorText = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  padding: 6px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  
  @media (max-width: 768px) {
    order: 3;
    width: 100%;
    text-align: center;
  }
`;

// Tag Input Components
const TagInputContainer = styled.div`
  min-height: 80px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
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
  gap: 8px;
  align-items: center;
  min-height: 32px;
`;

const Tag = styled.div`
  display: flex;
  align-items: center;
  background: ${theme.colors.primary}15;
  border: 1px solid ${theme.colors.primary}30;
  border-radius: 20px;
  padding: 6px 8px 6px 12px;
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
  padding: 6px 0;
  color: #374151;
  
  &::placeholder {
    color: #9ca3af;
  }
`;

export default PublicBookingForm;