import React, { useState } from 'react';
import styled from 'styled-components';

const theme = {
  colors: {
    primary: '#6366f1',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  }
};

interface AppointmentDetail {
  id: string;
  appointmentId: string;
  patient: {
    name: string;
    phone: string;
    email: string;
    patientId: string;
    dateOfBirth: string;
    gender: string;
    bloodGroup: string;
  };
  doctor: {
    name: string;
    specialization: string;
    experience: string;
    qualification: string;
  };
  appointmentDateTime: string;
  duration: number;
  appointmentType: string;
  status: string;
  priority: string;
  bookingSource: string;
  symptoms: string[];
  notes: string;
  specialRequirements: string;
  paymentStatus: string;
  paymentAmount: number;
  paymentMethod: string;
  consultation?: {
    diagnosis: string;
    prescription: string;
    nextAppointment: string;
    followUpRequired: boolean;
  };
  remindersSent: number;
  lastReminderSent: string;
  createdAt: string;
  updatedAt: string;
}

const AppointmentDetail = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const appointment: AppointmentDetail = {
    id: '1',
    appointmentId: 'APT-2025-001',
    patient: {
      name: 'John Doe',
      phone: '+91 9876543210',
      email: 'john.doe@email.com',
      patientId: 'PAT001',
      dateOfBirth: '1985-06-15',
      gender: 'Male',
      bloodGroup: 'O+'
    },
    doctor: {
      name: 'Dr. Sarah Wilson',
      specialization: 'Cardiology',
      experience: '10+ years',
      qualification: 'MD, DM Cardiology'
    },
    appointmentDateTime: '2025-07-05T10:30:00',
    duration: 30,
    appointmentType: 'consultation',
    status: 'scheduled',
    priority: 'medium',
    bookingSource: 'website',
    symptoms: ['Chest pain', 'Shortness of breath', 'Fatigue'],
    notes: 'Patient reports experiencing chest pain for the past week, especially during physical activity.',
    specialRequirements: 'Wheelchair accessible room required',
    paymentStatus: 'pending',
    paymentAmount: 500,
    paymentMethod: 'UPI',
    consultation: {
      diagnosis: 'Mild angina, requires further investigation',
      prescription: 'Aspirin 75mg daily, Atorvastatin 20mg at bedtime',
      nextAppointment: '2025-07-12T10:30:00',
      followUpRequired: true
    },
    remindersSent: 1,
    lastReminderSent: '2025-07-04T18:00:00',
    createdAt: '2025-07-03T14:30:00',
    updatedAt: '2025-07-04T09:15:00'
  };

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

  const handleStatusChange = (newStatus: string) => {
    console.log('Status changed to:', newStatus);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log('Appointment saved');
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleReschedule = () => {
    console.log('Reschedule appointment');
  };

  const handleCancelAppointment = () => {
    console.log('Cancel appointment');
  };

  const handleSendReminder = () => {
    console.log('Send reminder');
  };

  const { date, time } = formatDateTime(appointment.appointmentDateTime);

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
          active={activeTab === 'consultation'} 
          onClick={() => setActiveTab('consultation')}
        >
          Consultation
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
                    <PatientName>{appointment.patient.name}</PatientName>
                    <PatientDetails>
                      {appointment.patient.patientId} • {calculateAge(appointment.patient.dateOfBirth)} years old
                    </PatientDetails>
                    <ContactInfo>
                      📞 {appointment.patient.phone}<br/>
                      ✉️ {appointment.patient.email}
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
                    <DoctorName>{appointment.doctor.name}</DoctorName>
                    <DoctorDetails>
                      {appointment.doctor.qualification}<br/>
                      {appointment.doctor.specialization} • {appointment.doctor.experience}
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
                        {appointment.symptoms.map((symptom, index) => (
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
            <InfoCard>
              <CardHeader>
                <CardIcon>👤</CardIcon>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardBody>
                <PatientGrid>
                  <InfoRow>
                    <InfoLabel>Full Name:</InfoLabel>
                    <InfoValue>{appointment.patient.name}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Patient ID:</InfoLabel>
                    <InfoValue>{appointment.patient.patientId}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Date of Birth:</InfoLabel>
                    <InfoValue>{new Date(appointment.patient.dateOfBirth).toLocaleDateString('en-IN')}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Age:</InfoLabel>
                    <InfoValue>{calculateAge(appointment.patient.dateOfBirth)} years</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Gender:</InfoLabel>
                    <InfoValue>{appointment.patient.gender}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Blood Group:</InfoLabel>
                    <InfoValue>{appointment.patient.bloodGroup}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Phone:</InfoLabel>
                    <InfoValue>{appointment.patient.phone}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Email:</InfoLabel>
                    <InfoValue>{appointment.patient.email}</InfoValue>
                  </InfoRow>
                </PatientGrid>
              </CardBody>
            </InfoCard>
          </PatientTab>
        )}

        {activeTab === 'consultation' && (
          <ConsultationTab>
            {appointment.consultation ? (
              <InfoCard>
                <CardHeader>
                  <CardIcon>🩺</CardIcon>
                  <CardTitle>Consultation Details</CardTitle>
                </CardHeader>
                <CardBody>
                  <ConsultationGrid>
                    <ConsultationSection>
                      <SectionTitle>Diagnosis:</SectionTitle>
                      <ConsultationText>{appointment.consultation.diagnosis}</ConsultationText>
                    </ConsultationSection>
                    
                    <ConsultationSection>
                      <SectionTitle>Prescription:</SectionTitle>
                      <ConsultationText>{appointment.consultation.prescription}</ConsultationText>
                    </ConsultationSection>
                    
                    <InfoRow>
                      <InfoLabel>Follow-up Required:</InfoLabel>
                      <InfoValue>{appointment.consultation.followUpRequired ? 'Yes' : 'No'}</InfoValue>
                    </InfoRow>
                    
                    {appointment.consultation.nextAppointment && (
                      <InfoRow>
                        <InfoLabel>Next Appointment:</InfoLabel>
                        <InfoValue>
                          {formatDateTime(appointment.consultation.nextAppointment).date} at {formatDateTime(appointment.consultation.nextAppointment).time}
                        </InfoValue>
                      </InfoRow>
                    )}
                  </ConsultationGrid>
                </CardBody>
              </InfoCard>
            ) : (
              <EmptyState>
                <EmptyIcon>🩺</EmptyIcon>
                <EmptyTitle>No Consultation Data</EmptyTitle>
                <EmptyText>Consultation details will appear here after the appointment is completed.</EmptyText>
              </EmptyState>
            )}
          </ConsultationTab>
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
                    <InfoLabel>Payment Method:</InfoLabel>
                    <InfoValue>{appointment.paymentMethod}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Transaction Date:</InfoLabel>
                    <InfoValue>{new Date(appointment.createdAt).toLocaleDateString('en-IN')}</InfoValue>
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
          {appointment.lastReminderSent && (
            <MetadataItem>
              <MetadataLabel>Last Reminder:</MetadataLabel>
              <MetadataValue>{formatDateTime(appointment.lastReminderSent).date} at {formatDateTime(appointment.lastReminderSent).time}</MetadataValue>
            </MetadataItem>
          )}
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
const ConsultationTab = styled.div``;
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

const ConsultationGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ConsultationSection = styled.div`
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
`;

const ConsultationText = styled.p`
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
  margin: 0;
`;

const PaymentGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
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