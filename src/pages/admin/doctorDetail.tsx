import React, { useState } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { useDoctorById } from "@/hooks/useAdmin";
import { ROUTES } from "@/config/route-paths.config";
import { theme } from "@/config/theme.config";

// Interfaces matching your API response structure
interface IPersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface IProfessionalInfo {
  specialization: string;
  qualifications: string[];
  experience: number;
  licenseNumber: string;
  department?: string;
}

interface IWorkingDay {
  day: string;
  startTime: string;
  endTime: string;
  isWorking: boolean;
  _id: string;
  id: string;
}

interface IBreakTime {
  startTime: string;
  endTime: string;
  description?: string;
  _id: string;
  id: string;
}

interface ISchedule {
  workingDays: IWorkingDay[];
  slotDuration: number;
  breakTimes: IBreakTime[];
}

interface IAvailability {
  isAvailable: boolean;
  unavailableDates: string[];
  maxAppointmentsPerDay: number;
}

interface IFees {
  consultationFee: number;
  followUpFee?: number;
  emergencyFee?: number;
}

interface IStatistics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments?: number;
  rating: number;
  reviewCount: number;
}

interface IAuthentication {
  isVerified: boolean;
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
}

interface Doctor {
  _id: string;
  doctorId: string;
  personalInfo: IPersonalInfo;
  professionalInfo: IProfessionalInfo;
  schedule: ISchedule;
  availability: IAvailability;
  fees: IFees;
  statistics: IStatistics;
  authentication: IAuthentication;
  isActive: boolean;
  isVerifiedByAdmin: boolean;
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  id: string;
}

interface ApiResponse {
  doctor: Doctor;
  appointmentStats: any[];
}

const DoctorDetailPage = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "schedule" | "availability" | "security">("overview");

  // Use the API hook - expecting the response structure from your API
  const {
    data: apiResponse,
    isLoading: loading,
    isError,
    error,
  } = useDoctorById(doctorId || "") as {
    data: ApiResponse | undefined;
    isLoading: boolean;
    isError: boolean;
    error: any;
  };

  // Extract doctor from the API response
  const doctor = apiResponse?.doctor;
  const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDay = (day: string): string => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const getCompletionRate = (): number => {
    if (!doctor?.statistics.totalAppointments) return 0;
    return Math.round((doctor.statistics.completedAppointments / doctor.statistics.totalAppointments) * 100);
  };

  const handleScheduleAppointment = () => {
    const route = ROUTES.ADMIN.CREATE_APPOINTMENT + `?doctorId=${doctorId}`;
    navigate(route);
  };

  const handleBackToDoctors = () => {
    navigate(ROUTES.ADMIN.DOCTOR_LIST);
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading doctor details...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Failed to Load Doctor</ErrorTitle>
          <ErrorText>
            {error?.message || "Failed to load doctor details"}
          </ErrorText>
          <BackButton onClick={handleBackToDoctors}>
            ← Back to Doctors
          </BackButton>
        </ErrorContainer>
      </Container>
    );
  }

  if (!doctor) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorIcon>👨‍⚕️</ErrorIcon>
          <ErrorTitle>Doctor Not Found</ErrorTitle>
          <ErrorText>The requested doctor could not be found.</ErrorText>
          <BackButton onClick={handleBackToDoctors}>
            ← Back to Doctors
          </BackButton>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={handleBackToDoctors}>
            ← Back to Doctors
          </BackButton>
          <DoctorHeader>
            <DoctorAvatar>
              {doctor.personalInfo.firstName.charAt(0).toUpperCase()}
              {doctor.personalInfo.lastName.charAt(0).toUpperCase()}
            </DoctorAvatar>
            <DoctorTitleInfo>
              <DoctorName>
                Dr. {doctor.personalInfo.firstName} {doctor.personalInfo.lastName}
              </DoctorName>
              <DoctorSpecialization>{doctor.professionalInfo.specialization}</DoctorSpecialization>
              <DoctorMeta>
                <DoctorId>{doctor.doctorId}</DoctorId>
                <StatusBadge active={doctor.isActive}>
                  {doctor.isActive ? "Active" : "Inactive"}
                </StatusBadge>
                <StatusBadge active={doctor.availability.isAvailable} type="availability">
                  {doctor.availability.isAvailable ? "Available" : "Unavailable"}
                </StatusBadge>
                <StatusBadge active={doctor.authentication.isVerified} type="verification">
                  {doctor.authentication.isVerified ? "Verified" : "Unverified"}
                </StatusBadge>
                <StatusBadge active={doctor.isVerifiedByAdmin} type="admin">
                  {doctor.isVerifiedByAdmin ? "Admin Verified" : "Pending Admin"}
                </StatusBadge>
              </DoctorMeta>
            </DoctorTitleInfo>
          </DoctorHeader>
        </HeaderLeft>
        <HeaderActions>
          <ActionButton onClick={handleScheduleAppointment}>
            Schedule Appointment
          </ActionButton>
        </HeaderActions>
      </Header>

      <QuickStats>
        <StatCard>
          <StatValue>{doctor.professionalInfo.experience}</StatValue>
          <StatLabel>Years Experience</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{doctor.statistics.totalAppointments}</StatValue>
          <StatLabel>Total Appointments</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{getCompletionRate()}%</StatValue>
          <StatLabel>Completion Rate</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{doctor.statistics.rating}</StatValue>
          <StatLabel>{doctor.statistics.reviewCount} Reviews</StatLabel>
        </StatCard>
      </QuickStats>

      <TabNavigation>
        <Tab
          active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </Tab>
        <Tab
          active={activeTab === "schedule"}
          onClick={() => setActiveTab("schedule")}
        >
          Schedule
        </Tab>
        <Tab
          active={activeTab === "availability"}
          onClick={() => setActiveTab("availability")}
        >
          Availability
        </Tab>
        <Tab
          active={activeTab === "security"}
          onClick={() => setActiveTab("security")}
        >
          Security
        </Tab>
      </TabNavigation>

      <TabContent>
        {activeTab === "overview" && (
          <OverviewTab>
            <InfoSection>
              <SectionTitle>Personal Information</SectionTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Full Name</InfoLabel>
                  <InfoValue>
                    Dr. {doctor.personalInfo.firstName} {doctor.personalInfo.lastName}
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Email</InfoLabel>
                  <InfoValue>{doctor.personalInfo.email}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Phone</InfoLabel>
                  <InfoValue>{doctor.personalInfo.phone}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Registration Date</InfoLabel>
                  <InfoValue>{formatDate(doctor.registrationDate)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Last Updated</InfoLabel>
                  <InfoValue>{formatDate(doctor.updatedAt)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>License Number</InfoLabel>
                  <InfoValue>{doctor.professionalInfo.licenseNumber}</InfoValue>
                </InfoItem>
              </InfoGrid>
            </InfoSection>

            <InfoSection>
              <SectionTitle>Professional Information</SectionTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Specialization</InfoLabel>
                  <InfoValue>{doctor.professionalInfo.specialization}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Department</InfoLabel>
                  <InfoValue>{doctor.professionalInfo.department || "Not specified"}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Experience</InfoLabel>
                  <InfoValue>{doctor.professionalInfo.experience} years</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Admin Verification</InfoLabel>
                  <InfoValue>
                    <VerificationStatus verified={doctor.isVerifiedByAdmin}>
                      {doctor.isVerifiedByAdmin ? "✓ Admin Verified" : "⏳ Pending Admin Verification"}
                    </VerificationStatus>
                  </InfoValue>
                </InfoItem>
                <InfoItem className="full-width">
                  <InfoLabel>Qualifications</InfoLabel>
                  <QualificationsList>
                    {doctor.professionalInfo.qualifications.map((qualification, index) => (
                      <QualificationTag key={index}>
                        {qualification}
                      </QualificationTag>
                    ))}
                  </QualificationsList>
                </InfoItem>
              </InfoGrid>
            </InfoSection>

            <InfoSection>
              <SectionTitle>Fee Structure</SectionTitle>
              <FeeGrid>
                <FeeCard>
                  <FeeCardTitle>Consultation Fee</FeeCardTitle>
                  <FeeCardAmount>₹{doctor.fees.consultationFee}</FeeCardAmount>
                  <FeeCardDescription>Regular consultation</FeeCardDescription>
                </FeeCard>
                <FeeCard>
                  <FeeCardTitle>Follow-up Fee</FeeCardTitle>
                  <FeeCardAmount>₹{doctor.fees.followUpFee || 0}</FeeCardAmount>
                  <FeeCardDescription>Follow-up visit</FeeCardDescription>
                </FeeCard>
                <FeeCard>
                  <FeeCardTitle>Emergency Fee</FeeCardTitle>
                  <FeeCardAmount>₹{doctor.fees.emergencyFee || 0}</FeeCardAmount>
                  <FeeCardDescription>Emergency consultation</FeeCardDescription>
                </FeeCard>
              </FeeGrid>
            </InfoSection>

            <InfoSection>
              <SectionTitle>Statistics</SectionTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Total Appointments</InfoLabel>
                  <InfoValue>{doctor.statistics.totalAppointments}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Completed Appointments</InfoLabel>
                  <InfoValue>{doctor.statistics.completedAppointments}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Cancelled Appointments</InfoLabel>
                  <InfoValue>{doctor.statistics.cancelledAppointments || 0}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>No Show Count</InfoLabel>
                  <InfoValue>
                    {doctor.statistics.totalAppointments - 
                     doctor.statistics.completedAppointments - 
                     (doctor.statistics.cancelledAppointments || 0)}
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Average Rating</InfoLabel>
                  <RatingDisplay>
                    <RatingValue>{doctor.statistics.rating}</RatingValue>
                    <StarRating>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} filled={star <= doctor.statistics.rating}>
                          ★
                        </Star>
                      ))}
                    </StarRating>
                  </RatingDisplay>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Total Reviews</InfoLabel>
                  <InfoValue>{doctor.statistics.reviewCount}</InfoValue>
                </InfoItem>
              </InfoGrid>
            </InfoSection>
          </OverviewTab>
        )}

        {activeTab === "schedule" && (
          <ScheduleTab>
            <InfoSection>
              <SectionTitle>Weekly Schedule</SectionTitle>
              <ScheduleList>
                {doctor.schedule.workingDays.map((workingDay) => (
                  <ScheduleCard key={workingDay.day} isWorking={workingDay.isWorking}>
                    <ScheduleDay>
                      <DayName>{formatDay(workingDay.day)}</DayName>
                      <DayStatus isWorking={workingDay.isWorking}>
                        {workingDay.isWorking ? "Working" : "Off"}
                      </DayStatus>
                    </ScheduleDay>
                    <ScheduleTime>
                      {workingDay.isWorking ? (
                        `${workingDay.startTime} - ${workingDay.endTime}`
                      ) : (
                        "Not working"
                      )}
                    </ScheduleTime>
                  </ScheduleCard>
                ))}
              </ScheduleList>
            </InfoSection>

            <InfoSection>
              <SectionTitle>Break Times</SectionTitle>
              {doctor.schedule.breakTimes.length > 0 ? (
                <BreakTimesList>
                  {doctor.schedule.breakTimes.map((breakTime, index) => (
                    <BreakTimeCard key={breakTime._id || index}>
                      <BreakTimeTitle>
                        {breakTime.description || `Break ${index + 1}`}
                      </BreakTimeTitle>
                      <BreakTimeDuration>
                        {breakTime.startTime} - {breakTime.endTime}
                      </BreakTimeDuration>
                    </BreakTimeCard>
                  ))}
                </BreakTimesList>
              ) : (
                <NoDataText>No break times configured</NoDataText>
              )}
            </InfoSection>

            <InfoSection>
              <SectionTitle>Schedule Settings</SectionTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Slot Duration</InfoLabel>
                  <InfoValue>{doctor.schedule.slotDuration} minutes</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Max Appointments/Day</InfoLabel>
                  <InfoValue>{doctor.availability.maxAppointmentsPerDay}</InfoValue>
                </InfoItem>
              </InfoGrid>
            </InfoSection>
          </ScheduleTab>
        )}

        {activeTab === "availability" && (
          <AvailabilityTab>
            <InfoSection>
              <SectionTitle>Current Availability</SectionTitle>
              <AvailabilityGrid>
                <AvailabilityCard>
                  <AvailabilityIcon isAvailable={doctor.availability.isAvailable}>
                    {doctor.availability.isAvailable ? "✓" : "✗"}
                  </AvailabilityIcon>
                  <AvailabilityStatus>
                    {doctor.availability.isAvailable ? "Available for Appointments" : "Currently Unavailable"}
                  </AvailabilityStatus>
                  <AvailabilityDescription>
                    {doctor.availability.isAvailable 
                      ? "Doctor is accepting new appointments"
                      : "Doctor is not accepting new appointments"
                    }
                  </AvailabilityDescription>
                </AvailabilityCard>
                <AvailabilityCard>
                  <AvailabilityNumber>{doctor.availability.maxAppointmentsPerDay}</AvailabilityNumber>
                  <AvailabilityLabel>Max Appointments Per Day</AvailabilityLabel>
                </AvailabilityCard>
              </AvailabilityGrid>
            </InfoSection>

            <InfoSection>
              <SectionTitle>Unavailable Dates</SectionTitle>
              {doctor.availability.unavailableDates.length > 0 ? (
                <UnavailableDatesList>
                  {doctor.availability.unavailableDates.map((date, index) => (
                    <UnavailableDateCard key={index}>
                      <UnavailableDateText>{formatDate(date)}</UnavailableDateText>
                    </UnavailableDateCard>
                  ))}
                </UnavailableDatesList>
              ) : (
                <NoDataText>No unavailable dates set</NoDataText>
              )}
            </InfoSection>
          </AvailabilityTab>
        )}

        {activeTab === "security" && (
          <SecurityTab>
            <InfoSection>
              <SectionTitle>Authentication & Security</SectionTitle>
              <SecurityGrid>
                <SecurityCard>
                  <SecurityIcon verified={doctor.authentication.isVerified}>
                    {doctor.authentication.isVerified ? "🔒" : "🔓"}
                  </SecurityIcon>
                  <SecurityStatus>
                    <SecurityTitle>Account Verification</SecurityTitle>
                    <SecurityValue verified={doctor.authentication.isVerified}>
                      {doctor.authentication.isVerified ? "Verified Account" : "Unverified Account"}
                    </SecurityValue>
                  </SecurityStatus>
                </SecurityCard>
                
                <SecurityCard>
                  <SecurityIcon verified={doctor.authentication.twoFactorEnabled}>
                    {doctor.authentication.twoFactorEnabled ? "🛡️" : "⚠️"}
                  </SecurityIcon>
                  <SecurityStatus>
                    <SecurityTitle>Two-Factor Authentication</SecurityTitle>
                    <SecurityValue verified={doctor.authentication.twoFactorEnabled}>
                      {doctor.authentication.twoFactorEnabled ? "Enabled" : "Disabled"}
                    </SecurityValue>
                  </SecurityStatus>
                </SecurityCard>
              </SecurityGrid>
            </InfoSection>

            <InfoSection>
              <SectionTitle>Security Details</SectionTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Account Status</InfoLabel>
                  <InfoValue>
                    <VerificationStatus verified={doctor.authentication.isVerified}>
                      {doctor.authentication.isVerified ? "✓ Verified" : "✗ Not Verified"}
                    </VerificationStatus>
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Two-Factor Auth</InfoLabel>
                  <InfoValue>
                    <VerificationStatus verified={doctor.authentication.twoFactorEnabled}>
                      {doctor.authentication.twoFactorEnabled ? "✓ Enabled" : "✗ Disabled"}
                    </VerificationStatus>
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Last Password Change</InfoLabel>
                  <InfoValue>{formatDate(doctor.authentication.lastPasswordChange)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Admin Verification</InfoLabel>
                  <InfoValue>
                    <VerificationStatus verified={doctor.isVerifiedByAdmin}>
                      {doctor.isVerifiedByAdmin ? "✓ Admin Verified" : "⏳ Pending"}
                    </VerificationStatus>
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Account Active</InfoLabel>
                  <InfoValue>
                    <VerificationStatus verified={doctor.isActive}>
                      {doctor.isActive ? "✓ Active" : "✗ Inactive"}
                    </VerificationStatus>
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Doctor ID</InfoLabel>
                  <InfoValue>{doctor.doctorId}</InfoValue>
                </InfoItem>
              </InfoGrid>
            </InfoSection>
          </SecurityTab>
        )}
      </TabContent>
    </Container>
  );
};

// Styled Components (updated and new ones)
const Container = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  color: white;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  width: fit-content;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const DoctorHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const DoctorAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.3);
`;

const DoctorTitleInfo = styled.div``;

const DoctorName = styled.h1`
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 4px 0;
`;

const DoctorSpecialization = styled.p`
  font-size: 16px;
  opacity: 0.9;
  margin: 0 0 8px 0;
`;

const DoctorMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const DoctorId = styled.span`
  font-size: 14px;
  opacity: 0.9;
`;

const StatusBadge = styled.span<{ active: boolean; type?: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) => {
    if (props.type === "availability") {
      return props.active ? "rgba(16, 185, 129, 0.2)" : "rgba(156, 163, 175, 0.2)";
    }
    if (props.type === "verification") {
      return props.active ? "rgba(59, 130, 246, 0.2)" : "rgba(239, 68, 68, 0.2)";
    }
    if (props.type === "admin") {
      return props.active ? "rgba(168, 85, 247, 0.2)" : "rgba(251, 146, 60, 0.2)";
    }
    return props.active ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)";
  }};
  color: ${(props) => {
    if (props.type === "availability") {
      return props.active ? "#10b981" : "#6b7280";
    }
    if (props.type === "verification") {
      return props.active ? "#3b82f6" : "#ef4444";
    }
    if (props.type === "admin") {
      return props.active ? "#a855f7" : "#fb923c";
    }
    return props.active ? "#10b981" : "#ef4444";
  }};
  border: 1px solid ${(props) => {
    if (props.type === "availability") {
      return props.active ? "#10b981" : "#6b7280";
    }
    if (props.type === "verification") {
      return props.active ? "#3b82f6" : "#ef4444";
    }
    if (props.type === "admin") {
      return props.active ? "#a855f7" : "#fb923c";
    }
    return props.active ? "#10b981" : "#ef4444";
  }};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: stretch;
  }
`;

const ActionButton = styled.button<{ variant?: "secondary" }>`
  padding: 10px 16px;
  background: ${(props) =>
    props.variant === "secondary" ? "rgba(255, 255, 255, 0.15)" : "white"};
  color: ${(props) =>
    props.variant === "secondary" ? "white" : "#3b82f6"};
  border: ${(props) =>
    props.variant === "secondary"
      ? "1px solid rgba(255, 255, 255, 0.3)"
      : "none"};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) =>
      props.variant === "secondary" ? "rgba(255, 255, 255, 0.25)" : "#f9fafb"};
  }

  @media (max-width: 768px) {
    flex: 1;
  }
`;

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const StatCard = styled.div`
  background: white;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TabNavigation = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  overflow-x: auto;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 16px 24px;
  background: none;
  border: none;
  border-bottom: 2px solid
    ${(props) => (props.active ? "#3b82f6" : "transparent")};
  color: ${(props) => (props.active ? "#3b82f6" : "#6b7280")};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    color: #3b82f6;
    background: #f9fafb;
  }
`;

const TabContent = styled.div`
  padding: 24px;
`;

const OverviewTab = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const ScheduleTab = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const AvailabilityTab = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const SecurityTab = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const InfoSection = styled.div``;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;

  .full-width {
    grid-column: 1 / -1;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InfoValue = styled.span`
  font-size: 14px;
  color: #111827;
  line-height: 1.4;
`;

const VerificationStatus = styled.span<{ verified: boolean }>`
  color: ${(props) => (props.verified ? "#10b981" : "#ef4444")};
  font-weight: 500;
`;

const QualificationsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
`;

const QualificationTag = styled.span`
  padding: 4px 8px;
  background: #3b82f6;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const FeeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const FeeCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
`;

const FeeCardTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
`;

const FeeCardAmount = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 4px;
`;

const FeeCardDescription = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const RatingDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RatingValue = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const StarRating = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.span<{ filled: boolean }>`
  color: ${(props) => (props.filled ? "#fbbf24" : "#e5e7eb")};
  font-size: 16px;
`;

const ScheduleList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 12px;
`;

const ScheduleCard = styled.div<{ isWorking: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: ${(props) => (props.isWorking ? "#ecfdf5" : "#f9fafb")};
  border: 1px solid ${(props) => (props.isWorking ? "#a7f3d0" : "#e5e7eb")};
  border-radius: 8px;
`;

const ScheduleDay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DayName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
`;

const DayStatus = styled.span<{ isWorking: boolean }>`
  font-size: 12px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${(props) => (props.isWorking ? "#10b981" : "#ef4444")};
  color: white;
  width: fit-content;
`;

const ScheduleTime = styled.span`
  font-size: 14px;
  color: #374151;
  font-weight: 500;
`;

const BreakTimesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
`;

const BreakTimeCard = styled.div`
  padding: 12px;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 6px;
`;

const BreakTimeTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

const BreakTimeDuration = styled.div`
  font-size: 12px;
  color: #374151;
`;

const AvailabilityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const AvailabilityCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
`;

const AvailabilityIcon = styled.div<{ isAvailable: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${(props) => (props.isAvailable ? "#10b981" : "#ef4444")};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin: 0 auto 12px;
`;

const AvailabilityStatus = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
`;

const AvailabilityDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
`;

const AvailabilityNumber = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 8px;
`;

const AvailabilityLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const UnavailableDatesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
`;

const UnavailableDateCard = styled.div`
  padding: 12px;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  text-align: center;
`;

const UnavailableDateText = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #991b1b;
`;

const SecurityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const SecurityCard = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const SecurityIcon = styled.div<{ verified: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${(props) => (props.verified ? "#10b981" : "#ef4444")};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SecurityStatus = styled.div`
  flex: 1;
`;

const SecurityTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
`;

const SecurityValue = styled.div<{ verified: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => (props.verified ? "#10b981" : "#ef4444")};
`;

const NoDataText = styled.div`
  font-size: 14px;
  color: #6b7280;
  font-style: italic;
  text-align: center;
  padding: 40px 20px;
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
  border-top: 3px solid #3b82f6;
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

const ErrorText = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
  max-width: 400px;
  line-height: 1.5;
`;

export default DoctorDetailPage;