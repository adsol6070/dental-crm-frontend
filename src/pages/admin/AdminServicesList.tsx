import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  FiEye,
  FiEdit2,
  FiTrash,
  FiPlus,
  FiSearch,
  FiDollarSign,
  FiClock,
  FiUsers,
  FiTag,
} from "react-icons/fi";
import { MdMedicalServices } from "react-icons/md";
import { ROUTES } from "@/config/route-paths.config";
import { theme } from "@/config/theme.config";
import Swal from "sweetalert2";

// Mock data - replace with actual API hooks
const mockServices = [
  {
    _id: "1",
    serviceId: "SRV-001",
    name: "General Consultation",
    description: "Comprehensive medical examination and consultation",
    category: "General Dentistry",
    price: 150,
    duration: 30,
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-02-01T14:30:00Z",
    totalPatients: 245,
    statistics: {
      totalBookings: 456,
      completedBookings: 423,
      averageRating: 4.8,
    },
  },
  {
    _id: "2",
    serviceId: "SRV-002",
    name: "Teeth Cleaning",
    description: "Professional dental cleaning and polishing service",
    category: "General Dentistry",
    price: 80,
    duration: 45,
    isActive: true,
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-25T11:20:00Z",
    totalPatients: 189,
    statistics: {
      totalBookings: 312,
      completedBookings: 298,
      averageRating: 4.9,
    },
  },
  {
    _id: "3",
    serviceId: "SRV-003",
    name: "Root Canal Treatment",
    description: "Advanced endodontic treatment for infected or damaged teeth",
    category: "Specialized Dental Services",
    price: 500,
    duration: 90,
    isActive: true,
    createdAt: "2024-01-05T13:45:00Z",
    updatedAt: "2024-01-30T16:10:00Z",
    totalPatients: 67,
    statistics: {
      totalBookings: 89,
      completedBookings: 82,
      averageRating: 4.7,
    },
  },
  {
    _id: "4",
    serviceId: "SRV-004",
    name: "Teeth Whitening",
    description: "Professional cosmetic teeth whitening treatment",
    category: "Cosmetic Dentistry",
    price: 200,
    duration: 60,
    isActive: false,
    createdAt: "2023-12-20T11:30:00Z",
    updatedAt: "2024-01-20T09:45:00Z",
    totalPatients: 34,
    statistics: {
      totalBookings: 45,
      completedBookings: 41,
      averageRating: 4.6,
    },
  },
  {
    _id: "5",
    serviceId: "SRV-005",
    name: "Dental Implant",
    description: "Complete dental implant procedure with crown placement",
    category: "Oral Surgery",
    price: 1200,
    duration: 120,
    isActive: true,
    createdAt: "2023-11-15T14:20:00Z",
    updatedAt: "2024-01-28T12:30:00Z",
    totalPatients: 23,
    statistics: {
      totalBookings: 28,
      completedBookings: 25,
      averageRating: 4.9,
    },
  },
];

const mockCategories = [
  "General Dentistry",
  "Specialized Dental Services",
  "Cosmetic Dentistry",
  "Oral Surgery",
  "Emergency Services",
  "Orthodontics",
  "Periodontics",
];

const AdminServicesList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "price" | "date" | "bookings">(
    "name"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock loading states
  const [isLoading] = useState(false);
  const [isDeletingService] = useState(false);
  const [isUpdatingServiceStatus] = useState(false);

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

  const handleDeleteService = async (id: string, serviceName: string) => {
    const result = await Swal.fire({
      title: `Delete "${serviceName}"?`,
      text: "This action cannot be undone. All related data will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      // TODO: Implement delete service API call
      console.log("Deleting service:", id);
      Swal.fire({
        title: "Success!",
        text: "Service has been deleted successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: boolean,
    serviceName: string
  ) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: `${newStatus ? "Activate" : "Deactivate"} Service`,
      text: `Are you sure you want to ${
        newStatus ? "activate" : "deactivate"
      } "${serviceName}"?`,
      input: "textarea",
      inputLabel: "Reason (optional)",
      inputPlaceholder: `Enter reason for ${
        newStatus ? "activating" : "deactivating"
      } this service...`,
      showCancelButton: true,
      confirmButtonText: `Yes, ${newStatus ? "activate" : "deactivate"}!`,
      //   confirmButtonColor: newStatus ? theme.colors.success : theme.colors.warning,
      cancelButtonColor: "#6b7280",
    });

    if (isConfirmed) {
      // TODO: Implement update service status API call
      console.log("Updating service status:", id, newStatus, reason);
      Swal.fire({
        title: "Success!",
        text: `Service has been ${
          newStatus ? "activated" : "deactivated"
        } successfully.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleViewService = (serviceId: string) => {
    // Navigate to service details page
    navigate(`/admin/services/details/${serviceId}`);
  };

  const handleEditService = (serviceId: string) => {
    const route = ROUTES.ADMIN.EDIT_SERVICE.replace(":serviceId", serviceId);
    navigate(route);
  };

  const handleNewService = () => {
    navigate(ROUTES.ADMIN.CREATE_SERVICE);
  };

  const handleManageCategories = () => {
    navigate(ROUTES.ADMIN.SERVICE_CATEGORIES);
  };

  // Client-side filtering and sorting
  const filteredAndSortedServices = mockServices
    .filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.serviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        filterCategory === "all" || service.category === filterCategory;

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && service.isActive) ||
        (filterStatus === "inactive" && !service.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return b.price - a.price;
        case "date":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "bookings":
          return b.statistics.totalBookings - a.statistics.totalBookings;
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
    total: mockServices.length,
    active: mockServices.filter((s) => s.isActive).length,
    inactive: mockServices.filter((s) => !s.isActive).length,
    totalRevenue: mockServices.reduce(
      (sum, service) => sum + service.statistics.totalBookings * service.price,
      0
    ),
    totalBookings: mockServices.reduce(
      (sum, service) => sum + service.statistics.totalBookings,
      0
    ),
    averagePrice:
      mockServices.reduce((sum, service) => sum + service.price, 0) /
      mockServices.length,
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading services...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>
            <MdMedicalServices size={28} />
            Services Management
            <TotalCount>({summaryStats.total} services)</TotalCount>
          </Title>
          <Subtitle>Manage dental services, pricing, and availability</Subtitle>
        </HeaderContent>
        <HeaderActions>
          <ActionButton variant="secondary" onClick={handleManageCategories}>
            <FiTag size={16} />
            Manage Categories
          </ActionButton>
          <ActionButton onClick={handleNewService}>
            <FiPlus size={16} />
            Add New Service
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
            <SummaryLabel>Total Services</SummaryLabel>
            <SummarySubtext>
              {summaryStats.active} active, {summaryStats.inactive} inactive
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
            <SummaryLabel>Total Revenue</SummaryLabel>
            <SummarySubtext>
              From {summaryStats.totalBookings} bookings
            </SummarySubtext>
          </SummaryContent>
        </SummaryCard>

        <SummaryCard>
          <SummaryIcon>
            <FiUsers size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>{summaryStats.totalBookings}</SummaryValue>
            <SummaryLabel>Total Bookings</SummaryLabel>
            <SummarySubtext>Across all services</SummarySubtext>
          </SummaryContent>
        </SummaryCard>

        <SummaryCard>
          <SummaryIcon>
            <FiDollarSign size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>
              {formatCurrency(summaryStats.averagePrice)}
            </SummaryValue>
            <SummaryLabel>Average Price</SummaryLabel>
            <SummarySubtext>Per service</SummarySubtext>
          </SummaryContent>
        </SummaryCard>
      </SummaryCards>

      <Controls>
        <SearchAndFilter>
          <SearchInputContainer>
            <FiSearch size={16} />
            <SearchInput
              type="text"
              placeholder="Search services by name, ID, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInputContainer>

          <FilterSelect
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {mockCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as "all" | "active" | "inactive")
            }
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </FilterSelect>

          <SortSelect
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as "name" | "price" | "date" | "bookings"
              )
            }
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="date">Sort by Date Created</option>
            <option value="bookings">Sort by Bookings</option>
          </SortSelect>
        </SearchAndFilter>

        <ResultsInfo>
          Showing {paginatedServices.length} of{" "}
          {filteredAndSortedServices.length} services
          {filteredAndSortedServices.length !== summaryStats.total && (
            <span> (filtered from {summaryStats.total} total)</span>
          )}
        </ResultsInfo>
      </Controls>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Service</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Pricing & Duration</TableHeaderCell>
              <TableHeaderCell>Statistics</TableHeaderCell>
              <TableHeaderCell>Performance</TableHeaderCell>
              <TableHeaderCell>Last Updated</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedServices.map((service) => (
              <TableRow key={service._id}>
                <TableCell>
                  <ServiceInfo>
                    <ServiceIcon>
                      <MdMedicalServices size={20} />
                    </ServiceIcon>
                    <ServiceDetails>
                      <ServiceName>{service.name}</ServiceName>
                      <ServiceId>{service.serviceId}</ServiceId>
                      <ServiceDescription>
                        {service.description}
                      </ServiceDescription>
                    </ServiceDetails>
                  </ServiceInfo>
                </TableCell>

                <TableCell>
                  <CategoryBadge category={service.category}>
                    {service.category}
                  </CategoryBadge>
                </TableCell>

                <TableCell>
                  <PricingInfo>
                    <PriceTag>{formatCurrency(service.price)}</PriceTag>
                    <DurationInfo>
                      <FiClock size={12} />
                      {service.duration} mins
                    </DurationInfo>
                  </PricingInfo>
                </TableCell>

                <TableCell>
                  <StatisticsInfo>
                    <StatItem>
                      <StatLabel>Bookings:</StatLabel>
                      <StatValue>{service.statistics.totalBookings}</StatValue>
                    </StatItem>
                    <StatItem>
                      <StatLabel>Completed:</StatLabel>
                      <StatValue>
                        {service.statistics.completedBookings}
                      </StatValue>
                    </StatItem>
                    <StatItem>
                      <StatLabel>Patients:</StatLabel>
                      <StatValue>{service.totalPatients}</StatValue>
                    </StatItem>
                  </StatisticsInfo>
                </TableCell>

                <TableCell>
                  <PerformanceInfo>
                    <RatingInfo>
                      <RatingStars>
                        {"★".repeat(
                          Math.floor(service.statistics.averageRating)
                        )}
                        {"☆".repeat(
                          5 - Math.floor(service.statistics.averageRating)
                        )}
                      </RatingStars>
                      <RatingValue>
                        {service.statistics.averageRating.toFixed(1)}
                      </RatingValue>
                    </RatingInfo>
                    <CompletionRate>
                      {(
                        (service.statistics.completedBookings /
                          service.statistics.totalBookings) *
                        100
                      ).toFixed(1)}
                      % completion
                    </CompletionRate>
                  </PerformanceInfo>
                </TableCell>

                <TableCell>
                  <UpdateInfo>
                    <UpdateDate>{formatDate(service.updatedAt)}</UpdateDate>
                    <UpdateTime>{formatDateTime(service.updatedAt)}</UpdateTime>
                  </UpdateInfo>
                </TableCell>

                <TableCell>
                  <StatusSelect
                    value={service.isActive ? "active" : "inactive"}
                    onChange={(e) =>
                      handleStatusChange(
                        service._id,
                        e.target.value === "active",
                        service.name
                      )
                    }
                    disabled={isUpdatingServiceStatus}
                    active={service.isActive}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </StatusSelect>
                </TableCell>

                <TableCell>
                  <ActionButtons>
                    <ActionButton
                      variant="view"
                      onClick={() => handleViewService(service._id)}
                      title="View service details"
                    >
                      <FiEye size={16} />
                    </ActionButton>
                    <ActionButton
                      variant="edit"
                      onClick={() => handleEditService(service._id)}
                      title="Edit service"
                    >
                      <FiEdit2 size={16} />
                    </ActionButton>
                    <ActionButton
                      variant="delete"
                      onClick={() =>
                        handleDeleteService(service._id, service.name)
                      }
                      disabled={isDeletingService}
                      title="Delete service"
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

      {(isDeletingService || isUpdatingServiceStatus) && (
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>
            {isDeletingService
              ? "Deleting service..."
              : "Updating service status..."}
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
  min-width: 140px;
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
  min-width: 160px;
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

const ServiceInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 280px;
`;

const ServiceIcon = styled.div`
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

const ServiceDetails = styled.div`
  flex: 1;
`;

const ServiceName = styled.div`
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
  font-size: 15px;
`;

const ServiceId = styled.div`
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 4px;
  font-family: monospace;
`;

const ServiceDescription = styled.div`
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
  max-width: 240px;
`;

const CategoryBadge = styled.span<{ category: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${(props) => {
    switch (props.category) {
      case "General Dentistry":
        return "#dbeafe";
      case "Specialized Dental Services":
        return "#fef3c7";
      case "Cosmetic Dentistry":
        return "#f3e8ff";
      case "Oral Surgery":
        return "#fee2e2";
      case "Emergency Services":
        return "#ffedd5";
      case "Orthodontics":
        return "#d1fae5";
      case "Periodontics":
        return "#fce7f3";
      default:
        return "#f3f4f6";
    }
  }};
  color: ${(props) => {
    switch (props.category) {
      case "General Dentistry":
        return "#1e40af";
      case "Specialized Dental Services":
        return "#92400e";
      case "Cosmetic Dentistry":
        return "#7c3aed";
      case "Oral Surgery":
        return "#dc2626";
      case "Emergency Services":
        return "#ea580c";
      case "Orthodontics":
        return "#059669";
      case "Periodontics":
        return "#be185d";
      default:
        return "#374151";
    }
  }};
`;

const PricingInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 100px;
`;

const PriceTag = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #059669;
`;

const DurationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
`;

const StatisticsInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 120px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
`;

const StatLabel = styled.span`
  color: #6b7280;
`;

const StatValue = styled.span`
  color: #111827;
  font-weight: 500;
`;

const PerformanceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 100px;
`;

const RatingInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RatingStars = styled.span`
  color: #fbbf24;
  font-size: 12px;
`;

const RatingValue = styled.span`
  font-size: 12px;
  color: #111827;
  font-weight: 500;
`;

const CompletionRate = styled.div`
  font-size: 11px;
  color: #059669;
  background: #d1fae5;
  padding: 2px 4px;
  border-radius: 3px;
  width: fit-content;
`;

const UpdateInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 100px;
`;

const UpdateDate = styled.div`
  font-size: 12px;
  color: #111827;
  font-weight: 500;
`;

const UpdateTime = styled.div`
  font-size: 10px;
  color: #6b7280;
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

export default AdminServicesList;
