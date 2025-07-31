import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEdit2, FiTrash, FiCalendar, FiClock, FiFileText } from "react-icons/fi";
import { usePatientAppointments } from '@/hooks/usePatient';
import { ROUTE_PATHS } from '@/config/route-paths.config';

// Theme configuration
const theme = {
  colors: {
    primary: '#6366f1',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#0ea5e9',
    textPrimary: '#111827',
    textSecondary: '#6b7280'
  }
};

interface Doctor {
  _id: string;
  doctorId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    gender: string;
  };
  professionalInfo: {
    specialization: string;
    experience: number;
  };
}

interface Appointments {
  _id: string;
  appointmentId: string;
  patient: string;
  doctor: Doctor;
  appointmentDateTime: string;
  duration: number;
  appointmentType: string;
  status: string;
  priority: string;
  bookingSource: string;
  symptoms: string[];
  notes: string;
  specialRequirements?: string;
  remindersSent: number;
  lastReminderSent: string;
  paymentStatus: string;
  paymentAmount: number;
  paymentMethod: string;
  consultation?: {
    diagnosis: string;
    prescription: string;
    nextAppointment: string;
    followUpRequired: boolean;
  };
  metadata: {
    ipAddress: string;
    userAgent: string;
    referralSource: string;
    campaignId: string;
  };
  createdAt: string;
  updatedAt: string;
  endDateTime?: string;
}

const AppointmentsDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled'>('all');
  const [filterType, setFilterType] = useState<'all' | 'consultation' | 'follow-up' | 'emergency'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'doctor' | 'status' | 'priority'>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use the custom hook to fetch appointments data
  const { 
    data: apiResponse, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = usePatientAppointments();
  
  // Extract appointments from API response
  const appointments = apiResponse?.data?.appointments || [];
  const pagination = apiResponse?.pagination;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN', {
        day: '2-digit',
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

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing appointments:", error);
    }
  };

  // Client-side filtering and sorting
  const filteredAndSortedAppointments = Array.isArray(appointments)
    ? appointments
        .filter(appointment => {
          const matchesSearch = 
            appointment.appointmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${appointment.doctor.personalInfo.firstName} ${appointment.doctor.personalInfo.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.doctor.professionalInfo.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.symptoms.some((symptom: any) => symptom.toLowerCase().includes(searchTerm.toLowerCase()));
          
          const matchesStatus = 
            filterStatus === 'all' || 
            appointment.status.toLowerCase() === filterStatus.toLowerCase();
          
          const matchesType = 
            filterType === 'all' || 
            appointment.appointmentType.toLowerCase() === filterType.toLowerCase();
          
          return matchesSearch && matchesStatus && matchesType;
        })
        .sort((a, b) => {
          switch (sortBy) {
            case 'date':
              return new Date(b.appointmentDateTime).getTime() - new Date(a.appointmentDateTime).getTime();
            case 'doctor':
              return `${a.doctor.personalInfo.firstName} ${a.doctor.personalInfo.lastName}`
                .localeCompare(`${b.doctor.personalInfo.firstName} ${b.doctor.personalInfo.lastName}`);
            case 'status':
              return a.status.localeCompare(b.status);
            case 'priority':
              const priorityOrder = { high: 3, medium: 2, low: 1 };
              return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                     (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
            default:
              return 0;
          }
        })
    : [];

  const totalPages = Math.ceil(filteredAndSortedAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAppointments = filteredAndSortedAppointments.slice(startIndex, startIndex + itemsPerPage);

  const handleViewAppointment = (appointmentId: string) => {
    const route = ROUTE_PATHS.PATIENT_APPOINTMENT_DETAIL.replace(':appointmentId', appointmentId);
    navigate(`/patient${route}`);
  };

  const handleEditAppointment = (appointmentId: string) => {
    navigate(`/patient/appointments/edit/${appointmentId}`);
  };

  const handleNewAppointment = () => {
    navigate('/patient/appointments/create');
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    // TODO: Implement delete logic with API call
    console.log('Delete appointment:', appointmentId);
  };

  // Handle loading state
  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading appointments...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  // Handle error state
  if (isError || error) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Failed to load appointments</ErrorTitle>
          <ErrorMessage>
            {error instanceof Error ? error.message : 'An unexpected error occurred while fetching appointment data.'}
          </ErrorMessage>
          <RetryButton onClick={handleRefresh}>
            <RefreshIcon>🔄</RefreshIcon>
            Try Again
          </RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

  // Handle empty state
  if (!appointments || appointments.length === 0) {
    return (
      <Container>
        <Header>
          <HeaderContent>
            <Title>My Appointments</Title>
            <Subtitle>Manage and view appointment information</Subtitle>
          </HeaderContent>
          <HeaderActions>
            <RefreshButton onClick={handleRefresh} disabled={isLoading}>
              <RefreshIcon>🔄</RefreshIcon>
              Refresh
            </RefreshButton>
            <NewAppointmentButton onClick={handleNewAppointment}>
              <PlusIcon>+</PlusIcon>
              New Appointment
            </NewAppointmentButton>
          </HeaderActions>
        </Header>
        
        <EmptyState>
          <EmptyIcon>📅</EmptyIcon>
          <EmptyTitle>No appointments found</EmptyTitle>
          <EmptyMessage>
            {apiResponse?.data ? 
              "You don't have any appointments scheduled yet. Book your first appointment!" :
              "Unable to load appointment data. Please try refreshing the page."
            }
          </EmptyMessage>
          <EmptyActions>
            <NewAppointmentButton onClick={handleNewAppointment}>
              <PlusIcon>+</PlusIcon>
              Book Appointment
            </NewAppointmentButton>
            <RefreshButton onClick={handleRefresh}>
              <RefreshIcon>🔄</RefreshIcon>
              Refresh Data
            </RefreshButton>
          </EmptyActions>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>
            My Appointments 
            {pagination?.total && (
              <TotalCount>({pagination.total} total)</TotalCount>
            )}
          </Title>
          <Subtitle>Manage and view appointment information</Subtitle>
        </HeaderContent>
        <HeaderActions>
          <RefreshButton onClick={handleRefresh} disabled={isLoading}>
            <RefreshIcon>🔄</RefreshIcon>
            Refresh
          </RefreshButton>
          <NewAppointmentButton onClick={handleNewAppointment}>
            <PlusIcon>+</PlusIcon>
            New Appointment
          </NewAppointmentButton>
        </HeaderActions>
      </Header>

      <Controls>
        <SearchAndFilter>
          <SearchInput
            type="text"
            placeholder="Search by appointment ID, doctor, specialization, or symptoms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FilterSelect
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </FilterSelect>
          <FilterSelect
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="all">All Types</option>
            <option value="consultation">Consultation</option>
            <option value="follow-up">Follow-up</option>
            <option value="emergency">Emergency</option>
          </FilterSelect>
          <SortSelect
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="date">Sort by Date</option>
            <option value="doctor">Sort by Doctor</option>
            <option value="status">Sort by Status</option>
            <option value="priority">Sort by Priority</option>
          </SortSelect>
        </SearchAndFilter>
        
        <ResultsInfo>
          Showing {paginatedAppointments.length} of {filteredAndSortedAppointments.length} appointments
          {pagination?.total && filteredAndSortedAppointments.length !== pagination.total && (
            <span> (filtered from {pagination.total} total)</span>
          )}
        </ResultsInfo>
      </Controls>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Appointment Details</TableHeaderCell>
              <TableHeaderCell>Doctor & Specialization</TableHeaderCell>
              <TableHeaderCell>Date & Time</TableHeaderCell>
              <TableHeaderCell>Status & Priority</TableHeaderCell>
              <TableHeaderCell>Symptoms & Notes</TableHeaderCell>
              <TableHeaderCell>Payment</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAppointments.map((appointment) => {
              const dateTime = formatDateTime(appointment.appointmentDateTime);
              return (
                <TableRow key={appointment._id}>
                  <TableCell>
                    <AppointmentInfo>
                      <AppointmentIcon type={appointment.appointmentType}>
                        {appointment.appointmentType === 'consultation' ? '🩺' : 
                         appointment.appointmentType === 'follow-up' ? '🔄' : '🚨'}
                      </AppointmentIcon>
                      <AppointmentDetails>
                        <AppointmentId>{appointment.appointmentId}</AppointmentId>
                        <AppointmentType>{capitalizeFirst(appointment.appointmentType)}</AppointmentType>
                        <AppointmentDuration>{appointment.duration} mins</AppointmentDuration>
                        {appointment.specialRequirements && (
                          <SpecialRequirements>⚠️ {appointment.specialRequirements}</SpecialRequirements>
                        )}
                      </AppointmentDetails>
                    </AppointmentInfo>
                  </TableCell>
                  
                  <TableCell>
                    <DoctorInfo>
                      {/* <DoctorAvatar gender={appointment.doctor.personalInfo.gender}>
                        {appointment.doctor.personalInfo.gender === 'female' ? '👩‍⚕️' : '👨‍⚕️'}
                      </DoctorAvatar> */}
                      <DoctorDetails>
                        <DoctorName>
                          {appointment.doctor.personalInfo.firstName} {appointment.doctor.personalInfo.lastName}
                        </DoctorName>
                        <DoctorSpecialization>{appointment.doctor.professionalInfo.specialization}</DoctorSpecialization>
                        <DoctorExperience>{appointment.doctor.professionalInfo.experience} years exp</DoctorExperience>
                      </DoctorDetails>
                    </DoctorInfo>
                  </TableCell>
                  
                  <TableCell>
                    <DateTimeInfo>
                      <AppointmentDate>
                        <FiCalendar size={14} style={{ marginRight: '6px' }} />
                        {dateTime.date}
                      </AppointmentDate>
                      <AppointmentTime>
                        <FiClock size={14} style={{ marginRight: '6px' }} />
                        {dateTime.time}
                      </AppointmentTime>
                      <BookingSource>via {appointment.bookingSource.replace('-', ' ')}</BookingSource>
                    </DateTimeInfo>
                  </TableCell>
                  
                  <TableCell>
                    <StatusPriority>
                      <StatusBadge status={appointment.status}>
                        {capitalizeFirst(appointment.status)}
                      </StatusBadge>
                      <PriorityBadge priority={appointment.priority}>
                        {capitalizeFirst(appointment.priority)} Priority
                      </PriorityBadge>
                      <ReminderInfo>
                        {appointment.remindersSent > 0 && (
                          <span>🔔 {appointment.remindersSent} reminder{appointment.remindersSent > 1 ? 's' : ''}</span>
                        )}
                      </ReminderInfo>
                    </StatusPriority>
                  </TableCell>
                  
                  <TableCell>
                    <SymptomsNotes>
                      {appointment.symptoms && appointment.symptoms.length > 0 && (
                        <SymptomsContainer>
                          <SymptomsLabel>Symptoms:</SymptomsLabel>
                          <SymptomsList>
                            {appointment.symptoms.slice(0, 2).map((symptom: any, index: number) => (
                              <SymptomTag key={index}>{symptom}</SymptomTag>
                            ))}
                            {appointment.symptoms.length > 2 && (
                              <MoreSymptoms>+{appointment.symptoms.length - 2} more</MoreSymptoms>
                            )}
                          </SymptomsList>
                        </SymptomsContainer>
                      )}
                      {appointment.notes && (
                        <NotesContainer>
                          <NotesIcon><FiFileText size={12} /></NotesIcon>
                          <NotesText>{appointment.notes.length > 50 ? 
                            `${appointment.notes.substring(0, 50)}...` : 
                            appointment.notes
                          }</NotesText>
                        </NotesContainer>
                      )}
                    </SymptomsNotes>
                  </TableCell>
                  
                  <TableCell>
                    <PaymentInfo>
                      <PaymentAmount>₹{appointment.paymentAmount}</PaymentAmount>
                      <PaymentStatus status={appointment.paymentStatus}>
                        {capitalizeFirst(appointment.paymentStatus)}
                      </PaymentStatus>
                      <PaymentMethod>{appointment.paymentMethod}</PaymentMethod>
                    </PaymentInfo>
                  </TableCell>
                  
                  <TableCell>
                    <ActionButtons>
                      <ActionButton 
                        variant="view" 
                        onClick={() => handleViewAppointment(appointment._id)}
                        title="View appointment details"
                      >
                        <FiEye size={16} />
                      </ActionButton>
                      {/* <ActionButton 
                        variant="edit" 
                        onClick={() => handleEditAppointment(appointment._id)}
                        title="Edit appointment"
                      >
                        <FiEdit2 size={16} />
                      </ActionButton>
                      <ActionButton 
                        variant="delete" 
                        onClick={() => handleDeleteAppointment(appointment._id)}
                        title="Cancel appointment"
                      >
                        <FiTrash size={16} />
                      </ActionButton> */}
                    </ActionButtons>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Pagination>
          <PaginationButton
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            First
          </PaginationButton>
          <PaginationButton
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </PaginationButton>
          
          {[...Array(totalPages)].map((_, i) => {
            const pageNumber = i + 1;
            const isCurrentPage = pageNumber === currentPage;
            const shouldShow = 
              pageNumber === 1 || 
              pageNumber === totalPages || 
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
            
            if (!shouldShow) {
              if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                return <PaginationEllipsis key={pageNumber}>...</PaginationEllipsis>;
              }
              return null;
            }
            
            return (
              <PaginationButton
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                active={isCurrentPage}
              >
                {pageNumber}
              </PaginationButton>
            );
          })}
          
          <PaginationButton
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </PaginationButton>
          <PaginationButton
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </PaginationButton>
        </Pagination>
      )}
    </Container>
  );
};

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return theme.colors.success;
      case 'pending': return theme.colors.warning;
      case 'completed': return theme.colors.info;
      case 'cancelled': return theme.colors.danger;
      default: return theme.colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return theme.colors.danger;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return theme.colors.success;
      case 'pending': return theme.colors.warning;
      case 'failed': return theme.colors.danger;
      default: return theme.colors.textSecondary;
    }
  };
// Styled Components
const Container = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 24px;
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

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
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
  color: #374151;
  margin: 0 0 8px 0;
`;

const EmptyMessage = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
  max-width: 400px;
  line-height: 1.5;
`;

const EmptyActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
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
`;

const TotalCount = styled.span`
  font-size: 16px;
  font-weight: 400;
  opacity: 0.8;
`;

const Subtitle = styled.p`
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NewAppointmentButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }
`;

const PlusIcon = styled.span`
  font-size: 18px;
  font-weight: bold;
`;

const RefreshIcon = styled.span`
  font-size: 14px;
`;

const Controls = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchAndFilter = styled.div`
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 300px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    min-width: auto;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  min-width: 120px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const SortSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  min-width: 140px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const ResultsInfo = styled.div`
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1400px;
`;

const TableHeader = styled.thead`
  background: #f9fafb;
`;

const TableHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f9fafb;
  }
`;

const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #374151;
  vertical-align: middle;
`;

// Appointment Info Components
const AppointmentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
`;

const AppointmentIcon = styled.div<{ type: string }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: ${props => 
    props.type === 'consultation' ? '#e0f2fe' :
    props.type === 'follow-up' ? '#f0f9ff' :
    '#fee2e2'
  };
  flex-shrink: 0;
`;

const AppointmentDetails = styled.div``;

const AppointmentId = styled.div`
  font-size: 12px;
  color: #6b7280;
  font-family: monospace;
  margin-bottom: 2px;
`;

const AppointmentType = styled.div`
  font-weight: 500;
  color: #111827;
  margin-bottom: 2px;
`;

const AppointmentDuration = styled.div`
  font-size: 11px;
  color: #059669;
  background: #d1fae5;
  padding: 1px 4px;
  border-radius: 3px;
  width: fit-content;
  margin-bottom: 2px;
`;

const SpecialRequirements = styled.div`
  font-size: 10px;
  color: #dc2626;
  background: #fee2e2;
  padding: 1px 4px;
  border-radius: 3px;
  width: fit-content;
`;

// Doctor Info Components
const DoctorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 180px;
`;

const DoctorAvatar = styled.div<{ gender: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: ${props => props.gender === 'female' ? '#fce7f3' : '#e0f2fe'};
  flex-shrink: 0;
`;

const DoctorDetails = styled.div``;

const DoctorName = styled.div`
  font-weight: 500;
  color: #111827;
  margin-bottom: 2px;
`;

const DoctorSpecialization = styled.div`
  font-size: 12px;
  color: ${theme.colors.primary};
  font-weight: 500;
  margin-bottom: 2px;
`;

const DoctorExperience = styled.div`
  font-size: 11px;
  color: #6b7280;
`;

// Date Time Components
const DateTimeInfo = styled.div`
  min-width: 140px;
`;

const AppointmentDate = styled.div`
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
`;

const AppointmentTime = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const BookingSource = styled.div`
  font-size: 10px;
  color: #6366f1;
  background: #e0e7ff;
  padding: 1px 4px;
  border-radius: 3px;
  width: fit-content;
  text-transform: capitalize;
`;

// Status Priority Components
const StatusPriority = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;
`;

const StatusBadge = styled.span<{ status: string }>`
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: uppercase;
  background: ${props => `${getStatusColor(props.status)}20`};
  color: ${props => getStatusColor(props.status)};
  width: fit-content;
`;

const PriorityBadge = styled.span<{ priority: string }>`
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 500;
  background: ${props => `${getPriorityColor(props.priority)}15`};
  color: ${props => getPriorityColor(props.priority)};
  width: fit-content;
`;

const ReminderInfo = styled.div`
  font-size: 10px;
  color: #6b7280;
  
  span {
    display: flex;
    align-items: center;
    gap: 2px;
  }
`;

// Symptoms Notes Components
const SymptomsNotes = styled.div`
  min-width: 200px;
`;

const SymptomsContainer = styled.div`
  margin-bottom: 8px;
`;

const SymptomsLabel = styled.div`
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 4px;
`;

const SymptomsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
`;

const SymptomTag = styled.span`
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 3px;
  background: #fef3c7;
  color: #92400e;
`;

const MoreSymptoms = styled.span`
  font-size: 10px;
  color: #6b7280;
  font-style: italic;
`;

const NotesContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 4px;
`;

const NotesIcon = styled.div`
  color: #6b7280;
  margin-top: 1px;
`;

const NotesText = styled.div`
  font-size: 11px;
  color: #6b7280;
  line-height: 1.4;
`;

// Payment Info Components
const PaymentInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 100px;
`;

const PaymentAmount = styled.div`
  font-weight: 600;
  color: #111827;
  font-size: 14px;
`;

const PaymentStatus = styled.span<{ status: string }>`
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 500;
  background: ${props => `${getPaymentStatusColor(props.status)}20`};
  color: ${props => getPaymentStatusColor(props.status)};
  width: fit-content;
`;

const PaymentMethod = styled.div`
  font-size: 10px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 1px 4px;
  border-radius: 3px;
  width: fit-content;
`;

// Action Components
const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  min-width: 120px;
`;

const ActionButton = styled.button<{ variant: 'view' | 'edit' | 'delete' }>`
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => 
    props.variant === 'view' ? '#e0f2fe' :
    props.variant === 'edit' ? '#f0f9ff' :
    '#fee2e2'
  };
  color: ${props => 
    props.variant === 'view' ? '#0369a1' :
    props.variant === 'edit' ? '#0284c7' :
    '#dc2626'
  };
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// Pagination Components
const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
`;

const PaginationButton = styled.button<{ active?: boolean }>`
  padding: 8px 12px;
  border: 1px solid ${props => props.active ? theme.colors.primary : '#d1d5db'};
  background: ${props => props.active ? theme.colors.primary : 'white'};
  color: ${props => props.active ? 'white' : '#374151'};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 40px;
  
  &:hover:not(:disabled) {
    background: ${props => props.active ? theme.colors.primary : '#f9fafb'};
    border-color: ${theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PaginationEllipsis = styled.span`
  padding: 8px 4px;
  color: #6b7280;
  font-size: 14px;
`;

export default AppointmentsDashboard;