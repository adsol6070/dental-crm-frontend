import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEdit2, FiTrash } from "react-icons/fi";
import {
  usePatients,
  useDeletePatient,
  useUpdatePatientStatus,
} from "@/hooks/useAdmin";
import { Patient } from "@/api/patient/patientTypes";
import { ROUTES } from "@/config/route-paths.config";
import Swal from "sweetalert2";
import { Toaster } from "react-hot-toast";

// Theme configuration
const theme = {
  colors: {
    primary: "#6366f1",
    success: "#10b981",
    danger: "#ef4444",
    warning: "#f59e0b",
  },
};

const AdminPatientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "lastVisit">("name");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use the API hooks with proper error handling
  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
    isError,
  } = usePatients();

  const { mutate: deletePatient, isPending: isDeletingPatient } =
    useDeletePatient();

  const { mutate: updatePatientStatus, isPending: isUpdatingPatientStatus } =
    useUpdatePatientStatus();

  // Extract patients from API response
  const patients = apiResponse?.data?.patients || [];
  const pagination = apiResponse?.pagination;

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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleDelete = async (id: string, patientName: string) => {
    const result = await Swal.fire({
      title: `Delete "${patientName}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      deletePatient(id, {
        onSuccess: () => {
          refetch();
          Swal.fire("Deleted!", "Patient has been deleted.", "success");
        },
        onError: (error: any) => {
          Swal.fire(
            "Error!",
            error.message || "Failed to delete patient.",
            "error"
          );
        },
      });
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: boolean,
    patientName: string
  ) => {
    // Show confirmation dialog with reason input
    const { value: reason, isConfirmed } = await Swal.fire({
      title: `${newStatus ? "Activate" : "Deactivate"} Patient`,
      text: `Are you sure you want to ${
        newStatus ? "activate" : "deactivate"
      } ${patientName}?`,
      input: "textarea",
      inputLabel: "Reason (optional)",
      inputPlaceholder: `Enter reason for ${
        newStatus ? "activating" : "deactivating"
      } this patient...`,
      inputAttributes: {
        "aria-label": "Reason for status change",
      },
      showCancelButton: true,
      confirmButtonText: `Yes, ${newStatus ? "activate" : "deactivate"}!`,
      confirmButtonColor: newStatus
        ? theme.colors.success
        : theme.colors.warning,
      cancelButtonColor: "#6b7280",
    });

    if (isConfirmed) {
      // Show loading state
      Swal.fire({
        title: "Updating Status...",
        text: "Please wait while we update the patient status.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      updatePatientStatus(
        {
          id,
          patientStatusData: {
            isActive: newStatus,
            reason:
              reason ||
              `Patient ${newStatus ? "activated" : "deactivated"} by admin`,
          },
        },
        {
          onSuccess: () => {
            // Close loading and show success
            Swal.fire({
              title: "Success!",
              text: `Patient has been ${
                newStatus ? "activated" : "deactivated"
              } successfully.`,
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
            // Refetch patients to get updated data
            refetch();
          },
          onError: (error: any) => {
            // Handle error
            Swal.fire({
              title: "Error!",
              text: "Failed to update patient status. Please try again.",
              icon: "error",
              confirmButtonColor: theme.colors.primary,
            });
            console.error("Status update error:", error);
          },
        }
      );
    }
  };

  // Client-side filtering and sorting
  const filteredAndSortedPatients = Array.isArray(patients)
    ? patients
        .filter((patient) => {
          const matchesSearch =
            patient.personalInfo.firstName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            patient.personalInfo.lastName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            patient.contactInfo.email
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            patient.patientId.toLowerCase().includes(searchTerm.toLowerCase());

          const matchesStatus =
            filterStatus === "all" ||
            (filterStatus === "active" && patient.isActive !== false) ||
            (filterStatus === "inactive" && patient.isActive === false);

          return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
          switch (sortBy) {
            case "name":
              return `${a.personalInfo.firstName} ${a.personalInfo.lastName}`.localeCompare(
                `${b.personalInfo.firstName} ${b.personalInfo.lastName}`
              );
            case "date":
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            case "lastVisit":
              const aDate = a.statistics?.lastVisit
                ? new Date(a.statistics.lastVisit).getTime()
                : 0;
              const bDate = b.statistics?.lastVisit
                ? new Date(b.statistics.lastVisit).getTime()
                : 0;
              return bDate - aDate;
            default:
              return 0;
          }
        })
    : [];

  const totalPages = Math.ceil(filteredAndSortedPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredAndSortedPatients.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleViewPatient = (patientId: string) => {
    const route = ROUTES.ADMIN.PATIENT_VIEW.replace(":patientId", patientId);
    navigate(route);
  };

  const handleEditPatient = (patientId: string) => {
    const route = ROUTES.ADMIN.EDIT_PATIENT.replace(":patientId", patientId);
    navigate(route);
  };

  const handleNewPatient = () => {
    navigate(ROUTES.ADMIN.CREATE_PATIENT);
  };

  // Handle loading state
  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading patients...</LoadingText>
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
          <ErrorTitle>Failed to load patients</ErrorTitle>
          <ErrorMessage>
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred while fetching patient data."}
          </ErrorMessage>
          <RetryButton onClick={() => refetch()}>
            <RefreshIcon>🔄</RefreshIcon>
            Try Again
          </RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

  // Handle empty state
  if (!patients || patients.length === 0) {
    return (
      <Container>
        <Header>
          <HeaderContent>
            <Title>Patient Management</Title>
            <Subtitle>Manage and view patient information</Subtitle>
          </HeaderContent>
          <HeaderActions>
            <NewPatientButton onClick={handleNewPatient}>
              <PlusIcon>+</PlusIcon>
              New Patient
            </NewPatientButton>
          </HeaderActions>
        </Header>

        <EmptyState>
          <EmptyIcon>👥</EmptyIcon>
          <EmptyTitle>No patients found</EmptyTitle>
          <EmptyMessage>
            {apiResponse?.data
              ? "No patients have been registered yet. Start by creating your first patient!"
              : "Unable to load patient data. Please try refreshing the page."}
          </EmptyMessage>
          <EmptyActions>
            <NewPatientButton onClick={handleNewPatient}>
              <PlusIcon>+</PlusIcon>
              Create First Patient
            </NewPatientButton>
            <RefreshButton onClick={() => refetch()}>
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
      <Toaster position="top-right" />
      <Header>
        <HeaderContent>
          <Title>
            Patient Management
            {pagination?.total && (
              <TotalCount>({pagination.total} total)</TotalCount>
            )}
          </Title>
          <Subtitle>Manage and view patient information</Subtitle>
        </HeaderContent>
        <HeaderActions>
          <RefreshButton onClick={() => refetch()} disabled={isLoading}>
            <RefreshIcon>🔄</RefreshIcon>
            Refresh
          </RefreshButton>
          <NewPatientButton onClick={handleNewPatient}>
            <PlusIcon>+</PlusIcon>
            New Patient
          </NewPatientButton>
        </HeaderActions>
      </Header>

      <Controls>
        <SearchAndFilter>
          <SearchInput
            type="text"
            placeholder="Search patients by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FilterSelect
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as "all" | "active" | "inactive")
            }
          >
            <option value="all">All Patients</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </FilterSelect>
          <SortSelect
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "name" | "date" | "lastVisit")
            }
          >
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Registration Date</option>
            <option value="lastVisit">Sort by Last Visit</option>
          </SortSelect>
        </SearchAndFilter>

        <ResultsInfo>
          Showing {paginatedPatients.length} of{" "}
          {filteredAndSortedPatients.length} patients
          {pagination?.total &&
            filteredAndSortedPatients.length !== pagination.total && (
              <span> (filtered from {pagination.total} total)</span>
            )}
        </ResultsInfo>
      </Controls>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Patient</TableHeaderCell>
              <TableHeaderCell>Contact</TableHeaderCell>
              <TableHeaderCell>Age/Gender</TableHeaderCell>
              <TableHeaderCell>Location</TableHeaderCell>
              <TableHeaderCell>Medical Info</TableHeaderCell>
              <TableHeaderCell>Registration</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPatients.map((patient: Patient) => (
              <TableRow key={patient._id}>
                <TableCell>
                  <PatientInfo>
                    <PatientAvatar>
                      {patient.personalInfo.firstName.charAt(0)}
                      {patient.personalInfo.lastName.charAt(0)}
                    </PatientAvatar>
                    <PatientDetails>
                      <PatientName>
                        {patient.personalInfo.firstName}{" "}
                        {patient.personalInfo.lastName}
                      </PatientName>
                      <PatientId>{patient.patientId}</PatientId>
                      {patient.personalInfo.bloodGroup && (
                        <BloodGroup>
                          {patient.personalInfo.bloodGroup}
                        </BloodGroup>
                      )}
                    </PatientDetails>
                  </PatientInfo>
                </TableCell>

                <TableCell>
                  <ContactInfo>
                    <ContactEmail>{patient.contactInfo.email}</ContactEmail>
                    <ContactPhone>{patient.contactInfo.phone}</ContactPhone>
                    {patient.preferences?.communicationMethod && (
                      <CommunicationMethod>
                        Prefers: {patient.preferences.communicationMethod}
                      </CommunicationMethod>
                    )}
                  </ContactInfo>
                </TableCell>

                <TableCell>
                  <AgeGender>
                    <AgeText>
                      {calculateAge(patient.personalInfo.dateOfBirth)} years
                    </AgeText>
                    <GenderBadge gender={patient.personalInfo.gender}>
                      {patient.personalInfo.gender}
                    </GenderBadge>
                  </AgeGender>
                </TableCell>

                <TableCell>
                  <Location>
                    {patient.contactInfo.address ? (
                      <>
                        <LocationLine>
                          {patient.contactInfo.address.city}
                          {patient.contactInfo.address.state &&
                            `, ${patient.contactInfo.address.state}`}
                        </LocationLine>
                        {patient.contactInfo.address.zipCode && (
                          <ZipCode>
                            {patient.contactInfo.address.zipCode}
                          </ZipCode>
                        )}
                      </>
                    ) : (
                      <NoDataText>No address</NoDataText>
                    )}
                  </Location>
                </TableCell>

                <TableCell>
                  <MedicalInfo>
                    {patient.medicalInfo?.allergies &&
                      patient.medicalInfo.allergies.length > 0 && (
                        <MedicalTag type="allergy">
                          {patient.medicalInfo.allergies.length} Allerg
                          {patient.medicalInfo.allergies.length > 1
                            ? "ies"
                            : "y"}
                        </MedicalTag>
                      )}
                    {patient.medicalInfo?.chronicConditions &&
                      patient.medicalInfo.chronicConditions.length > 0 && (
                        <MedicalTag type="condition">
                          {patient.medicalInfo.chronicConditions.length}{" "}
                          Condition
                          {patient.medicalInfo.chronicConditions.length > 1
                            ? "s"
                            : ""}
                        </MedicalTag>
                      )}
                    {patient.medicalInfo?.currentMedications &&
                      patient.medicalInfo.currentMedications.length > 0 && (
                        <MedicalTag type="medication">
                          {patient.medicalInfo.currentMedications.length} Med
                          {patient.medicalInfo.currentMedications.length > 1
                            ? "s"
                            : ""}
                        </MedicalTag>
                      )}
                    {!patient.medicalInfo?.allergies?.length &&
                      !patient.medicalInfo?.chronicConditions?.length &&
                      !patient.medicalInfo?.currentMedications?.length && (
                        <NoDataText>No medical data</NoDataText>
                      )}
                  </MedicalInfo>
                </TableCell>

                <TableCell>
                  <RegistrationInfo>
                    <RegistrationDate>
                      {formatDate(patient.createdAt)}
                    </RegistrationDate>
                    <RegistrationSource>
                      {patient.registrationSource.replace("-", " ")}
                    </RegistrationSource>
                    {patient.authentication?.isVerified && (
                      <VerificationBadge>✓ Verified</VerificationBadge>
                    )}
                  </RegistrationInfo>
                </TableCell>

                <TableCell>
                  <StatusSelect
                    value={patient.isActive !== false ? "active" : "inactive"}
                    onChange={(e) =>
                      handleStatusChange(
                        patient._id,
                        e.target.value === "active",
                        `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`
                      )
                    }
                    disabled={isUpdatingPatientStatus}
                    active={patient.isActive !== false}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </StatusSelect>
                </TableCell>

                <TableCell>
                  <ActionButtons>
                    <ActionButton
                      variant="view"
                      onClick={() => handleViewPatient(patient._id)}
                      title="View patient details"
                    >
                      <FiEye size={16} />
                    </ActionButton>
                    <ActionButton
                      variant="edit"
                      onClick={() => handleEditPatient(patient._id)}
                      title="Edit patient"
                    >
                      <FiEdit2 size={16} />
                    </ActionButton>
                    <ActionButton
                      variant="delete"
                      onClick={() =>
                        handleDelete(
                          patient._id,
                          `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`
                        )
                      }
                      disabled={isDeletingPatient}
                      title="Delete patient"
                    >
                      <FiTrash size={16} />
                    </ActionButton>
                  </ActionButtons>
                </TableCell>
              </TableRow>
            ))}
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
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </PaginationButton>

          {/* Smart pagination with ellipsis */}
          {[...Array(totalPages)].map((_, i) => {
            const pageNumber = i + 1;
            const isCurrentPage = pageNumber === currentPage;
            const shouldShow =
              pageNumber === 1 ||
              pageNumber === totalPages ||
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);

            if (!shouldShow) {
              if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
                return (
                  <PaginationEllipsis key={pageNumber}>...</PaginationEllipsis>
                );
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
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
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

      {/* Loading overlay for mutations */}
      {(isDeletingPatient || isUpdatingPatientStatus) && (
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>
            {isDeletingPatient
              ? "Deleting patient..."
              : "Updating patient status..."}
          </LoadingText>
        </LoadingOverlay>
      )}
    </Container>
  );
};

// Styled Components (all existing styles remain the same)
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

const NewPatientButton = styled.button`
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
  min-width: 1200px;
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

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
`;

const PatientAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
`;

const PatientDetails = styled.div``;

const PatientName = styled.div`
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  margin-bottom: 2px;
`;

const PatientId = styled.div`
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 2px;
`;

const BloodGroup = styled.div`
  font-size: 10px;
  color: #dc2626;
  font-weight: 500;
  background: #fee2e2;
  padding: 1px 4px;
  border-radius: 3px;
  width: fit-content;
`;

const ContactInfo = styled.div`
  min-width: 180px;
`;

const ContactEmail = styled.div`
  color: #111827;
  font-size: 13px;
  margin-bottom: 2px;
`;

const ContactPhone = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 2px;
`;

const CommunicationMethod = styled.div`
  font-size: 10px;
  color: #059669;
  background: #d1fae5;
  padding: 1px 4px;
  border-radius: 3px;
  width: fit-content;
`;

const AgeGender = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 80px;
`;

const AgeText = styled.div`
  font-weight: 500;
  color: #111827;
`;

const GenderBadge = styled.span<{ gender: string }>`
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${(props) =>
    props.gender === "male"
      ? "#dbeafe"
      : props.gender === "female"
      ? "#fce7f3"
      : "#f3f4f6"};
  color: ${(props) =>
    props.gender === "male"
      ? "#1e40af"
      : props.gender === "female"
      ? "#be185d"
      : "#374151"};
  text-transform: capitalize;
  width: fit-content;
`;

const Location = styled.div`
  color: #374151;
  font-size: 13px;
  min-width: 120px;
`;

const LocationLine = styled.div`
  margin-bottom: 2px;
`;

const ZipCode = styled.div`
  font-size: 11px;
  color: #6b7280;
`;

const MedicalInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 100px;
`;

const MedicalTag = styled.span<{
  type: "allergy" | "condition" | "medication";
}>`
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 3px;
  width: fit-content;
  background: ${(props) =>
    props.type === "allergy"
      ? "#fee2e2"
      : props.type === "condition"
      ? "#fef3c7"
      : "#e0f2fe"};
  color: ${(props) =>
    props.type === "allergy"
      ? "#991b1b"
      : props.type === "condition"
      ? "#92400e"
      : "#0369a1"};
`;

const RegistrationInfo = styled.div`
  min-width: 100px;
`;

const RegistrationDate = styled.div`
  font-size: 12px;
  color: #111827;
  margin-bottom: 2px;
`;

const RegistrationSource = styled.div`
  font-size: 11px;
  color: #6b7280;
  text-transform: capitalize;
  margin-bottom: 2px;
`;

const VerificationBadge = styled.div`
  font-size: 10px;
  color: #059669;
  background: #d1fae5;
  padding: 1px 4px;
  border-radius: 3px;
  width: fit-content;
`;

const StatusSelect = styled.select<{ active: boolean }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid ${(props) => (props.active ? "#10b981" : "#ef4444")};
  background: ${(props) => (props.active ? "#d1fae5" : "#fee2e2")};
  color: ${(props) => (props.active ? "#065f46" : "#991b1b")};
  cursor: pointer;
  min-width: 80px;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  min-width: 120px;
`;

const ActionButton = styled.button<{ variant: "view" | "edit" | "delete" }>`
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) =>
    props.variant === "view"
      ? "#e0f2fe"
      : props.variant === "edit"
      ? "#f0f9ff"
      : "#fee2e2"};
  color: ${(props) =>
    props.variant === "view"
      ? "#0369a1"
      : props.variant === "edit"
      ? "#0284c7"
      : "#dc2626"};

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
  border: 1px solid
    ${(props) => (props.active ? theme.colors.primary : "#d1d5db")};
  background: ${(props) => (props.active ? theme.colors.primary : "white")};
  color: ${(props) => (props.active ? "white" : "#374151")};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 40px;

  &:hover:not(:disabled) {
    background: ${(props) => (props.active ? theme.colors.primary : "#f9fafb")};
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

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
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

const NoDataText = styled.span`
  color: #9ca3af;
  font-size: 12px;
  font-style: italic;
`;

export default AdminPatientList;