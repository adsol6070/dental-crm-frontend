import React, { useState } from "react";
import styled from "styled-components";
import { theme } from "@/config/theme.config";
import { useNavigate } from "react-router-dom";
import {
  FiEye,
  FiTrash,
  FiRefreshCw,
  FiPlus,
  FiClock,
  FiShield,
  FiX,
} from "react-icons/fi";
import { useDoctors, useVerifyDoctor, useDeleteDoctor } from "@/hooks/useAdmin";
import { ROUTES } from "@/config/route-paths.config";
import Swal from "sweetalert2";

// User type for permissions (you can adjust based on your auth system)
type UserType = "admin" | "doctor" | "patient";

interface DoctorListProps {
  userType?: UserType;
}

const DoctorList: React.FC<DoctorListProps> = ({ userType = "admin" }) => {
  const navigate = useNavigate();

  // API Hooks
  const {
    data: doctors = [],
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useDoctors();

  const { mutate: deleteDoctor, isPending: isDeletingDoctor } =
    useDeleteDoctor();
  const { mutate: verifyDoctor, isPending: isVerifyingDoctor } =
    useVerifyDoctor();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [filterSpecialization, setFilterSpecialization] =
    useState<string>("all");
  const [filterAvailability, setFilterAvailability] = useState<
    "all" | "available" | "unavailable"
  >("all");
  const [filterVerification, setFilterVerification] = useState<
    "all" | "verified" | "pending" | "rejected"
  >("all");
  const [sortBy, setSortBy] = useState<
    "name" | "specialization" | "experience" | "rating"
  >("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [verifyingDoctorId, setVerifyingDoctorId] = useState<string | null>(
    null
  );
  const itemsPerPage = 10;

  // Permission check
  const hasPermission = (
    action: "create" | "edit" | "view" | "delete" | "verify"
  ) => {
    switch (userType) {
      case "admin":
        return true; // Admin has all permissions
      case "doctor":
        return ["view"].includes(action); // Doctors can only view
      case "patient":
        return ["view"].includes(action); // Patients can only view
      default:
        return false;
    }
  };

  // Route generation based on user type
  const getRoutes = () => {
    switch (userType) {
      case "admin":
        return {
          create: ROUTES.ADMIN.CREATE_DOCTOR,
          view: ROUTES.ADMIN.DOCTOR_VIEW || "/admin/doctors/view",
          list: ROUTES.ADMIN.DOCTOR_LIST,
        };
      case "doctor":
        return {
          create: null,
          edit: null,
          view: ROUTES.DOCTOR.PROFILE || "/doctor/profile",
          list: ROUTES.DOCTOR.PATIENTS,
        };
      case "patient":
        return {
          create: null,
          edit: null,
          view: "/patient/doctors/view",
          list: null,
        };
      default:
        return {
          create: null,
          edit: null,
          view: null,
          list: null,
        };
    }
  };

  const routes = getRoutes();

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getSpecializations = (): string[] => {
    const specializations = [
      ...new Set(
        doctors.map((doctor) => doctor.professionalInfo.specialization)
      ),
    ];
    return specializations.sort();
  };

  // Get verification status display
  const getVerificationStatus = (doctor: any) => {
    if (doctor.isVerifiedByAdmin === true) {
      return "verified";
    } else if (doctor.isVerifiedByAdmin === false) {
      return "rejected";
    } else {
      return "pending";
    }
  };

  // Get verification stats for admin dashboard
  const getVerificationStats = () => {
    const verifiedCount = doctors.filter(
      (doctor) => doctor.isVerifiedByAdmin === true
    ).length;
    const pendingCount = doctors.filter(
      (doctor) =>
        doctor.isVerifiedByAdmin === null ||
        doctor.isVerifiedByAdmin === undefined
    ).length;
    const rejectedCount = doctors.filter(
      (doctor) => doctor.isVerifiedByAdmin === false
    ).length;
    return { verifiedCount, pendingCount, rejectedCount };
  };

  const { verifiedCount, pendingCount, rejectedCount } = getVerificationStats();

  // Handle verification status change
  const handleVerificationChange = async (
    doctorId: string,
    newStatus: string,
    doctorName: string
  ) => {
    if (!hasPermission("verify")) {
      Swal.fire({
        title: "Access Denied",
        text: "You do not have permission to verify doctors.",
        icon: "error",
      });
      return;
    }

    const statusText =
      newStatus === "verified"
        ? "verify"
        : newStatus === "rejected"
        ? "reject"
        : "set to pending";
    const statusColor =
      newStatus === "verified"
        ? "#10b981"
        : newStatus === "rejected"
        ? "#ef4444"
        : "#f59e0b";

    // Show confirmation dialog with reason input
    const { value: reason, isConfirmed } = await Swal.fire({
      title: `${
        statusText.charAt(0).toUpperCase() + statusText.slice(1)
      } Doctor`,
      text: `Are you sure you want to ${statusText} "${doctorName}"?`,
      input: "textarea",
      inputLabel: "Reason (optional)",
      inputPlaceholder: `Enter reason for ${statusText}...`,
      inputAttributes: {
        "aria-label": "Reason for verification status change",
      },
      showCancelButton: true,
      confirmButtonText: `Yes, ${statusText}!`,
      confirmButtonColor: statusColor,
      cancelButtonColor: "#6b7280",
      inputValidator: () => {
        // Optional: You can make reason required by uncommenting below
        // if (!value) {
        //   return 'You need to provide a reason!'
        // }
      },
    });

    if (isConfirmed) {
      setVerifyingDoctorId(doctorId);

      try {
        // Call the API with the correct payload structure
        await verifyDoctor({
          id: doctorId,
          doctorVerificationData: {
            verificationStatus: newStatus,
            reason: reason || `Doctor ${statusText} by admin`,
          },
        });

        // Show success message
        Swal.fire({
          title: "Success!",
          text: `Doctor has been ${statusText} successfully.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        // Refetch doctors to get updated data
        refetch();
      } catch (error) {
        // Handle error
        Swal.fire({
          title: "Error!",
          text: `Failed to ${statusText} doctor. Please try again.`,
          icon: "error",
          confirmButtonColor: theme.colors.primary,
        });
        console.error("Verification error:", error);
      } finally {
        setVerifyingDoctorId(null);
      }
    }
  };

  // Enhanced filtering with verification status
  const filteredAndSortedDoctors = doctors
    .filter((doctor) => {
      const fullName = `${doctor.personalInfo.firstName} ${doctor.personalInfo.lastName}`;
      const matchesSearch =
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.personalInfo.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        doctor.doctorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.professionalInfo.specialization
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        doctor.professionalInfo.licenseNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && doctor.isActive) ||
        (filterStatus === "inactive" && !doctor.isActive);

      const matchesSpecialization =
        filterSpecialization === "all" ||
        doctor.professionalInfo.specialization === filterSpecialization;

      const matchesAvailability =
        filterAvailability === "all" ||
        (filterAvailability === "available" &&
          doctor.availability.isAvailable) ||
        (filterAvailability === "unavailable" &&
          !doctor.availability.isAvailable);

      const doctorVerificationStatus = getVerificationStatus(doctor);
      const matchesVerification =
        filterVerification === "all" ||
        doctorVerificationStatus === filterVerification;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSpecialization &&
        matchesAvailability &&
        matchesVerification
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          const nameA = `${a.personalInfo.firstName} ${a.personalInfo.lastName}`;
          const nameB = `${b.personalInfo.firstName} ${b.personalInfo.lastName}`;
          return nameA.localeCompare(nameB);
        case "specialization":
          return a.professionalInfo.specialization.localeCompare(
            b.professionalInfo.specialization
          );
        case "experience":
          return b.professionalInfo.experience - a.professionalInfo.experience;
        case "rating":
          return b.statistics.rating - a.statistics.rating;
        default:
          return 0;
      }
    });

  const totalPages = Math.ceil(filteredAndSortedDoctors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDoctors = filteredAndSortedDoctors.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleViewDoctor = (doctorId: string) => {
    if (!hasPermission("view") || !routes.view) {
      Swal.fire({
        title: "Access Denied",
        text: "You do not have permission to view doctor details.",
        icon: "error",
      });
      return;
    }

    const route = routes.view.replace(":doctorId", doctorId);
    navigate(route);
  };

  const handleDeleteDoctor = async (doctorId: string, doctorName: string) => {
    if (!hasPermission("delete")) {
      Swal.fire({
        title: "Access Denied",
        text: "You do not have permission to delete doctors.",
        icon: "error",
      });
      return;
    }

    const result = await Swal.fire({
      title: `Delete "${doctorName}"?`,
      text: "This action cannot be undone. All doctor data will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete doctor!",
    });

    if (result.isConfirmed) {
      deleteDoctor(doctorId, {
        onSuccess: () => {
          Swal.fire({
            title: "Deleted!",
            text: "Doctor has been deleted successfully.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        },
        onError: (error) => {
          Swal.fire({
            title: "Error!",
            text: "Failed to delete doctor. Please try again.",
            icon: "error",
          });
          console.error("Delete error:", error);
        },
      });
    }
  };

  const handleNewDoctor = () => {
    if (!hasPermission("create") || !routes.create) {
      Swal.fire({
        title: "Access Denied",
        text: "You do not have permission to create doctors.",
        icon: "error",
      });
      return;
    }

    navigate(routes.create);
  };

  const handleRefresh = () => {
    refetch();
  };

  // Page title based on user type
  const getPageTitle = () => {
    switch (userType) {
      case "admin":
        return "Doctor Management";
      case "doctor":
        return "Medical Staff";
      case "patient":
        return "Our Doctors";
      default:
        return "Doctors";
    }
  };

  const getPageSubtitle = () => {
    switch (userType) {
      case "admin":
        return "Manage medical staff and their verification status";
      case "doctor":
        return "View medical staff directory";
      case "patient":
        return "Find and view our medical professionals";
      default:
        return "Medical staff directory";
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading doctors...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  // Error state
  if (isError) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Failed to Load Doctors</ErrorTitle>
          <ErrorMessage>
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred while fetching doctor data."}
          </ErrorMessage>
          <RetryButton onClick={handleRefresh}>
            <FiRefreshCw size={16} />
            Try Again
          </RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

  // Empty state
  if (!doctors || doctors.length === 0) {
    return (
      <Container>
        <Header>
          <HeaderContent>
            <Title>{getPageTitle()}</Title>
            <Subtitle>{getPageSubtitle()}</Subtitle>
          </HeaderContent>
          <HeaderActions>
            <RefreshButton onClick={handleRefresh}>
              <FiRefreshCw size={16} />
              Refresh
            </RefreshButton>
            {hasPermission("create") && routes.create && (
              <NewDoctorButton onClick={handleNewDoctor}>
                <FiPlus size={16} />
                New Doctor
              </NewDoctorButton>
            )}
          </HeaderActions>
        </Header>

        <EmptyState>
          <EmptyIcon>👨‍⚕️</EmptyIcon>
          <EmptyTitle>No Doctors Found</EmptyTitle>
          <EmptyMessage>
            {userType === "admin"
              ? "No doctors have been registered yet. Start by adding your first doctor!"
              : "No doctors are currently available."}
          </EmptyMessage>
          <EmptyActions>
            {hasPermission("create") && routes.create && (
              <NewDoctorButton onClick={handleNewDoctor}>
                <FiPlus size={16} />
                Add First Doctor
              </NewDoctorButton>
            )}
            <RefreshButton onClick={handleRefresh}>
              <FiRefreshCw size={16} />
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
            {getPageTitle()}
            <TotalCount>({doctors.length} total)</TotalCount>
          </Title>
          <Subtitle>{getPageSubtitle()}</Subtitle>
          {userType === "admin" && (
            <VerificationStats>
              <VerificationStat verified>
                <FiShield size={14} />
                {verifiedCount} Verified
              </VerificationStat>
              <VerificationStat pending>
                <FiClock size={14} />
                {pendingCount} Pending
              </VerificationStat>
              <VerificationStat rejected>
                <FiX size={14} />
                {rejectedCount} Rejected
              </VerificationStat>
            </VerificationStats>
          )}
        </HeaderContent>
        <HeaderActions>
          <RefreshButton onClick={handleRefresh} disabled={loading}>
            <FiRefreshCw size={16} />
            Refresh
          </RefreshButton>
          {hasPermission("create") && routes.create && (
            <NewDoctorButton onClick={handleNewDoctor}>
              <FiPlus size={16} />
              New Doctor
            </NewDoctorButton>
          )}
        </HeaderActions>
      </Header>

      <Controls>
        <SearchAndFilter>
          <SearchInput
            type="text"
            placeholder="Search doctors by name, email, license, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FilterSelect
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as "all" | "active" | "inactive")
            }
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </FilterSelect>
          <FilterSelect
            value={filterSpecialization}
            onChange={(e) => setFilterSpecialization(e.target.value)}
          >
            <option value="all">All Specializations</option>
            {getSpecializations().map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            value={filterAvailability}
            onChange={(e) =>
              setFilterAvailability(
                e.target.value as "all" | "available" | "unavailable"
              )
            }
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </FilterSelect>
          {userType === "admin" && (
            <FilterSelect
              value={filterVerification}
              onChange={(e) =>
                setFilterVerification(
                  e.target.value as "all" | "verified" | "pending" | "rejected"
                )
              }
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </FilterSelect>
          )}
          <SortSelect
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as
                  | "name"
                  | "specialization"
                  | "experience"
                  | "rating"
              )
            }
          >
            <option value="name">Sort by Name</option>
            <option value="specialization">Sort by Specialization</option>
            <option value="experience">Sort by Experience</option>
            <option value="rating">Sort by Rating</option>
          </SortSelect>
        </SearchAndFilter>

        <ResultsInfo>
          Showing {paginatedDoctors.length} of {filteredAndSortedDoctors.length}{" "}
          doctors
          {filteredAndSortedDoctors.length !== doctors.length && (
            <span> (filtered from {doctors.length} total)</span>
          )}
        </ResultsInfo>
      </Controls>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Doctor</TableHeaderCell>
              <TableHeaderCell>Specialization</TableHeaderCell>
              <TableHeaderCell>Experience</TableHeaderCell>
              <TableHeaderCell>Contact</TableHeaderCell>
              <TableHeaderCell>Fees</TableHeaderCell>
              <TableHeaderCell>Rating</TableHeaderCell>
              <TableHeaderCell>Availability</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              {userType === "admin" && (
                <TableHeaderCell>Verification</TableHeaderCell>
              )}
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDoctors.map((doctor) => {
              const verificationStatus = getVerificationStatus(doctor);
              return (
                <TableRow key={doctor._id}>
                  <TableCell>
                    <DoctorInfo>
                      <DoctorAvatar>
                        {doctor.personalInfo.firstName.charAt(0)}
                        {doctor.personalInfo.lastName.charAt(0)}
                        {verificationStatus === "verified" && (
                          <VerificationBadge>
                            <FiShield size={10} />
                          </VerificationBadge>
                        )}
                      </DoctorAvatar>
                      <DoctorDetails>
                        <DoctorName>
                          {doctor.personalInfo.firstName}{" "}
                          {doctor.personalInfo.lastName}
                          {verificationStatus === "verified" && (
                            <VerifiedIcon title="Verified by Admin">
                              <FiShield size={12} />
                            </VerifiedIcon>
                          )}
                        </DoctorName>
                        <DoctorId>{doctor.doctorId}</DoctorId>
                        <LicenseNumber>
                          License: {doctor.professionalInfo.licenseNumber}
                        </LicenseNumber>
                      </DoctorDetails>
                    </DoctorInfo>
                  </TableCell>

                  <TableCell>
                    <SpecializationInfo>
                      <Specialization>
                        {doctor.professionalInfo.specialization}
                      </Specialization>
                      {doctor.professionalInfo.department && (
                        <Department>
                          {doctor.professionalInfo.department}
                        </Department>
                      )}
                      <QualificationCount>
                        {doctor.professionalInfo.qualifications.length}{" "}
                        qualification
                        {doctor.professionalInfo.qualifications.length !== 1
                          ? "s"
                          : ""}
                      </QualificationCount>
                    </SpecializationInfo>
                  </TableCell>

                  <TableCell>
                    <ExperienceInfo>
                      <ExperienceYears>
                        {doctor.professionalInfo.experience} years
                      </ExperienceYears>
                      <JoinedDate>
                        Joined {formatDate(doctor.createdAt)}
                      </JoinedDate>
                    </ExperienceInfo>
                  </TableCell>

                  <TableCell>
                    <ContactInfo>
                      <ContactEmail>{doctor.personalInfo.email}</ContactEmail>
                      <ContactPhone>{doctor.personalInfo.phone}</ContactPhone>
                    </ContactInfo>
                  </TableCell>

                  <TableCell>
                    <FeesInfo>
                      <ConsultationFee>
                        ₹{doctor.fees.consultationFee}
                      </ConsultationFee>
                      {doctor.fees.followUpFee && (
                        <FollowUpFee>
                          Follow-up: ₹{doctor.fees.followUpFee}
                        </FollowUpFee>
                      )}
                      {doctor.fees.emergencyFee && (
                        <EmergencyFee>
                          Emergency: ₹{doctor.fees.emergencyFee}
                        </EmergencyFee>
                      )}
                    </FeesInfo>
                  </TableCell>

                  <TableCell>
                    <RatingInfo>
                      <Rating>
                        <StarIcon>⭐</StarIcon>
                        {doctor.statistics.rating.toFixed(1)}
                      </Rating>
                      <ReviewCount>
                        {doctor.statistics.reviewCount} reviews
                      </ReviewCount>
                      <AppointmentStats>
                        {doctor.statistics.completedAppointments}/
                        {doctor.statistics.totalAppointments} completed
                      </AppointmentStats>
                    </RatingInfo>
                  </TableCell>

                  <TableCell>
                    <AvailabilityInfo>
                      <AvailabilityBadge
                        available={doctor.availability.isAvailable}
                      >
                        {doctor.availability.isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </AvailabilityBadge>
                      <MaxAppointments>
                        Max {doctor.availability.maxAppointmentsPerDay}/day
                      </MaxAppointments>
                    </AvailabilityInfo>
                  </TableCell>

                  <TableCell>
                    <StatusBadge active={doctor.isActive}>
                      {doctor.isActive ? "Active" : "Inactive"}
                    </StatusBadge>
                  </TableCell>

                  {userType === "admin" && (
                    <TableCell>
                      <VerificationCell>
                        <VerificationSelect
                          value={verificationStatus}
                          onChange={(e) =>
                            handleVerificationChange(
                              doctor._id,
                              e.target.value,
                              `${doctor.personalInfo.firstName} ${doctor.personalInfo.lastName}`
                            )
                          }
                          disabled={verifyingDoctorId === doctor._id}
                          status={verificationStatus}
                        >
                          <option value="verified">Verified</option>
                          <option value="rejected">Rejected</option>
                        </VerificationSelect>
                      </VerificationCell>
                    </TableCell>
                  )}

                  <TableCell>
                    <ActionButtons>
                      {hasPermission("view") && routes.view && (
                        <ActionButton
                          variant="view"
                          onClick={() => handleViewDoctor(doctor._id)}
                          title="View doctor details"
                        >
                          <FiEye size={14} />
                        </ActionButton>
                      )}
                      {hasPermission("delete") && (
                        <ActionButton
                          variant="delete"
                          onClick={() =>
                            handleDeleteDoctor(
                              doctor._id,
                              `${doctor.personalInfo.firstName} ${doctor.personalInfo.lastName}`
                            )
                          }
                          disabled={isDeletingDoctor}
                          title="Delete doctor"
                        >
                          <FiTrash size={14} />
                        </ActionButton>
                      )}
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
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </PaginationButton>

          {/* Smart pagination */}
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

      {/* Loading overlay for operations */}
      {(isDeletingDoctor || isVerifyingDoctor) && (
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>
            {isDeletingDoctor
              ? "Deleting doctor..."
              : "Processing verification..."}
          </LoadingText>
        </LoadingOverlay>
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
  margin: 0 0 8px 0;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const VerificationStats = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

const VerificationStat = styled.div<{
  verified?: boolean;
  pending?: boolean;
  rejected?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
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

const NewDoctorButton = styled.button`
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

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
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
    padding: 16px 20px;
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchAndFilter = styled.div`
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 300px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    min-width: auto;
    width: 100%;
  }
`;

const SearchInput = styled.input`
  flex: 2;
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

  @media (max-width: 768px) {
    flex: 1;
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

  @media (max-width: 768px) {
    min-width: auto;
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

  @media (max-width: 768px) {
    min-width: auto;
  }
`;

const ResultsInfo = styled.div`
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;

  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
  }
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
  vertical-align: top;
`;

const DoctorInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 200px;
`;

const DoctorAvatar = styled.div`
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
  flex-shrink: 0;
  position: relative;
`;

const VerificationBadge = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
`;

const DoctorDetails = styled.div`
  min-width: 0;
`;

const DoctorName = styled.div`
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const VerifiedIcon = styled.span`
  color: #10b981;
  display: flex;
  align-items: center;
`;

const DoctorId = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 1px;
`;

const LicenseNumber = styled.div`
  font-size: 11px;
  color: #9ca3af;
`;

const SpecializationInfo = styled.div`
  min-width: 150px;
`;

const Specialization = styled.div`
  font-weight: 500;
  color: #111827;
  margin-bottom: 2px;
`;

const Department = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 2px;
`;

const QualificationCount = styled.div`
  font-size: 11px;
  color: #9ca3af;
`;

const ExperienceInfo = styled.div`
  min-width: 120px;
`;

const ExperienceYears = styled.div`
  font-weight: 500;
  color: ${theme.colors.primary};
  margin-bottom: 2px;
`;

const JoinedDate = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const ContactInfo = styled.div`
  min-width: 180px;
`;

const ContactEmail = styled.div`
  color: #111827;
  margin-bottom: 2px;
  font-size: 13px;
`;

const ContactPhone = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const FeesInfo = styled.div`
  min-width: 100px;
`;

const ConsultationFee = styled.div`
  font-weight: 500;
  color: #111827;
  margin-bottom: 2px;
`;

const FollowUpFee = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 1px;
`;

const EmergencyFee = styled.div`
  font-size: 12px;
  color: #dc2626;
`;

const RatingInfo = styled.div`
  min-width: 120px;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 2px;
`;

const StarIcon = styled.span`
  font-size: 12px;
`;

const ReviewCount = styled.div`
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 2px;
`;

const AppointmentStats = styled.div`
  font-size: 11px;
  color: #9ca3af;
`;

const AvailabilityInfo = styled.div`
  min-width: 100px;
`;

const AvailabilityBadge = styled.span<{ available: boolean }>`
  padding: 3px 6px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background: ${(props) => (props.available ? "#d1fae5" : "#fee2e2")};
  color: ${(props) => (props.available ? "#065f46" : "#991b1b")};
  display: inline-block;
  margin-bottom: 4px;
`;

const MaxAppointments = styled.div`
  font-size: 11px;
  color: #6b7280;
`;

const StatusBadge = styled.span<{ active: boolean }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) => (props.active ? "#d1fae5" : "#fee2e2")};
  color: ${(props) => (props.active ? "#065f46" : "#991b1b")};
`;

const VerificationCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 120px;
`;

const VerificationSelect = styled.select<{
  status: "verified" | "pending" | "rejected";
}>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid
    ${(props) =>
      props.status === "verified"
        ? "#10b981"
        : props.status === "pending"
        ? "#f59e0b"
        : "#ef4444"};
  background: ${(props) =>
    props.status === "verified"
      ? "#d1fae5"
      : props.status === "pending"
      ? "#fef3c7"
      : "#fee2e2"};
  color: ${(props) =>
    props.status === "verified"
      ? "#065f46"
      : props.status === "pending"
      ? "#92400e"
      : "#991b1b"};
  cursor: pointer;
  min-width: 100px;
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

export default DoctorList;
