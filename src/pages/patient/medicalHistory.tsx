import { useState } from "react";
import styled from "styled-components";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiFileText,
  FiChevronDown,
  FiChevronUp,
  FiActivity,
  FiRefreshCw,
  FiSearch,
  FiDownload,
  FiEye,
  FiMail,
  FiPhone,
  FiAward,
} from "react-icons/fi";
import { FaPills, FaStethoscope } from "react-icons/fa";
import { usePatientRecords } from "@/hooks/usePatient";

// Theme configuration
const theme = {
  colors: {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#0ea5e9",
    light: "#f8fafc",
    dark: "#1e293b",
    textPrimary: "#111827",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
    background: "#f9fafb",
  },
};

// TypeScript interfaces
interface ActionButtonProps {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  onClick?: () => void;
}

interface StatusBadgeProps {
  followUpRequired: boolean;
  children: React.ReactNode;
}

interface ExpandButtonProps {
  isExpanded: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

interface FollowUpStatusProps {
  required: boolean;
  children: React.ReactNode;
}

const MedicalHistoryDashboard = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // Use the hook to fetch data
  const { data: apiResponse, isLoading, error, refetch } = usePatientRecords();

  // Extract medical records from API response or use dummy data
  const medicalRecords = apiResponse?.data?.medicalRecords || getDummyData();

  // Dummy data function for fallback
  function getDummyData() {
    return [
      {
        _id: "687767ca91f1393a7b9e1705",
        appointmentId: "APT-1752650849772-4suzzks66",
        appointmentDateTime: "2025-01-15T10:30:00.000Z",
        consultation: {
          diagnosis: "Cavity in lower left molar",
          prescription: "Painkiller (Ibuprofen), Saltwater rinse",
          nextAppointment: "2025-01-25T10:30:00.000Z",
          followUpRequired: true,
        },
        doctor: {
          _id: "6868bd158f523636eb6aaf9a",
          personalInfo: {
            firstName: "Dr. Sakshi",
            lastName: "Verma",
            email: "dr.sakshi.verma@dentalclinic.com",
            phone: "+919876543210",
          },
          professionalInfo: {
            specialization: "Dentist",
            qualifications: ["BDS", "MDS - Orthodontics"],
            experience: 8,
            licenseNumber: "DEN1234567",
            department: "Orthodontics",
          },
        },
      },
      {
        _id: "687767ca91f1393a7b9e1706",
        appointmentId: "APT-1752720849772-1abc2defg",
        appointmentDateTime: "2024-12-20T11:00:00.000Z",
        consultation: {
          diagnosis: "Plaque buildup and mild gingivitis",
          prescription: "Antiseptic mouthwash, scaling recommended",
          nextAppointment: "2025-01-01T11:00:00.000Z",
          followUpRequired: true,
        },
        doctor: {
          _id: "6868bd158f523636eb6aaf9a",
          personalInfo: {
            firstName: "Dr. Sakshi",
            lastName: "Verma",
            email: "dr.sakshi.verma@dentalclinic.com",
            phone: "+919876543210",
          },
          professionalInfo: {
            specialization: "Dentist",
            qualifications: ["BDS", "MDS - Orthodontics"],
            experience: 8,
            licenseNumber: "DEN1234567",
            department: "Orthodontics",
          },
        },
      },
      {
        _id: "687767ca91f1393a7b9e1707",
        appointmentId: "APT-1752739849772-6zxy123qw",
        appointmentDateTime: "2024-11-15T09:45:00.000Z",
        consultation: {
          diagnosis: "Tooth extraction - wisdom tooth",
          prescription: "Antibiotics (Amoxicillin), Ice packs",
          nextAppointment: "2024-11-29T09:45:00.000Z",
          followUpRequired: true,
        },
        doctor: {
          _id: "6868bd158f523636eb6aaf9a",
          personalInfo: {
            firstName: "Dr. Sakshi",
            lastName: "Verma",
            email: "dr.sakshi.verma@dentalclinic.com",
            phone: "+919876543210",
          },
          professionalInfo: {
            specialization: "Dentist",
            qualifications: ["BDS", "MDS - Orthodontics"],
            experience: 8,
            licenseNumber: "DEN1234567",
            department: "Orthodontics",
          },
        },
      },
      {
        _id: "687767ca91f1393a7b9e1708",
        appointmentId: "APT-1752745849772-xyz567plk",
        appointmentDateTime: "2024-10-05T14:00:00.000Z",
        consultation: {
          diagnosis: "Routine dental check-up",
          prescription: "Fluoride toothpaste, dental floss daily",
          nextAppointment: "2025-04-05T14:00:00.000Z",
          followUpRequired: false,
        },
        doctor: {
          _id: "6868bd158f523636eb6aaf9a",
          personalInfo: {
            firstName: "Dr. Sakshi",
            lastName: "Verma",
            email: "dr.sakshi.verma@dentalclinic.com",
            phone: "+919876543210",
          },
          professionalInfo: {
            specialization: "Dentist",
            qualifications: ["BDS", "MDS - Orthodontics"],
            experience: 8,
            licenseNumber: "DEN1234567",
            department: "Orthodontics",
          },
        },
      },
      {
        _id: "687767ca91f1393a7b9e1709",
        appointmentId: "APT-1752755849772-abc123xyz",
        appointmentDateTime: "2024-09-10T16:30:00.000Z",
        consultation: {
          diagnosis: "Hypertension - Stage 1",
          prescription: "Lisinopril 10mg daily, Low sodium diet",
          nextAppointment: "2024-12-10T16:30:00.000Z",
          followUpRequired: true,
        },
        doctor: {
          _id: "6868bd158f523636eb6aaf9b",
          personalInfo: {
            firstName: "Dr. Rajesh",
            lastName: "Kumar",
            email: "dr.rajesh.kumar@cardioclinic.com",
            phone: "+919876543211",
          },
          professionalInfo: {
            specialization: "Cardiologist",
            qualifications: ["MBBS", "MD - Cardiology"],
            experience: 12,
            licenseNumber: "CAR1234567",
            department: "Cardiology",
          },
        },
      },
      {
        _id: "687767ca91f1393a7b9e170a",
        appointmentId: "APT-1752765849772-def456ghi",
        appointmentDateTime: "2024-08-15T11:15:00.000Z",
        consultation: {
          diagnosis: "Migraine with aura",
          prescription: "Sumatriptan 50mg as needed, Propranolol 40mg daily",
          nextAppointment: "2024-11-15T11:15:00.000Z",
          followUpRequired: true,
        },
        doctor: {
          _id: "6868bd158f523636eb6aaf9c",
          personalInfo: {
            firstName: "Dr. Priya",
            lastName: "Sharma",
            email: "dr.priya.sharma@neuroclinic.com",
            phone: "+919876543212",
          },
          professionalInfo: {
            specialization: "Neurologist",
            qualifications: ["MBBS", "MD - Neurology"],
            experience: 10,
            licenseNumber: "NEU1234567",
            department: "Neurology",
          },
        },
      },
    ];
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-IN", {
        day: "2-digit",
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

  const toggleExpanded = (recordId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(recordId)) {
      newExpanded.delete(recordId);
    } else {
      newExpanded.add(recordId);
    }
    setExpandedItems(newExpanded);
  };

  const handleRefetch = () => {
    refetch();
  };

  const filteredRecords = medicalRecords
    .filter((record) => {
      const matchesSearch =
        record.consultation.diagnosis
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        record.doctor.personalInfo.firstName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        record.doctor.personalInfo.lastName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        record.doctor.professionalInfo.specialization
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "followup" && record.consultation.followUpRequired) ||
        (filterBy === "completed" && !record.consultation.followUpRequired);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(b.appointmentDateTime).getTime() -
            new Date(a.appointmentDateTime).getTime()
          );
        case "doctor":
          return `${a.doctor.personalInfo.firstName} ${a.doctor.personalInfo.lastName}`.localeCompare(
            `${b.doctor.personalInfo.firstName} ${b.doctor.personalInfo.lastName}`
          );
        case "diagnosis":
          return a.consultation.diagnosis.localeCompare(
            b.consultation.diagnosis
          );
        default:
          return 0;
      }
    });

  // Loading state
  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading medical records...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Failed to load medical records</ErrorTitle>
          <ErrorMessage>
            An error occurred while fetching your medical history. Please try
            again.
          </ErrorMessage>
          <RetryButton onClick={handleRefetch}>
            <FiRefreshCw size={16} />
            Try Again
          </RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

  // Empty state (only if no dummy data and no API data)
  if (!medicalRecords || medicalRecords.length === 0) {
    return (
      <Container>
        <Header>
          <HeaderContent>
            <Title>Medical History</Title>
            <Subtitle>
              Your complete medical records and consultation history
            </Subtitle>
          </HeaderContent>
          <HeaderActions>
            <ActionButton onClick={handleRefetch}>
              <FiRefreshCw size={16} />
              Refresh
            </ActionButton>
          </HeaderActions>
        </Header>

        <EmptyState>
          <EmptyIcon>🏥</EmptyIcon>
          <EmptyTitle>No medical records found</EmptyTitle>
          <EmptyMessage>
            Your medical history will appear here after your first consultation.
          </EmptyMessage>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>
            Medical History
            <RecordCount>({medicalRecords.length} records)</RecordCount>
          </Title>
          <Subtitle>
            Your complete medical records and consultation history
          </Subtitle>
        </HeaderContent>
        <HeaderActions>
          <ActionButton onClick={handleRefetch}>
            <FiRefreshCw size={16} />
            Refresh
          </ActionButton>
          <ActionButton variant="primary">
            <FiDownload size={16} />
            Export
          </ActionButton>
        </HeaderActions>
      </Header>

      <Controls>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search by diagnosis, doctor name, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon>
            <FiSearch size={18} />
          </SearchIcon>
        </SearchContainer>

        <FilterContainer>
          <FilterSelect
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="all">All Records</option>
            <option value="followup">Follow-up Required</option>
            <option value="completed">Completed</option>
          </FilterSelect>

          <SortSelect
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="doctor">Sort by Doctor</option>
            <option value="diagnosis">Sort by Diagnosis</option>
          </SortSelect>
        </FilterContainer>
      </Controls>

      <RecordsContainer>
        {filteredRecords.map((record) => {
          const isExpanded = expandedItems.has(record._id);
          const dateTime = formatDateTime(record.appointmentDateTime);

          return (
            <RecordCard key={record._id}>
              <RecordHeader onClick={() => toggleExpanded(record._id)}>
                <RecordMainInfo>
                  <RecordDate>
                    <FiCalendar size={16} />
                    {dateTime.date}
                  </RecordDate>
                  <RecordTime>
                    <FiClock size={14} />
                    {dateTime.time}
                  </RecordTime>
                </RecordMainInfo>

                <RecordSummary>
                  <DiagnosisTitle>
                    {record.consultation.diagnosis}
                  </DiagnosisTitle>
                  <DoctorInfo>
                    <FiUser size={14} />
                    {record.doctor.personalInfo.firstName}{" "}
                    {record.doctor.personalInfo.lastName}
                    <Specialization>
                      • {record.doctor.professionalInfo.specialization}
                    </Specialization>
                  </DoctorInfo>
                </RecordSummary>

                <RecordActions>
                  <StatusBadge
                    followUpRequired={record.consultation.followUpRequired}
                  >
                    {record.consultation.followUpRequired
                      ? "Follow-up Required"
                      : "Completed"}
                  </StatusBadge>
                  <ExpandButton
                    isExpanded={isExpanded}
                    onClick={() => toggleExpanded(record._id)}
                  >
                    {isExpanded ? (
                      <FiChevronUp size={20} />
                    ) : (
                      <FiChevronDown size={20} />
                    )}
                  </ExpandButton>
                </RecordActions>
              </RecordHeader>

              {isExpanded && (
                <RecordDetails>
                  <DetailsGrid>
                    <DetailsSection>
                      <SectionTitle>
                        <FiActivity size={16} />
                        Diagnosis & Treatment
                      </SectionTitle>
                      <DetailItem>
                        <DetailLabel>Diagnosis:</DetailLabel>
                        <DetailValue>
                          {record.consultation.diagnosis}
                        </DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>Prescription:</DetailLabel>
                        <DetailValue>
                          <PrescriptionContainer>
                            <FaPills size={14} />
                            {record.consultation.prescription}
                          </PrescriptionContainer>
                        </DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>Follow-up Required:</DetailLabel>
                        <DetailValue>
                          <FollowUpStatus
                            required={record.consultation.followUpRequired}
                          >
                            {record.consultation.followUpRequired
                              ? "Yes"
                              : "No"}
                          </FollowUpStatus>
                        </DetailValue>
                      </DetailItem>
                      {record.consultation.nextAppointment && (
                        <DetailItem>
                          <DetailLabel>Next Appointment:</DetailLabel>
                          <DetailValue>
                            <NextAppointment>
                              {
                                formatDateTime(
                                  record.consultation.nextAppointment
                                ).date
                              }{" "}
                              at{" "}
                              {
                                formatDateTime(
                                  record.consultation.nextAppointment
                                ).time
                              }
                            </NextAppointment>
                          </DetailValue>
                        </DetailItem>
                      )}
                    </DetailsSection>

                    <DetailsSection>
                      <SectionTitle>
                        <FaStethoscope size={16} />
                        Doctor Information
                      </SectionTitle>
                      <DoctorDetailsCard>
                        <DoctorAvatar>
                          <FiUser size={24} />
                        </DoctorAvatar>
                        <DoctorDetailsInfo>
                          <DoctorName>
                            {record.doctor.personalInfo.firstName}{" "}
                            {record.doctor.personalInfo.lastName}
                          </DoctorName>
                          <DoctorSpecialization>
                            {record.doctor.professionalInfo.specialization}
                          </DoctorSpecialization>
                          <DoctorExperience>
                            <FiAward size={12} />
                            {record.doctor.professionalInfo.experience} years
                            experience
                          </DoctorExperience>
                          <DoctorQualifications>
                            {record.doctor.professionalInfo.qualifications.join(
                              ", "
                            )}
                          </DoctorQualifications>
                          <DoctorContact>
                            <ContactItem>
                              <FiMail size={12} />
                              {record.doctor.personalInfo.email}
                            </ContactItem>
                            <ContactItem>
                              <FiPhone size={12} />
                              {record.doctor.personalInfo.phone}
                            </ContactItem>
                          </DoctorContact>
                        </DoctorDetailsInfo>
                      </DoctorDetailsCard>
                    </DetailsSection>
                  </DetailsGrid>

                  <RecordFooter>
                    <AppointmentId>
                      <FiFileText size={14} />
                      Appointment ID: {record.appointmentId}
                    </AppointmentId>
                    <RecordFooterActions>
                      <FooterButton>
                        <FiEye size={14} />
                        View Full Report
                      </FooterButton>
                      <FooterButton>
                        <FiDownload size={14} />
                        Download
                      </FooterButton>
                    </RecordFooterActions>
                  </RecordFooter>
                </RecordDetails>
              )}
            </RecordCard>
          );
        })}
      </RecordsContainer>

      {filteredRecords.length === 0 && searchTerm && (
        <NoResultsContainer>
          <NoResultsIcon>🔍</NoResultsIcon>
          <NoResultsTitle>No records found</NoResultsTitle>
          <NoResultsMessage>
            Try adjusting your search terms or filters to find what you're
            looking for.
          </NoResultsMessage>
        </NoResultsContainer>
      )}
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
  color: ${theme.colors.textSecondary};
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
  color: ${theme.colors.danger};
  margin: 0 0 8px 0;
`;

const ErrorMessage = styled.p`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
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
  color: ${theme.colors.textPrimary};
  margin: 0 0 8px 0;
`;

const EmptyMessage = styled.p`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  margin: 0;
  max-width: 400px;
  line-height: 1.5;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  background: linear-gradient(
    135deg,
    ${theme.colors.primary} 0%,
    ${theme.colors.secondary} 100%
  );
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

const RecordCount = styled.span`
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

const ActionButton = styled.button<ActionButtonProps>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${(props) =>
    props.variant === "primary"
      ? "rgba(255, 255, 255, 0.25)"
      : "rgba(255, 255, 255, 0.1)"};
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: ${theme.colors.light};
  border-bottom: 1px solid ${theme.colors.border};
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.textSecondary};
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  min-width: 140px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const SortSelect = styled.select`
  padding: 12px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  min-width: 140px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const RecordsContainer = styled.div`
  padding: 20px 24px;
`;

const RecordCard = styled.div`
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const RecordHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${theme.colors.light};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

const RecordMainInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;
`;

const RecordDate = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  font-size: 14px;
`;

const RecordTime = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${theme.colors.textSecondary};
`;

const RecordSummary = styled.div`
  flex: 1;
  margin-left: 20px;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const DiagnosisTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0 0 8px 0;
`;

const DoctorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: ${theme.colors.textSecondary};
`;

const Specialization = styled.span`
  color: ${theme.colors.primary};
  font-weight: 500;
`;

const RecordActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusBadge = styled.span<StatusBadgeProps>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) =>
    props.followUpRequired
      ? theme.colors.warning + "20"
      : theme.colors.success + "20"};
  color: ${(props) =>
    props.followUpRequired ? theme.colors.warning : theme.colors.success};
`;

const ExpandButton = styled.button<ExpandButtonProps>`
  background: none;
  border: none;
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.light};
    color: ${theme.colors.primary};
  }
`;

const RecordDetails = styled.div`
  background: ${theme.colors.light};
  border-top: 1px solid ${theme.colors.border};
  padding: 24px;
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      max-height: 0;
    }
    to {
      opacity: 1;
      max-height: 1000px;
    }
  }
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const DetailsSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid ${theme.colors.border};
`;

const SectionTitle = styled.h4`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid ${theme.colors.border};
`;

const DetailItem = styled.div`
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const DetailValue = styled.div`
  font-size: 14px;
  color: ${theme.colors.textPrimary};
  line-height: 1.4;
`;

const PrescriptionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${theme.colors.info}10;
  border-radius: 6px;
  color: ${theme.colors.info};
  font-weight: 500;
`;

const FollowUpStatus = styled.span<FollowUpStatusProps>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) =>
    props.required ? theme.colors.warning + "20" : theme.colors.success + "20"};
  color: ${(props) =>
    props.required ? theme.colors.warning : theme.colors.success};
`;

const NextAppointment = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: ${theme.colors.primary}10;
  border-radius: 6px;
  color: ${theme.colors.primary};
  font-weight: 500;
  font-size: 13px;
`;

const DoctorDetailsCard = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
`;

const DoctorAvatar = styled.div`
  width: 48px;
  height: 48px;
  background: ${theme.colors.primary}20;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.primary};
  flex-shrink: 0;
`;

const DoctorDetailsInfo = styled.div`
  flex: 1;
`;

const DoctorName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin-bottom: 4px;
`;

const DoctorSpecialization = styled.div`
  font-size: 14px;
  color: ${theme.colors.primary};
  font-weight: 500;
  margin-bottom: 6px;
`;

const DoctorExperience = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  margin-bottom: 6px;
`;

const DoctorQualifications = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  background: ${theme.colors.light};
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  font-weight: 500;
`;

const DoctorContact = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${theme.colors.textSecondary};
`;

const RecordFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid ${theme.colors.border};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
`;

const AppointmentId = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  font-family: monospace;
`;

const RecordFooterActions = styled.div`
  display: flex;
  gap: 8px;
`;

const FooterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.light};
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
  }
`;

const NoResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
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
  color: ${theme.colors.textPrimary};
  margin: 0 0 8px 0;
`;

const NoResultsMessage = styled.p`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  margin: 0;
  max-width: 400px;
  line-height: 1.5;
`;

export default MedicalHistoryDashboard;
