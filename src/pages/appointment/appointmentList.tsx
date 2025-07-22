import { useState } from 'react';
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

interface Appointment {
  id: string;
  appointmentId: string;
  patient: {
    name: string;
    phone: string;
    patientId: string;
  };
  doctor: {
    name: string;
    specialization: string;
  };
  appointmentDateTime: string;
  duration: number;
  appointmentType: 'consultation' | 'follow-up' | 'emergency' | 'routine-checkup' | 'procedure';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentAmount?: number;
}

const AppointmentListPage = () => {
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data
  const appointments: Appointment[] = [
    {
      id: '1',
      appointmentId: 'APT-2025-001',
      patient: { name: 'John Doe', phone: '+91 9876543210', patientId: 'PAT001' },
      doctor: { name: 'Dr. Sarah Wilson', specialization: 'Cardiology' },
      appointmentDateTime: '2025-07-05T10:30:00',
      duration: 30,
      appointmentType: 'consultation',
      status: 'scheduled',
      priority: 'medium',
      paymentStatus: 'pending',
      paymentAmount: 500
    },
    {
      id: '2',
      appointmentId: 'APT-2025-002',
      patient: { name: 'Jane Smith', phone: '+91 9876543211', patientId: 'PAT002' },
      doctor: { name: 'Dr. Michael Brown', specialization: 'Neurology' },
      appointmentDateTime: '2025-07-05T14:00:00',
      duration: 45,
      appointmentType: 'follow-up',
      status: 'confirmed',
      priority: 'high',
      paymentStatus: 'paid',
      paymentAmount: 750
    },
    {
      id: '3',
      appointmentId: 'APT-2025-003',
      patient: { name: 'Robert Johnson', phone: '+91 9876543212', patientId: 'PAT003' },
      doctor: { name: 'Dr. Emily Davis', specialization: 'Pediatrics' },
      appointmentDateTime: '2025-07-05T16:30:00',
      duration: 30,
      appointmentType: 'routine-checkup',
      status: 'in-progress',
      priority: 'low',
      paymentStatus: 'paid',
      paymentAmount: 400
    },
    {
      id: '4',
      appointmentId: 'APT-2025-004',
      patient: { name: 'Emily Davis', phone: '+91 9876543213', patientId: 'PAT004' },
      doctor: { name: 'Dr. David Miller', specialization: 'Orthopedics' },
      appointmentDateTime: '2025-07-04T09:00:00',
      duration: 60,
      appointmentType: 'procedure',
      status: 'completed',
      priority: 'urgent',
      paymentStatus: 'paid',
      paymentAmount: 1200
    },
    {
      id: '5',
      appointmentId: 'APT-2025-005',
      patient: { name: 'Michael Wilson', phone: '+91 9876543214', patientId: 'PAT005' },
      doctor: { name: 'Dr. Sarah Wilson', specialization: 'Cardiology' },
      appointmentDateTime: '2025-07-03T11:00:00',
      duration: 30,
      appointmentType: 'emergency',
      status: 'cancelled',
      priority: 'urgent',
      paymentStatus: 'refunded',
      paymentAmount: 0
    }
  ];

  // Filter and search logic
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.appointmentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesType = filterType === 'all' || appointment.appointmentType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + itemsPerPage);

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
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const handleViewDetails = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    // In a real app, this would navigate to the detail page
    console.log('View details for appointment:', appointmentId);
  };

  const handleEditAppointment = (appointmentId: string) => {
    console.log('Edit appointment:', appointmentId);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    console.log('Cancel appointment:', appointmentId);
  };

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader>
        <HeaderContent>
          <Title>Appointments</Title>
          <Subtitle>Manage and view all patient appointments</Subtitle>
        </HeaderContent>
        <HeaderActions>
          <CreateButton>
            <span>➕</span>
            Create New Appointment
          </CreateButton>
        </HeaderActions>
      </PageHeader>

      {/* Filters and Search */}
      <FiltersSection>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search by patient name, doctor, or appointment ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon>🔍</SearchIcon>
        </SearchContainer>
        
        <FiltersContainer>
          <FilterGroup>
            <FilterLabel>Status:</FilterLabel>
            <FilterSelect
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </FilterSelect>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Type:</FilterLabel>
            <FilterSelect
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-up</option>
              <option value="emergency">Emergency</option>
              <option value="routine-checkup">Routine Checkup</option>
              <option value="procedure">Procedure</option>
            </FilterSelect>
          </FilterGroup>
        </FiltersContainer>
      </FiltersSection>

      {/* Results Summary */}
      <ResultsSummary>
        Showing {paginatedAppointments.length} of {filteredAppointments.length} appointments
      </ResultsSummary>

      {/* Appointments List */}
      <AppointmentsList>
        {paginatedAppointments.map((appointment) => {
          const { date, time } = formatDateTime(appointment.appointmentDateTime);
          
          return (
            <AppointmentCard key={appointment.id}>
              <CardHeader>
                <AppointmentInfo>
                  <AppointmentId>{appointment.appointmentId}</AppointmentId>
                  <DateTime>
                    <DateText>{date}</DateText>
                    <TimeText>{time}</TimeText>
                  </DateTime>
                </AppointmentInfo>
                <StatusBadge color={getStatusColor(appointment.status)}>
                  {appointment.status.replace('-', ' ')}
                </StatusBadge>
              </CardHeader>

              <CardBody>
                <MainInfo>
                  <PatientInfo>
                    <PatientName>{appointment.patient.name}</PatientName>
                    <PatientDetails>
                      {appointment.patient.patientId} • {appointment.patient.phone}
                    </PatientDetails>
                  </PatientInfo>
                  
                  <DoctorInfo>
                    <DoctorName>{appointment.doctor.name}</DoctorName>
                    <Specialization>{appointment.doctor.specialization}</Specialization>
                  </DoctorInfo>
                </MainInfo>

                <AppointmentMeta>
                  <MetaItem>
                    <MetaLabel>Type:</MetaLabel>
                    <MetaValue>{appointment.appointmentType.replace('-', ' ')}</MetaValue>
                  </MetaItem>
                  <MetaItem>
                    <MetaLabel>Duration:</MetaLabel>
                    <MetaValue>{appointment.duration} min</MetaValue>
                  </MetaItem>
                  <MetaItem>
                    <MetaLabel>Priority:</MetaLabel>
                    <PriorityBadge color={getPriorityColor(appointment.priority)}>
                      {appointment.priority}
                    </PriorityBadge>
                  </MetaItem>
                  <MetaItem>
                    <MetaLabel>Payment:</MetaLabel>
                    <PaymentInfo>
                      <PaymentBadge color={getPaymentStatusColor(appointment.paymentStatus)}>
                        {appointment.paymentStatus}
                      </PaymentBadge>
                      {appointment.paymentAmount && (
                        <PaymentAmount>₹{appointment.paymentAmount}</PaymentAmount>
                      )}
                    </PaymentInfo>
                  </MetaItem>
                </AppointmentMeta>
              </CardBody>

              <CardActions>
                <ActionButton 
                  variant="primary"
                  onClick={() => handleViewDetails(appointment.id)}
                >
                  View Details
                </ActionButton>
                <ActionButton 
                  variant="secondary"
                  onClick={() => handleEditAppointment(appointment.id)}
                >
                  Edit
                </ActionButton>
                {appointment.status === 'scheduled' || appointment.status === 'confirmed' ? (
                  <ActionButton 
                    variant="danger"
                    onClick={() => handleCancelAppointment(appointment.id)}
                  >
                    Cancel
                  </ActionButton>
                ) : null}
              </CardActions>
            </AppointmentCard>
          );
        })}
      </AppointmentsList>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PageButton 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </PageButton>
          
          <PageInfo>
            Page {currentPage} of {totalPages}
          </PageInfo>
          
          <PageButton 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next →
          </PageButton>
        </Pagination>
      )}
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

const HeaderContent = styled.div``;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.primary}dd;
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const FiltersSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 40px 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 16px;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
`;

const FilterSelect = styled.select`
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 13px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const ResultsSummary = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 16px;
`;

const AppointmentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AppointmentCard = styled.div`
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 0 16px;
`;

const AppointmentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const AppointmentId = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
`;

const DateTime = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DateText = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #374151;
`;

const TimeText = styled.div`
  font-size: 12px;
  color: #6b7280;
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

const CardBody = styled.div`
  padding: 12px 16px;
`;

const MainInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const PatientInfo = styled.div``;

const PatientName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
`;

const PatientDetails = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const DoctorInfo = styled.div``;

const DoctorName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 2px;
`;

const Specialization = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const AppointmentMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MetaLabel = styled.span`
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
`;

const MetaValue = styled.span`
  font-size: 12px;
  color: #374151;
  font-weight: 500;
  text-transform: capitalize;
`;

const PriorityBadge = styled.span<{ color: string }>`
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => props.color}15;
  color: ${props => props.color};
  border: 1px solid ${props => props.color}30;
  width: fit-content;
`;

const PaymentInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const PaymentBadge = styled.span<{ color: string }>`
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  text-transform: capitalize;
  background: ${props => props.color}15;
  color: ${props => props.color};
  border: 1px solid ${props => props.color}30;
  width: fit-content;
`;

const PaymentAmount = styled.span`
  font-size: 12px;
  color: #374151;
  font-weight: 600;
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 16px 16px 16px;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const ActionButton = styled.button<{ variant: 'primary' | 'secondary' | 'danger' }>`
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
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
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 16px;
`;

const PageButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: ${theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.div`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
`;

export default AppointmentListPage;