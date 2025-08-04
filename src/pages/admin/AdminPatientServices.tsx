import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  FiEye,
  FiEdit2,
  FiTrash,
  FiPlus,
  FiSearch,
  FiFilter,
  FiDownload,
  FiCalendar,
  FiUser,
  FiDollarSign,
  FiClock,
} from "react-icons/fi";
import { MdMedicalServices } from "react-icons/md";
import { ROUTES } from "@/config/route-paths.config";
import { theme } from "@/config/theme.config";
import Swal from "sweetalert2";

// Mock data - replace with actual API hooks
const mockPatientServices = [
  {
    _id: "1",
    patient: {
      _id: "p1",
      name: "John Smith",
      patientId: "PAT-001",
      email: "john.smith@email.com",
      phone: "+91 9876543210",
    },
    service: {
      _id: "s1",
      name: "General Consultation",
      category: "General Dentistry",
      price: 150,
      duration: 30,
    },
    doctor: {
      _id: "d1",
      name: "Dr. Sarah Johnson",
      specialization: "General Dentistry",
    },
    appointmentDate: "2024-02-15T10:00:00Z",
    status: "completed",
    totalCost: 150,
    paymentStatus: "paid",
    notes: "Regular check-up completed successfully",
    createdAt: "2024-02-10T09:00:00Z",
    completedAt: "2024-02-15T10:30:00Z",
  },
  {
    _id: "2",
    patient: {
      _id: "p2",
      name: "Emily Davis",
      patientId: "PAT-002",
      email: "emily.davis@email.com",
      phone: "+91 9876543211",
    },
    service: {
      _id: "s2",
      name: "Teeth Cleaning",
      category: "General Dentistry",
      price: 80,
      duration: 45,
    },
    doctor: {
      _id: "d2",
      name: "Dr. Michael Brown",
      specialization: "Dental Hygienist",
    },
    appointmentDate: "2024-02-16T14:00:00Z",
    status: "scheduled",
    totalCost: 80,
    paymentStatus: "pending",
    notes: "Patient requested deep cleaning",
    createdAt: "2024-02-12T11:30:00Z",
    completedAt: null,
  },
  {
    _id: "3",
    patient: {
      _id: "p3",
      name: "Michael Johnson",
      patientId: "PAT-003",
      email: "michael.johnson@email.com",
      phone: "+91 9876543212",
    },
    service: {
      _id: "s3",
      name: "Root Canal Treatment",
      category: "Specialized Dental Services",
      price: 500,
      duration: 90,
    },
    doctor: {
      _id: "d3",
      name: "Dr. Lisa Wilson",
      specialization: "Endodontist",
    },
    appointmentDate: "2024-02-12T16:00:00Z",
    status: "completed",
    totalCost: 500,
    paymentStatus: "paid",
    notes: "Root canal treatment completed in single session",
    createdAt: "2024-02-08T13:45:00Z",
    completedAt: "2024-02-12T17:30:00Z",
  },
  {
    _id: "4",
    patient: {
      _id: "p4",
      name: "Sarah Brown",
      patientId: "PAT-004",
      email: "sarah.brown@email.com",
      phone: "+91 9876543213",
    },
    service: {
      _id: "s4",
      name: "Teeth Whitening",
      category: "Cosmetic Dentistry",
      price: 200,
      duration: 60,
    },
    doctor: {
      _id: "d4",
      name: "Dr. David Miller",
      specialization: "Cosmetic Dentist",
    },
    appointmentDate: "2024-02-14T11:00:00Z",
    status: "cancelled",
    totalCost: 200,
    paymentStatus: "refunded",
    notes: "Patient cancelled due to scheduling conflict",
    createdAt: "2024-02-09T15:20:00Z",
    completedAt: null,
  },
  {
    _id: "5",
    patient: {
      _id: "p1",
      name: "John Smith",
      patientId: "PAT-001",
      email: "john.smith@email.com",
      phone: "+91 9876543210",
    },
    service: {
      _id: "s5",
      name: "Dental Implant",
      category: "Oral Surgery",
      price: 1200,
      duration: 120,
    },
    doctor: {
      _id: "d5",
      name: "Dr. Robert Taylor",
      specialization: "Oral Surgeon",
    },
    appointmentDate: "2024-02-20T09:00:00Z",
    status: "scheduled",
    totalCost: 1200,
    paymentStatus: "partial",
    notes: "Pre-surgical consultation completed",
    createdAt: "2024-02-13T10:15:00Z",
    completedAt: null,
  },
];

const AdminPatientServices = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "scheduled" | "completed" | "cancelled"
  >("all");
  const [filterPayment, setFilterPayment] = useState<
    "all" | "paid" | "pending" | "partial" | "refunded"
  >("all");
  const [sortBy, setSortBy] = useState<"date" | "patient" | "service" | "cost">(
    "date"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isLoading] = useState(false);
  const itemsPerPage = 10;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-IN", {
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

  const handleViewPatientServices = (patientId: string) => {
    const route = ROUTES.ADMIN.PATIENT_VIEW.replace(":patientId", patientId);
    navigate(route);
  };

  const handleEditService = (serviceId: string) => {
    // Navigate to edit appointment or service assignment
    navigate(`/admin/appointments/edit/${serviceId}`);
  };

  const handleDeleteService = async (
    id: string,
    patientName: string,
    serviceName: string
  ) => {
    const result = await Swal.fire({
      title: "Remove Service Assignment?",
      text: `Remove "${serviceName}" from ${patientName}'s records?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!",
    });

    if (result.isConfirmed) {
      // TODO: Implement delete service assignment API call
      console.log("Removing service assignment:", id);
      Swal.fire({
        title: "Success!",
        text: "Service assignment has been removed successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleBulkAction = (action: "export" | "report" | "delete") => {
    if (selectedServices.length === 0) {
      Swal.fire({
        title: "No Services Selected",
        text: "Please select one or more services to perform this action.",
        icon: "warning",
      });
      return;
    }

    switch (action) {
      case "export":
        // TODO: Implement bulk export
        console.log("Exporting services:", selectedServices);
        Swal.fire({
          title: "Export Started",
          text: `Exporting ${selectedServices.length} service records...`,
          icon: "info",
          timer: 2000,
          showConfirmButton: false,
        });
        break;
      case "report":
        navigate(
          ROUTES.ADMIN.BULK_REPORTS + `?services=${selectedServices.join(",")}`
        );
        break;
      case "delete":
        Swal.fire({
          title: "Bulk Delete",
          text: `Are you sure you want to remove ${selectedServices.length} service assignments?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          confirmButtonText: "Yes, remove them!",
        }).then((result) => {
          if (result.isConfirmed) {
            // TODO: Implement bulk delete
            console.log("Bulk deleting services:", selectedServices);
            setSelectedServices([]);
            Swal.fire({
              title: "Success!",
              text: "Selected services have been removed.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
          }
        });
        break;
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedServices(paginatedServices.map((service) => service._id));
    } else {
      setSelectedServices([]);
    }
  };

  const handleSelectService = (serviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedServices((prev) => [...prev, serviceId]);
    } else {
      setSelectedServices((prev) => prev.filter((id) => id !== serviceId));
    }
  };

  const handleBackToServices = () => {
    navigate(ROUTES.ADMIN.SERVICES_LIST);
  };

  // Client-side filtering and sorting
  const filteredAndSortedServices = mockPatientServices
    .filter((service) => {
      const matchesSearch =
        service.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.patient.patientId
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        service.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.doctor.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || service.status === filterStatus;
      const matchesPayment =
        filterPayment === "all" || service.paymentStatus === filterPayment;

      return matchesSearch && matchesStatus && matchesPayment;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(b.appointmentDate).getTime() -
            new Date(a.appointmentDate).getTime()
          );
        case "patient":
          return a.patient.name.localeCompare(b.patient.name);
        case "service":
          return a.service.name.localeCompare(b.service.name);
        case "cost":
          return b.totalCost - a.totalCost;
        default:
          return 0;
      }
    });

  const totalPages = Math.ceil(filteredAndSortedServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedServices = filteredAndSortedServices.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Calculate summary statistics
  const summaryStats = {
    total: mockPatientServices.length,
    completed: mockPatientServices.filter((s) => s.status === "completed")
      .length,
    scheduled: mockPatientServices.filter((s) => s.status === "scheduled")
      .length,
    cancelled: mockPatientServices.filter((s) => s.status === "cancelled")
      .length,
    totalRevenue: mockPatientServices
      .filter((s) => s.paymentStatus === "paid")
      .reduce((sum, s) => sum + s.totalCost, 0),
    pendingRevenue: mockPatientServices
      .filter((s) => s.paymentStatus === "pending")
      .reduce((sum, s) => sum + s.totalCost, 0),
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <BackLink onClick={handleBackToServices}>← Back to Services</BackLink>
          <Title>
            <MdMedicalServices size={28} />
            Patient Services
            <TotalCount>({summaryStats.total} assignments)</TotalCount>
          </Title>
          <Subtitle>
            Manage patient service assignments and track treatment progress
          </Subtitle>
        </HeaderContent>
        <HeaderActions>
          <ActionButton
            variant="secondary"
            onClick={() => handleBulkAction("report")}
          >
            <FiDownload size={16} />
            Bulk Reports
          </ActionButton>
          <ActionButton
            onClick={() => navigate(ROUTES.ADMIN.CREATE_APPOINTMENT)}
          >
            <FiPlus size={16} />
            Assign Service
          </ActionButton>
        </HeaderActions>
      </Header>

      <SummaryCards>
        <SummaryCard>
          <SummaryIcon>
            <MdMedicalServices size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>{summaryStats.total}</SummaryValue>
            <SummaryLabel>Total Assignments</SummaryLabel>
            <SummarySubtext>
              {summaryStats.completed} completed, {summaryStats.scheduled}{" "}
              scheduled
            </SummarySubtext>
          </SummaryContent>
        </SummaryCard>

        <SummaryCard>
          <SummaryIcon>
            <FiDollarSign size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>
              {formatCurrency(summaryStats.totalRevenue)}
            </SummaryValue>
            <SummaryLabel>Revenue Collected</SummaryLabel>
            <SummarySubtext>From completed services</SummarySubtext>
          </SummaryContent>
        </SummaryCard>

        <SummaryCard>
          <SummaryIcon>
            <FiClock size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>
              {formatCurrency(summaryStats.pendingRevenue)}
            </SummaryValue>
            <SummaryLabel>Pending Revenue</SummaryLabel>
            <SummarySubtext>From scheduled services</SummarySubtext>
          </SummaryContent>
        </SummaryCard>

        <SummaryCard>
          <SummaryIcon>
            <FiUser size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>
              {new Set(mockPatientServices.map((s) => s.patient._id)).size}
            </SummaryValue>
            <SummaryLabel>Unique Patients</SummaryLabel>
            <SummarySubtext>Served this period</SummarySubtext>
          </SummaryContent>
        </SummaryCard>
      </SummaryCards>

      <Controls>
        <SearchAndFilter>
          <SearchInputContainer>
            <FiSearch size={16} />
            <SearchInput
              type="text"
              placeholder="Search by patient, service, or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInputContainer>

          <FilterSelect
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </FilterSelect>

          <FilterSelect
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value as any)}
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="refunded">Refunded</option>
          </FilterSelect>

          <SortSelect
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="date">Sort by Date</option>
            <option value="patient">Sort by Patient</option>
            <option value="service">Sort by Service</option>
            <option value="cost">Sort by Cost</option>
          </SortSelect>
        </SearchAndFilter>

        <BulkActions>
          {selectedServices.length > 0 && (
            <>
              <BulkActionButton onClick={() => handleBulkAction("export")}>
                <FiDownload size={14} />
                Export ({selectedServices.length})
              </BulkActionButton>
              <BulkActionButton onClick={() => handleBulkAction("report")}>
                <FiFilter size={14} />
                Generate Report
              </BulkActionButton>
              <BulkActionButton
                variant="danger"
                onClick={() => handleBulkAction("delete")}
              >
                <FiTrash size={14} />
                Remove Selected
              </BulkActionButton>
            </>
          )}
          <ResultsInfo>
            Showing {paginatedServices.length} of{" "}
            {filteredAndSortedServices.length} services
          </ResultsInfo>
        </BulkActions>
      </Controls>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>
                <Checkbox
                  type="checkbox"
                  checked={
                    selectedServices.length === paginatedServices.length &&
                    paginatedServices.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableHeaderCell>
              <TableHeaderCell>Patient</TableHeaderCell>
              <TableHeaderCell>Service</TableHeaderCell>
              <TableHeaderCell>Doctor</TableHeaderCell>
              <TableHeaderCell>Appointment</TableHeaderCell>
              <TableHeaderCell>Cost & Payment</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedServices.map((service) => (
              <TableRow key={service._id}>
                <TableCell>
                  <Checkbox
                    type="checkbox"
                    checked={selectedServices.includes(service._id)}
                    onChange={(e) =>
                      handleSelectService(service._id, e.target.checked)
                    }
                  />
                </TableCell>

                <TableCell>
                  <PatientInfo>
                    <PatientAvatar>
                      {service.patient.name
                        .split(" ")
                        .map((n) => n.charAt(0))
                        .join("")}
                    </PatientAvatar>
                    <PatientDetails>
                      <PatientName>{service.patient.name}</PatientName>
                      <PatientId>{service.patient.patientId}</PatientId>
                      <PatientContact>{service.patient.email}</PatientContact>
                    </PatientDetails>
                  </PatientInfo>
                </TableCell>

                <TableCell>
                  <ServiceInfo>
                    <ServiceName>{service.service.name}</ServiceName>
                    <ServiceCategory>
                      {service.service.category}
                    </ServiceCategory>
                    <ServiceDuration>
                      <FiClock size={12} />
                      {service.service.duration} mins
                    </ServiceDuration>
                  </ServiceInfo>
                </TableCell>

                <TableCell>
                  <DoctorInfo>
                    <DoctorName>{service.doctor.name}</DoctorName>
                    <DoctorSpecialization>
                      {service.doctor.specialization}
                    </DoctorSpecialization>
                  </DoctorInfo>
                </TableCell>

                <TableCell>
                  <AppointmentInfo>
                    <AppointmentDate>
                      <FiCalendar size={12} />
                      {formatDate(service.appointmentDate)}
                    </AppointmentDate>
                    <AppointmentTime>
                      {new Date(service.appointmentDate).toLocaleTimeString(
                        "en-IN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </AppointmentTime>
                    {service.completedAt && (
                      <CompletedTime>
                        Completed: {formatDateTime(service.completedAt)}
                      </CompletedTime>
                    )}
                  </AppointmentInfo>
                </TableCell>

                <TableCell>
                  <CostInfo>
                    <TotalCost>{formatCurrency(service.totalCost)}</TotalCost>
                    <PaymentStatus status={service.paymentStatus}>
                      {service.paymentStatus}
                    </PaymentStatus>
                  </CostInfo>
                </TableCell>

                <TableCell>
                  <ServiceStatus status={service.status}>
                    {service.status}
                  </ServiceStatus>
                </TableCell>

                <TableCell>
                  <ActionButtons>
                    <ActionButton
                      variant="view"
                      onClick={() =>
                        handleViewPatientServices(service.patient._id)
                      }
                      title="View patient details"
                    >
                      <FiEye size={16} />
                    </ActionButton>
                    <ActionButton
                      variant="edit"
                      onClick={() => handleEditService(service._id)}
                      title="Edit service assignment"
                    >
                      <FiEdit2 size={16} />
                    </ActionButton>
                    <ActionButton
                      variant="delete"
                      onClick={() =>
                        handleDeleteService(
                          service._id,
                          service.patient.name,
                          service.service.name
                        )
                      }
                      title="Remove service assignment"
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

      {filteredAndSortedServices.length === 0 && (
        <EmptyState>
          <EmptyIcon>🩺</EmptyIcon>
          <EmptyTitle>No service assignments found</EmptyTitle>
          <EmptyMessage>
            {searchTerm || filterStatus !== "all" || filterPayment !== "all"
              ? "No service assignments match your current filters. Try adjusting your search criteria."
              : "No services have been assigned to patients yet. Start by scheduling appointments with services."}
          </EmptyMessage>
          {!searchTerm && filterStatus === "all" && filterPayment === "all" && (
            <ActionButton
              onClick={() => navigate(ROUTES.ADMIN.CREATE_APPOINTMENT)}
            >
              <FiPlus size={16} />
              Assign First Service
            </ActionButton>
          )}
        </EmptyState>
      )}

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

      {isLoading && (
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>Loading patient services...</LoadingText>
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

const BackLink = styled.button`
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 16px;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px 0;
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

const ActionButton = styled.button<{
  variant?: "secondary" | "view" | "edit" | "delete";
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: ${(props) =>
    props.variant === "view" ||
    props.variant === "edit" ||
    props.variant === "delete"
      ? "6px 8px"
      : "10px 16px"};
  border: none;
  border-radius: ${(props) =>
    props.variant === "view" ||
    props.variant === "edit" ||
    props.variant === "delete"
      ? "4px"
      : "6px"};
  font-size: ${(props) =>
    props.variant === "view" ||
    props.variant === "edit" ||
    props.variant === "delete"
      ? "12px"
      : "14px"};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) => {
    if (props.variant === "secondary") {
      return `
        background: rgba(255, 255, 255, 0.15);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.25);
        }
      `;
    } else if (props.variant === "view") {
      return `
        background: #e0f2fe;
        color: #0369a1;
        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `;
    } else if (props.variant === "edit") {
      return `
        background: #f0f9ff;
        color: #0284c7;
        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `;
    } else if (props.variant === "delete") {
      return `
        background: #fee2e2;
        color: #dc2626;
        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `;
    } else {
      return `
        background: white;
        color: ${theme.colors.primary};
        &:hover:not(:disabled) {
          background: #f9fafb;
          transform: translateY(-1px);
        }
      `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  padding: 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const SummaryCard = styled.div`
  display: flex;
  align-items: flex-start;
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

const SummaryIcon = styled.div`
  padding: 8px;
  border-radius: 8px;
  background: ${theme.colors.primary}15;
  color: ${theme.colors.primary};
  flex-shrink: 0;
`;

const SummaryContent = styled.div`
  flex: 1;
`;

const SummaryValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
`;

const SummarySubtext = styled.div`
  font-size: 11px;
  color: #9ca3af;
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
  min-width: 400px;

  @media (max-width: 768px) {
    flex-direction: column;
    min-width: auto;
  }
`;

const SearchInputContainer = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;

  svg {
    position: absolute;
    left: 12px;
    color: #6b7280;
    z-index: 1;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 40px;
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

const BulkActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BulkActionButton = styled.button<{ variant?: "danger" }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid
    ${(props) => (props.variant === "danger" ? "#ef4444" : "#d1d5db")};
  background: ${(props) => (props.variant === "danger" ? "#fee2e2" : "white")};
  color: ${(props) => (props.variant === "danger" ? "#dc2626" : "#374151")};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) =>
      props.variant === "danger" ? "#fecaca" : "#f9fafb"};
    transform: translateY(-1px);
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

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
`;

const PatientAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
`;

const PatientDetails = styled.div``;

const PatientName = styled.div`
  font-weight: 500;
  color: #111827;
  margin-bottom: 2px;
  font-size: 14px;
`;

const PatientId = styled.div`
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 2px;
`;

const PatientContact = styled.div`
  font-size: 10px;
  color: #9ca3af;
`;

const ServiceInfo = styled.div`
  min-width: 160px;
`;

const ServiceName = styled.div`
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
  font-size: 14px;
`;

const ServiceCategory = styled.div`
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const ServiceDuration = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #9ca3af;
`;

const DoctorInfo = styled.div`
  min-width: 140px;
`;

const DoctorName = styled.div`
  font-weight: 500;
  color: #111827;
  margin-bottom: 2px;
  font-size: 13px;
`;

const DoctorSpecialization = styled.div`
  font-size: 11px;
  color: #6b7280;
`;

const AppointmentInfo = styled.div`
  min-width: 120px;
`;

const AppointmentDate = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #111827;
  font-weight: 500;
  margin-bottom: 2px;
`;

const AppointmentTime = styled.div`
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 2px;
`;

const CompletedTime = styled.div`
  font-size: 10px;
  color: #059669;
`;

const CostInfo = styled.div`
  min-width: 100px;
`;

const TotalCost = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #059669;
  margin-bottom: 4px;
`;

const PaymentStatus = styled.div<{ status: string }>`
  font-size: 10px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 12px;
  text-transform: uppercase;
  background: ${(props) => {
    switch (props.status) {
      case "paid":
        return "#d1fae5";
      case "pending":
        return "#fef3c7";
      case "partial":
        return "#dbeafe";
      case "refunded":
        return "#fee2e2";
      default:
        return "#f3f4f6";
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case "paid":
        return "#065f46";
      case "pending":
        return "#92400e";
      case "partial":
        return "#1e40af";
      case "refunded":
        return "#991b1b";
      default:
        return "#374151";
    }
  }};
`;

const ServiceStatus = styled.div<{ status: string }>`
  font-size: 11px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 12px;
  text-transform: capitalize;
  background: ${(props) => {
    switch (props.status) {
      case "completed":
        return "#d1fae5";
      case "scheduled":
        return "#dbeafe";
      case "cancelled":
        return "#fee2e2";
      default:
        return "#f3f4f6";
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case "completed":
        return "#065f46";
      case "scheduled":
        return "#1e40af";
      case "cancelled":
        return "#991b1b";
      default:
        return "#374151";
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  min-width: 120px;
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

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-radius: 50%;
  border-top: 3px solid ${theme.colors.primary};
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

export default AdminPatientServices;
