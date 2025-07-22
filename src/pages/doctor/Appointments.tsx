import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiEdit3, 
  FiTrash2, 
  FiEye, 
  FiRefreshCw, 
  FiFilter, 
  FiDownload, 
  FiPlus,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiPlay,
  FiPause,
  FiStopCircle
} from "react-icons/fi";

// Theme colors matching your existing design
const theme = {
  colors: {
    primary: "#7c3aed",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    gray: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827"
    }
  }
};

const AppointmentManagement = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    patientName: '',
    appointmentType: 'all'
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Mock data for demonstration
  const mockAppointments = [
    {
      id: "APT001",
      patient: {
        name: "John Doe",
        phone: "+91 9876543210",
        email: "john@example.com",
        age: 32
      },
      date: "2025-07-21",
      time: "10:00",
      type: "Consultation",
      status: "confirmed",
      duration: 30,
      fees: 500,
      symptoms: "Fever and headache",
      notes: "Follow up required"
    },
    {
      id: "APT002",
      patient: {
        name: "Jane Smith",
        phone: "+91 9876543211",
        email: "jane@example.com",
        age: 28
      },
      date: "2025-07-21",
      time: "11:30",
      type: "Follow-up",
      status: "in-progress",
      duration: 20,
      fees: 300,
      symptoms: "Diabetes checkup",
      notes: "Regular monitoring"
    },
    {
      id: "APT003",
      patient: {
        name: "Mike Johnson",
        phone: "+91 9876543212",
        email: "mike@example.com",
        age: 45
      },
      date: "2025-07-21",
      time: "14:00",
      type: "Consultation",
      status: "scheduled",
      duration: 45,
      fees: 750,
      symptoms: "Chest pain",
      notes: "Emergency consultation"
    },
    {
      id: "APT004",
      patient: {
        name: "Sarah Wilson",
        phone: "+91 9876543213",
        email: "sarah@example.com",
        age: 35
      },
      date: "2025-07-22",
      time: "09:00",
      type: "Consultation",
      status: "completed",
      duration: 30,
      fees: 500,
      symptoms: "Routine checkup",
      notes: "All normal"
    },
    {
      id: "APT005",
      patient: {
        name: "Robert Brown",
        phone: "+91 9876543214",
        email: "robert@example.com",
        age: 52
      },
      date: "2025-07-23",
      time: "15:30",
      type: "Follow-up",
      status: "scheduled",
      duration: 25,
      fees: 350,
      symptoms: "Blood pressure monitoring",
      notes: "Regular checkup"
    },
    {
      id: "APT006",
      patient: {
        name: "Emily Davis",
        phone: "+91 9876543215",
        email: "emily@example.com",
        age: 29
      },
      date: "2025-07-24",
      time: "11:00",
      type: "Consultation",
      status: "confirmed",
      duration: 40,
      fees: 600,
      symptoms: "Migraine and nausea",
      notes: "First visit"
    }
  ];

  useEffect(() => {
    setAppointments(mockAppointments);
    setPagination(prev => ({ ...prev, total: mockAppointments.length, totalPages: 1 }));
    
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <FiCheck size={12} />;
      case 'completed': return <FiCheck size={12} />;
      case 'in-progress': return <FiPlay size={12} />;
      case 'cancelled': return <FiX size={12} />;
      case 'no-show': return <FiAlertCircle size={12} />;
      default: return <FiClock size={12} />;
    }
  };

  const getAppointmentsByTab = () => {
    const today = new Date().toISOString().split('T')[0];
    
    switch (activeTab) {
      case 'today':
        return appointments.filter(apt => apt.date === today);
      case 'upcoming':
        return appointments.filter(apt => new Date(apt.date) > new Date());
      default:
        return appointments;
    }
  };

  const handleStatusUpdate = (appointmentId, newStatus) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: newStatus }
          : apt
      )
    );
  };

  const AppointmentCard = ({ appointment }) => {
    const isToday = appointment.date === new Date().toISOString().split('T')[0];
    const appointmentTime = new Date(`${appointment.date} ${appointment.time}`);
    const isPast = appointmentTime < currentTime;
    const isCurrent = Math.abs(appointmentTime - currentTime) <= 15 * 60 * 1000; // Within 15 mins

    return (
      <CardContainer isToday={isToday} isCurrent={isCurrent}>
        <CardHeader>
          <PatientInfo>
            <PatientAvatar>
              {appointment.patient.name.split(' ').map(n => n[0]).join('')}
            </PatientAvatar>
            <PatientDetails>
              <PatientName>{appointment.patient.name}</PatientName>
              <AppointmentId>#{appointment.id}</AppointmentId>
            </PatientDetails>
          </PatientInfo>
          <StatusBadge status={appointment.status}>
            {getStatusIcon(appointment.status)}
            {appointment.status.replace('-', ' ')}
          </StatusBadge>
        </CardHeader>

        <CardContent>
          <AppointmentDetails>
            <DetailRow>
              <FiCalendar size={14} />
              <span>{new Date(appointment.date).toLocaleDateString('en-IN')}</span>
            </DetailRow>
            <DetailRow>
              <FiClock size={14} />
              <span>{appointment.time} ({appointment.duration} min)</span>
            </DetailRow>
            <DetailRow>
              <FiUser size={14} />
              <span>{appointment.type}</span>
            </DetailRow>
            <DetailRow>
              <FiPhone size={14} />
              <span>{appointment.patient.phone}</span>
            </DetailRow>
          </AppointmentDetails>

          <SymptomsText>
            <strong>Symptoms:</strong> {appointment.symptoms}
          </SymptomsText>

          <FeesAmount>₹{appointment.fees}</FeesAmount>
        </CardContent>

        <CardActions>
          <ActionButton 
            variant="primary" 
            onClick={() => {
              setSelectedAppointment(appointment);
              setIsDetailsModalOpen(true);
            }}
          >
            <FiEye size={14} />
            View Details
          </ActionButton>
          
          {appointment.status === 'confirmed' && (
            <ActionButton 
              variant="success"
              onClick={() => handleStatusUpdate(appointment.id, 'in-progress')}
            >
              <FiPlay size={14} />
              Start
            </ActionButton>
          )}
          
          {appointment.status === 'in-progress' && (
            <ActionButton 
              variant="warning"
              onClick={() => {
                setSelectedAppointment(appointment);
                setIsConsultationModalOpen(true);
              }}
            >
              <FiEdit3 size={14} />
              Add Notes
            </ActionButton>
          )}

          {appointment.status === 'scheduled' && (
            <ActionButton 
              variant="primary"
              onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
            >
              <FiCheck size={14} />
              Confirm
            </ActionButton>
          )}
        </CardActions>
      </CardContainer>
    );
  };

  const AppointmentDetailsModal = () => {
    if (!selectedAppointment || !isDetailsModalOpen) return null;

    return (
      <ModalOverlay onClick={() => setIsDetailsModalOpen(false)}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <ModalHeader>
            <h2>Appointment Details</h2>
            <CloseButton onClick={() => setIsDetailsModalOpen(false)}>
              <FiX size={20} />
            </CloseButton>
          </ModalHeader>
          
          <ModalBody>
            <DetailSection>
              <SectionTitle>Patient Information</SectionTitle>
              <DetailGrid>
                <DetailItem>
                  <DetailLabel>Name</DetailLabel>
                  <DetailValue>{selectedAppointment.patient.name}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Age</DetailLabel>
                  <DetailValue>{selectedAppointment.patient.age} years</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Phone</DetailLabel>
                  <DetailValue>{selectedAppointment.patient.phone}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Email</DetailLabel>
                  <DetailValue>{selectedAppointment.patient.email}</DetailValue>
                </DetailItem>
              </DetailGrid>
            </DetailSection>

            <DetailSection>
              <SectionTitle>Appointment Details</SectionTitle>
              <DetailGrid>
                <DetailItem>
                  <DetailLabel>Date</DetailLabel>
                  <DetailValue>{new Date(selectedAppointment.date).toLocaleDateString('en-IN')}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Time</DetailLabel>
                  <DetailValue>{selectedAppointment.time}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Duration</DetailLabel>
                  <DetailValue>{selectedAppointment.duration} minutes</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Type</DetailLabel>
                  <DetailValue>{selectedAppointment.type}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Fees</DetailLabel>
                  <DetailValue>₹{selectedAppointment.fees}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Status</DetailLabel>
                  <DetailValue>
                    <StatusBadge status={selectedAppointment.status}>
                      {getStatusIcon(selectedAppointment.status)}
                      {selectedAppointment.status.replace('-', ' ')}
                    </StatusBadge>
                  </DetailValue>
                </DetailItem>
              </DetailGrid>
            </DetailSection>

            <DetailSection>
              <SectionTitle>Medical Information</SectionTitle>
              <DetailItem>
                <DetailLabel>Symptoms</DetailLabel>
                <DetailValue>{selectedAppointment.symptoms}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Notes</DetailLabel>
                <DetailValue>{selectedAppointment.notes}</DetailValue>
              </DetailItem>
            </DetailSection>
          </ModalBody>

          <ModalFooter>
            <SecondaryButton onClick={() => setIsDetailsModalOpen(false)}>
              Close
            </SecondaryButton>
            {selectedAppointment.status !== 'completed' && (
              <PrimaryButton onClick={() => {
                setIsDetailsModalOpen(false);
                setIsConsultationModalOpen(true);
              }}>
                Add Consultation Notes
              </PrimaryButton>
            )}
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    );
  };

  const ConsultationModal = () => {
    const [consultationNotes, setConsultationNotes] = useState({
      symptoms: selectedAppointment?.symptoms || '',
      diagnosis: '',
      treatment: '',
      medications: '',
      followUpInstructions: '',
      doctorNotes: ''
    });

    if (!selectedAppointment || !isConsultationModalOpen) return null;

    const handleSaveConsultation = () => {
      // Here you would typically save to backend
      handleStatusUpdate(selectedAppointment.id, 'completed');
      setIsConsultationModalOpen(false);
      alert('Consultation notes saved successfully!');
    };

    return (
      <ModalOverlay onClick={() => setIsConsultationModalOpen(false)}>
        <ModalContent large onClick={e => e.stopPropagation()}>
          <ModalHeader>
            <h2>Consultation Notes - {selectedAppointment.patient.name}</h2>
            <CloseButton onClick={() => setIsConsultationModalOpen(false)}>
              <FiX size={20} />
            </CloseButton>
          </ModalHeader>
          
          <ModalBody>
            <FormSection>
              <FormGroup>
                <FormLabel>Patient Symptoms</FormLabel>
                <FormTextArea
                  value={consultationNotes.symptoms}
                  onChange={(e) => setConsultationNotes(prev => ({ ...prev, symptoms: e.target.value }))}
                  placeholder="Describe patient's symptoms..."
                  rows={3}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Diagnosis</FormLabel>
                <FormTextArea
                  value={consultationNotes.diagnosis}
                  onChange={(e) => setConsultationNotes(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="Enter diagnosis..."
                  rows={2}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Treatment Plan</FormLabel>
                <FormTextArea
                  value={consultationNotes.treatment}
                  onChange={(e) => setConsultationNotes(prev => ({ ...prev, treatment: e.target.value }))}
                  placeholder="Describe treatment plan..."
                  rows={3}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Medications</FormLabel>
                <FormTextArea
                  value={consultationNotes.medications}
                  onChange={(e) => setConsultationNotes(prev => ({ ...prev, medications: e.target.value }))}
                  placeholder="List prescribed medications..."
                  rows={2}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Follow-up Instructions</FormLabel>
                <FormTextArea
                  value={consultationNotes.followUpInstructions}
                  onChange={(e) => setConsultationNotes(prev => ({ ...prev, followUpInstructions: e.target.value }))}
                  placeholder="Instructions for patient..."
                  rows={2}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Doctor's Private Notes</FormLabel>
                <FormTextArea
                  value={consultationNotes.doctorNotes}
                  onChange={(e) => setConsultationNotes(prev => ({ ...prev, doctorNotes: e.target.value }))}
                  placeholder="Private notes for future reference..."
                  rows={2}
                />
              </FormGroup>
            </FormSection>
          </ModalBody>

          <ModalFooter>
            <SecondaryButton onClick={() => setIsConsultationModalOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={handleSaveConsultation}>
              Save & Complete Appointment
            </PrimaryButton>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    );
  };

  const filteredAppointments = getAppointmentsByTab();
  const todayStats = appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]);

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>
            Appointment Management
            <TotalCount>({appointments.length} total)</TotalCount>
          </Title>
          <Subtitle>Manage your appointments and patient consultations</Subtitle>
          
          {activeTab === 'today' && (
            <StatsContainer>
              <StatCard color={theme.colors.primary}>
                <StatValue>{todayStats.length}</StatValue>
                <StatLabel>Total Today</StatLabel>
              </StatCard>
              <StatCard color={theme.colors.success}>
                <StatValue>{todayStats.filter(a => a.status === 'completed').length}</StatValue>
                <StatLabel>Completed</StatLabel>
              </StatCard>
              <StatCard color={theme.colors.warning}>
                <StatValue>{todayStats.filter(a => !['completed', 'cancelled', 'no-show'].includes(a.status)).length}</StatValue>
                <StatLabel>Remaining</StatLabel>
              </StatCard>
            </StatsContainer>
          )}
        </HeaderContent>
        
        <HeaderActions>
          <RefreshButton onClick={() => window.location.reload()}>
            <FiRefreshCw size={16} />
            Refresh
          </RefreshButton>
          <FilterButton>
            <FiFilter size={16} />
            Filters
          </FilterButton>
          <ExportButton>
            <FiDownload size={16} />
            Export
          </ExportButton>
        </HeaderActions>
      </Header>

      <TabContainer>
        <TabButton 
          active={activeTab === 'all'} 
          onClick={() => setActiveTab('all')}
        >
          All Appointments
        </TabButton>
        <TabButton 
          active={activeTab === 'today'} 
          onClick={() => setActiveTab('today')}
        >
          Today's Schedule
        </TabButton>
        <TabButton 
          active={activeTab === 'upcoming'} 
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </TabButton>
      </TabContainer>

      <Content>
        {loading ? (
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Loading appointments...</LoadingText>
          </LoadingContainer>
        ) : filteredAppointments.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📅</EmptyIcon>
            <EmptyTitle>No appointments found</EmptyTitle>
            <EmptyMessage>
              {activeTab === 'today' 
                ? "No appointments scheduled for today"
                : activeTab === 'upcoming'
                ? "No upcoming appointments"
                : "No appointments in the system"
              }
            </EmptyMessage>
          </EmptyState>
        ) : (
          <AppointmentGrid>
            {filteredAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </AppointmentGrid>
        )}
      </Content>

      <AppointmentDetailsModal />
      <ConsultationModal />
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #6366f1 100%);
  color: white;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const TotalCount = styled.span`
  font-size: 16px;
  font-weight: 400;
  opacity: 0.8;
`;

const Subtitle = styled.p`
  font-size: 14px;
  margin: 0 0 16px 0;
  opacity: 0.9;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 80px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  opacity: 0.8;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const RefreshButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const FilterButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ExportButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${theme.colors.gray[200]};
  background: ${theme.colors.gray[50]};
`;

const TabButton = styled.button`
  padding: 16px 24px;
  border: none;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? theme.colors.primary : theme.colors.gray[600]};
  font-weight: ${props => props.active ? '600' : '500'};
  border-bottom: 2px solid ${props => props.active ? theme.colors.primary : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? 'white' : theme.colors.gray[100]};
  }
`;

const Content = styled.div`
  padding: 24px;
`;

const AppointmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CardContainer = styled.div`
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: 12px;
  padding: 20px;
  background: white;
  transition: all 0.2s;
  ${props => props.isToday && `border-color: ${theme.colors.primary}; box-shadow: 0 0 0 1px ${theme.colors.primary}20;`}
  ${props => props.isCurrent && `border-color: ${theme.colors.warning}; box-shadow: 0 4px 12px ${theme.colors.warning}20;`}

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PatientAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${theme.colors.primary}, #6366f1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
`;

const PatientDetails = styled.div``;

const PatientName = styled.div`
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin-bottom: 2px;
`;

const AppointmentId = styled.div`
  font-size: 12px;
  color: ${theme.colors.gray[500]};
`;
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return theme.colors.primary;
      case 'completed': return theme.colors.success;
      case 'in-progress': return theme.colors.warning;
      case 'cancelled': return theme.colors.danger;
      case 'no-show': return theme.colors.danger;
      default: return theme.colors.gray[500];
    }
  };
const StatusBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
  background: ${props => getStatusColor(props.status)}20;
  color: ${props => getStatusColor(props.status)};
`;

const CardContent = styled.div`
  margin-bottom: 16px;
`;

const AppointmentDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${theme.colors.gray[600]};
`;

const SymptomsText = styled.div`
  font-size: 13px;
  color: ${theme.colors.gray[700]};
  margin-bottom: 12px;
  line-height: 1.4;
`;

const FeesAmount = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.success};
  text-align: right;
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary}10;
          border-color: ${theme.colors.primary}30;
          color: ${theme.colors.primary};
          &:hover { background: ${theme.colors.primary}20; }
        `;
      case 'success':
        return `
          background: ${theme.colors.success}10;
          border-color: ${theme.colors.success}30;
          color: ${theme.colors.success};
          &:hover { background: ${theme.colors.success}20; }
        `;
      case 'warning':
        return `
          background: ${theme.colors.warning}10;
          border-color: ${theme.colors.warning}30;
          color: ${theme.colors.warning};
          &:hover { background: ${theme.colors.warning}20; }
        `;
      default:
        return `
          background: ${theme.colors.gray[100]};
          border-color: ${theme.colors.gray[300]};
          color: ${theme.colors.gray[700]};
          &:hover { background: ${theme.colors.gray[200]}; }
        `;
    }
  }}
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid ${theme.colors.gray[200]};
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
  color: ${theme.colors.gray[600]};
  font-size: 14px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.gray[700]};
  margin: 0 0 8px 0;
`;

const EmptyMessage = styled.p`
  font-size: 14px;
  color: ${theme.colors.gray[500]};
  margin: 0;
  max-width: 400px;
  line-height: 1.5;
`;

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: ${props => props.large ? '800px' : '600px'};
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid ${theme.colors.gray[200]};

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: ${theme.colors.gray[900]};
  }
`;

const CloseButton = styled.button`
  padding: 4px;
  border: none;
  background: none;
  color: ${theme.colors.gray[500]};
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.gray[100]};
    color: ${theme.colors.gray[700]};
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid ${theme.colors.gray[200]};
`;

const PrimaryButton = styled.button`
  padding: 10px 20px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.primary}dd;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled.button`
  padding: 10px 20px;
  background: white;
  color: ${theme.colors.gray[700]};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.gray[50]};
    border-color: ${theme.colors.gray[400]};
  }
`;

// Detail Modal Components
const DetailSection = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${theme.colors.gray[600]};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DetailValue = styled.span`
  font-size: 14px;
  color: ${theme.colors.gray[900]};
  font-weight: 500;
`;

// Form Components
const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.gray[700]};
`;

const FormTextArea = styled.textarea`
  padding: 12px;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }

  &::placeholder {
    color: ${theme.colors.gray[500]};
  }
`;

export default AppointmentManagement;