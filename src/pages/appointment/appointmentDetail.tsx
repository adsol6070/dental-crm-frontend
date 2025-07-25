import React, { useState } from 'react';
import styled from 'styled-components';
import { useAppointmentById } from '@/hooks/useAppointment'; // Adjust import path as needed
import { useParams } from 'react-router-dom'; // Assuming you're using React Router

const theme = {
  colors: {
    primary: '#6366f1',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  }
};

interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  alternatePhone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface PatientInfo {
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  _id: string;
  patientId: string;
  fullName: string;
  age: number;
  id: string;
}

interface DoctorPersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ProfessionalInfo {
  specialization: string;
  qualifications: string[];
  experience: number;
  licenseNumber: string;
  department: string;
}

interface WorkingDay {
  day: string;
  startTime: string;
  endTime: string;
  isWorking: boolean;
  _id: string;
  id: string;
}

interface BreakTime {
  startTime: string;
  endTime: string;
  description: string;
  _id: string;
  id: string;
}

interface Schedule {
  workingDays: WorkingDay[];
  slotDuration: number;
  breakTimes: BreakTime[];
}

interface Fees {
  consultationFee: number;
  followUpFee: number;
  emergencyFee: number;
}

interface DoctorInfo {
  personalInfo: DoctorPersonalInfo;
  professionalInfo: ProfessionalInfo;
  schedule: Schedule;
  fees: Fees;
  _id: string;
  doctorId: string;
  fullName: string;
  id: string;
}

interface AppointmentDetail {
  metadata: {
    ipAddress: string;
    userAgent: string;
  };
  _id: string;
  patient: PatientInfo;
  doctor: DoctorInfo;
  appointmentDateTime: string;
  endDateTime: string;
  duration: number;
  appointmentType: string;
  status: string;
  priority: string;
  bookingSource: string;
  symptoms: string[];
  notes: string;
  specialRequirements: string;
  remindersSent: number;
  paymentStatus: string;
  paymentAmount: number;
  appointmentId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    appointment: AppointmentDetail;
  };
}

const AppointmentDetail = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>(); // Get appointment ID from URL
  const { data, isLoading, error, refetch } = useAppointmentById(appointmentId!);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  console.log("appointment data", data);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#6b7280';
      case 'confirmed': return theme.colors.info;
      case 'in-progress': return theme.colors.warning;
      case 'completed': return theme.colors.success;
      case 'cancelled': return theme.colors.danger;
      case 'no-show': return '#9333ea';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return theme.colors.success;
      case 'medium': return theme.colors.warning;
      case 'high': return '#f97316';
      case 'urgent': return theme.colors.danger;
      default: return theme.colors.warning;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return theme.colors.warning;
      case 'paid': return theme.colors.success;
      case 'failed': return theme.colors.danger;
      case 'refunded': return '#6b7280';
      default: return theme.colors.warning;
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-IN', { 
        weekday: 'long',
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getPatientName = (patient: PatientInfo) => {
    return patient.fullName || `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`;
  };

  const getDoctorName = (doctor: DoctorInfo) => {
    return doctor.fullName || `Dr. ${doctor.personalInfo.firstName} ${doctor.personalInfo.lastName}`;
  };

  const getFullAddress = (address: ContactInfo['address']) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  };

  const handleStatusChange = (newStatus: string) => {
    console.log('Status changed to:', newStatus);
    // Implement status update API call here
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log('Appointment saved');
    // Implement save API call here
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleReschedule = () => {
    console.log('Reschedule appointment');
    // Implement reschedule logic here
  };

  const handleCancelAppointment = () => {
    console.log('Cancel appointment');
    // Implement cancel API call here
  };

  const handleSendReminder = () => {
    console.log('Send reminder');
    // Implement send reminder API call here
  };

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading appointment details...</LoadingText>
        </LoadingContainer>
      </PageContainer>
    );
  }

  // Error state
  if (error || !data?.success) {
    return (
      <PageContainer>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Failed to load appointment</ErrorTitle>
          <ErrorMessage>
            {error instanceof Error ? error.message : 'Unable to fetch appointment details. Please try again.'}
          </ErrorMessage>
          <RetryButton onClick={() => refetch()}>
            🔄 Retry
          </RetryButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

  const appointment = data?.data.appointment;
  const { date, time } = formatDateTime(appointment.appointmentDateTime);
  const patientName = getPatientName(appointment.patient);
  const doctorName = getDoctorName(appointment.doctor);

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader>
        <HeaderLeft>
          <BackButton>← Back to Appointments</BackButton>
          <HeaderInfo>
            <Title>Appointment Details</Title>
            <AppointmentId>{appointment.appointmentId}</AppointmentId>
          </HeaderInfo>
        </HeaderLeft>
        
        <HeaderActions>
          <StatusSelect 
            value={appointment.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            color={getStatusColor(appointment.status)}
          >
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No Show</option>
          </StatusSelect>
          
          {!isEditing ? (
            <>
              <ActionButton variant="secondary" onClick={handleEdit}>
                ✏️ Edit
              </ActionButton>
              <ActionButton variant="primary" onClick={handleSendReminder}>
                📧 Send Reminder
              </ActionButton>
            </>
          ) : (
            <>
              <ActionButton variant="secondary" onClick={handleCancel}>
                Cancel
              </ActionButton>
              <ActionButton variant="primary" onClick={handleSave}>
                💾 Save
              </ActionButton>
            </>
          )}
        </HeaderActions>
      </PageHeader>

      {/* Quick Info Bar */}
      <QuickInfoBar>
        <QuickInfoItem>
          <QuickInfoLabel>Date & Time</QuickInfoLabel>
          <QuickInfoValue>{date} at {time}</QuickInfoValue>
        </QuickInfoItem>
        <QuickInfoItem>
          <QuickInfoLabel>Duration</QuickInfoLabel>
          <QuickInfoValue>{appointment.duration} minutes</QuickInfoValue>
        </QuickInfoItem>
        <QuickInfoItem>
          <QuickInfoLabel>Type</QuickInfoLabel>
          <QuickInfoValue>{appointment.appointmentType}</QuickInfoValue>
        </QuickInfoItem>
        <QuickInfoItem>
          <QuickInfoLabel>Priority</QuickInfoLabel>
          <PriorityBadge color={getPriorityColor(appointment.priority)}>
            {appointment.priority}
          </PriorityBadge>
        </QuickInfoItem>
      </QuickInfoBar>

      {/* Tab Navigation */}
      <TabNavigation>
        <TabButton 
          active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </TabButton>
        <TabButton 
          active={activeTab === 'patient'} 
          onClick={() => setActiveTab('patient')}
        >
          Patient Info
        </TabButton>
        <TabButton 
          active={activeTab === 'doctor'} 
          onClick={() => setActiveTab('doctor')}
        >
          Doctor Info
        </TabButton>
        <TabButton 
          active={activeTab === 'payment'} 
          onClick={() => setActiveTab('payment')}
        >
          Payment
        </TabButton>
      </TabNavigation>

      {/* Tab Content */}
      <TabContent>
        {activeTab === 'overview' && (
          <OverviewTab>
            <ContentGrid>
              {/* Appointment Information */}
              <InfoCard>
                <CardHeader>
                  <CardIcon>📅</CardIcon>
                  <CardTitle>Appointment Information</CardTitle>
                </CardHeader>
                <CardBody>
                  <InfoRow>
                    <InfoLabel>Appointment ID:</InfoLabel>
                    <InfoValue>{appointment.appointmentId}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Date & Time:</InfoLabel>
                    <InfoValue>{date} at {time}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>End Time:</InfoLabel>
                    <InfoValue>{formatDateTime(appointment.endDateTime).time}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Duration:</InfoLabel>
                    <InfoValue>{appointment.duration} minutes</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Type:</InfoLabel>
                    <InfoValue>{appointment.appointmentType}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Status:</InfoLabel>
                    <StatusBadge color={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </StatusBadge>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Priority:</InfoLabel>
                    <PriorityBadge color={getPriorityColor(appointment.priority)}>
                      {appointment.priority}
                    </PriorityBadge>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Booking Source:</InfoLabel>
                    <InfoValue>{appointment.bookingSource}</InfoValue>
                  </InfoRow>
                </CardBody>
              </InfoCard>

              {/* Patient Summary */}
              <InfoCard>
                <CardHeader>
                  <CardIcon>👤</CardIcon>
                  <CardTitle>Patient Summary</CardTitle>
                </CardHeader>
                <CardBody>
                  <PatientSummary>
                    <PatientName>{patientName}</PatientName>
                    <PatientDetails>
                      {appointment.patient.patientId} • {calculateAge(appointment.patient.personalInfo.dateOfBirth)} years old
                    </PatientDetails>
                    <ContactInfo>
                      📞 {appointment.patient.contactInfo.phone}<br/>
                      ✉️ {appointment.patient.contactInfo.email}
                    </ContactInfo>
                  </PatientSummary>
                </CardBody>
              </InfoCard>

              {/* Doctor Information */}
              <InfoCard>
                <CardHeader>
                  <CardIcon>👨‍⚕️</CardIcon>
                  <CardTitle>Doctor Information</CardTitle>
                </CardHeader>
                <CardBody>
                  <DoctorSummary>
                    <DoctorName>{doctorName}</DoctorName>
                    <DoctorDetails>
                      {appointment.doctor.professionalInfo.qualifications.join(', ')}<br/>
                      {appointment.doctor.professionalInfo.specialization} • {appointment.doctor.professionalInfo.experience} years experience
                    </DoctorDetails>
                  </DoctorSummary>
                </CardBody>
              </InfoCard>

              {/* Symptoms & Notes */}
              <InfoCard className="full-width">
                <CardHeader>
                  <CardIcon>📝</CardIcon>
                  <CardTitle>Symptoms & Notes</CardTitle>
                </CardHeader>
                <CardBody>
                  {appointment.symptoms.length > 0 && (
                    <SymptomsSection>
                      <SectionTitle>Symptoms:</SectionTitle>
                      <SymptomsList>
                        {appointment.symptoms.map((symptom: string, index: number) => (
                          <SymptomTag key={index}>{symptom}</SymptomTag>
                        ))}
                      </SymptomsList>
                    </SymptomsSection>
                  )}
                  
                  {appointment.notes && (
                    <NotesSection>
                      <SectionTitle>Notes:</SectionTitle>
                      <NotesText>{appointment.notes}</NotesText>
                    </NotesSection>
                  )}
                  
                  {appointment.specialRequirements && (
                    <RequirementsSection>
                      <SectionTitle>Special Requirements:</SectionTitle>
                      <RequirementsText>{appointment.specialRequirements}</RequirementsText>
                    </RequirementsSection>
                  )}
                </CardBody>
              </InfoCard>
            </ContentGrid>
          </OverviewTab>
        )}

        {activeTab === 'patient' && (
          <PatientTab>
            <ContentGrid>
              <InfoCard>
                <CardHeader>
                  <CardIcon>👤</CardIcon>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardBody>
                  <PatientGrid>
                    <InfoRow>
                      <InfoLabel>Full Name:</InfoLabel>
                      <InfoValue>{patientName}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Patient ID:</InfoLabel>
                      <InfoValue>{appointment.patient.patientId}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Date of Birth:</InfoLabel>
                      <InfoValue>{new Date(appointment.patient.personalInfo.dateOfBirth).toLocaleDateString('en-IN')}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Age:</InfoLabel>
                      <InfoValue>{calculateAge(appointment.patient.personalInfo.dateOfBirth)} years</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Gender:</InfoLabel>
                      <InfoValue>{appointment.patient.personalInfo.gender}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Blood Group:</InfoLabel>
                      <InfoValue>{appointment.patient.personalInfo.bloodGroup}</InfoValue>
                    </InfoRow>
                  </PatientGrid>
                </CardBody>
              </InfoCard>

              <InfoCard>
                <CardHeader>
                  <CardIcon>📞</CardIcon>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardBody>
                  <PatientGrid>
                    <InfoRow>
                      <InfoLabel>Primary Phone:</InfoLabel>
                      <InfoValue>{appointment.patient.contactInfo.phone}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Alternate Phone:</InfoLabel>
                      <InfoValue>{appointment.patient.contactInfo.alternatePhone}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Email:</InfoLabel>
                      <InfoValue>{appointment.patient.contactInfo.email}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Address:</InfoLabel>
                      <InfoValue>{getFullAddress(appointment.patient.contactInfo.address)}</InfoValue>
                    </InfoRow>
                  </PatientGrid>
                </CardBody>
              </InfoCard>
            </ContentGrid>
          </PatientTab>
        )}

        {activeTab === 'doctor' && (
          <DoctorTab>
            <ContentGrid>
              <InfoCard>
                <CardHeader>
                  <CardIcon>👨‍⚕️</CardIcon>
                  <CardTitle>Doctor Information</CardTitle>
                </CardHeader>
                <CardBody>
                  <DoctorGrid>
                    <InfoRow>
                      <InfoLabel>Full Name:</InfoLabel>
                      <InfoValue>{doctorName}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Doctor ID:</InfoLabel>
                      <InfoValue>{appointment.doctor.doctorId}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Email:</InfoLabel>
                      <InfoValue>{appointment.doctor.personalInfo.email}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Phone:</InfoLabel>
                      <InfoValue>{appointment.doctor.personalInfo.phone}</InfoValue>
                    </InfoRow>
                  </DoctorGrid>
                </CardBody>
              </InfoCard>

              <InfoCard>
                <CardHeader>
                  <CardIcon>🎓</CardIcon>
                  <CardTitle>Professional Information</CardTitle>
                </CardHeader>
                <CardBody>
                  <DoctorGrid>
                    <InfoRow>
                      <InfoLabel>Specialization:</InfoLabel>
                      <InfoValue>{appointment.doctor.professionalInfo.specialization}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Department:</InfoLabel>
                      <InfoValue>{appointment.doctor.professionalInfo.department}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Experience:</InfoLabel>
                      <InfoValue>{appointment.doctor.professionalInfo.experience} years</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>License Number:</InfoLabel>
                      <InfoValue>{appointment.doctor.professionalInfo.licenseNumber}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Qualifications:</InfoLabel>
                      <InfoValue>{appointment.doctor.professionalInfo.qualifications.join(', ')}</InfoValue>
                    </InfoRow>
                  </DoctorGrid>
                </CardBody>
              </InfoCard>

              <InfoCard>
                <CardHeader>
                  <CardIcon>💰</CardIcon>
                  <CardTitle>Fee Structure</CardTitle>
                </CardHeader>
                <CardBody>
                  <DoctorGrid>
                    <InfoRow>
                      <InfoLabel>Consultation Fee:</InfoLabel>
                      <InfoValue>₹{appointment.doctor.fees.consultationFee}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Follow-up Fee:</InfoLabel>
                      <InfoValue>₹{appointment.doctor.fees.followUpFee}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Emergency Fee:</InfoLabel>
                      <InfoValue>₹{appointment.doctor.fees.emergencyFee}</InfoValue>
                    </InfoRow>
                  </DoctorGrid>
                </CardBody>
              </InfoCard>

              <InfoCard className="full-width">
                <CardHeader>
                  <CardIcon>📅</CardIcon>
                  <CardTitle>Working Schedule</CardTitle>
                </CardHeader>
                <CardBody>
                  <ScheduleGrid>
                    {appointment.doctor.schedule.workingDays.map((day: any) => (
                      <ScheduleItem key={day._id} isWorking={day.isWorking}>
                        <ScheduleDay>{day.day.charAt(0).toUpperCase() + day.day.slice(1)}</ScheduleDay>
                        <ScheduleTime>
                          {day.isWorking ? `${day.startTime} - ${day.endTime}` : 'Off'}
                        </ScheduleTime>
                      </ScheduleItem>
                    ))}
                  </ScheduleGrid>
                  
                  {appointment.doctor.schedule.breakTimes.length > 0 && (
                    <BreakTimesSection>
                      <SectionTitle>Break Times:</SectionTitle>
                      {appointment.doctor.schedule.breakTimes.map((breakTime: any) => (
                        <BreakTimeItem key={breakTime._id}>
                          <strong>{breakTime.startTime} - {breakTime.endTime}</strong>: {breakTime.description}
                        </BreakTimeItem>
                      ))}
                    </BreakTimesSection>
                  )}
                </CardBody>
              </InfoCard>
            </ContentGrid>
          </DoctorTab>
        )}

        {activeTab === 'payment' && (
          <PaymentTab>
            <InfoCard>
              <CardHeader>
                <CardIcon>💳</CardIcon>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardBody>
                <PaymentGrid>
                  <InfoRow>
                    <InfoLabel>Payment Status:</InfoLabel>
                    <PaymentBadge color={getPaymentStatusColor(appointment.paymentStatus)}>
                      {appointment.paymentStatus}
                    </PaymentBadge>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Amount:</InfoLabel>
                    <PaymentAmount>₹{appointment.paymentAmount}</PaymentAmount>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Appointment Type:</InfoLabel>
                    <InfoValue>{appointment.appointmentType}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Booking Source:</InfoLabel>
                    <InfoValue>{appointment.bookingSource}</InfoValue>
                  </InfoRow>
                </PaymentGrid>
              </CardBody>
            </InfoCard>
          </PaymentTab>
        )}
      </TabContent>

      {/* Action Buttons */}
      <ActionSection>
        <ActionButton variant="secondary" onClick={handleReschedule}>
          📅 Reschedule
        </ActionButton>
        <ActionButton variant="danger" onClick={handleCancelAppointment}>
          ❌ Cancel Appointment
        </ActionButton>
      </ActionSection>

      {/* Metadata */}
      <MetadataSection>
        <MetadataTitle>System Information</MetadataTitle>
        <MetadataGrid>
          <MetadataItem>
            <MetadataLabel>Created:</MetadataLabel>
            <MetadataValue>{formatDateTime(appointment.createdAt).date} at {formatDateTime(appointment.createdAt).time}</MetadataValue>
          </MetadataItem>
          <MetadataItem>
            <MetadataLabel>Last Updated:</MetadataLabel>
            <MetadataValue>{formatDateTime(appointment.updatedAt).date} at {formatDateTime(appointment.updatedAt).time}</MetadataValue>
          </MetadataItem>
          <MetadataItem>
            <MetadataLabel>Reminders Sent:</MetadataLabel>
            <MetadataValue>{appointment.remindersSent}</MetadataValue>
          </MetadataItem>
          <MetadataItem>
            <MetadataLabel>IP Address:</MetadataLabel>
            <MetadataValue>{appointment.metadata.ipAddress}</MetadataValue>
          </MetadataItem>
        </MetadataGrid>
      </MetadataSection>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 12px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 8px;
`;

const ErrorTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #ef4444;
  margin: 0 0 8px 0;
`;

const ErrorMessage = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
  max-width: 400px;
  line-height: 1.5;
`;

const RetryButton = styled.button`
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  background: none;
  border: none;
  color: ${theme.colors.primary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${theme.colors.primary}dd;
  }
`;

const HeaderInfo = styled.div``;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const AppointmentId = styled.div`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const StatusSelect = styled.select<{ color: string }>`
  padding: 8px 12px;
  border: 1px solid ${props => props.color}30;
  border-radius: 6px;
  background: ${props => props.color}10;
  color: ${props => props.color};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.color};
  }
`;

const ActionButton = styled.button<{ variant: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary};
          color: white;
          border-color: ${theme.colors.primary};
          
          &:hover {
            background: ${theme.colors.primary}dd;
            transform: translateY(-1px);
          }
        `;
      case 'secondary':
        return `
          background: white;
          color: #374151;
          border-color: #d1d5db;
          
          &:hover {
            background: #f9fafb;
          }
        `;
      case 'danger':
        return `
          background: white;
          color: ${theme.colors.danger};
          border-color: ${theme.colors.danger}30;
          
          &:hover {
            background: ${theme.colors.danger}10;
          }
        `;
      default:
        return '';
    }
  }}
`;

const QuickInfoBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
`;

const QuickInfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const QuickInfoLabel = styled.span`
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
`;

const QuickInfoValue = styled.span`
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
`;

const TabNavigation = styled.div`
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 24px;
  background: white;
  border-radius: 8px 8px 0 0;
  padding: 0 16px;
  
  @media (max-width: 768px) {
    overflow-x: auto;
    padding: 0 12px;
  }
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 12px 16px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  
  ${props => props.active ? `
    color: ${theme.colors.primary};
    border-bottom-color: ${theme.colors.primary};
  ` : `
    color: #6b7280;
    
    &:hover {
      color: #374151;
    }
  `}
`;

const TabContent = styled.div`
  min-height: 400px;
`;

const OverviewTab = styled.div``;
const PatientTab = styled.div``;
const DoctorTab = styled.div``;
const PaymentTab = styled.div``;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  
  .full-width {
    grid-column: 1 / -1;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const InfoCard = styled.div`
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 16px 0 16px;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 16px;
`;

const CardIcon = styled.div`
  font-size: 18px;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const CardBody = styled.div`
  padding: 0 16px 16px 16px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f9fafb;
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
`;

const InfoValue = styled.span`
  font-size: 13px;
  color: #1f2937;
  font-weight: 500;
  text-align: right;
  max-width: 60%;
  word-wrap: break-word;
`;

const StatusBadge = styled.span<{ color: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
  background: ${props => props.color}15;
  color: ${props => props.color};
  border: 1px solid ${props => props.color}30;
`;

const PriorityBadge = styled.span<{ color: string }>`
  padding: 3px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => props.color}15;
  color: ${props => props.color};
  border: 1px solid ${props => props.color}30;
`;

const PaymentBadge = styled.span<{ color: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
  background: ${props => props.color}15;
  color: ${props => props.color};
  border: 1px solid ${props => props.color}30;
`;

const PaymentAmount = styled.span`
  font-size: 16px;
  color: #1f2937;
  font-weight: 700;
`;

const PatientSummary = styled.div`
  text-align: center;
`;

const PatientName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
`;

const PatientDetails = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
`;

const ContactInfo = styled.div`
  font-size: 12px;
  color: #374151;
  line-height: 1.6;
`;

const DoctorSummary = styled.div`
  text-align: center;
`;

const DoctorName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
`;

const DoctorDetails = styled.div`
  font-size: 12px;
  color: #6b7280;
  line-height: 1.6;
`;

const SymptomsSection = styled.div`
  margin-bottom: 16px;
`;

const NotesSection = styled.div`
  margin-bottom: 16px;
`;

const RequirementsSection = styled.div``;

const SectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
`;

const SymptomsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const SymptomTag = styled.span`
  padding: 4px 8px;
  background: ${theme.colors.info}15;
  color: ${theme.colors.info};
  border: 1px solid ${theme.colors.info}30;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
`;

const NotesText = styled.p`
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
  margin: 0;
`;

const RequirementsText = styled.p`
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
  margin: 0;
`;

const PatientGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DoctorGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PaymentGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ScheduleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  margin-bottom: 16px;
`;

const ScheduleItem = styled.div<{ isWorking: boolean }>`
  padding: 8px;
  border: 1px solid ${props => props.isWorking ? '#d1fae5' : '#fee2e2'};
  border-radius: 6px;
  background: ${props => props.isWorking ? '#f0fdf4' : '#fef2f2'};
  text-align: center;
`;

const ScheduleDay = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 2px;
`;

const ScheduleTime = styled.div`
  font-size: 10px;
  color: #6b7280;
`;

const BreakTimesSection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
`;

const BreakTimeItem = styled.div`
  font-size: 12px;
  color: #374151;
  margin-bottom: 4px;
`;

const ActionSection = styled.div`
  display: flex;
  gap: 12px;
  margin: 24px 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const MetadataSection = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  margin-top: 24px;
`;

const MetadataTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
`;

const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MetadataItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MetadataLabel = styled.span`
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
`;

const MetadataValue = styled.span`
  font-size: 12px;
  color: #374151;
  font-weight: 500;
`;

export default AppointmentDetail;