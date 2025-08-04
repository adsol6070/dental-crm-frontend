import { useState } from "react";
import styled from "styled-components";
import { theme } from "@/config/theme.config";
import { useParams, useNavigate } from "react-router-dom";
import { usePatientById } from "@/hooks/useAdmin";
import { ROUTES } from "@/config/route-paths.config";
import { FiEdit2, FiCalendar, FiPhone, FiMail, FiMapPin, FiUser, FiHeart, FiShield, FiClock, FiCheckCircle } from "react-icons/fi";

interface Appointment {
  _id: string;
  appointmentId: string;
  date: Date;
  time: string;
  type: string;
  doctor: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  notes?: string;
}

interface PatientAPIResponse {
  patient: {
    personalInfo: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      gender: string;
      bloodGroup?: string;
    };
    contactInfo: {
      address: {
        street?: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
      email: string;
      phone: string;
      alternatePhone?: string;
    };
    medicalInfo: {
      emergencyContact: {
        name: string;
        relationship: string;
        phone: string;
      };
      allergies: string[];
      chronicConditions: string[];
      currentMedications: string[];
    };
    preferences: {
      reminderSettings: {
        enableReminders: boolean;
        reminderTime: number;
      };
      preferredLanguage: string;
      communicationMethod: string;
    };
    authentication: {
      isVerified: boolean;
      verificationToken: string;
    };
    statistics: {
      totalAppointments: number;
      completedAppointments: number;
      cancelledAppointments: number;
      noShowCount: number;
      lastVisit: string;
    };
    _id: string;
    registrationSource: string;
    isActive: boolean;
    patientId: string;
    createdAt: string;
    updatedAt: string;
    fullName: string;
    age: number;
    id: string;
  };
  appointmentStats: Array<{
    _id: string;
    count: number;
  }>;
}

const AdminPatientView = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "medical" | "appointments" | "notes" | "activity"
  >("overview");

  // Use the API hook and properly type the response
  const {
    data: apiResponse,
    isLoading: loading,
    isError,
    error,
  } = usePatientById(patientId || "") as {
    data: PatientAPIResponse | undefined;
    isLoading: boolean;
    isError: boolean;
    error: any;
  };

  // Extract patient data from API response
  const patient = apiResponse?.patient;
  const appointmentStats = apiResponse?.appointmentStats || [];

  // Mock appointments data (replace with actual appointments API)
  const appointments: Appointment[] = [
    {
      _id: "1",
      appointmentId: "APT-001",
      date: new Date("2024-07-10"),
      time: "10:00 AM",
      type: "General Consultation",
      doctor: "Dr. Smith",
      status: "scheduled",
      notes: "Regular check-up",
    },
    {
      _id: "2",
      appointmentId: "APT-002",
      date: new Date("2024-06-15"),
      time: "2:30 PM",
      type: "Follow-up",
      doctor: "Dr. Johnson",
      status: "completed",
      notes: "Blood pressure monitoring",
    },
    {
      _id: "3",
      appointmentId: "APT-003",
      date: new Date("2024-05-20"),
      time: "11:15 AM",
      type: "Lab Results Review",
      doctor: "Dr. Smith",
      status: "completed",
      notes: "Diabetes management consultation",
    },
  ];

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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

  const getAppointmentStatCount = (status: string): number => {
    const stat = appointmentStats.find(stat => stat._id === status);
    return stat ? stat.count : 0;
  };

  const handleEditPatient = () => {
    const route = ROUTES.ADMIN.EDIT_PATIENT.replace(':patientId', patientId || '');
    navigate(route);
  };

  const handleNewAppointment = () => {
    navigate(`${ROUTES.ADMIN.CREATE_APPOINTMENT}?patientId=${patientId}`);
  };

  const handleBackToPatients = () => {
    navigate(ROUTES.ADMIN.PATIENT_LIST);
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading patient details...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Failed to Load Patient</ErrorTitle>
          <ErrorText>
            {error?.message || "Failed to load patient details"}
          </ErrorText>
          <BackButton onClick={handleBackToPatients}>
            ← Back to Patients
          </BackButton>
        </ErrorContainer>
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorIcon>👤</ErrorIcon>
          <ErrorTitle>Patient Not Found</ErrorTitle>
          <ErrorText>The requested patient could not be found.</ErrorText>
          <BackButton onClick={handleBackToPatients}>
            ← Back to Patients
          </BackButton>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={handleBackToPatients}>
            ← Back to Patients
          </BackButton>
          <PatientHeader>
            <PatientAvatar>
              {patient.personalInfo.firstName.charAt(0)}
              {patient.personalInfo.lastName.charAt(0)}
            </PatientAvatar>
            <PatientTitleInfo>
              <PatientName>
                {patient.personalInfo.firstName} {patient.personalInfo.lastName}
              </PatientName>
              <PatientMeta>
                <PatientId>{patient.patientId}</PatientId>
                <StatusBadge active={patient.isActive}>
                  {patient.isActive ? "Active" : "Inactive"}
                </StatusBadge>
                {patient.authentication?.isVerified && (
                  <VerifiedBadge>
                    <FiCheckCircle size={12} />
                    Verified
                  </VerifiedBadge>
                )}
              </PatientMeta>
            </PatientTitleInfo>
          </PatientHeader>
        </HeaderLeft>
        <HeaderActions>
          <ActionButton onClick={handleNewAppointment}>
            <FiCalendar size={16} />
            Schedule Appointment
          </ActionButton>
          <ActionButton variant="secondary" onClick={handleEditPatient}>
            <FiEdit2 size={16} />
            Edit Patient
          </ActionButton>
        </HeaderActions>
      </Header>

      <QuickStats>
        <StatCard>
          <StatIcon>
            <FiUser size={20} />
          </StatIcon>
          <StatContent>
            <StatValue>{patient.age || calculateAge(patient.personalInfo.dateOfBirth)}</StatValue>
            <StatLabel>Years Old</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon>
            <FiCalendar size={20} />
          </StatIcon>
          <StatContent>
            <StatValue>{patient.statistics?.totalAppointments || 0}</StatValue>
            <StatLabel>Total Appointments</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon>
            <FiCheckCircle size={20} />
          </StatIcon>
          <StatContent>
            <StatValue>{patient.statistics?.completedAppointments || getAppointmentStatCount('completed')}</StatValue>
            <StatLabel>Completed</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon>
            <FiClock size={20} />
          </StatIcon>
          <StatContent>
            <StatValue>
              {patient.statistics?.lastVisit
                ? formatDate(patient.statistics.lastVisit)
                : "Never"}
            </StatValue>
            <StatLabel>Last Visit</StatLabel>
          </StatContent>
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
          active={activeTab === "medical"}
          onClick={() => setActiveTab("medical")}
        >
          Medical Info
        </Tab>
        <Tab
          active={activeTab === "appointments"}
          onClick={() => setActiveTab("appointments")}
        >
          Appointments
        </Tab>
        <Tab
          active={activeTab === "activity"}
          onClick={() => setActiveTab("activity")}
        >
          Activity Log
        </Tab>
        {/* <Tab
          active={activeTab === "notes"}
          onClick={() => setActiveTab("notes")}
        >
          Notes
        </Tab> */}
      </TabNavigation>

      <TabContent>
        {activeTab === "overview" && (
          <OverviewTab>
            <InfoSection>
              <SectionHeader>
                <SectionTitle>
                  <FiUser size={18} />
                  Personal Information
                </SectionTitle>
                <SectionActions>
                  <ActionButton size="small" onClick={handleEditPatient}>
                    <FiEdit2 size={14} />
                    Edit
                  </ActionButton>
                </SectionActions>
              </SectionHeader>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Full Name</InfoLabel>
                  <InfoValue>
                    {patient.personalInfo.firstName} {patient.personalInfo.lastName}
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Date of Birth</InfoLabel>
                  <InfoValue>
                    {formatDate(patient.personalInfo.dateOfBirth)}
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Age</InfoLabel>
                  <InfoValue>
                    {patient.age || calculateAge(patient.personalInfo.dateOfBirth)} years
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Gender</InfoLabel>
                  <InfoValue style={{ textTransform: "capitalize" }}>
                    {patient.personalInfo.gender}
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Blood Group</InfoLabel>
                  <InfoValue>
                    {patient.personalInfo.bloodGroup ? (
                      <BloodGroupBadge>{patient.personalInfo.bloodGroup}</BloodGroupBadge>
                    ) : (
                      "Not specified"
                    )}
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Patient ID</InfoLabel>
                  <InfoValue>
                    <PatientIdBadge>{patient.patientId}</PatientIdBadge>
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Registration Date</InfoLabel>
                  <InfoValue>{formatDate(patient.createdAt)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Last Updated</InfoLabel>
                  <InfoValue>{formatDateTime(patient.updatedAt)}</InfoValue>
                </InfoItem>
              </InfoGrid>
            </InfoSection>

            <InfoSection>
              <SectionHeader>
                <SectionTitle>
                  <FiPhone size={18} />
                  Contact Information
                </SectionTitle>
              </SectionHeader>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>
                    <FiMail size={14} />
                    Email
                  </InfoLabel>
                  <InfoValue>
                    <ContactLink href={`mailto:${patient.contactInfo.email}`}>
                      {patient.contactInfo.email}
                    </ContactLink>
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>
                    <FiPhone size={14} />
                    Phone
                  </InfoLabel>
                  <InfoValue>
                    <ContactLink href={`tel:${patient.contactInfo.phone}`}>
                      {patient.contactInfo.phone}
                    </ContactLink>
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>
                    <FiPhone size={14} />
                    Alternate Phone
                  </InfoLabel>
                  <InfoValue>
                    {patient.contactInfo.alternatePhone ? (
                      <ContactLink href={`tel:${patient.contactInfo.alternatePhone}`}>
                        {patient.contactInfo.alternatePhone}
                      </ContactLink>
                    ) : (
                      "Not provided"
                    )}
                  </InfoValue>
                </InfoItem>
                <InfoItem className="full-width">
                  <InfoLabel>
                    <FiMapPin size={14} />
                    Address
                  </InfoLabel>
                  <InfoValue>
                    {patient.contactInfo.address ? (
                      <AddressContainer>
                        {patient.contactInfo.address.street && (
                          <AddressLine>{patient.contactInfo.address.street}</AddressLine>
                        )}
                        <AddressLine>
                          {patient.contactInfo.address.city}, {patient.contactInfo.address.state} - {patient.contactInfo.address.zipCode}
                        </AddressLine>
                        <AddressLine>{patient.contactInfo.address.country}</AddressLine>
                      </AddressContainer>
                    ) : (
                      "Not provided"
                    )}
                  </InfoValue>
                </InfoItem>
              </InfoGrid>
            </InfoSection>

            <InfoSection>
              <SectionHeader>
                <SectionTitle>
                  <FiShield size={18} />
                  Preferences & Settings
                </SectionTitle>
              </SectionHeader>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Preferred Language</InfoLabel>
                  <InfoValue>
                    <LanguageBadge>
                      {patient.preferences?.preferredLanguage || "Not specified"}
                    </LanguageBadge>
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Communication Method</InfoLabel>
                  <InfoValue>
                    <CommunicationBadge method={patient.preferences?.communicationMethod || "email"}>
                      {(patient.preferences?.communicationMethod || "email").toUpperCase()}
                    </CommunicationBadge>
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Reminders</InfoLabel>
                  <InfoValue>
                    <ReminderStatus enabled={patient.preferences?.reminderSettings?.enableReminders}>
                      {patient.preferences?.reminderSettings?.enableReminders ? "Enabled" : "Disabled"}
                      {patient.preferences?.reminderSettings?.enableReminders &&
                        patient.preferences?.reminderSettings?.reminderTime && (
                          <span> ({patient.preferences.reminderSettings.reminderTime}h before)</span>
                        )}
                    </ReminderStatus>
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Registration Source</InfoLabel>
                  <InfoValue>
                    <SourceBadge>
                      {patient.registrationSource.replace("-", " ").toUpperCase()}
                    </SourceBadge>
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Account Status</InfoLabel>
                  <InfoValue>
                    <VerificationStatus verified={patient.authentication?.isVerified}>
                      <FiCheckCircle size={14} />
                      {patient.authentication?.isVerified ? "Verified" : "Unverified"}
                    </VerificationStatus>
                  </InfoValue>
                </InfoItem>
              </InfoGrid>
            </InfoSection>
          </OverviewTab>
        )}

        {activeTab === "medical" && (
          <MedicalTab>
            <InfoSection>
              <SectionHeader>
                <SectionTitle>
                  <FiHeart size={18} />
                  Medical Information
                </SectionTitle>
                <SectionActions>
                  <ActionButton size="small" onClick={handleEditPatient}>
                    <FiEdit2 size={14} />
                    Update Medical Info
                  </ActionButton>
                </SectionActions>
              </SectionHeader>
              <MedicalGrid>
                <MedicalCard type="danger">
                  <MedicalCardHeader>
                    <MedicalCardTitle>Allergies</MedicalCardTitle>
                    <MedicalCardCount>{patient.medicalInfo?.allergies?.length || 0}</MedicalCardCount>
                  </MedicalCardHeader>
                  <MedicalCardContent>
                    {patient.medicalInfo?.allergies && patient.medicalInfo.allergies.length > 0 ? (
                      <TagList>
                        {patient.medicalInfo.allergies.map((allergy, index) => (
                          <Tag key={index} type="danger">
                            {allergy}
                          </Tag>
                        ))}
                      </TagList>
                    ) : (
                      <NoDataText>No known allergies</NoDataText>
                    )}
                  </MedicalCardContent>
                </MedicalCard>

                <MedicalCard type="warning">
                  <MedicalCardHeader>
                    <MedicalCardTitle>Chronic Conditions</MedicalCardTitle>
                    <MedicalCardCount>{patient.medicalInfo?.chronicConditions?.length || 0}</MedicalCardCount>
                  </MedicalCardHeader>
                  <MedicalCardContent>
                    {patient.medicalInfo?.chronicConditions && patient.medicalInfo.chronicConditions.length > 0 ? (
                      <TagList>
                        {patient.medicalInfo.chronicConditions.map((condition, index) => (
                          <Tag key={index} type="warning">
                            {condition}
                          </Tag>
                        ))}
                      </TagList>
                    ) : (
                      <NoDataText>No chronic conditions</NoDataText>
                    )}
                  </MedicalCardContent>
                </MedicalCard>

                <MedicalCard type="info">
                  <MedicalCardHeader>
                    <MedicalCardTitle>Current Medications</MedicalCardTitle>
                    <MedicalCardCount>{patient.medicalInfo?.currentMedications?.length || 0}</MedicalCardCount>
                  </MedicalCardHeader>
                  <MedicalCardContent>
                    {patient.medicalInfo?.currentMedications && patient.medicalInfo.currentMedications.length > 0 ? (
                      <MedicationList>
                        {patient.medicalInfo.currentMedications.map((medication, index) => (
                          <MedicationItem key={index}>
                            <MedicationName>{medication}</MedicationName>
                          </MedicationItem>
                        ))}
                      </MedicationList>
                    ) : (
                      <NoDataText>No current medications</NoDataText>
                    )}
                  </MedicalCardContent>
                </MedicalCard>

                <MedicalCard type="emergency">
                  <MedicalCardHeader>
                    <MedicalCardTitle>Emergency Contact</MedicalCardTitle>
                  </MedicalCardHeader>
                  <MedicalCardContent>
                    {patient.medicalInfo?.emergencyContact ? (
                      <EmergencyContactInfo>
                        <EmergencyContactItem>
                          <EmergencyContactLabel>Name</EmergencyContactLabel>
                          <EmergencyContactValue>
                            {patient.medicalInfo.emergencyContact.name}
                          </EmergencyContactValue>
                        </EmergencyContactItem>
                        <EmergencyContactItem>
                          <EmergencyContactLabel>Relationship</EmergencyContactLabel>
                          <EmergencyContactValue>
                            {patient.medicalInfo.emergencyContact.relationship}
                          </EmergencyContactValue>
                        </EmergencyContactItem>
                        <EmergencyContactItem>
                          <EmergencyContactLabel>Phone</EmergencyContactLabel>
                          <EmergencyContactValue>
                            <ContactLink href={`tel:${patient.medicalInfo.emergencyContact.phone}`}>
                              {patient.medicalInfo.emergencyContact.phone}
                            </ContactLink>
                          </EmergencyContactValue>
                        </EmergencyContactItem>
                      </EmergencyContactInfo>
                    ) : (
                      <NoDataText>No emergency contact</NoDataText>
                    )}
                  </MedicalCardContent>
                </MedicalCard>
              </MedicalGrid>

              <AppointmentStatsSection>
                <SectionTitle>Appointment Statistics</SectionTitle>
                <StatsGrid>
                  <StatCard>
                    <StatIcon>
                      <FiCalendar size={20} />
                    </StatIcon>
                    <StatContent>
                      <StatValue>{patient.statistics?.totalAppointments || 0}</StatValue>
                      <StatLabel>Total Appointments</StatLabel>
                    </StatContent>
                  </StatCard>
                  <StatCard>
                    <StatIcon>
                      <FiCheckCircle size={20} />
                    </StatIcon>
                    <StatContent>
                      <StatValue>{patient.statistics?.completedAppointments || 0}</StatValue>
                      <StatLabel>Completed</StatLabel>
                    </StatContent>
                  </StatCard>
                  <StatCard>
                    <StatIcon>
                      <FiClock size={20} />
                    </StatIcon>
                    <StatContent>
                      <StatValue>{patient.statistics?.cancelledAppointments || 0}</StatValue>
                      <StatLabel>Cancelled</StatLabel>
                    </StatContent>
                  </StatCard>
                  <StatCard>
                    <StatIcon>
                      <FiUser size={20} />
                    </StatIcon>
                    <StatContent>
                      <StatValue>{patient.statistics?.noShowCount || 0}</StatValue>
                      <StatLabel>No Shows</StatLabel>
                    </StatContent>
                  </StatCard>
                </StatsGrid>
              </AppointmentStatsSection>
            </InfoSection>
          </MedicalTab>
        )}

        {activeTab === "appointments" && (
          <AppointmentsTab>
            <AppointmentHeader>
              <SectionTitle>
                <FiCalendar size={18} />
                Appointment History
              </SectionTitle>
              <ActionButton onClick={handleNewAppointment}>
                <FiCalendar size={16} />
                New Appointment
              </ActionButton>
            </AppointmentHeader>

            <AppointmentSummary>
              <SummaryCard>
                <SummaryIcon>
                  <FiCalendar size={20} />
                </SummaryIcon>
                <SummaryContent>
                  <SummaryValue>{patient.statistics?.totalAppointments || 0}</SummaryValue>
                  <SummaryLabel>Total</SummaryLabel>
                </SummaryContent>
              </SummaryCard>
              <SummaryCard>
                <SummaryIcon>
                  <FiCheckCircle size={20} />
                </SummaryIcon>
                <SummaryContent>
                  <SummaryValue>{patient.statistics?.completedAppointments || 0}</SummaryValue>
                  <SummaryLabel>Completed</SummaryLabel>
                </SummaryContent>
              </SummaryCard>
              <SummaryCard>
                <SummaryIcon>
                  <FiClock size={20} />
                </SummaryIcon>
                <SummaryContent>
                  <SummaryValue>{patient.statistics?.cancelledAppointments || 0}</SummaryValue>
                  <SummaryLabel>Cancelled</SummaryLabel>
                </SummaryContent>
              </SummaryCard>
              <SummaryCard>
                <SummaryIcon>
                  <FiClock size={20} />
                </SummaryIcon>
                <SummaryContent>
                  <SummaryValue>
                    {patient.statistics?.lastVisit
                      ? formatDate(patient.statistics.lastVisit)
                      : "Never"}
                  </SummaryValue>
                  <SummaryLabel>Last Visit</SummaryLabel>
                </SummaryContent>
              </SummaryCard>
            </AppointmentSummary>

            <AppointmentList>
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <AppointmentCard key={appointment._id}>
                    <AppointmentDate>
                      <DateText>{formatDate(appointment.date)}</DateText>
                      <TimeText>{appointment.time}</TimeText>
                    </AppointmentDate>
                    <AppointmentDetails>
                      <AppointmentType>{appointment.type}</AppointmentType>
                      <AppointmentDoctor>with {appointment.doctor}</AppointmentDoctor>
                      {appointment.notes && (
                        <AppointmentNotes>{appointment.notes}</AppointmentNotes>
                      )}
                    </AppointmentDetails>
                    <AppointmentStatus status={appointment.status}>
                      {appointment.status.replace("-", " ")}
                    </AppointmentStatus>
                  </AppointmentCard>
                ))
              ) : (
                <NoAppointments>
                  <NoDataIcon>📅</NoDataIcon>
                  <NoDataTitle>No Appointments</NoDataTitle>
                  <NoDataText>This patient hasn't had any appointments yet.</NoDataText>
                  <ActionButton onClick={handleNewAppointment}>
                    <FiCalendar size={16} />
                    Schedule First Appointment
                  </ActionButton>
                </NoAppointments>
              )}
            </AppointmentList>
          </AppointmentsTab>
        )}

        {activeTab === "activity" && (
          <ActivityTab>
            <SectionTitle>
              <FiClock size={18} />
              Recent Activity
            </SectionTitle>
            <ActivityList>
              <ActivityItem>
                <ActivityIcon>
                  <FiUser size={16} />
                </ActivityIcon>
                <ActivityContent>
                  <ActivityTitle>Patient Profile Updated</ActivityTitle>
                  <ActivityTime>{formatDateTime(patient.updatedAt)}</ActivityTime>
                </ActivityContent>
              </ActivityItem>
              <ActivityItem>
                <ActivityIcon>
                  <FiCalendar size={16} />
                </ActivityIcon>
                <ActivityContent>
                  <ActivityTitle>Patient Registered</ActivityTitle>
                  <ActivityTime>{formatDateTime(patient.createdAt)}</ActivityTime>
                </ActivityContent>
              </ActivityItem>
              {patient.statistics?.lastVisit && (
                <ActivityItem>
                  <ActivityIcon>
                    <FiCheckCircle size={16} />
                  </ActivityIcon>
                  <ActivityContent>
                    <ActivityTitle>Last Visit</ActivityTitle>
                    <ActivityTime>{formatDateTime(patient.statistics.lastVisit)}</ActivityTime>
                  </ActivityContent>
                </ActivityItem>
              )}
            </ActivityList>
          </ActivityTab>
        )}

        {/* {activeTab === "notes" && (
          <NotesTab>
            <SectionTitle>Patient Notes</SectionTitle>
            <NotesContainer>
              <NoDataIcon>📝</NoDataIcon>
              <NoDataTitle>No Notes Available</NoDataTitle>
              <NoDataText>No notes have been added for this patient yet.</NoDataText>
              <ActionButton>Add Note</ActionButton>
            </NotesContainer>
          </NotesTab>
        )} */}
      </TabContent>
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
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #6366f1 100%);
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

const PatientHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const PatientAvatar = styled.div`
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

const PatientTitleInfo = styled.div``;

const PatientName = styled.h1`
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const PatientMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const PatientId = styled.span`
  font-size: 14px;
  opacity: 0.9;
`;

const StatusBadge = styled.span<{ active: boolean }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) =>
    props.active ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"};
  color: ${(props) => (props.active ? "#10b981" : "#ef4444")};
  border: 1px solid ${(props) => (props.active ? "#10b981" : "#ef4444")};
`;

const VerifiedBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border: 1px solid #10b981;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: stretch;
  }
`;

const ActionButton = styled.button<{ variant?: "secondary"; size?: "small" }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: ${(props) => (props.size === "small" ? "6px 12px" : "10px 16px")};
  background: ${(props) =>
    props.variant === "secondary" ? "rgba(255, 255, 255, 0.15)" : "white"};
  color: ${(props) =>
    props.variant === "secondary" ? "white" : theme.colors.primary};
  border: ${(props) =>
    props.variant === "secondary"
      ? "1px solid rgba(255, 255, 255, 0.3)"
      : "none"};
  border-radius: 6px;
  font-size: ${(props) => (props.size === "small" ? "13px" : "14px")};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) =>
      props.variant === "secondary" ? "rgba(255, 255, 255, 0.25)" : "#f9fafb"};
    transform: translateY(-1px);
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
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div`
  padding: 8px;
  border-radius: 8px;
  background: ${theme.colors.primary}15;
  color: ${theme.colors.primary};
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #111827;
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
    ${(props) => (props.active ? theme.colors.primary : "transparent")};
  color: ${(props) => (props.active ? theme.colors.primary : "#6b7280")};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    color: ${theme.colors.primary};
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

const InfoSection = styled.div``;

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

const SectionActions = styled.div`
  display: flex;
  gap: 8px;
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
  gap: 6px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const InfoLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
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
  font-weight: 500;
`;

const BloodGroupBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

const PatientIdBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  font-family: monospace;
`;

const ContactLink = styled.a`
  color: ${theme.colors.primary};
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const AddressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AddressLine = styled.div`
  font-size: 14px;
  color: #374151;
`;

const LanguageBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  background: #f3e8ff;
  color: #7c3aed;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const CommunicationBadge = styled.span<{ method: string }>`
  display: inline-block;
  padding: 4px 8px;
  background: ${(props) =>
    props.method === "whatsapp" ? "#dcfce7" :
    props.method === "sms" ? "#fef3c7" :
    "#dbeafe"};
  color: ${(props) =>
    props.method === "whatsapp" ? "#166534" :
    props.method === "sms" ? "#92400e" :
    "#1e40af"};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const ReminderStatus = styled.span<{ enabled: boolean }>`
  display: inline-block;
  padding: 4px 8px;
  background: ${(props) => (props.enabled ? "#d1fae5" : "#fee2e2")};
  color: ${(props) => (props.enabled ? "#065f46" : "#991b1b")};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const SourceBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  background: #f0f9ff;
  color: #0284c7;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const VerificationStatus = styled.span<{ verified: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${(props) => (props.verified ? "#d1fae5" : "#fee2e2")};
  color: ${(props) => (props.verified ? "#065f46" : "#991b1b")};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
`;

const MedicalTab = styled.div``;

const MedicalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const MedicalCard = styled.div<{ type: "danger" | "warning" | "info" | "emergency" }>`
  background: white;
  border: 1px solid ${(props) => 
    props.type === "danger" ? "#fecaca" :
    props.type === "warning" ? "#fed7aa" :
    props.type === "info" ? "#bfdbfe" :
    "#d1fae5"};
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  background: ${theme.colors.primary}15;
  color: ${theme.colors.primary};
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
`;

const MedicalCardContent = styled.div``;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.span<{ type: "danger" | "warning" | "info" }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) =>
    props.type === "danger"
      ? "#fee2e2"
      : props.type === "warning"
      ? "#fef3c7"
      : "#dbeafe"};
  color: ${(props) =>
    props.type === "danger"
      ? "#991b1b"
      : props.type === "warning"
      ? "#92400e"
      : "#1e40af"};
`;

const MedicationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MedicationItem = styled.div`
  padding: 8px 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
`;

const MedicationName = styled.span`
  font-size: 13px;
  color: #374151;
  font-weight: 500;
`;

const EmergencyContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EmergencyContactItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const EmergencyContactLabel = styled.span`
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
`;

const EmergencyContactValue = styled.span`
  font-size: 13px;
  color: #111827;
  font-weight: 500;
`;

const AppointmentStatsSection = styled.div`
  margin-top: 32px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const AppointmentsTab = styled.div``;

const AppointmentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const AppointmentSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const SummaryCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const SummaryIcon = styled.div`
  padding: 8px;
  border-radius: 8px;
  background: ${theme.colors.primary}15;
  color: ${theme.colors.primary};
`;

const SummaryContent = styled.div`
  flex: 1;
`;

const SummaryValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
`;

const SummaryLabel = styled.div`
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const AppointmentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AppointmentCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const AppointmentDate = styled.div`
  min-width: 100px;
  text-align: center;
`;

const DateText = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #111827;
`;

const TimeText = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const AppointmentDetails = styled.div`
  flex: 1;
`;

const AppointmentType = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 2px;
`;

const AppointmentDoctor = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const AppointmentNotes = styled.div`
  font-size: 12px;
  color: #374151;
  font-style: italic;
`;

const getStatusColor = (status: string) => {
  switch (status) {
    case "scheduled":
      return "#3b82f6";
    case "completed":
      return "#10b981";
    case "cancelled":
      return "#f59e0b";
    case "no-show":
      return "#ef4444";
    default:
      return "#6b7280";
  }
};

const AppointmentStatus = styled.span<{ status: string }>`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  background: ${(props) => {
    switch (props.status) {
      case "scheduled":
        return "#dbeafe";
      case "completed":
        return "#d1fae5";
      case "cancelled":
        return "#fef3c7";
      case "no-show":
        return "#fee2e2";
      default:
        return "#f3f4f6";
    }
  }};
  color: ${(props) => getStatusColor(props.status)};
`;

const NoAppointments = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 20px;
  text-align: center;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
`;

const ActivityTab = styled.div``;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const ActivityIcon = styled.div`
  padding: 8px;
  border-radius: 8px;
  background: ${theme.colors.primary}15;
  color: ${theme.colors.primary};
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 2px;
`;

const ActivityTime = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

// const NotesTab = styled.div``;

// const NotesContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   gap: 16px;
//   padding: 40px 20px;
//   text-align: center;
//   background: #f9fafb;
//   border-radius: 8px;
//   border: 1px dashed #d1d5db;
// `;

const NoDataText = styled.div`
  font-size: 14px;
  color: #6b7280;
  font-style: italic;
`;

const NoDataIcon = styled.div`
  font-size: 48px;
  opacity: 0.6;
  margin-bottom: 8px;
`;

const NoDataTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
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

export default AdminPatientView;