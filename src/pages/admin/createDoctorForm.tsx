import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreateDoctor, useUpdateDoctor } from '@/hooks/useDoctor';
import { useDoctorById } from '@/hooks/useAdmin';
import { DoctorPayload } from '@/api/doctor/doctorTypes';
import { FiArrowLeft, FiSave, FiX, FiEye, FiEyeOff } from 'react-icons/fi';

const theme = {
  colors: {
    primary: '#6366f1',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b'
  }
};

// Enums and interfaces
export enum DayOfWeek {
  MONDAY = "monday",
  TUESDAY = "tuesday",
  WEDNESDAY = "wednesday",
  THURSDAY = "thursday",
  FRIDAY = "friday",
  SATURDAY = "saturday",
  SUNDAY = "sunday",
}

interface IWorkingDay {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

interface IBreakTime {
  startTime: string;
  endTime: string;
  description: string;
}

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  
  // Professional Information
  specialization: string;
  qualifications: string[];
  experience: number;
  licenseNumber: string;
  department: string;
  
  // Schedule
  workingDays: IWorkingDay[];
  slotDuration: number;
  breakTimes: IBreakTime[];
  
  // Availability
  isAvailable: boolean;
  maxAppointmentsPerDay: number;
  
  // Fees
  consultationFee: number;
  followUpFee: number;
  emergencyFee: number;
}

interface DoctorFormProps {
  mode?: 'create' | 'edit';
}

const DoctorForm: React.FC<DoctorFormProps> = ({ mode = 'create' }) => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const isEditMode = mode === 'edit' || !!doctorId;

  // API Hooks
  const { mutate: createDoctor, isPending: isCreating } = useCreateDoctor();
  const { mutate: updateDoctor, isPending: isUpdating } = useUpdateDoctor();
  const { 
    data: existingDoctor, 
    isLoading: isLoadingDoctor, 
    isError: isDoctorError 
  } = useDoctorById(doctorId || '');

  const [formData, setFormData] = useState<FormData>({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Professional Information
    specialization: '',
    qualifications: [],
    experience: 0,
    licenseNumber: '',
    department: '',
    
    // Schedule
    workingDays: Object.values(DayOfWeek).map(day => ({
      day,
      startTime: '09:00',
      endTime: '17:00',
      isWorking: day !== DayOfWeek.SUNDAY
    })),
    slotDuration: 30,
    breakTimes: [{
      startTime: '13:00',
      endTime: '14:00',
      description: 'Lunch Break'
    }],
    
    // Availability
    isAvailable: true,
    maxAppointmentsPerDay: 20,
    
    // Fees
    consultationFee: 0,
    followUpFee: 0,
    emergencyFee: 0,
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [qualificationInput, setQualificationInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load existing doctor data for edit mode
  useEffect(() => {
    if (isEditMode && existingDoctor) {
      setFormData({
        // Personal Information
        firstName: existingDoctor.personalInfo.firstName,
        lastName: existingDoctor.personalInfo.lastName,
        email: existingDoctor.personalInfo.email,
        phone: existingDoctor.personalInfo.phone,
        password: '', // Don't populate password in edit mode
        confirmPassword: '', // Don't populate confirm password in edit mode
        
        // Professional Information
        specialization: existingDoctor.professionalInfo.specialization,
        qualifications: existingDoctor.professionalInfo.qualifications,
        experience: existingDoctor.professionalInfo.experience,
        licenseNumber: existingDoctor.professionalInfo.licenseNumber,
        department: existingDoctor.professionalInfo.department || '',
        
        // Schedule
        workingDays: existingDoctor.schedule.workingDays.map(day => ({
          ...day,
          day: DayOfWeek[day.day.toUpperCase() as keyof typeof DayOfWeek]
        })),
        slotDuration: existingDoctor.schedule.slotDuration,
        breakTimes: existingDoctor.schedule.breakTimes.map(bt => ({
          ...bt,
          description: bt.description ?? '',
        })),
        
        // Availability
        isAvailable: existingDoctor.availability.isAvailable,
        maxAppointmentsPerDay: existingDoctor.availability.maxAppointmentsPerDay,
        
        // Fees
        consultationFee: existingDoctor.fees.consultationFee,
        followUpFee: existingDoctor.fees.followUpFee || 0,
        emergencyFee: existingDoctor.fees.emergencyFee || 0,
      });
    }
  }, [isEditMode, existingDoctor]);

  // Mock data for dropdowns
  const specializations = [
    'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology',
    'Psychiatry', 'Radiology', 'Anesthesiology', 'Emergency Medicine',
    'General Medicine', 'Surgery', 'Gynecology', 'Urology', 'ENT'
  ];

  const departments = [
    'Emergency Department', 'Cardiology Department', 'Neurology Department',
    'Pediatrics Department', 'Orthopedics Department', 'Surgery Department',
    'Radiology Department', 'Laboratory', 'ICU', 'General Ward'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleWorkingDayChange = (index: number, field: keyof IWorkingDay, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.map((day, i) => 
        i === index ? { ...day, [field]: value } : day
      )
    }));
  };

  const handleBreakTimeChange = (index: number, field: keyof IBreakTime, value: string) => {
    setFormData(prev => ({
      ...prev,
      breakTimes: prev.breakTimes.map((breakTime, i) => 
        i === index ? { ...breakTime, [field]: value } : breakTime
      )
    }));
  };

  const addBreakTime = () => {
    setFormData(prev => ({
      ...prev,
      breakTimes: [...prev.breakTimes, { startTime: '', endTime: '', description: '' }]
    }));
  };

  const removeBreakTime = (index: number) => {
    setFormData(prev => ({
      ...prev,
      breakTimes: prev.breakTimes.filter((_, i) => i !== index)
    }));
  };

  const addQualification = () => {
    if (qualificationInput.trim()) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, qualificationInput.trim()]
      }));
      setQualificationInput('');
    }
  };

  const removeQualification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<string, string>> = {};
    
    // Personal Information validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    // Password validation (only for create mode or if password is provided in edit mode)
    if (!isEditMode) {
      // Required for create mode
      if (!formData.password.trim()) {
        newErrors.password = 'Password is required';
      } else {
        // Password strength validation
        if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters long';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
          newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
      }
      
      if (!formData.confirmPassword.trim()) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else {
      // Optional for edit mode, but if provided, validate it
      if (formData.password.trim()) {
        if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters long';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
          newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{9,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Professional Information validation
    if (!formData.specialization) newErrors.specialization = 'Specialization is required';
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (formData.experience < 0) newErrors.experience = 'Experience cannot be negative';
    if (formData.experience > 50) newErrors.experience = 'Experience cannot exceed 50 years';
    if (formData.qualifications.length === 0) newErrors.qualifications = 'At least one qualification is required';
    
    // Schedule validation
    if (formData.slotDuration < 15) newErrors.slotDuration = 'Slot duration must be at least 15 minutes';
    if (formData.slotDuration > 120) newErrors.slotDuration = 'Slot duration cannot exceed 120 minutes';
    
    // Working days validation
    const hasWorkingDay = formData.workingDays.some(day => day.isWorking);
    if (!hasWorkingDay) newErrors.workingDays = 'At least one working day is required';
    
    // Validate working hours
    formData.workingDays.forEach((day, index) => {
      if (day.isWorking) {
        const start = new Date(`1970-01-01T${day.startTime}:00`);
        const end = new Date(`1970-01-01T${day.endTime}:00`);
        if (end <= start) {
          newErrors[`workingDay_${index}`] = 'End time must be after start time';
        }
      }
    });
    
    // Break times validation
    formData.breakTimes.forEach((breakTime, index) => {
      if (breakTime.startTime && breakTime.endTime) {
        const start = new Date(`1970-01-01T${breakTime.startTime}:00`);
        const end = new Date(`1970-01-01T${breakTime.endTime}:00`);
        if (end <= start) {
          newErrors[`breakTime_${index}`] = 'Break end time must be after start time';
        }
      }
    });
    
    // Availability validation
    if (formData.maxAppointmentsPerDay < 1) newErrors.maxAppointmentsPerDay = 'Maximum appointments must be at least 1';
    if (formData.maxAppointmentsPerDay > 100) newErrors.maxAppointmentsPerDay = 'Maximum appointments cannot exceed 100';
    
    // Fees validation
    if (formData.consultationFee < 0) newErrors.consultationFee = 'Consultation fee cannot be negative';
    if (formData.followUpFee < 0) newErrors.followUpFee = 'Follow-up fee cannot be negative';
    if (formData.emergencyFee < 0) newErrors.emergencyFee = 'Emergency fee cannot be negative';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      // Prepare data for submission
      const doctorData: DoctorPayload = {
        personalInfo: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone.trim(),
        },
        professionalInfo: {
          specialization: formData.specialization,
          qualifications: formData.qualifications,
          experience: formData.experience,
          licenseNumber: formData.licenseNumber.toUpperCase().trim(),
          department: formData.department,
        },
        schedule: {
          workingDays: formData.workingDays,
          slotDuration: formData.slotDuration,
          breakTimes: formData.breakTimes.filter(bt => bt.startTime && bt.endTime),
        },
        availability: {
          isAvailable: formData.isAvailable,
          unavailableDates: existingDoctor?.availability?.unavailableDates || [],
          maxAppointmentsPerDay: formData.maxAppointmentsPerDay,
        },
        fees: {
          consultationFee: formData.consultationFee,
          followUpFee: formData.followUpFee || undefined,
          emergencyFee: formData.emergencyFee || undefined,
        },
        authentication: {
          password: formData.password
        }
      };
      
      if (isEditMode && doctorId) {
        // Update existing doctor
        updateDoctor(
          { id: doctorId, doctorData },
          {
            onSuccess: () => {
              navigate('/admin/doctors/list');
            },
            onError: (error) => {
              console.error('Update error:', error);
            }
          }
        );
      } else {
        // Create new doctor
        createDoctor(doctorData, {
          onSuccess: () => {
            navigate('/admin/doctors/list');
          },
          onError: (error) => {
            console.error('Create error:', error);
          }
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/admin/doctors/list');
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Loading state for fetching doctor data
  if (isEditMode && isLoadingDoctor) {
    return (
      <FormContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading doctor information...</LoadingText>
        </LoadingContainer>
      </FormContainer>
    );
  }

  // Error state for fetching doctor data
  if (isEditMode && isDoctorError) {
    return (
      <FormContainer>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Doctor Not Found</ErrorTitle>
          <ErrorMessage>The requested doctor could not be found.</ErrorMessage>
          <BackButton onClick={handleBack}>
            <FiArrowLeft size={16} />
            Go Back
          </BackButton>
        </ErrorContainer>
      </FormContainer>
    );
  }

  const isSubmitting = isCreating || isUpdating;

  return (
    <FormContainer>
      {/* Form Header */}
      <FormHeader>
        <HeaderLeft>
          <BackButton onClick={handleBack}>
            <FiArrowLeft size={16} />
            Back
          </BackButton>
          <HeaderContent>
            <Title>
              {isEditMode ? 'Edit Doctor' : 'Create New Doctor'}
            </Title>
            <Subtitle>
              {isEditMode 
                ? 'Update doctor information and settings' 
                : 'Add a new doctor to the medical practice'
              }
            </Subtitle>
          </HeaderContent>
        </HeaderLeft>
        <HeaderIcon>👨‍⚕️</HeaderIcon>
      </FormHeader>

      {/* Form Content */}
      <FormContent>
        {/* Personal Information Section */}
        <Section>
          <SectionHeader>
            <SectionIcon>👤</SectionIcon>
            <SectionTitle>Personal Information</SectionTitle>
          </SectionHeader>
          
          <FormGrid>
            <FormGroup>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                hasError={!!errors.firstName}
                placeholder="Enter first name"
                maxLength={50}
              />
              {errors.firstName && <ErrorText>{errors.firstName}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                hasError={!!errors.lastName}
                placeholder="Enter last name"
                maxLength={50}
              />
              {errors.lastName && <ErrorText>{errors.lastName}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                hasError={!!errors.email}
                placeholder="doctor@example.com"
              />
              {errors.email && <ErrorText>{errors.email}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                hasError={!!errors.phone}
                placeholder="+91 9876543210"
              />
              {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
            </FormGroup>

            {/* Password fields */}
            <FormGroup>
              <Label htmlFor="password">
                Password {!isEditMode && '*'}
              </Label>
              <PasswordInputContainer>
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  hasError={!!errors.password}
                  placeholder={isEditMode ? "Enter new password (optional)" : "Enter password"}
                  autoComplete="new-password"
                />
                <PasswordToggleButton
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </PasswordToggleButton>
              </PasswordInputContainer>
              {errors.password && <ErrorText>{errors.password}</ErrorText>}
              {!errors.password && !isEditMode && (
                <HelperText>
                  Password must be at least 8 characters with uppercase, lowercase, and number
                </HelperText>
              )}
              {isEditMode && (
                <HelperText>Leave empty to keep current password</HelperText>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="confirmPassword">
                Confirm Password {(!isEditMode || formData.password.trim()) && '*'}
              </Label>
              <PasswordInputContainer>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  hasError={!!errors.confirmPassword}
                  placeholder={isEditMode ? "Confirm new password" : "Confirm password"}
                  autoComplete="new-password"
                  disabled={!formData.password.trim()}
                />
                <PasswordToggleButton
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  disabled={!formData.password.trim()}
                >
                  {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </PasswordToggleButton>
              </PasswordInputContainer>
              {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
            </FormGroup>
          </FormGrid>
        </Section>

        {/* Professional Information Section */}
        <Section>
          <SectionHeader>
            <SectionIcon>🩺</SectionIcon>
            <SectionTitle>Professional Information</SectionTitle>
          </SectionHeader>
          
          <FormGrid>
            <FormGroup>
              <Label htmlFor="specialization">Specialization *</Label>
              <Select
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                hasError={!!errors.specialization}
              >
                <option value="">Select specialization</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </Select>
              {errors.specialization && <ErrorText>{errors.specialization}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="department">Department</Label>
              <Select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
              >
                <option value="">Select department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="experience">Experience (Years) *</Label>
              <Input
                type="number"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                hasError={!!errors.experience}
                min="0"
                max="50"
                placeholder="5"
              />
              {errors.experience && <ErrorText>{errors.experience}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="licenseNumber">License Number *</Label>
              <Input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                hasError={!!errors.licenseNumber}
                placeholder="Enter license number"
                style={{ textTransform: 'uppercase' }}
              />
              {errors.licenseNumber && <ErrorText>{errors.licenseNumber}</ErrorText>}
            </FormGroup>

            <FormGroup className="full-width">
              <Label>Qualifications *</Label>
              <QualificationInput>
                <Input
                  type="text"
                  value={qualificationInput}
                  onChange={(e) => setQualificationInput(e.target.value)}
                  placeholder="Enter qualification (e.g., MBBS, MD, PhD)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
                />
                <AddButton type="button" onClick={addQualification}>
                  Add
                </AddButton>
              </QualificationInput>
              {errors.qualifications && <ErrorText>{errors.qualifications}</ErrorText>}
              <QualificationList>
                {formData.qualifications.map((qual, index) => (
                  <QualificationItem key={index}>
                    <span>{qual}</span>
                    <RemoveButton onClick={() => removeQualification(index)}>×</RemoveButton>
                  </QualificationItem>
                ))}
              </QualificationList>
            </FormGroup>
          </FormGrid>
        </Section>

        {/* Schedule Section */}
        <Section>
          <SectionHeader>
            <SectionIcon>🕒</SectionIcon>
            <SectionTitle>Schedule & Working Hours</SectionTitle>
          </SectionHeader>
          
          <FormGrid>
            <FormGroup>
              <Label htmlFor="slotDuration">Slot Duration (minutes) *</Label>
              <Input
                type="number"
                id="slotDuration"
                name="slotDuration"
                value={formData.slotDuration}
                onChange={handleInputChange}
                hasError={!!errors.slotDuration}
                min="15"
                max="120"
                step="15"
                placeholder="30"
              />
              {errors.slotDuration && <ErrorText>{errors.slotDuration}</ErrorText>}
              <HelperText>Duration for each appointment slot (15-120 minutes)</HelperText>
            </FormGroup>
          </FormGrid>

          <SubSection>
            <SubSectionTitle>Working Days</SubSectionTitle>
            {errors.workingDays && <ErrorText>{errors.workingDays}</ErrorText>}
            <WorkingDaysGrid>
              {formData.workingDays.map((day, index) => (
                <WorkingDayCard key={day.day}>
                  <DayHeader>
                    <CheckboxGroup>
                      <CheckboxInput
                        type="checkbox"
                        checked={day.isWorking}
                        onChange={(e) => handleWorkingDayChange(index, 'isWorking', e.target.checked)}
                      />
                      <DayName>{day.day.charAt(0).toUpperCase() + day.day.slice(1)}</DayName>
                    </CheckboxGroup>
                  </DayHeader>
                  {day.isWorking && (
                    <TimeInputs>
                      <TimeGroup>
                        <TimeLabel>Start</TimeLabel>
                        <TimeInput
                          type="time"
                          value={day.startTime}
                          onChange={(e) => handleWorkingDayChange(index, 'startTime', e.target.value)}
                        />
                      </TimeGroup>
                      <TimeGroup>
                        <TimeLabel>End</TimeLabel>
                        <TimeInput
                          type="time"
                          value={day.endTime}
                          onChange={(e) => handleWorkingDayChange(index, 'endTime', e.target.value)}
                        />
                      </TimeGroup>
                    </TimeInputs>
                  )}
                  {errors[`workingDay_${index}`] && (
                    <ErrorText>{errors[`workingDay_${index}`]}</ErrorText>
                  )}
                </WorkingDayCard>
              ))}
            </WorkingDaysGrid>
          </SubSection>

          <SubSection>
            <SubSectionHeader>
              <SubSectionTitle>Break Times</SubSectionTitle>
              <AddButton type="button" onClick={addBreakTime}>
                Add Break
              </AddButton>
            </SubSectionHeader>
            <BreakTimesList>
              {formData.breakTimes.map((breakTime, index) => (
                <BreakTimeCard key={index}>
                  <BreakTimeInputs>
                    <FormGroup>
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={breakTime.startTime}
                        onChange={(e) => handleBreakTimeChange(index, 'startTime', e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={breakTime.endTime}
                        onChange={(e) => handleBreakTimeChange(index, 'endTime', e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup className="description">
                      <Label>Description</Label>
                      <Input
                        type="text"
                        value={breakTime.description}
                        onChange={(e) => handleBreakTimeChange(index, 'description', e.target.value)}
                        placeholder="e.g., Lunch Break"
                      />
                    </FormGroup>
                    <RemoveBreakButton onClick={() => removeBreakTime(index)}>
                      Remove
                    </RemoveBreakButton>
                  </BreakTimeInputs>
                  {errors[`breakTime_${index}`] && (
                    <ErrorText>{errors[`breakTime_${index}`]}</ErrorText>
                  )}
                </BreakTimeCard>
              ))}
            </BreakTimesList>
          </SubSection>
        </Section>

        {/* Availability & Fees Section */}
        <Section>
          <SectionHeader>
            <SectionIcon>💰</SectionIcon>
            <SectionTitle>Availability & Fees</SectionTitle>
          </SectionHeader>
          
          <FormGrid>
            <CheckboxGroup>
              <CheckboxInput
                type="checkbox"
                id="isAvailable"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleInputChange}
              />
              <CheckboxLabel htmlFor="isAvailable">
                Doctor is available for appointments
              </CheckboxLabel>
            </CheckboxGroup>

            <FormGroup>
              <Label htmlFor="maxAppointmentsPerDay">Max Appointments per Day *</Label>
              <Input
                type="number"
                id="maxAppointmentsPerDay"
                name="maxAppointmentsPerDay"
                value={formData.maxAppointmentsPerDay}
                onChange={handleInputChange}
                hasError={!!errors.maxAppointmentsPerDay}
                min="1"
                max="100"
                placeholder="20"
              />
              {errors.maxAppointmentsPerDay && <ErrorText>{errors.maxAppointmentsPerDay}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="consultationFee">Consultation Fee *</Label>
              <Input
                type="number"
                id="consultationFee"
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleInputChange}
                hasError={!!errors.consultationFee}
                min="0"
                step="0.01"
                placeholder="500"
              />
              {errors.consultationFee && <ErrorText>{errors.consultationFee}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="followUpFee">Follow-up Fee</Label>
              <Input
                type="number"
                id="followUpFee"
                name="followUpFee"
                value={formData.followUpFee}
                onChange={handleInputChange}
                hasError={!!errors.followUpFee}
                min="0"
                step="0.01"
                placeholder="300"
              />
              {errors.followUpFee && <ErrorText>{errors.followUpFee}</ErrorText>}
              <HelperText>Optional - Leave empty if same as consultation fee</HelperText>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="emergencyFee">Emergency Fee</Label>
              <Input
                type="number"
                id="emergencyFee"
                name="emergencyFee"
                value={formData.emergencyFee}
                onChange={handleInputChange}
                hasError={!!errors.emergencyFee}
                min="0"
                step="0.01"
                placeholder="1000"
              />
              {errors.emergencyFee && <ErrorText>{errors.emergencyFee}</ErrorText>}
              <HelperText>Optional - For emergency consultations</HelperText>
            </FormGroup>
          </FormGrid>
        </Section>

        {/* Form Actions */}
        <FormActions>
          <ActionButton type="button" variant="secondary" onClick={handleCancel}>
            <FiX size={16} />
            Cancel
          </ActionButton>
          <ActionButton onClick={handleSubmit} disabled={isSubmitting}>
            <FiSave size={16} />
            {isSubmitting 
              ? (isEditMode ? 'Updating...' : 'Creating...') 
              : (isEditMode ? 'Update Doctor' : 'Create Doctor')
            }
          </ActionButton>
        </FormActions>
      </FormContent>

      {/* Loading Overlay */}
      {isSubmitting && (
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>
            {isEditMode ? 'Updating doctor...' : 'Creating doctor...'}
          </LoadingText>
        </LoadingOverlay>
      )}
    </FormContainer>
  );
};

// Styled Components
const FormContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
`;

const FormHeader = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #8b5cf6 100%);
  color: white;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 16px 20px;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px 0;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const HeaderIcon = styled.div`
  font-size: 32px;
  opacity: 0.8;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const FormContent = styled.div`
  padding: 24px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Section = styled.div`
  margin-bottom: 24px;
  
  &:last-of-type {
    margin-bottom: 0;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
`;

const SectionIcon = styled.div`
  font-size: 16px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const SubSection = styled.div`
  margin-top: 20px;
`;

const SubSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const SubSectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  
  .full-width {
    grid-column: 1 / -1;
  }
  
  .description {
    flex: 2;
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
  border: 1px solid ${props => props.hasError ? theme.colors.danger : '#d1d5db'};
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
`;

const Select = styled.select<{ hasError?: boolean }>`
  padding: 10px 12px;
  border: 1px solid ${props => props.hasError ? theme.colors.danger : '#d1d5db'};
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

const QualificationInput = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const QualificationList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const QualificationItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  font-size: 12px;
  color: #1e40af;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background: #fef2f2;
  }
`;

const AddButton = styled.button`
  padding: 10px 16px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: ${theme.colors.primary}dd;
  }
`;

const WorkingDaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const WorkingDayCard = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  background: #f8fafc;
`;

const DayHeader = styled.div`
  margin-bottom: 8px;
`;

const DayName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

const TimeInputs = styled.div`
  display: flex;
  gap: 8px;
`;

const TimeGroup = styled.div`
  flex: 1;
`;

const TimeLabel = styled.label`
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 4px;
  display: block;
  font-weight: 500;
`;

const TimeInput = styled.input`
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}20;
  }
`;

const BreakTimesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BreakTimeCard = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  background: #f8fafc;
`;

const BreakTimeInputs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 2fr auto;
  gap: 12px;
  align-items: end;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const RemoveBreakButton = styled.button`
  padding: 8px 12px;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: #fecaca;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PasswordInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const PasswordToggleButton = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
  
  &:hover:not(:disabled) {
    color: ${theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.span`
  color: ${theme.colors.danger};
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

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
  margin-top: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column-reverse;
    gap: 10px;
  }
`;

const ActionButton = styled.button<{ variant?: 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 140px;
  
  ${props => props.variant === 'secondary' ? `
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover:not(:disabled) {
      background: #f9fafb;
      border-color: #9ca3af;
    }
  ` : `
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
    justify-content: center;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  margin-top: 12px;
  color: #6b7280;
  font-size: 14px;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ErrorTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #dc2626;
  margin: 0 0 8px 0;
`;

const ErrorMessage = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
  max-width: 400px;
  line-height: 1.5;
`;

export default DoctorForm;