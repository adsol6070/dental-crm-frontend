// @ts-nocheck
import { useState } from "react";
import styled from "styled-components";
import { useAllAppointments, useCancelAppointment } from "@/hooks/useAppointment"; // Adjust import path as needed
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

const theme = {
  colors: {
    primary: "#6366f1",
    success: "#10b981",
    danger: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  },
};

interface Appointment {
  _id: string;
  appointmentId: string;
  patient: {
    _id: string;
    personalInfo: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      gender: string;
      bloodGroup: string;
    };
    contactInfo: {
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
    };
    patientId: string;
  };
  doctor: {
    _id: string;
    personalInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    professionalInfo: {
      specialization: string;
      qualifications: string[];
      experience: number;
      licenseNumber: string;
      department: string;
    };
    doctorId: string;
  };
  appointmentStartTime: string;
  appointmentEndTime: string;
  duration: number;
  appointmentType:
    | "consultation"
    | "follow-up"
    | "emergency"
    | "routine-checkup"
    | "procedure";
  status:
    | "scheduled"
    | "confirmed"
    | "in-progress"
    | "completed"
    | "cancelled"
    | "no-show";
  priority: "low" | "medium" | "high" | "urgent";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentAmount?: number;
  bookingSource: string;
  symptoms: string[];
  notes: string;
  specialRequirements: string;
  remindersSent: number;
  metadata: {
    ipAddress: string;
    userAgent: string;
  };
  createdAt: string;
  updatedAt: string;
}

const AppointmentListPage = () => {
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(
    null
  );
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // Fetch appointments from backend
  const { data, isLoading, error, refetch } = useAllAppointments();
  const { mutate: cancelAppointment, isPending: isCancelling } = useCancelAppointment();

  // Extract appointments array from the response
  const appointments = data?.data?.appointments || [];

  // Helper function to get patient name
  const getPatientName = (appointment: Appointment) => {
    return `${appointment.patient.personalInfo.firstName} ${appointment.patient.personalInfo.lastName}`;
  };

  // Helper function to get doctor name
  const getDoctorName = (appointment: Appointment) => {
    return `Dr. ${appointment.doctor.personalInfo.firstName} ${appointment.doctor.personalInfo.lastName}`;
  };

  // Filter and search logic
  const filteredAppointments = appointments.filter(
    (appointment: Appointment) => {
      const patientName = getPatientName(appointment);
      const doctorName = getDoctorName(appointment);
      const patientPhone = appointment.patient.contactInfo.phone;

      const matchesSearch =
        patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.appointmentId
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        patientPhone.includes(searchTerm);

      const matchesStatus =
        filterStatus === "all" || appointment.status === filterStatus;
      const matchesType =
        filterType === "all" || appointment.appointmentType === filterType;

      return matchesSearch && matchesStatus && matchesType;
    }
  );

  // Pagination
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "#6b7280";
      case "confirmed":
        return theme.colors.info;
      case "in-progress":
        return theme.colors.warning;
      case "completed":
        return theme.colors.success;
      case "cancelled":
        return theme.colors.danger;
      case "no-show":
        return "#9333ea";
      default:
        return "#6b7280";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return theme.colors.success;
      case "medium":
        return theme.colors.warning;
      case "high":
        return "#f97316";
      case "urgent":
        return theme.colors.danger;
      default:
        return theme.colors.warning;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return theme.colors.warning;
      case "paid":
        return theme.colors.success;
      case "failed":
        return theme.colors.danger;
      case "refunded":
        return "#6b7280";
      default:
        return theme.colors.warning;
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const handleViewDetails = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    navigate(`/admin/appointments/details/${appointmentId}`);
  };

  // const handleEditAppointment = (appointmentId: string) => {
  //   console.log("Edit appointment:", appointmentId);
  // };

  const handleCancelAppointment = (appointmentId: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to cancel this appointment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
    }).then((result: any) => {
      if (result.isConfirmed) {
        cancelAppointment(appointmentId, {
          onSuccess: () => {
            Swal.fire("Cancelled!", "The appointment has been cancelled.", "success");
          },
          onError: (error: any) => {
            Swal.fire("Error!", error.message || "Something went wrong.", "error");
          },
        });
      }
    });
  };

  const handleRefresh = () => {
    refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading appointments...</LoadingText>
        </LoadingContainer>
      </PageContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PageContainer>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Failed to load appointments</ErrorTitle>
          <ErrorMessage>
            {error.message ||
              "Something went wrong while fetching appointments."}
          </ErrorMessage>
          <RetryButton onClick={handleRefresh}>Try Again</RetryButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

  // Empty state
  if (appointments.length === 0) {
    return (
      <PageContainer>
        <Toaster position="top-right" />
        <PageHeader>
          <HeaderContent>
            <Title>Appointments</Title>
            <Subtitle>Manage and view all patient appointments</Subtitle>
          </HeaderContent>
          <HeaderActions>
            <CreateButton onClick={() => navigate("/admin/appointments/create")}>
              <span>➕</span>
              Create New Appointment
            </CreateButton>
          </HeaderActions>
        </PageHeader>

        <EmptyContainer>
          <EmptyIcon>📅</EmptyIcon>
          <EmptyTitle>No appointments found</EmptyTitle>
          <EmptyMessage>
            Get started by creating your first appointment.
          </EmptyMessage>
          <CreateButton onClick={() => navigate("/admin/appointments/create")}>
            <span>➕</span>
            Create New Appointment
          </CreateButton>
        </EmptyContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader>
        <HeaderContent>
          <Title>Appointments</Title>
          <Subtitle>Manage and view all patient appointments</Subtitle>
        </HeaderContent>
        <HeaderActions>
          <RefreshButton onClick={handleRefresh}>
            <span>🔄</span>
            Refresh
          </RefreshButton>
          <CreateButton onClick={() => navigate("/admin/appointments/create")}>
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
        Showing {paginatedAppointments.length} of {filteredAppointments.length}{" "}
        appointments
        {filteredAppointments.length !== appointments.length && (
          <span> (filtered from {appointments.length} total)</span>
        )}
      </ResultsSummary>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <NoResultsContainer>
          <NoResultsIcon>🔍</NoResultsIcon>
          <NoResultsTitle>No appointments match your search</NoResultsTitle>
          <NoResultsMessage>
            Try adjusting your filters or search terms.
          </NoResultsMessage>
          <ClearFiltersButton
            onClick={() => {
              setSearchTerm("");
              setFilterStatus("all");
              setFilterType("all");
            }}
          >
            Clear All Filters
          </ClearFiltersButton>
        </NoResultsContainer>
      ) : (
        <AppointmentsList>
          {paginatedAppointments.map((appointment: any) => {
            const { date, time } = formatDateTime(
              appointment.appointmentStartTime
            );
            const patientName = getPatientName(appointment);
            const doctorName = getDoctorName(appointment);

            return (
              <AppointmentCard key={appointment._id}>
                <CardHeader>
                  <AppointmentInfo>
                    <AppointmentId>{appointment.appointmentId}</AppointmentId>
                    <DateTime>
                      <DateText>{date}</DateText>
                      <TimeText>{time}</TimeText>
                    </DateTime>
                  </AppointmentInfo>
                  <StatusBadge color={getStatusColor(appointment.status)}>
                    {appointment.status.replace("-", " ")}
                  </StatusBadge>
                </CardHeader>

                <CardBody>
                  <MainInfo>
                    <PatientInfo>
                      <PatientName>{patientName}</PatientName>
                      <PatientDetails>
                        {appointment.patient.patientId} •{" "}
                        {appointment.patient.contactInfo.phone}
                      </PatientDetails>
                    </PatientInfo>

                    <DoctorInfo>
                      <DoctorName>{doctorName}</DoctorName>
                      <Specialization>
                        {appointment.doctor.professionalInfo.specialization}
                      </Specialization>
                    </DoctorInfo>
                  </MainInfo>

                  <AppointmentMeta>
                    <MetaItem>
                      <MetaLabel>Type:</MetaLabel>
                      <MetaValue>
                        {appointment.appointmentType.replace("-", " ")}
                      </MetaValue>
                    </MetaItem>
                    <MetaItem>
                      <MetaLabel>Duration:</MetaLabel>
                      <MetaValue>{appointment.duration} min</MetaValue>
                    </MetaItem>
                    <MetaItem>
                      <MetaLabel>Priority:</MetaLabel>
                      <PriorityBadge
                        color={getPriorityColor(appointment.priority)}
                      >
                        {appointment.priority}
                      </PriorityBadge>
                    </MetaItem>
                    <MetaItem>
                      <MetaLabel>Payment:</MetaLabel>
                      <PaymentInfo>
                        <PaymentBadge
                          color={getPaymentStatusColor(
                            appointment.paymentStatus
                          )}
                        >
                          {appointment.paymentStatus}
                        </PaymentBadge>
                        {appointment.paymentAmount && (
                          <PaymentAmount>
                            ₹{appointment.paymentAmount}
                          </PaymentAmount>
                        )}
                      </PaymentInfo>
                    </MetaItem>
                  </AppointmentMeta>
                </CardBody>

                <CardActions>
                  <ActionButton
                    variant="primary"
                    onClick={() => handleViewDetails(appointment._id)}
                  >
                    View Details
                  </ActionButton>
                  {/* <ActionButton
                    variant="secondary"
                    onClick={() => handleEditAppointment(appointment._id)}
                  >
                    Edit
                  </ActionButton> */}
                  {appointment.status === "scheduled" ||
                  appointment.status === "confirmed" ? (
                    <ActionButton
            variant="danger"
            onClick={() => handleCancelAppointment(appointment._id)}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <>
                <LoadingSpinnerSmall />
                Cancelling...
              </>
            ) : (
              <>Cancel</>
            )}
          </ActionButton>
                  ) : null}
                </CardActions>
              </AppointmentCard>
            );
          })}
        </AppointmentsList>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PageButton
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </PageButton>

          <PageInfo>
            Page {currentPage} of {totalPages}
          </PageInfo>

          <PageButton
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next →
          </PageButton>
        </Pagination>
      )}
    </PageContainer>
  );
};

// Additional Styled Components for new states
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingSpinnerSmall = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
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
  padding: 60px 20px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ErrorTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
`;

const ErrorMessage = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
  max-width: 400px;
`;

const RetryButton = styled.button`
  padding: 10px 20px;
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
  }
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.6;
`;

const EmptyTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
`;

const EmptyMessage = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
`;

const NoResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const NoResultsIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
`;

const NoResultsTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
`;

const NoResultsMessage = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
`;

const ClearFiltersButton = styled.button`
  padding: 8px 16px;
  background: white;
  color: ${theme.colors.primary};
  border: 1px solid ${theme.colors.primary};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.primary}10;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: ${theme.colors.primary};
  }
`;

// Original styled components (keeping the same ones from your original code)
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
  background: ${(props) => props.color}15;
  color: ${(props) => props.color};
  border: 1px solid ${(props) => props.color}30;
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
  background: ${(props) => props.color}15;
  color: ${(props) => props.color};
  border: 1px solid ${(props) => props.color}30;
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
  background: ${(props) => props.color}15;
  color: ${(props) => props.color};
  border: 1px solid ${(props) => props.color}30;
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

const ActionButton = styled.button<{
  variant: "primary" | "secondary" | "danger";
}>`
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;

  ${(props) => {
    switch (props.variant) {
      case "primary":
        return `
          background: ${theme.colors.primary};
          color: white;
          border-color: ${theme.colors.primary};
          
          &:hover {
            background: ${theme.colors.primary}dd;
          }
        `;
      case "secondary":
        return `
          background: white;
          color: #374151;
          border-color: #d1d5db;
          
          &:hover {
            background: #f9fafb;
          }
        `;
      case "danger":
        return `
          background: white;
          color: ${theme.colors.danger};
          border-color: ${theme.colors.danger}30;
          
          &:hover {
            background: ${theme.colors.danger}10;
          }
        `;
      default:
        return "";
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
