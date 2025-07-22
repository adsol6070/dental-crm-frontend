import React, { useState } from 'react';
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
  // Basic Information
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  appointmentType: 'consultation' | 'follow-up' | 'emergency' | 'routine-checkup' | 'procedure' | '';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  bookingSource: 'website' | 'mobile-app' | 'whatsapp' | 'phone-call' | 'email' | 'sms' | 'in-person' | 'third-party' | 'referral' | 'qr-code' | 'social-media' | 'voice-bot' | 'api' | '';
  
  // Additional Details
  symptoms: string;
  notes: string;
  specialRequirements: string;
  
  // Payment Information
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentAmount: string;
  paymentMethod: string;
  
  // Consultation Details (Optional)
  diagnosis: string;
  prescription: string;
  nextAppointmentDate: string;
  followUpRequired: boolean;
}

const CreateAppointmentForm = () => {
  const [formData, setFormData] = useState<FormData>({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    duration: 30,
    appointmentType: '',
    status: 'scheduled',
    priority: 'medium',
    bookingSource: '',
    symptoms: '',
    notes: '',
    specialRequirements: '',
    paymentStatus: 'pending',
    paymentAmount: '',
    paymentMethod: '',
    diagnosis: '',
    prescription: '',
    nextAppointmentDate: '',
    followUpRequired: false
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for dropdowns
  const patients = [
    { id: '1', name: 'John Doe', phone: '+91 9876543210', patientId: 'PAT001' },
    { id: '2', name: 'Jane Smith', phone: '+91 9876543211', patientId: 'PAT002' },
    { id: '3', name: 'Robert Johnson', phone: '+91 9876543212', patientId: 'PAT003' },
    { id: '4', name: 'Emily Davis', phone: '+91 9876543213', patientId: 'PAT004' }
  ];

  const doctors = [
    { id: '1', name: 'Dr. Sarah Wilson', specialization: 'Cardiology', experience: '10+ years' },
    { id: '2', name: 'Dr. Michael Brown', specialization: 'Neurology', experience: '8+ years' },
    { id: '3', name: 'Dr. Emily Davis', specialization: 'Pediatrics', experience: '12+ years' },
    { id: '4', name: 'Dr. David Miller', specialization: 'Orthopedics', experience: '15+ years' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    // Required fields validation
    if (!formData.patientId) newErrors.patientId = 'Patient is required';
    if (!formData.doctorId) newErrors.doctorId = 'Doctor is required';
    if (!formData.appointmentDate) newErrors.appointmentDate = 'Appointment date is required';
    if (!formData.appointmentTime) newErrors.appointmentTime = 'Appointment time is required';
    if (!formData.appointmentType) newErrors.appointmentType = 'Appointment type is required';
    if (!formData.bookingSource) newErrors.bookingSource = 'Booking source is required';
    
    // Duration validation
    if (formData.duration < 15) newErrors.duration = 'Duration must be at least 15 minutes';
    if (formData.duration > 480) newErrors.duration = 'Duration cannot exceed 480 minutes';
    
    // Date validation - appointment date should not be in the past
    if (formData.appointmentDate) {
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.appointmentDate = 'Appointment date cannot be in the past';
      }
    }
    
    // Payment amount validation
    if (formData.paymentAmount && parseFloat(formData.paymentAmount) < 0) {
      newErrors.paymentAmount = 'Payment amount cannot be negative';
    }
    
    // Next appointment date validation
    if (formData.nextAppointmentDate) {
      const nextDate = new Date(formData.nextAppointmentDate);
      const appointmentDate = new Date(formData.appointmentDate);
      
      if (nextDate <= appointmentDate) {
        newErrors.nextAppointmentDate = 'Next appointment must be after current appointment';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Combine date and time for submission
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
      
      const appointmentData = {
        ...formData,
        appointmentDateTime,
        symptoms: formData.symptoms ? formData.symptoms.split(',').map(s => s.trim()).filter(Boolean) : [],
        paymentAmount: formData.paymentAmount ? parseFloat(formData.paymentAmount) : undefined,
        nextAppointment: formData.nextAppointmentDate ? new Date(formData.nextAppointmentDate) : undefined
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Appointment data:', appointmentData);
      alert('Appointment created successfully!');
      
      // Reset form on success
      setFormData({
        patientId: '',
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        duration: 30,
        appointmentType: '',
        status: 'scheduled',
        priority: 'medium',
        bookingSource: '',
        symptoms: '',
        notes: '',
        specialRequirements: '',
        paymentStatus: 'pending',
        paymentAmount: '',
        paymentMethod: '',
        diagnosis: '',
        prescription: '',
        nextAppointmentDate: '',
        followUpRequired: false
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Error creating appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      patientId: '',
      doctorId: '',
      appointmentDate: '',
      appointmentTime: '',
      duration: 30,
      appointmentType: '',
      status: 'scheduled',
      priority: 'medium',
      bookingSource: '',
      symptoms: '',
      notes: '',
      specialRequirements: '',
      paymentStatus: 'pending',
      paymentAmount: '',
      paymentMethod: '',
      diagnosis: '',
      prescription: '',
      nextAppointmentDate: '',
      followUpRequired: false
    });
    setErrors({});
  };

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <FormContainer>
      {/* Form Header */}
      <FormHeader>
        <HeaderContent>
          <Title>Create New Appointment</Title>
          <Subtitle>Schedule a new appointment for a patient</Subtitle>
        </HeaderContent>
        <HeaderIcon>📅</HeaderIcon>
      </FormHeader>

      {/* Form Content */}
      <FormContent>
        {/* Basic Information Section */}
        <Section>
          <SectionHeader>
            <SectionIcon>👥</SectionIcon>
            <SectionTitle>Basic Information</SectionTitle>
          </SectionHeader>
          
          <FormGrid>
            <FormGroup>
              <Label htmlFor="patientId">Patient *</Label>
              <Select
                id="patientId"
                name="patientId"
                value={formData.patientId}
                onChange={handleInputChange}
                hasError={!!errors.patientId}
              >
                <option value="">Select patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} ({patient.patientId}) - {patient.phone}
                  </option>
                ))}
              </Select>
              {errors.patientId && <ErrorText>{errors.patientId}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="doctorId">Doctor *</Label>
              <Select
                id="doctorId"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleInputChange}
                hasError={!!errors.doctorId}
              >
                <option value="">Select doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </Select>
              {errors.doctorId && <ErrorText>{errors.doctorId}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="appointmentDate">Appointment Date *</Label>
              <Input
                type="date"
                id="appointmentDate"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleInputChange}
                hasError={!!errors.appointmentDate}
                min={today}
              />
              {errors.appointmentDate && <ErrorText>{errors.appointmentDate}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="appointmentTime">Appointment Time *</Label>
              <Input
                type="time"
                id="appointmentTime"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleInputChange}
                hasError={!!errors.appointmentTime}
              />
              {errors.appointmentTime && <ErrorText>{errors.appointmentTime}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                hasError={!!errors.duration}
                min="15"
                max="480"
                step="15"
                placeholder="30"
              />
              {errors.duration && <ErrorText>{errors.duration}</ErrorText>}
              <HelperText>Duration must be between 15-480 minutes</HelperText>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="appointmentType">Appointment Type *</Label>
              <Select
                id="appointmentType"
                name="appointmentType"
                value={formData.appointmentType}
                onChange={handleInputChange}
                hasError={!!errors.appointmentType}
              >
                <option value="">Select type</option>
                <option value="consultation">Consultation</option>
                <option value="follow-up">Follow-up</option>
                <option value="emergency">Emergency</option>
                <option value="routine-checkup">Routine Checkup</option>
                <option value="procedure">Procedure</option>
              </Select>
              {errors.appointmentType && <ErrorText>{errors.appointmentType}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="priority">Priority</Label>
              <Select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="bookingSource">Booking Source *</Label>
              <Select
                id="bookingSource"
                name="bookingSource"
                value={formData.bookingSource}
                onChange={handleInputChange}
                hasError={!!errors.bookingSource}
              >
                <option value="">Select source</option>
                <option value="website">Website</option>
                <option value="mobile-app">Mobile App</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="phone-call">Phone Call</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="in-person">In Person</option>
                <option value="third-party">Third Party</option>
                <option value="referral">Referral</option>
                <option value="qr-code">QR Code</option>
                <option value="social-media">Social Media</option>
                <option value="voice-bot">Voice Bot</option>
                <option value="api">API</option>
              </Select>
              {errors.bookingSource && <ErrorText>{errors.bookingSource}</ErrorText>}
            </FormGroup>
          </FormGrid>
        </Section>

        {/* Additional Details Section */}
        <Section>
          <SectionHeader>
            <SectionIcon>📝</SectionIcon>
            <SectionTitle>Additional Details</SectionTitle>
          </SectionHeader>
          
          <FormGrid>
            <FormGroup className="full-width">
              <Label htmlFor="symptoms">Symptoms</Label>
              <TextArea
                id="symptoms"
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                placeholder="Enter symptoms separated by commas"
                rows={3}
              />
              <HelperText>Separate multiple symptoms with commas</HelperText>
            </FormGroup>

            <FormGroup className="full-width">
              <Label htmlFor="notes">Notes</Label>
              <TextArea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes or instructions"
                rows={3}
              />
            </FormGroup>

            <FormGroup className="full-width">
              <Label htmlFor="specialRequirements">Special Requirements</Label>
              <TextArea
                id="specialRequirements"
                name="specialRequirements"
                value={formData.specialRequirements}
                onChange={handleInputChange}
                placeholder="Any special requirements or accommodations"
                rows={2}
              />
            </FormGroup>
          </FormGrid>
        </Section>

        {/* Payment Information Section */}
        <Section>
          <SectionHeader>
            <SectionIcon>💳</SectionIcon>
            <SectionTitle>Payment Information</SectionTitle>
          </SectionHeader>
          
          <FormGrid>
            <FormGroup>
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select
                id="paymentStatus"
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleInputChange}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="paymentAmount">Payment Amount</Label>
              <Input
                type="number"
                id="paymentAmount"
                name="paymentAmount"
                value={formData.paymentAmount}
                onChange={handleInputChange}
                hasError={!!errors.paymentAmount}
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />
              {errors.paymentAmount && <ErrorText>{errors.paymentAmount}</ErrorText>}
              <HelperText>Optional - Leave empty if not applicable</HelperText>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
              >
                <option value="">Select payment method</option>
                <option value="cash">Cash</option>
                <option value="card">Credit/Debit Card</option>
                <option value="upi">UPI</option>
                <option value="net-banking">Net Banking</option>
                <option value="insurance">Insurance</option>
                <option value="wallet">Digital Wallet</option>
              </Select>
            </FormGroup>
          </FormGrid>
        </Section>

        {/* Consultation Details Section */}
        <Section>
          <SectionHeader>
            <SectionIcon>🩺</SectionIcon>
            <SectionTitle>Consultation Details (Optional)</SectionTitle>
          </SectionHeader>
          
          <FormGrid>
            <FormGroup className="full-width">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <TextArea
                id="diagnosis"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleInputChange}
                placeholder="Enter diagnosis details"
                rows={3}
              />
            </FormGroup>

            <FormGroup className="full-width">
              <Label htmlFor="prescription">Prescription</Label>
              <TextArea
                id="prescription"
                name="prescription"
                value={formData.prescription}
                onChange={handleInputChange}
                placeholder="Enter prescription details"
                rows={3}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="nextAppointmentDate">Next Appointment Date</Label>
              <Input
                type="date"
                id="nextAppointmentDate"
                name="nextAppointmentDate"
                value={formData.nextAppointmentDate}
                onChange={handleInputChange}
                hasError={!!errors.nextAppointmentDate}
                min={formData.appointmentDate || today}
              />
              {errors.nextAppointmentDate && <ErrorText>{errors.nextAppointmentDate}</ErrorText>}
            </FormGroup>

            <CheckboxGroup>
              <CheckboxInput
                type="checkbox"
                id="followUpRequired"
                name="followUpRequired"
                checked={formData.followUpRequired}
                onChange={handleInputChange}
              />
              <CheckboxLabel htmlFor="followUpRequired">
                Follow-up required
              </CheckboxLabel>
            </CheckboxGroup>
          </FormGrid>
        </Section>

        {/* Form Actions */}
        <FormActions>
          <ActionButton type="button" variant="secondary" onClick={handleCancel}>
            Cancel
          </ActionButton>
          <ActionButton onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating Appointment...' : 'Create Appointment'}
          </ActionButton>
        </FormActions>
      </FormContent>
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

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 60px;
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
  }
`;

export default CreateAppointmentForm;