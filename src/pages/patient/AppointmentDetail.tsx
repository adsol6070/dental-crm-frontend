import { useState } from "react";
import styled from "styled-components";
import { theme } from "@/config/theme.config";
import { useParams, useNavigate } from "react-router-dom";
import { useAppointmentById } from "@/hooks/usePatient";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiEdit3,
  FiPrinter,
  FiDownload,
  FiMessageSquare,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiDollarSign,
  FiFileText,
  FiActivity,
  FiShield,
  FiHeart,
  FiUserCheck,
  FiBookOpen,
  FiAward,
  FiMoreVertical,
} from "react-icons/fi";

// Types based on your API response
interface Doctor {
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
  fees: {
    consultationFee: number;
    followUpFee: number;
    emergencyFee: number;
  };
  _id: string;
  doctorId: string;
  fullName: string;
  id: string;
}

interface Appointment {
  metadata: {
    ipAddress: string;
    userAgent: string;
  };
  _id: string;
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
  specialRequirements: string;
  remindersSent: number;
  paymentStatus: string;
  paymentAmount: number;
  appointmentId: string;
  createdAt: string;
  updatedAt: string;
  endDateTime: string;
  id: string;
}

interface GetAppointmentDetailsResponse {
  success: boolean;
  data: Appointment;
}

const AppointmentDetailPage = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "doctor" | "payment" | "history"
  >("overview");

  // Use the API hook
  const {
    data,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useAppointmentById(appointmentId || "") as {
    data: GetAppointmentDetailsResponse | undefined;
    isLoading: boolean;
    isError: boolean;
    error: any;
    refetch: () => void;
  };

  const appointment = data?.appointment;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return <FiCalendar size={16} />;
      case "confirmed":
        return <FiCheckCircle size={16} />;
      case "completed":
        return <FiCheckCircle size={16} />;
      case "cancelled":
        return <FiXCircle size={16} />;
      case "no-show":
        return <FiAlertCircle size={16} />;
      default:
        return <FiClock size={16} />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "#3b82f6";
      case "confirmed":
        return "#10b981";
      case "completed":
        return "#059669";
      case "cancelled":
        return "#ef4444";
      case "no-show":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getStatusBackground = (status: string): string => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "#dbeafe";
      case "confirmed":
        return "#d1fae5";
      case "completed":
        return "#d1fae5";
      case "cancelled":
        return "#fee2e2";
      case "no-show":
        return "#fef3c7";
      default:
        return "#f3f4f6";
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    // Navigate to edit appointment page
    navigate(`/appointments/${appointmentId}/edit`);
  };

  const handleReschedule = () => {
    // Handle reschedule logic
    console.log("Reschedule appointment");
  };

  const handleCancel = () => {
    // Handle cancel logic
    console.log("Cancel appointment");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Handle download logic
    console.log("Download appointment details");
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading appointment details...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Failed to Load Appointment</ErrorTitle>
          <ErrorText>
            {error?.message || "Failed to load appointment details"}
          </ErrorText>
          <RetryButton onClick={refetch}>
            <FiRefreshCw size={16} />
            Try Again
          </RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

  if (!appointment) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorIcon>📅</ErrorIcon>
          <ErrorTitle>Appointment Not Found</ErrorTitle>
          <ErrorText>The requested appointment could not be found.</ErrorText>
          <BackButton onClick={handleBack}>
            <FiArrowLeft size={16} />
            Go Back
          </BackButton>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header */}
      <Header>
        <HeaderLeft>
          <BackButton onClick={handleBack}>
            <FiArrowLeft size={16} />
            Back
          </BackButton>
          <HeaderInfo>
            <AppointmentTitle>
              Appointment #{appointment.appointmentId}
            </AppointmentTitle>
            <AppointmentMeta>
              <StatusBadge
                status={appointment.status}
                color={getStatusColor(appointment.status)}
                background={getStatusBackground(appointment.status)}
              >
                {getStatusIcon(appointment.status)}
                {appointment.status.charAt(0).toUpperCase() +
                  appointment.status.slice(1)}
              </StatusBadge>
              <PriorityBadge priority={appointment.priority}>
                {appointment.priority.charAt(0).toUpperCase() +
                  appointment.priority.slice(1)}{" "}
                Priority
              </PriorityBadge>
              <SourceBadge>
                {appointment.bookingSource.charAt(0).toUpperCase() +
                  appointment.bookingSource.slice(1)}
              </SourceBadge>
            </AppointmentMeta>
          </HeaderInfo>
        </HeaderLeft>
        <HeaderActions>
          <ActionButton variant="ghost" onClick={handlePrint}>
            <FiPrinter size={16} />
            Print
          </ActionButton>
          <ActionButton variant="ghost" onClick={handleDownload}>
            <FiDownload size={16} />
            Download
          </ActionButton>
          <ActionButton variant="secondary" onClick={handleReschedule}>
            <FiClock size={16} />
            Reschedule
          </ActionButton>
          <ActionButton variant="primary" onClick={handleEdit}>
            <FiEdit3 size={16} />
            Edit
          </ActionButton>
          <MoreButton>
            <FiMoreVertical size={16} />
          </MoreButton>
        </HeaderActions>
      </Header>

      {/* Quick Info Cards */}
      <QuickInfoGrid>
        <InfoCard>
          <InfoIcon>
            <FiCalendar size={20} />
          </InfoIcon>
          <InfoContent>
            <InfoLabel>Date & Time</InfoLabel>
            <InfoValue>
              {formatDate(appointment.appointmentDateTime)}
              <InfoSubValue>
                {formatTime(appointment.appointmentDateTime)}
              </InfoSubValue>
            </InfoValue>
          </InfoContent>
        </InfoCard>

        <InfoCard>
          <InfoIcon>
            <FiClock size={20} />
          </InfoIcon>
          <InfoContent>
            <InfoLabel>Duration</InfoLabel>
            <InfoValue>
              {appointment.duration} minutes
              <InfoSubValue>
                Ends at {formatTime(appointment.endDateTime)}
              </InfoSubValue>
            </InfoValue>
          </InfoContent>
        </InfoCard>

        <InfoCard>
          <InfoIcon>
            <FiUser size={20} />
          </InfoIcon>
          <InfoContent>
            <InfoLabel>Doctor</InfoLabel>
            <InfoValue>
              {appointment.doctor.fullName}
              <InfoSubValue>
                {appointment.doctor.professionalInfo.specialization}
              </InfoSubValue>
            </InfoValue>
          </InfoContent>
        </InfoCard>

        <InfoCard>
          <InfoIcon>
            <FiDollarSign size={20} />
          </InfoIcon>
          <InfoContent>
            <InfoLabel>Payment</InfoLabel>
            <InfoValue>
              ₹{appointment.paymentAmount}
              <PaymentStatusBadge status={appointment.paymentStatus}>
                {appointment.paymentStatus.charAt(0).toUpperCase() +
                  appointment.paymentStatus.slice(1)}
              </PaymentStatusBadge>
            </InfoValue>
          </InfoContent>
        </InfoCard>
      </QuickInfoGrid>

      {/* Tab Navigation */}
      <TabNavigation>
        <Tab
          active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
        >
          <FiFileText size={16} />
          Overview
        </Tab>
        <Tab
          active={activeTab === "doctor"}
          onClick={() => setActiveTab("doctor")}
        >
          <FiUserCheck size={16} />
          Doctor Info
        </Tab>
        <Tab
          active={activeTab === "payment"}
          onClick={() => setActiveTab("payment")}
        >
          <FiDollarSign size={16} />
          Payment
        </Tab>
        <Tab
          active={activeTab === "history"}
          onClick={() => setActiveTab("history")}
        >
          <FiActivity size={16} />
          History
        </Tab>
      </TabNavigation>

      {/* Tab Content */}
      <TabContent>
        {activeTab === "overview" && (
          <OverviewTab>
            <TabGrid>
              {/* Appointment Details */}
              <DetailSection>
                <SectionHeader>
                  <SectionTitle>
                    <FiCalendar size={18} />
                    Appointment Details
                  </SectionTitle>
                </SectionHeader>
                <DetailGrid>
                  <DetailItem>
                    <DetailLabel>Type</DetailLabel>
                    <DetailValue>
                      <TypeBadge type={appointment.appointmentType}>
                        {appointment.appointmentType.charAt(0).toUpperCase() +
                          appointment.appointmentType.slice(1)}
                      </TypeBadge>
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Status</DetailLabel>
                    <DetailValue>
                      <StatusBadge
                        status={appointment.status}
                        color={getStatusColor(appointment.status)}
                        background={getStatusBackground(appointment.status)}
                      >
                        {getStatusIcon(appointment.status)}
                        {appointment.status.charAt(0).toUpperCase() +
                          appointment.status.slice(1)}
                      </StatusBadge>
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Priority</DetailLabel>
                    <DetailValue>
                      <PriorityBadge priority={appointment.priority}>
                        {appointment.priority.charAt(0).toUpperCase() +
                          appointment.priority.slice(1)}
                      </PriorityBadge>
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Booking Source</DetailLabel>
                    <DetailValue>
                      <SourceBadge>
                        {appointment.bookingSource.charAt(0).toUpperCase() +
                          appointment.bookingSource.slice(1)}
                      </SourceBadge>
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Created</DetailLabel>
                    <DetailValue>
                      {formatDateTime(appointment.createdAt)}
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Last Updated</DetailLabel>
                    <DetailValue>
                      {formatDateTime(appointment.updatedAt)}
                    </DetailValue>
                  </DetailItem>
                </DetailGrid>
              </DetailSection>

              {/* Medical Information */}
              <DetailSection>
                <SectionHeader>
                  <SectionTitle>
                    <FiHeart size={18} />
                    Medical Information
                  </SectionTitle>
                </SectionHeader>

                {appointment.symptoms.length > 0 && (
                  <MedicalCard type="symptoms">
                    <MedicalCardHeader>
                      <MedicalCardTitle>Reported Symptoms</MedicalCardTitle>
                      <MedicalCardCount>
                        {appointment.symptoms.length}
                      </MedicalCardCount>
                    </MedicalCardHeader>
                    <SymptomsList>
                      {appointment.symptoms.map((symptom, index) => (
                        <SymptomTag key={index}>{symptom}</SymptomTag>
                      ))}
                    </SymptomsList>
                  </MedicalCard>
                )}

                {appointment.notes && (
                  <MedicalCard type="notes">
                    <MedicalCardHeader>
                      <MedicalCardTitle>Notes</MedicalCardTitle>
                    </MedicalCardHeader>
                    <NotesContent>{appointment.notes}</NotesContent>
                  </MedicalCard>
                )}

                {appointment.specialRequirements && (
                  <MedicalCard type="requirements">
                    <MedicalCardHeader>
                      <MedicalCardTitle>Special Requirements</MedicalCardTitle>
                    </MedicalCardHeader>
                    <RequirementsContent>
                      <FiShield size={16} />
                      {appointment.specialRequirements}
                    </RequirementsContent>
                  </MedicalCard>
                )}
              </DetailSection>
            </TabGrid>

            {/* Reminders Section */}
            <ReminderSection>
              <SectionHeader>
                <SectionTitle>
                  <FiMessageSquare size={18} />
                  Reminders
                </SectionTitle>
              </SectionHeader>
              <ReminderCard>
                <ReminderIcon>
                  <FiMessageSquare size={20} />
                </ReminderIcon>
                <ReminderContent>
                  <ReminderTitle>Reminders Sent</ReminderTitle>
                  <ReminderValue>{appointment.remindersSent}</ReminderValue>
                  <ReminderDescription>
                    {appointment.remindersSent === 0
                      ? "No reminders have been sent yet"
                      : `${appointment.remindersSent} reminder${
                          appointment.remindersSent > 1 ? "s" : ""
                        } sent to the patient`}
                  </ReminderDescription>
                </ReminderContent>
              </ReminderCard>
            </ReminderSection>
          </OverviewTab>
        )}

        {activeTab === "doctor" && (
          <DoctorTab>
            <DoctorProfile>
              <DoctorAvatar>
                {appointment.doctor.personalInfo.firstName.charAt(0)}
                {appointment.doctor.personalInfo.lastName.charAt(0)}
              </DoctorAvatar>
              <DoctorInfo>
                <DoctorName>{appointment.doctor.fullName}</DoctorName>
                <DoctorSpecialization>
                  {appointment.doctor.professionalInfo.specialization}
                </DoctorSpecialization>
                <DoctorDepartment>
                  {appointment.doctor.professionalInfo.department}
                </DoctorDepartment>
              </DoctorInfo>
            </DoctorProfile>

            <DoctorDetailsGrid>
              <DoctorSection>
                <SectionHeader>
                  <SectionTitle>
                    <FiUser size={18} />
                    Personal Information
                  </SectionTitle>
                </SectionHeader>
                <DetailGrid>
                  <DetailItem>
                    <DetailLabel>
                      <FiUser size={14} />
                      Full Name
                    </DetailLabel>
                    <DetailValue>{appointment.doctor.fullName}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>
                      <FiMail size={14} />
                      Email
                    </DetailLabel>
                    <DetailValue>
                      <ContactLink
                        href={`mailto:${appointment.doctor.personalInfo.email}`}
                      >
                        {appointment.doctor.personalInfo.email}
                      </ContactLink>
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>
                      <FiPhone size={14} />
                      Phone
                    </DetailLabel>
                    <DetailValue>
                      <ContactLink
                        href={`tel:${appointment.doctor.personalInfo.phone}`}
                      >
                        {appointment.doctor.personalInfo.phone}
                      </ContactLink>
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Doctor ID</DetailLabel>
                    <DetailValue>
                      <DoctorIdBadge>
                        {appointment.doctor.doctorId}
                      </DoctorIdBadge>
                    </DetailValue>
                  </DetailItem>
                </DetailGrid>
              </DoctorSection>

              <DoctorSection>
                <SectionHeader>
                  <SectionTitle>
                    <FiBookOpen size={18} />
                    Professional Information
                  </SectionTitle>
                </SectionHeader>
                <DetailGrid>
                  <DetailItem>
                    <DetailLabel>Specialization</DetailLabel>
                    <DetailValue>
                      <SpecializationBadge>
                        {appointment.doctor.professionalInfo.specialization}
                      </SpecializationBadge>
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Department</DetailLabel>
                    <DetailValue>
                      {appointment.doctor.professionalInfo.department}
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Experience</DetailLabel>
                    <DetailValue>
                      {appointment.doctor.professionalInfo.experience} years
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>License Number</DetailLabel>
                    <DetailValue>
                      <LicenseBadge>
                        {appointment.doctor.professionalInfo.licenseNumber}
                      </LicenseBadge>
                    </DetailValue>
                  </DetailItem>
                  <DetailItem className="full-width">
                    <DetailLabel>
                      <FiAward size={14} />
                      Qualifications
                    </DetailLabel>
                    <DetailValue>
                      <QualificationsList>
                        {appointment.doctor.professionalInfo.qualifications.map(
                          (qualification, index) => (
                            <QualificationTag key={index}>
                              {qualification}
                            </QualificationTag>
                          )
                        )}
                      </QualificationsList>
                    </DetailValue>
                  </DetailItem>
                </DetailGrid>
              </DoctorSection>

              <DoctorSection>
                <SectionHeader>
                  <SectionTitle>
                    <FiDollarSign size={18} />
                    Fee Structure
                  </SectionTitle>
                </SectionHeader>
                <FeeGrid>
                  <FeeCard>
                    <FeeLabel>Consultation</FeeLabel>
                    <FeeAmount>
                      ₹{appointment.doctor.fees.consultationFee}
                    </FeeAmount>
                  </FeeCard>
                  <FeeCard>
                    <FeeLabel>Follow-up</FeeLabel>
                    <FeeAmount>
                      ₹{appointment.doctor.fees.followUpFee}
                    </FeeAmount>
                  </FeeCard>
                  <FeeCard>
                    <FeeLabel>Emergency</FeeLabel>
                    <FeeAmount>
                      ₹{appointment.doctor.fees.emergencyFee}
                    </FeeAmount>
                  </FeeCard>
                </FeeGrid>
              </DoctorSection>
            </DoctorDetailsGrid>
          </DoctorTab>
        )}

        {activeTab === "payment" && (
          <PaymentTab>
            <PaymentSummary>
              <PaymentHeader>
                <PaymentTitle>Payment Summary</PaymentTitle>
                <PaymentStatusLarge status={appointment.paymentStatus}>
                  {appointment.paymentStatus.charAt(0).toUpperCase() +
                    appointment.paymentStatus.slice(1)}
                </PaymentStatusLarge>
              </PaymentHeader>
              <PaymentAmount>₹{appointment.paymentAmount}</PaymentAmount>
              <PaymentDescription>
                {appointment.appointmentType.charAt(0).toUpperCase() +
                  appointment.appointmentType.slice(1)}{" "}
                Fee
              </PaymentDescription>
            </PaymentSummary>

            <PaymentDetails>
              <SectionHeader>
                <SectionTitle>
                  <FiDollarSign size={18} />
                  Payment Details
                </SectionTitle>
              </SectionHeader>
              <DetailGrid>
                <DetailItem>
                  <DetailLabel>Amount</DetailLabel>
                  <DetailValue>₹{appointment.paymentAmount}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Status</DetailLabel>
                  <DetailValue>
                    <PaymentStatusBadge status={appointment.paymentStatus}>
                      {appointment.paymentStatus.charAt(0).toUpperCase() +
                        appointment.paymentStatus.slice(1)}
                    </PaymentStatusBadge>
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Appointment Type</DetailLabel>
                  <DetailValue>{appointment.appointmentType}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Payment Method</DetailLabel>
                  <DetailValue>Not specified</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Transaction ID</DetailLabel>
                  <DetailValue>-</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Payment Date</DetailLabel>
                  <DetailValue>-</DetailValue>
                </DetailItem>
              </DetailGrid>
            </PaymentDetails>
          </PaymentTab>
        )}

        {activeTab === "history" && (
          <HistoryTab>
            <SectionHeader>
              <SectionTitle>
                <FiActivity size={18} />
                Appointment History
              </SectionTitle>
            </SectionHeader>
            <HistoryList>
              <HistoryItem>
                <HistoryIcon>
                  <FiCalendar size={16} />
                </HistoryIcon>
                <HistoryContent>
                  <HistoryTitle>Appointment Created</HistoryTitle>
                  <HistoryDescription>
                    Appointment was scheduled
                  </HistoryDescription>
                  <HistoryTime>
                    {formatDateTime(appointment.createdAt)}
                  </HistoryTime>
                </HistoryContent>
              </HistoryItem>

              {appointment.updatedAt !== appointment.createdAt && (
                <HistoryItem>
                  <HistoryIcon>
                    <FiEdit3 size={16} />
                  </HistoryIcon>
                  <HistoryContent>
                    <HistoryTitle>Appointment Updated</HistoryTitle>
                    <HistoryDescription>
                      Appointment details were modified
                    </HistoryDescription>
                    <HistoryTime>
                      {formatDateTime(appointment.updatedAt)}
                    </HistoryTime>
                  </HistoryContent>
                </HistoryItem>
              )}

              <HistoryItem>
                <HistoryIcon>
                  <FiMessageSquare size={16} />
                </HistoryIcon>
                <HistoryContent>
                  <HistoryTitle>Reminders</HistoryTitle>
                  <HistoryDescription>
                    {appointment.remindersSent} reminder
                    {appointment.remindersSent !== 1 ? "s" : ""} sent
                  </HistoryDescription>
                  <HistoryTime>Various times</HistoryTime>
                </HistoryContent>
              </HistoryItem>
            </HistoryList>
          </HistoryTab>
        )}
      </TabContent>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    color: #374151;
  }
`;

const HeaderInfo = styled.div``;

const AppointmentTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
`;

const AppointmentMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span<{
  status: string;
  color: string;
  background: string;
}>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: ${(props) => props.color};
  background: ${(props) => props.background};
  text-transform: capitalize;
`;
const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case "high":
      return "#ef4444";
    case "medium":
      return "#f59e0b";
    case "low":
      return "#10b981";
    default:
      return "#6b7280";
  }
};

const getPaymentStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "paid":
      return "#10b981";
    case "pending":
      return "#f59e0b";
    case "failed":
      return "#ef4444";
    case "refunded":
      return "#6b7280";
    default:
      return "#6b7280";
  }
};
const PriorityBadge = styled.span<{ priority: string }>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${(props) => getPriorityColor(props.priority)};
  background: ${(props) => getPriorityColor(props.priority)}15;
`;

const SourceBadge = styled.span`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
  background: #f3f4f6;
  color: #6b7280;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const ActionButton = styled.button<{
  variant?: "primary" | "secondary" | "ghost";
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${(props) => {
    switch (props.variant) {
      case "primary":
        return `
          background: ${theme.colors.primary};
          color: white;
          &:hover {
            background: ${theme.colors.primary}dd;
            transform: translateY(-1px);
          }
        `;
      case "secondary":
        return `
          background: white;
          color: ${theme.colors.primary};
          border: 1px solid ${theme.colors.primary};
          &:hover {
            background: ${theme.colors.primary}08;
          }
        `;
      case "ghost":
      default:
        return `
          background: none;
          color: #6b7280;
          border: 1px solid #e5e7eb;
          &:hover {
            background: #f9fafb;
            color: #374151;
          }
        `;
    }
  }}
`;

const MoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    color: #374151;
  }
`;

const QuickInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const InfoCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const InfoIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${theme.colors.primary}15;
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
  font-weight: 500;
`;

const InfoValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
`;

const InfoSubValue = styled.div`
  font-size: 12px;
  color: #6b7280;
  font-weight: normal;
`;

const PaymentStatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  margin-left: 8px;
  color: ${(props) => getPaymentStatusColor(props.status)};
  background: ${(props) => getPaymentStatusColor(props.status)}15;
`;

const TabNavigation = styled.div`
  display: flex;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  overflow-x: auto;
`;

const Tab = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid
    ${(props) => (props.active ? theme.colors.primary : "transparent")};
  color: ${(props) => (props.active ? theme.colors.primary : "#6b7280")};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  min-width: fit-content;

  &:hover {
    color: ${theme.colors.primary};
    background: #f9fafb;
  }
`;

const TabContent = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
`;

const OverviewTab = styled.div``;

const TabGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const DetailSection = styled.div``;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  .full-width {
    grid-column: 1 / -1;
  }
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #f3f4f6;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
`;

const DetailLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
`;

const DetailValue = styled.span`
  font-size: 14px;
  color: #111827;
  font-weight: 500;
`;

const TypeBadge = styled.span<{ type: string }>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  background: ${theme.colors.primary}15;
  color: ${theme.colors.primary};
`;

const MedicalCard = styled.div<{ type: string }>`
  background: ${(props) =>
    props.type === "symptoms"
      ? "#fef3c7"
      : props.type === "notes"
      ? "#dbeafe"
      : "#f0fdf4"};
  border: 1px solid
    ${(props) =>
      props.type === "symptoms"
        ? "#fbbf24"
        : props.type === "notes"
        ? "#60a5fa"
        : "#34d399"};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const MedicalCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const MedicalCardTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const MedicalCardCount = styled.span`
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: #374151;
`;

const SymptomsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SymptomTag = styled.span`
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #92400e;
`;

const NotesContent = styled.div`
  font-size: 14px;
  color: #1e40af;
  line-height: 1.5;
  background: rgba(255, 255, 255, 0.8);
  padding: 12px;
  border-radius: 6px;
`;

const RequirementsContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #065f46;
  background: rgba(255, 255, 255, 0.8);
  padding: 12px;
  border-radius: 6px;
`;

const ReminderSection = styled.div`
  margin-top: 24px;
`;

const ReminderCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 16px;
`;

const ReminderIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #0ea5e9;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ReminderContent = styled.div`
  flex: 1;
`;

const ReminderTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #0c4a6e;
  margin-bottom: 4px;
`;

const ReminderValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #0ea5e9;
  margin-bottom: 4px;
`;

const ReminderDescription = styled.div`
  font-size: 12px;
  color: #0c4a6e;
`;

const DoctorTab = styled.div``;

const DoctorProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  background: linear-gradient(
    135deg,
    ${theme.colors.primary}15,
    ${theme.colors.primary}08
  );
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
`;

const DoctorAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  box-shadow: 0 4px 12px ${theme.colors.primary}30;
`;

const DoctorInfo = styled.div`
  flex: 1;
`;

const DoctorName = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
`;

const DoctorSpecialization = styled.div`
  font-size: 16px;
  color: ${theme.colors.primary};
  font-weight: 600;
  margin-bottom: 2px;
`;

const DoctorDepartment = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const DoctorDetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
`;

const DoctorSection = styled.div``;

const ContactLink = styled.a`
  color: ${theme.colors.primary};
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const DoctorIdBadge = styled.span`
  font-family: monospace;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
`;

const SpecializationBadge = styled.span`
  background: ${theme.colors.primary}15;
  color: ${theme.colors.primary};
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
`;

const LicenseBadge = styled.span`
  font-family: monospace;
  background: #dcfce7;
  color: #16a34a;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

const QualificationsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const QualificationTag = styled.span`
  background: #fef3c7;
  color: #92400e;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const FeeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
`;

const FeeCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
`;

const FeeLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
  font-weight: 500;
`;

const FeeAmount = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.primary};
`;

const PaymentTab = styled.div``;

const PaymentSummary = styled.div`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 32px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 24px;
`;

const PaymentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const PaymentTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

const PaymentStatusLarge = styled.span<{ status: string }>`
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.2);
  color: white;
`;

const PaymentAmount = styled.div`
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 8px;
`;

const PaymentDescription = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

const PaymentDetails = styled.div``;

const HistoryTab = styled.div``;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const HistoryItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid ${theme.colors.primary};
`;

const HistoryIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${theme.colors.primary}15;
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const HistoryContent = styled.div`
  flex: 1;
`;

const HistoryTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

const HistoryDescription = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
`;

const HistoryTime = styled.div`
  font-size: 12px;
  color: #9ca3af;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

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
  color: #6b7280;
  font-size: 16px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 8px;
`;

const ErrorTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #dc2626;
  margin: 0;
`;

const ErrorText = styled.div`
  font-size: 14px;
  color: #6b7280;
  max-width: 400px;
  line-height: 1.5;
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.primary}dd;
    transform: translateY(-1px);
  }
`;

export default AppointmentDetailPage;
